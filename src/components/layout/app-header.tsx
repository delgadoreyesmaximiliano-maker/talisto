import { createClient } from '@/lib/supabase/server'
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

export async function AppHeader() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

    return (
        <header className="h-16 flex items-center border-b px-4 shrink-0 bg-background justify-between">
            <SidebarTrigger />

            <div className="flex items-center gap-3">
                <ThemeToggle />
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 outline-none p-1 rounded-full hover:bg-muted transition-colors">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-azul-primary text-white text-xs">{emailInitial}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Mi Perfil</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="p-0">
                                <div className="w-full flex">
                                    <SignOutButton className="w-full justify-start rounded-none bg-transparent text-foreground shadow-none hover:bg-muted" />
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    )
}
