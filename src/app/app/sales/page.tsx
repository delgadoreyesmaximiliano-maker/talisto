import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AddSaleDialog } from './add-sale-dialog'
import { SalesTable } from './sales-table'
import { SalesExportButton } from './export-button'
import { BarcodeScannerInput } from './barcode-scanner'

export default function SalesPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-shrink-0">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Ventas</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tus órdenes, transacciones y flujo de caja en tiempo real.
                    </p>
                </div>

                <div className="flex-grow flex justify-center w-full sm:w-auto">
                    <BarcodeScannerInput />
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                    <SalesExportButton />
                    <AddSaleDialog />
                </div>
            </div>

            <Card className="bg-surface-dark border-border-dark glass-panel shadow-[0_0_20px_rgba(19,236,128,0.03)]">
                <CardHeader className="border-b border-border-dark/50 pb-5">
                    <p className="text-foreground text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Ventas Recientes</p>
                    <p className="text-muted-foreground text-sm">
                        Un historial detallado de tus transacciones.
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <SalesTable />
                </CardContent>
            </Card>
        </div>
    )
}
