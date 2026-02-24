'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Building2, Sparkles, Check, ShoppingCart, Store, Rocket, Utensils, Megaphone, Laptop, Factory, HeartPulse, GraduationCap, Globe, ArrowRight, Activity, Users2 } from 'lucide-react'

// Definición de las opciones dinámicas
const industries = [
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'retail', label: 'Retail / Comercio', icon: Store },
    { id: 'saas', label: 'Software / SaaS', icon: Rocket },
    { id: 'restaurant', label: 'Restaurant / Alimentos', icon: Utensils },
    { id: 'marketing', label: 'Agencia Marketing', icon: Megaphone },
    { id: 'services', label: 'Servicios Prof.', icon: Laptop },
    { id: 'manufacturing', label: 'Manufactura', icon: Factory },
    { id: 'health', label: 'Salud / Bienestar', icon: HeartPulse },
    { id: 'education', label: 'Educación', icon: GraduationCap },
    { id: 'other', label: 'Otros Rubros', icon: Globe },
]

const activityByIndustry: Record<string, { id: string, label: string }[]> = {
    restaurant: [
        { id: 'local', label: 'Venta solo en local' },
        { id: 'delivery', label: 'Principalmente Delivery' },
        { id: 'mixto', label: 'Local + Delivery' },
        { id: 'catering', label: 'Servicio de Catering' }
    ],
    ecommerce: [
        { id: 'propio', label: 'Tienda Online Propia' },
        { id: 'dropshipping', label: 'Dropshipping' },
        { id: 'marketplace', label: 'Venta en Marketplaces (MercadoLibre, Amazon)' }
    ],
    retail: [
        { id: 'fisico', label: 'Tienda Física' },
        { id: 'online', label: 'Principalmente Online' },
        { id: 'omnicanal', label: 'Omnicanal (Físico + Online)' }
    ],
    saas: [
        { id: 'b2b', label: 'B2B (Empresas)' },
        { id: 'b2c', label: 'B2C (Consumidor Final)' },
        { id: 'b2b2c', label: 'B2B2C' }
    ],
    services: [
        { id: 'consultoria', label: 'Consultoría' },
        { id: 'mantenimiento', label: 'Mantenimiento / Soporte' },
        { id: 'freelance', label: 'Profesional Independiente' }
    ],
    // Fallback genérico para los demás
    default: [
        { id: 'b2b', label: 'Venta a Empresas (B2B)' },
        { id: 'b2c', label: 'Venta a Consumidores (B2C)' },
        { id: 'distribucion', label: 'Distribución / Mayorista' }
    ]
}

const teamSizes = [
    { id: 'solo', label: 'Solo yo' },
    { id: '2_5', label: '2 a 5 personas' },
    { id: '6_20', label: '6 a 20 personas' },
    { id: 'mas_20', label: 'Más de 20 personas' }
]

