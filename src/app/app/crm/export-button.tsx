'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export-csv'
import { toast } from 'sonner'

export function CrmExportButton() {
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
            .from('customers')
            .select('name, email, phone, status, mrr, source')
            .eq('company_id', companyId)
            .order('name')

        if (data && data.length > 0) {
            exportToCSV(data, 'clientes_talisto')
            toast.success(`${data.length} clientes exportados a CSV`)
        } else {
            toast.info('No hay clientes para exportar')
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-4 h-4" />
            Exportar CSV
        </Button>
    )
}
