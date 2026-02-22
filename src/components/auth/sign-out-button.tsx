'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, ButtonProps } from '@/components/ui/button'

export function SignOutButton({ className, variant = "destructive", ...props }: ButtonProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleSignOut = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <Button variant={variant} onClick={handleSignOut} disabled={loading} className={className} {...props}>
            {loading ? 'Signing out...' : 'Sign out'}
        </Button>
    )
}
