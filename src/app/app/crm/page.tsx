import { AddCustomerDialog } from './add-customer-dialog'
import { CustomersTable } from './customers-table'
import { CrmExportButton } from './export-button'

export default function CrmPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>CRM (Clientes)</h1>
                    <p className="text-secondary">
                        Gestiona tus relaciones con los clientes y su suscripción.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CrmExportButton />
                    <AddCustomerDialog />
                </div>
            </div>

            <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden">
                <div className="px-6 py-4 border-b border-border-dark">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Lista de Clientes</h2>
                    <p className="text-secondary text-xs mt-1">
                        Un directorio de tus clientes activos e históricos.
                    </p>
                </div>
                <CustomersTable />
            </div>
        </div>
    )
}
