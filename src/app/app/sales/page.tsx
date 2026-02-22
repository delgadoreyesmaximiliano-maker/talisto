import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddSaleDialog } from './add-sale-dialog'
import { SalesTable } from './sales-table'
import { SalesExportButton } from './export-button'

export default function SalesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Ventas</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus órdenes, transacciones y flujo de caja.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SalesExportButton />
                    <AddSaleDialog />
                </div>
            </div>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Ventas Recientes</CardTitle>
                    <CardDescription>
                        Un historial visual de tus transacciones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SalesTable />
                </CardContent>
            </Card>
        </div>
    )
}
