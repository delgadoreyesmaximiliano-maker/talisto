import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPayment } from '@/lib/mercadopago'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyMercadoPagoSignature(
    rawBody: string,
    signatureHeader: string,
    notificationId: string,
    requestId: string,
    secret: string
): boolean {
    // x-signature format: ts=TIMESTAMP,v1=HASH
    const ts = signatureHeader.match(/ts=([^,]+)/)?.[1] ?? ''
    const v1 = signatureHeader.match(/v1=([^,]+)/)?.[1] ?? ''
    const manifest = `id:${notificationId};request-id:${requestId};ts:${ts}`
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
    if (v1.length !== expected.length) return false
    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.text()
        const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ''
        if (secret) {
            const signatureHeader = request.headers.get('x-signature') ?? ''
            const notificationId = request.headers.get('x-notification-id') ?? ''
            const requestId = request.headers.get('x-request-id') ?? ''
            if (!verifyMercadoPagoSignature(rawBody, signatureHeader, notificationId, requestId, secret)) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        } else {
            console.warn('[MP webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado — verificación omitida')
        }
        const body = JSON.parse(rawBody) as { type?: string; data?: { id?: string }; topic?: string; id?: string }

        // Support both IPN (topic/id) and Webhooks (type/data.id) formats
        const topic = body.type || body.topic
        const paymentId = body.data?.id || body.id

        if (topic !== 'payment' || !paymentId) {
            return NextResponse.json({ received: true })
        }

        const payment = await getPayment(String(paymentId))

        if (payment.status !== 'approved') {
            return NextResponse.json({ received: true })
        }

        const companyId = payment.external_reference
        if (!companyId) {
            console.error('[MP webhook] No external_reference en pago:', paymentId)
            return NextResponse.json({ received: true })
        }

        await supabase
            .from('companies')
            .update({
                plan_status: 'active',
                subscription_started_at: new Date().toISOString(),
                last_payment_date: new Date().toISOString(),
            })
            .eq('id', companyId)

        console.log(`[MP webhook] Plan activado para company ${companyId}`)
        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('[MP webhook] Error:', error)
        return NextResponse.json({ received: true })
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Webhook endpoint activo' })
}
