import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Check, Zap } from 'lucide-react'
import CheckoutButton from './CheckoutButton'

export const metadata: Metadata = {
  title: 'Precios y Planes — Talisto',
  description: 'Planes flexibles para empresas chilenas. Empieza gratis por 14 días.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white py-16 px-4" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.14) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 40%)' }}>
      <div className="max-w-6xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-10 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
            <Zap className="w-3 h-3" />
            14 días gratis — sin tarjeta de crédito
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Planes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Talisto</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Elige el plan perfecto para potenciar tu negocio y tomar el control total de tus operaciones.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* Plan Básico */}
          <div className="glass-card rounded-3xl p-8 flex flex-col hover:-translate-y-1 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <h3 className="text-2xl font-bold mb-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Básico</h3>
            <p className="text-white/60 text-sm mb-6">Para negocios individuales empezando.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>$35.000</span>
              <span className="text-white/60 font-medium">/mes</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['1 usuario', '3 fuentes de datos', '5 dashboards', 'Hasta 50 productos', '10 recomendaciones IA/mes', 'Soporte por email'].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton plan="Básico" price={35000} />
          </div>

          {/* Plan Pro */}
          <div className="relative rounded-3xl p-8 flex flex-col md:-mt-4 hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20" style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 0 50px rgba(99,102,241,0.18), 0 20px 40px rgba(0,0,0,0.30)', backdropFilter: 'blur(24px)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="px-5 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                RECOMENDADO
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1 mt-3 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Pro</h3>
            <p className="text-white/80 text-sm mb-6">La opción ideal para equipos creciendo.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300" style={{ fontFamily: "'Poppins', sans-serif" }}>$75.000</span>
              <span className="text-white/60 font-medium">/mes</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Hasta 5 usuarios', 'Fuentes de datos ilimitadas', 'Dashboards ilimitados', 'Productos e Inventario ilimitados', 'IA Avanzada (Tali)', 'Recomendaciones IA ilimitadas', 'Alertas automáticas', 'Soporte prioritario'].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-white">{f}</span>
                </li>
              ))}
            </ul>
            <CheckoutButton plan="Pro" price={75000} isPrimary={true} />
          </div>

          {/* Plan Enterprise */}
          <div className="glass-card rounded-3xl p-8 flex flex-col hover:-translate-y-1 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <h3 className="text-2xl font-bold mb-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Enterprise</h3>
            <p className="text-white/60 text-sm mb-6">Soluciones corporativas completas.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>$150.000</span>
              <span className="text-white/60 font-medium">/mes</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Todo de Pro +', 'Usuarios ilimitados', 'Integraciones personalizadas', 'IA entrenada para tu negocio', 'Análisis multi-sucursal', 'Soporte Operativo 24/7 SLA', 'Onboarding Personalizado', 'Gerente de cuenta dedicado'].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <a href="mailto:hola@talisto.cl?subject=Plan%20Enterprise%20Talisto" className="block w-full text-center px-6 py-3.5 text-sm font-semibold text-white rounded-xl transition-all hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              Contactar Ventas
            </a>
          </div>
        </div>

        <div className="text-center mt-16 rounded-2xl p-8 max-w-2xl mx-auto" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.14)' }}>
          <p className="text-white font-medium mb-3">
            ¿Tienes dudas sobre qué plan necesitas realmente?
          </p>
          <a href="mailto:hola@talisto.cl" className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold transition-colors text-sm">
            Escríbenos a hola@talisto.cl →
          </a>
        </div>
      </div>
    </div>
  )
}
