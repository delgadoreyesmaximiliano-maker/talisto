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
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

const PAGE_SIZE = 10

type SortKey = 'name' | 'mrr' | 'last_activity'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />
    return sortDir === 'asc'
        ? <ArrowUp className="ml-1 h-3 w-3 inline" />
        : <ArrowDown className="ml-1 h-3 w-3 inline" />
}

export function CustomersTable() {
    const supabase = createClient()
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Sort & pagination state
    const [sortKey, setSortKey] = useState<SortKey>('name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [page, setPage] = useState(1)

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
        setPage(1)
    }

    // Reset page on search change
    useEffect(() => { setPage(1) }, [searchQuery])

    const fetchCustomers = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error('Sesión no encontrada. Recarga la página.')
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
            toast.error('No se encontró empresa vinculada a tu cuenta.')
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(500)

        if (error) {
            toast.error('Error al cargar los clientes.')
        } else if (data) {
            setCustomers(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCustomers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        )
    }

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border-dashed border border-border-dark bg-surface-dark/50 gap-4 m-4 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="text-foreground font-bold text-lg mb-1">Sin clientes registrados</h3>
                    <p className="text-secondary text-sm max-w-sm">Agrega tu primer cliente para comenzar a gestionar tus relaciones comerciales.</p>
                </div>
            </div>
        )
    }

    // Filter
    const filteredCustomers = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        let valA = a[sortKey]
        let valB = b[sortKey]
        if (sortKey === 'name') {
            valA = (valA || '').toLowerCase()
            valB = (valB || '').toLowerCase()
        } else if (sortKey === 'mrr') {
            valA = Number(valA) || 0
            valB = Number(valB) || 0
        } else if (sortKey === 'last_activity') {
            valA = valA ? new Date(valA).getTime() : 0
            valB = valB ? new Date(valB).getTime() : 0
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
    })

    // Paginate
    const totalPages = Math.ceil(sortedCustomers.length / PAGE_SIZE)
    const pagedCustomers = sortedCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const start = sortedCustomers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, sortedCustomers.length)

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
                <Input
                    type="search"
                    placeholder="Buscar por nombre o email..."
                    className="pl-9 bg-surface-dark border-border-dark text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-2xl border-dashed border-border-dark bg-surface-dark/50 gap-3">
                    <Search className="w-8 h-8 text-secondary" />
                    <p className="text-secondary text-sm">No se encontraron clientes con esa búsqueda.</p>
                </div>
            ) : (
                <div>
                    <Table>
                        <TableHeader className="bg-background-dark/50 hover:bg-background-dark/50">
                            <TableRow className="border-border-dark hover:bg-transparent">
                                <TableHead
                                    className="text-secondary font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('name')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('name'))}
                                    role="button" tabIndex={0}
                                >
                                    Cliente <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                                <TableHead className="text-secondary font-medium hidden sm:table-cell">Estado</TableHead>
                                <TableHead className="text-secondary font-medium hidden md:table-cell">Suscripción</TableHead>
                                <TableHead
                                    className="text-right text-secondary font-medium cursor-pointer select-none hover:text-foreground transition-colors hidden md:table-cell"
                                    onClick={() => toggleSort('mrr')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('mrr'))}
                                    role="button" tabIndex={0}
                                >
                                    MRR <SortIcon col="mrr" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                                <TableHead
                                    className="text-right text-secondary font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('last_activity')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('last_activity'))}
                                    role="button" tabIndex={0}
                                >
                                    Últ. Actividad <SortIcon col="last_activity" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagedCustomers.map((customer) => (
                                <TableRow key={customer.id} className="border-border-dark hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-foreground">
                                        <div>{customer.name}</div>
                                        <div className="text-xs text-secondary font-normal">{customer.email || 'Sin correo asociado'}</div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge
                                            className={`font-medium ${customer.status === 'active'
                                                ? 'bg-primary/20 text-primary border-primary/30'
                                                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'} border`}
                                            variant="default"
                                        >
                                            {customer.status === 'active' ? 'Activo' : customer.status || 'Activo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize text-secondary text-sm hidden md:table-cell">{customer.plan || '-'}</TableCell>
                                    <TableCell className="text-right font-bold text-foreground hidden md:table-cell">
                                        ${customer.mrr ? Number(customer.mrr).toLocaleString('es-CL') : '0'}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-secondary">
                                        {customer.last_activity ? new Date(customer.last_activity).toLocaleDateString('es-CL') : 'Nunca'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-1 pt-3">
                            <span className="text-xs text-secondary">{start}–{end} de {sortedCustomers.length}</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={page === 1}
                                    className="bg-surface-dark border-border-dark text-secondary hover:text-foreground hover:bg-border-dark disabled:opacity-40 text-xs"
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page === totalPages}
                                    className="bg-surface-dark border-border-dark text-secondary hover:text-foreground hover:bg-border-dark disabled:opacity-40 text-xs"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
