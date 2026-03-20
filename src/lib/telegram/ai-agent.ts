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
    const systemPrompt = `Eres Tali, el asistente virtual inteligente de la empresa "${companyName}". 
Tu trabajo es ayudar al dueño/administrador con información de su negocio (ventas, stock) de forma muy natural, amigable, concisa y usando emojis.
Respetas el tono de un asistente senior, proactivo. NUNCA respondas con código ni estructuras extrañas. Simplemente habla como un amigo o un consultor contable amable.
Si el usuario te envía un audio, esta entrada es la transcripción de su audio.`;

    // Herramientas que la IA puede decidir llamar
    const tools: any[] = [
        {
            type: "function",
            function: {
                name: "get_sales_today",
                description: "Obtiene el total de ventas y la cantidad de transacciones del día de hoy.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_critical_stock",
                description: "Busca los productos que están por debajo o igual a su stock mínimo, es decir, están escasos.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "add_sale",
                description: "Registra una venta rápida de un producto indicando su nombre (aproximado) y la cantidad o precio total pagado. Si no indica un producto específico, busca genérico o usa 'Venta rápida'.",
                parameters: {
                    type: "object",
                    properties: {
                        product_name: { type: "string", description: "Nombre del producto vendido o servicio (ej: empanada, reparación, venta general)" },
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
                description: "Obtiene una URL con un gráfico de imagen (PNG) que muestra las ventas de los últimos 7 días. Usa esta herramienta si el usuario pide ver un gráfico o cómo van las ventas gráficamente.",
                parameters: { type: "object", properties: {}, required: [] }
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
            tool_choice: "auto",
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
