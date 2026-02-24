import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
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

        // Usamos generateText y parseo manual ya que Groq falla con json_schema en este modelo
        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            system: systemPrompt,
            prompt: "Genera el JSON de recomendaciones estratégicas ahora.",
        });

        // Limpiar posible markdown wrapper de la respuesta de Groq
        const cleanJson = text.replace(/```json\n?/, '').replace(/```/, '').trim();
        let parsedResult;

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

        // Inicializamos cliente de admin para bypassear RLS al guardar (ya que el user quizás aún no actualiza su token)
        // Opcional: usar service_role key si está en env
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Insertar en la BD
        const recommendationsToInsert = parsedResult.recommendations.map((rec: any) => ({
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

    } catch (error: any) {
        console.error('Onboarding API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate recommendations' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
