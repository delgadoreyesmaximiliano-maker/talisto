'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { ScanBarcode, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AddSaleDialog } from './add-sale-dialog'

export function BarcodeScannerInput() {
    const [barcode, setBarcode] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // Este estado se usará para pasar los datos al AddSaleDialog si lo convertimos en controlado
    // Por ahora, como AddSaleDialog tiene su propio estado, lo llamaremos "silencioso" si encuentra un producto o mostraremos un error

    // Auto-focus on load and keep focus when clicking outside (opcional para POS puro, pero dejémoslo simple por ahora)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const scannedCode = barcode.trim()
        if (!scannedCode) return

        setIsScanning(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No autenticado")

            const { data: userProfile } = await supabase
                .from('users')
                .select('company_id')
                .eq('id', user.id)
                .single()

            if (!(userProfile as any)?.company_id) throw new Error("No hay compañía asociada")

            const companyId = (userProfile as any).company_id

            // Buscar el producto por SKU
            const { data: productData, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .eq('sku', scannedCode)
                .single()

            const product = productData as any;

            if (fetchError || !product) {
                toast.error(`No se encontró producto con SKU: ${scannedCode}`)
                setBarcode('')
                setIsScanning(false)
                return
            }

            // Producto encontrado!
            const items = [{
                name: product.name,
                quantity: 1,
                price: product.price_sale || 0
            }]

            const { error: insertError } = await supabase.from('sales').insert([
                {
                    company_id: companyId,
                    amount: product.price_sale || 0,
                    customer_name: 'POS Escáner',
                    source: 'scanner',
                    items: items,
                    status: 'completed'
                }
            ] as any)

            if (!insertError) {
                toast.success(`✅ ${product.name} vendido!`)
                setBarcode('')
                router.refresh()
            } else {
                toast.error("Error al registrar la venta")
            }
        } catch (err: any) {
            toast.error(err.message || "Error al procesar el código")
        } finally {
            setIsScanning(false)
            inputRef.current?.focus()
        }
    }

    return (
        <div className="relative flex items-center w-full max-w-sm ml-4 group">
            <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <form onSubmit={handleSubmit} className="relative flex items-center w-full bg-background-dark border border-primary/40 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(19,236,128,0.1)]">
                <div className="pl-4 pr-2 flex items-center justify-center text-primary">
                    {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanBarcode className="w-5 h-5" />}
                </div>
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Escanear lector de código..."
                    className="border-0 bg-transparent text-foreground placeholder:text-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-11 text-lg font-mono tracking-wider"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isScanning}
                    autoFocus
                />
                <button type="submit" className="hidden">Submit</button>
            </form>
            <div className="absolute right-3 text-xs text-primary/40 font-mono pointer-events-none">
                ENTER
            </div>
        </div>
    )
}
