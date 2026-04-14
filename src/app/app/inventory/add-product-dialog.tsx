/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function AddProductDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const submittingRef = useRef(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price_sale: '',
        price_cost: '',
        stock_current: '0',
        stock_minimum: '0',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submittingRef.current) return
        submittingRef.current = true

        if (!formData.name) {
            toast.warning('El nombre del producto es obligatorio')
            submittingRef.current = false
            return
        }

        const priceSale = formData.price_sale ? parseFloat(formData.price_sale) : null
        const priceCost = formData.price_cost ? parseFloat(formData.price_cost) : null
        const stockCurrent = parseInt(formData.stock_current) || 0
        const stockMinimum = parseInt(formData.stock_minimum) || 0

        if (priceSale !== null && priceSale < 0) {
            toast.error('El precio de venta no puede ser negativo')
            submittingRef.current = false
            return
        }
        if (priceCost !== null && priceCost < 0) {
            toast.error('El costo de compra no puede ser negativo')
            submittingRef.current = false
            return
        }
        if (stockCurrent < 0) {
            toast.error('El stock inicial no puede ser negativo')
            submittingRef.current = false
            return
        }
        if (stockMinimum < 0) {
            toast.error('El stock mínimo no puede ser negativo')
            submittingRef.current = false
            return
        }
        if (stockMinimum > stockCurrent) {
            toast.error('El stock mínimo no puede ser mayor al stock inicial')
            submittingRef.current = false
            return
        }

        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error('No se encontró usuario autenticado')
            submittingRef.current = false
            setLoading(false)
            return
        }

        const { data: userProfile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const companyId = (userProfile as any)?.company_id

        if (!companyId) {
            toast.error('No hay empresa vinculada a este usuario')
            submittingRef.current = false
            setLoading(false)
            return
        }

        const { error } = await supabase.from('products').insert([
            {
                company_id: companyId,
                name: formData.name,
                sku: formData.sku || null,
                category: formData.category || null,
                price_sale: priceSale,
                price_cost: priceCost,
                stock_current: stockCurrent,
                stock_minimum: stockMinimum,
            }
        ] as any)

        submittingRef.current = false
        setLoading(false)

        if (!error) {
            setOpen(false)
            setFormData({
                name: '',
                sku: '',
                category: '',
                price_sale: '',
                price_cost: '',
                stock_current: '0',
                stock_minimum: '0',
            })
            toast.success('Producto creado exitosamente')
            router.refresh()
        } else {
            console.error('Error al crear producto:', error?.message || error)
            toast.error('Error al crear producto. Intenta de nuevo.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-background-dark hover:bg-primary-dark font-bold shadow-[0_0_15px_rgba(19,236,128,0.2)]">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background-dark border-border-dark text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Nuevo Producto</DialogTitle>
                    <DialogDescription className="text-secondary">
                        Ingresa los datos del nuevo artículo para añadirlo al inventario.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-foreground">Nombre del Producto *</Label>
                            <Input id="name" name="name" placeholder="Ej. Monitor LG" value={formData.name} onChange={handleChange} required autoFocus className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sku" className="text-foreground">SKU / Código</Label>
                                <Input id="sku" name="sku" placeholder="MON-001" value={formData.sku} onChange={handleChange} className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-foreground">Categoría</Label>
                                <Input id="category" name="category" placeholder="Pantallas" value={formData.category} onChange={handleChange} className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price_sale" className="text-foreground">Precio Venta ($)</Label>
                                <Input id="price_sale" name="price_sale" type="number" step="0.01" min="0" value={formData.price_sale} onChange={handleChange} className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_cost" className="text-foreground">Costo Compra ($)</Label>
                                <Input id="price_cost" name="price_cost" type="number" step="0.01" min="0" value={formData.price_cost} onChange={handleChange} className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="stock_current" className="text-foreground">Stock Inicial</Label>
                                <Input id="stock_current" name="stock_current" type="number" min="0" value={formData.stock_current} onChange={handleChange} className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stock_minimum" className="text-foreground">Stock Mínimo</Label>
                                <Input id="stock_minimum" name="stock_minimum" type="number" min="0" value={formData.stock_minimum} onChange={handleChange} className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-primary text-background-dark hover:bg-primary-dark font-bold">
                            {loading ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
