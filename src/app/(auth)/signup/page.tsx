'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Star, CheckCircle2, Zap } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
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

                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Únete al futuro del <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">comercio</span>
                        </h1>

                        <p className="text-lg text-gray-300 mb-8 leading-relaxed font-medium">
                            Potencia tu negocio con las herramientas que usan las empresas líderes. Sin tarjetas de crédito, sin complicaciones.
                        </p>

                        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />)}
                            </div>
                            <p className="text-gray-200 italic leading-relaxed mb-4">
                                "Talisto ha unificado todas nuestras operaciones en un solo lugar. La integración de IA nos ahorra horas cada semana."
                            </p>
                            <p className="text-sm font-bold text-white uppercase tracking-widest">— María S., Directora Comercial</p>
                        </div>
                    </div>

                    {/* Right Column (Form) */}
                    <div className="flex flex-col justify-center">
                        <Card className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border-none">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Crear Cuenta</h2>
                                <p className="text-sm text-gray-600 mb-6">Comienza tu prueba gratuita de 14 días hoy mismo.</p>
                            </div>

                            <form onSubmit={handleSignup}>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Correo electrónico corporativo</Label>
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
                                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Contraseña segura</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="8+ caracteres recomendados"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="py-3 px-4 h-auto rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-base text-slate-900"
                                        />
                                    </div>

                                    {/* TODO INCLUIDO Box */}
                                    <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-lg mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                                            </div>
                                            <span className="font-bold text-emerald-800 text-sm tracking-wide">TODO INCLUIDO</span>
                                        </div>
                                        <ul className="space-y-2.5">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-sm text-emerald-700 font-medium">CRM y Gestión de Clientes</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-sm text-emerald-700 font-medium">Control Integrado de Inventario</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-sm text-emerald-700 font-medium">Recomendaciones Inteligentes con IA</span>
                                            </li>
                                        </ul>
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
                                        {loading ? 'Creando cuenta...' : 'Crear mi Cuenta'}
                                    </Button>

                                    <div className="text-center pt-2">
                                        <p className="text-sm text-slate-500">
                                            ¿Ya tienes cuenta?{' '}
                                            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                                                Inicia Sesión
                                            </Link>
                                        </p>
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
