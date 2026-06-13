import { DifficultyPill, type Difficulty } from './Pill'
import { Card } from './Card'
import { CheckIcon } from './icons'

export interface TaskItem {
  subject: string
  detail: string
  difficulty: Difficulty
}

export function TaskRow({
  task,
  index,
  done = false,
  onClick,
  onToggleDone,
}: {
  task: TaskItem
  index?: number
  done?: boolean
  onClick?: () => void
  onToggleDone?: () => void
}) {
  // Leading control: a checkable status circle when completion is supported,
  // otherwise the plain numbered index (Plan) or nothing (Today preview).
  const leading = onToggleDone ? (
    <button
      type="button"
      aria-label={done ? 'Mark task not done' : 'Mark task done'}
      aria-pressed={done}
      onClick={(e) => {
        e.stopPropagation()
        onToggleDone()
      }}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold transition ${
        done
          ? 'border-primary bg-primary text-white'
          : 'border-hairline bg-surface text-primary hover:border-primary/50'
      }`}
    >
      {done ? <CheckIcon size={15} /> : index != null ? index : null}
    </button>
  ) : index != null ? (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg font-display text-[13px] font-semibold text-primary">
      {index}
    </span>
  ) : null

  return (
    <Card
      className={`flex items-center gap-3 px-4 py-3.5 ${
        onClick ? 'cursor-pointer transition active:scale-[.99]' : ''
      } ${done ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-display text-[15px] font-semibold ${
            done ? 'text-muted line-through' : 'text-ink'
          }`}
        >
          {task.subject}
        </p>
        <p className="truncate text-[13px] text-muted">{task.detail}</p>
      </div>
      <span className={done ? 'opacity-50' : ''}>
        <DifficultyPill level={task.difficulty} />
      </span>
    </Card>
  )
}

export function BreakRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-card bg-success/25 px-4 py-3 text-[13px] font-medium text-ink/70">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgb(var(--color-success))' }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 12h12" />
        </svg>
      </span>
      {label}
    </div>
  )
}
