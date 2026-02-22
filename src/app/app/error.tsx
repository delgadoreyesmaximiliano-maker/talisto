'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('App error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
                Algo salió mal
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
                Ocurrió un error inesperado al cargar esta sección.
                Puedes intentar nuevamente o volver al inicio.
            </p>
            <div className="flex items-center gap-3">
                <Button onClick={reset} variant="default" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Intentar de nuevo
                </Button>
                <Button variant="outline" asChild>
                    <a href="/app">Ir al inicio</a>
                </Button>
            </div>
            {error.digest && (
                <p className="mt-6 text-xs text-muted-foreground/50">
                    Código: {error.digest}
                </p>
            )}
        </div>
    )
}
