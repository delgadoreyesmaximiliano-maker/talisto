import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';

// BUG #2 FIX: Warn at startup if SERVICE_ROLE_KEY is missing.
// To fix: go to Vercel → Settings → Environment Variables and add SUPABASE_SERVICE_ROLE_KEY.
// Without it, the anon key is used and RLS will block inserts for users without an active session.
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
        'WARNING: SUPABASE_SERVICE_ROLE_KEY not set. ' +
        'Falling back to ANON_KEY — RLS may block inserts in ai_recommendations. ' +
        'Fix: Vercel → Settings → Environment Variables → add SUPABASE_SERVICE_ROLE_KEY.'
    );
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId, industry, actividad, tamano_equipo } = body;

        if (!companyId || !industry) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const groq = createGroq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const systemPrompt = `
      Eres un experto en business intelligence para PyMEs chilenas.
      Genera exactamente 5 recomendaciones estratégicas y de KPIs para este negocio:
      - Rubro: ${industry}
      - Actividad principal: ${actividad || 'No especificada'}
      - Tamaño del equipo: ${tamano_equipo || 'No especificado'}
      
      Las recomendaciones deben ser extremadamente específicas para este tipo de negocio.
      Usa español chileno profesional pero directo. No uses saludos.

      MUY IMPORTANTE: Tu respuesta final debe ser EXCLUSIVAMENTE un bloque JSON válido con el siguiente formato exacto. No incluyas markdown (como \`\`\`json), ni saludos, ni ningún otro texto antes o después. 

      {
        "recommendations": [
          {
            "type": "opportunity", // puede ser "opportunity", "critical", o "suggestion"
            "title": "título corto de máximo 6 palabras",
            "description": "descripción detallada de máximo 2 oraciones"
          }
        ]
      }
    `;

        // BUG #4 FIX: Wrap Groq call with a 15-second timeout to avoid infinite spinners.
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Groq timeout after 15s')), 15000)
        );

        let text: string;
        try {
            const result = await Promise.race([
                generateText({
                    model: groq('llama-3.3-70b-versatile'),
                    system: systemPrompt,
                    prompt: "Genera el JSON de recomendaciones estratégicas ahora.",
                }),
                timeoutPromise,
            ]);
            text = result.text;
        } catch (timeoutErr) {
            const err = timeoutErr as Error;
            if (err.message === 'Groq timeout after 15s') {
                console.error('Groq timed out after 15 seconds.');
                return new Response(
                    JSON.stringify({ error: 'La IA tardó demasiado. Intenta de nuevo.' }),
                    { status: 408, headers: { 'Content-Type': 'application/json' } }
                );
            }
            throw timeoutErr;
        }

        // Limpiar posible markdown wrapper de la respuesta de Groq
        const cleanJson = text.replace(/```json\n?/, '').replace(/```/, '').trim();
        let parsedResult: { recommendations: Array<{ type: string; title: string; description: string }> };

        try {
            parsedResult = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Groq JSON parsing failed. Output was:", text);
            throw new Error("Invalid output format from AI");
        }

        // Validar el array
        if (!parsedResult.recommendations || parsedResult.recommendations.length === 0) {
            throw new Error('No recommendations generated');
        }

        // BUG #2 FIX: Use service role key to bypass RLS, with explicit fallback warning above.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Insertar en la BD
        const recommendationsToInsert = parsedResult.recommendations.map((rec) => ({
            company_id: companyId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            status: 'active'
        }));

        const { error: dbError } = await supabase
            .from('ai_recommendations')
            .insert(recommendationsToInsert);

        if (dbError) {
            console.error('Supabase insert error:', dbError);
            throw new Error('Failed to save recommendations');
        }

        return new Response(JSON.stringify({ success: true, count: parsedResult.recommendations.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Onboarding API Error:', err);
        return new Response(JSON.stringify({ error: err.message || 'Failed to generate recommendations' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
