import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle, ArrowLeft, HeadphonesIcon, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'No se pudo completar el pago — Talisto',
  description: 'Hubo un error o el proceso de pago fue cancelado.',
}

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.1) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(99,102,241,0.05) 0%, transparent 40%)' }}>
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 text-center animate-in fade-in slide-in-from-bottom-5 duration-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(28px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
        
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-125" />
          <div className="relative bg-red-500/10 border border-red-500/30 p-4 rounded-full">
            <XCircle className="w-16 h-16 text-red-500 stroke-[1.5px]" />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
          No pudimos <span className="text-red-500">validar</span> tu pago
        </h1>
        
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          El proceso fue cancelado o hubo un error al procesar tu tarjeta. No se ha realizado ningún cobro.
        </p>

        <div className="space-y-4">
          <Link 
            href="/pricing" 
            className="group flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-6 rounded-2xl transition-all border border-white/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            Intentar de Nuevo
          </Link>

          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 w-full text-white/50 hover:text-white py-2 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
          
          <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-3">
            <p className="text-xs text-white/40">
              ¿Tienes problemas técnicos? Estamos para ayudarte.
            </p>
            <a href="mailto:soporte@talisto.cl" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors">
              <HeadphonesIcon className="w-3.5 h-3.5" />
              soporte@talisto.cl
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
