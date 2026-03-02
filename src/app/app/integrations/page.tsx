'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plug, Check, ExternalLink, ShoppingBag, Store, CreditCard, Truck, BarChart3, Mail } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const integrations = [
    {
        id: 'mercadolibre',
        name: 'MercadoLibre',
        desc: 'Sincroniza tus productos, precios y pedidos con tu cuenta oficial.',
        logo: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png',
        icon: ShoppingBag,
        status: 'available' as const,
    },
    {
        id: 'shopify',
        name: 'Shopify',
        desc: 'Conecta tu tienda para manejar inventario unificado y multi-canal.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
        icon: Store,
        status: 'available' as const,
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        desc: 'Integra tu WordPress con gestión de despachos automática.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/WooCommerce_logo.svg',
        icon: Store,
        status: 'available' as const,
    },
    {
        id: 'transbank',
        name: 'Transbank',
        desc: 'Procesa pagos con tarjeta de crédito, débito y prepago en Chile.',
        icon: CreditCard,
        status: 'coming_soon' as const,
    },
    {
        id: 'starken',
        name: 'Starken',
        desc: 'Genera guías de despacho y seguimiento automático en tiempo real.',
        icon: Truck,
        status: 'coming_soon' as const,
    },
    {
        id: 'analytics',
        name: 'Google Analytics',
        desc: 'Métricas avanzadas de tráfico integradas con tu embudo de ventas.',
        icon: BarChart3,
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
                toast.info(`${name} desconectado.`)
            } else {
                next.add(id)
                toast.success(`¡Conexión exitosa con ${name}!`)
            }
            return next
        })
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Integraciones</h1>
                <p className="text-secondary mt-1">Conecta los servicios que ya utilizas y centraliza tu operación en Talisto.</p>
            </div>

            {/* Demo notice */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Modo Demo</span>
                <span className="text-secondary text-xs">Las conexiones son una simulación y no persisten al recargar la página. Las integraciones reales estarán disponibles próximamente.</span>
            </div>

            {/* Connected count */}
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl glass-panel shadow-[0_0_15px_rgba(19,236,128,0.05)] border-primary/20 bg-primary/5">
                <Plug className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-white">
                    {connected.size === 0
                        ? 'Explora nuestras integraciones y comienza a automatizar tu negocio.'
                        : `Tienes ${connected.size} plataforma${connected.size > 1 ? 's' : ''} activa${connected.size > 1 ? 's' : ''} correctamente.`
                    }
                </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
                {integrations.map((integration) => {
                    const isConnected = connected.has(integration.id)
                    const isComingSoon = integration.status === 'coming_soon'

                    return (
                        <div
                            key={integration.id}
                            className={`relative rounded-2xl p-6 transition-all duration-300 glass-panel flex flex-col justify-between h-full bg-surface-dark/80 
                                ${isConnected
                                    ? 'border-primary shadow-[0_0_20px_rgba(19,236,128,0.15)] bg-surface-dark'
                                    : 'border-border-dark hover:border-primary/50 hover:-translate-y-1'
                                } 
                                ${isComingSoon ? 'opacity-60 cursor-not-allowed hover:transform-none' : ''}`
                            }
                        >
                            {isConnected && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(19,236,128,0.5)]">
                                        <Check className="w-3.5 h-3.5 text-background-dark font-bold" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border border-border-dark bg-white/5`}>
                                        {integration.logo ? (
                                            <div className="relative w-full h-full bg-white p-2">
                                                <Image
                                                    src={integration.logo}
                                                    alt={integration.name}
                                                    fill
                                                    className="object-contain p-2"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <integration.icon className="w-6 h-6 text-secondary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {integration.name}
                                        </h3>
                                        {isComingSoon && (
                                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-full">
                                                Próximamente
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-secondary min-h-[60px] leading-relaxed">
                                    {integration.desc}
                                </p>
                            </div>

                            <div className="mt-6 pt-5 border-t border-border-dark">
                                {isComingSoon ? (
                                    <Button variant="outline" size="sm" disabled className="w-full bg-background-dark text-secondary border-border-dark opacity-50">
                                        En Desarrollo
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className={`w-full gap-2 transition-all ${isConnected
                                            ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                                            : 'bg-primary text-background-dark hover:bg-primary/90 font-medium'
                                            }`}
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
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
