import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Lazy singletons: initialized on first use (inside request handlers), not at module load time.
// This prevents build-time crashes when env vars are absent in the build environment.
let _groq: Groq | null = null;
function getGroq(): Groq {
    if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
    return _groq;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
    if (!_supabase) {
        _supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }
    return _supabase;
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export interface AIMessageResponse {
    text: string;
    photoUrl?: string; // Por si necesita devolver un gráfico
}

/**
 * Recibe un File ID de un audio de Telegram y devuelve la transcripción
 */
export async function transcribeAudio(fileId: string): Promise<string> {
    try {
        // 1. Obtener la ruta del archivo de Telegram
        const getFileResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
        const getFileData = await getFileResp.json();
        const filePath = getFileData.result?.file_path;
        if (!filePath) throw new Error('No se pudo obtener la ruta del archivo');

        // 2. Descargar el archivo
        const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
        const audioResp = await fetch(audioUrl);
        const audioBlob = await audioResp.blob();
        const file = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });

        // 3. Transcribir con Whisper en Groq
        const transcription = await getGroq().audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            language: "es", // Forzar español para mayor asertividad
        });

        return transcription.text;
    } catch (e) {
        console.error('Error transcribing audio:', e);
        return 'Lo siento, no pude entender tu mensaje de voz.';
    }
}

/**
 * Lógica principal del Agente. Toma un texto, usa LLaMA para saber qué hacer, ejecuta funciones y responde humanamente.
 */
