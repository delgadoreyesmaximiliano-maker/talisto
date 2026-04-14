import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createPreference } from '@/lib/mercadopago';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { plan, title, unit_price } = body;

        // Si se pasa 'plan', lo usamos. Si no, inferimos por el título (para compatibilidad)
        const planKey = plan || (title?.includes('Pro') ? 'pro' : 'basico');

        const result = await createPreference({
            plan: planKey,
            appUrl: process.env.NEXT_PUBLIC_URL || 'https://talisto.vercel.app'
        });

        // Devolvemos el ID y el enlace (init_point) al Frontend
        return NextResponse.json({
            id: result.id,
            init_point: result.init_point
        });

    } catch (error) {
        console.error('Error creando la preferencia en MercadoPago:', error);
        const errorMessage = error instanceof Error ? error.message : 
                           (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return NextResponse.json({ 
            error: errorMessage || 'Ocurrió un error al crear la preferencia' 
        }, { status: 500 });
    }
}
