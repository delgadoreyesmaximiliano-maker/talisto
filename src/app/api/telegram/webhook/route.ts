import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegramMessage(chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML' // Usaremos HTML para formatear
    };

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error(`[Webhook] Error sending to ${chatId}:`, error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Formato estándar de un mensaje de Telegram
        const message = body?.message;
        if (!message || !message.text) {
            return NextResponse.json({ status: 'ok' });
        }

        const chatId = message.chat.id.toString();
        const text: string = message.text.trim();

        // Si el usuario envía /start <code>
        if (text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const code = parts[1];
                // Intentar enlazar la cuenta
                const { data: pairingRecord } = await supabase
                    .from('telegram_pairing_codes')
                    .select('company_id')
                    .eq('code', code)
                    .gt('expires_at', new Date().toISOString())
                    .single();

                if (pairingRecord) {
                    const companyId = pairingRecord.company_id;
                    
                    // Actualizar la compañía con el chatId
                    await supabase
                        .from('companies')
                        .update({ telegram_chat_id: chatId })
                        .eq('id', companyId);
                    
                    // Eliminar el código de emparejamiento para que no se use de nuevo
                    await supabase
                        .from('telegram_pairing_codes')
                        .delete()
                        .eq('code', code);
                    
                    // Obtener nombre de la empresa
                    const { data: comp } = await supabase.from('companies').select('name').eq('id', companyId).single();

                    await sendTelegramMessage(chatId, `✅ <b>¡Cuenta Enlazada!</b>\n\nTu número ahora está vinculado con la empresa <b>${comp?.name || 'Talisto'}</b>.\n\nPuedes usar comandos como:\n/sales - Ventas de hoy\n/critical - Stock crítico`);
                } else {
                    await sendTelegramMessage(chatId, `❌ El código de enlace es inválido o ha expirado. Por favor genera uno nuevo desde Talisto.`);
                }
            } else {
                await sendTelegramMessage(chatId, `👋 <b>¡Hola! Soy TaliBot.</b>\n\nPara vincular tu cuenta, por favor presiona el botón "Conectar Telegram" dentro de tu panel en Talisto.`);
            }
            return NextResponse.json({ status: 'ok' });
        }

        // Comprobar si este chat_id está autorizado
        const { data: company } = await supabase
            .from('companies')
            .select('id, name')
            .eq('telegram_chat_id', chatId)
            .single();

        if (!company) {
            await sendTelegramMessage(chatId, `❌ Tu cuenta de Telegram no está vinculada a ninguna empresa.\nGenera un código de vinculación en tu panel de Talisto e inicia el bot con ese código.`);
            return NextResponse.json({ status: 'ok' });
        }

        const companyId = company.id;

        // Comandos de lectura interactiva
        if (text.startsWith('/sales')) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const { data: salesAyer } = await supabase
                .from('sales')
                .select('amount')
                .eq('company_id', companyId)
                .gte('created_at', todayStart.toISOString())
                .lte('created_at', todayEnd.toISOString());

            const totalVentasAyer = (salesAyer || []).reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
            const cantVentasAyer = (salesAyer || []).length;

            await sendTelegramMessage(chatId, `📊 <b>Ventas de Hoy (${company.name}):</b>\n\n- Transacciones: ${cantVentasAyer}\n- Total Recaudado: $${totalVentasAyer.toLocaleString('es-CL')}`);
        
        } else if (text.startsWith('/critical')) {
            const { data: allProducts } = await supabase
                .from('products')
                .select('name, stock_current, stock_minimum')
                .eq('company_id', companyId);
            
            const criticalProducts = (allProducts || []).filter((p: any) => p.stock_current <= p.stock_minimum);

            if (criticalProducts.length > 0) {
                let msg = `⚠️ <b>Productos en Stock Crítico:</b>\n\n`;
                criticalProducts.forEach((p: any) => {
                    msg += `- ${p.name}: ${p.stock_current} (Min: ${p.stock_minimum})\n`;
                });
                await sendTelegramMessage(chatId, msg);
            } else {
                await sendTelegramMessage(chatId, `✅ <b>Inventario Saludable</b>\nNo tienes productos por debajo del stock mínimo.`);
            }
        } else {
            await sendTelegramMessage(chatId, `🤖 No reconozco ese comando.\n\n<b>Comandos disponibles:</b>\n/sales - Ventas de hoy\n/critical - Stock crítico`);
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('[Telegram Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
