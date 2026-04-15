import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resend, getTrialWarningEmailHtml } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Security: CRON_SECRET is required
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON trial-warnings] CRON_SECRET no está configurado - endpoint bloqueado')
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }
  
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[CRON trial-warnings] Intento de acceso no autorizado')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Usar service_role_key para bypass RLS ya que es un cron (no hay usuario logueado)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calcular las fechas objetivo: hoy + 7, hoy + 3, hoy + 1
    const targetDays = [7, 3, 1]
    const targetDates = targetDays.map(days => {
      const d = new Date(today)
      d.setDate(d.getDate() + days)
      return { days, date: d.toISOString().split('T')[0] }
    })

    let emailsEnviados = 0

    for (const { days, date } of targetDates) {
      // Buscar companies cuyo trial_ends_at cae exactamente en esa fecha
      const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('id, name, trial_ends_at')
        .gte('trial_ends_at', `${date}T00:00:00.000Z`)
        .lt('trial_ends_at', `${date}T23:59:59.999Z`)

      if (compError) {
        console.error(`[CRON trial-warnings] Error obteniendo companies para ${date}:`, compError)
        continue
      }

      if (!companies || companies.length === 0) continue

      for (const company of companies) {
        // Buscar el primer usuario admin de la empresa
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('email, name')
          .eq('company_id', company.id)
          .limit(1)

        if (userError || !users || users.length === 0) {
          console.error(`[CRON trial-warnings] No se encontró usuario para company ${company.id}:`, userError)
          continue
        }

        const user = users[0]
        const userName = user.name || user.email.split('@')[0]

        const { error: emailError } = await resend.emails.send({
          from: 'Talisto <hola@talisto.vercel.app>',
          to: user.email,
          subject: `⏰ Tu prueba de Talisto vence en ${days} día${days !== 1 ? 's' : ''}`,
          html: getTrialWarningEmailHtml(userName, days, company.name),
        })

        if (emailError) {
          console.error(`[CRON trial-warnings] Error enviando email a ${user.email}:`, emailError)
          continue
        }

        console.log(`[CRON trial-warnings] Email enviado a ${user.email} (company: ${company.name}, días restantes: ${days})`)
        emailsEnviados++
      }
    }

    return NextResponse.json({ status: 'Trial warnings enviados', enviados: emailsEnviados })
  } catch (error) {
    console.error('[CRON trial-warnings] Error general:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
