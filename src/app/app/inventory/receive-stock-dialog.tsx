/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { PackagePlus, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type FoundProduct = {
    id: string
    name: string
    sku: string | null
    stock_current: number
    stock_minimum: number
    category: string | null
}

export function ReceiveStockDialog() {
    const [open, setOpen] = useState(false)
    const [skuInput, setSkuInput] = useState('')
    const [searching, setSearching] = useState(false)
    const [found, setFound] = useState<FoundProduct | null>(null)
    const [notFound, setNotFound] = useState(false)
    const [quantity, setQuantity] = useState('1')
    const [saving, setSaving] = useState(false)
    const [companyId, setCompanyId] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()
    const router = useRouter()

    // Load company_id once on open
    useEffect(() => {
        if (!open) return
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('users').select('company_id').eq('id', user.id).single()
            setCompanyId((data as any)?.company_id || null)
        }
        load()
        const timer = setTimeout(() => inputRef.current?.focus(), 100)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const resetSearch = () => {
        setFound(null)
        setNotFound(false)
        setQuantity('1')
    }

    const handleSkuChange = (val: string) => {
        setSkuInput(val)
        resetSearch()
    }

    // Search on Enter or barcode scanner (which sends Enter at the end)
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            await searchProduct()
        }
    }

    const searchProduct = async () => {
        const sku = skuInput.trim()
        if (!sku || !companyId) return
        setSearching(true)
        resetSearch()

        const { data } = await supabase
            .from('products')
            .select('id, name, sku, stock_current, stock_minimum, category')
            .eq('company_id', companyId)
            .ilike('sku', sku)
            .limit(1)

        setSearching(false)
        if (data && data.length > 0) {
            setFound(data[0] as FoundProduct)
            setNotFound(false)
        } else {
            setFound(null)
            setNotFound(true)
        }
    }

    const handleConfirm = async () => {
        if (!found || !companyId) return
        const qty = parseInt(quantity)
        if (!qty || qty <= 0) {
            toast.error('Ingresa una cantidad válida')
            return
        }
        setSaving(true)

        const newStock = found.stock_current + qty
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('products')
            .update({ stock_current: newStock })
            .eq('id', found.id)

        setSaving(false)

        if (error) {
            toast.error('Error al actualizar el stock')
            return
        }

        toast.success(`✅ +${qty} unidades de "${found.name}" — stock ahora: ${newStock}`)
        setSkuInput('')
        resetSearch()
        router.refresh()
        // Stay open for next scan
        inputRef.current?.focus()
    }

    const handleClose = (val: boolean) => {
        setOpen(val)
        if (!val) {
            setSkuInput('')
            resetSearch()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-border-dark bg-surface-dark text-secondary hover:text-white hover:bg-border-dark">
                    <PackagePlus className="w-4 h-4" />
                    Recibir Mercadería
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-background-dark border-border-dark text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Recibir Mercadería
                    </DialogTitle>
                    <DialogDescription className="text-secondary">
                        Escanea o escribe el SKU del producto. Puedes usar un lector de código de barras USB/Bluetooth.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* SKU input */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="sku-scan" className="text-white text-sm mb-1.5 block">SKU / Código de barras</Label>
                            <Input
                                ref={inputRef}
                                id="sku-scan"
                                value={skuInput}
                                onChange={(e) => handleSkuChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escanea o escribe el SKU..."
                                autoComplete="off"
                                className="bg-surface-dark border-border-dark/50 text-white placeholder:text-secondary focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={searchProduct}
                                disabled={searching || !skuInput.trim()}
                                aria-label="Buscar producto"
                                className="border-border-dark bg-surface-dark text-secondary hover:text-white"
                            >
                                {searching ? <Loader2 className="w-4 h-4 animate-spin" aria-label="Buscando..." /> : <Search className="w-4 h-4" aria-hidden="true" />}
                            </Button>
                        </div>
                    </div>

                    {/* Product found */}
                    {found && (
                        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-white">{found.name}</p>
                                    <p className="text-xs text-secondary mt-0.5">
                                        SKU: {found.sku || '—'} {found.category ? `· ${found.category}` : ''}
                                    </p>
                                    <p className="text-xs text-secondary mt-0.5">
                                        Stock actual: <span className={`font-bold ${found.stock_current <= found.stock_minimum ? 'text-red-400' : 'text-primary'}`}>{found.stock_current}</span> / mín. {found.stock_minimum}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="qty-input" className="text-white text-sm mb-1.5 block">Cantidad recibida</Label>
                                    <Input
                                        id="qty-input"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                        className="bg-surface-dark border-border-dark/50 text-white focus-visible:ring-primary/50"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={saving}
                                        className="bg-primary text-background-dark hover:bg-primary/90 font-bold"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product not found */}
                    {notFound && (
                        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-400 font-medium text-sm">SKU no encontrado: <span className="font-bold">{skuInput}</span></p>
                                <p className="text-secondary text-xs mt-1">¿Quieres registrar este producto con ese SKU?</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
                                    onClick={() => {
                                        setOpen(false)
                                        // Small delay so dialog closes cleanly before redirect
                                        setTimeout(() => {
                                            toast.info(`Crea el producto con SKU: ${skuInput}`)
                                        }, 300)
                                    }}
                                >
                                    Crear producto nuevo
                                </Button>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-secondary text-center pt-1">
                        💡 Puedes escanear varios productos seguidos sin cerrar esta ventana
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
