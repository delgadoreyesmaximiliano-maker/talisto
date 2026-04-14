'use client'

import { useEffect, useRef } from 'react'

const BRANDS = ['Shopify', 'Mercado Libre', 'Bsale', 'Falabella', 'Jumpseller', 'Fintoc']
const MARQUEE_ITEMS = [...BRANDS, ...BRANDS]

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
        {name[0]}
      </div>
      <span className="text-base font-medium text-white/90 whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export function LandingSocialProof() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const FADE = 0.5

    let rafId: number

    function tick() {
      if (!video) return
      const { currentTime, duration, paused } = video
      if (!duration || paused) {
        rafId = requestAnimationFrame(tick)
        return
      }
      if (currentTime < FADE) {
        video.style.opacity = String(currentTime / FADE)
      } else if (duration - currentTime < FADE) {
        video.style.opacity = String((duration - currentTime) / FADE)
      } else {
        video.style.opacity = '1'
      }
      rafId = requestAnimationFrame(tick)
    }

    function handleEnded() {
      if (!video) return
      video.style.opacity = '0'
      setTimeout(() => {
        if (!video) return
        video.currentTime = 0
        video.play().catch(() => {})
      }, 100)
    }

    video.addEventListener('ended', handleEnded)
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'hsl(260 87% 3%)' }}>
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, hsl(260 87% 3%) 0%, transparent 30%, transparent 70%, hsl(260 87% 3%) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-24 px-4 gap-20">
        {/* Spacer for video visibility */}
        <div className="h-40" />

        {/* Logo marquee */}
        <div className="w-full max-w-5xl flex items-center gap-10 overflow-hidden">
          <p className="text-white/40 text-sm whitespace-nowrap shrink-0 leading-6 font-medium tracking-tight">
            Integrado con las<br />plataformas que usas
          </p>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-16 animate-marquee w-max">
              {MARQUEE_ITEMS.map((brand, i) => (
                <LogoItem key={`${brand}-${i}`} name={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
