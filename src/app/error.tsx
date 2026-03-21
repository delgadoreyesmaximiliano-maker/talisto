'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="es" className="dark">
      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", backgroundColor: '#091a17', color: '#f7e7ce' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: '#091a17',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '1.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle style={{ width: '2.5rem', height: '2.5rem', color: '#ef4444' }} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#f7e7ce',
              marginBottom: '0.75rem',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Algo salió mal
          </h1>

          <p
            style={{
              color: '#9ca3af',
              maxWidth: '28rem',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            Ocurrió un error inesperado en la aplicación. Puedes intentar recargar la página
            o volver al inicio. Si el problema persiste, contáctanos en{' '}
            <a href="mailto:hola@talisto.cl" style={{ color: '#13ec80' }}>
              hola@talisto.cl
            </a>
            .
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.5rem',
                borderRadius: '0.75rem',
                backgroundColor: '#13ec80',
                color: '#091a17',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '1rem', height: '1rem' }} />
              Intentar de nuevo
            </button>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(247, 231, 206, 0.2)',
                color: '#f7e7ce',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              <Home style={{ width: '1rem', height: '1rem' }} />
              Ir al inicio
            </Link>
          </div>

          {/* Error digest */}
          {error.digest && (
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.5)' }}>
              Código de error: {error.digest}
            </p>
          )}

          {/* Branding */}
          <p
            style={{
              marginTop: '4rem',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#13ec80',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.025em',
            }}
          >
            TALISTO
          </p>
        </div>
      </body>
    </html>
  )
}
