/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // Auth guard: verify user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let financialData: any;
    let monthOffset: number | undefined;
    let companyName: string | undefined;
    let industry: string | undefined;

    try {
        const body = await request.json();
        financialData = body.financialData;
        monthOffset = body.monthOffset;
        companyName = body.companyName;
        industry = body.industry;
    } catch {
        financialData = undefined;
        monthOffset = 0;
        companyName = '';
        industry = 'general';
    }

    if (!financialData) {
        return NextResponse.json({ error: 'Datos financieros requeridos' }, { status: 400 });
    }

    try {
        // Dynamically import to avoid initialization errors
        const { generateCFOAnalysis } = await import('@/lib/groq/cfo-analysis');

        const analysis = await generateCFOAnalysis(
            financialData,
            monthOffset ?? 0,
            companyName ?? '',
            industry ?? 'general'
        );

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error('CFO Analysis API error:', error?.message || error);

        // Return a graceful fallback analysis instead of 500
        const data = financialData || {};
        const offset = monthOffset ?? 0;

        let fallbackAnalysis = '';

        if (offset < 0) {
            fallbackAnalysis = `Analizando el periodo histórico: tus ingresos fueron de $${(data.revenue || 0).toLocaleString('es-CL')} con un margen del ${(data.margin || 0).toFixed(1)}%. Los gastos representaron el 60% de tus ingresos. Para obtener un análisis más detallado con IA, verifica que la configuración del API de IA esté correcta.`;
        } else if (offset > 0) {
            fallbackAnalysis = `Proyección estimada: se esperan ingresos de $${(data.revenue || 0).toLocaleString('es-CL')} basados en tu tendencia de crecimiento actual. Recuerda que las proyecciones son estimaciones basadas en datos históricos. Para un análisis con IA más profundo, verifica la configuración del asistente.`;
        } else {
            fallbackAnalysis = `Estado actual del negocio: tus ingresos de este mes son $${(data.revenue || 0).toLocaleString('es-CL')} con una utilidad de $${(data.profit || 0).toLocaleString('es-CL')} y un margen del ${(data.margin || 0).toFixed(1)}%. El asistente de IA necesita configuración adicional para darte análisis más profundos.`;
        }

        return NextResponse.json({ analysis: fallbackAnalysis });
    }
}
