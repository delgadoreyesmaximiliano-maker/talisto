/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { CfoDashboard } from './cfo-dashboard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, Sparkles } from 'lucide-react'

export default async function AIInsightsPage() {
    const supabase = createClient()

    // 1. Authenticate user to get company ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-8">No autorizado. Por favor ingresa a tu cuenta.</div>
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select(`
            company_id,
            companies (
                industry,
                settings
            )
        `)
        .eq('id', user.id)
        .single()

    const companyId = (userProfile as any)?.company_id
    const profile = {
        industry: (userProfile as any)?.companies?.industry,
        settings: (userProfile as any)?.companies?.settings
    }

    let inventoryData: any[] = []
    let salesData: any[] = []

    // 2. Fetch the Context Data to feed to Gemini
    if (companyId) {
        // Obtenemos todo el inventario
        const { data: products } = await supabase
            .from('products')
            .select('name, sku, category, price_sale, stock_current, stock_minimum')
            .eq('company_id', companyId)

        inventoryData = (products as any[]) || []

        // Obtenemos las ultimas 30 ventas
        const { data: sales } = await supabase
            .from('sales')
            .select('amount, source, created_at, customer_name')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(30)

        salesData = (sales as any[]) || []
    }

    const contextData = {
        profile,
        inventory: inventoryData,
        recentSales: salesData,
        totalProducts: inventoryData.length,
        totalSalesRecorded: salesData.length
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white">
                    💼 Tu CFO Virtual
                </h1>
                <p className="text-lg text-gray-400">
                    Navega por el tiempo para analizar tu negocio. La IA genera insights automáticamente.
                </p>
            </div>

            <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Modo Beta</AlertTitle>
                <AlertDescription>
                    La Inteligencia Artificial está procesando hasta <b>{contextData.totalProducts}</b> productos y <b>{contextData.totalSalesRecorded}</b> ventas recientes. Verifica siempre las sugerencias críticas antes de realizar compras grandes.
                </AlertDescription>
            </Alert>

            <CfoDashboard contextData={contextData} />
        </div>
    )
}
