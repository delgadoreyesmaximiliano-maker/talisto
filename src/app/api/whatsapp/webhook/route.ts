import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseServiceKey) {
    console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY is not set. Webhook will not work.')
}
const supabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || ''
const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '56'

export async function POST(request: Request) {
    try {
        // Verify webhook secret if configured
        if (WEBHOOK_SECRET) {
            const url = new URL(request.url)
            const token = url.searchParams.get('token')
            if (token !== WEBHOOK_SECRET) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
        }

        const body = await request.json()

        if (body.typeWebhook === 'incomingMessageReceived') {
            const messageData = body.messageData
            if (messageData && messageData.typeMessage === 'textMessage') {
                const text = messageData.textMessageData.textMessage.toLowerCase().trim()
                const senderId = body.senderData.sender.replace('@c.us', '')

                if (text === 'si' || text === 'sí' || text === 'ok' || text === 'dale') {
                    const idInstance = body.instanceData?.idInstance
                    if (!idInstance) {
                        return NextResponse.json({ status: 'No instance id' }, { status: 200 })
                    }

                    const { data: company } = await supabase
                        .from('companies')
                        .select('id, name, green_api_instance_id, green_api_token')
                        .eq('green_api_instance_id', idInstance)
                        .single()

                    if (!company) {
                        return NextResponse.json({ status: 'Invalid instance' }, { status: 200 })
                    }

                    const { data: allProducts, error: prodError } = await supabase
                        .from('products')
                        .select('id, name, stock_current, stock_minimum, supplier')
                        .eq('company_id', company.id)

                    if (prodError) {
                        console.error('Webhook: Error fetching products')
                        return NextResponse.json({ status: 'DB error' }, { status: 200 })
                    }

                    const criticalProducts = (allProducts || []).filter(
                        (p: { stock_current: number; stock_minimum: number }) => p.stock_current <= p.stock_minimum
                    )

                    if (criticalProducts.length === 0) {
                        await sendWhatsAppMessage(company.green_api_instance_id, company.green_api_token, senderId, "🤖 Hola! Revisé el inventario pero actualmente no tienes productos en stock crítico. No se generaron pedidos.")
                        return NextResponse.json({ status: 'No critical stock' }, { status: 200 })
                    }

                    let resumen = `🤖 *Reporte de Stock Crítico - ${company.name}*\n\n`
                    resumen += `Se encontraron *${criticalProducts.length}* producto(s) con stock bajo:\n\n`

                    criticalProducts.forEach((p: { name: string; stock_current: number; stock_minimum: number; supplier?: string | null }) => {
                        const deficit = (p.stock_minimum || 0) - (p.stock_current || 0)
                        resumen += `📦 *${p.name}*\n`
                        resumen += `   Actual: ${p.stock_current} | Mínimo: ${p.stock_minimum}\n`
                        resumen += `   Faltan: ${deficit} unidades\n`
                        if (p.supplier) {
                            resumen += `   Proveedor: ${p.supplier}\n`
                        }
                        resumen += `\n`
                    })

                    resumen += `_Responde con el nombre del proveedor para que gestione el pedido automáticamente._`

                    await sendWhatsAppMessage(company.green_api_instance_id, company.green_api_token, senderId, resumen)
                }
            }
        }

        return NextResponse.json({ status: 'Webhook payload processed' }, { status: 200 })
    } catch (error: unknown) {
        console.error('Webhook Error:', error instanceof Error ? error.message : 'Unknown error')
        return NextResponse.json({ error: 'Webhook payload error' }, { status: 200 })
    }
}

async function sendWhatsAppMessage(instanceId: string, apiToken: string, phoneNumber: string, message: string) {
    if (!instanceId || !apiToken) return false

    let cleanPhone = phoneNumber.replace(/\D/g, '')
    // Add country code if phone looks like a local number (e.g. 9 digits starting with 9)
    if (cleanPhone.length <= 10 && cleanPhone.startsWith('9')) {
        cleanPhone = `${DEFAULT_COUNTRY_CODE}${cleanPhone}`
    }

    const apiUrl = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: `${cleanPhone}@c.us`,
                message: message
            })
        })
        const data = await response.json()
        return !!data.idMessage
    } catch {
        console.error('Error sending WhatsApp message')
        return false
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Webhook endpoint activo' })
}
