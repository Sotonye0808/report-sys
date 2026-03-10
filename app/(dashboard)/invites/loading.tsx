import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock height="h-8" width="w-36" />
      <SkeletonBlock height="h-12" width="w-full" />
      <LoadingSkeleton rows={5} />
    </div>
  );
}
