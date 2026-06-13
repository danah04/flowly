import { useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/display'
import { LockIcon, PauseIcon, PlayIcon, SparkIcon } from '@/components/ui/icons'
import { useNavigation } from '@/state/navigation'
import {
  useFocusStore,
  formatClock,
  focusLevelLabel,
} from '@/state/focusStore'
import { usePlanStore } from '@/state/planStore'
import { taskById } from '@/mock/tasks'

function TimerRing({ remaining, total }: { remaining: number; total: number }) {
  const r = 86
  const c = 2 * Math.PI * r
  const progress = total > 0 ? remaining / total : 0
  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg width="220" height="220" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgb(var(--color-hairline))" strokeWidth="11" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgb(var(--color-primary))"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[44px] font-bold leading-none text-ink tabular-nums">
          {formatClock(remaining)}
        </span>
      </div>
    </div>
  )
}

export function FocusScreen() {
  const go = useNavigation((s) => s.go)
  const session = useFocusStore((s) => s.session)
  const attach = useFocusStore((s) => s.attach)
  const pause = useFocusStore((s) => s.pause)
  const resume = useFocusStore((s) => s.resume)
  const end = useFocusStore((s) => s.end)
  const start = useFocusStore((s) => s.start)
  const startBreak = useFocusStore((s) => s.startBreak)
  const endBreak = useFocusStore((s) => s.endBreak)
  const switchToLighterTask = useFocusStore((s) => s.switchToLighterTask)
  const startNextTask = usePlanStore((s) => s.startNextTask)

  useEffect(() => attach(), [attach])

  const running = session.status === 'running'
  const idle = session.status === 'idle' || session.status === 'ended'
  const isBreak = session.isBreak

  function onPrimary() {
    if (running) pause()
    else if (session.status === 'paused') resume()
    else {
      const next = startNextTask()
      start(next ?? taskById('t-ca'))
    }
  }

  function onEnd() {
    end()
    go('today')
  }

  return (
    <div className="px-5 pt-2">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[24px] font-bold leading-tight text-ink">
            {isBreak ? 'Break time' : 'Focus session'}
          </h1>
          <p className="text-[13px] text-muted">
            {session.subject}
            {session.topic ? ` · ${session.topic}` : ''}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-pill bg-success/30 px-2.5 py-1 text-[12px] font-semibold text-ink/70">
          <LockIcon size={13} /> Focus on
        </span>
      </div>

      <Card className="px-5 py-6">
        <TimerRing remaining={session.remainingSeconds} total={session.totalSeconds} />
        <p className="mt-2 text-center text-[13px] text-muted">
          {isBreak ? 'Quick reset' : `Pomodoro · ${session.pomodoroIndex} of ${session.pomodoroCount}`}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPrimary}
            className="flex items-center justify-center gap-2 rounded-btn bg-bg py-3.5 text-[15px] font-semibold text-ink transition active:scale-[.985]"
          >
            {running ? (
              <>
                <PauseIcon size={18} /> Pause
              </>
            ) : (
              <>
                <PlayIcon size={18} /> {idle ? 'Start' : 'Resume'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="rounded-btn border border-hairline py-3.5 text-[15px] font-semibold text-primary transition active:scale-[.985]"
          >
            {isBreak ? 'End break' : 'End session'}
          </button>
        </div>
      </Card>

      {/* Focus level */}
      <Card className="mt-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Focus level
          </span>
          <span className="text-[13px] font-semibold text-ink">
            {focusLevelLabel(session.focusLevel)}
          </span>
        </div>
        <ProgressBar value={session.focusLevel} color="rgb(var(--color-success))" />
        <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-[14px] text-muted">Distractions blocked</span>
          <span className="font-display text-[15px] font-semibold text-ink tabular-nums">
            {session.distractionsBlocked}
          </span>
        </div>
      </Card>

      {/* Keep your momentum */}
      <div className="mt-4 rounded-card bg-secondary/25 p-4 pb-2">
        <div className="mb-1 flex items-center gap-1.5">
          <SparkIcon size={15} className="text-primary" />
          <span className="font-display text-[15px] font-semibold text-ink">
            {isBreak ? 'Taking a breather' : 'Keep your momentum'}
          </span>
        </div>
        <p className="text-[13px] text-ink/70">
          {isBreak
            ? "I'll hold your place. Come back when you're ready."
            : 'Ready to keep going, or want a quick reset?'}
        </p>
        <div className="mt-3 flex gap-2.5 pb-1">
          {isBreak ? (
            <button
              type="button"
              onClick={() => {
                endBreak()
                resume()
              }}
              className="rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white transition active:scale-[.97]"
            >
              Resume studying
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => switchToLighterTask()}
                className="rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white transition active:scale-[.97]"
              >
                Lighter task
              </button>
              <button
                type="button"
                onClick={() => startBreak()}
                className="rounded-pill border border-hairline bg-surface px-4 py-2 text-[13px] font-semibold text-ink transition active:scale-[.97]"
              >
                5-min break
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
