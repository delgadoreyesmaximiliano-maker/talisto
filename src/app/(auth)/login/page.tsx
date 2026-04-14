'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, BarChart3, Bot, Package, ShieldCheck } from 'lucide-react'

function translateAuthError(message: string): string {
    if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
    if (message.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de ingresar.'
    if (message.includes('User already registered')) return 'Este correo ya está registrado. Intenta iniciar sesión.'
    if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
    if (message.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.'
    return 'Ocurrió un error. Por favor intenta de nuevo.'
}

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(translateAuthError(error.message))
            setLoading(false)
        } else {
            router.push('/app')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-saas-bg" style={{ backgroundImage: 'radial-gradient(ellipse at 15% 15%, rgba(99,102,241,0.16) 0%, transparent 45%), radial-gradient(ellipse at 85% 85%, rgba(139,92,246,0.12) 0%, transparent 40%)' }}>

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

                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Bienvenido<br />de vuelta
                        </h1>
                        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                            Accede a tu dashboard y gestiona tu negocio de forma inteligente.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: BarChart3, label: 'Dashboard en tiempo real' },
                                { icon: Bot, label: 'Recomendaciones con IA' },
                                { icon: Package, label: 'Control de inventario' },
                                { icon: ShieldCheck, label: 'Datos seguros y protegidos' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-3 text-muted-foreground">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.20)' }}>
                                        <Icon className="w-4 h-4 text-primary" />
                                    </span>
                                    <span className="font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="flex flex-col justify-center">
                        <div className="rounded-2xl p-8" style={{ background: 'rgba(12,12,42,0.70)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                            <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Iniciar Sesión</h2>
                            <p className="text-sm text-muted-foreground mb-8">Ingresa tus credenciales para continuar</p>

                            <form onSubmit={handleLogin}>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Correo electrónico</Label>
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
                                        <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Contraseña</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="py-3 px-4 h-auto rounded-xl text-base text-foreground"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.20)' }}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Link href="/forgot-password" className="text-sm text-primary hover:opacity-80 font-medium transition-opacity">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>

                                    {error && (
                                        <div className="px-4 py-3 rounded-xl text-red-400 text-sm font-medium flex gap-2 items-start" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="btn-3d w-full py-4 h-auto font-bold rounded-xl text-base text-white border-0"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.30)' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Validando...' : 'Iniciar Sesión'}
                                    </Button>

                                    <div className="relative flex items-center justify-center my-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }} />
                                        </div>
                                        <span className="relative px-4 text-sm text-muted-foreground" style={{ background: 'rgba(12,12,42,0.70)' }}>o</span>
                                    </div>

                                    <div className="text-center">
                                        <Link href="/signup" className="text-sm text-primary hover:opacity-80 font-bold transition-opacity">
                                            ¿No tienes cuenta? Regístrate gratis
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
