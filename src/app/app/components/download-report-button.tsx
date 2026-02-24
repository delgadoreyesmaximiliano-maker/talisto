'use client'

import { ArrowDownRight } from 'lucide-react'
import { exportToCSV } from '@/lib/export-csv'

interface Sale {
    id: string
    amount: number
    created_at: string
    source: string | null
}

interface DownloadReportButtonProps {
    sales: Sale[]
}

export function DownloadReportButton({ sales }: DownloadReportButtonProps) {
    const handleDownload = () => {
        if (!sales || sales.length === 0) return

        const csvData = sales.map(sale => ({
            Fecha: new Date(sale.created_at).toLocaleDateString('es-CL'),
            Monto: Number(sale.amount).toLocaleString('es-CL'),
            Canal: sale.source || 'Directo',
        }))

        exportToCSV(csvData, 'ventas_talisto')
    }

    return (
        <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95 shadow-lg shadow-slate-900/20 flex items-center gap-2"
        >
            Descargar Reporte
            <ArrowDownRight className="w-4 h-4" />
        </button>
    )
}
