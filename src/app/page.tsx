import Link from 'next/link'
import { Package, ShoppingCart, Users, Sparkles, BarChart3, Shield, Zap, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0f113a] to-[#4366A5] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#0f113a] tracking-tight">Talisto.</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-[#0f113a] transition-colors">Funciones</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-[#0f113a] transition-colors">Planes</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-[#0f113a] transition-colors">Testimonios</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-[#0f113a] hover:text-[#4366A5] transition-colors">
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0f113a] rounded-lg hover:bg-[#1a1d4a] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Comenzar Gratis
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#8ecfcd]/20 via-[#4366A5]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#4366A5]/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium text-[#4366A5] bg-[#4366A5]/10 rounded-full border border-[#4366A5]/20">
              <Sparkles className="w-3.5 h-3.5" />
              Potenciado con Inteligencia Artificial
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0f113a] tracking-tight leading-[1.1]">
              Gestiona tu negocio{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#4366A5] to-[#8ecfcd] bg-clip-text text-transparent">
                  de forma inteligente
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="#8ecfcd" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Inventario, ventas, CRM y sugerencias de IA — todo en una plataforma diseñada
              para PyMEs chilenas que quieren crecer sin complicaciones.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-[#0f113a] rounded-xl hover:bg-[#1a1d4a] transition-all duration-300 shadow-lg shadow-[#0f113a]/25 hover:shadow-xl hover:shadow-[#0f113a]/30 hover:-translate-y-0.5"
              >
                Empezar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-[#0f113a] bg-white rounded-xl border border-gray-200 hover:border-[#8ecfcd] hover:bg-[#8ecfcd]/5 transition-all duration-200"
              >
                Ver Funciones
              </a>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Sin tarjeta de crédito · Setup en 2 minutos · Cancela cuando quieras
            </p>
          </div>

          {/* Dashboard Preview Mock */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400">app.talisto.cl</span>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Ingresos', value: '$4.250.000', color: 'from-[#0f113a] to-[#4366A5]' },
                    { label: 'MRR', value: '$890.000', color: 'from-emerald-500 to-emerald-600' },
                    { label: 'Clientes', value: '+127', color: 'from-[#4366A5] to-[#8ecfcd]' },
                    { label: 'Productos', value: '84', color: 'from-amber-500 to-orange-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-gray-100 p-4">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className={`text-xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Mini chart bars */}
                <div className="flex items-end gap-1.5 h-24">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-[#4366A5] to-[#8ecfcd] opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                  <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#4366A5] uppercase tracking-wider mb-3">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f113a]">
              Todo lo que tu negocio necesita
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Cada módulo trabaja en conjunto para darte una visión completa de tu operación.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: 'Inventario Inteligente',
                desc: 'Control de stock en tiempo real con alertas automáticas cuando tus productos llegan al mínimo.',
                gradient: 'from-blue-500/10 to-cyan-500/10',
                iconColor: 'text-blue-600',
              },
              {
                icon: ShoppingCart,
                title: 'Gestión de Ventas',
                desc: 'Registra ventas, visualiza tendencias y lleva el control de tu flujo de caja sin complicaciones.',
                gradient: 'from-emerald-500/10 to-green-500/10',
                iconColor: 'text-emerald-600',
              },
              {
                icon: Users,
                title: 'CRM Completo',
                desc: 'Gestiona clientes, proyectos y relaciones comerciales desde un solo lugar centralizado.',
                gradient: 'from-violet-500/10 to-purple-500/10',
                iconColor: 'text-violet-600',
              },
              {
                icon: Sparkles,
                title: 'Sugerencias con IA',
                desc: 'Chatea con tu asistente de IA que analiza tus datos en tiempo real y te da recomendaciones accionables.',
                gradient: 'from-amber-500/10 to-orange-500/10',
                iconColor: 'text-amber-600',
              },
              {
                icon: BarChart3,
                title: 'Dashboard en Vivo',
                desc: 'Métricas clave, gráficos de rendimiento y alertas de stock bajo — todo al instante.',
                gradient: 'from-rose-500/10 to-pink-500/10',
                iconColor: 'text-rose-600',
              },
              {
                icon: Shield,
                title: 'Seguridad Empresarial',
                desc: 'Row Level Security en cada tabla. Tus datos están aislados y protegidos a nivel de base de datos.',
                gradient: 'from-slate-500/10 to-gray-500/10',
                iconColor: 'text-slate-600',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-gray-100 hover:border-[#8ecfcd]/50 bg-white hover:shadow-lg hover:shadow-[#8ecfcd]/10 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-[#0f113a] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#F9FAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#4366A5] uppercase tracking-wider mb-3">Planes</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f113a]">
              Simple y transparente
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Empieza gratis y escala cuando lo necesites. Sin sorpresas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-semibold text-[#0f113a]">Starter</h3>
              <p className="text-sm text-gray-500 mt-1">Para emprendedores que comienzan</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-[#0f113a]">$0</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-8 space-y-3">
                {['Hasta 50 productos', 'Registro de ventas', '1 usuario', 'Dashboard básico'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#8ecfcd] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block text-center px-6 py-2.5 text-sm font-medium text-[#0f113a] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="relative rounded-2xl border-2 border-[#4366A5] bg-white p-8 shadow-xl shadow-[#4366A5]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#4366A5] to-[#8ecfcd] rounded-full">
                  Más Popular
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#0f113a]">Pro</h3>
              <p className="text-sm text-gray-500 mt-1">Para negocios en crecimiento</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-[#0f113a]">$29.990</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-8 space-y-3">
                {['Productos ilimitados', 'CRM completo', 'Hasta 5 usuarios', 'Sugerencias con IA', 'Soporte prioritario'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#4366A5] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block text-center px-6 py-2.5 text-sm font-medium text-white bg-[#0f113a] rounded-lg hover:bg-[#1a1d4a] transition-colors shadow-sm"
              >
                Empezar con Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-semibold text-[#0f113a]">Enterprise</h3>
              <p className="text-sm text-gray-500 mt-1">Para operaciones grandes</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-[#0f113a]">$79.990</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-8 space-y-3">
                {['Todo en Pro', 'Usuarios ilimitados', 'Integraciones API', 'SLA garantizado', 'Onboarding dedicado'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#8ecfcd] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block text-center px-6 py-2.5 text-sm font-medium text-[#0f113a] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Contactar Ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#4366A5] uppercase tracking-wider mb-3">Testimonios</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f113a]">
              Negocios que ya confían en Talisto
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: 'Talisto nos ayudó a reducir las pérdidas de inventario en un 40%. La alerta de stock bajo es un salvavidas.',
                name: 'Carolina Muñoz',
                role: 'Dueña, Tienda Natural Vida',
              },
              {
                quote: 'El asistente de IA me da insights que antes solo podía obtener contratando un analista. Increíble relación precio-valor.',
                name: 'Andrés Soto',
                role: 'Gerente, Distribuidora Lagos',
              },
              {
                quote: 'Pasamos de usar Excel a Talisto en un día. La curva de aprendizaje es casi cero y el soporte es excelente.',
                name: 'María José Reyes',
                role: 'CFO, Importadora del Sur',
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-gray-100 p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-[#0f113a]">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0f113a] relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#4366A5]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#8ecfcd]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            Únete a cientos de PyMEs chilenas que ya usan Talisto para crecer de forma inteligente.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 text-base font-semibold text-[#0f113a] bg-white rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Crear Cuenta Gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0a0c2e] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#4366A5] to-[#8ecfcd] flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white/80">Talisto.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Funciones</a>
              <a href="#pricing" className="hover:text-white transition-colors">Planes</a>
              <Link href="/login" className="hover:text-white transition-colors">Acceder</Link>
            </div>
            <p className="text-xs text-gray-500">
              © 2025 Talisto. Hecho con 💙 en Chile.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
