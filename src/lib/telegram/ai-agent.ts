import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

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
        const transcription = await groq.audio.transcriptions.create({
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
export async function processAgentMessage(text: string, companyId: string, companyName: string): Promise<AIMessageResponse> {
    const systemPrompt = `Eres "Tali", el asistente virtual de la empresa "${companyName}".
IMPORTANTE: Tú TIENES acceso directo a la base de datos del negocio a través de tus herramientas (tools). 
NUNCA digas que no tienes acceso a los datos. SIEMPRE usa tus herramientas para consultar información real.
- Si el usuario pregunta por ventas, USA la herramienta get_sales_today.
- Si el usuario pregunta por stock o inventario, USA la herramienta get_critical_stock.
- Si el usuario quiere registrar una venta, USA la herramienta add_sale.
- Si el usuario pide un gráfico o resumen visual, USA la herramienta get_sales_chart_last_7_days.
- Si el usuario solo saluda o hace una pregunta general que no requiere datos, USA la herramienta chat_with_user.
Responde siempre de forma amigable, concisa y con emojis. Habla como un asistente profesional pero cercano.`;

    // Herramientas que la IA puede decidir llamar
    const tools: any[] = [
        {
            type: "function",
            function: {
                name: "get_sales_today",
                description: "Consulta las ventas del día de hoy en la base de datos. ÚSALA siempre que el usuario pregunte por ventas, ingresos, cuánto se vendió, facturación, o cualquier tema de dinero del día.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_critical_stock",
                description: "Consulta los productos con stock bajo o crítico en la base de datos. ÚSALA cuando pregunten por inventario, stock, productos que faltan, o qué hay que reponer.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "add_sale",
                description: "Registra una venta nueva en la base de datos. ÚSALA cuando el usuario diga que vendió algo, que cobre algo, que anote una venta, o mencione un precio de producto vendido.",
                parameters: {
                    type: "object",
                    properties: {
                        product_name: { type: "string", description: "Nombre del producto vendido o servicio" },
                        price: { type: "number", description: "El precio total pagado por el cliente" }
                    },
                    required: ["product_name", "price"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_sales_chart_last_7_days",
                description: "Genera un gráfico visual (imagen PNG) con las ventas de los últimos 7 días. ÚSALA cuando el usuario pida gráficos, estadísticas visuales, o quiera ver cómo van las ventas.",
                parameters: { type: "object", properties: {}, required: [] }
            }
        },
        {
            type: "function",
            function: {
                name: "chat_with_user",
                description: "Responde de forma conversacional al usuario. ÚSALA SOLO cuando el usuario saluda, hace preguntas generales, o no necesita datos del negocio.",
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
        const chatCompletion = await groq.chat.completions.create({
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
            // La IA decidió que necesita datos de una herramienta
            const toolResults = [];

            for (const toolCall of toolCalls) {
                const args = JSON.parse(toolCall.function.arguments);
                const toolName = toolCall.function.name;
                let resultObj: any = { error: 'Unknown tool' };

                if (toolName === 'get_sales_today') {
                    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                    const { data } = await supabase.from('sales').select('amount').eq('company_id', companyId).gte('created_at', todayStart.toISOString());
                    const totalAmount = data?.reduce((acc: number, item: any) => acc + (item.amount || 0), 0) || 0;
                    resultObj = { cant_ventas: data?.length || 0, monto_total_ganado: totalAmount };
                }

                if (toolName === 'get_critical_stock') {
                    const { data } = await supabase.from('products').select('name, stock_current, stock_minimum').eq('company_id', companyId);
                    const critical = (data || []).filter((p: any) => p.stock_current <= p.stock_minimum);
                    resultObj = { productos_criticos: critical.slice(0, 10) }; // Solo top 10 para no saturar 
                }

                if (toolName === 'add_sale') {
                    // Ver si el producto existe
                    const { data: prods } = await supabase.from('products').select('id, name').eq('company_id', companyId).ilike('name', `%${args.product_name}%`).limit(1);
                    const prodId = prods && prods.length > 0 ? prods[0].id : null;
                    const insertedName = prods && prods.length > 0 ? prods[0].name : args.product_name;

                    // Insertar la venta
                    const saleRow: any = { company_id: companyId, amount: args.price, payment_method: 'Efectivo', created_at: new Date().toISOString() };
                    
                    const { data: saleData } = await supabase.from('sales').insert([saleRow]).select('id').single();
                    
                    if (saleData && prodId) {
                        // Insertar item y descontar stock 
                        await supabase.from('sale_items').insert([{ sale_id: saleData.id, product_id: prodId, quantity: 1, unit_price: args.price, subtotal: args.price }]);
                        // Decimos a Supabase que baje el stock 
                        const { data: currentStockObj } = await supabase.from('products').select('stock_current').eq('id', prodId).single();
                        if (currentStockObj) {
                            await supabase.from('products').update({ stock_current: currentStockObj.stock_current - 1 }).eq('id', prodId);
                        }
                    } else if (saleData) {
                        // Venta sin item asociado (por ejemplo registrando venta sin inventario)
                        await supabase.from('sale_items').insert([{ sale_id: saleData.id, custom_product_name: args.product_name, quantity: 1, unit_price: args.price, subtotal: args.price }]);
                    }
                    resultObj = { status: 'success', product_matched: insertedName, total_registered: args.price };
                }

                if (toolName === 'get_sales_chart_last_7_days') {
                    // Traemos las ventas de los ultimos 7 días
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    sevenDaysAgo.setHours(0,0,0,0);
                    
                    const { data } = await supabase.from('sales').select('amount, created_at').eq('company_id', companyId).gte('created_at', sevenDaysAgo.toISOString());
                    
                    // Agrupar por días
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

                    // QuickChart Chart
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
                            title: { display: true, text: 'Ventas Útimos 7 Días' },
                            legend: { display: false }
                        }
                    };

                    const encodedChart = encodeURIComponent(JSON.stringify(chartConfig));
                    photoUrlToReturn = `https://quickchart.io/chart?c=${encodedChart}&w=600&h=400&bkg=white`;
                    resultObj = { status: 'success', chart_generated: true, data_summary: salesByDay };
                }

                if (toolName === 'chat_with_user') {
                    // Respuesta conversacional directa, no necesita segunda llamada
                    return { text: args.response || '¡Hola! ¿En qué te puedo ayudar? 😊' };
                }

                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: toolName,
                    content: JSON.stringify(resultObj),
                });
            }

            // Llamar a la IA nuevamente con la respuesta de las tools
            const finalChat = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text },
                    responseMessage,
                    ...toolResults
                ] as any
            });

            return {
                text: finalChat.choices[0].message.content || 'Hubo un error construyendo la respuesta.',
                photoUrl: photoUrlToReturn
            };
        }

        // Si no llamó tools, es una respuesta normal o conversacional
        return {
            text: responseMessage.content || 'No sé cómo responder a eso 🤔'
        };

    } catch (error) {
        console.error('Error invoking LLM:', error);
        return { text: '¡Ups! Ha ocurrido un error interno consultando mis circuitos. 🤖💥' };
    }
}
