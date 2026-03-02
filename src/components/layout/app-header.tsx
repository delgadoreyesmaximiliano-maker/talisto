/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { createClient } from '@/lib/supabase/client'
import { SidebarTrigger } from "@/components/ui/sidebar"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, Package, ShoppingBag, Users, AlertTriangle, TrendingUp, X, ShoppingCart } from 'lucide-react'
import { SupplierOrderDialog } from '@/components/supplier-order-dialog'

interface Notification {
    id: string
    icon: React.ReactNode
    title: string
    description: string
    type: 'warning' | 'info' | 'success'
    href?: string
}

const SEARCH_LINKS = [
    { label: 'Dashboard', href: '/app', keywords: ['dashboard', 'inicio', 'home', 'resumen'] },
    { label: 'Ventas', href: '/app/sales', keywords: ['ventas', 'venta', 'factura', 'transaccion'] },
    { label: 'Inventario', href: '/app/inventory', keywords: ['inventario', 'productos', 'stock', 'producto'] },
    { label: 'Clientes (CRM)', href: '/app/crm', keywords: ['clientes', 'crm', 'cliente', 'contacto'] },
    { label: 'IA / CFO Virtual', href: '/app/ai', keywords: ['ia', 'ai', 'inteligencia', 'cfo', 'analisis', 'tali'] },
    { label: 'Insights IA', href: '/app/ai-insights', keywords: ['insights', 'recomendaciones', 'cfo'] },
    { label: 'Integraciones', href: '/app/integrations', keywords: ['integraciones', 'shopify', 'mercadolibre', 'transbank'] },
    { label: 'Configuración', href: '/app/settings', keywords: ['configuracion', 'settings', 'perfil', 'cuenta', 'password'] },
]

