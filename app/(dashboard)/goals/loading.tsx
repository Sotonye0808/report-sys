import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-28" />
        <div className="flex gap-2">
          <SkeletonBlock height="h-10" width="w-40" />
          <SkeletonBlock height="h-10" width="w-24" />
        </div>
      </div>
      <SkeletonBlock height="h-10" width="w-full" />
      <LoadingSkeleton rows={8} />
    </div>
  );
}