export default function CompanySetupPage() {
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState(1)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        actividad: '',
        tamano_equipo: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.industry)) {
            setError('Ingresa el nombre y selecciona un rubro')
            return
        }
        if (step === 2 && !formData.actividad) {
            setError('Selecciona tu actividad principal')
            return
        }
        setError(null)
        setStep(step + 1)
    }

    const prevStep = () => {
        setError(null)
        setStep(step - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.tamano_equipo) {
            setError('Selecciona el tamaño de tu equipo')
            return
        }

        setLoading(true)
        setError(null)
        setLoadingMessage('Creando tu espacio de trabajo...')

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // 1. Crear empresa y usuario
            const companyId = crypto.randomUUID()
            const settings = {
                actividad: formData.actividad,
                tamano_equipo: formData.tamano_equipo,
                onboarding_completado: true
            }

            const { error: companyError } = await supabase
                .from('companies')
                .insert([
                    {
                        id: companyId,
                        name: formData.name,
                        industry: formData.industry,
                        plan: 'basic',
                        settings: settings
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

            // 2. Generar recomendaciones IA
            setLoadingMessage('Tali está analizando tu negocio...')

            // Refrescar la sesión auth localmente si es necesario
            await supabase.auth.refreshSession()

            const aiRes = await fetch('/api/onboarding/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId,
                    industry: formData.industry,
                    actividad: formData.actividad,
                    tamano_equipo: formData.tamano_equipo
                })
            })

            if (!aiRes.ok) {
                console.warn('AI Recommendations failed, but onboarding completed', await aiRes.text())
            }

            // 3. Redirigir
            setLoadingMessage('¡Todo listo! Redirigiendo...')
            router.push('/app')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Error al completar el proceso')
            setLoading(false)
        }
    }

    const currentActivities = activityByIndustry[formData.industry] || activityByIndustry.default

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 max-w-4xl mx-auto w-full animate-in fade-in duration-700">
            {/* Steps Progress */}
            <div className="w-full relative flex items-center justify-between mb-8 md:mb-12 max-w-2xl px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full" />
                <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((step - 1) / 2) * 100}%` }} />

                {[1, 2, 3].map((num) => (
                    <div key={num} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 
                            ${step > num ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                                step === num ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 ring-4 ring-slate-100' :
                                    'bg-white text-slate-400 border-2 border-slate-100'}`}>
                            {step > num ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : num}
                        </div>
                        <span className={`hidden md:block text-xs uppercase font-bold tracking-widest ${step >= num ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                            {num === 1 ? 'Empresa' : num === 2 ? 'Actividad' : 'Equipo'}
                        </span>
                    </div>
                ))}
            </div>

            <Card className="w-full border-none shadow-2xl bg-white rounded-[32px] overflow-hidden relative">

                {/* Loading State Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full border-t-emerald-500 animate-spin" />
                            <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {loadingMessage}
                        </h3>
                        <p className="text-slate-500 font-medium">Estamos configurando tu panel de control personalizado.</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-5 min-h-[500px]">
                    {/* Left decor */}
                    <div className="hidden lg:flex lg:col-span-2 bg-[#0F172A] p-10 text-white flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                                {step === 1 && <Building2 className="w-6 h-6 text-white" />}
                                {step === 2 && <Activity className="w-6 h-6 text-white" />}
                                {step === 3 && <Users2 className="w-6 h-6 text-white" />}
                            </div>
                            <h2 className="text-4xl font-extrabold mb-4 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {step === 1 && "Bienvenido a\nTalisto"}
                                {step === 2 && "Entendiendo\ntu modelo"}
                                {step === 3 && "Tu equipo de\ntrabajo"}
                            </h2>
                            <p className="text-slate-400 text-base leading-relaxed">
                                {step === 1 && "Dinos quién eres y a qué te dedicas para empezar."}
                                {step === 2 && "Las recomendaciones de IA variarán mucho dependiendo de tu formato de negocio."}
                                {step === 3 && "Adaptaremos la interfaz según si operas solo o con un equipo estructurado."}
                            </p>
                        </div>
                    </div>

                    {/* Right form */}
                    <div className="lg:col-span-3 p-6 md:p-10 bg-white flex flex-col">
                        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-2xl flex items-center gap-2">
                            ⚠️ {error}
                        </div>}

                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 lg:hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>Tu Negocio</h3>
                                    <Label htmlFor="name" className="text-slate-700 font-bold uppercase text-[11px] tracking-widest block">Nombre de la Empresa</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Ej: Tienda Max, Consultora XYZ"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-emerald-500/20 text-lg font-medium"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-4 flex-1">
                                    <Label className="text-slate-700 font-bold uppercase text-[11px] tracking-widest block">Rubro Principal</Label>
                                    <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                        {industries.map((ind) => (
                                            <button
                                                key={ind.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, industry: ind.id, actividad: '' })}
                                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${formData.industry === ind.id
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10 scale-[0.98]'
                                                    : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-xl ${formData.industry === ind.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm'}`}>
                                                    <ind.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-[11px] font-black uppercase tracking-tight text-center leading-tight ${formData.industry === ind.id ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                    {ind.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 mt-auto">
                                    <Button
                                        onClick={nextStep}
                                        disabled={!formData.name || !formData.industry}
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 group transition-all"
                                    >
                                        Siguiente Paso <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                                <div className="space-y-2 mb-4">
                                    <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>¿Cómo operas principalmente?</h3>
                                    <p className="text-slate-500 text-sm">Basado en que eres un negocio de {industries.find(i => i.id === formData.industry)?.label}</p>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {currentActivities.map((act) => (
                                        <label
                                            key={act.id}
                                            className={`
                                                flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                                                ${formData.actividad === act.label
                                                    ? 'border-emerald-500 bg-emerald-50/50'
                                                    : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            <div className="flex-1">
                                                <span className={`font-bold text-base ${formData.actividad === act.label ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                    {act.label}
                                                </span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.actividad === act.label ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                {formData.actividad === act.label && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="actividad"
                                                value={act.label}
                                                checked={formData.actividad === act.label}
                                                onChange={(e) => setFormData({ ...formData, actividad: e.target.value })}
                                                className="hidden"
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4 mt-auto">
                                    <Button variant="outline" onClick={prevStep} className="h-14 px-6 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50">Atrás</Button>
                                    <Button onClick={nextStep} disabled={!formData.actividad} className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 group">
                                        Continuar <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                                <div className="space-y-2 mb-4">
                                    <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>¿De qué tamaño es tu equipo?</h3>
                                    <p className="text-slate-500 text-sm">Nos ayuda a saber si necesitas módulos de colaboración.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                                    {teamSizes.map((size) => (
                                        <label
                                            key={size.id}
                                            className={`
                                                flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center
                                                ${formData.tamano_equipo === size.label
                                                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.98]'
                                                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            <span className={`font-bold text-sm ${formData.tamano_equipo === size.label ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                {size.label}
                                            </span>
                                            <input
                                                type="radio"
                                                name="tamano"
                                                value={size.label}
                                                checked={formData.tamano_equipo === size.label}
                                                onChange={(e) => setFormData({ ...formData, tamano_equipo: e.target.value })}
                                                className="hidden"
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4 mt-auto">
                                    <Button variant="outline" onClick={prevStep} className="h-14 px-6 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50">Atrás</Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!formData.tamano_equipo || loading}
                                        className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95 transition-all text-base"
                                    >
                                        Finalizar y Analizar <Sparkles className="ml-2 w-5 h-5 fill-white" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
