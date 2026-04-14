'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, CheckCircle2, Zap } from 'lucide-react'

function translateAuthError(message: string): string {
    if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
    if (message.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de ingresar.'
    if (message.includes('User already registered')) return 'Este correo ya está registrado. Intenta iniciar sesión.'
    if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
    if (message.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.'
    return 'Ocurrió un error. Por favor intenta de nuevo.'
}

function SignupForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedPlan = searchParams.get('plan')
    const planLabel: Record<string, string> = { basico: 'Plan Básico', pro: 'Plan Pro' }
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback` },
        })

        if (error) {
            setError(translateAuthError(error.message))
            setLoading(false)
        } else {
            fetch('/api/email/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name: email.split('@')[0] }),
            }).catch(() => {})
            router.push('/app')
            router.refresh()
        }
    }

    return (
        <div className="flex flex-col justify-center">
            <div className="rounded-2xl p-8" style={{ background: 'rgba(12,12,42,0.70)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Crear Cuenta</h2>
                {selectedPlan && planLabel[selectedPlan] ? (
                    <p className="text-sm text-muted-foreground mb-4">
                        Registrándote en{' '}
                        <span className="font-bold text-primary">{planLabel[selectedPlan]}</span>
                        {' '}— prueba gratuita de 14 días.
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground mb-4">Comienza tu prueba gratuita de 14 días hoy mismo.</p>
                )}

                <form onSubmit={handleSignup}>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Correo electrónico corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="py-3 px-4 h-auto rounded-xl text-base text-foreground"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.20)' }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Contraseña segura</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="8+ caracteres recomendados"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="py-3 px-4 h-auto rounded-xl text-base text-foreground"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.20)' }}
                            />
                        </div>

                        {/* Incluido box */}
                        <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.20)' }}>
                                    <Zap className="w-3 h-3 text-primary fill-primary" />
                                </div>
                                <span className="font-bold text-primary text-xs tracking-widest uppercase">TODO INCLUIDO</span>
                            </div>
                            <ul className="space-y-2">
                                {['CRM y Gestión de Clientes', 'Control Integrado de Inventario', 'Recomendaciones Inteligentes con IA'].map(item => (
                                    <li key={item} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                        <span className="text-sm text-foreground/80 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />
                            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                                Acepto los{' '}
                                <Link href="/legal/terms" target="_blank" className="underline hover:text-foreground transition-colors">
                                    Términos de Servicio
                                </Link>{' '}
                                y la{' '}
                                <Link href="/legal/privacy" target="_blank" className="underline hover:text-foreground transition-colors">
                                    Política de Privacidad
                                </Link>
                            </label>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl text-red-400 text-sm font-medium flex gap-2 items-start" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="btn-3d w-full py-4 h-auto font-bold rounded-xl text-base text-white border-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.30)' }}
                            disabled={loading || !acceptedTerms}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear mi Cuenta Gratis'}
                        </Button>

                        <div className="text-center pt-1">
                            <p className="text-sm text-muted-foreground">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="text-primary hover:opacity-80 font-semibold transition-opacity">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-saas-bg" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.16) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 40%)' }}>

            <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* Left — Hero */}
                    <div className="flex flex-col justify-center">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <Zap className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight gradient-text" style={{ fontFamily: "'Poppins', sans-serif" }}>TALISTO</span>
                        </Link>

                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Únete al futuro<br />del <span className="gradient-text">comercio</span>
                        </h1>
                        <p className="text-lg text-white/70 mb-10 leading-relaxed">
                            Potencia tu negocio con las herramientas que usan las empresas líderes. Sin tarjetas de crédito, sin complicaciones.
                        </p>

                        {/* Testimonial */}
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.16)' }}>
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
                            </div>
                            <p className="text-white/70 italic leading-relaxed mb-4 text-sm">
                                &quot;Talisto ha unificado todas nuestras operaciones en un solo lugar. La integración de IA nos ahorra horas cada semana.&quot;
                            </p>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">— María S., Directora Comercial</p>
                        </div>
                    </div>

                    {/* Right — Form Container with Suspense */}
                    <Suspense fallback={<div className="text-white text-center">Cargando formulario...</div>}>
                        <SignupForm />
                    </Suspense>
                    
                </div>
            </div>
        </div>
    )
}
