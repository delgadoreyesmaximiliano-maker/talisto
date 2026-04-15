import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle, Bell } from 'lucide-react'
import Link from 'next/link'
import { DownloadReportButton } from './components/download-report-button'

interface SaleRow { amount: number; created_at: string }
interface CustomerRow { mrr: number | null; status: string }
interface ProductRow { id: string; name: string; stock_current: number; stock_minimum: number }
interface RecentSaleRow { id: string; amount: number; created_at: string; source: string | null }
interface AiRecommendation {
    id: string
    title: string
    description: string
    type: 'opportunity' | 'attention' | string
    created_at: string
}

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

    const companyId = (userProfile as { company_id: string } | null)?.company_id

    if (!companyId) {
        redirect('/app/company/setup')
    }

    // Obtener rubro e info de la empresa para personalizar dashboard
    const { data: companyData } = await supabase
        .from('companies')
        .select('industry, settings, name')
        .eq('id', companyId)
        .single<{ industry: string | null; settings: Record<string, unknown> | null; name: string | null }>()

    const industry = companyData?.industry ?? 'other'

    // FIX #5: Manejo de errores en queries críticas
    // Queries 1-3 son independientes: se ejecutan en paralelo para mejor performance
    const [
        { data: salesData, error: salesError },
        { data: customersData, error: customersError },
        { data: productsData, error: productsError },
    ] = await Promise.all([
        // 1. Fetch Sales Data — limitado al año actual para no traer datos históricos excesivos
        supabase
            .from('sales')
            .select('amount, created_at')
            .eq('company_id', companyId)
            .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1000)
            .returns<SaleRow[]>(),

        // 2. Fetch Customers Data
        supabase
            .from('customers')
            .select('mrr, status')
            .eq('company_id', companyId)
            .limit(500)
            .returns<CustomerRow[]>(),

        // 3. Fetch Inventory Data
        supabase
            .from('products')
            .select('id, name, stock_current, stock_minimum')
            .eq('company_id', companyId)
            .limit(500)
            .returns<ProductRow[]>(),
    ])

    // Si alguna query crítica falla, mostramos error amigable
    const criticalError = salesError || customersError || productsError
    if (criticalError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Error al cargar los datos</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                    No pudimos obtener la información de tu negocio. Por favor recarga la página o contacta soporte si el problema persiste.
                </p>
                <p className="text-xs text-secondary font-mono bg-surface-dark px-3 py-1 rounded-lg border border-border-dark">
                    Error interno del servidor
                </p>
            </div>
        )
    }

    const sales: SaleRow[] = salesData || []
    const customers: CustomerRow[] = customersData || []
    const products: ProductRow[] = productsData || []

    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.amount), 0)
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const totalMrr = customers.reduce((acc, c) => acc + Number(c.mrr || 0), 0)
    const activeProductsCount = products.length
    const lowStockProducts = products.filter(p => p.stock_current <= p.stock_minimum)

    // Today vs Yesterday metrics
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)

    const todaySales = sales.filter(s => new Date(s.created_at) >= todayStart)
    const yesterdaySales = sales.filter(s => {
        const d = new Date(s.created_at)
        return d >= yesterdayStart && d < todayStart
    })

    const todayRevenue = todaySales.reduce((acc, s) => acc + Number(s.amount), 0)
    const yesterdayRevenue = yesterdaySales.reduce((acc, s) => acc + Number(s.amount), 0)
    const todayVsYesterdayPercent: number | null = yesterdayRevenue > 0
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
        : todayRevenue > 0 ? 100 : null

    // 4. Prepare monthly sales chart data
    const monthlySales: { [key: string]: number } = {}
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    monthNames.forEach((_, i) => { monthlySales[i.toString()] = 0 })

    sales.forEach(sale => {
        const month = new Date(sale.created_at).getMonth()
        monthlySales[month.toString()] = (monthlySales[month.toString()] || 0) + Number(sale.amount)
    })

    const chartData = monthNames.map((name, i) => ({
        name,
        value: monthlySales[i.toString()] || 0,
    }))

    const maxChartValue = Math.max(...chartData.map(d => d.value), 1)

    // FIX #4: Detectar dinámicamente el mes con mayor valor
    const maxValueIndex = chartData.reduce(
        (maxIdx, d, i) => (d.value > chartData[maxIdx].value ? i : maxIdx),
        0
    )

    // BUG-08: % cambio real mes actual vs mes anterior
    const currentMonthIdx = new Date().getMonth()
    const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1
    const currentMonthRevenue = chartData[currentMonthIdx]?.value ?? 0
    const prevMonthRevenue = chartData[prevMonthIdx]?.value ?? 0
    const revenueChangePercent: number | null = prevMonthRevenue > 0
        ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : null

    // BUG-09: Últimos 7 meses de datos reales para mini-chart de ventas
    const last7MonthsRevenue = Array.from({ length: 7 }, (_, i) => {
        const idx = (currentMonthIdx - 6 + i + 12) % 12
        return chartData[idx]?.value ?? 0
    })
    const maxLast7 = Math.max(...last7MonthsRevenue, 1)
    const last7RevenueHeights = last7MonthsRevenue.map(v => Math.max(10, Math.round((v / maxLast7) * 100)))

    // FIX #1: Campo `source` en lugar de `channel`
    // 5. Recent sales
    const { data: recentSalesData } = await supabase
        .from('sales')
        .select('id, amount, created_at, source')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5)
        .returns<RecentSaleRow[]>()

    const recentSales: RecentSaleRow[] = recentSalesData || []

    // TAREA 2: Generar recomendaciones de IA dinámicas desde los datos existentes
    // (sin query extra — usamos products y sales ya cargados)
    type DynamicRecommendation = {
        id: string
        type: 'opportunity' | 'attention'
        label: string
        title: string
        description: string
        actionLabel: string
        actionHref: string
    }

    const dynamicRecommendations: DynamicRecommendation[] = []

    // Recomendación 1: Stock crítico → "Atención"
    if (lowStockProducts.length > 0) {
        const criticalProduct = lowStockProducts[0] as ProductRow
        dynamicRecommendations.push({
            id: 'low-stock',
            type: 'attention',
            label: 'Atención',
            title: `Stock crítico: "${criticalProduct.name}"`,
            description: `Tienes ${lowStockProducts.length} producto${lowStockProducts.length > 1 ? 's' : ''} con stock bajo el mínimo. Sin reposición podrías perder ventas en los próximos días.`,
            actionLabel: 'Ver Inventario',
            actionHref: '/app/inventory',
        })
    }

    // Recomendación 2: Ventas recientes altas → "Oportunidad"
    const recentRevenue = recentSales.reduce((acc, s) => acc + Number(s.amount), 0)
    const avgRecentSale = recentSales.length > 0 ? recentRevenue / recentSales.length : 0
    if (recentSales.length >= 3 && avgRecentSale > 0) {
        dynamicRecommendations.push({
            id: 'recent-sales-momentum',
            type: 'opportunity',
            label: 'Oportunidad',
            title: 'Momentum de ventas activo',
            description: `Tus últimas ${recentSales.length} ventas suman $${recentRevenue.toLocaleString('es-CL')}. Es buen momento para activar una campaña o contactar clientes inactivos.`,
            actionLabel: 'Ver Ventas',
            actionHref: '/app/sales',
        })
    }

    // Si no hay recomendaciones dinámicas, intentar con la tabla de BD
    const { data: aiRecommendationsData } = dynamicRecommendations.length === 0
        ? await supabase
            .from('ai_recommendations')
            .select('id, title, description, type, created_at')
            .eq('company_id', companyId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(2)
        : { data: null }

    const dbRecommendations = (aiRecommendationsData as AiRecommendation[]) || []

    // --- Configuración dinámica por rubro ---
    const welcomeMessages: Record<string, string> = {
        restaurant: 'Aquí tienes el resumen de tu restaurant para hoy.',
        ecommerce: 'Aquí tienes el rendimiento de tu tienda online.',
        retail: 'Aquí tienes el estado de tu comercio para hoy.',
        saas: 'Aquí tienes las métricas de tu SaaS para hoy.',
        marketing: 'Aquí tienes el rendimiento de tu agencia.',
        services: 'Aquí tienes el estado de tus proyectos y clientes.',
        manufacturing: 'Aquí tienes el estado de tu producción.',
        other: 'Aquí tienes el resumen de tu negocio para hoy.',
    }

    const kpiConfig: Record<string, { label: string; secondaryLabel: string }> = {
        restaurant: { label: 'Ventas del Día', secondaryLabel: 'Ticket Promedio' },
        ecommerce: { label: 'Ventas Online', secondaryLabel: 'Conversión' },
        retail: { label: 'Ventas Totales', secondaryLabel: 'Ingreso Mensual' },
        saas: { label: 'MRR', secondaryLabel: 'Churn Rate' },
        services: { label: 'Proyectos Activos', secondaryLabel: 'Horas Facturadas' },
        default: { label: 'Ventas Totales', secondaryLabel: 'Ingreso Mensual' },
    }

    const aiSectionTitle: Record<string, string> = {
        restaurant: '🍽️ Insights para tu Restaurant',
        ecommerce: '🛒 Insights para tu Tienda Online',
        retail: '🏪 Insights para tu Comercio',
        saas: '🚀 Insights para tu SaaS',
        services: '💼 Insights para tus Servicios',
        default: '✨ Recomendaciones de IA',
    }

    const currentKpiConfig = kpiConfig[industry] ?? kpiConfig.default
    const currentWelcomeMessage = welcomeMessages[industry] ?? welcomeMessages.other
    const currentAiTitle = aiSectionTitle[industry] ?? aiSectionTitle.default

    // OVERRIDE dinámico por IA si existe config previa
    const dashboardConfig = (companyData?.settings as any)?.dashboard_config
    const kpi_1_label = dashboardConfig?.kpi_1_label ?? currentKpiConfig.label
    const kpi_2_label = dashboardConfig?.kpi_2_label ?? currentKpiConfig.secondaryLabel
    const welcomeSubtitle = dashboardConfig?.welcome_message ?? currentWelcomeMessage

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-dark/40 p-1 rounded-[32px] border border-border-dark/20 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center gap-6 p-4">
                    <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 glow-primary-sm shrink-0">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Portal de Mando
                        </h1>
                        <p className="text-secondary font-bold text-lg gradient-text-shine">
                            {welcomeSubtitle}
                        </p>
                    </div>

                    {companyData?.settings?.integrations && Object.keys(companyData.settings.integrations).length > 0 && (
                        <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-left-4 ml-2">
                            <div className="flex -space-x-3">
                                {Object.keys(companyData.settings.integrations).map(key => (
                                    <div key={key} className="w-10 h-10 rounded-full bg-surface-dark border-2 border-primary/30 shadow-xl flex items-center justify-center text-[11px] font-black uppercase overflow-hidden ring-4 ring-background-dark">
                                        {key.slice(0, 2)}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(19,236,128,0.8)]" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-0.5">Live Sync</span>
                                </div>
                                <span className="text-xs text-secondary font-black leading-none">{Object.keys(companyData.settings.integrations).length} conectadas</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 p-4 pr-6">
                    <DownloadReportButton sales={recentSales} />
                    <Link href="/app/ai" className="h-12 px-6 bg-primary text-white rounded-xl font-black text-sm hover:glow-primary transition-all flex items-center gap-2 btn-3d shadow-xl">
                        Preguntar a Tali
                        <Sparkles className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Main Layout: 3 Columns on lg screens, stacked on mobile */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">

                {/* Left Column: KPIs (3 cols width) */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:flex lg:flex-col">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 ml-1">HUD Operativo</h3>
                    
                    {/* Total Revenue */}
                    <div className="relative overflow-hidden group glass-card card-3d p-6 rounded-[24px]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-secondary">{kpi_1_label}</p>
                            {revenueChangePercent !== null && (
                                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm ${revenueChangePercent >= 0 ? 'text-primary bg-primary/10' : 'text-red-400 bg-red-400/10'}`}>
                                    {revenueChangePercent >= 0
                                        ? <ArrowUpRight className="w-3 h-3" />
                                        : <ArrowDownRight className="w-3 h-3" />
                                    }
                                    {revenueChangePercent >= 0 ? '+' : ''}{revenueChangePercent}%
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ${totalRevenue.toLocaleString('es-CL')}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">Hoy: <span className="text-foreground font-bold">${todayRevenue.toLocaleString('es-CL')}</span></span>
                            {todayVsYesterdayPercent !== null && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${todayVsYesterdayPercent >= 0 ? 'text-primary bg-primary/10' : 'text-red-400 bg-red-400/10'}`}>
                                    {todayVsYesterdayPercent >= 0 ? '+' : ''}{todayVsYesterdayPercent}% vs ayer
                                </span>
                            )}
                            <span className="text-[10px] text-secondary">({todaySales.length} venta{todaySales.length !== 1 ? 's' : ''})</span>
                        </div>
                        {/* Mini-chart con últimos 7 meses reales */}
                        <div className="mt-4 h-12 w-full flex items-end justify-between gap-1 opacity-50">
                            {last7RevenueHeights.map((h, i) => (
                                <div key={i} className="w-full bg-gradient-to-t from-primary/10 to-primary rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>

                    {/* MRR / Ticket Promedio */}
                    {['saas', 'services', 'marketing'].includes(industry) ? (
                        <div className="relative overflow-hidden group glass-panel p-5 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-secondary">{kpi_2_label}</p>
                            </div>
                            <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                ${totalMrr.toLocaleString('es-CL')}
                            </h2>
                            <div className="mt-4 h-12 w-full flex items-end justify-between gap-1 opacity-50">
                                {last7RevenueHeights.map((h, i) => (
                                    <div key={i} className="w-full bg-gradient-to-t from-purple-500/10 to-purple-500 rounded-t-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden group glass-panel p-5 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-secondary">{kpi_2_label}</p>
                            </div>
                            <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                ${sales.length > 0 ? Math.round(totalRevenue / sales.length).toLocaleString('es-CL') : '0'}
                            </h2>
                        </div>
                    )}

                    {/* Customers / Users  vs Products */}
                    {['saas', 'services', 'marketing'].includes(industry) ? (
                        <div className="relative overflow-hidden group glass-panel p-5 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-secondary">Clientes Activos</p>
                            </div>
                            <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {activeCustomers}
                            </h2>
                            <div className="mt-4 h-12 w-full flex items-center gap-2 opacity-60">
                                <div className="flex-1 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, activeCustomers * 10)}%` }} />
                                </div>
                                <span className="text-[10px] text-secondary font-bold shrink-0">{activeCustomers} activos</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden group glass-panel p-5 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-secondary">Productos en Catálogo</p>
                            </div>
                            <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {activeProductsCount}
                            </h2>
                            <div className="mt-4 h-12 w-full flex items-center gap-2 opacity-60">
                                <Link href="/app/inventory" className="text-xs font-bold text-primary hover:text-foreground transition-colors">
                                    Gestionar inventario →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center Column: Charts and Map (6 cols width) */}
                <div className="lg:col-span-6 space-y-6 min-w-0">
                    {/* Performance Overview Chart */}
                    <Card className="glass-panel border-border-dark shadow-sm rounded-2xl overflow-hidden bg-surface-dark border">
                        <CardHeader className="border-b border-border-dark/50 px-6 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>Rendimiento Anual</CardTitle>
                            <span className="text-xs font-medium text-secondary bg-background-dark px-3 py-1 rounded-md border border-border-dark">Este año</span>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-end gap-2 h-[280px] w-full pt-4">
                                {chartData.map((d, i) => {
                                    const height = maxChartValue > 0 ? (d.value / maxChartValue) * 100 : 0
                                    const isMax = i === maxValueIndex && d.value > 0
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full">
                                            <div className="w-full flex-1 flex flex-col justify-end relative">
                                                {d.value > 0 && (
                                                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-primary/50 text-foreground text-[10px] font-bold px-2 py-1 rounded-md z-10 whitespace-nowrap shadow-xl">
                                                        ${(d.value / 1000).toFixed(0)}k
                                                    </div>
                                                )}
                                                <div
                                                    className={`w-full rounded-t-sm transition-all duration-500 opacity-80 hover:opacity-100 ${isMax
                                                        ? 'bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_15px_rgba(19,236,128,0.3)]'
                                                        : 'bg-primary/20 hover:bg-primary/40'
                                                        }`}
                                                    style={{ height: `${Math.max(height, 5)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-secondary uppercase pt-2 border-t border-border-dark w-full text-center block">{d.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    <Card className="glass-card card-3d border-primary/10 shadow-sm rounded-[24px] overflow-hidden relative group border-0">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />
                        <CardHeader className="border-b border-border/50 px-8 py-6 flex flex-row items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary-sm">
                                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            </div>
                            <CardTitle className="text-lg font-black text-foreground tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{currentAiTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid sm:grid-cols-2 gap-6 relative z-10">
                            {dynamicRecommendations.length > 0 ? (
                                dynamicRecommendations.map((rec) => (
                                    <div key={rec.id} className={`glass-panel card-3d border-0 p-6 rounded-2xl shadow-xl transition-all duration-300 ${rec.type === 'opportunity' ? 'bg-primary/5 hover:bg-primary/10' : 'bg-amber-500/5 hover:bg-amber-500/10'}`}>
                                        <div className="flex justify-between mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${rec.type === 'opportunity' ? 'text-primary bg-primary/10' : 'text-amber-500 bg-amber-500/10'}`}>{rec.label}</span>
                                        </div>
                                        <h3 className="font-black text-foreground text-base mb-2 tracking-tight">{rec.title}</h3>
                                        <p className="text-xs text-secondary leading-relaxed mb-5 font-medium">{rec.description}</p>
                                        <Link href={rec.actionHref} className={`text-xs font-black flex items-center gap-2 group/btn ${rec.type === 'opportunity' ? 'text-primary' : 'text-amber-500'}`}>
                                            {rec.actionLabel} 
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </div>
                                ))
                            ) : dbRecommendations.length > 0 ? (
                                dbRecommendations.map((rec) => (
                                    <div key={rec.id} className={`glass-panel card-3d border-0 p-6 rounded-2xl shadow-xl transition-all duration-300 ${rec.type === 'opportunity' ? 'bg-primary/5 hover:bg-primary/10' : 'bg-amber-500/5 hover:bg-amber-500/10'}`}>
                                        <div className="flex justify-between mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${rec.type === 'opportunity' ? 'text-primary bg-primary/10' : 'text-amber-500 bg-amber-500/10'}`}>{rec.type === 'opportunity' ? 'Oportunidad' : 'Atención'}</span>
                                        </div>
                                        <h3 className="font-black text-foreground text-base mb-2 tracking-tight">{rec.title}</h3>
                                        <p className="text-xs text-secondary leading-relaxed font-medium">{rec.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 flex flex-col items-center gap-6 py-10 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-float">
                                        <Sparkles className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="max-w-xs">
                                        <p className="text-lg font-black text-foreground mb-2">Todo bajo control</p>
                                        <p className="text-sm text-secondary font-medium leading-relaxed">Sin alertas activas en órbitas cercanas. ¿Quieres proyectar el próximo trimestre?</p>
                                    </div>
                                    <Link href="/app/ai" className="h-12 px-6 rounded-xl bg-primary/10 text-primary hover:bg-primary text-sm font-black transition-all flex items-center gap-2 hover:text-white glow-primary-sm">
                                        Consultar Oráculo <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Other Stats & Activity (3 cols width) */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:space-y-0 lg:flex lg:flex-col">
                    {/* Top Selling Products proxy or Inventory Status */}
                    {!['saas', 'services', 'marketing'].includes(industry) && (
                        <div className="glass-panel p-5 rounded-2xl border border-border-dark">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Estado de Stock</h3>
                            </div>

                            {lowStockProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {lowStockProducts.slice(0, 3).map(p => (
                                        <div key={p.id} className="flex justify-between items-center text-sm">
                                            <span className="text-secondary truncate pr-2">{p.name}</span>
                                            <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded">{p.stock_current} u.</span>
                                        </div>
                                    ))}
                                    {lowStockProducts.length > 3 && (
                                        <div className="text-xs text-center text-secondary pt-2">Y {lowStockProducts.length - 3} más...</div>
                                    )}
                                    <p className="text-xs text-amber-500 pt-2 text-center bg-amber-500/10 rounded-lg p-2 mt-2">
                                        💡 Usa la <Bell className="w-3 h-3 inline pb-0.5" /> campana de notificaciones arriba para ordenar
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-primary p-3 bg-primary/5 rounded-xl text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Stock Saludable
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recent Activities */}
                    <div className="glass-panel p-5 rounded-2xl border border-border-dark flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Últimas Ventas</h3>
                        </div>

                        {recentSales.length === 0 ? (
                            <p className="text-sm text-secondary text-center py-4">Sin ventas recientes</p>
                        ) : (
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-dark before:to-transparent">
                                {recentSales.slice(0, 4).map((sale) => {
                                    const timeAgo = getTimeAgo(new Date(sale.created_at))
                                    return (
                                        <div key={sale.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border-dark bg-surface-dark group-[.is-active]:bg-primary/20 text-secondary group-[.is-active]:text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                                <ShoppingBag className="w-3 h-3" />
                                            </div>
                                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-border-dark bg-background-dark shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-foreground text-sm">${Number(sale.amount).toLocaleString('es-CL')}</span>
                                                </div>
                                                <div className="text-xs text-secondary flex justify-between">
                                                    <span>{sale.source || 'Directo'}</span>
                                                    <span>{timeAgo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        <Link href="/app/sales" className="mt-4 block text-center text-xs font-bold text-primary hover:text-foreground transition-colors">Ver todas</Link>
                    </div>

                    {/* System Status placeholder */}
                    <div className="glass-panel p-4 rounded-2xl border border-border-dark">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Estado del Sistema</h3>
                        <div className="flex items-center gap-2 text-primary text-xs font-bold bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Todos los sistemas operativos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `hace ${diffMins}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
