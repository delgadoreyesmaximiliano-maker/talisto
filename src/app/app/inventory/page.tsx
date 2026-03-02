import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddProductDialog } from './add-product-dialog'
import { ProductsTable } from './products-table'
import { ExportButton } from './export-button'

export default function InventoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Inventario</h1>
                    <p className="text-secondary font-medium mt-1">
                        Gestiona tus productos, variaciones y niveles de stock.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButton />
                    <AddProductDialog />
                </div>
            </div>

            <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-border-dark px-8 py-6">
                    <CardTitle className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Lista de Productos</CardTitle>
                    <CardDescription className="text-secondary font-medium">
                        Una lista de todos tus productos dados de alta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <ProductsTable />
                </CardContent>
            </Card>
        </div>
    )
}
