'use client'

import type { ComponentType } from 'react'
import { ExportButton } from './export-button'
import { ReceiveStockDialog } from './receive-stock-dialog'
import { AddProductDialog } from './add-product-dialog'

interface ActionConfig {
    key: string
    Component: ComponentType
}

const INVENTORY_ACTIONS: ActionConfig[] = [
    { key: 'export',  Component: ExportButton },
    { key: 'receive', Component: ReceiveStockDialog },
    { key: 'add',     Component: AddProductDialog },
]

/**
 * Renders inventory actions in a horizontally scrollable container.
 * Prevents viewport overflow on narrow screens (iOS Safari).
 * Add/remove actions by editing INVENTORY_ACTIONS — no JSX changes needed.
 */
export function InventoryActions() {
    return (
        <div
            className="overflow-x-auto shrink-0"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
            <div className="flex items-center gap-2">
                {INVENTORY_ACTIONS.map(({ key, Component }) => (
                    <Component key={key} />
                ))}
            </div>
        </div>
    )
}
