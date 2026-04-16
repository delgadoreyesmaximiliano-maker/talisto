'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plug, Check, ExternalLink, ShoppingBag, Store, CreditCard, Truck, BarChart3, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const integrations = [
    {
        id: 'mercadolibre',
        name: 'MercadoLibre',
        desc: 'Sincroniza tus productos, precios y pedidos con tu cuenta oficial.',
        logo: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png',
        icon: ShoppingBag,
    },
    {
        id: 'shopify',
        name: 'Shopify',
        desc: 'Conecta tu tienda para manejar inventario unificado y multi-canal.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
        icon: Store,
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        desc: 'Integra tu WordPress con gestión de despachos automática.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/WooCommerce_logo.svg',
        icon: Store,
    },
    {
        id: 'transbank',
        name: 'Transbank',
        desc: 'Procesa pagos con tarjeta de crédito, débito y prepago en Chile.',
        icon: CreditCard,
    },
    {
        id: 'starken',
        name: 'Starken',
        desc: 'Genera guías de despacho y seguimiento automático en tiempo real.',
        icon: Truck,
    },
    {
        id: 'analytics',
        name: 'Google Analytics',
        desc: 'Métricas avanzadas de tráfico integradas con tu embudo de ventas.',
        icon: BarChart3,
    },
]

