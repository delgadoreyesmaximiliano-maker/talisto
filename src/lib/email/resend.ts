import { Resend } from 'resend'

// Lazy singleton: only initialized when first used (at runtime), not at build time.
let _resend: Resend | null = null
function getResend(): Resend {
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
    return _resend
}

export { getResend as resend_client }
// Keep backwards-compatible named export used by route handlers
export const resend = { emails: { send: (...args: Parameters<Resend['emails']['send']>) => getResend().emails.send(...args) } }

// Colores del tema
const FOREST = '#102c26'
const CREAM = '#f7e7ce'
const BG = '#091a17'
const MUTED = '#8aab9f'

export function getWelcomeEmailHtml(userName: string, trialDays = 14): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:${FOREST};border-radius:16px;overflow:hidden;border:1px solid #1c3d35;">
    <div style="background:${BG};padding:32px 40px;text-align:center;border-bottom:1px solid #1c3d35;">
      <span style="color:${CREAM};font-size:24px;font-weight:800;letter-spacing:-0.5px;">TALISTO</span>
      <span style="display:block;color:${MUTED};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Premium v2.0</span>
    </div>
    <div style="padding:40px;">
      <h1 style="color:${CREAM};font-size:22px;font-weight:700;margin:0 0 12px;">¡Bienvenido a Talisto, ${userName}!</h1>
      <p style="color:${MUTED};font-size:15px;line-height:1.7;margin:0 0 24px;">Tu prueba gratuita de <strong style="color:${CREAM};">${trialDays} días</strong> ya está activa. Tienes acceso completo a todas las funciones.</p>
      <div style="background:${BG};border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #1c3d35;">
        <p style="color:${CREAM};font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Lo que puedes hacer:</p>
        ${['📊 Dashboard con métricas en tiempo real', '📦 Gestionar inventario y stock', '👥 CRM para tus clientes', '🤖 Asistente CFO con IA'].map(item => `<p style="color:${MUTED};font-size:14px;margin:6px 0;">${item}</p>`).join('')}
      </div>
      <a href="https://talisto.vercel.app/app" style="display:block;background:${CREAM};color:${BG};text-align:center;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:24px;">Ir a mi Dashboard →</a>
      <p style="color:${MUTED};font-size:13px;line-height:1.6;margin:0;">¿Tienes dudas? Responde este email y te ayudamos.</p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #1c3d35;text-align:center;">
      <p style="color:${MUTED};font-size:12px;margin:0;">Talisto SpA · Chile · <a href="https://talisto.vercel.app/legal/privacy" style="color:${MUTED};">Privacidad</a></p>
    </div>
  </div>
</body>
</html>`
}

export function getTrialWarningEmailHtml(userName: string, daysLeft: number, companyName: string): string {
  const urgent = daysLeft <= 3
  const accentColor = urgent ? '#ef4444' : '#f59e0b'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:${FOREST};border-radius:16px;overflow:hidden;border:1px solid #1c3d35;">
    <div style="background:${BG};padding:32px 40px;text-align:center;border-bottom:1px solid #1c3d35;">
      <span style="color:${CREAM};font-size:24px;font-weight:800;letter-spacing:-0.5px;">TALISTO</span>
    </div>
    <div style="padding:40px;">
      <div style="background:${accentColor}18;border:1px solid ${accentColor}40;border-radius:10px;padding:16px;margin-bottom:24px;text-align:center;">
        <span style="color:${accentColor};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">⏰ Tu prueba ${urgent ? 'vence pronto' : 'está por vencer'}</span>
      </div>
      <h1 style="color:${CREAM};font-size:20px;font-weight:700;margin:0 0 12px;">Hola ${userName}, te quedan <span style="color:${accentColor};">${daysLeft} día${daysLeft !== 1 ? 's' : ''}</span></h1>
      <p style="color:${MUTED};font-size:15px;line-height:1.7;margin:0 0 24px;">Tu prueba gratuita de <strong style="color:${CREAM};">${companyName}</strong> en Talisto termina en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}. Para seguir usando la plataforma, activa tu plan.</p>
      <a href="https://talisto.vercel.app/pricing" style="display:block;background:${CREAM};color:${BG};text-align:center;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:16px;">Ver Planes y Precios →</a>
      <a href="https://talisto.vercel.app/app" style="display:block;background:transparent;color:${CREAM};text-align:center;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;border:1px solid #1c3d35;margin-bottom:24px;">Volver al Dashboard</a>
      <p style="color:${MUTED};font-size:13px;line-height:1.6;margin:0;">¿Tienes preguntas sobre los planes? Responde este email.</p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #1c3d35;text-align:center;">
      <p style="color:${MUTED};font-size:12px;margin:0;">Talisto SpA · Chile · <a href="https://talisto.vercel.app/legal/privacy" style="color:${MUTED};">Privacidad</a></p>
    </div>
  </div>
</body>
</html>`
}
