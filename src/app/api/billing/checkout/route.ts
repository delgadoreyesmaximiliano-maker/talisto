import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPreference } from '@/lib/mercadopago'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { plan } = await request.json() as { plan: string }

        const { data: profile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const companyId = (profile as { company_id: string } | null)?.company_id
        if (!companyId) {
            return NextResponse.json({ error: 'Sin empresa vinculada' }, { status: 400 })
        }

        // Al usar process.env.NEXT_PUBLIC_URL nos aseguramos que las URLs de retorno sean absolutas
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://talisto.vercel.app'

        // Usamos nuestro helper unificado (que ya maneja auto_return y URLs seguras)
        const result = await createPreference({
            plan,
            companyId,
            userEmail: user.email!,
            appUrl: baseUrl
        })

        // El componente UpgradeButton del frontend espera { url: string }
        return NextResponse.json({ url: result.init_point })

    } catch (error) {
        console.error('[Billing checkout]', error);
        const errorMessage = error instanceof Error ? error.message : 
                           (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return NextResponse.json({ 
            error: errorMessage || 'Error al crear sesión de pago' 
        }, { status: 500 })
    }
}
