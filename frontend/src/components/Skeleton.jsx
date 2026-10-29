/**
 * Staffify Enterprise Shimmer Skeleton Components
 * Fluid, pulse-shimmer bone structures that prevent Cumulative Layout Shift (CLS).
 * Built with Atlassian surfaces and WCAG-compliant contrasts.
 */

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-[#EBECF0] dark:bg-[#1C2433] rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Enterprise Table Skeleton Loader
 */
export function TableSkeleton({ rows = 6, columns = 6, selectable = false }) {
  return (
    <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden">
      {/* Table Head Skeleton */}
      <div className="bg-[#F4F5F7] dark:bg-[#1C2331] border-b border-[#DFE1E6] dark:border-[#263042] px-4 py-3 flex items-center justify-between gap-4">
        {selectable && <Skeleton className="w-4 h-4 rounded shrink-0" />}
        {Array.from({ length: columns }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={`h-3.5 rounded ${
              idx === 0 ? "w-36" : idx === columns - 1 ? "w-16" : "w-24"
            }`}
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="px-4 py-3.5 flex items-center justify-between gap-4 animate-pulse"
          >
            {selectable && <Skeleton className="w-4 h-4 rounded shrink-0" />}

            {/* First Column: Avatar + Name + ID pill */}
            <div className="flex items-center gap-3 w-44 shrink-0">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            </div>

            {/* Middle Columns */}
            {Array.from({ length: columns - 2 }).map((_, colIdx) => (
              <div key={colIdx} className="flex-1 flex justify-start">
                <Skeleton
                  className={`h-3 rounded ${
                    colIdx % 2 === 0 ? "w-24" : "w-16"
                  }`}
                />
              </div>
            ))}

            {/* Last Column: Action Button */}
            <div className="w-16 flex justify-end">
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Metric KPI Cards Row Skeleton
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-3.5`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-28 rounded" />
            </div>
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-2.5 w-24 rounded" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dossier / Detailed Form Skeleton
 */
export function DossierSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-6 space-y-6">
      {/* Header Profile Area */}
      <div className="flex items-center gap-4 border-b border-[#DFE1E6] dark:border-[#263042] pb-5">
        <Skeleton className="w-16 h-16 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3.5 w-32 rounded" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
