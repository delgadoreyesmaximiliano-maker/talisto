import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

export default async function AppDashboard() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user's company profile
    const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    const companyId = (userProfile as any)?.company_id

    if (!companyId) {
        redirect('/app/company/setup')
    }

    // 1. Fetch Sales Data
    const { data: sales } = await supabase
        .from('sales')
        .select('amount, created_at')
        .eq('company_id', companyId)

    const totalRevenue = (sales as any[])?.reduce((acc, sale) => acc + Number(sale.amount), 0) || 0
    const salesCount = sales?.length || 0

    // 2. Fetch Customers Data
    const { data: customersData } = await supabase
        .from('customers')
        .select('mrr, status')
        .eq('company_id', companyId)

    const customers = (customersData as any[]) || []
    const activeCustomers = customers.filter(c => c.status === 'active').length || 0
    const totalMrr = customers.reduce((acc, c) => acc + Number(c.mrr || 0), 0) || 0

    // 3. Fetch Inventory Data
    const { data: productsData } = await supabase
        .from('products')
        .select('id, name, stock_current, stock_minimum')
        .eq('company_id', companyId)

    const products = (productsData as any[]) || []
    const activeProductsCount = products.length || 0
    const lowStockProducts = products.filter(p => p.stock_current <= p.stock_minimum) || []

    // 4. Prepare monthly sales chart data
    const monthlySales: { [key: string]: number } = {}
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Initialize all months to 0
    monthNames.forEach((_, i) => { monthlySales[i.toString()] = 0 })

        // Aggregate sales by month
        ; (sales as any[])?.forEach(sale => {
            const month = new Date(sale.created_at).getMonth()
            monthlySales[month.toString()] = (monthlySales[month.toString()] || 0) + Number(sale.amount)
        })

    const chartData = monthNames.map((name, i) => ({
        name,
        value: monthlySales[i.toString()] || 0,
    }))

    const maxChartValue = Math.max(...chartData.map(d => d.value), 1)

    // 5. Recent sales for activity
    const { data: recentSalesData } = await supabase
        .from('sales')
        .select('id, amount, created_at, channel')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5)

    const recentSales = (recentSalesData as any[]) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen General</h1>
                <p className="text-sm text-muted-foreground">
                    Hola, {user.email?.split('@')[0]} 👋
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Revenue */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${totalRevenue.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            <p className="text-xs text-emerald-500 font-medium">
                                {salesCount} ventas registradas
                            </p>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/10" />
                </Card>

                {/* Total MRR */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ingreso Recurrente</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            ${totalMrr.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            MRR mensual predecible
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 to-emerald-500/10" />
                </Card>

                {/* Active Customers */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Activos</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-secondary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            +{activeCustomers}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Perfiles activos en CRM
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary/40 to-secondary/10" />
                </Card>

                {/* Inventory Status */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Productos Activos</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {activeProductsCount}
                        </div>
                        {lowStockProducts.length > 0 ? (
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowDownRight className="w-3 h-3 text-red-500" />
                                <p className="text-xs text-red-500 font-medium">
                                    {lowStockProducts.length} bajo stock mínimo
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-emerald-500 font-medium mt-1">
                                ✓ Stock saludable
                            </p>
                        )}
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 to-amber-500/10" />
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Monthly Sales Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Ventas Mensuales</CardTitle>
                        <CardDescription>
                            Distribución de ingresos por mes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-1 h-44">
                            {chartData.map((d, i) => {
                                const height = maxChartValue > 0 ? (d.value / maxChartValue) * 100 : 0
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {d.value > 0 ? `$${(d.value / 1000).toFixed(0)}k` : ''}
                                        </span>
                                        <div
                                            className="w-full rounded-t-sm bg-gradient-to-t from-primary/80 to-secondary/60 transition-all duration-500 hover:from-primary hover:to-secondary cursor-default min-h-[2px]"
                                            style={{ height: `${Math.max(height, 2)}%` }}
                                            title={`${d.name}: $${d.value.toLocaleString('es-CL')}`}
                                        />
                                        <span className="text-[10px] text-muted-foreground">{d.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>
                            Últimas ventas registradas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSales.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center p-4 border rounded-lg bg-muted/20">
                                No hay ventas registradas todavía.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSales.map((sale) => {
                                    const date = new Date(sale.created_at)
                                    const timeAgo = getTimeAgo(date)
                                    return (
                                        <div key={sale.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <DollarSign className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    ${Number(sale.amount).toLocaleString('es-CL')}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sale.channel || 'Directo'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                            <ArrowDownRight className="w-5 h-5" />
                            Alertas de Stock Bajo
                        </CardTitle>
                        <CardDescription className="text-red-600/70 dark:text-red-400/70">
                            {lowStockProducts.length} producto{lowStockProducts.length > 1 ? 's' : ''} requiere{lowStockProducts.length > 1 ? 'n' : ''} atención inmediata.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {lowStockProducts.slice(0, 8).map(product => (
                                <div key={product.id} className="flex items-center justify-between border border-red-200 dark:border-red-900 rounded-lg p-3 bg-white dark:bg-red-950/30">
                                    <div>
                                        <p className="font-medium text-sm text-foreground">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">Mínimo: {product.stock_minimum}</p>
                                    </div>
                                    <div className="font-bold text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/50 px-2.5 py-1 rounded-md">
                                        {product.stock_current}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
