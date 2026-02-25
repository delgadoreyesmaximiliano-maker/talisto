import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <Link href="/app" className="inline-flex items-center text-slate-300 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                </Link>
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Planes de Talisto
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Elige el plan perfecto para potenciar tu negocio y tomar el control total de tus operaciones.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Plan Básico */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col">
                        <h3 className="text-2xl font-bold mb-2 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Básico</h3>
                        <p className="text-slate-500 text-sm mb-6">Para negocios individuales empezando.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>$35.000</span>
                            <span className="text-slate-500 font-medium">/mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700">Hasta 50 productos</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700">Dashboard básico</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700">1 usuario</span>
                            </li>
                        </ul>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-slate-900/10">
                            <a href="https://wa.me/56912345678?text=Hola,%20quiero%20el%20Plan%20Básico%20de%20Talisto" target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                                Seleccionar Básico
                            </a>
                        </Button>
                    </div>

                    {/* Plan Pro - destacado */}
                    <div className="bg-emerald-500 text-white rounded-3xl p-8 shadow-2xl transform md:scale-105 border-2 border-emerald-400 relative flex flex-col">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="bg-slate-900 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                                RECOMENDADO
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 mt-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Pro</h3>
                        <p className="text-emerald-50 text-sm mb-6">La opción ideal para equipos creciendo.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>$75.000</span>
                            <span className="text-emerald-100 font-medium">/mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                <span>Productos e Inventario ilimitados</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                <span>Intelegencia Artificial Avanzada (Tali)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                <span>Hasta 5 usuarios</span>
                            </li>
                        </ul>
                        <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl h-12 text-base font-bold shadow-xl shadow-black/10">
                            <a href="https://wa.me/56912345678?text=Hola,%20quiero%20el%20Plan%20Pro%20de%20Talisto" target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                                Seleccionar Pro
                            </a>
                        </Button>
                    </div>

                    {/* Plan Enterprise */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col">
                        <h3 className="text-2xl font-bold mb-2 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Enterprise</h3>
                        <p className="text-slate-500 text-sm mb-6">Soluciones corporativas completas.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>$150.000</span>
                            <span className="text-slate-500 font-medium">/mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700">Módulos ILIMITADOS</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700">Soporte Operativo 24/7 SLA</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-700">Onboarding Personalizado In-Situ</span>
                            </li>
                        </ul>
                        <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl h-12 text-base font-bold" variant="secondary">
                            <a href="https://wa.me/56912345678?text=Hola,%20quiero%20cotizar%20el%20Plan%20Enterprise" target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                                Contactar Ventas
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="text-center mt-16 bg-slate-800/50 rounded-2xl p-8 max-w-2xl mx-auto border border-slate-700">
                    <p className="text-slate-300 font-medium mb-4">
                        ¿Tienes dudas sobre qué plan necesitas realmente?
                    </p>
                    <a
                        href="https://wa.me/56912345678"
                        className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                    >
                        Chatear con el equipo en WhatsApp →
                    </a>
                </div>
            </div>
        </div>
    );
}
