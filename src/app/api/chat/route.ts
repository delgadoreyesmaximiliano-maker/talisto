import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  // data will contain contextual stringified JSON (inventory + sales) from the frontend
  const systemPrompt = `
    Eres un analista experto en negocios, inventario y ventas para una aplicación chilena llamada Talisto SaaS.
    Tu objetivo es ayudar al usuario proporcionándole análisis claros, accionables y directos basados en sus datos de inventario y ventas actuales.
    Prioriza recomendar qué productos debe reabastecer basándote en un "Stock Crítico" (stock_current <= stock_minimum) o en su alto volumen de ventas.
    Mantén tus respuestas profesionales, en español chileno (sin exagerar los modismos, pero usando términos como "stock", "ventas", "boletas", "clientes"), usando formato Markdown con listas y negritas cuando sea adecuado.

    Contexto actual de los datos del usuario:
    ${data ? JSON.stringify(data) : "No hay datos disponibles en este momento."}
  `;

  const result = streamText({
    model: google('gemini-2.0-flash') as any,
    system: systemPrompt,
    messages,
  });

  return (result as any).toDataStreamResponse();
}
