import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export interface FinancialData {
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    revenueChange?: number;
    expensesChange?: number;
    profitChange?: number;
    marginChange?: number;
    growthRate?: number;
    avg3months?: number;
}

export async function generateCFOAnalysis(
    data: FinancialData,
    monthOffset: number,
    companyName: string,
    industry: string
): Promise<string> {
    const isPast = monthOffset < 0;
    const isFuture = monthOffset > 0;

    const systemPrompt = `Eres un CFO experto para PYMEs chilenas en la industria de ${industry}.
Analiza datos financieros y proporciona insights accionables en español chileno.
Usa formato de moneda chileno (puntos para miles: $4.250.000).
Sé conciso pero preciso. Máximo 200 palabras.
Tono: profesional pero cercano, tutea al usuario (usa "tú", "tu negocio").
NO uses bullets ni viñetas, escribe en párrafos naturales conversacionales.
Cada párrafo debe ser de 2-3 oraciones máximo.`;

    let userPrompt = '';

    if (isPast) {
        // Historical analysis
        userPrompt = `Analiza estos datos HISTÓRICOS de ${data.period} para ${companyName}:

Ingresos: ${formatCLP(data.revenue)}
Gastos: ${formatCLP(data.expenses)}
Utilidad: ${formatCLP(data.profit)}
Margen: ${data.margin.toFixed(1)}%
${data.revenueChange ? `Cambio vs mes anterior: ${data.revenueChange > 0 ? '+' : ''}${data.revenueChange.toFixed(1)}%` : ''}

Proporciona en este orden:
1. Resumen ejecutivo: ¿Qué pasó ese mes? (2-3 oraciones)
2. Factores clave: ¿Por qué ocurrió? (menciona 2-3 factores concretos)
3. Aprendizaje: Una lección accionable para el futuro (1 oración)

Formato: Párrafos naturales, conversacional. Dirígete al usuario como "tú".
Ejemplo de tono: "En marzo tuviste un mes sólido. Tu margen mejoró porque..."`;

    } else if (isFuture) {
        // Future projection
        userPrompt = `Proyecta datos para ${data.period} basándote en tendencias actuales:

Tendencia de crecimiento: ${data.growthRate ? `${data.growthRate > 0 ? '+' : ''}${(data.growthRate * 100).toFixed(1)}%/mes` : 'estable'}
Promedio últimos 3 meses: ${data.avg3months ? formatCLP(data.avg3months) : 'N/A'}

Proyección estimada:
Ingresos esperados: ${formatCLP(data.revenue)}
Gastos proyectados: ${formatCLP(data.expenses)}
Utilidad proyectada: ${formatCLP(data.profit)}

Proporciona:
1. Proyección: ¿Qué esperar? (nivel de confianza: alto/medio/bajo)
2. Riesgos: ¿Qué podría salir mal? (menciona 2 riesgos principales)
3. Oportunidad: ¿Cómo maximizar el resultado? (1 recomendación concreta)

Usa lenguaje de proyección: "es probable que", "si continúa la tendencia", "se espera".
Formato: Párrafos naturales, NO bullets.`;

    } else if (data.period === 'simulación estratégica') {
        const decision = (data as any).decision || '';
        userPrompt = `El usuario de ${companyName || 'este negocio'} está evaluando una decisión estratégica y necesita tu análisis financiero.
        
Decisión propuesta: "${decision}"

Tu misión es evaluar la viabilidad de esta idea. Proporciona en este orden:
1. Impacto Financiero Esperado: ¿Cómo afectará esto al flujo de caja y rentabilidad? (1-2 oraciones)
2. Retorno de Inversión (ROI): ¿Es una inversión que se pagará sola rápido o lento? (1 oración)
3. Riesgos Principales: Identifica silenciosamente los peros y menciónalos como advertencias (1-2 oraciones)
4. Veredicto Final: "Mi recomendación como tu CFO es..." (Aprobar, rechazar o sugerir ajustes).

Formato: Párrafos naturales, conversacionales y directos. Sé duro si la idea es mala, alentador si es buena.`;

    } else {
        // Present analysis
        userPrompt = `Analiza el estado ACTUAL de ${companyName} (${data.period}):

Ingresos este mes (hasta ahora): ${formatCLP(data.revenue)}
Gastos: ${formatCLP(data.expenses)}
Utilidad: ${formatCLP(data.profit)}
Margen: ${data.margin.toFixed(1)}%

Proporciona:
1. Estado actual: ¿Cómo está el negocio HOY? (da una valoración: excelente/bueno/regular/crítico)
2. Prioridades inmediatas: ¿En qué enfocarse ESTA SEMANA? (menciona 2 prioridades)
3. Acción del día: Una tarea CONCRETA y accionable para HOY mismo

Formato: Directo, accionable, urgente. Usa presente e imperativos.
Ejemplo: "Hoy tu negocio está sólido. Esta semana enfócate en..."`;
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 600,
        });

        return completion.choices[0]?.message?.content || "No se pudo generar análisis en este momento. Por favor intenta de nuevo.";

    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error("Error al conectar con el asistente de IA. Por favor verifica tu conexión.");
    }
}

function formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
