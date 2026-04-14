import Link from 'next/link'
import { Zap, ShieldCheck } from 'lucide-react'

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-saas-bg" style={{ backgroundImage: 'radial-gradient(ellipse at 15% 15%, rgba(99,102,241,0.16) 0%, transparent 45%), radial-gradient(ellipse at 85% 85%, rgba(139,92,246,0.12) 0%, transparent 40%)' }}>
            <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
                <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(12,12,42,0.70)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                    <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-8">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight gradient-text" style={{ fontFamily: "'Poppins', sans-serif" }}>TALISTO</span>
                    </Link>

                    <div className="flex justify-center mb-4">
                        <span className="flex items-center justify-center w-14 h-14 rounded-2xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                            <ShieldCheck className="w-7 h-7 text-red-400" />
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Error de autenticación
                    </h1>

                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        Ocurrió un problema al verificar tu identidad. El enlace puede haber expirado o ser inválido. Por favor intenta iniciar sesión nuevamente.
                    </p>

                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl font-bold text-base text-white transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.30)' }}
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
