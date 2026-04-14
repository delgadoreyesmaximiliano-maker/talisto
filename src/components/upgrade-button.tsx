'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface UpgradeButtonProps {
    plan: 'basico' | 'pro'
    label?: string
    className?: string
    size?: 'default' | 'sm' | 'lg'
}

export function UpgradeButton({
    plan,
    label,
    className,
    size = 'default',
}: UpgradeButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const defaultLabels = { basico: 'Activar Plan Básico', pro: 'Activar Plan Pro' }
    const buttonLabel = label ?? defaultLabels[plan]

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Error al iniciar el pago')
                return
            }

            window.location.href = data.url
        } catch {
            toast.error('Error de conexión. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleUpgrade}
            disabled={loading}
            size={size}
            className={className}
        >
            {loading
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <Zap className="w-4 h-4 mr-2 fill-current" />
            }
            {loading ? 'Redirigiendo...' : buttonLabel}
        </Button>
    )
}
