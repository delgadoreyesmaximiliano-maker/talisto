import { NextResponse } from 'next/server'
import { resend, getWelcomeEmailHtml } from '@/lib/email/resend'

export async function POST(request: Request) {
  const { email, name } = await request.json()
  if (!email || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { error } = await resend.emails.send({
    from: 'Talisto <hola@talisto.vercel.app>',
    to: email,
    subject: '¡Bienvenido a Talisto! Tu prueba de 14 días está activa 🚀',
    html: getWelcomeEmailHtml(name),
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
