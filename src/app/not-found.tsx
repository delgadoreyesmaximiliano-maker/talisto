import Link from 'next/link'
import { Home, ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark px-4 text-center relative overflow-hidden">

      {/* Ambient glow blobs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #13ec80 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f7e7ce 0%, transparent 70%)' }}
      />

      {/* 404 number with glow */}
      <div className="relative mb-6 select-none" aria-hidden="true">
        <span
          className="text-[140px] sm:text-[200px] font-black leading-none tracking-tighter text-primary"
          style={{
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 0 40px rgba(19,236,128,0.35), 0 0 80px rgba(19,236,128,0.15)',
          }}
        >
          404
        </span>
      </div>

      {/* Icon accent */}
      <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
        <Compass className="w-7 h-7 text-primary" />
      </div>

      {/* Heading */}
      <h1
        className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Página no encontrada
      </h1>

      {/* Body copy */}
      <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed">
        La página que buscas no existe o fue movida. Verifica la URL o regresa a un lugar conocido.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-background-dark bg-primary rounded-xl shadow-[0_0_20px_rgba(19,236,128,0.3)] hover:shadow-[0_0_30px_rgba(19,236,128,0.5)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <Home className="w-4 h-4" />
          Ir al Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground bg-surface-dark border border-border-dark rounded-xl hover:border-primary hover:text-primary transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Página Principal
        </Link>
      </div>

      {/* Subtle brand footer */}
      <p className="absolute bottom-8 text-xs text-muted-foreground/50 tracking-widest uppercase">
        Talisto — todo listo, todo claro
      </p>
    </div>
  )
}
