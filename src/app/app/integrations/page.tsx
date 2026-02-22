'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Store, Truck, CreditCard, BarChart3, Mail, ExternalLink, Check, Plug } from 'lucide-react'
import { toast } from 'sonner'

const integrations = [
    {
        id: 'mercadolibre',
        name: 'MercadoLibre',
        desc: 'Sincroniza productos y pedidos con tu cuenta de MercadoLibre.',
        icon: ShoppingBag,
        color: 'bg-yellow-500/10 text-yellow-600',
        status: 'available' as const,
    },
    {
        id: 'shopify',
        name: 'Shopify',
        desc: 'Conecta tu tienda Shopify para sincronizar inventario automáticamente.',
        icon: Store,
        color: 'bg-green-500/10 text-green-600',
        status: 'available' as const,
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        desc: 'Integra tu tienda WordPress con WooCommerce para gestión unificada.',
        icon: Store,
        color: 'bg-purple-500/10 text-purple-600',
        status: 'available' as const,
    },
    {
        id: 'transbank',
        name: 'Transbank / Webpay',
        desc: 'Procesa pagos con tarjeta de crédito y débito en Chile.',
        icon: CreditCard,
        color: 'bg-blue-500/10 text-blue-600',
        status: 'coming_soon' as const,
    },
    {
        id: 'despacho',
        name: 'Chilexpress / Starken',
        desc: 'Genera guías de despacho y seguimiento automático de envíos.',
        icon: Truck,
        color: 'bg-orange-500/10 text-orange-600',
        status: 'coming_soon' as const,
    },
    {
        id: 'analytics',
        name: 'Google Analytics',
        desc: 'Conecta Analytics para métricas avanzadas de tu e-commerce.',
        icon: BarChart3,
        color: 'bg-rose-500/10 text-rose-600',
        status: 'coming_soon' as const,
    },
    {
        id: 'email',
        name: 'Mailchimp / Brevo',
        desc: 'Sincroniza clientes del CRM para campañas de email marketing.',
        icon: Mail,
        color: 'bg-cyan-500/10 text-cyan-600',
        status: 'coming_soon' as const,
    },
]

export default function IntegrationsPage() {
    const [connected, setConnected] = useState<Set<string>>(new Set())

    const handleConnect = (id: string, name: string) => {
        setConnected(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
                toast.info(`${name} desconectado`)
            } else {
                next.add(id)
                toast.success(`${name} conectado exitosamente`)
            }
            return next
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Integraciones</h1>
                <p className="text-muted-foreground">
                    Conecta servicios externos para potenciar tu negocio.
                </p>
            </div>

            {/* Connected count */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border">
                <Plug className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    {connected.size === 0
                        ? 'No tienes integraciones activas'
                        : `${connected.size} integración${connected.size > 1 ? 'es' : ''} activa${connected.size > 1 ? 's' : ''}`
                    }
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => {
                    const isConnected = connected.has(integration.id)
                    const isComingSoon = integration.status === 'coming_soon'

                    return (
                        <Card
                            key={integration.id}
                            className={`relative transition-all duration-200 ${isConnected
                                    ? 'border-emerald-300 dark:border-emerald-700 shadow-sm shadow-emerald-100 dark:shadow-emerald-900/20'
                                    : 'hover:shadow-md'
                                } ${isComingSoon ? 'opacity-70' : ''}`}
                        >
                            {isConnected && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                            )}
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.color}`}>
                                        <integration.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{integration.name}</CardTitle>
                                        {isComingSoon && (
                                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                                                Próximamente
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CardDescription className="text-sm leading-relaxed">
                                    {integration.desc}
                                </CardDescription>
                                {isComingSoon ? (
                                    <Button variant="outline" size="sm" disabled className="w-full">
                                        Próximamente
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isConnected ? "outline" : "default"}
                                        size="sm"
                                        className={`w-full gap-1.5 ${isConnected ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20' : ''}`}
                                        onClick={() => handleConnect(integration.id, integration.name)}
                                    >
                                        {isConnected ? (
                                            'Desconectar'
                                        ) : (
                                            <>
                                                Conectar
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
