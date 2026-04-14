import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, BarChart3, Bot, Plug, Zap } from 'lucide-react'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'

export const metadata: Metadata = {
  title: 'CRM, Inventario y Ventas con IA para Chile',
  description: 'Talisto te ayuda a gestionar clientes, inventario y ventas con inteligencia artificial. Prueba gratis 14 días.',
  openGraph: {
    title: 'Talisto — CRM + IA para empresas chilenas',
    description: 'Gestión inteligente para tu negocio.',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white bg-[#070b14]" style={{ fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>

      {/* ============ NEW HERO + SOCIAL PROOF ============ */}
      <LandingHero />
      <LandingSocialProof />

      {/* ============ FEATURES SECTION ============ */}
      <section id="funcionalidades" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Todo lo que necesitas,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">en un solo lugar</span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">Diseñado para las necesidades reales de las empresas chilenas</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, color: '#6366f1', title: 'Dashboards Automáticos', desc: 'Conecta tus fuentes y genera reportes profesionales al instante. Visualiza KPIs en tiempo real.' },
              { icon: Bot, color: '#8b5cf6', title: 'Recomendaciones IA', desc: 'La IA analiza tus datos 24/7 y te dice exactamente qué hacer para maximizar ganancias.' },
              { icon: Plug, color: '#06b6d4', title: 'Multi-Integración', desc: 'Excel, Shopify, Mercado Libre, Bsale y más integrados en un solo panel de control.' },
            ].map((feature) => (
              <div key={feature.title} className="glass-card card-3d p-8 cursor-pointer relative overflow-hidden group border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="absolute -right-10 -top-10 w-32 h-32 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: feature.color }}></div>
                <div className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-white/10 border border-white/20 shadow-[inset_0_1px_rgba(255,255,255,0.4)]">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="relative z-10 text-xl font-bold mb-3 text-white tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{feature.title}</h3>
                <p className="relative z-10 text-white/70 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">¿Cómo funciona?</span>
            </h2>
            <p className="text-lg text-white/60">De datos dispersos a decisiones claras en 4 pasos</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Plug, step: 1, color: '#6366f1', title: 'Conectas', desc: 'Sube Excel, conecta Shopify, Mercado Libre, Bsale. Todo en 5 minutos.' },
              { icon: BarChart3, step: 2, color: '#8b5cf6', title: 'Dashboard Automático', desc: 'Se crea solo según tu industria. Ventas, inventario, KPIs, todo listo.' },
              { icon: Bot, step: 3, color: '#06b6d4', title: 'IA Recomienda', desc: 'Analiza 24/7 y te dice qué hacer: ordenar stock, hacer promos.' },
              { icon: Zap, step: 4, color: '#a78bfa', title: 'Ejecutas', desc: 'Con 1 click: crear órdenes, aplicar descuentos, enviar reportes.' },
            ].map((item) => (
              <div key={item.step} className="glass-card card-3d p-8 text-center cursor-pointer group border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 blur-[30px] opacity-0 group-hover:opacity-30 transition-opacity" style={{ background: item.color }}></div>
                <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/10 border border-white/20 shadow-[inset_0_1px_rgba(255,255,255,0.4)]">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${item.color}, #8b5cf6)` }}>
                  {item.step}
                </div>
                <h3 className="relative z-10 text-lg font-bold mb-2 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.title}</h3>
                <p className="relative z-10 text-white/70 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="btn-3d inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}>
              Probar Gratis Ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-white/50 text-sm mt-4">Sin tarjeta de crédito &nbsp;•&nbsp; Setup en 10 minutos &nbsp;•&nbsp; Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="precios" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Precios <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">transparentes</span>
            </h2>
            <p className="text-lg text-white/60">Elige el plan perfecto para tu empresa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Básico */}
            <div className="glass-card rounded-2xl p-8 flex flex-col transition-all duration-200 ease-out hover:-translate-y-1 border border-white/10 bg-white/5 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Básico</h3>
              <p className="text-white/60 text-sm mb-6">Para empezar</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>$35.000</span>
                <span className="text-white/60 ml-1">CLP/mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['1 usuario', '3 fuentes de datos', '5 dashboards', '10 recomendaciones IA/mes', 'Datos hasta 1 año', 'Soporte por email'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all border border-indigo-400/20 hover:bg-indigo-400/10">
                Empezar Gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl p-8 flex flex-col md:-mt-4 transition-all duration-200 ease-out hover:-translate-y-1" style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 0 40px rgba(99,102,241,0.20), 0 20px 40px rgba(0,0,0,0.30)', backdropFilter: 'blur(24px)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-5 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  MÁS POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1 text-white pt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Pro</h3>
              <p className="text-white/80 text-sm mb-6">Para crecer</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300" style={{ fontFamily: "'Poppins', sans-serif" }}>$75.000</span>
                <span className="text-white/60 ml-1">CLP/mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['5 usuarios', 'Fuentes ilimitadas', 'Dashboards ilimitados', 'Recomendaciones IA ilimitadas', 'Datos históricos completos', 'Acciones con 1 click', 'Alertas automáticas', 'Soporte prioritario'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm font-medium text-white">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}>
                Empezar Gratis
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-card rounded-2xl p-8 flex flex-col transition-all duration-200 ease-out hover:-translate-y-1 border border-white/10 bg-white/5 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-1 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Enterprise</h3>
              <p className="text-white/60 text-sm mb-6">Personalizado</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Custom</span>
                <span className="text-white/60 ml-1 text-sm">Desde $150k/mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Todo de Pro +', 'Usuarios ilimitados', 'Integraciones personalizadas', 'IA entrenada para tu negocio', 'Análisis multi-sucursal', 'Gerente de cuenta dedicado', 'Soporte 24/7', 'Onboarding personalizado'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all border border-indigo-400/20 hover:bg-indigo-400/10">
                Contactar Ventas
              </Link>
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-white/50 text-sm">Prueba gratis 14 días &nbsp;•&nbsp; Sin tarjeta de crédito &nbsp;•&nbsp; Cancela cuando quieras &nbsp;•&nbsp; Todos los precios incluyen IVA</p>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card overflow-hidden p-12 sm:p-20 text-center relative card-3d border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full blur-[80px] opacity-40" style={{ background: '#6366f1' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full blur-[100px] opacity-30" style={{ background: '#06b6d4' }} />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                ¿Listo para tener<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">todo listo?</span>
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-xl mx-auto">
                Únete a cientos de empresas chilenas que ya toman mejores decisiones con Talisto
              </p>
              <Link href="/signup" className="btn-3d inline-flex items-center gap-2 px-12 py-5 rounded-xl font-bold text-lg text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.45), 0 12px 40px rgba(0,0,0,0.30)' }}>
                Empezar Gratis Ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/50 text-sm mt-6">
                Setup en 10 minutos &nbsp;•&nbsp; Sin tarjeta de crédito &nbsp;•&nbsp; Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400" style={{ fontFamily: "'Poppins', sans-serif" }}>TALISTO</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Tu negocio, todo listo, todo claro. La plataforma que une tus datos y te dice qué hacer.
              </p>
            </div>
            {[
              { title: 'Producto', links: [['#funcionalidades', 'Funcionalidades'], ['/pricing', 'Precios'], ['#funcionalidades', 'Integraciones'], ['#funcionalidades', 'Ver Demo']] },
              { title: 'Empresa', links: [['mailto:hola@talisto.cl', 'Sobre Nosotros'], ['mailto:hola@talisto.cl', 'Blog'], ['mailto:hola@talisto.cl', 'Contacto']] },
              { title: 'Legal', links: [['/legal/terms', 'Términos y Condiciones'], ['/legal/privacy', 'Política de Privacidad'], ['mailto:hola@talisto.cl', 'Centro de Ayuda']] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(([href, label]) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-sm text-white/50">
              © {new Date().getFullYear()} <span className="text-white font-semibold">Talisto SpA</span>. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-sm items-center">
              <span className="text-white/50">Hecho en Chile</span>
              <a href="mailto:hola@talisto.cl" className="text-indigo-400 hover:text-indigo-300 transition font-semibold">
                hola@talisto.cl
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
