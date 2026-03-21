import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Empieza tu prueba gratuita de 14 días en Talisto.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
