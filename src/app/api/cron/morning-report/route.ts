import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function sendTelegramMessage(token: string, chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const err = await response.text();
            console.error(`[CRON] Error Telegram para chat ${chatId}:`, err);
        }
    } catch (error) {
        console.error(`[CRON] Excepción Telegram para chat ${chatId}:`, error);
    }
}

export async function GET(request: Request) {
    // Security: CRON_SECRET is required
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
        console.error('[CRON morning-report] CRON_SECRET no está configurado - endpoint bloqueado')
        return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        console.warn('[CRON morning-report] Intento de acceso no autorizado')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Usar service_role_key para bypass RLS ya que es un cron (no hay usuario logueado)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Extraer empresas con Telegram con su chat ID
        const { data: companies, error: compError } = await supabase
            .from('companies')
            .select('*')
            .not('telegram_chat_id', 'is', null)
            .not('telegram_chat_id', 'eq', '');

        if (compError) {
            console.error('[CRON] Error obteniendo empresas:', compError);
            return NextResponse.json({ error: 'Error DB' }, { status: 500 });
        }

        if (!companies || companies.length === 0) {
            return NextResponse.json({ status: 'No companies configured', enviados: 0 });
        }

        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        let mensajesEnviados = 0;

        // 3. Procesar cada empresa
        for (const company of companies) {
            const chatId = company.telegram_chat_id;

            if (!chatId) {
                console.log(`[CRON] Empresa ${company.id} no tiene telegram_chat_id asociado.`);
                continue;
            }

            // Calcular ventas de ayer
            const { data: salesAyer } = await supabase
                .from('sales')
                .select('amount')
                .eq('company_id', company.id)
                .gte('created_at', yesterdayStart.toISOString())
                .lte('created_at', yesterdayEnd.toISOString());
            
            const totalVentasAyer = (salesAyer || []).reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
            const cantVentasAyer = (salesAyer || []).length;

            // Obtener stock crítico (mismo que webhook)
            const { data: allProducts } = await supabase
                .from('products')
                .select('id, name, stock_current, stock_minimum')
                .eq('company_id', company.id);
            
            const criticalProducts = (allProducts || []).filter((p: any) => p.stock_current <= p.stock_minimum);

            // 4. Formatear y Enviar por Telegram
            let mensaje = `☀️ *Buenos días de parte de Tali* ☀️\n\nAquí tienes tu reporte matutino de *${company.name}*:\n\n`;
            mensaje += `📊 *Resumen de ayer:*\n`;
            mensaje += `- Total ventas: $${totalVentasAyer.toLocaleString('es-CL')}\n`;
            mensaje += `- Transacciones: ${cantVentasAyer}\n\n`;

            if (criticalProducts.length > 0) {
                mensaje += `⚠️ *Alerta de Inventario:*\n`;
                mensaje += `Tienes *${criticalProducts.length}* productos con stock crítico.\n`;
                mensaje += `_Escríbeme "sí" para ver el detalle y sugerir pedidos a proveedores._\n`;
            } else {
                mensaje += `✅ *Inventario:*\n`;
                mensaje += `Tu stock está saludable, sin productos bajo el mínimo.\n`;
            }

            mensaje += `\n¡Que tengas un excelente día de ventas! 🚀`;

            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken) {
                await sendTelegramMessage(botToken, chatId, mensaje);
            } else {
                console.error('[CRON] TELEGRAM_BOT_TOKEN no está definido en .env');
            }
            mensajesEnviados++;
        }

        return NextResponse.json({ status: 'Reportes matutinos enviados', enviados: mensajesEnviados });
    } catch (error) {
        console.error('[CRON] Error general:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
