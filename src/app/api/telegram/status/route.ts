import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Resolve the bot token: prefer per-company token, fall back to env var. */
async function resolveBotToken(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string | null> {
    const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

    if ((profile as any)?.company_id) {
        const { data: company } = await supabase
            .from('companies')
            .select('telegram_bot_token')
            .eq('id', (profile as any).company_id)
            .single();

        if ((company as any)?.telegram_bot_token) {
            return (company as any).telegram_bot_token;
        }
    }

    return process.env.TELEGRAM_BOT_TOKEN || null;
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const botToken = await resolveBotToken(supabase, user.id);
    if (!botToken) {
        return NextResponse.json({
            configured: false,
            webhook_set: false,
            error: 'No hay token de bot configurado. Pega tu token de @BotFather en la sección de Telegram.',
        });
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const data = await res.json();

        if (!data.ok) {
            return NextResponse.json({
                configured: true,
                webhook_set: false,
                error: 'Token invalido o bot no existe',
                telegram_error: data.description,
            });
        }

        const info = data.result;
        return NextResponse.json({
            configured: true,
            webhook_set: !!info.url,
            webhook_url: info.url || null,
            pending_update_count: info.pending_update_count,
            last_error_date: info.last_error_date
                ? new Date(info.last_error_date * 1000).toISOString()
                : null,
            last_error_message: info.last_error_message || null,
        });
    } catch (error) {
        return NextResponse.json(
            { configured: true, webhook_set: false, error: String(error) },
            { status: 500 }
        );
    }
}

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const botToken = await resolveBotToken(supabase, user.id);
    if (!botToken) {
        return NextResponse.json({ error: 'No hay token de bot configurado' }, { status: 500 });
    }

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : null);

    if (!appUrl) {
        return NextResponse.json({ error: 'APP URL not configured' }, { status: 500 });
    }

    const webhookUrl = `${appUrl}/api/telegram/webhook`;

    try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message'] }),
        });
        const data = await res.json();

        return NextResponse.json({
            success: data.ok,
            webhook_url: webhookUrl,
            telegram_response: data,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
