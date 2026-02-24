'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, Package, ShoppingCart, Sparkles, Plug, Zap, ChevronRight } from "lucide-react"

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
        icon: LayoutDashboard,
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
        special: true
    },
    {
        title: "Integraciones",
        url: "/app/integrations",
        icon: Plug,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    const isActive = (url: string) => {
        if (url === '/app') return pathname === '/app'
        return pathname.startsWith(url)
    }

    return (
        <Sidebar className="border-r-slate-800">
            <SidebarHeader className="h-20 flex flex-col justify-center border-b border-slate-800/50 px-6 bg-[#0F172A]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>TALISTO</h2>
                        <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mt-1 block">SaaS v0.1</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-[#0F172A] px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 mb-4">
                        Menú Principal
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        className={`
                                            h-11 px-4 rounded-xl transition-all duration-200
                                            ${isActive(item.url)
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }
                                        `}
                                    >
                                        <Link href={item.url}>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${item.special && !isActive(item.url) ? 'text-emerald-400' : ''}`} />
                                                    <span className="font-medium text-sm">{item.title}</span>
                                                </div>
                                                {isActive(item.url) && <ChevronRight className="w-3 h-3" />}
                                                {item.special && !isActive(item.url) && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                                )}
                                            </div>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 mb-4">
                        Sistema
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/app/settings')}
                                    className={`
                                        h-11 px-4 rounded-xl transition-all duration-200
                                        ${isActive('/app/settings')
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }
                                    `}
                                >
                                    <Link href="/app/settings">
                                        <Settings className="w-5 h-5" />
                                        <span className="font-medium text-sm">Configuración</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-800 bg-[#0F172A] p-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-800">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Tu Plan</p>
                    <p className="text-xs font-bold text-white mb-2">Plan Pro (Trial)</p>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-emerald-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">12 días restantes</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
