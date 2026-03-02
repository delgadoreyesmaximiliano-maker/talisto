import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@/lib/supabase/server';

// In-memory rate limit: 20 requests per user per minute.
// Resets on each deploy — sufficient for MVP. Upgrade to Upstash Redis for persistence.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const WINDOW_MS = 60 * 1000

export async function POST(req: Request) {
  // Auth guard: verify user is authenticated
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limit check
  const now = Date.now()
  const userLimit = rateLimitMap.get(user.id)
  if (userLimit && now < userLimit.resetAt) {
    if (userLimit.count >= RATE_LIMIT) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera 1 minuto.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    userLimit.count++
  } else {
    rateLimitMap.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
  }

  // Security: fetch company_id from DB using the authenticated user — never trust client body
  const { data: userRow } = await supabase
    .from('users')
    .select('company_id, companies(industry, settings)')
    .eq('id', user.id)
    .single();

  const companyId = (userRow as any)?.company_id;
  if (!companyId) {
    return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const body = await req.json();
    const { messages } = body;

    // Re-fetch data server-side with verified company_id — client context is ignored
    const [{ data: inventory }, { data: sales }] = await Promise.all([
      supabase
        .from('products')
        .select('name, sku, category, price_sale, stock_current, stock_minimum')
        .eq('company_id', companyId),
      supabase
        .from('sales')
        .select('amount, source, created_at, customer_name, items')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const companyInfo = (userRow as any)?.companies;
    const industry = companyInfo?.industry || 'PyME';
    const actividad = companyInfo?.settings?.actividad || 'No especificada';
    const equipo = companyInfo?.settings?.tamano_equipo || 'No especificado';

    // Create a time-aware context from sales data
    const today = new Date();

    const salesLog = (sales || [])
      .slice(0, 50)
      .map((s: any) => {
        const d = new Date(s.created_at);
        return `[${d.toLocaleDateString('es-CL')}] $${Number(s.amount).toLocaleString('es-CL')} — ${s.items_summary || 'Venta general'}`;
      }).join('\n');

    const totalSales = sales?.length || 0;
    const totalRevenue = sales?.reduce((acc: number, s: any) => acc + Number(s.amount), 0) || 0;
    const criticalStock = inventory?.filter((p: any) => p.stock_current <= p.stock_minimum).length || 0;

    // Inventario resumido
    const inventoryLog = (inventory || [])
      .slice(0, 30)
      .map((p: any) => `- ${p.name} | SKU: ${p.sku || 'N/A'} | $${Number(p.price_sale || 0).toLocaleString('es-CL')} | Stock: ${p.stock_current}/${p.stock_minimum}`)
      .join('\n');

    // Ranking de productos más vendidos
    const productSalesCount: Record<string, { qty: number; revenue: number }> = {};
    (sales || []).forEach((s: any) => {
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach((item: any) => {
          const name = item.name || 'Desconocido';
          if (!productSalesCount[name]) productSalesCount[name] = { qty: 0, revenue: 0 };
          productSalesCount[name].qty += (item.quantity || 1);
          productSalesCount[name].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });
    const topProducts = Object.entries(productSalesCount)
      .sort(([, a], [, b]) => b.qty - a.qty)
      .slice(0, 10)
      .map(([name, data]) => `- ${name}: ${data.qty} unidades vendidas ($${data.revenue.toLocaleString('es-CL')} total)`)
      .join('\n');

    const systemPrompt = `
      Eres un excelente asistente de negocios experto para PyMEs chilenas llamado Tali.
      Trabajas en Talisto SaaS como el CFO Virtual.

      FECHA ACTUAL DEL SISTEMA: ${today.toLocaleDateString('es-CL')}

      Estás ayudando a resolver dudas de negocio a una empresa con las siguientes características:
      - Rubro: ${industry}
      - Actividad principal: ${actividad}
      - Tamaño del equipo: ${equipo}

      Métricas generales:
      - Ingresos totales históricos: $${totalRevenue.toLocaleString('es-CL')} (${totalSales} ventas)
      - Productos en estado crítico (Stock bajo el mínimo): ${criticalStock}

      Inventario actual (${inventory?.length || 0} productos):
      ${inventoryLog || 'Sin productos registrados.'}

      Productos más vendidos (por cantidad):
      ${topProducts || 'Sin datos de productos vendidos aún.'}

      Registro de las ventas más recientes (USA ESTO para responder sobre "ayer", "hoy", "este mes"):
      ${salesLog || 'No hay ventas registradas aún.'}

      REGLAS DE ORO:
      1. Responde siempre en español chileno, tono profesional, amigable y muy directo.
      2. No uses saludos largos.
      3. TIENES ACCESO AL HISTORIAL COMPLETO: ventas, inventario y productos más vendidos. Usa estos datos para responder.
      4. Si el usuario pide una "gráfica", "gráfico", "torta" o "chart", NO uses tablas Markdown ni ASCII. DEBES responder EXCLUSIVAMENTE con un bloque de código JSON que siga esta estructura exacta:
      - Para gráfico de barras:
      \`\`\`json
      {
        "type": "bar",
        "title": "Título del gráfico",
        "data": [
          { "name": "Producto A", "value": 15000 },
          { "name": "Producto B", "value": 23000 }
        ]
      }
      \`\`\`
      - Para gráfico de torta/pie:
      \`\`\`json
      {
        "type": "pie",
        "title": "Título del gráfico",
        "data": [
          { "name": "Producto A", "value": 15000 },
          { "name": "Producto B", "value": 23000 }
        ]
      }
      \`\`\`
      IMPORTANTE: Los "value" en el JSON DEBEN ser números puros SIN formato (ej: 35000, NUNCA "35.000" ni "$35.000"). Solo números enteros.
      5. Usa los datos reales del negocio mencionados arriba para dar recomendaciones hiper-específicas.
      6. Cuando te pidan gráficos de productos más vendidos, usa el ranking de arriba. Si piden torta/pie, usa type "pie".
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
