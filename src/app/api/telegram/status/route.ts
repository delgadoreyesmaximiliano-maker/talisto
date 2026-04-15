import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return NextResponse.json({
            configured: false,
            webhook_set: false,
            error: 'TELEGRAM_BOT_TOKEN no esta configurado en el servidor',
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
    // Register webhook - authenticated users only
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
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
