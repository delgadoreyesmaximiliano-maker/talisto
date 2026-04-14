import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { processAgentMessage, transcribeAudio } from '@/lib/telegram/ai-agent';

export const dynamic = 'force-dynamic';

// Lazy singleton — initialized inside request handlers to avoid build-time crashes
// when env vars are absent in the local build environment.
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

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegramMessage(chatId: string, text: string, photoUrl?: string) {
    if (photoUrl) {
        // Telegram caption limit is 1024 chars — truncate if needed
        const caption = text.length > 1000 ? text.slice(0, 997) + '...' : text;
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const payload = {
            chat_id: chatId,
            photo: photoUrl,
            caption,
            parse_mode: 'HTML'
        };
        try {
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const body = await res.json();
            if (!body.ok) {
                console.error('sendPhoto failed:', body.description, '| photo URL length:', photoUrl.length);
                // Fallback: send text + photo URL separately
                await sendTelegramMessage(chatId, text);
            }
        } catch (e) {
            console.error('sendPhoto error:', e);
            await sendTelegramMessage(chatId, text);
        }
        return;
    }

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
        
        const message = body?.message;
        if (!message || !message.chat?.id) {
            return NextResponse.json({ status: 'ok' });
        }

        const chatId = message.chat.id.toString();
        let text: string = '';

        if (message.voice) {
            // Process audio with Whisper
            text = await transcribeAudio(message.voice.file_id);
            if (!text || text.trim() === '') {
                await sendTelegramMessage(chatId, 'No pude transcribir tu mensaje de voz.');
                return NextResponse.json({ status: 'ok' });
            }
        } else if (message.text) {
            text = message.text.trim();
        } else {
            return NextResponse.json({ status: 'ok' });
        }

        // Si el usuario envía /start <code>
        if (text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const code = parts[1];
                // Intentar enlazar la cuenta
                const { data: pairingRecord } = await getSupabase()
                    .from('telegram_pairing_codes')
                    .select('company_id')
                    .eq('code', code)
                    .gt('expires_at', new Date().toISOString())
                    .single();

                if (pairingRecord) {
                    const companyId = pairingRecord.company_id;
                    
                    // Actualizar la compañía con el chatId
                    await getSupabase()
                        .from('companies')
                        .update({ telegram_chat_id: chatId })
                        .eq('id', companyId);

                    // Eliminar el código de emparejamiento para que no se use de nuevo
                    await getSupabase()
                        .from('telegram_pairing_codes')
                        .delete()
                        .eq('code', code);
                    
                    // Obtener nombre de la empresa
                    const { data: comp } = await getSupabase().from('companies').select('name').eq('id', companyId).single();

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
        const { data: company } = await getSupabase()
            .from('companies')
            .select('id, name')
            .eq('telegram_chat_id', chatId)
            .single();

        if (!company) {
            await sendTelegramMessage(chatId, `❌ Tu cuenta de Telegram no está vinculada a ninguna empresa.\nGenera un código de vinculación en tu panel de Talisto e inicia el bot con ese código.`);
            return NextResponse.json({ status: 'ok' });
        }

        // --- DELEGACIÓN DEL MENSAJE AL AGENTE IA (Groq/LLaMA + Whisper) ---
        const agentResponse = await processAgentMessage(text, company.id, company.name);
        await sendTelegramMessage(chatId, agentResponse.text, agentResponse.photoUrl);

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('[Telegram Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
