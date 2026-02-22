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

export function SalesTable() {
    const supabase = createClient()
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSales = async () => {
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
                .from('sales')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })

            if (data) setSales(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSales()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando ventas...</div>
    }

    if (sales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border rounded-md border-dashed bg-muted/10">
                <p className="text-muted-foreground">Aún no hay ventas registradas. Añade tu primera venta manual.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>ID de Referencia</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Monto Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.map((sale) => (
                        <TableRow key={sale.id}>
                            <TableCell className="font-medium text-foreground">
                                {new Date(sale.created_at).toLocaleDateString('es-CL')}
                            </TableCell>
                            <TableCell>
                                <div>{sale.customer_name || 'Por Efectivo / Anónimo'}</div>
                                <div className="text-xs text-muted-foreground">{sale.customer_email || ''}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{sale.source === 'manual' ? 'Manual' : sale.source || 'Manual'}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{sale.external_id || '-'}</TableCell>
                            <TableCell>
                                <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className={sale.status === 'completed' ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' : ''}>
                                    {sale.status === 'completed' ? 'completada' : sale.status || 'completada'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">
                                ${sale.amount ? Number(sale.amount).toFixed(0) : '0'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
