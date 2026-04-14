import Link from 'next/link'
import { ChevronDown, Zap } from 'lucide-react'

const navItems = [
  { label: 'Funcionalidades', hasChevron: true, href: '/#funcionalidades' },
  { label: 'Soluciones', hasChevron: false, href: '/#industrias' },
  { label: 'Precios', hasChevron: false, href: '/pricing' },
  { label: 'Recursos', hasChevron: true, href: '/pricing' },
]

export function LandingNavbar() {
  return (
    <div className="w-full relative z-50">
      <div className="flex items-center justify-between py-5 px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TALISTO
          </span>
        </div>

        {/* Nav items - Enhanced visibility for dark mode */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1 text-white/70 text-sm font-medium bg-transparent border-none cursor-pointer hover:text-white transition-all duration-200"
            >
              {item.label}
              {item.hasChevron && <ChevronDown className="w-4 h-4 opacity-50" />}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Iniciar Sesión
          </Link>
          <a
            href="/signup"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-bold bg-white text-black hover:bg-white/90 transition-all duration-200 shadow-xl shadow-white/5 active:scale-95"
          >
            Empezar Gratis
          </a>
        </div>
      </div>

      {/* Divider - Subtle premium look */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
