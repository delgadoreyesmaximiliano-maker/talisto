/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function AddCustomerDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const submittingRef = useRef(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        plan: '',
        mrr: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submittingRef.current) return
        submittingRef.current = true

        const mrrValue = formData.mrr ? parseFloat(formData.mrr) : 0
        if (formData.mrr && mrrValue < 0) {
            toast.error('El MRR no puede ser negativo')
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

        const { error } = await supabase.from('customers').insert([
            {
                company_id: companyId,
                name: formData.name,
                email: formData.email || null,
                plan: formData.plan || null,
                mrr: mrrValue,
                status: 'active'
            }
        ] as any)

        submittingRef.current = false
        setLoading(false)

        if (!error) {
            setOpen(false)
            setFormData({ name: '', email: '', plan: '', mrr: '' })
            toast.success('Cliente agregado exitosamente')
            router.refresh()
        } else {
            console.error(error)
            toast.error('Error al guardar el cliente. Intenta de nuevo.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-background-dark hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(19,236,128,0.2)]">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background-dark border-border-dark text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Nuevo Cliente</DialogTitle>
                    <DialogDescription className="text-secondary">
                        Ingresa los datos del cliente para agregarlo a tu CRM.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">Nombre o Empresa *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ej. Juan Pérez / Empresa SpA"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            autoFocus
                            className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="cliente@ejemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plan" className="text-foreground">Plan / Nivel</Label>
                            <Input
                                id="plan"
                                name="plan"
                                placeholder="Pro, Básico..."
                                value={formData.plan}
                                onChange={handleChange}
                                className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mrr" className="text-foreground">MRR ($)</Label>
                            <Input
                                id="mrr"
                                name="mrr"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={formData.mrr}
                                onChange={handleChange}
                                className="bg-surface-dark border-border-dark/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2 border-border-dark bg-transparent text-secondary hover:text-white" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-background-dark hover:bg-primary/90 font-bold">
                            {loading ? 'Guardando...' : 'Guardar Cliente'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
