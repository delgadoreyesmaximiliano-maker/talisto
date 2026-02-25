'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { TrialStatus } from '@/types/database';

interface TrialWarningBannerProps {
    status: TrialStatus;
    companyName: string;
}

export function TrialWarningBanner({ status, companyName }: TrialWarningBannerProps) {
    // Don't show banner if trial is active and not expiring soon
    if (!status.isExpiringSoon && !status.isExpired) {
        return null;
    }

    // Expired trial messaging
    if (status.isExpired) {
        return (
            <Alert variant="destructive" className="mb-6 border-2 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="text-lg font-semibold">
                    Tu periodo de prueba ha finalizado
                </AlertTitle>
                <AlertDescription className="mt-2">
                    <div className="space-y-3">
                        <p className="text-sm">
                            <strong>{companyName}</strong> utilizó Talisto durante 14 días.
                            Para continuar accediendo a todas las funcionalidades integralmente, necesitas activar un plan de pago.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                asChild
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <a
                                    href="https://wa.me/56912345678?text=Hola,%20mi%20trial%20de%20Talisto%20expiro%20y%20quiero%20activar%20un%20plan"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Hablar con Ventas
                                </a>
                            </Button>

                            <Button variant="outline" className="border-red-300 text-red-800 hover:bg-red-100" asChild>
                                <Link href="/pricing">
                                    Ver Planes y Precios
                                </Link>
                            </Button>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    // Expiring soon messaging (3 days or less)
    return (
        <Alert
            variant="default"
            className={`mb-6 border-2 shadow-sm ${status.daysRemaining === 1
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}
        >
            <Clock className={`h-5 w-5 ${status.daysRemaining === 1 ? 'text-red-600' : 'text-amber-600'}`} />
            <AlertTitle className="text-lg font-semibold">
                {status.daysRemaining === 1
                    ? '¡Último día de tu prueba gratuita!'
                    : `Tu prueba expira en ${status.daysRemaining} días`}
            </AlertTitle>
            <AlertDescription className="mt-2">
                <div className="space-y-3">
                    <p className="text-sm">
                        No pierdas acceso a tus dashboards con IA, control de inventario y recomendaciones de Tali.
                        Asegura la continuidad operativa pasándote a un plan definitivo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            asChild
                            size="sm"
                            className={status.daysRemaining === 1 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                        >
                            <a
                                href="https://wa.me/56912345678?text=Hola,%20quiero%20activar%20un%20plan%20de%20Talisto"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Contactar Ventas
                            </a>
                        </Button>

                        <Button variant="outline" size="sm" className="bg-white/50" asChild>
                            <Link href="/pricing">
                                Ver Planes
                            </Link>
                        </Button>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    );
}
