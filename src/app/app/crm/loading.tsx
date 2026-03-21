import { Skeleton } from '@/components/ui/skeleton'

export default function CrmLoading() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-4 w-60" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Search bar */}
            <Skeleton className="h-10 w-full max-w-sm rounded-lg" />

            {/* Table skeleton */}
            <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                {/* Table header */}
                <div className="bg-background-dark/50 border-b border-border-dark px-4 py-3 flex items-center gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16 hidden sm:block" />
                    <Skeleton className="h-4 w-20 hidden md:block" />
                    <Skeleton className="h-4 w-12 hidden md:block ml-auto" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border-dark">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="px-4 py-3 flex items-center gap-4">
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-44" />
                            </div>
                            <Skeleton className="h-6 w-14 rounded-full hidden sm:block" />
                            <Skeleton className="h-4 w-16 hidden md:block" />
                            <Skeleton className="h-4 w-16 hidden md:block" />
                            <Skeleton className="h-4 w-20 ml-auto" />
                        </div>
                    ))}
                </div>

                {/* Pagination bar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}
