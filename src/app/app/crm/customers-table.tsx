/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function CustomersTable() {
    const supabase = createClient()
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCustomers = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data: userProfile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const companyId = (userProfile as any)?.company_id

        if (companyId) {
            const { data } = await supabase
                .from('customers')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })

            if (data) setCustomers(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCustomers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando clientes...</div>
    }

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border rounded-md border-dashed bg-muted/10">
                <p className="text-muted-foreground">Aún no hay clientes registrados. Añade tu primer cliente.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Suscripción</TableHead>
                        <TableHead className="text-right">MRR</TableHead>
                        <TableHead className="text-right">Última Actividad</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium text-foreground">
                                <div>{customer.name}</div>
                                <div className="text-xs text-muted-foreground font-normal">{customer.email || 'Sin correo asociado'}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className={customer.status === 'active' ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' : ''}>
                                    {customer.status === 'active' ? 'activo' : customer.status || 'activo'}
                                </Badge>
                            </TableCell>
                            <TableCell className="capitalize text-muted-foreground text-sm">{customer.plan || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-foreground">
                                ${customer.mrr ? Number(customer.mrr).toFixed(0) : '0'}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                                {customer.last_activity ? new Date(customer.last_activity).toLocaleDateString('es-CL') : 'Nunca'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
