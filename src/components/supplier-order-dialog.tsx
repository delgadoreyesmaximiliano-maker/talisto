/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
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
import { Copy, Check, ShoppingCart, MessageCircle, Phone } from 'lucide-react'
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
    const [supplierPhone, setSupplierPhone] = useState('')
    const [sending, setSending] = useState(false)

    // Load saved phone number from localStorage
    useEffect(() => {
        if (open) {
            try {
                const savedPhone = localStorage.getItem(`supplier_phone_${industry}`)
                if (savedPhone) setSupplierPhone(savedPhone)
            } catch { /* private browsing or storage disabled */ }
        }
    }, [open, industry])

    const handlePhoneChange = (val: string) => {
        setSupplierPhone(val)
        try { localStorage.setItem(`supplier_phone_${industry}`, val) } catch { /* ignore */ }
    }

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
            toast.success('Texto copiado — pégalo en WhatsApp o email')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error('No se pudo copiar al portapapeles')
        }
    }

    const handleWhatsApp = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Selecciona al menos un producto')
            return
        }
        const cleaned = supplierPhone.replace(/[\s\-\(\)]/g, '')
        if (!cleaned || !/^\+?\d{8,15}$/.test(cleaned)) {
            toast.error('Número inválido. Usa formato internacional (ej: +56912345678)')
            return
        }

        setSending(true)
        try {
            const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: supplierPhone,
                    message: generateText()
                })
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success('Pedido enviado silenciosamente al proveedor')
                onOpenChange(false) // Close modal on success
            } else {
                toast.error(data.error || 'Error al enviar pedido')
            }
        } catch {
            toast.error('Ocurrió un error de red')
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-background-dark border-border-dark text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
                                <label htmlFor={`chk-${p.name}`} className="text-sm font-medium text-white cursor-pointer block truncate">{p.name}</label>
                                <p className="text-xs text-secondary">Stock: {p.stock_current} / mín. {p.stock_minimum}</p>
                            </div>
                            <div className="w-20 shrink-0">
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantities[p.name]}
                                    onChange={(e) => setQuantities(prev => ({ ...prev, [p.name]: e.target.value }))}
                                    disabled={!selected[p.name]}
                                    className="h-8 text-center text-sm bg-surface-dark border-border-dark/50 text-white focus-visible:ring-primary/50 disabled:opacity-40"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview */}
                {selectedProducts.length > 0 && (
                    <div className="bg-surface-dark rounded-xl p-3 border border-border-dark">
                        <p className="text-xs text-secondary mb-2 font-medium uppercase tracking-wider">Vista previa del mensaje</p>
                        <pre className="text-xs text-white whitespace-pre-wrap font-mono leading-relaxed">
                            {generateText()}
                        </pre>
                    </div>
                )}

                <div className="pt-2 border-t border-border-dark space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                            <Phone className="w-3 h-3" /> WhatsApp del {labels.entity}
                        </label>
                        <Input
                            type="tel"
                            placeholder="Ej: +56 9 1234 5678"
                            value={supplierPhone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="bg-surface-dark border-border-dark text-white focus-visible:ring-primary/50"
                        />
                        <p className="text-[10px] text-secondary">El número se guardará para tu próxima orden</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            disabled={selectedProducts.length === 0}
                            className="flex-1 gap-2 border-border-dark bg-transparent text-secondary hover:text-white hover:bg-white/5 disabled:opacity-40"
                        >
                            {copied
                                ? <><Check className="w-4 h-4" /> Copiado</>
                                : <><Copy className="w-4 h-4" /> Copiar texto</>
                            }
                        </Button>
                        <Button
                            onClick={handleWhatsApp}
                            disabled={selectedProducts.length === 0 || !supplierPhone || sending}
                            className="flex-[2] gap-2 bg-whatsapp hover:bg-whatsapp/85 text-white font-bold disabled:opacity-40 border-0"
                        >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            {sending ? 'Mandando...' : 'Enviar por WhatsApp (Oculto)'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
