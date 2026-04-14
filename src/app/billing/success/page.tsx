import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react'

export const metadata: Metadata = {
  title: '¡Pago Exitoso! — Talisto',
  description: 'Gracias por activar tu plan con Talisto.',
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 10% 10%, rgba(139,92,246,0.1) 0%, transparent 40%)' }}>
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 text-center animate-in fade-in zoom-in duration-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 stroke-[1.5px]" />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
          ¡Pago Realizado!
        </h1>
        
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          Tu suscripción ha sido activada correctamente. Ya puedes disfrutar de todas las funcionalidades de <span className="text-indigo-400 font-bold">Talisto</span>.
        </p>

        <div className="space-y-4">
          <Link 
            href="/app" 
            className="group flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <LayoutDashboard className="w-5 h-5" />
            Ir a mi cuenta
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          
          <p className="text-xs text-white/40 pt-4">
            Recibirás un comprobante de pago en el email de tu cuenta de Mercado Pago.
          </p>
        </div>
      </div>
    </div>
  )
}
