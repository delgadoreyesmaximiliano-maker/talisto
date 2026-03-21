import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, BarChart3, Bot, Plug, Zap } from 'lucide-react'

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
    <div className="min-h-screen bg-background-dark text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ============ NAVIGATION ============ */}
      <nav className="fixed top-0 w-full z-50 bg-surface-dark/80 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-extrabold text-primary tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              TALISTO
            </span>
            <div className="hidden md:flex items-center gap-2">
              <a href="#funcionalidades" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                Funcionalidades
              </a>
              <a href="#precios" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                Precios
              </a>
              <a href="#como-funciona" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                Cómo Funciona
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-foreground border border-border-dark rounded-xl hover:border-primary hover:text-primary transition-all">
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-background-dark bg-primary rounded-xl shadow-[0_0_15px_rgba(15,168,98,0.3)] hover:shadow-[0_0_25px_rgba(15,168,98,0.5)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Empezar Gratis
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-background-dark">
        {/* Animated radial glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] opacity-100" style={{ background: 'radial-gradient(circle, rgba(15, 168, 98, 0.15) 0%, transparent 70%)', animation: 'spin 20s linear infinite' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20">
          <div className="text-center text-foreground">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Tu negocio,<br />
              <span className="text-primary">todo listo, todo claro</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Conecta todas tus fuentes de datos, genera dashboards automáticos y recibe
              recomendaciones inteligentes para tomar las mejores decisiones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-background-dark bg-primary rounded-xl shadow-[0_0_20px_rgba(15,168,98,0.3)] hover:shadow-[0_0_30px_rgba(15,168,98,0.5)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Empezar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-surface-dark border border-border-dark rounded-xl hover:bg-surface-dark/80 transition-all duration-300"
              >
                Ver Demo
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 max-w-4xl mx-auto">
              {[
                { value: '15+', label: 'Horas ahorradas/semana' },
                { value: '10-30%', label: 'Aumento en ganancias' },
                { value: '24/7', label: 'IA analizando datos' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl sm:text-5xl font-bold text-primary" style={{ fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
                  <div className="text-muted-foreground mt-2 text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="funcionalidades" className="py-20 sm:py-24 bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'Dashboards Automáticos', desc: 'Conecta tus fuentes y genera reportes profesionales al instante' },
              { icon: '🤖', title: 'Recomendaciones IA', desc: 'La IA analiza tus datos y te dice exactamente qué hacer' },
              { icon: '🔌', title: 'Multi-Integración', desc: 'Excel, Shopify, Mercado Libre, Bsale y más en un solo lugar' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-panel rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="py-20 sm:py-24 bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>¿Cómo funciona?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">De datos dispersos a decisiones claras en 4 pasos</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🔌', step: 1, title: 'Conectas', desc: 'Sube Excel, conecta Shopify, Mercado Libre, Bsale. Todo en 5 minutos.' },
              { icon: '📊', step: 2, title: 'Dashboard Automático', desc: 'Se crea solo según tu industria. Ventas, inventario, KPIs, todo listo.' },
              { icon: '🤖', step: 3, title: 'IA Recomienda', desc: 'Analiza 24/7 y te dice qué hacer: ordenar stock, hacer promos.' },
              { icon: '⚡', step: 4, title: 'Ejecutas', desc: 'Con 1 click: crear órdenes, aplicar descuentos, enviar emails.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="glass-panel rounded-2xl p-8 hover:scale-105 transition-all duration-300">
                  <div className="text-5xl sm:text-6xl mb-4">{item.icon}</div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-background-dark text-xl sm:text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-background-dark bg-primary rounded-xl shadow-[0_0_20px_rgba(15,168,98,0.3)] hover:shadow-[0_0_30px_rgba(15,168,98,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Probar Gratis Ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-muted-foreground text-sm mt-4">✓ Sin tarjeta de crédito • ✓ Setup en 10 minutos • ✓ Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="precios" className="py-20 sm:py-24 bg-background-dark border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Precios transparentes</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">Elige el plan perfecto para tu empresa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="glass-panel rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Básico</h3>
                <p className="text-muted-foreground text-sm mb-4">Para empezar</p>
                <div className="text-5xl font-bold text-foreground mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>$35.000</div>
                <div className="text-muted-foreground">CLP/mes</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['1 usuario', '3 fuentes de datos', '5 dashboards', '10 recomendaciones IA/mes', 'Datos hasta 1 año', 'Soporte por email'].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary text-xl leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 text-sm font-semibold text-foreground bg-surface-dark border border-border-dark rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                Empezar Gratis
              </Link>
            </div>

            {/* Plan Pro - DESTACADO */}
            <div className="relative bg-surface-dark rounded-2xl p-8 border-2 border-primary shadow-[0_0_20px_rgba(15,168,98,0.2)] hover:shadow-[0_0_30px_rgba(15,168,98,0.4)] hover:scale-105 transition-all duration-300 md:-mt-4 md:mb-0">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-primary text-background-dark px-6 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">
                  ⭐ MÁS POPULAR
                </span>
              </div>
              <div className="text-center mb-6 pt-2">
                <h3 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Pro</h3>
                <p className="text-muted-foreground text-sm mb-4">Para crecer</p>
                <div className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>$75.000</div>
                <div className="text-muted-foreground">CLP/mes</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 usuarios', 'Fuentes ilimitadas', 'Dashboards ilimitados', 'Recomendaciones IA ilimitadas', 'Datos históricos completos', 'Acciones con 1 click', 'Alertas automáticas', 'Soporte prioritario'].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary text-xl leading-none font-bold">✓</span>
                    <span className="text-sm font-semibold text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 text-sm font-semibold text-background-dark bg-primary rounded-xl hover:opacity-90 transition-all"
              >
                Empezar Gratis
              </Link>
            </div>

            {/* Plan Enterprise */}
            <div className="glass-panel rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Enterprise</h3>
                <p className="text-muted-foreground text-sm mb-4">Personalizado</p>
                <div className="text-5xl font-bold text-foreground mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Custom</div>
                <div className="text-muted-foreground">Desde $150k/mes</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Todo de Pro +', 'Usuarios ilimitados', 'Integraciones personalizadas', 'IA entrenada para tu negocio', 'Análisis multi-sucursal', 'Gerente de cuenta dedicado', 'Soporte 24/7', 'Onboarding personalizado'].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary text-xl leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 text-sm font-semibold text-foreground bg-surface-dark border border-border-dark rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                Contactar Ventas
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-foreground text-lg mb-2">✓ Prueba gratis 14 días • ✓ Sin tarjeta de crédito • ✓ Cancela cuando quieras</p>
            <p className="text-muted-foreground text-sm">Todos los precios incluyen IVA</p>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-20 sm:py-24 bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center bg-surface-dark border border-primary/30 shadow-[0_0_50px_rgba(15,168,98,0.1)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                ¿Listo para tener todo listo?
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Únete a cientos de empresas chilenas que ya toman mejores decisiones con Talisto
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary text-background-dark px-10 sm:px-16 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(15,168,98,0.4)]"
              >
                Empezar Gratis Ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-muted-foreground text-sm sm:text-base mt-6 font-medium">
                ✓ Setup en 10 minutos &nbsp;•&nbsp; ✓ Sin tarjeta de crédito &nbsp;•&nbsp; ✓ Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-background-dark text-muted-foreground py-16 border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Logo + Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="text-3xl font-extrabold text-primary mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                TALISTO
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Tu negocio, todo listo, todo claro. La plataforma que une tus datos y te dice qué hacer.
              </p>
            </div>

            {/* Producto */}
            <div>
              <h4 className="font-bold text-foreground text-lg mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>Producto</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Funcionalidades', href: '#funcionalidades' },
                  { label: 'Precios', href: '/pricing' },
                  { label: 'Integraciones', href: '#funcionalidades' },
                  { label: 'Ver Demo', href: '#funcionalidades' },
                  { label: 'Casos de Éxito', href: '#funcionalidades' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block">
                      → {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-bold text-foreground text-lg mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>Empresa</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Sobre Nosotros', href: 'mailto:hola@talisto.cl' },
                  { label: 'Blog', href: 'mailto:hola@talisto.cl' },
                  { label: 'Carreras', href: 'mailto:hola@talisto.cl' },
                  { label: 'Contacto', href: 'mailto:hola@talisto.cl' },
                  { label: 'Prensa', href: 'mailto:hola@talisto.cl' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block">
                      → {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-foreground text-lg mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>Legal & Soporte</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Términos y Condiciones', href: '/legal/terms' },
                  { label: 'Política de Privacidad', href: '/legal/privacy' },
                  { label: 'Centro de Ayuda', href: 'mailto:hola@talisto.cl' },
                  { label: 'API Docs', href: 'mailto:hola@talisto.cl' },
                  { label: 'Estado del Sistema', href: '/login' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block">
                      → {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border-dark pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="text-foreground font-semibold">Talisto SpA</span>. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-sm items-center">
              <span className="text-muted-foreground">🇨🇱 Hecho en Chile con ❤️</span>
              <a href="mailto:hola@talisto.cl" className="text-primary hover:text-opacity-80 transition font-semibold">
                hola@talisto.cl
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
