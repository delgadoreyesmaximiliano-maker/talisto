'use client'

export default function AppTemplate({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="animate-in fade-in-0 zoom-in-95 duration-200 ease-out"
            style={{ animationFillMode: 'both' }}
        >
            {children}
        </div>
    )
}
