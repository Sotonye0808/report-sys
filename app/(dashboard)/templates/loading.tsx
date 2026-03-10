import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-36" />
        <SkeletonBlock height="h-10" width="w-36" />
      </div>
      <LoadingSkeleton rows={5} />
    </div>
  );
}
