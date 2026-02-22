/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
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

export function AddCustomerDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

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

        const { error } = await supabase.from('customers').insert([
            {
                company_id: companyId,
                name: formData.name,
                email: formData.email || null,
                plan: formData.plan || null,
                mrr: formData.mrr ? parseFloat(formData.mrr) : 0,
                status: 'active'
            }
        ] as any)

        setLoading(false)

        if (!error) {
            setOpen(false)
            setFormData({
                name: '',
                email: '',
                plan: '',
                mrr: '',
            })
            window.location.reload()
        } else {
            console.error(error)
            alert("Error saving customer")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Customer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                        Enter your client&apos;s details to add them to your CRM.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name or Company *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Jane Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jane@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plan">Plan / Tier</Label>
                            <Input
                                id="plan"
                                name="plan"
                                placeholder="Pro, Standard..."
                                value={formData.plan}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mrr">MRR ($)</Label>
                            <Input
                                id="mrr"
                                name="mrr"
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0.00"
                                value={formData.mrr}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Customer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
