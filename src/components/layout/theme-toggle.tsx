'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setIsDark(document.documentElement.classList.contains('dark'))
    }, [])

    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)

        if (newTheme) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('talisto-theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('talisto-theme', 'light')
        }
    }

    if (!mounted) {
        return (
            <button className="w-9 h-9 rounded-lg border border-border bg-background flex items-center justify-center">
                <div className="w-4 h-4" />
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-all duration-200 overflow-hidden group"
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
            <Sun
                className={`w-4 h-4 text-foreground absolute transition-all duration-300 ${isDark
                        ? 'rotate-90 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                    }`}
            />
            <Moon
                className={`w-4 h-4 text-foreground absolute transition-all duration-300 ${isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                    }`}
            />
        </button>
    )
}