export function AppHeader() {
    const [user, setUser] = useState<any>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchOpen, setSearchOpen] = useState(false)
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [supplierOrderOpen, setSupplierOrderOpen] = useState(false)
    const [criticalProductsList, setCriticalProductsList] = useState<{ name: string; stock_current: number; stock_minimum: number }[]>([])
    const [userIndustry, setUserIndustry] = useState('')
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Fetch notifications (stock alerts, sales today)
    useEffect(() => {
        if (!user) return

        const fetchNotifications = async () => {
            const { data: userProfile } = await supabase
                .from('users')
                .select('company_id, companies(industry)')
                .eq('id', user.id)
                .single()

            const companyId = (userProfile as any)?.company_id
            const industry = (userProfile as any)?.companies?.industry || ''
            setUserIndustry(industry)
            if (!companyId) return

            const notifs: Notification[] = []

            // Check critical stock
            const { data: lowStock } = await supabase
                .from('products')
                .select('name, stock_current, stock_minimum')
                .eq('company_id', companyId)
            // Filter client-side since Supabase doesn't support comparing column vs column easily without RPC

            const criticalProducts = (lowStock || []).filter((p: any) => p.stock_current <= p.stock_minimum)
            setCriticalProductsList(criticalProducts)

            if (criticalProducts.length > 0) {
                notifs.push({
                    id: 'low-stock',
                    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                    title: `${criticalProducts.length} producto${criticalProducts.length > 1 ? 's' : ''} con stock crítico`,
                    description: criticalProducts.slice(0, 2).map((p: any) => p.name).join(', ') + (criticalProducts.length > 2 ? '...' : ''),
                    type: 'warning',
                    href: '/app/inventory',
                })
            }

            // Check today's sales
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const { data: todaySales } = await supabase
                .from('sales')
                .select('amount')
                .eq('company_id', companyId)
                .gte('created_at', today.toISOString())

            if (todaySales && todaySales.length > 0) {
                const totalToday = todaySales.reduce((acc: number, s: any) => acc + Number(s.amount), 0)
                notifs.push({
                    id: 'today-sales',
                    icon: <TrendingUp className="w-4 h-4 text-primary" />,
                    title: `${todaySales.length} venta${todaySales.length > 1 ? 's' : ''} hoy`,
                    description: `$${totalToday.toLocaleString('es-CL')} facturado`,
                    type: 'success',
                    href: '/app/sales',
                })
            }

            setNotifications(notifs)
        }

        fetchNotifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    // Debounce cleanup
    useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Keyboard shortcut Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(true)
                setTimeout(() => inputRef.current?.focus(), 100)
            }
            if (e.key === 'Escape') {
                setSearchOpen(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const filteredLinks = searchQuery.trim()
        ? SEARCH_LINKS.filter(link =>
            link.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.keywords.some(k => k.includes(searchQuery.toLowerCase()))
        )
        : SEARCH_LINKS

    const handleSearchSelect = (href: string) => {
        setSearchOpen(false)
        setSearchQuery('')
        router.push(href)
    }

    const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

    return (
        <header className="h-20 flex items-center px-6 shrink-0 bg-surface-dark/80 backdrop-blur-md border-b border-border-dark justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
                <div className="h-6 w-[1px] bg-border-dark hidden md:block" />

                {/* Search */}
                <div ref={searchRef} className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary z-10" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar... (Ctrl+K)"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchOpen(true)
                            const val = e.target.value
                            if (debounceRef.current) clearTimeout(debounceRef.current)
                            debounceRef.current = setTimeout(() => setSearchQuery(val), 300)
                        }}
                        onFocus={() => setSearchOpen(true)}
                        className="pl-10 pr-4 py-2 bg-background-dark text-white placeholder:text-secondary border border-border-dark rounded-xl text-sm transition-all w-64 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                    {searchQuery && (
                        <button aria-label="Limpiar búsqueda" onClick={() => { setSearchQuery(''); inputRef.current?.focus() }} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    )}

                    {searchOpen && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-background-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-2 max-h-72 overflow-y-auto">
                                {filteredLinks.length === 0 ? (
                                    <div className="p-4 text-center text-secondary text-sm">Sin resultados</div>
                                ) : (
                                    filteredLinks.map((link) => (
                                        <button
                                            key={link.href}
                                            onClick={() => handleSearchSelect(link.href)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-primary/10 text-secondary hover:text-white transition-colors"
                                        >
                                            {link.href.includes('inventory') ? <Package className="w-4 h-4 shrink-0" /> :
                                                link.href.includes('sales') ? <ShoppingBag className="w-4 h-4 shrink-0" /> :
                                                    link.href.includes('crm') ? <Users className="w-4 h-4 shrink-0" /> :
                                                        <Search className="w-4 h-4 shrink-0" />}
                                            <span className="text-sm font-medium">{link.label}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                            <div className="border-t border-border-dark px-3 py-2 text-[10px] text-secondary">
                                <kbd className="px-1.5 py-0.5 bg-surface-dark rounded text-[10px] border border-border-dark">Ctrl+K</kbd> para buscar
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button aria-label="Notificaciones" className="p-2 text-secondary hover:text-white rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-surface-dark">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 mt-2 border border-border-dark bg-background-dark shadow-2xl rounded-2xl p-2">
                        <DropdownMenuLabel className="font-bold px-3 py-2 text-white text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Notificaciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border-dark mx-1" />
                        {notifications.length === 0 ? (
                            <div className="px-3 py-6 text-center text-secondary text-sm">
                                Sin notificaciones nuevas
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <DropdownMenuItem
                                    key={notif.id}
                                    className="rounded-xl flex items-start gap-3 p-3 cursor-pointer hover:bg-white/5 transition-all"
                                    onSelect={(e) => {
                                        if (notif.id === 'low-stock' && !['saas', 'services', 'marketing'].includes(userIndustry)) {
                                            // Let Radix close the dropdown before opening dialog to avoid pointer-events block
                                            setTimeout(() => setSupplierOrderOpen(true), 200)
                                        } else if (notif.href) {
                                            router.push(notif.href)
                                        }
                                    }}
                                >
                                    <div className="mt-0.5 shrink-0">{notif.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium">{notif.title}</p>
                                        <p className="text-secondary text-xs mt-0.5">{notif.description}</p>
                                        {notif.id === 'low-stock' && !['saas', 'services', 'marketing'].includes(userIndustry) && (
                                            <span
                                                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 rounded-lg px-2 py-1 transition-colors"
                                            >
                                                <ShoppingCart className="w-3 h-3" aria-hidden="true" />
                                                Click para ordenar a proveedor
                                            </span>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />

                <div className="h-8 w-[1px] bg-border-dark" />

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button aria-label="Menú de usuario" className="flex items-center gap-3 outline-none p-1 pr-3 rounded-xl hover:bg-white/5 transition-all group">
                                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary transition-all">
                                    <AvatarFallback className="bg-primary text-background-dark font-bold text-sm shadow-inner">{emailInitial}</AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-white leading-none">{user.email?.split('@')[0]}</p>
                                    <p className="text-[10px] text-secondary leading-none mt-1 uppercase font-bold tracking-tight">Admin</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 border border-border-dark bg-background-dark shadow-2xl rounded-2xl p-2">
                            <DropdownMenuLabel className="font-bold px-3 py-2 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Mi Cuenta
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border-dark mx-1" />
                            <DropdownMenuItem onClick={() => router.push('/app/settings')} className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-primary/10 hover:text-primary text-secondary font-medium transition-all group">
                                <User className="w-4 h-4 text-secondary group-hover:text-primary" />
                                <span>Ver Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border-dark mx-1" />
                            <DropdownMenuItem
                                className="rounded-xl flex items-center justify-start p-3 cursor-pointer bg-transparent text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold transition-all"
                                onSelect={(e) => {
                                    e.preventDefault()
                                    setLogoutOpen(true)
                                }}
                            >
                                <span className="w-full text-left">Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>

                    </DropdownMenu>
                )}

                <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                    <AlertDialogContent className="bg-surface-dark border border-border-dark">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Cerrar sesión?</AlertDialogTitle>
                            <AlertDialogDescription className="text-secondary">
                                Tu sesión se cerrará y serás redirigido al login.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-border-dark text-secondary bg-transparent hover:bg-white/5">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500/80 hover:bg-red-500 text-white border-0"
                                onClick={async () => {
                                    await supabase.auth.signOut()
                                    window.location.href = '/login'
                                }}
                            >
                                Cerrar sesión
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <SupplierOrderDialog
                    open={supplierOrderOpen}
                    onOpenChange={setSupplierOrderOpen}
                    products={criticalProductsList}
                    industry={userIndustry}
                />
            </div>
        </header>
    )
}
