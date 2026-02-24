import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  console.log("=== API CHAT HIT ===");

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const body = await req.json();
    const { messages, data } = body;
    const { profile, sales, inventory } = data || {};

    const industry = profile?.industry || 'PyME';
    const actividad = profile?.settings?.actividad || 'No especificada';
    const equipo = profile?.settings?.tamano_equipo || 'No especificado';
    const totalSales = sales?.length || 0;
    const totalRevenue = sales?.reduce((acc: number, s: any) => acc + Number(s.amount), 0) || 0;
    const criticalStock = inventory?.filter((p: any) => p.stock_current <= p.stock_minimum).length || 0;

    const systemPrompt = `
      Eres un excelente asistente de negocios experto para PyMEs chilenas llamado Tali. 
      Trabajas en Talisto SaaS.
      
      Estás ayudando a resolver dudas de negocio a una empresa con las siguientes características:
      - Rubro: ${industry}
      - Actividad principal: ${actividad}
      - Tamaño del equipo: ${equipo}
      
      Métricas en tiempo real:
      - Ventas totales registradas: ${totalSales}
      - Ingresos totales generados: $${totalRevenue.toLocaleString('es-CL')}
      - Productos en estado crítico (Stock bajo el mínimo): ${criticalStock}
      
      REGLAS DE ORO:
      1. Responde siempre en español chileno, tono profesional, amigable y muy directo.
      2. No uses saludos largos.
      3. Usa los datos reales del negocio mencionados arriba para dar recomendaciones hiper-específicas, NO genéricas de internet.
      4. Menciona el rubro y la actividad del usuario cuando tenga sentido para dar mayor valor a tus ideas.
      5. Si el usuario te pregunta por algo que no está relacionado con la gestión de su negocio, responde amablemente que tu especialidad es el éxito de su empresa y desvía la conversación.
    `;

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages || []);

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Groq API Error Detail:', err?.message || error);
    return new Response(JSON.stringify({ error: err?.message || 'Failed to process AI request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
