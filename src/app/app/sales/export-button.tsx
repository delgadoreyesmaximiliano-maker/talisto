'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export-csv'
import { toast } from 'sonner'

export function SalesExportButton() {
    const handleExport = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const companyId = (profile as any)?.company_id
        if (!companyId) return

        const { data } = await supabase
            .from('sales')
            .select('created_at, customer_name, customer_email, amount, channel, source, status')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })

        if (data && data.length > 0) {
            exportToCSV(data, 'ventas_talisto')
            toast.success(`${data.length} ventas exportadas a CSV`)
        } else {
            toast.info('No hay ventas para exportar')
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-4 h-4" />
            Exportar CSV
        </Button>
    )
}
