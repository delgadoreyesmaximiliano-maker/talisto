'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PieChart, Users, Settings, Package, ShoppingCart, Sparkles, Plug } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
    {
        title: "Resumen",
        url: "/app",
        icon: PieChart,
    },
    {
        title: "Inventario",
        url: "/app/inventory",
        icon: Package,
    },
    {
        title: "Ventas",
        url: "/app/sales",
        icon: ShoppingCart,
    },
    {
        title: "CRM",
        url: "/app/crm",
        icon: Users,
    },
    {
        title: "Sugerencias AI",
        url: "/app/ai-insights",
        icon: Sparkles,
    },
    {
        title: "Integraciones",
        url: "/app/integrations",
        icon: Plug,
    },
    {
        title: "Configuración",
        url: "/app/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    const isActive = (url: string) => {
        if (url === '/app') return pathname === '/app'
        return pathname.startsWith(url)
    }

    return (
        <Sidebar>
            <SidebarHeader className="h-16 flex items-center border-b px-4">
                <h2 className="text-xl font-bold tracking-tight text-sidebar-foreground">Talisto.</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
                        Navegación
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                    >
                                        <Link
                                            href={item.url}
                                            className={`
                                                text-sidebar-foreground/80 
                                                hover:text-sidebar-foreground 
                                                hover:bg-sidebar-accent/50
                                                transition-colors duration-150
                                                ${isActive(item.url)
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                                    : ''
                                                }
                                            `}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="text-xs text-sidebar-foreground/50 text-center">
                    Talisto SaaS v0.1
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
