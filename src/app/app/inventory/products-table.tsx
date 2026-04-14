/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Search, Trash, Edit, RefreshCcw, Package, ArrowUp, ArrowDown, ArrowUpDown, ShoppingCart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SupplierOrderDialog } from '@/components/supplier-order-dialog'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'

const PAGE_SIZE = 10

type SortKey = 'name' | 'price_sale' | 'stock_current'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />
    return sortDir === 'asc'
        ? <ArrowUp className="ml-1 h-3 w-3 inline" />
        : <ArrowDown className="ml-1 h-3 w-3 inline" />
}

export function ProductsTable() {
    const supabase = createClient()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<any>(null)

    // Edit states
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editProduct, setEditProduct] = useState<any>(null)
    const [editLoading, setEditLoading] = useState(false)

    // Order states
    const [orderProduct, setOrderProduct] = useState<any>(null)
    const [userIndustry, setUserIndustry] = useState<string>('other')
    const [editForm, setEditForm] = useState({
        name: '', sku: '', category: '', price_sale: '', price_cost: '', stock_current: '0', stock_minimum: '0',
    })

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

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data: userProfile } = await supabase
            .from('users')
            .select('company_id, companies(industry)')
            .eq('id', user.id)
            .single()

        const companyId = (userProfile as any)?.company_id
        const ind = (userProfile as any)?.companies?.industry || 'other'
        setUserIndustry(ind)

        if (companyId) {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })
                .limit(500)

            if (data) setProducts(data)
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleDelete = async () => {
        if (!productToDelete) return

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productToDelete.id)

        if (!error) {
            toast.success('Producto eliminado')
            setDeleteDialogOpen(false)
            setProductToDelete(null)
            fetchProducts()
        } else {
            console.error('Error al eliminar producto:', error?.message || error)
            toast.error('Error al eliminar. Intenta de nuevo.')
        }
    }

    const openEditDialog = (product: any) => {
        setEditProduct(product)
        setEditForm({
            name: product.name || '',
            sku: product.sku || '',
            category: product.category || '',
            price_sale: product.price_sale?.toString() || '',
            price_cost: product.price_cost?.toString() || '',
            stock_current: product.stock_current?.toString() || '0',
            stock_minimum: product.stock_minimum?.toString() || '0',
        })
        setEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editProduct) return
        setEditLoading(true)

        const { error } = await (supabase
            .from('products') as any)
            .update({
                name: editForm.name,
                sku: editForm.sku || null,
                category: editForm.category || null,
                price_sale: editForm.price_sale ? parseFloat(editForm.price_sale) : null,
                price_cost: editForm.price_cost ? parseFloat(editForm.price_cost) : null,
                stock_current: parseInt(editForm.stock_current) || 0,
                stock_minimum: parseInt(editForm.stock_minimum) || 0,
            })
            .eq('id', editProduct.id)

        setEditLoading(false)

        if (!error) {
            toast.success('Producto actualizado')
            setEditDialogOpen(false)
            setEditProduct(null)
            fetchProducts()
        } else {
            toast.error('Error al actualizar producto')
        }
    }

    // Filter
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Sort
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let valA = a[sortKey]
        let valB = b[sortKey]
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        valA = valA ?? (typeof valA === 'number' ? 0 : '')
        valB = valB ?? (typeof valB === 'number' ? 0 : '')
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
    })

    // Paginate
    const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE)
    const pagedProducts = sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const start = sortedProducts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, sortedProducts.length)

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-10" />
                </div>
                <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden p-4 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre o SKU..."
                        className="pl-9 bg-surface-dark border-border-dark text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" onClick={fetchProducts} aria-label="Recargar tabla" className="bg-surface-dark border-border-dark text-secondary hover:text-foreground hover:bg-border-dark">
                    <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border rounded-2xl border-dashed border-border-dark bg-surface-dark/50 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Package className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-foreground font-bold text-lg mb-1">Sin productos en inventario</h3>
                        <p className="text-secondary text-sm max-w-sm">Agrega tu primer producto para comenzar a gestionar tu inventario y recibir alertas de stock.</p>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden">
                    <Table>
                        <TableHeader className="bg-background-dark/50 hover:bg-background-dark/50">
                            <TableRow className="border-border-dark hover:bg-transparent">
                                <TableHead
                                    className="text-secondary font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('name')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('name'))}
                                    role="button" tabIndex={0}
                                >
                                    Nombre <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                                <TableHead className="text-secondary font-medium hidden md:table-cell">SKU</TableHead>
                                <TableHead className="text-secondary font-medium hidden md:table-cell">Categoría</TableHead>
                                <TableHead
                                    className="text-secondary font-medium text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('price_sale')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('price_sale'))}
                                    role="button" tabIndex={0}
                                >
                                    Precio <SortIcon col="price_sale" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                                <TableHead
                                    className="text-secondary font-medium text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('stock_current')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSort('stock_current'))}
                                    role="button" tabIndex={0}
                                >
                                    Stock <SortIcon col="stock_current" sortKey={sortKey} sortDir={sortDir} />
                                </TableHead>
                                <TableHead className="text-secondary font-medium">Estado</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagedProducts.length === 0 ? (
                                <TableRow className="border-border-dark">
                                    <TableCell colSpan={7} className="text-center h-24 text-secondary">
                                        Ningún producto coincide con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            ) : pagedProducts.map((product) => (
                                <TableRow key={product.id} className="border-border-dark hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                                    <TableCell className="text-secondary hidden md:table-cell">{product.sku || '-'}</TableCell>
                                    <TableCell className="text-secondary hidden md:table-cell">{product.category || '-'}</TableCell>
                                    <TableCell className="text-right text-secondary">
                                        {product.price_sale ? `$${Number(product.price_sale).toLocaleString('es-CL')}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-secondary">{product.stock_current}</TableCell>
                                    <TableCell>
                                        {product.stock_current <= product.stock_minimum ? (
                                            <Badge
                                                variant="destructive"
                                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOrderProduct(product)
                                                }}
                                            >
                                                Stock Crítico (Click para ordenar)
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">En Stock</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Abrir menú de acciones" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                                                {product.stock_current <= product.stock_minimum && !['saas', 'services', 'marketing'].includes(userIndustry) && (
                                                    <DropdownMenuItem
                                                        className="text-amber-500 focus:text-amber-500 focus:bg-amber-500/10 font-bold"
                                                        onClick={(e) => { e.stopPropagation(); setOrderProduct(product); }}
                                                    >
                                                        <ShoppingCart className="mr-2 h-4 w-4" /> Ordenar a proveedor
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(product); }}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar Producto
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setProductToDelete(product)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
                            <span className="text-xs text-secondary">{start}–{end} de {sortedProducts.length}</span>
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el producto <strong className="text-foreground">{productToDelete?.name}</strong> de tu inventario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar Producto
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-background-dark border-border-dark text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Editar Producto</DialogTitle>
                        <DialogDescription className="text-secondary">
                            Modifica los datos del producto.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name" className="text-foreground">Nombre *</Label>
                                <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-sku" className="text-foreground">SKU</Label>
                                    <Input id="edit-sku" value={editForm.sku} onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-category" className="text-foreground">Categoría</Label>
                                    <Input id="edit-category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-price-sale" className="text-foreground">Precio Venta ($)</Label>
                                    <Input id="edit-price-sale" type="number" step="0.01" min="0" value={editForm.price_sale} onChange={(e) => setEditForm({ ...editForm, price_sale: e.target.value })} className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-price-cost" className="text-foreground">Costo ($)</Label>
                                    <Input id="edit-price-cost" type="number" step="0.01" min="0" value={editForm.price_cost} onChange={(e) => setEditForm({ ...editForm, price_cost: e.target.value })} className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-stock" className="text-foreground">Stock Actual</Label>
                                    <Input id="edit-stock" type="number" min="0" value={editForm.stock_current} onChange={(e) => setEditForm({ ...editForm, stock_current: e.target.value })} className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-stock-min" className="text-foreground">Stock Mínimo</Label>
                                    <Input id="edit-stock-min" type="number" min="0" value={editForm.stock_minimum} onChange={(e) => setEditForm({ ...editForm, stock_minimum: e.target.value })} className="bg-surface-dark border-border-dark/50 text-foreground focus-visible:ring-primary/50" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="border-border-dark bg-transparent text-secondary hover:text-foreground">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editLoading} className="bg-primary text-background-dark hover:bg-primary/90 font-bold">
                                {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <SupplierOrderDialog
                open={!!orderProduct}
                onOpenChange={(isOpen) => !isOpen && setOrderProduct(null)}
                products={orderProduct ? [orderProduct] : []}
                industry={userIndustry}
            />
        </div>
    )
}
