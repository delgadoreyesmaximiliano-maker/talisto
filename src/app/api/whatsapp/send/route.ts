import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const SEND_LIMIT = 10 // 10 req/min

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Rate limiting
        const now = Date.now()
        const record = rateLimitMap.get(user.id) || { count: 0, resetAt: now + 60000 }
        if (now > record.resetAt) { record.count = 1; record.resetAt = now + 60000 }
        else { record.count++ }
        rateLimitMap.set(user.id, record)
        if (record.count > SEND_LIMIT) {
            return NextResponse.json({ error: 'Límite de envíos alcanzado. Intenta en 1 minuto.' }, { status: 429 })
        }

        const body = await request.json()
        const { phone, message } = body

        if (!phone || !message) {
            return NextResponse.json({ error: 'Número de teléfono y mensaje son requeridos' }, { status: 400 })
        }

        const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '')
        if (!/^\+?\d{8,15}$/.test(cleanedPhone)) {
            return NextResponse.json({ error: 'Formato de teléfono inválido. Usa formato internacional (ej: +56912345678)' }, { status: 400 })
        }

        // Get user company credentials
        const { data: profile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const pData = profile as any
        if (!pData?.company_id) {
            return NextResponse.json({ error: 'Usuario sin empresa' }, { status: 400 })
        }

        const { data: company } = await supabase
            .from('companies')
            .select('green_api_instance_id, green_api_token')
            .eq('id', pData.company_id)
            .single()

        const cData = company as any

        if (!cData?.green_api_instance_id || !cData?.green_api_token) {
            return NextResponse.json({ error: 'Debes configurar tus credenciales de WhatsApp en la Configuración' }, { status: 400 })
        }

        // Clean phone number (remove +, spaces, non digits)
        const cleanPhone = phone.replace(/\D/g, '')
        const chatId = `${cleanPhone}@c.us`

        const url = `https://api.green-api.com/waInstance${cData.green_api_instance_id}/sendMessage/${cData.green_api_token}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId,
                message: message
            })
        })

        const result = await response.json()

        if (!response.ok) {
            console.error('Green API Error:', result)
            return NextResponse.json({ error: 'Error al enviar mensaje vía WhatsApp' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: unknown) {
        console.error('Send API Error:', error instanceof Error ? error.message : 'Unknown')
        return NextResponse.json({ error: 'Error de servidor al enviar mensaje' }, { status: 500 })
    }
}
