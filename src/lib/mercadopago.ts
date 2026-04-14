import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

function getClient(): MercadoPagoConfig {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
    if (!accessToken) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN is not set or empty')
    }
    return new MercadoPagoConfig({
        accessToken,
    })
}

export const PLAN_CONFIG: Record<string, { label: string; amount: number }> = {
    basico: { label: 'Plan Básico Talisto', amount: 35000 },
    pro:    { label: 'Plan Pro Talisto',    amount: 75000 },
}

export async function createPreference(params: {
    plan: string
    companyId?: string // Opcional para flujo de invitados (pricing)
    userEmail?: string
    appUrl?: string
}) {
    const { plan, companyId, userEmail, appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000' } = params
    const planConfig = PLAN_CONFIG[plan.toLowerCase()]
    if (!planConfig) throw new Error(`Plan inválido: ${plan}`)

    const client = getClient()
    const preference = new Preference(client)

    // Mercado Pago solo permite auto_return si las URLs son HTTPS
    const isProduction = appUrl.startsWith('https')

        const result = await preference.create({
            body: {
                items: [{
                    id: plan,
                    title: planConfig.label,
                    quantity: 1,
                    unit_price: planConfig.amount,
                    currency_id: 'CLP',
                }],
                payer: userEmail ? { email: userEmail } : undefined,
                back_urls: {
                    success: `${appUrl}/billing/success`,
                    failure: `${appUrl}/billing/cancel`,
                    pending: `${appUrl}/billing/cancel`,
                },
                // Solo configuramos redirecciones automáticas si estamos en un entorno HTTPS (Producción/Vercel)
                ...(isProduction ? {
                    auto_return: 'approved' as const,
                } : {}),
                notification_url: `${appUrl}/api/webhooks/mercadopago`,
                external_reference: companyId || 'guest-checkout',
                metadata: { 
                    company_id: companyId || null, 
                    plan: plan.toLowerCase(),
                    is_guest: !companyId
                },
            },
        })

    return result
}

export async function getPayment(paymentId: string) {
    const client = getClient()
    const payment = new Payment(client)
    return payment.get({ id: paymentId })
}
