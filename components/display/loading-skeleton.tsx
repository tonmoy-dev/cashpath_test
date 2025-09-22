"use client"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

interface LoadingSkeletonProps {
  type: "card" | "table" | "list" | "stats" | "form"
  count?: number
  className?: string
}

export function LoadingSkeleton({ type, count = 3, className = "" }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )

  const renderTableSkeleton = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-6 h-6" />
        </div>
      ))}
    </div>
  )

  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderFormSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  )

  const skeletonMap = {
    card: renderCardSkeleton,
    table: renderTableSkeleton,
    list: renderListSkeleton,
    stats: renderStatsSkeleton,
    form: renderFormSkeleton,
  }

  return <div className={className}>{skeletonMap[type]()}</div>
}
