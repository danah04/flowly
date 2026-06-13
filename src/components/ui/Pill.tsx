import type { ReactNode } from 'react'
import type { Difficulty } from '@/types/domain'

export type { Difficulty }

const DIFF_STYLE: Record<Difficulty, { bg: string; fg: string }> = {
  easy: { bg: 'var(--diff-easy-bg)', fg: 'var(--diff-easy-fg)' },
  medium: { bg: 'var(--diff-medium-bg)', fg: 'var(--diff-medium-fg)' },
  hard: { bg: 'var(--diff-hard-bg)', fg: 'var(--diff-hard-fg)' },
}

export function DifficultyPill({ level }: { level: Difficulty }) {
  const s = DIFF_STYLE[level]
  return (
    <span
      className="rounded-pill px-2.5 py-1 text-[11px] font-semibold capitalize"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {level}
    </span>
  )
}

export function Pill({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  )
}
