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
import { ShoppingBag, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

const PAGE_SIZE = 10

function SalesTableSkeleton() {
    return (
        <div className="rounded-xl border border-border-dark overflow-hidden bg-surface-dark">
            <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}

type DateFilter = 'all' | 'today' | 'week' | 'month'
type SortKey = 'created_at' | 'amount'
type SortDir = 'asc' | 'desc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />
    return sortDir === 'asc'
        ? <ArrowUp className="ml-1 h-3 w-3 inline" />
        : <ArrowDown className="ml-1 h-3 w-3 inline" />
}

export function SalesTable() {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')

    // Sort & pagination state
    const [sortKey, setSortKey] = useState<SortKey>('created_at')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [page, setPage] = useState(1)

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('desc')
        }
        setPage(1)
    }

    // Reset page on search or date filter change
    useEffect(() => { setPage(1) }, [searchQuery, dateFilter])

    const fetchSales = async () => {
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const companyId = (userProfile as any)?.company_id

        if (!companyId) {
            toast.error('No se encontró empresa vinculada a tu cuenta.')
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })

        if (error) {
            toast.error('Error al cargar las ventas.')
        } else if (data) {
            setSales(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSales()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return <SalesTableSkeleton />
    }

    // Filtering logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredSales = sales.filter(sale => {
        // Date filter
        if (dateFilter !== 'all') {
            const saleDate = new Date(sale.created_at)
            const now = new Date()
            if (dateFilter === 'today') {
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                if (saleDate < today) return false
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                if (saleDate < weekAgo) return false
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                if (saleDate < monthAgo) return false
            }
        }
        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            const customerMatch = (sale.customer_name || '').toLowerCase().includes(q)
            const emailMatch = (sale.customer_email || '').toLowerCase().includes(q)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = Array.isArray(sale.items) ? sale.items : []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const itemMatch = items.some((item: any) => (item.name || '').toLowerCase().includes(q))
            if (!customerMatch && !emailMatch && !itemMatch) return false
        }
        return true
    })

    // Sort
    const sortedSales = [...filteredSales].sort((a, b) => {
        let valA = a[sortKey]
        let valB = b[sortKey]
        if (sortKey === 'created_at') {
            valA = new Date(valA).getTime()
            valB = new Date(valB).getTime()
        } else {
            valA = Number(valA) || 0
            valB = Number(valB) || 0
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
    })

    // Paginate
    const totalPages = Math.ceil(sortedSales.length / PAGE_SIZE)
    const pagedSales = sortedSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const start = sortedSales.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, sortedSales.length)

    if (sales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border rounded-2xl border-dashed border-border-dark bg-surface-dark/50 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="text-white font-bold text-lg mb-1">Sin ventas registradas</h3>
                    <p className="text-secondary text-sm max-w-sm">Registra tu primera venta para comenzar a ver métricas y análisis de tu negocio.</p>
                </div>
            </div>
        )
    }

    const DATE_FILTERS: { key: DateFilter; label: string }[] = [
        { key: 'all', label: 'Todas' },
        { key: 'today', label: 'Hoy' },
        { key: 'week', label: 'Semana' },
        { key: 'month', label: 'Mes' },
    ]

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
                    <Input
                        type="search"
                        placeholder="Buscar por cliente o producto..."
                        className="pl-9 bg-surface-dark border-border-dark text-white placeholder:text-secondary focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Filter className="w-4 h-4 text-secondary mr-1" aria-hidden="true" />
                    {DATE_FILTERS.map(f => (
                        <Button
                            key={f.key}
                            variant={dateFilter === f.key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDateFilter(f.key)}
                            className={dateFilter === f.key
                                ? 'bg-primary text-background-dark hover:bg-primary/90 font-bold text-xs'
                                : 'bg-surface-dark border-border-dark text-secondary hover:text-white hover:bg-border-dark text-xs'}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-2xl border-dashed border-border-dark bg-surface-dark/50 gap-3">
                    <Search className="w-8 h-8 text-secondary" />
                    <p className="text-secondary text-sm">No se encontraron ventas con los filtros aplicados.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border-dark overflow-hidden bg-surface-dark">
                    <Table>
                        <TableHeader className="bg-background-dark hover:bg-background-dark/90">
                            <TableRow className="border-border-dark hover:bg-transparent">
                                <TableHead
                                    className="text-secondary font-medium cursor-pointer select-none hover:text-white transition-colors"
                                    onClick={() => toggleSort('created_at')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('created_at'))}
                                    role="button" tabIndex={0}
                                >
                                    Fecha <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                                <TableHead className="text-secondary font-medium">Producto / Serv.</TableHead>
                                <TableHead className="text-secondary font-medium">Cliente</TableHead>
                                <TableHead className="text-secondary font-medium">Origen</TableHead>
                                <TableHead className="text-secondary font-medium">Estado</TableHead>
                                <TableHead
                                    className="text-right text-secondary font-medium cursor-pointer select-none hover:text-white transition-colors"
                                    onClick={() => toggleSort('amount')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('amount'))}
                                    role="button" tabIndex={0}
                                >
                                    Monto Total <SortIcon col="amount" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagedSales.map((sale) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const items = Array.isArray(sale.items) ? sale.items : [];
                                const description = items.length > 0 ? items[0].name : 'Venta Manual';

                                return (
                                    <TableRow key={sale.id} className="border-border-dark hover:bg-white/[0.02]">
                                        <TableCell className="font-medium text-white">
                                            {new Date(sale.created_at).toLocaleDateString('es-CL')}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-white font-medium">{description}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-white">{sale.customer_name || 'Al Contado'}</div>
                                            <div className="text-xs text-secondary mt-0.5">{sale.customer_email || ''}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize bg-transparent border-border-dark text-secondary font-normal">
                                                {sale.source === 'manual' ? 'Manual' : sale.source || 'Manual'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`font-medium ${sale.status === 'completed'
                                                    ? 'bg-primary/20 text-primary border-primary/30'
                                                    : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'} border`}
                                                variant="default"
                                            >
                                                {sale.status === 'completed' ? 'Completado' : sale.status || 'Completado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-white">
                                            ${sale.amount ? Number(sale.amount).toLocaleString('es-CL') : '0'}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
                            <span className="text-xs text-secondary">{start}–{end} de {sortedSales.length}</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={page === 1}
                                    className="bg-surface-dark border-border-dark text-secondary hover:text-white hover:bg-border-dark disabled:opacity-40 text-xs"
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page === totalPages}
                                    className="bg-surface-dark border-border-dark text-secondary hover:text-white hover:bg-border-dark disabled:opacity-40 text-xs"
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
