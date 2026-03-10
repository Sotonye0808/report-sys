import { LoadingSkeleton, SkeletonBlock, SkeletonCard } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-48" />
        <SkeletonBlock height="h-10" width="w-32" />
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Content skeleton */}
      <LoadingSkeleton rows={6} />
    </div>
  );
}
