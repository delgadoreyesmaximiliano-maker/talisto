import { NextResponse } from 'next/server'
import { resend, getWelcomeEmailHtml } from '@/lib/email/resend'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() { },
        remove() { },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