export async function processAgentMessage(text: string, companyId: string, companyName: string, botToken?: string): Promise<AIMessageResponse> {
    const systemPrompt = `Eres "Tali", el asistente virtual de la empresa "${companyName}".
IMPORTANTE: Tú TIENES acceso directo a TODA la base de datos del negocio a través de tus herramientas (tools). 
NUNCA digas que no tienes acceso a los datos. SIEMPRE usa tus herramientas para consultar información real.

REGLAS DE USO DE HERRAMIENTAS:
- Ventas de hoy → get_sales_today
- Resumen del mes → get_monthly_summary
- Stock crítico o productos bajos → get_critical_stock
- Ver todos los productos / catálogo / precios → get_all_products
- Ver clientes → get_customers
- Registrar una venta → add_sale
- Agregar producto nuevo al inventario → add_product
- Agregar cliente nuevo → add_customer
- Gráfico de ventas → get_sales_chart_last_7_days
- Saludo o pregunta general → chat_with_user

Responde SIEMPRE de forma amigable, concisa y con emojis. Habla como un asistente profesional pero cercano.
Si el usuario te envía un audio, esta entrada es la transcripción de su audio.`;

    // Herramientas que la IA puede decidir llamar
    const tools: any[] = [
        {
            type: "function",
            function: {
                name: "get_sales_today",
                description: "Consulta las ventas del día de hoy. ÚSALA para: ventas de hoy, cuánto vendimos, ingresos del día, facturación de hoy.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_monthly_summary",
                description: "Resumen completo del mes actual: ventas totales, cantidad de transacciones, ticket promedio y comparación con mes anterior. ÚSALA para: resumen del mes, cómo vamos, balance mensual.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_critical_stock",
                description: "Productos con stock bajo o crítico. ÚSALA para: qué se está acabando, stock bajo, hay que reponer, alertas de inventario.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_all_products",
                description: "Lista todos los productos del catálogo con nombre, precio, stock actual y stock mínimo. ÚSALA para: qué productos tenemos, catálogo, lista de precios, inventario completo.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_customers",
                description: "Lista todos los clientes registrados con nombre, email, teléfono y estado. ÚSALA para: quiénes son mis clientes, lista de clientes, contactos, CRM.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "add_sale",
                description: "Registra una venta nueva. ÚSALA cuando: vendí algo, cobré, anota una venta, registra un pago.",
                parameters: {
                    type: "object",
                    properties: {
                        product_name: { type: "string", description: "Nombre del producto vendido o servicio" },
                        price: { type: "number", description: "El precio unitario del producto" },
                        quantity: { type: "number", description: "Cantidad de unidades vendidas. Si no se indica, usar 1." }
                    },
                    required: ["product_name", "price"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "add_product",
                description: "Agrega un producto nuevo al inventario. ÚSALA cuando: agregar producto, nuevo producto, meter al catálogo, registrar mercadería.",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Nombre del producto" },
                        price: { type: "number", description: "Precio de venta al público" },
                        stock: { type: "number", description: "Cantidad de unidades en stock. Si no se indica, usar 0." },
                        stock_minimum: { type: "number", description: "Stock mínimo antes de alerta. Si no se indica, usar 5." }
                    },
                    required: ["name", "price"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "add_customer",
                description: "Registra un cliente nuevo. ÚSALA cuando: nuevo cliente, agregar cliente, registrar contacto.",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Nombre completo del cliente" },
                        email: { type: "string", description: "Email del cliente (opcional)" },
                        phone: { type: "string", description: "Teléfono del cliente (opcional)" }
                    },
                    required: ["name"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_sales_chart_last_7_days",
                description: "Genera un gráfico visual PNG con las ventas de los últimos 7 días. ÚSALA para: gráfico, estadísticas visuales, muéstrame las ventas, reporte visual.",
                parameters: { type: "object", properties: {}, required: [] }
            }
        },
        {
            type: "function",
            function: {
                name: "chat_with_user",
                description: "Responde conversacionalmente. ÚSALA SOLO para saludos, preguntas generales o temas que NO requieren datos del negocio.",
                parameters: {
                    type: "object",
                    properties: {
                        response: { type: "string", description: "Tu respuesta amigable al usuario" }
                    },
                    required: ["response"]
                }
            }
        }
    ];

    try {
        const chatCompletion = await getGroq().chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            tools: tools,
            tool_choice: "required",
        });

        const responseMessage = chatCompletion.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        let photoUrlToReturn: string | undefined = undefined;

        if (toolCalls && toolCalls.length > 0) {
            const toolResults = [];

            for (const toolCall of toolCalls) {
                let args: any = {};
                try {
                    args = JSON.parse(toolCall.function.arguments);
                } catch {
                    console.error('[Agent] Invalid JSON in tool arguments:', toolCall.function.arguments);
                }
                const toolName = toolCall.function.name;
                let resultObj: any = { error: 'Herramienta no reconocida' };

                // ───── VENTAS DE HOY ─────
                if (toolName === 'get_sales_today') {
                    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                    const { data } = await getSupabase().from('sales').select('amount').eq('company_id', companyId).gte('created_at', todayStart.toISOString());
                    const totalAmount = data?.reduce((acc: number, item: any) => acc + (item.amount || 0), 0) || 0;
                    resultObj = { cant_ventas: data?.length || 0, monto_total_ganado: totalAmount };
                }

                // ───── RESUMEN DEL MES ─────
                if (toolName === 'get_monthly_summary') {
                    const now = new Date();
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                    
                    const { data: thisMonth } = await getSupabase().from('sales').select('amount').eq('company_id', companyId).gte('created_at', monthStart.toISOString());
                    const { data: lastMonth } = await getSupabase().from('sales').select('amount').eq('company_id', companyId).gte('created_at', prevMonthStart.toISOString()).lte('created_at', prevMonthEnd.toISOString());
                    
                    const thisTotal = thisMonth?.reduce((a: number, s: any) => a + (s.amount || 0), 0) || 0;
                    const lastTotal = lastMonth?.reduce((a: number, s: any) => a + (s.amount || 0), 0) || 0;
                    const ticketPromedio = thisMonth && thisMonth.length > 0 ? Math.round(thisTotal / thisMonth.length) : 0;

                    resultObj = {
                        mes_actual: { total_ventas: thisTotal, cantidad_transacciones: thisMonth?.length || 0, ticket_promedio: ticketPromedio },
                        mes_anterior: { total_ventas: lastTotal, cantidad_transacciones: lastMonth?.length || 0 },
                        variacion_porcentual: lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : null
                    };
                }

                // ───── STOCK CRÍTICO ─────
                if (toolName === 'get_critical_stock') {
                    const { data } = await getSupabase().from('products').select('name, stock_current, stock_minimum').eq('company_id', companyId);
                    const critical = (data || []).filter((p: any) => p.stock_current <= p.stock_minimum);
                    resultObj = { productos_criticos: critical.slice(0, 10), total_productos_criticos: critical.length };
                }

                // ───── TODOS LOS PRODUCTOS ─────
                if (toolName === 'get_all_products') {
                    const { data } = await getSupabase().from('products').select('name, price_sale, stock_current, stock_minimum').eq('company_id', companyId).order('name').limit(25);
                    const productos = (data || []).map((p: any) => ({ name: p.name, precio: p.price_sale, stock: p.stock_current, stock_minimo: p.stock_minimum }));
                    resultObj = { productos, total: productos.length };
                }

                // ───── CLIENTES ─────
                if (toolName === 'get_customers') {
                    const { data } = await getSupabase().from('customers').select('name, email, phone, status').eq('company_id', companyId).order('name').limit(25);
                    resultObj = { clientes: data || [], total: data?.length || 0 };
                }

                // ───── AGREGAR VENTA ─────
                if (toolName === 'add_sale') {
                    if (!args.price || args.price <= 0) {
                        resultObj = { status: 'error', message: 'El precio debe ser un número positivo' };
                    } else {
                        const qty = args.quantity || 1;
                        const subtotal = args.price * qty;

                        const { data: prods } = await getSupabase().from('products').select('id, name').eq('company_id', companyId).ilike('name', `%${args.product_name}%`).limit(1);
                        const prodsTyped = prods as { id: string; name: string }[] | null;
                        const prodId = prodsTyped && prodsTyped.length > 0 ? prodsTyped[0].id : null;
                        const insertedName = prodsTyped && prodsTyped.length > 0 ? prodsTyped[0].name : args.product_name;

                        const saleRow: any = { company_id: companyId, amount: subtotal, payment_method: 'Efectivo', created_at: new Date().toISOString() };
                        const { data: saleData } = await getSupabase().from('sales').insert([saleRow]).select('id').single();

                        if (saleData && prodId) {
                            await getSupabase().from('sale_items').insert([{ sale_id: saleData.id, product_id: prodId, quantity: qty, unit_price: args.price, subtotal }]);
                            const { data: currentStockObj } = await getSupabase().from('products').select('stock_current').eq('id', prodId).single();
                            if (currentStockObj) {
                                await getSupabase().from('products').update({ stock_current: currentStockObj.stock_current - qty }).eq('id', prodId);
                            }
                        } else if (saleData) {
                            await getSupabase().from('sale_items').insert([{ sale_id: saleData.id, custom_product_name: args.product_name, quantity: qty, unit_price: args.price, subtotal }]);
                        }
                        resultObj = { status: 'success', producto: insertedName, cantidad: qty, monto_registrado: subtotal };
                    }
                }

                // ───── AGREGAR PRODUCTO ─────
                if (toolName === 'add_product') {
                    const newProduct = {
                        company_id: companyId,
                        name: args.name,
                        price: args.price,
                        stock_current: args.stock ?? 0,
                        stock_minimum: args.stock_minimum ?? 5,
                    };
                    const { data, error } = await getSupabase().from('products').insert([newProduct]).select('id, name').single();
                    if (error) {
                        resultObj = { status: 'error', message: error.message };
                    } else {
                        resultObj = { status: 'success', producto_creado: data?.name, precio: args.price, stock_inicial: newProduct.stock_current };
                    }
                }

                // ───── AGREGAR CLIENTE ─────
                if (toolName === 'add_customer') {
                    const newCustomer: any = {
                        company_id: companyId,
                        name: args.name,
                        status: 'active',
                    };
                    if (args.email) newCustomer.email = args.email;
                    if (args.phone) newCustomer.phone = args.phone;

                    const { data, error } = await getSupabase().from('customers').insert([newCustomer]).select('id, name').single();
                    if (error) {
                        resultObj = { status: 'error', message: error.message };
                    } else {
                        resultObj = { status: 'success', cliente_creado: data?.name };
                    }
                }

                // ───── GRÁFICO DE VENTAS ─────
                if (toolName === 'get_sales_chart_last_7_days') {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    sevenDaysAgo.setHours(0,0,0,0);
                    
                    const { data } = await getSupabase().from('sales').select('amount, created_at').eq('company_id', companyId).gte('created_at', sevenDaysAgo.toISOString());
                    
                    const salesByDay: Record<string, number> = {};
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(); d.setDate(d.getDate() - i);
                        const label = `${d.getDate()}/${d.getMonth()+1}`;
                        salesByDay[label] = 0;
                    }

                    if (data) {
                        data.forEach((s: any) => {
                            const sd = new Date(s.created_at);
                            const label = `${sd.getDate()}/${sd.getMonth()+1}`;
                            if (salesByDay[label] !== undefined) {
                                salesByDay[label] += s.amount;
                            }
                        });
                    }

                    const labels = Object.keys(salesByDay);
                    const values = Object.values(salesByDay);

                    const chartConfig = {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Ingresos',
                                data: values,
                                backgroundColor: 'rgba(52, 211, 153, 0.5)',
                                borderColor: 'rgba(52, 211, 153, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            title: { display: true, text: 'Ventas Últimos 7 Días' },
                            legend: { display: false }
                        }
                    };

                    // Use QuickChart short URL API — fallback to inline URL if service unavailable
                    try {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), 5000);
                        const shortRes = await fetch('https://quickchart.io/chart/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chart: chartConfig, width: 600, height: 400, backgroundColor: 'white' }),
                            signal: controller.signal,
                        });
                        clearTimeout(timeout);
                        if (shortRes.ok) {
                            const shortData = await shortRes.json();
                            if (shortData.success && shortData.url) {
                                photoUrlToReturn = shortData.url;
                            }
                        }
                    } catch (chartErr) {
                        console.error('QuickChart error:', chartErr);
                        // Fallback: inline chart URL (may be long but works)
                        const encoded = encodeURIComponent(JSON.stringify(chartConfig));
                        const fallbackUrl = `https://quickchart.io/chart?c=${encoded}&w=600&h=400&bkg=white`;
                        if (fallbackUrl.length < 2000) photoUrlToReturn = fallbackUrl;
                    }
                    resultObj = { status: 'success', chart_generated: !!photoUrlToReturn, data_summary: salesByDay };
                }

                // ───── CHAT CONVERSACIONAL ─────
                if (toolName === 'chat_with_user') {
                    return { text: args.response || '¡Hola! ¿En qué te puedo ayudar? 😊' };
                }

                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: toolName,
                    content: JSON.stringify(resultObj),
                });
            }

            // Para la segunda llamada, Groq exige reenviar la declaración de "tools"
            // y asegurar que el "content" no sea nulo.
            const safeResponseMessage = {
                ...responseMessage,
                content: responseMessage.content || ""
            };

            // Llamar a la IA nuevamente con la respuesta de las tools
            const finalChat = await getGroq().chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text },
                    safeResponseMessage,
                    ...toolResults
                ] as any,
                tools: tools
            });

            return {
                text: finalChat.choices[0].message.content || 'Hubo un error construyendo la respuesta.',
                photoUrl: photoUrlToReturn
            };
        }

        return {
            text: responseMessage.content || 'No sé cómo responder a eso 🤔'
        };

    } catch (error) {
        console.error('Error invoking LLM:', error);
        return { text: '¡Ups! Ha ocurrido un error interno consultando mis circuitos. 🤖💥' };
    }
}
