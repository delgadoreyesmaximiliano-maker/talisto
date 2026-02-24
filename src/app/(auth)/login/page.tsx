'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Zap, BarChart3, Bot, Package, ShieldCheck } from 'lucide-react'

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

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/app')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 md:bg-white flex items-center justify-center relative overflow-hidden">
            {/* Desktop Left Background Split */}
            <div className="absolute top-0 left-0 w-full md:w-1/2 h-full bg-gradient-to-br from-slate-900 to-slate-800 z-0" />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-8 md:px-8 md:py-16">
                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* Left Column (Hero Text) */}
                    <div className="text-white flex flex-col justify-center">
                        <Link href="/" className="inline-flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Zap className="w-6 h-6 text-white fill-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>TALISTO</span>
                        </Link>

                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Bienvenido de vuelta
                        </h1>

                        <p className="text-lg text-gray-300 mb-8 leading-relaxed font-medium">
                            Accede a tu dashboard y gestiona tu negocio de forma inteligente.
                        </p>

                        <div className="space-y-5 mt-4">
                            <div className="flex items-center gap-4 text-gray-200 text-lg font-medium">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <BarChart3 className="w-4 h-4" />
                                </span>
                                Dashboard en tiempo real
                            </div>
                            <div className="flex items-center gap-4 text-gray-200 text-lg font-medium">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Bot className="w-4 h-4" />
                                </span>
                                Recomendaciones con IA
                            </div>
                            <div className="flex items-center gap-4 text-gray-200 text-lg font-medium">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Package className="w-4 h-4" />
                                </span>
                                Control de inventario
                            </div>
                            <div className="flex items-center gap-4 text-gray-200 text-lg font-medium">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </span>
                                Datos seguros y protegidos
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Form) */}
                    <div className="flex flex-col justify-center">
                        <Card className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border-none">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Iniciar Sesión</h2>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Correo electrónico</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="ejemplo@empresa.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="py-3 px-4 h-auto rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base text-slate-900"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Contraseña</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="py-3 px-4 h-auto rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base text-slate-900"
                                        />
                                    </div>

                                    <div className="flex justify-end mb-6">
                                        <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>

                                    {error && (
                                        <div className="px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex gap-2">
                                            <span>⚠️</span>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full py-4 h-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-base shadow-lg shadow-emerald-500/20"
                                        disabled={loading}
                                    >
                                        {loading ? 'Validando...' : 'Iniciar Sesión'}
                                    </Button>

                                    <div className="my-6 relative flex items-center justify-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <span className="relative z-10 bg-white px-4 text-sm text-slate-400">
                                            o
                                        </span>
                                    </div>

                                    <div className="text-center">
                                        <Link href="/signup" className="block text-center text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                                            ¿No tienes cuenta? Regístrate
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}
