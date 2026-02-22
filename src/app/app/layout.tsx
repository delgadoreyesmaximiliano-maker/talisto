import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Toaster } from "sonner"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user has an associated company profile
    const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

    const hasCompany = !!(userProfile as any)?.company_id
    return (
        <>
            <SidebarProvider>
                {hasCompany && <AppSidebar />}
                <main className="flex-1 overflow-x-hidden w-full flex flex-col">
                    <AppHeader />
                    {!hasCompany ? (
                        <div className="flex-1 overflow-y-auto bg-muted/20">
                            {children}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
                            {children}
                        </div>
                    )}
                </main>
            </SidebarProvider>
            <Toaster position="bottom-right" richColors closeButton />
        </>
    );
}
