'use client'

export default function AppLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page title skeleton */}
            <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />

            {/* KPI Cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Content area skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card p-6 space-y-4">
                    <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                    <div className="space-y-2 mt-4">
                        <div className="h-3 w-full bg-muted rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card p-6 space-y-4">
                    <div className="h-6 w-36 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    <div className="space-y-3 mt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between pb-3 border-b last:border-0">
                                <div className="space-y-1.5">
                                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                </div>
                                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
