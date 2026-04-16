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
    needsMoreInfo?: boolean; // Indica si el bot está esperando detalles adicionales
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
export async function processAgentMessage(text: string, companyId: string, companyName: string, settings: any = {}): Promise<AIMessageResponse> {
    const dashboardConfig = settings?.dashboard_config || {};
    const businessContext = settings?.business_description ? `Contexto del negocio: ${settings.business_description}` : '';

    const systemPrompt = `Eres "Tali", el asistente de elite y contador digital de "${companyName}". 
${businessContext}

POLÍTICA DE RIGOR CONTABLE (CRÍTICO):
1. NUNCA registres una venta, producto o cliente si faltan datos MANDATORIOS. 
2. Si el usuario dice algo incompleto (ej: "vendí un café"), NO LLAMES a la herramienta de registro aún. Responde educadamente pidiendo los detalles faltantes: "¿A qué precio?", "¿Cuántos?" y "¿Qué método de pago?".
3. Tu objetivo es que la contabilidad sea PERFECTA. No asumas NADA.

TERMINOLOGÍA PERSONALIZADA:
- El usuario puede referirse a sus KPIs como: ${dashboardConfig.kpi_1_label || 'Ventas'}, ${dashboardConfig.kpi_2_label || 'Clientes'}, ${dashboardConfig.kpi_3_label || 'Inventario'}.

ACCESO A DATOS:
- Tú TIENES acceso directo a TODA la base de datos a través de herramientas. NUNCA digas que no puedes ver algo.

REGLAS DE HERRAMIENTAS:
- Ventas/Fechas (ayer, hoy, rangos) → get_sales_by_date
- Gráficos (barra, torta, líneas, HISTOGRAMA) → generate_dynamic_chart. (Para histogramas, usa chart_type="bar" con muchas etiquetas o pide bins).
- Resumen mes → get_monthly_summary
- Stock crítico → get_critical_stock
- Registrar venta → add_sale. (REQUERIDO: product_name, price, quantity, payment_method).
- Chat general → chat_with_user (Úsala para pedir datos faltantes o saludar).

Responde SIEMPRE de forma profesional, usando emojis de negocios (📊, 💰, 📈) y manteniendo la seriedad de un contador de confianza.`;

    const tools: any[] = [
        {
            type: "function",
            function: {
                name: "get_sales_by_date",
                description: "Consulta ventas (ingresos y listado) en un rango de fechas. Sirve para 'ayer', 'hoy', 'semana pasada', 'este mes', etc.",
                parameters: { 
                    type: "object", 
                    properties: { 
                        start_date: { type: "string", description: "Fecha inicio (ISO string o YYYY-MM-DD)" },
                        end_date: { type: "string", description: "Fecha fin (ISO string o YYYY-MM-DD)" }
                    },
                    required: ["start_date", "end_date"]
                },
            },
        },
        {
            type: "function",
            function: {
                name: "generate_dynamic_chart",
                description: "Genera un gráfico a medida. Debes mandarle las etiquetas y valores que TÚ extraerás de llamar otras herramientas previas o de datos que resumiste.",
                parameters: {
                    type: "object",
                    properties: {
                        chart_type: { type: "string", enum: ["bar", "line", "pie", "doughnut"], description: "El tipo de gráfico" },
                        labels: { type: "array", items: { type: "string" }, description: "Las etiquetas (eje X o nombres de las tajadas)" },
                        values: { type: "array", items: { type: "number" }, description: "Los valores numéricos correspondientes" },
                        title: { type: "string", description: "Título del gráfico" }
                    },
                    required: ["chart_type", "labels", "values", "title"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "delete_sale",
                description: "Cancela o elimina una venta usando su monto, fecha reciente, o detalles si el usuario se equivocó.",
                parameters: { 
                    type: "object", 
                    properties: { 
                        amount: { type: "number", description: "El monto de la venta a eliminar" },
                        product_hint: { type: "string", description: "Algún dato que identifique el producto vendido (opcional)" }
                    },
                    required: ["amount"] 
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_monthly_summary",
                description: "Resumen completo del mes actual y variación intermensual.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_critical_stock",
                description: "Productos con stock bajo o crítico.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "update_stock",
                description: "Ajusta o modifica el stock_current de un producto manualmente. Por ejemplo si dice 'Llegaron 10 teclados', envías la cantidad absoluta final.",
                parameters: { 
                    type: "object", 
                    properties: { 
                        product_name: { type: "string", description: "El nombre del producto a buscar" },
                        adjustment_action: { type: "string", enum: ["add", "subtract", "set"], description: "Acción a realizar" },
                        quantity: { type: "number", description: "Cantidad a ajustar o establecer" }
                    },
                    required: ["product_name", "adjustment_action", "quantity"]
                },
            },
        },
        {
            type: "function",
            function: {
                name: "update_product_price",
                description: "Cambia el precio de venta de un producto.",
                parameters: { 
                    type: "object", 
                    properties: { 
                        product_name: { type: "string" },
                        new_price: { type: "number" }
                    },
                    required: ["product_name", "new_price"]
                },
            },
        },
        {
            type: "function",
            function: {
                name: "get_all_products",
                description: "Lista del inventario (precio y stock).",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_customer_details",
                description: "Busca un cliente específico por nombre y te devuelve su información e historial de actividad.",
                parameters: { 
                    type: "object", 
                    properties: { 
                        customer_name: { type: "string" }
                    }, 
                    required: ["customer_name"]
                },
            },
        },
        {
            type: "function",
            function: {
                name: "update_customer",
                description: "Actualiza los datos de un cliente existente.",
                parameters: { 
                    type: "object", 
                    properties: { 
                        customer_name: { type: "string", description: "Nombre actual del cliente para buscarlo" },
                        new_email: { type: "string" },
                        new_phone: { type: "string" }
                    }, 
                    required: ["customer_name"]
                },
            },
        },
        {
            type: "function",
            function: {
                name: "get_ai_recommendations",
                description: "Obtiene las últimas alertas/sugerencias de IA guardadas para la empresa.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_customers",
                description: "Lista generica de clientes.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "add_sale",
                description: "Registra una venta nueva. SOLO LLAMAR SI TIENES: nombre del producto, precio unitario, cantidad y método de pago (Efectivo, Tarjeta, Transferencia, etc.). Si falta algo, pregunta al usuario primero.",
                parameters: {
                    type: "object",
                    properties: {
                        product_name: { type: "string" },
                        price: { type: "number" },
                        quantity: { type: "number" },
                        payment_method: { type: "string" }
                    },
                    required: ["product_name", "price", "quantity", "payment_method"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "add_product",
                description: "Agrega producto. Usa esto SOLO cuando te pidan AGREGAR UNO NUEVO al catálogo.",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        price: { type: "number" },
                        stock: { type: "number" },
                        stock_minimum: { type: "number" }
                    },
                    required: ["name", "price"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "add_customer",
                description: "Registra cliente nuevo.",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string" }
                    },
                    required: ["name"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "chat_with_user",
                description: "Habla naturalmente. USALA SI NO SE DEBEN LLAMAR NINGUNAS DE LAS DE ARRIBA.",
                parameters: {
                    type: "object",
                    properties: {
                        response: { type: "string" }
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
                
                // ───── VENTAS RANGO DE FECHAS ─────
                if (toolName === 'get_sales_by_date') {
                    const start = new Date(args.start_date);
                    const end = new Date(args.end_date);
                    end.setHours(23, 59, 59, 999);
                    
                    const { data } = await getSupabase()
                         .from('sales')
                         .select('amount, items, created_at, source')
                         .eq('company_id', companyId)
                         .gte('created_at', start.toISOString())
                         .lte('created_at', end.toISOString());
                         
                    const totalAmount = data?.reduce((acc: number, item: any) => acc + (item.amount || 0), 0) || 0;
                    resultObj = { cant_ventas: data?.length || 0, monto_total_ganado: totalAmount, detalle_ventas: data };
                }
                
                // ───── ELIMINAR VENTA ─────
                if (toolName === 'delete_sale') {
                    const query = getSupabase().from('sales').select('id, amount, created_at').eq('company_id', companyId).eq('amount', args.amount).order('created_at', { ascending: false }).limit(1);
                    const { data } = await query;
                    
                    if (data && data.length > 0) {
                        const { error } = await getSupabase().from('sales').delete().eq('id', data[0].id);
                        if(error) resultObj = { status: 'error', message: error.message };
                        else resultObj = { status: 'success', message: 'Venta anulada y eliminada correctamente.', monto: args.amount, fecha: data[0].created_at };
                    } else {
                        resultObj = { status: 'error', message: 'No se encontró la venta con esos criterios recientes para eliminarla.' };
                    }
                }

                // ───── GRÁFICA DINÁMICA ─────
                if (toolName === 'generate_dynamic_chart') {
                    const isHistogram = args.chart_type?.toLowerCase() === 'histogram';
                    const effectiveType = isHistogram ? 'bar' : args.chart_type;
                    
                    const chartConfig = {
                        type: effectiveType,
                        data: {
                            labels: args.labels,
                            datasets: [{
                                label: args.title,
                                data: args.values,
                                backgroundColor: effectiveType === 'bar' || effectiveType === 'line' ? 'rgba(52, 211, 153, 0.5)' 
                                   : args.labels.map((_: any, i: number) => `hsl(${(i * 360 / args.labels.length)}, 70%, 50%)`),
                                borderColor: effectiveType === 'line' ? 'rgba(52, 211, 153, 1)' : 'white',
                                borderWidth: effectiveType === 'line' ? 2 : 1,
                                barPercentage: isHistogram ? 1.0 : undefined,
                                categoryPercentage: isHistogram ? 1.0 : undefined,
                            }]
                        },
                        options: {
                            title: { display: true, text: args.title },
                            legend: { display: effectiveType === 'pie' || effectiveType === 'doughnut' },
                            scales: isHistogram ? {
                                xAxes: [{ gridLines: { offsetGridLines: false } }]
                            } : {}
                        }
                    };

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
                        const encoded = encodeURIComponent(JSON.stringify(chartConfig));
                        photoUrlToReturn = `https://quickchart.io/chart?c=${encoded}&w=600&h=400&bkg=white`;
                    }
                    resultObj = { status: 'success', chart_generated: !!photoUrlToReturn };
                }

                // ───── RESUMEN MENSUAL ─────
                if (toolName === 'get_monthly_summary') {
                    const now = new Date();
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                    
                    const { data: thisMonth } = await getSupabase().from('sales').select('amount').eq('company_id', companyId).gte('created_at', monthStart.toISOString());
                    const { data: lastMonth } = await getSupabase().from('sales').select('amount').eq('company_id', companyId).gte('created_at', prevMonthStart.toISOString()).lte('created_at', prevMonthEnd.toISOString());
                    
                    const thisTotal = thisMonth?.reduce((a: number, s: any) => a + (s.amount || 0), 0) || 0;
                    const lastTotal = lastMonth?.reduce((a: number, s: any) => a + (s.amount || 0), 0) || 0;
                    resultObj = {
                        mes_actual: { total_ventas: thisTotal, transacciones: thisMonth?.length || 0 },
                        mes_anterior: { total_ventas: lastTotal, transacciones: lastMonth?.length || 0 },
                        variacion_porcentual: lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : null
                    };
                }

                // ───── STOCK CRÍTICO ─────
                if (toolName === 'get_critical_stock') {
                    const { data } = await getSupabase().from('products').select('name, stock_current, stock_minimum').eq('company_id', companyId);
                    const critical = (data || []).filter((p: any) => p.stock_current <= p.stock_minimum);
                    resultObj = { productos_criticos: critical.slice(0, 10) };
                }
                
                // ───── UPDATE STOCK MANUAL ─────
                if (toolName === 'update_stock') {
                    const { data: prods } = await getSupabase().from('products').select('id, name, stock_current').eq('company_id', companyId).ilike('name', `%${args.product_name}%`).limit(1);
                    if (!prods || prods.length === 0) {
                        resultObj = { status: 'error', message: 'Producto no encontrado' };
                    } else {
                        const prod = prods[0];
                        let newStock = prod.stock_current;
                        if(args.adjustment_action === 'add') newStock += args.quantity;
                        else if(args.adjustment_action === 'subtract') newStock -= args.quantity;
                        else if(args.adjustment_action === 'set') newStock = args.quantity;
                        
                        await getSupabase().from('products').update({ stock_current: newStock }).eq('id', prod.id);
                        await getSupabase().from('inventory_transactions').insert([{ 
                            company_id: companyId, product_id: prod.id, 
                            type: args.adjustment_action === 'subtract' ? 'salida' : 'entrada', 
                            quantity: args.quantity, reason: 'Telegram Bot' 
                        }]);
                        resultObj = { status: 'success', message: `Stock de ${prod.name} actualizado de ${prod.stock_current} a ${newStock}` };
                    }
                }
                
                // ───── UPDATE PRICE ─────
                if (toolName === 'update_product_price') {
                    const { data: prods } = await getSupabase().from('products').select('id, name').eq('company_id', companyId).ilike('name', `%${args.product_name}%`).limit(1);
                    if (!prods || prods.length === 0) {
                        resultObj = { status: 'error', message: 'Producto no encontrado' };
                    } else {
                        const prod = prods[0];
                        await getSupabase().from('products').update({ price_sale: args.new_price }).eq('id', prod.id);
                        resultObj = { status: 'success', message: `Precio de ${prod.name} actualizado a ${args.new_price}` };
                    }
                }

                // ───── TODOS LOS PRODUCTOS ─────
                if (toolName === 'get_all_products') {
                    const { data } = await getSupabase().from('products').select('name, price_sale, stock_current').eq('company_id', companyId).order('name').limit(25);
                    resultObj = { productos: data || [] };
                }

                // ───── CLIENTES ─────
                if (toolName === 'get_customers') {
                    const { data } = await getSupabase().from('customers').select('name, email, phone').eq('company_id', companyId).limit(25);
                    resultObj = { clientes: data || [] };
                }
                
                // ───── DETALLE DE CLIENTE ─────
                if (toolName === 'get_customer_details') {
                    const { data } = await getSupabase().from('customers').select('*').eq('company_id', companyId).ilike('name', `%${args.customer_name}%`).limit(1);
                    if (data && data.length > 0) resultObj = { cliente: data[0] };
                    else resultObj = { status: 'error', message: 'Cliente no encontrado' };
                }
                
                // ───── ACTUALIZAR CLIENTE ─────
                if (toolName === 'update_customer') {
                    const { data } = await getSupabase().from('customers').select('id, name').eq('company_id', companyId).ilike('name', `%${args.customer_name}%`).limit(1);
                    if (data && data.length > 0) {
                        const up: any = {};
                        if(args.new_email) up.email = args.new_email;
                        if(args.new_phone) up.phone = args.new_phone;
                        await getSupabase().from('customers').update(up).eq('id', data[0].id);
                        resultObj = { status: 'success', message: 'Cliente actualizado' };
                    } else resultObj = { status: 'error', message: 'Cliente no encontrado' };
                }
                
                // ───── AI RECOMMENDATIONS ─────
                if (toolName === 'get_ai_recommendations') {
                    const { data } = await getSupabase().from('ai_recommendations').select('type, title, description, impact_estimate').eq('company_id', companyId).order('created_at', { ascending: false }).limit(5);
                    resultObj = { recomendaciones: data || [] };
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

                        const itemsJson = [{ product_id: prodId, custom_product_name: insertedName, quantity: qty, unit_price: args.price, subtotal: subtotal, payment_method: args.payment_method }];
                        const saleRow: any = { company_id: companyId, amount: subtotal, source: 'telegram_bot', items: itemsJson, created_at: new Date().toISOString() };
                        const { error: saleError } = await getSupabase().from('sales').insert([saleRow]).select('id').single();

                        if (saleError) {
                            resultObj = { status: 'error', message: 'Error interno guardando la venta', detalle: saleError.message };
                        } else {
                            if (prodId) {
                                const { data: currentStockObj } = await getSupabase().from('products').select('stock_current').eq('id', prodId).single();
                                if (currentStockObj) {
                                    await getSupabase().from('products').update({ stock_current: currentStockObj.stock_current - qty }).eq('id', prodId);
                                }
                            }
                            resultObj = { status: 'success', producto: insertedName, cantidad: qty, monto: subtotal, metodo_pago: args.payment_method };
                        }
                    }
                }

                // ───── AGREGAR PRODUCTO ─────
                if (toolName === 'add_product') {
                    const newProduct = { company_id: companyId, name: args.name, price_sale: args.price, stock_current: args.stock ?? 0, stock_minimum: args.stock_minimum ?? 5 };
                    const { error } = await getSupabase().from('products').insert([newProduct]);
                    if (error) resultObj = { status: 'error', message: error.message };
                    else resultObj = { status: 'success', message: 'Producto agregado' };
                }

                // ───── AGREGAR CLIENTE ─────
                if (toolName === 'add_customer') {
                    const newCustomer: any = { company_id: companyId, name: args.name, status: 'active' };
                    if (args.email) newCustomer.email = args.email;
                    if (args.phone) newCustomer.phone = args.phone;
                    const { error } = await getSupabase().from('customers').insert([newCustomer]);
                    if (error) resultObj = { status: 'error', message: error.message };
                    else resultObj = { status: 'success', message: 'Cliente agregado' };
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

            const safeResponseMessage = { ...responseMessage, content: responseMessage.content || "" };
            
            // Re-evaluar response
            try {
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
                
                return { text: finalChat.choices[0].message.content || 'Hubo un error armando la respuesta final.', photoUrl: photoUrlToReturn };
            } catch(nestedErr) {
                console.error("Nested LLM err:", nestedErr);
                return { text: "Operación realizada, pero tuve problemas al formatear el texto final.", photoUrl: photoUrlToReturn };
            }
        }

        return { text: responseMessage.content || 'No sé cómo responder a eso 🤔' };
    } catch (error) {
        console.error('Error invoking LLM:', error);
        return { text: '¡Ups! Ha ocurrido un error interno consultando mis circuitos. 🤖💥' };
    }
}
