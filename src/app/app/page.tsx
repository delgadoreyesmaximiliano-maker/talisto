import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Sparkles, ShoppingBag, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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

    monthNames.forEach((_, i) => { monthlySales[i.toString()] = 0 })

        ; (sales as any[])?.forEach(sale => {
            const month = new Date(sale.created_at).getMonth()
            monthlySales[month.toString()] = (monthlySales[month.toString()] || 0) + Number(sale.amount)
        })

    const chartData = monthNames.map((name, i) => ({
        name,
        value: monthlySales[i.toString()] || 0,
    }))

    const maxChartValue = Math.max(...chartData.map(d => d.value), 1)

    // 5. Recent sales
    const { data: recentSalesData } = await supabase
        .from('sales')
        .select('id, amount, created_at, channel')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5)

    const recentSales = (recentSalesData as any[]) || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Bienvenido, {user.email?.split('@')[0]}
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Aquí tienes el resumen de tu negocio para hoy.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95 shadow-lg shadow-slate-900/20 flex items-center gap-2">
                        Descargar Reporte
                        <ArrowDownRight className="w-4 h-4" />
                    </button>
                    <Link href="/app/ai-insights" className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                        Preguntar a IA
                        <Sparkles className="w-4 h-4 fill-white text-white" />
                    </Link>
                </div>
            </div>

            {/* KPI Cards section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Revenue */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 rounded-3xl shadow-xl shadow-slate-900/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                            <ArrowUpRight className="w-3 h-3" />
                            +12%
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ventas Totales</p>
                        <h2 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ${totalRevenue.toLocaleString('es-CL')}
                        </h2>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-emerald-500" />
                            </div>
                            <span className="text-[10px] font-bold text-white">75%</span>
                        </div>
                    </div>
                </div>

                {/* MRR */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-[#0F172A] to-[#1a2642] p-6 rounded-3xl shadow-xl shadow-slate-900/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-full">
                            Recurrente
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingreso Mensual</p>
                        <h2 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ${totalMrr.toLocaleString('es-CL')}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-medium mt-2">Projection basada en {activeCustomers} clientes</p>
                    </div>
                </div>

                {/* Customers */}
                <div className="relative overflow-hidden group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <Users className="w-6 h-6 text-slate-600 group-hover:text-emerald-500" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>+{activeCustomers}</p>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Activos</p>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base de Clientes</p>
                    <div className="mt-4 flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                            +{activeCustomers > 4 ? activeCustomers - 4 : 0}
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                <div className="relative overflow-hidden group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                            <Package className="w-6 h-6 text-slate-600 group-hover:text-amber-500" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{activeProductsCount}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Productos</p>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado de Stock</p>
                    {lowStockProducts.length > 0 ? (
                        <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 p-2 rounded-xl border border-red-100">
                            <ArrowDownRight className="w-4 h-4" />
                            <span className="text-xs font-bold">{lowStockProducts.length} Alertas Críticas</span>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="text-xs font-bold">Stock Saludable</span>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Recommendations - NEW PREMIUM SECTION */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Recomendaciones de IA</h2>
                        <p className="text-slate-500 text-sm font-medium">Analizamos tus datos para encontrar oportunidades</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Oportunidad</span>
                            <span className="text-slate-400 text-[10px] font-medium">Hace 2 horas</span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Aumenta stock de "Vino Reserva"</h3>
                        <p className="text-sm text-slate-500 mb-4">Las ventas de este producto han subido un 35% este fin de semana. Es probable que te quedes sin stock en 4 días.</p>
                        <button className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            Crear Orden de Compra <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Atención</span>
                            <span className="text-slate-400 text-[10px] font-medium">Hace 5 horas</span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Margen bajo en Categoría "Lácteos"</h3>
                        <p className="text-sm text-slate-500 mb-4">Tus costos de proveedor subieron pero tus precios siguen iguales. Tu margen bajó del 25% al 18%.</p>
                        <button className="text-amber-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            Ajustar Precios <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Chart and Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Sales Chart */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Rendimiento Comercial</CardTitle>
                                <p className="text-xs text-slate-500 font-medium mt-1">Ventas por mes en el año actual</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-full">Este Año</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex items-end gap-3 h-64 mt-4">
                            {chartData.map((d, i) => {
                                const height = maxChartValue > 0 ? (d.value / maxChartValue) * 100 : 0
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex flex-col items-center justify-end h-full">
                                            {d.value > 0 && (
                                                <div className="hidden group-hover:block absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap shadow-xl">
                                                    ${(d.value / 1000).toFixed(0)}k
                                                </div>
                                            )}
                                            <div
                                                className={`w-full rounded-2xl transition-all duration-700 h-0 group-hover:brightness-110 shadow-lg ${i === 1 || i === 4 || i === 9
                                                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-emerald-500/20'
                                                        : 'bg-slate-200'
                                                    }`}
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{d.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 px-8 py-6">
                        <CardTitle className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Últimas Ventas</CardTitle>
                        <p className="text-xs text-slate-500 font-medium mt-1">Transacciones procesadas recientemente</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        {recentSales.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">Sin ventas registradas</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {recentSales.map((sale) => {
                                    const date = new Date(sale.created_at)
                                    const timeAgo = getTimeAgo(date)
                                    return (
                                        <div key={sale.id} className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                                                <DollarSign className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    ${Number(sale.amount).toLocaleString('es-CL')}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {sale.channel || 'Directo'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-500">{timeAgo}</p>
                                                <div className="flex items-center gap-1 justify-end mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-600">Completada</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <button className="w-full py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors mt-2">
                                    Ver Todo el Historial
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
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
