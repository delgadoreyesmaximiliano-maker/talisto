import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export async function POST(req: Request) {
  console.log("=== API CHAT HIT ===");

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const body = await req.json();
    const { messages, data } = body;

    const sanitizedMessages = (messages || []).map((m: { role?: string; content: unknown; parts?: Array<{ type: string; text?: string }> }) => {
      let content = '';
      if (typeof m.content === 'string') {
        content = m.content;
      } else if (Array.isArray(m.parts)) {
        content = m.parts
          .filter((p) => p.type === 'text')
          .map((p) => p.text || '')
          .join('');
      } else {
        content = String(m.content ?? '');
      }
      return {
        role: m.role || 'user',
        content,
      };
    });

    const systemPrompt = `
      Eres un analista experto en negocios, inventario y ventas para una aplicación chilena llamada Talisto SaaS.
      Tu objetivo es ayudar al usuario proporcionándole análisis claros, accionables y directos basados en sus datos de inventario y ventas actuales.
      Prioriza recomendar qué productos debe reabastecer basándote en un "Stock Crítico" (stock_current <= stock_minimum).
      Mantén tus respuestas profesionales, en español chileno corto.

      Contexto actual:
      ${data ? JSON.stringify(data) : "{}"}
    `;

    console.log('Messages count:', sanitizedMessages.length);

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: sanitizedMessages,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Groq API Error Detail:', err?.message || error);
    return new Response(JSON.stringify({ error: err?.message || 'Failed to process AI request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
