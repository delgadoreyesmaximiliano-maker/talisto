'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'

/**
 * Closes the mobile sidebar drawer on every route change.
 * Must be called from a component rendered inside <SidebarProvider>.
 */
export function useCloseSidebarOnNavigate() {
    const pathname = usePathname()
    const { setOpenMobile } = useSidebar()

    useEffect(() => {
        setOpenMobile(false)
    }, [pathname, setOpenMobile])
}
