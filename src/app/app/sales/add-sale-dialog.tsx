'use client'

import { useState } from 'react'
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

export function AddSaleDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Simplistic form for now - just tracking amount and customer name
    const [formData, setFormData] = useState({
        amount: '',
        customer_name: '',
        customer_email: '',
        source: 'manual',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()

        // 1. Get user to find company_id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert("No authenticated user found.")
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
            alert("No company profile linked to this user.")
            setLoading(false)
            return
        }

        const { error } = await supabase.from('sales').insert([
            {
                company_id: companyId,
                amount: parseFloat(formData.amount),
                customer_name: formData.customer_name || null,
                customer_email: formData.customer_email || null,
                source: formData.source,
                status: 'completed'
            }
        ] as any)

        setLoading(false)

        if (!error) {
            setOpen(false)
            setFormData({
                amount: '',
                customer_name: '',
                customer_email: '',
                source: 'manual',
            })
            // Force a refresh or rely on a state update mechanism if needed
            // The simplest approach is to reload the browser or trigger a state event
            window.location.reload()
        } else {
            console.error(error)
            alert("Error saving sale")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Registrar Venta</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nueva Venta</DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles de la transacción.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto Total ($) *</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Nombre del Cliente</Label>
                        <Input
                            id="customer_name"
                            name="customer_name"
                            placeholder="Ej. Juan Pérez"
                            value={formData.customer_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_email">Correo del Cliente</Label>
                        <Input
                            id="customer_email"
                            name="customer_email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            value={formData.customer_email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Venta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
