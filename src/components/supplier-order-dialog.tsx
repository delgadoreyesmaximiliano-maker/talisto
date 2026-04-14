/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Check, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

interface CriticalProduct {
    name: string
    stock_current: number
    stock_minimum: number
}

interface SupplierOrderDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    products: CriticalProduct[]
    industry: string
}

const getLabels = (industry: string) => {
    if (industry === 'restaurant') {
        return {
            entity: 'distribuidor',
            orderLabel: 'Pedido a distribuidor',
            verb: 'solicitar',
        }
    }
    return {
        entity: 'proveedor',
        orderLabel: 'Orden de reposición',
        verb: 'ordenar',
    }
}

export function SupplierOrderDialog({ open, onOpenChange, products, industry }: SupplierOrderDialogProps) {
    const labels = getLabels(industry)

    // Initialize all selected with suggested qty = stock_minimum * 2 - stock_current
    const [selected, setSelected] = useState<Record<string, boolean>>(
        Object.fromEntries(products.map(p => [p.name, true]))
    )
    const [quantities, setQuantities] = useState<Record<string, string>>(
        Object.fromEntries(products.map(p => [
            p.name,
            String(Math.max(1, (p.stock_minimum * 2) - p.stock_current))
        ]))
    )
    const [copied, setCopied] = useState(false)

    const toggleProduct = (name: string) => {
        setSelected(prev => ({ ...prev, [name]: !prev[name] }))
    }

    const selectedProducts = products.filter(p => selected[p.name])

    const generateText = () => {
        const date = new Date().toLocaleDateString('es-CL')
        const lines = selectedProducts.map(p => {
            const qty = parseInt(quantities[p.name]) || 1
            return `  • ${p.name}: ${qty} unidad${qty !== 1 ? 'es' : ''}`
        })

        return `📦 ${labels.orderLabel} — ${date}

Estimado ${labels.entity},

Les solicito la reposición de los siguientes artículos:

${lines.join('\n')}

Favor confirmar disponibilidad y fecha de entrega.

Gracias.`
    }

    const handleCopy = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Selecciona al menos un producto')
            return
        }
        try {
            await navigator.clipboard.writeText(generateText())
            setCopied(true)
            toast.success('Texto copiado')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error('No se pudo copiar al portapapeles')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-background-dark border-border-dark text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <ShoppingCart className="w-5 h-5 text-amber-400" />
                        {labels.orderLabel}
                    </DialogTitle>
                    <DialogDescription className="text-secondary">
                        Selecciona los productos a {labels.verb} y ajusta las cantidades. Luego copia el texto para enviarlo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 max-h-64 overflow-y-auto pr-1">
                    {products.map((p) => (
                        <div key={p.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${selected[p.name] ? 'border-amber-500/30 bg-amber-500/5' : 'border-border-dark bg-surface-dark/50'}`}>
                            <Checkbox
                                id={`chk-${p.name}`}
                                checked={!!selected[p.name]}
                                onCheckedChange={() => toggleProduct(p.name)}
                                className="border-border-dark data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                            <div className="flex-1 min-w-0">
                                <label htmlFor={`chk-${p.name}`} className="text-sm font-medium text-foreground cursor-pointer block truncate">{p.name}</label>
                                <p className="text-xs text-secondary">Stock: {p.stock_current} / mín. {p.stock_minimum}</p>
                            </div>
                            <div className="w-20 shrink-0">
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantities[p.name]}
                                    onChange={(e) => setQuantities(prev => ({ ...prev, [p.name]: e.target.value }))}
                                    disabled={!selected[p.name]}
                                    className="h-8 text-center text-sm bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50 disabled:opacity-40"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview */}
                {selectedProducts.length > 0 && (
                    <div className="bg-surface-dark rounded-xl p-3 border border-border-dark">
                        <p className="text-xs text-secondary mb-2 font-medium uppercase tracking-wider">Vista previa del mensaje</p>
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {generateText()}
                        </pre>
                    </div>
                )}

                <div className="pt-2 border-t border-border-dark">
                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        disabled={selectedProducts.length === 0}
                        className="w-full gap-2 border-border-dark bg-transparent text-secondary hover:text-foreground hover:bg-muted/30 disabled:opacity-40"
                    >
                        {copied
                            ? <><Check className="w-4 h-4" /> Copiado</>
                            : <><Copy className="w-4 h-4" /> Copiar texto</>
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
