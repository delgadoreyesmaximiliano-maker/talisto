/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Sparkles, Check, ShoppingCart, Store, Rocket, Utensils, Megaphone, Laptop, Factory, HeartPulse, GraduationCap, Globe, ArrowRight } from 'lucide-react'

const industries = [
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, color: 'emerald' },
    { id: 'retail', label: 'Retail / Comercio', icon: Store, color: 'emerald' },
    { id: 'saas', label: 'Software / SaaS', icon: Rocket, color: 'blue' },
    { id: 'restaurant', label: 'Restaurant / Alimentos', icon: Utensils, color: 'amber' },
    { id: 'marketing', label: 'Agencia Marketing', icon: Megaphone, color: 'purple' },
    { id: 'services', label: 'Servicios Prof.', icon: Laptop, color: 'slate' },
    { id: 'manufacturing', label: 'Manufactura', icon: Factory, color: 'slate' },
    { id: 'health', label: 'Salud / Bienestar', icon: HeartPulse, color: 'red' },
    { id: 'education', label: 'Educación', icon: GraduationCap, color: 'indigo' },
    { id: 'other', label: 'Otros Rubros', icon: Globe, color: 'slate' },
]

export default function CompanySetupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState(1)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const selectIndustry = (id: string) => {
        setFormData({ ...formData, industry: id })
    }

    const nextStep = () => {
        if (step === 1 && !formData.name) {
            setError('Ingresa el nombre de tu empresa')
            return
        }
        setError(null)
        setStep(2)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!formData.name || !formData.industry) {
            setError('Por favor completa todos los campos obligatorios')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const companyId = crypto.randomUUID()

            const { error: companyError } = await supabase
                .from('companies')
                .insert([
                    {
                        id: companyId,
                        name: formData.name,
                        industry: formData.industry as any,
                        plan: 'basic',
                        settings: {}
                    }
                ] as any)

            if (companyError) throw companyError

            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    company_id: companyId,
                    role: 'admin'
                } as any)

            if (userError) throw userError

            router.push('/app')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Error al crear la empresa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 max-w-4xl mx-auto w-full animate-in fade-in duration-700">
            {/* Steps Progress */}
            <div className="w-full max-w-md flex items-center justify-between mb-12">
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 text-slate-500'}`}>
                        {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>Empresa</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= 2 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 text-slate-500'}`}>
                        2
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>Rubro</span>
                </div>
            </div>

            <Card className="w-full border-none shadow-2xl bg-white rounded-[32px] overflow-hidden">
                <div className="grid md:grid-cols-5 min-h-[500px]">
                    {/* Left decor */}
                    <div className="md:col-span-2 bg-[#0F172A] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Configura<br />tu espacio</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">Solo unos segundos para que Talisto entienda cómo ayudarte de la mejor manera.</p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-emerald-400">
                                <Sparkles className="w-4 h-4" />
                                <span>IA Optimizada para tu rubro</span>
                            </div>
                        </div>
                    </div>

                    {/* Right form */}
                    <div className="md:col-span-3 p-8 md:p-12 bg-white">
                        {step === 1 ? (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>¿Cómo se llama tu negocio?</h3>
                                    <p className="text-slate-500 text-sm">Este nombre aparecerá en tus reportes y facturas.</p>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-slate-700 font-bold uppercase text-[10px] tracking-widest">Nombre de Empresa</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Tienda de Max, Consultora XYZ..."
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 text-lg font-medium"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 italic">⚠️ {error}</p>}
                                    <Button onClick={nextStep} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 group transition-all mt-4">
                                        Siguiente Paso
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>¿A qué se dedica?</h3>
                                    <p className="text-slate-500 text-sm">Personalizaremos tu dashboard y las recomendaciones de IA.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {industries.map((ind) => (
                                        <button
                                            key={ind.id}
                                            type="button"
                                            onClick={() => selectIndustry(ind.id)}
                                            className={`
                                                flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200
                                                ${formData.industry === ind.id
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10 scale-[0.98]'
                                                    : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'
                                                }
                                            `}
                                        >
                                            <div className={`p-2.5 rounded-xl ${formData.industry === ind.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm'}`}>
                                                <ind.icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight text-center leading-tight ${formData.industry === ind.id ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                {ind.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" onClick={() => setStep(1)} className="h-14 px-6 border-slate-200 text-slate-500 font-bold rounded-2x rounded-2xl hover:bg-slate-50">Atrás</Button>
                                    <Button
                                        onClick={handleSubmit}
                                        className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? 'Preparando todo...' : 'Finalizar Configuración'}
                                        {!loading && <Sparkles className="ml-2 w-4 h-4 fill-white" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <p className="mt-8 text-slate-400 text-xs font-medium">Estás a un paso de simplificar tu negocio.</p>
        </div>
    )
}
