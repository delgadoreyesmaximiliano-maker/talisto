'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTrialStatus, getTrialUrgencyClasses } from '@/lib/utils/trial'
import type { TrialStatus } from '@/types/database'
import { useCloseSidebarOnNavigate } from '@/hooks/use-close-sidebar-on-navigate'

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

type Industry = 'ecommerce' | 'saas' | 'retail' | 'marketing' | 'restaurant' | 'services' | string

interface NavItem {
    title: string
    url: string
    icon: React.ElementType
    special?: boolean
    /** Industries that should NOT see this item. Empty = visible for all. */
    hideFor?: Industry[]
}

const navItems: NavItem[] = [
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
        // Digital/service businesses don't manage physical stock
        hideFor: ['saas', 'services', 'marketing'],
    },
    {
        title: "Clientes",
        url: "/app/crm",
        icon: Users,
        // Restaurants track tables/orders, not recurring customer subscriptions
        hideFor: ['restaurant'],
    },
    {
        title: "Asistente IA",
        url: "/app/ai",
        icon: Bot,
        special: true,
    },
    {
        title: "Integraciones",
        url: "/app/integrations",
        icon: Plug,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    useCloseSidebarOnNavigate()
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
    const [isPaidPlan, setIsPaidPlan] = useState(false)
    const [industry, setIndustry] = useState<Industry>('')

    useEffect(() => {
        const supabase = createClient()

        async function loadSidebarData() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select(`
                        company_id,
                        companies (
                            trial_ends_at,
                            plan_status,
                            industry
                        )
                    `)
                    .eq('id', session.user.id)
                    .single()

                if (userError) {
                    console.error('Error loading sidebar data:', userError)
                    return
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userObj = user as any;
                if (userObj?.companies) {
                    const companiesData = userObj.companies;
                    const company = Array.isArray(companiesData) ? companiesData[0] : companiesData;
                    if (company) {
                        const status = getTrialStatus(
                            company.trial_ends_at as string | null,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            company.plan_status as any
                        )
                        setTrialStatus(status)
                        setIsPaidPlan(company.plan_status === 'active')
                        setIndustry(company.industry || '')
                    }
                }
            } catch (error) {
                console.error('Sidebar data fetch failed:', error)
            }
        }

        loadSidebarData()
        // Refresh every 5 minutes
        const interval = setInterval(loadSidebarData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const isActive = (url: string) => {
        if (url === '/app') return pathname === '/app'
        return pathname.startsWith(url)
    }

    // Filter nav items based on the company's industry
    const visibleNavItems = navItems.filter(item => {
        if (!item.hideFor || item.hideFor.length === 0) return true
        if (!industry) return true // show all while industry is loading
        return !item.hideFor.includes(industry)
    })

    const urgencyClasses = getTrialUrgencyClasses(trialStatus?.urgencyLevel ?? 'none')

    return (
        <Sidebar className="border-r-border">
            <SidebarHeader className="h-20 flex flex-col justify-center border-b border-border px-6 bg-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-primary-sm"
                         style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight leading-none gradient-text" style={{ fontFamily: "'Poppins', sans-serif" }}>TALISTO</h2>
                        <span className="text-[10px] font-semibold tracking-widest uppercase mt-0.5 block"
                              style={{ color: 'rgba(139, 92, 246, 0.8)' }}>Premium v2.0</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-transparent px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest px-4 mb-4">
                        Menú Principal
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {visibleNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        className={`
                                            h-11 px-4 rounded-xl transition-all duration-200 border border-transparent
                                            ${isActive(item.url)
                                                ? 'nav-active text-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-primary/8 hover:border-primary/10'
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
                    <SidebarGroupLabel className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest px-4 mb-4">
                        Sistema
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/app/settings')}
                                    className={`
                                        h-11 px-4 rounded-xl transition-all duration-200 border border-transparent
                                        ${isActive('/app/settings')
                                            ? 'nav-active text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-primary/8 hover:border-primary/10'
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
            <SidebarFooter className="border-t border-border bg-transparent p-6">
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.10)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.20)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 gradient-text">Tu Plan</p>
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
