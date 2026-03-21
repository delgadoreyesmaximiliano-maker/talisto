/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Building2, Save, MessageSquareMore, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function SettingsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [profileLoading, setProfileLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [company, setCompany] = useState<any>(null)

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: '',
    })

    const [greenApiConfig, setGreenApiConfig] = useState({
        instanceId: '',
        apiToken: '',
    })
    const [whatsappPreferences, setWhatsappPreferences] = useState({
        time: '08:00',
        includeKpis: true,
        includeStock: true,
        includeSuggestions: true
    })
    const [greenApiLoading, setGreenApiLoading] = useState(false)
    const [testPhone, setTestPhone] = useState('')
    const [testLoading, setTestLoading] = useState(false)
    
    // Telegram State
    const [telegramCode, setTelegramCode] = useState<string | null>(null)
    const [telegramLoading, setTelegramLoading] = useState(false)

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
                        .select('id, name, industry, plan, green_api_instance_id, green_api_token, whatsapp_report_time, whatsapp_report_preferences, telegram_chat_id')
                        .eq('id', (profile as any).company_id)
                        .single()

                    const cData: any = companyData
                    setCompany(cData)
                    if (cData) {
                        setGreenApiConfig({
                            instanceId: cData.green_api_instance_id || '',
                            apiToken: cData.green_api_token || '',
                        })

                        if (cData.whatsapp_report_time) {
                            setWhatsappPreferences(prev => ({ ...prev, time: cData.whatsapp_report_time }))
                        }

                        if (cData.whatsapp_report_preferences) {
                            const prefs = cData.whatsapp_report_preferences
                            setWhatsappPreferences(prev => ({
                                ...prev,
                                includeKpis: prefs.include_kpis ?? true,
                                includeStock: prefs.include_critical_stock ?? true,
                                includeSuggestions: prefs.include_suggestions ?? true
                            }))
                        }
                    }
                }
            }
            setProfileLoading(false)
        }
        loadProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleTestGreenApi = async () => {
        const cleaned = testPhone.replace(/[\s\-\(\)]/g, '')
        if (!cleaned || !/^\+?\d{8,15}$/.test(cleaned)) {
            toast.error('Número inválido. Usa formato internacional (ej: +56912345678)')
            return
        }

        setTestLoading(true)
        try {
            const res = await fetch('/api/whatsapp/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: testPhone })
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success('Mensaje de prueba enviado exitosamente a WhatsApp')
                setTestPhone('')
            } else {
                toast.error(data.error || 'Error al enviar mensaje de prueba')
            }
        } catch {
            toast.error('Ocurrió un error de red al intentar enviar la prueba')
        } finally {
            setTestLoading(false)
        }
    }

    const generateTelegramCode = async () => {
        if (!company?.id) return
        setTelegramLoading(true)
        
        const code = Math.floor(100000 + Math.random() * 900000).toString()

        try {
            await supabase.from('telegram_pairing_codes').delete().eq('company_id', company.id)
            
            const { error } = await supabase
                .from('telegram_pairing_codes')
                // @ts-expect-error - Supabase types not updated yet
                .insert([{ company_id: company.id, code }])
            
            if (error) throw error
            
            setTelegramCode(code)
            toast.success('Código generado con éxito')
        } catch (error) {
            console.error(error)
            toast.error('Error al generar código')
        } finally {
            setTelegramLoading(false)
        }
    }

    const handleSaveGreenApi = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!company?.id) return

        setGreenApiLoading(true)

        const updatePayload: any = {
            green_api_instance_id: greenApiConfig.instanceId.trim(),
            green_api_token: greenApiConfig.apiToken.trim(),
            whatsapp_report_time: whatsappPreferences.time,
            whatsapp_report_preferences: {
                include_kpis: whatsappPreferences.includeKpis,
                include_critical_stock: whatsappPreferences.includeStock,
                include_suggestions: whatsappPreferences.includeSuggestions
            }
        }

        const { error } = await supabase
            .from('companies')
            // @ts-expect-error - Supabase strict typing resolves to never due to nested types
            .update(updatePayload)
            .eq('id', company.id)

        if (error) {
            toast.error('Error al guardar credenciales de WhatsApp')
        } else {
            toast.success('Credenciales de WhatsApp guardadas exitosamente')
        }
        setGreenApiLoading(false)
    }

    const planLabels: Record<string, string> = {
        basic: 'Básico ($35.000/mes)',
        pro: 'Pro ($75.000/mes)',
        enterprise: 'Enterprise ($150.000+/mes)',
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

    if (profileLoading) {
        return (
            <div className="space-y-6 max-w-2xl">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="rounded-xl border border-border-dark bg-surface-dark p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="rounded-xl border border-border-dark bg-surface-dark p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        )
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
            <Card className="bg-surface-dark border-border-dark">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-foreground">Perfil</CardTitle>
                            <CardDescription className="text-secondary">Tu información de cuenta</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-secondary">Correo electrónico</Label>
                            <p className="text-sm font-medium text-foreground">{user?.email || '—'}</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-secondary">ID de usuario</Label>
                            <p className="text-sm font-mono text-secondary truncate">{user?.id || '—'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Company Info */}
            {company && (
                <Card className="bg-surface-dark border-border-dark">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-foreground">Empresa</CardTitle>
                                <CardDescription className="text-secondary">Información de tu negocio</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-secondary">Nombre</Label>
                                <p className="text-sm font-medium text-foreground">{company.name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-secondary">Rubro</Label>
                                <p className="text-sm font-medium text-foreground">{industryLabels[company.industry] || company.industry}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-secondary">Plan</Label>
                                <p className="text-sm font-medium text-foreground">{planLabels[company.plan] || company.plan}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* WhatsApp Integration Info */}
            {company && (
                <Card className="bg-surface-dark border-border-dark">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center">
                                    <MessageSquareMore className="w-5 h-5 text-whatsapp" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-foreground">Integración WhatsApp (API)</CardTitle>
                                    <CardDescription className="text-secondary">Automatiza los mensajes de la plataforma</CardDescription>
                                </div>
                            </div>
                            {company.green_api_instance_id && (
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveGreenApi} className="space-y-4">
                            <p className="text-sm text-secondary mb-4">
                                Utiliza las credenciales de Green-API para habilitar que Tali automatice la comunicación con tus proveedores y envíe el reporte matutino al administrador de la cuenta.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="idInstance" className="text-foreground">ID Instance</Label>
                                    <Input
                                        id="idInstance"
                                        placeholder="Ej: 1101000000"
                                        value={greenApiConfig.instanceId}
                                        onChange={(e) => setGreenApiConfig({ ...greenApiConfig, instanceId: e.target.value })}
                                        className="bg-background-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apiToken" className="text-foreground">API Token Instance</Label>
                                    <Input
                                        id="apiToken"
                                        type="password"
                                        placeholder="Ej: 4e2c..."
                                        value={greenApiConfig.apiToken}
                                        onChange={(e) => setGreenApiConfig({ ...greenApiConfig, apiToken: e.target.value })}
                                        className="bg-background-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border-dark/50 space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">Preferencias del Reporte Diario</h4>
                                    <p className="text-xs text-secondary">Configura a qué hora y qué información incluirá el reporte que Tali te enviará cada mañana.</p>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reportTime" className="text-foreground text-xs">Hora de Recepción (GMT-3)</Label>
                                            <Input
                                                id="reportTime"
                                                type="time"
                                                value={whatsappPreferences.time}
                                                onChange={(e) => setWhatsappPreferences({ ...whatsappPreferences, time: e.target.value })}
                                                className="bg-background-dark border-border-dark/50 text-foreground w-full sm:w-32 focus-visible:ring-primary/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-background-dark/50 p-4 rounded-lg border border-border-dark/30">
                                        <Label className="text-foreground text-xs block mb-2">Información a Incluir</Label>
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="pref-kpis"
                                                checked={whatsappPreferences.includeKpis}
                                                onCheckedChange={(v: boolean) => setWhatsappPreferences({ ...whatsappPreferences, includeKpis: v })}
                                                className="border-border-dark data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <label htmlFor="pref-kpis" className="text-sm text-foreground cursor-pointer">Resumen y KPIs Financieros</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="pref-stock"
                                                checked={whatsappPreferences.includeStock}
                                                onCheckedChange={(v: boolean) => setWhatsappPreferences({ ...whatsappPreferences, includeStock: v })}
                                                className="border-border-dark data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <label htmlFor="pref-stock" className="text-sm text-foreground cursor-pointer">Alertas de Stock Crítico</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="pref-suggestions"
                                                checked={whatsappPreferences.includeSuggestions}
                                                onCheckedChange={(v: boolean) => setWhatsappPreferences({ ...whatsappPreferences, includeSuggestions: v })}
                                                className="border-border-dark data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <label htmlFor="pref-suggestions" className="text-sm text-foreground cursor-pointer">Sugerencias Estratégicas (IA)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between border-b border-border-dark/50 pb-6">
                                <Button type="submit" disabled={greenApiLoading} className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold">
                                    <Save className="w-4 h-4" />
                                    {greenApiLoading ? 'Guardando...' : 'Guardar Credenciales'}
                                </Button>
                            </div>
                        </form>

                        {/* Test Connection Section */}
                        <div className="pt-6 space-y-4">
                            <h4 className="text-sm font-bold text-foreground">Probar Conexión</h4>
                            <p className="text-xs text-secondary">Asegúrate de haber guardado tus credenciales primero. Envía un WhatsApp de prueba a tu número para verificar que la integración funciona.</p>
                            <div className="flex items-end gap-3 max-w-md">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="testPhone" className="text-foreground text-xs">Tu número de celular (con código de país)</Label>
                                    <Input
                                        id="testPhone"
                                        type="tel"
                                        placeholder="Ej: 56912345678"
                                        value={testPhone}
                                        onChange={(e) => setTestPhone(e.target.value)}
                                        className="bg-background-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleTestGreenApi}
                                    disabled={testLoading || !testPhone}
                                    aria-label="Enviar mensaje de prueba por WhatsApp"
                                    className="gap-2 border-border-dark bg-whatsapp/10 text-whatsapp hover:bg-whatsapp/20 font-bold"
                                >
                                    <MessageSquareMore className="w-4 h-4" aria-hidden="true" />
                                    {testLoading ? 'Enviando...' : 'Enviar Test'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Telegram Integration Info */}
            {company && (
                <Card className="bg-surface-dark border-border-dark mt-6 mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <MessageSquareMore className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-foreground">Bot de Telegram</CardTitle>
                                    <CardDescription className="text-secondary">Chatea con TaliBots para ver tu stock y ventas</CardDescription>
                                </div>
                            </div>
                            {company.telegram_chat_id && (
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-secondary mb-4">
                                Conecta tu cuenta corporativa con nuestro Bot oficial de Telegram para consultar tus ventas del día, ver stock crítico y recibir notificaciones.
                            </p>
                            {!company.telegram_chat_id ? (
                                <div className="bg-background-dark p-4 rounded-lg border border-border-dark/50 space-y-3">
                                    <h4 className="text-sm font-bold text-foreground">1. Genera tu código</h4>
                                    <p className="text-xs text-secondary">Genera un código único temporal para enlazar tu cuenta con tu perfil de Telegram de forma rápida y segura.</p>
                                    
                                    {telegramCode ? (
                                        <div className="space-y-3 mt-2">
                                            <div className="bg-surface-dark p-3 rounded text-center border border-primary/30">
                                                <span className="text-2xl font-mono font-bold tracking-widest text-primary">{telegramCode}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button 
                                                    onClick={() => window.open(`https://t.me/Talistbot?start=${telegramCode}`, '_blank')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full"
                                                >
                                                    Abrir Telegram y Vincular
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={generateTelegramCode} 
                                            disabled={telegramLoading}
                                            variant="outline"
                                            className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary"
                                        >
                                            {telegramLoading ? 'Generando...' : 'Generar Código de Enlace'}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-background-dark p-4 rounded-lg border border-border-dark/50">
                                    <p className="text-sm text-foreground font-medium mb-3">✅ Tu cuenta ya está vinculada al bot.</p>
                                    <Button 
                                        onClick={() => window.open(`https://t.me/Talistbot`, '_blank')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                    >
                                        Ir al Chat de Telegram
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Change Password */}
            <Card className="bg-surface-dark border-border-dark">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-foreground">Cambiar Contraseña</CardTitle>
                            <CardDescription className="text-secondary">Actualiza tu clave de acceso</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-foreground">Nueva contraseña</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                required
                                className="bg-background-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground">Confirmar contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repite tu nueva contraseña"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                                className="bg-background-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="gap-2 bg-primary text-background-dark hover:bg-primary/90 font-bold">
                            <Save className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Actualizar Contraseña'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
