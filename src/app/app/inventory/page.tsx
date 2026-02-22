import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddProductDialog } from './add-product-dialog'
import { ProductsTable } from './products-table'
import { ExportButton } from './export-button'

export default function InventoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus productos, variaciones y niveles de stock.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButton />
                    <AddProductDialog />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Productos</CardTitle>
                    <CardDescription>
                        Una lista de todos tus productos dados de alta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductsTable />
                </CardContent>
            </Card>
        </div>
    )
}
