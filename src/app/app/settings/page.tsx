/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Building2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [company, setCompany] = useState<any>(null)

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: '',
    })

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('company_id')
                    .eq('id', user.id)
                    .single()

                if ((profile as any)?.company_id) {
                    const { data: companyData } = await supabase
                        .from('companies')
                        .select('name, industry, plan')
                        .eq('id', (profile as any).company_id)
                        .single()
                    setCompany(companyData)
                }
            }
        }
        loadProfile()
    }, [])

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }
        if (passwords.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({
            password: passwords.newPassword,
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Contraseña actualizada exitosamente')
            setPasswords({ newPassword: '', confirmPassword: '' })
        }
        setLoading(false)
    }

    const planLabels: Record<string, string> = {
        basic: 'Starter (Gratis)',
        pro: 'Pro',
        enterprise: 'Enterprise',
    }

    const industryLabels: Record<string, string> = {
        ecommerce: 'E-commerce',
        retail: 'Comercio / Retail',
        saas: 'Software / SaaS',
        restaurant: 'Restaurant / Alimentos',
        marketing: 'Agencia de Marketing',
        services: 'Servicios Profesionales',
        manufacturing: 'Manufactura',
        health: 'Salud',
        education: 'Educación',
        other: 'Otro',
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
                <p className="text-muted-foreground">
                    Administra tu cuenta y preferencias.
                </p>
            </div>

            {/* Profile Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Perfil</CardTitle>
                            <CardDescription>Tu información de cuenta</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Correo electrónico</Label>
                            <p className="text-sm font-medium">{user?.email || '—'}</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">ID de usuario</Label>
                            <p className="text-sm font-mono text-muted-foreground truncate">{user?.id || '—'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Company Info */}
            {company && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Empresa</CardTitle>
                                <CardDescription>Información de tu negocio</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Nombre</Label>
                                <p className="text-sm font-medium">{company.name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Rubro</Label>
                                <p className="text-sm font-medium">{industryLabels[company.industry] || company.industry}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Plan</Label>
                                <p className="text-sm font-medium">{planLabels[company.plan] || company.plan}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
                            <CardDescription>Actualiza tu clave de acceso</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repite tu nueva contraseña"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="gap-2">
                            <Save className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Actualizar Contraseña'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
