import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ProductsTable } from './products-table'
import { InventoryActions } from './inventory-actions'

export default function InventoryPage() {
    return (
        <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Inventario</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Gestiona tus productos, variaciones y niveles de stock.
                    </p>
                </div>
                <InventoryActions />
            </div>

            <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-border-dark px-8 py-6">
                    <p className="text-lg font-extrabold text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Lista de Productos</p>
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
