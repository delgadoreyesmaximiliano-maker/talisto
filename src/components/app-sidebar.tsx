'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTrialStatus, getTrialUrgencyClasses } from '@/lib/utils/trial'
import type { TrialStatus } from '@/types/database'

import { LayoutDashboard, Package, Bot, Plug, Settings, Zap, ChevronRight, ShoppingCart, LineChart, Users } from "lucide-react"
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
        title: "Dashboard",
        url: "/app",
        icon: LayoutDashboard,
    },
    {
        title: "Ventas",
        url: "/app/sales",
        icon: ShoppingCart,
    },
    {
        title: "Inventario",
        url: "/app/inventory",
        icon: Package,
    },
    {
        title: "CRM (Clientes)",
        url: "/app/crm",
        icon: Users,
    },
    {
        title: "Asistente IA",
        url: "/app/ai",
        icon: Bot,
        special: true
    },
    {
        title: "Insights IA",
        url: "/app/ai-insights",
        icon: LineChart,
    },
    {
        title: "Integraciones",
        url: "/app/integrations",
        icon: Plug,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
    const [isPaidPlan, setIsPaidPlan] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        async function loadTrialStatus() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select(`
                        company_id,
                        companies (
                            trial_ends_at,
                            plan_status
                        )
                    `)
                    .eq('id', session.user.id)
                    .single()

                if (userError) {
                    console.error('Error loading trial status:', userError)
                    return
                }

                const userObj = user as any;
                if (userObj?.companies) {
                    const companiesData = userObj.companies;
                    const company = Array.isArray(companiesData) ? companiesData[0] : companiesData;
                    if (company) {
                        const status = getTrialStatus(
                            company.trial_ends_at as string | null,
                            company.plan_status as any
                        )
                        setTrialStatus(status)
                        setIsPaidPlan(company.plan_status === 'active')
                    }
                }
            } catch (error) {
                console.error('Trial status fetch failed:', error)
            }
        }

        loadTrialStatus()
        // Refresh every 5 minutes
        const interval = setInterval(loadTrialStatus, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const isActive = (url: string) => {
        if (url === '/app') return pathname === '/app'
        return pathname.startsWith(url)
    }

    const urgencyClasses = getTrialUrgencyClasses(trialStatus?.urgencyLevel ?? 'none')

    return (
        <Sidebar className="border-r-border">
            <SidebarHeader className="h-20 flex flex-col justify-center border-b border-border/50 px-6 bg-sidebar">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="w-4 h-4 text-primary fill-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-foreground leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>TALISTO</h2>
                        <span className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1 block">Premium v2.0</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-sidebar px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-secondary text-[10px] font-bold uppercase tracking-widest px-4 mb-4">
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
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-secondary hover:text-foreground hover:bg-surface-dark/50'
                                            }
                                        `}
                                    >
                                        <Link href={item.url} aria-current={isActive(item.url) ? 'page' : undefined}>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${item.special && !isActive(item.url) ? 'text-primary/70' : ''}`} />
                                                    <span className="font-medium text-sm">{item.title}</span>
                                                </div>
                                                {isActive(item.url) && <ChevronRight className="w-3 h-3" />}
                                                {item.special && !isActive(item.url) && (
                                                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,128,0.5)] animate-pulse" />
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
                    <SidebarGroupLabel className="text-secondary text-[10px] font-bold uppercase tracking-widest px-4 mb-4">
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
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-secondary hover:text-foreground hover:bg-surface-dark/50'
                                        }
                                    `}
                                >
                                    <Link href="/app/settings" aria-current={isActive('/app/settings') ? 'page' : undefined}>
                                        <Settings className="w-5 h-5" />
                                        <span className="font-medium text-sm">Configuración</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-border bg-sidebar p-6">
                <div className="glass-panel p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Tu Plan</p>
                    <p className="text-xs font-bold text-foreground mb-2">
                        {isPaidPlan ? 'Plan Activo' : 'Plan Pro (Trial)'}
                    </p>
                    {trialStatus === null ? (
                        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-primary/20 animate-pulse rounded-full" />
                        </div>
                    ) : (
                        <>
                            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${urgencyClasses.bar} ${urgencyClasses.pulse_bar ? 'animate-pulse' : ''}`}
                                    style={{ width: isPaidPlan ? '100%' : `${Math.max(5, (trialStatus.daysRemaining / 14) * 100)}%` }}
                                />
                            </div>
                            <p className={`text-[10px] mt-2 transition-colors ${urgencyClasses.text} ${trialStatus.isExpiringSoon ? 'animate-pulse' : ''}`}>
                                {trialStatus.message}
                            </p>
                        </>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
