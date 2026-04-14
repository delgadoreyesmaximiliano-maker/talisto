'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/callback?next=/app/settings`,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSent(true)
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <Card>
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Revisa tu correo</CardTitle>
                    <CardDescription>
                        Enviamos un enlace de recuperación a <strong>{email}</strong>.
                        Revisa tu bandeja de entrada (y spam).
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-4">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/login" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Iniciar Sesión
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
                <CardDescription>
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu clave.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleReset}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" />
                            Volver a Iniciar Sesión
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
