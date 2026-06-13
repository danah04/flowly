import { DropletIcon } from './icons'

export function ProgressBar({
  value,
  color = 'rgb(var(--color-primary))',
  className = '',
}: {
  value: number // 0..100
  color?: string
  className?: string
}) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-pill bg-hairline ${className}`}>
      <div
        className="h-full rounded-pill transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function Avatar({
  initial,
  size = 40,
  onClick,
}: {
  initial: string
  size?: number
  onClick?: () => void
}) {
  const el = (
    <span
      className="flex items-center justify-center rounded-full bg-primary font-display font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  )
  return onClick ? (
    <button type="button" onClick={onClick} aria-label="Open profile" className="outline-none">
      {el}
    </button>
  ) : (
    el
  )
}

export function StreakBadge({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-primary/10 px-2.5 py-1 text-[13px] font-semibold text-ink">
      <DropletIcon size={14} className="text-primary" />
      {days}
    </span>
  )
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
      {children}
    </p>
  )
}