export default function IntegrationsPage() {
    const supabase = createClient()
    const [connected, setConnected] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const [selectedIntegration, setSelectedIntegration] = useState<typeof integrations[0] | null>(null)
    const [creds, setCreds] = useState({ token: '', url: '' })
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [isValidating, setIsValidating] = useState(false)
    const [isValidated, setIsValidated] = useState(false)

    useEffect(() => {
        async function loadIntegrations() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: userData } = await (supabase.from('users') as any).select('company_id').eq('id', user.id).single()
            if (!userData?.company_id) return

            setCompanyId(userData.company_id)

            const { data: companyData } = await (supabase.from('companies') as any)
                .select('settings')
                .eq('id', userData.company_id)
                .single() as any

            const activeIntegrations = (companyData?.settings as any)?.integrations || {}
            setConnected(new Set(Object.keys(activeIntegrations)))
            setLoading(false)
        }
        loadIntegrations()
    }, [supabase])

    const handleOpenConnect = (integration: typeof integrations[0]) => {
        if (connected.has(integration.id)) {
            handleDisconnect(integration.id, integration.name)
            return
        }
        setSelectedIntegration(integration)
        setCreds({ token: '', url: '' })
        setIsValidated(false)
    }

    const handleDisconnect = async (id: string, name: string) => {
        if (!companyId) return

        try {
            const { data: companyData } = await (supabase.from('companies') as any).select('settings').eq('id', companyId).single()
            const currentSettings = companyData?.settings as any || {}
            const integrationsData = currentSettings.integrations || {}
            delete integrationsData[id]

            const { error } = await (supabase.from('companies') as any)
                .update({ settings: { ...currentSettings, integrations: integrationsData } } as any)
                .eq('id', companyId)

            if (error) throw error

            setConnected(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
            toast.success(`${name} desconectado correctamente.`)
        } catch (error) {
            toast.error('Error al desconectar la integración')
        }
    }

    const handleVerify = async () => {
        if (!selectedIntegration || !creds.token) {
            toast.error('Ingrese las credenciales para verificar.')
            return
        }

        setIsValidating(true)
        try {
            const res = await fetch('/api/integrations/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    integrationId: selectedIntegration.id,
                    credentials: {
                        accessToken: creds.token,
                        shopName: creds.url,
                        token: creds.token
                    }
                })
            })

            const data = await res.json()
            if (res.ok) {
                setIsValidated(true)
                toast.success(data.message || 'Conexión verificada con éxito.')
            } else {
                setIsValidated(false)
                toast.error(data.message || 'Error de verificación.')
            }
        } catch (error) {
            toast.error('Error al contactar con el servicio de validación.')
        } finally {
            setIsValidating(false)
        }
    }

    const handleConnectSubmit = async () => {
        if (!selectedIntegration || !companyId) return
        if (!creds.token) {
            toast.error('El token de acceso es obligatorio')
            return
        }

        if (!isValidated) {
            toast.error('Por favor verifique la conexión antes de guardar.')
            return
        }

        setIsConnecting(true)
        try {
            const { data: companyData } = await (supabase.from('companies') as any).select('settings').eq('id', companyId).single()
            const currentSettings = companyData?.settings as any || {}
            const integrationsData = currentSettings.integrations || {}
            
            integrationsData[selectedIntegration.id] = {
                connected_at: new Date().toISOString(),
                ...creds
            }

            const { error } = await (supabase.from('companies') as any)
                .update({ settings: { ...currentSettings, integrations: integrationsData } } as any)
                .eq('id', companyId)

            if (error) throw error

            setConnected(prev => new Set(prev).add(selectedIntegration.id))
            toast.success(`${selectedIntegration.name} conectado con éxito.`)
            setSelectedIntegration(null)
        } catch (error) {
            toast.error('Error al conectar la integración')
        } finally {
            setIsConnecting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Integraciones</h1>
                <p className="text-muted-foreground mt-1">Conecta los servicios que ya utilizas y centraliza tu operación en Talisto.</p>
            </div>

            {/* Connected count */}
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl glass-panel shadow-[0_0_15px_rgba(19,236,128,0.05)] border-primary/20 bg-primary/5">
                <Plug className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                    {connected.size === 0
                        ? 'Explora nuestras integraciones y comienza a automatizar tu negocio.'
                        : `Tienes ${connected.size} plataforma${connected.size > 1 ? 's' : ''} activa${connected.size > 1 ? 's' : ''} correctamente.`
                    }
                </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
                {integrations.map((integration) => {
                    const isConnected = connected.has(integration.id)

                    return (
                        <div
                            key={integration.id}
                            className={`relative rounded-2xl p-6 transition-all duration-300 glass-card card-3d flex flex-col justify-between h-full
                                ${isConnected
                                    ? 'border-primary ring-1 ring-primary/20 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                                    : 'border-border-dark'
                                }`
                            }
                        >
                            {isConnected && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-in zoom-in duration-300">
                                        <Check className="w-4 h-4 text-white font-bold" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-4 mb-6 relative group/icon">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-border-dark bg-muted/20 backdrop-blur-md transition-transform duration-300 group-hover/icon:scale-110`}>
                                        {integration.logo ? (
                                            <div className="relative w-full h-full bg-white/90 p-3">
                                                <Image
                                                    src={integration.logo}
                                                    alt={integration.name}
                                                    fill
                                                    className="object-contain p-2"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <integration.icon className="w-7 h-7 text-primary animate-float" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-xl text-foreground tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {integration.name}
                                        </h3>
                                        {isConnected && (
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5 animate-pulse">
                                                Conectado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-secondary leading-relaxed font-medium mb-4 opacity-80">
                                    {integration.desc}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-border-dark/50">
                                <Button
                                    variant="default"
                                    size="lg"
                                    className={`w-full gap-2 btn-3d rounded-xl font-bold transition-all ${isConnected
                                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                                        : 'bg-primary text-white hover:glow-primary shadow-lg'
                                        }`}
                                    onClick={() => handleOpenConnect(integration)}
                                >
                                    {isConnected ? (
                                        'Gestionar Conexión'
                                    ) : (
                                        <>
                                            Vincular App
                                            <ExternalLink className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Connection Dialog */}
            <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
                <DialogContent className="glass-overlay border-primary/20 sm:max-w-[440px] p-0 overflow-hidden rounded-[24px]">
                    <div className="relative h-24 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent flex items-center justify-center">
                        <div className="absolute inset-0 liquid-glass opacity-40" />
                        <div className="relative w-16 h-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-3 animate-in zoom-in slide-in-from-top-4 duration-500">
                             {selectedIntegration?.logo ? (
                                 <div className="relative w-full h-full">
                                     <Image src={selectedIntegration.logo} alt="" fill className="object-contain" unoptimized />
                                 </div>
                             ) : (
                                 <Plug className="w-8 h-8 text-primary animate-pulse" />
                             )}
                        </div>
                    </div>
                    <div className="p-8 pt-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Vincular {selectedIntegration?.name}
                            </DialogTitle>
                            <DialogDescription className="text-secondary/80 text-center font-medium px-4">
                                Configura una conexión segura para que Tali pueda automatizar procesos con {selectedIntegration?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-8">
                            <div className="space-y-3">
                                <Label htmlFor="token" className="text-[11px] font-black uppercase tracking-[0.2em] text-primary ml-1">Access Token / API Key</Label>
                                <Input
                                    id="token"
                                    type="password"
                                    placeholder="Ingrese su clave secreta..."
                                    value={creds.token}
                                    onChange={(e) => setCreds({ ...creds, token: e.target.value })}
                                    className="glass-input h-14 rounded-2xl px-5 text-lg border-2 border-transparent focus:border-primary/30 transition-all font-mono"
                                />
                            </div>
                            {selectedIntegration?.id === 'shopify' && (
                                <div className="space-y-3">
                                    <Label htmlFor="url" className="text-[11px] font-black uppercase tracking-[0.2em] text-primary ml-1">Subdominio de Tienda</Label>
                                    <Input
                                        id="url"
                                        placeholder="mi-tienda.myshopify.com"
                                        value={creds.url}
                                        onChange={(e) => setCreds({ ...creds, url: e.target.value })}
                                        className="glass-input h-14 rounded-2xl px-5 text-lg border-2 border-transparent focus:border-primary/30 transition-all"
                                    />
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-[11px] leading-relaxed text-primary/80 font-medium">
                                    Al conectar, Talisto podrá extraer catálogos y registrar ventas automáticamente sin intervención manual. 🔒 Encriptado de grado bancario.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-3 sm:flex-col sm:gap-2">
                            {!isValidated ? (
                                <Button 
                                    onClick={handleVerify} 
                                    disabled={isValidating || !creds.token}
                                    className={`h-14 w-full rounded-2xl font-black text-lg transition-all btn-3d ${isValidating ? 'bg-primary/50' : 'bg-primary hover:glow-primary'}`}
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Verificando...
                                        </>
                                    ) : (
                                        'Verificar Conexión'
                                    )}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleConnectSubmit} 
                                    disabled={isConnecting}
                                    className="h-14 w-full rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 font-black text-lg transition-all btn-3d shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300"
                                >
                                    {isConnecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Confirmar Link Seguro'}
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedIntegration(null)} 
                                className="h-12 w-full rounded-2xl text-secondary hover:bg-secondary/5 font-bold"
                            >
                                Cancelar
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

