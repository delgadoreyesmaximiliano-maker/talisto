import Link from 'next/link'
import { LandingNavbar } from './LandingNavbar'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden w-full" style={{ background: 'hsl(260 87% 3%)' }}>
      <LandingNavbar />

      {/* Centered hero content */}
      <div className="flex flex-col items-center pt-20 pb-16 px-4">
        {/* Giant headline with better contrast gradient */}
        <h1
          className="font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent select-none text-center"
          style={{
            fontSize: 'clamp(60px, 15vw, 180px)',
            fontFamily: "'General Sans', 'Poppins', sans-serif",
            backgroundImage: 'linear-gradient(223deg, #FFFFFF 0%, #6366f1 104.15%)',
          }}
        >
          Crece
        </h1>

        {/* Subtext with explicit visible color */}
        <p
          className="text-center text-lg sm:text-xl leading-8 max-w-2xl mt-6 text-white/80 font-medium"
        >
          La plataforma de gestión con IA más potente
          <br />
          para las PyMEs de Chile
        </p>

        {/* CTA buttons with premium styling */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 mb-8">
          <Link href="/signup" className="px-10 py-4 text-lg font-semibold rounded-2xl bg-white text-indigo-950 hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center min-w-[240px]">
            Empezar Gratis — 14 días
          </Link>
          <Button variant="outline" className="px-10 py-7 text-lg rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white shadow-2xl shadow-indigo-500/10" asChild>
            <Link href="#funcionalidades">Ver Funcionalidades</Link>
          </Button>
        </div>
        
        {/* Decorative elements to add depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none blur-[120px] rounded-full bg-indigo-600"></div>
      </div>
    </section>
  )
}
