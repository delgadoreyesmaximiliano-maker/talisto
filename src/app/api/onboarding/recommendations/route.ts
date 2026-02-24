import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

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
    `;

        // Usamos generateObject para asegurar un formato estricto JSON
        const { object } = await generateObject({
            model: groq('llama-3.3-70b-versatile'),
            system: systemPrompt,
            schema: z.object({
                recommendations: z.array(z.object({
                    type: z.enum(['opportunity', 'critical', 'suggestion']),
                    title: z.string().describe('Título corto de la recomendación, máximo 6 palabras'),
                    description: z.string().describe('Descripción detallada de por qué este KPI/estrategia es clave, máximo 2 oraciones')
                })).length(5, "Debe generar exactamente 5 recomendaciones")
            }),
            prompt: "Genera las recomendaciones ahora.",
        });

        // Validar el array
        if (!object.recommendations || object.recommendations.length === 0) {
            throw new Error('No recommendations generated');
        }

        // Inicializamos cliente de admin para bypassear RLS al guardar (ya que el user quizás aún no actualiza su token)
        // Opcional: usar service_role key si está en env
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Insertar en la BD
        const recommendationsToInsert = object.recommendations.map(rec => ({
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

        return new Response(JSON.stringify({ success: true, count: object.recommendations.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Onboarding API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate recommendations' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
