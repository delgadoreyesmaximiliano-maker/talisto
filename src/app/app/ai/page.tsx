/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatClient } from './chat-client'
import { CfoDashboardAppAi } from './cfo-dashboard-ai'

export const dynamic = 'force-dynamic';

export default async function AIPage() {
    const supabase = createClient()

    // 1. Authenticate user to get company ID
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
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
        .eq('id', user?.id || '')
        .single()

    const companyId = (userProfile as any)?.company_id

    if (!companyId) {
        redirect('/app/company/setup')
    }

    const profile = {
        industry: (userProfile as any)?.companies?.industry,
        settings: (userProfile as any)?.companies?.settings
    }

    let inventoryData: any[] = []
    let salesData: any[] = []

    // 2. Fetch the Context Data to feed to Groq
    // Obtenemos todo el inventario
    const { data: products } = await supabase
        .from('products')
        .select('name, sku, category, price_sale, stock_current, stock_minimum')
        .eq('company_id', companyId)

    inventoryData = (products as any[]) || []

    // Obtenemos las ultimas 30 ventas
    const { data: sales } = await supabase
        .from('sales')
        .select('amount, source, created_at, customer_name, items')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(30)

    // Enhance sales data to show what was sold
    salesData = (sales as any[])?.map(sale => ({
        ...sale,
        items_summary: sale.items ? sale.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : 'Venta general'
    })) || []

    const contextData = {
        profile,
        inventory: inventoryData,
        recentSales: salesData,
        totalProducts: inventoryData.length,
        totalSalesRecorded: salesData.length
    }

    return (
        <CfoDashboardAppAi contextData={contextData} />
    )
}
