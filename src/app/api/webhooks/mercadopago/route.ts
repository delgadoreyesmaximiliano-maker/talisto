import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function verifyMercadoPagoSignature(
    xSignature: string,
    notificationId: string,
    requestId: string,
    ts: string,
    secret: string
): boolean {
    // xSignature format: ts=TIMESTAMP,v1=HASH
    const manifest = `id:${notificationId};request-id:${requestId};ts:${ts}`
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
    const parts = xSignature.split(',')
    const v1Part = parts.find(p => p.startsWith('v1='))
    if (!v1Part) return false
    const received = v1Part.slice(3)
    if (received.length !== expected.length) return false
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const rawBody = await req.text();
        const body = (() => { try { return JSON.parse(rawBody) } catch { return {} } })();
        
        const dataId = url.searchParams.get('data.id') || body?.data?.id;
        const type = url.searchParams.get('type') || body?.type;

        const mpSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
        const xSignature = req.headers.get('x-signature') ?? ''
        const requestId = req.headers.get('x-request-id') ?? ''
        if (mpSecret) {
            const tsPart = xSignature.split(',').find(p => p.startsWith('ts='))
            const ts = tsPart ? tsPart.slice(3) : ''
            const notificationId = String(dataId ?? '')
            const valid = verifyMercadoPagoSignature(xSignature, notificationId, requestId, ts, mpSecret)
            if (!valid) {
                console.error('[MP webhook] Invalid signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        } else {
            console.warn('[MP webhook] MERCADOPAGO_WEBHOOK_SECRET not set — skipping signature verification')
        }

        if (type === 'payment' && dataId) {
            const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: dataId });

            if (paymentInfo.status === 'approved') {
                const companyId = paymentInfo.external_reference;
                const plan = paymentInfo.metadata?.plan || 'basic'; // Default a basic si no viene
                
                console.log(`✅ [WEBHOOK] Pago Aprobado. ID: ${paymentInfo.id}, Empresa: ${companyId}, Plan: ${plan}`);

                if (companyId && companyId !== 'guest-checkout') {
                    const supabase = createAdminClient();
                    
                    const dbPlan = (plan === 'basico' ? 'basic' : plan) as any;

                    const { error } = await (supabase
                        .from('companies') as any)
                        .update({ 
                            plan: dbPlan,
                            plan_status: 'active',
                            subscription_started_at: new Date().toISOString(),
                            last_payment_date: new Date().toISOString()
                        })
                        .eq('id', companyId);

                    if (error) {
                        console.error('❌ [WEBHOOK] Error actualizando plan en DB:', error);
                        throw error;
                    }
                    console.log(`🚀 [WEBHOOK] Empresa ${companyId} actualizada con éxito al plan ${dbPlan}`);
                }
            } else {
                console.log(`ℹ️ [WEBHOOK] Notificación recibida: ${type} - Estado: ${paymentInfo.status}`);
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error procesando notificacion webhook:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
