/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from './chat-interface'
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
        .select('company_id')
        .eq('id', user.id)
        .single()

    const companyId = (userProfile as any)?.company_id

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
        inventory: inventoryData,
        recentSales: salesData,
        totalProducts: inventoryData.length,
        totalSalesRecorded: salesData.length
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-amber-500" />
                    Sugerencias de IA
                </h1>
                <p className="text-muted-foreground mt-1">
                    Chatea con tu asistente de Inteligencia Artificial. Obtendrá acceso a tus datos de inventario y ventas para darte consejos perspicaces.
                </p>
            </div>

            <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Modo Beta</AlertTitle>
                <AlertDescription>
                    La Inteligencia Artificial está procesando hasta <b>{contextData.totalProducts}</b> productos y <b>{contextData.totalSalesRecorded}</b> ventas recientes. Verifica siempre las sugerencias críticas antes de realizar compras grandes.
                </AlertDescription>
            </Alert>

            <ChatInterface contextData={contextData} />
        </div>
    )
}
