
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen mx-auto">
            <div className="mx-auto w-screen px-4 py-12 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        {/* Title */}
                        <Skeleton className="h-9 w-40 rounded-md" />

                        {/* Product count */}
                        <Skeleton className="h-4 w-24 rounded-md" />
                    </div>

                    {/* Refresh button */}
                    <Skeleton className="h-9 w-28 rounded-xl" />
                </div>

                {/* Products Grid */}
                <div className="grid gap-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex h-96 w-full flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            {/* Product Image */}
                            <Skeleton className="h-60 w-full rounded-none" />

                            {/* Product Content */}
                            <div className="flex flex-1 flex-col justify-between gap-3 p-4">

                                {/* Title */}
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-4/5 rounded-md" />
                                    <Skeleton className="h-4 w-3/5 rounded-md" />
                                </div>

                                {/* Price / Details */}
                                <div className="flex items-end justify-between gap-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20 rounded-md" />
                                        <Skeleton className="h-5 w-28 rounded-md" />
                                    </div>

                                    <Skeleton className="h-8 w-16 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
