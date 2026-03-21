'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Package, Users, Bot, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react'

const STORAGE_KEY = 'talisto_onboarding_done'

interface Step {
    icon: React.ReactNode
    title: string
    description: string
    detail: string
    accentColor: string
}

const STEPS: Step[] = [
    {
        icon: <Sparkles className="w-10 h-10" />,
        title: 'Bienvenido a Talisto',
        description: 'Tu plataforma de gestión empresarial inteligente',
        detail:
            'Talisto reúne ventas, inventario, clientes y un asistente de IA en un solo lugar. En menos de 2 minutos verás todo lo que puedes hacer.',
        accentColor: 'text-primary',
    },
    {
        icon: <LayoutDashboard className="w-10 h-10" />,
        title: 'Tu Dashboard',
        description: 'Métricas clave de tu negocio en tiempo real',
        detail:
            'El Dashboard muestra tus ventas del día, comparativas con ayer, estado del stock y recomendaciones generadas por IA. Todo actualizado automáticamente.',
        accentColor: 'text-blue-400',
    },
    {
        icon: <Package className="w-10 h-10" />,
        title: 'Gestiona tus Datos',
        description: 'Ventas, inventario y clientes en un click',
        detail:
            'Registra ventas, controla el stock de tus productos y mantén un CRM de tus clientes. Recibe alertas cuando el stock esté bajo y ordena a proveedores directamente por WhatsApp.',
        accentColor: 'text-amber-400',
    },
    {
        icon: <Bot className="w-10 h-10" />,
        title: 'Tu CFO con IA',
        description: 'Análisis y consejos inteligentes para tu negocio',
        detail:
            'Pregúntale a Tali, tu asistente de IA, cualquier cosa sobre tu negocio: "¿Cuáles son mis productos más rentables?" o "¿Cómo estuvo este mes?". Respuestas instantáneas basadas en tus datos reales.',
        accentColor: 'text-primary',
    },
]

export function OnboardingTour() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(() => {
        // Only show if user has never completed the tour
        if (typeof window !== 'undefined') {
            const done = localStorage.getItem(STORAGE_KEY)
            if (!done) {
                // Small delay so the layout finishes rendering before the dialog appears
                const t = setTimeout(() => setOpen(true), 800)
                return () => clearTimeout(t)
            }
        }
    }, [])

    const handleFinish = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setOpen(false)
    }

    const handleSkip = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setOpen(false)
    }

    const isFirst = step === 0
    const isLast = step === STEPS.length - 1
    const current = STEPS[step]

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip() }}>
            <DialogContent
                className="sm:max-w-md bg-surface-dark border border-border-dark shadow-2xl rounded-2xl p-0 overflow-hidden gap-0"
                // Hide the default close X from shadcn — we render our own
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                {/* Skip button */}
                <button
                    onClick={handleSkip}
                    aria-label="Cerrar tour de bienvenida"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Step content */}
                <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center ${current.accentColor} mb-2`}>
                        {current.icon}
                    </div>

                    <DialogHeader className="space-y-1">
                        <DialogTitle
                            className="text-xl font-extrabold text-foreground leading-tight"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {current.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-semibold text-primary">
                            {current.description}
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                        {current.detail}
                    </p>

                    {/* Step dots */}
                    <div className="flex items-center gap-2 mt-2">
                        {STEPS.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Ir al paso ${i + 1}`}
                                onClick={() => setStep(i)}
                                className={`transition-all duration-300 rounded-full ${
                                    i === step
                                        ? 'w-6 h-2 bg-primary'
                                        : 'w-2 h-2 bg-border-dark hover:bg-primary/40'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-8 pb-8 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={isFirst}
                        aria-label="Paso anterior"
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                    </Button>

                    <span className="text-xs text-secondary font-medium">
                        {step + 1} / {STEPS.length}
                    </span>

                    {isLast ? (
                        <Button
                            size="sm"
                            onClick={handleFinish}
                            className="bg-primary text-background-dark hover:bg-primary/90 font-bold px-5"
                        >
                            <Users className="w-4 h-4 mr-1.5" />
                            Empezar
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => setStep((s) => s + 1)}
                            aria-label="Siguiente paso"
                            className="bg-primary text-background-dark hover:bg-primary/90 font-bold px-5"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
