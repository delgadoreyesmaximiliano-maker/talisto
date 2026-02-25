/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
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

        if (!formData.name || !formData.sku) {
            toast.warning('⚠️ Completa todos los campos obligatorios')
            return
        }

        setLoading(true)

        // 1. Get user to find company_id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error("No authenticated user found.")
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
            toast.error("No company profile linked to this user.")
            setLoading(false)
            return
        }

        const { error } = await supabase.from('products').insert([
            {
                company_id: companyId,
                name: formData.name,
                sku: formData.sku || null,
                category: formData.category || null,
                price_sale: formData.price_sale ? parseFloat(formData.price_sale) : null,
                price_cost: formData.price_cost ? parseFloat(formData.price_cost) : null,
                stock_current: parseInt(formData.stock_current) || 0,
                stock_minimum: parseInt(formData.stock_minimum) || 0,
            }
        ] as any)

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
            toast.success('✅ Producto creado exitosamente')
            router.refresh()
        } else {
            console.error(error)
            toast.error('❌ Error al crear producto. Intenta de nuevo.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del nuevo artículo para añadirlo al inventario.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Producto *</Label>
                            <Input id="name" name="name" placeholder="Ej. Monitor LG" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU / Código</Label>
                                <Input id="sku" name="sku" placeholder="MON-001" value={formData.sku} onChange={handleChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Input id="category" name="category" placeholder="Pantallas" value={formData.category} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price_sale">Precio Venta ($)</Label>
                                <Input id="price_sale" name="price_sale" type="number" step="0.01" value={formData.price_sale} onChange={handleChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_cost">Costo Compra ($)</Label>
                                <Input id="price_cost" name="price_cost" type="number" step="0.01" value={formData.price_cost} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="stock_current">Stock Inicial</Label>
                                <Input id="stock_current" name="stock_current" type="number" value={formData.stock_current} onChange={handleChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stock_minimum">Alerta Stock Crítico</Label>
                                <Input id="stock_minimum" name="stock_minimum" type="number" value={formData.stock_minimum} onChange={handleChange} />
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
