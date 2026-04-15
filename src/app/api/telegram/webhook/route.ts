import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { processAgentMessage, transcribeAudio } from '@/lib/telegram/ai-agent';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const TELEGRAM_IPS = [
    '149.154.160.0/22',
    '91.108.4.0/22',
    '91.108.8.0/22',
    '91.108.12.0/22',
    '91.108.16.0/22',
    '91.108.20.0/22',
    '91.108.24.0/22',
    '91.108.28.0/22'
];

function isValidTelegramIP(ip: string): boolean {
    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4) return false;
    
    return TELEGRAM_IPS.some(range => {
        const [base, bits] = range.split('/');
        const baseParts = base.split('.').map(Number);
        const prefixLen = parseInt(bits);
        
        for (let i = 0; i < 4; i++) {
            const bitsInOctet = Math.min(8, Math.max(0, prefixLen - i * 8));
            const mask = bitsInOctet === 8 ? 255 : (256 - (1 << (8 - bitsInOctet)));
            if ((ipParts[i] & mask) !== (baseParts[i] & mask)) return false;
        }
        return true;
    });
}

function verifySecret(secret: string | null): boolean {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!expected) {
        console.warn('[Telegram webhook] TELEGRAM_WEBHOOK_SECRET no configurado');
        return false;
    }
    return secret === expected;
}

// Lazy singleton — initialized inside request handlers to avoid build-time crashes
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

async function sendTelegramMessage(chatId: string, text: string, photoUrl?: string, botToken?: string) {
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    if (!token) {
        console.error('[Telegram] No token available');
        return;
    }
    
    if (photoUrl) {
        // Telegram caption limit is 1024 chars — truncate if needed
        const caption = text.length > 1000 ? text.slice(0, 997) + '...' : text;
        const url = `https://api.telegram.org/bot${token}/sendPhoto`;
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

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
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
        // Security: Verify request is from Telegram servers
        const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || request.headers.get('cf-connecting-ip')
            || request.headers.get('x-real-ip')
            || '';
        
        // Verify secret first
        const secretHeader = request.headers.get('x-telegram-secret');
        if (!verifySecret(secretHeader)) {
            console.warn('[Telegram webhook] Solicitud con secret inválido o ausente:', clientIP);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify IP is from Telegram
        if (!isValidTelegramIP(clientIP) && clientIP !== '') {
            console.warn('[Telegram webhook] IP no permitida:', clientIP);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const { success: rateOk } = await rateLimit.limit(clientIP || 'unknown');
        if (!rateOk) {
            console.warn('[Telegram webhook] Rate limit excedido:', clientIP);
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

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

        // Obtener bot token según el chat_id
        const { data: companyData } = await getSupabase()
            .from('companies')
            .select('id, name, telegram_bot_token')
            .eq('telegram_chat_id', chatId)
            .maybeSingle();
        
        const botToken = companyData?.telegram_bot_token;

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

                    await sendTelegramMessage(chatId, `✅ <b>¡Cuenta Enlazada!</b>\n\nTu número ahora está vinculado con la empresa <b>${comp?.name || 'Talisto'}</b>.\n\nPuedes usar comandos como:\n/sales - Ventas de hoy\n/critical - Stock crítico`, undefined, botToken);
                } else {
                    await sendTelegramMessage(chatId, `❌ El código de enlace es inválido o ha expirado. Por favor genera uno nuevo desde Talisto.`, undefined, botToken);
                }
            } else {
                await sendTelegramMessage(chatId, `👋 <b>¡Hola! Soy TaliBot.</b>\n\nPara vincular tu cuenta, por favor presiona el botón "Conectar Telegram" dentro de tu panel en Talisto.`, undefined, botToken);
            }
            return NextResponse.json({ status: 'ok' });
        }

        // Comprobar si este chat_id está autorizado
        const { data: company } = await getSupabase()
            .from('companies')
            .select('id, name, telegram_bot_token')
            .eq('telegram_chat_id', chatId)
            .single();

        if (!company) {
            await sendTelegramMessage(chatId, `❌ Tu cuenta de Telegram no está vinculada a ninguna empresa.\nGenera un código de vinculación en tu panel de Talisto e inicia el bot con ese código.`, undefined, botToken);
            return NextResponse.json({ status: 'ok' });
        }

        // --- DELEGACIÓN DEL MENSAJE AL AGENTE IA (Groq/LLaMA + Whisper) ---
        const agentResponse = await processAgentMessage(text, company.id, company.name, company.telegram_bot_token);
        await sendTelegramMessage(chatId, agentResponse.text, agentResponse.photoUrl, botToken);

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('[Telegram Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
