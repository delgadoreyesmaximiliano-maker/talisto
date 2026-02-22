import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddCustomerDialog } from './add-customer-dialog'
import { CustomersTable } from './customers-table'
import { CrmExportButton } from './export-button'

export default function CrmPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM (Clientes)</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus relaciones con los clientes y su suscripción.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CrmExportButton />
                    <AddCustomerDialog />
                </div>
            </div>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Lista de Clientes</CardTitle>
                    <CardDescription>
                        Un directorio de tus clientes activos e históricos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomersTable />
                </CardContent>
            </Card>
        </div>
    )
}
