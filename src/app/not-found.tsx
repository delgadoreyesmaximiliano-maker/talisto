import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFA] px-4 text-center">
            <div className="relative mb-8">
                <span className="text-[150px] sm:text-[200px] font-bold text-[#0f113a]/5 leading-none select-none">
                    404
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4366A5] to-[#8ecfcd] flex items-center justify-center shadow-lg">
                        <Home className="w-10 h-10 text-white" />
                    </div>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-[#0f113a] mb-3">
                Página no encontrada
            </h1>
            <p className="text-gray-500 max-w-md mb-8">
                La página que buscas no existe o fue movida.
                Verifica la URL o vuelve al inicio.
            </p>
            <div className="flex items-center gap-3">
                <Button asChild>
                    <Link href="/app" className="gap-2">
                        <Home className="w-4 h-4" />
                        Ir al Dashboard
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Página Principal
                    </Link>
                </Button>
            </div>
        </div>
    )
}
