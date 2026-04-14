import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis rate limit: 20 requests per user per minute (sliding window).
// Persists across deploys and serverless instances.
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'talisto:ratelimit:chat',
  });
}

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

  // Rate limit check (skipped gracefully if Upstash is not configured)
  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(user.id);
    if (!success) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: `Demasiadas solicitudes. Intenta de nuevo en ${retryAfterSec}s.` }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'Retry-After': String(retryAfterSec),
          },
        }
      );
    }
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

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages debe ser un arreglo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    // Map raw sales rows to include items_summary derived from the items JSON array
    const salesWithSummary = (sales || []).map((s: any) => ({
      ...s,
      items_summary: Array.isArray(s.items) && s.items.length > 0
        ? s.items.map((i: any) => `${i.quantity || 1}x ${i.name || 'Producto'}`).join(', ')
        : (s.customer_name ? `Cliente: ${s.customer_name}` : 'Venta general')
    }));

    // Create a time-aware context from sales data
    const today = new Date();

    const salesLog = salesWithSummary
      .slice(0, 50)
      .map((s: any) => {
        const d = new Date(s.created_at);
        return `[${d.toLocaleDateString('es-CL')}] $${Number(s.amount).toLocaleString('es-CL')} — ${s.items_summary || 'Venta general'}`;
      }).join('\n');

    const totalSales = salesWithSummary.length;
    const totalRevenue = salesWithSummary.reduce((acc: number, s: any) => acc + Number(s.amount), 0);
    const criticalStock = inventory?.filter((p: any) => p.stock_current <= p.stock_minimum).length || 0;

    // Inventario resumido
    const inventoryLog = (inventory || [])
      .slice(0, 30)
      .map((p: any) => `- ${p.name} | SKU: ${p.sku || 'N/A'} | $${Number(p.price_sale || 0).toLocaleString('es-CL')} | Stock: ${p.stock_current}/${p.stock_minimum}`)
      .join('\n');

    // Ranking de productos más vendidos
    const productSalesCount: Record<string, { qty: number; revenue: number }> = {};
    salesWithSummary.forEach((s: any) => {
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
Eres Tali, CFO Virtual de Talisto. Eres un CFO senior con 15+ años de experiencia trabajando con PyMEs chilenas. Hablas directamente al dueño o gerente de la empresa — sin rodeos, sin relleno, con cifras concretas.

FECHA ACTUAL: ${today.toLocaleDateString('es-CL')}

## EMPRESA
- Rubro: ${industry}
- Actividad principal: ${actividad}
- Tamaño del equipo: ${equipo}

## MÉTRICAS ACTUALES
- Ingresos totales registrados: $${totalRevenue.toLocaleString('es-CL')} CLP (${totalSales} ventas)
- Productos con stock crítico (bajo mínimo): ${criticalStock}

## INVENTARIO (${inventory?.length || 0} productos)
${inventoryLog || 'Sin productos registrados.'}

## TOP PRODUCTOS MÁS VENDIDOS (por unidades)
${topProducts || 'Sin datos de productos vendidos aún.'}

## VENTAS RECIENTES (usa esto para consultas sobre "hoy", "ayer", "este mes", "esta semana")
${salesLog || 'No hay ventas registradas aún.'}

---

## INSTRUCCIONES DE RAZONAMIENTO
Antes de responder, razona internamente paso a paso:
1. ¿Qué está preguntando exactamente el dueño?
2. ¿Qué datos del contexto son relevantes? Identifícalos.
3. ¿Qué número o métrica concreta resuelve la pregunta?
4. ¿Qué acción específica debería tomar?
Solo después de ese razonamiento interno, entrega la respuesta final.

## FORMATO DE RESPUESTA
- Empieza SIEMPRE con el insight o dato más importante (máximo 1 línea).
- Luego el análisis breve (2-4 bullets con datos reales del contexto).
- Cierra con UNA recomendación accionable con número concreto.
- Máximo 3 párrafos o secciones. Sin saludos. Sin despedidas.
- Usa bullets (•) y negritas (**texto**) para claridad.

## CONTEXTO CHILENO
- Precios en CLP. Si mencionas UF, usa el valor aproximado vigente (~$38.000 CLP).
- IVA en Chile es 19%. Si hablas de márgenes, aclara si son con o sin IVA.
- Menciona normativa SII, Boleta Electrónica o facturación cuando sea relevante.
- Considera estacionalidad chilena: Fiestas Patrias (sept), verano (dic-feb), campaña escolar (ene-mar).
- Recomienda consultar con contador o abogado tributario para temas legales/tributarios específicos — tú das el análisis financiero, no la asesoría legal.

## REGLAS ABSOLUTAS
1. Responde siempre en español chileno. Tono: directo, confiante, profesional. Como el CFO que le habla al dueño.
2. NUNCA inventes datos. Solo usa los números del contexto. Si no hay datos suficientes, dilo explícitamente.
3. NO des consejos legales o tributarios específicos — indica que consulte a su contador.
4. Si el usuario pide una "gráfica", "gráfico", "torta" o "chart", responde EXCLUSIVAMENTE con un bloque JSON (sin texto adicional) siguiendo esta estructura exacta:
   - Barras: \`\`\`json\n{"type":"bar","title":"Título","data":[{"name":"X","value":15000}]}\n\`\`\`
   - Torta/pie: \`\`\`json\n{"type":"pie","title":"Título","data":[{"name":"X","value":15000}]}\n\`\`\`
   - CRÍTICO: "value" debe ser número entero SIN formato (35000, NUNCA "35.000" ni "$35.000").
5. Para gráficos de productos más vendidos, usa el ranking del contexto. Prefiere "pie" si piden distribución.
    `;

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages || []);

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.35,   // Low temperature: precise financial analysis, not creative
      maxOutputTokens: 1024, // Enough for structured CFO responses, avoids runaway outputs
      topP: 0.9,           // Slightly constrained nucleus sampling for coherence
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
