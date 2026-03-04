interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 5, className = "" }: LoadingSkeletonProps) {
  const opacities = [
    "opacity-100",
    "opacity-90",
    "opacity-80",
    "opacity-70",
    "opacity-60",
    "opacity-50",
  ];
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading…">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`ds-skeleton h-12 rounded-ds-lg ${opacities[Math.min(i, opacities.length - 1)]}`}
        />
      ))}
    </div>
  );
}

/** Single shimmer block */
export function SkeletonBlock({
  height = "h-6",
  width = "w-full",
  className = "",
}: {
  height?: string;
  width?: string;
  className?: string;
}) {
  return <div className={`ds-skeleton rounded-ds-md ${height} ${width} ${className}`} />;
}

/** Skeleton card */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-ds-surface-elevated border border-ds-border-subtle rounded-ds-2xl p-6 space-y-4 ${className}`}
    >
      <SkeletonBlock height="h-5" width="w-1/3" />
      <SkeletonBlock height="h-4" width="w-2/3" />
      <div className="pt-2 space-y-2">
        <SkeletonBlock height="h-3" />
        <SkeletonBlock height="h-3" width="w-5/6" />
        <SkeletonBlock height="h-3" width="w-4/6" />
      </div>
    </div>
  );
}
