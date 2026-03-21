import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-36 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* Main grid: mirrors the real dashboard 3-column layout */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">

                {/* Left column: 3 KPI cards */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <Skeleton className="h-3 w-32 hidden lg:block" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-panel p-5 rounded-2xl border border-border-dark space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-5 w-14 rounded-sm" />
                            </div>
                            <Skeleton className="h-9 w-32" />
                            <Skeleton className="h-3 w-28" />
                            <div className="flex items-end gap-1 h-12 mt-1">
                                {Array.from({ length: 7 }).map((_, j) => (
                                    <Skeleton key={j} className="w-full rounded-t-sm" style={{ height: `${40 + j * 8}%` }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Center column: annual chart + AI insights */}
                <div className="lg:col-span-6 space-y-6 min-w-0">
                    {/* Annual performance chart */}
                    <div className="glass-panel rounded-2xl border border-border-dark overflow-hidden">
                        <div className="border-b border-border-dark/50 px-6 py-4 flex items-center justify-between">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-7 w-20 rounded-md" />
                        </div>
                        <div className="p-6">
                            <div className="flex items-end gap-2 h-[280px] w-full pt-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full">
                                        <div className="w-full flex-1 flex flex-col justify-end">
                                            <Skeleton
                                                className="w-full rounded-t-sm"
                                                style={{ height: `${10 + ((i * 17 + 30) % 80)}%` }}
                                            />
                                        </div>
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Insights card */}
                    <div className="glass-panel rounded-2xl border border-border-dark overflow-hidden">
                        <div className="border-b border-border-dark/50 px-6 py-4 flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="p-6 grid sm:grid-cols-2 gap-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="bg-background-dark border border-border-dark p-4 rounded-xl space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-3 w-20 mt-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column: stock status + recent sales + system status */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {/* Stock status */}
                    <div className="glass-panel p-5 rounded-2xl border border-border-dark space-y-4">
                        <Skeleton className="h-4 w-32" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-5 w-12 rounded" />
                            </div>
                        ))}
                    </div>

                    {/* Recent sales */}
                    <div className="glass-panel p-5 rounded-2xl border border-border-dark space-y-4 flex-1">
                        <Skeleton className="h-4 w-28" />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </div>
                        ))}
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>

                    {/* System status */}
                    <div className="glass-panel p-4 rounded-2xl border border-border-dark space-y-3">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
