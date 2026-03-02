import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const TEST_LIMIT = 5 // 5 req/min

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
        if (record.count > TEST_LIMIT) {
            return NextResponse.json({ error: 'Límite de pruebas alcanzado. Intenta en 1 minuto.' }, { status: 429 })
        }

        const body = await request.json()
        const { phone } = body

        if (!phone) {
            return NextResponse.json({ error: 'Número de teléfono es requerido' }, { status: 400 })
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
            return NextResponse.json({ error: 'Credenciales de Green API no configuradas en la empresa' }, { status: 400 })
        }

        // Clean phone number (remove +, spaces, non digits)
        const cleanPhone = phone.replace(/\D/g, '')
        // Ensure it ends with @c.us for WhatsApp API format
        const chatId = `${cleanPhone}@c.us`

        const url = `https://api.green-api.com/waInstance${cData.green_api_instance_id}/sendMessage/${cData.green_api_token}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId,
                message: "🤖 *¡Hola desde Talisto!*\n\nTu conexión con Green-API ha sido configurada exitosamente. A partir de ahora, podré enviarte reportes y automatizar tus pedidos a proveedores.\n\n✨ _Este es un mensaje automático de prueba._"
            })
        })

        const result = await response.json()

        if (!response.ok) {
            console.error('Green API Error:', result)
            return NextResponse.json({ error: 'Error al enviar mensaje de prueba vía WhatsApp' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: unknown) {
        console.error('Test API Error:', error instanceof Error ? error.message : 'Unknown')
        return NextResponse.json({ error: 'Error de servidor al enviar prueba' }, { status: 500 })
    }
}
