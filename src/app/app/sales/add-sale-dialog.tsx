'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function AddSaleDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const submittingRef = useRef(false)

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        customer_name: '',
        customer_email: '',
        source: 'manual',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submittingRef.current) return
        submittingRef.current = true

        const amount = parseFloat(formData.amount)
        if (!formData.amount || isNaN(amount) || amount <= 0) {
            toast.error('El monto debe ser mayor a $0')
            submittingRef.current = false
            return
        }

        setLoading(true)

        const supabase = createClient()

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

        const items = [{
            name: formData.description || 'Venta Manual',
            quantity: 1,
            price: amount
        }]

        const { error } = await supabase.from('sales').insert([
            {
                company_id: companyId,
                amount: amount,
                customer_name: formData.customer_name || null,
                customer_email: formData.customer_email || null,
                source: formData.source,
                items: items,
                status: 'completed'
            }
        ] as any)

        submittingRef.current = false
        setLoading(false)

        if (!error) {
            setOpen(false)
            setFormData({
                amount: '',
                description: '',
                customer_name: '',
                customer_email: '',
                source: 'manual',
            })
            toast.success('Venta registrada exitosamente')
            router.refresh()
        } else {
            toast.error('Error al guardar la venta')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-background-dark hover:bg-primary/90">Registrar Venta</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-surface-dark border-border-dark text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">Registrar Nueva Venta</DialogTitle>
                    <DialogDescription className="text-secondary">
                        Ingresa los detalles y el producto de la transacción.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">Descripción / Producto Vendido *</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Ej. Suscripción Mensual, Producto X..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            autoFocus
                            className="bg-background-dark border-border-dark/50 text-white placeholder:text-secondary focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-white">Monto Total ($) *</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            className="bg-background-dark border-border-dark/50 text-white placeholder:text-secondary focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_name" className="text-white">Nombre del Cliente</Label>
                        <Input
                            id="customer_name"
                            name="customer_name"
                            placeholder="Ej. Juan Pérez"
                            value={formData.customer_name}
                            onChange={handleChange}
                            className="bg-background-dark border-border-dark/50 text-white placeholder:text-secondary focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_email" className="text-white">Correo del Cliente</Label>
                        <Input
                            id="customer_email"
                            name="customer_email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            value={formData.customer_email}
                            onChange={handleChange}
                            className="bg-background-dark border-border-dark/50 text-white placeholder:text-secondary focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2 border-border-dark bg-transparent text-secondary hover:text-white" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-background-dark hover:bg-primary/90">
                            {loading ? 'Guardando...' : 'Guardar Venta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
