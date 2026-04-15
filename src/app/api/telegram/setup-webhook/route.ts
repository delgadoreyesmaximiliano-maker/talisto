import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Protect with CRON_SECRET or a simple bearer token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    // Use NEXT_PUBLIC_APP_URL or VERCEL_PROJECT_PRODUCTION_URL to build the webhook URL
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : null);

    if (!appUrl) {
        return NextResponse.json(
            { error: 'NEXT_PUBLIC_APP_URL or VERCEL_PROJECT_PRODUCTION_URL not set' },
            { status: 500 }
        );
    }

    const webhookUrl = `${appUrl}/api/telegram/webhook`;

    try {
        // First, get current webhook info
        const infoRes = await fetch(
            `https://api.telegram.org/bot${botToken}/getWebhookInfo`
        );
        const infoData = await infoRes.json();

        // Set the webhook
        const setRes = await fetch(
            `https://api.telegram.org/bot${botToken}/setWebhook`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: webhookUrl,
                    allowed_updates: ['message'],
                }),
            }
        );
        const setData = await setRes.json();

        return NextResponse.json({
            success: setData.ok,
            webhook_url: webhookUrl,
            telegram_response: setData,
            previous_webhook: infoData.result?.url || '(none)',
        });
    } catch (error) {
        console.error('[Telegram Setup] Error setting webhook:', error);
        return NextResponse.json(
            { error: 'Failed to set webhook', details: String(error) },
            { status: 500 }
        );
    }
}
