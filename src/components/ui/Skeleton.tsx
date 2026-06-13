// Subtle loading placeholder. Pulses unless the user prefers reduced motion
// (the global media query disables the animation). Harbor-toned, not flashy.

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-card bg-hairline/70 ${className}`}
    />
  )
}

// A plan-row-shaped skeleton matching TaskRow's height for seamless swap-in.
export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-card bg-surface px-4 py-3.5 shadow-card">
      <Skeleton className="h-7 w-7 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5 rounded-md" />
        <Skeleton className="h-3 w-3/5 rounded-md" />
      </div>
      <Skeleton className="h-5 w-12 rounded-pill" />
    </div>
  )
}
