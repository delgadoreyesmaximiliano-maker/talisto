'use client'

import { createClient } from '@/lib/supabase/client'
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useEffect, useState } from 'react'
import { Bell, Search, User } from 'lucide-react'

export function AppHeader() {
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

    return (
        <header className="h-20 flex items-center px-6 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-500 hover:text-emerald-600 transition-colors" />
                <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                </button>

                <ThemeToggle />

                <div className="h-8 w-[1px] bg-slate-200" />

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 outline-none p-1 pr-3 rounded-xl hover:bg-slate-100 transition-all group">
                                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-emerald-500 transition-all">
                                    <AvatarFallback className="bg-emerald-500 text-white font-bold text-sm shadow-inner">{emailInitial}</AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-slate-900 leading-none">{user.email?.split('@')[0]}</p>
                                    <p className="text-[10px] text-slate-500 leading-none mt-1 uppercase font-bold tracking-tight">Admin</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 border-none shadow-2xl rounded-2xl p-2">
                            <DropdownMenuLabel className="font-bold px-3 py-2 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Mi Cuenta
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100 mx-1" />
                            <DropdownMenuItem className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 font-medium transition-all group">
                                <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                <span>Ver Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 mx-1" />
                            <DropdownMenuItem
                                className="rounded-xl flex items-center justify-start p-3 cursor-pointer bg-transparent text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-all"
                                onClick={async () => {
                                    await supabase.auth.signOut()
                                    window.location.href = '/login'
                                }}
                            >
                                <span className="w-full text-left">Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>

                    </DropdownMenu>
                )}
            </div>
        </header>
    )
}
