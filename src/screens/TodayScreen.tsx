import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar, StreakBadge } from '@/components/ui/display'
import { TaskRow, BreakRow } from '@/components/ui/TaskRow'
import { TaskRowSkeleton } from '@/components/ui/Skeleton'
import { BatteryIcon, SparkIcon, PlayIcon, ChevronRightIcon } from '@/components/ui/icons'
import { useNavigation } from '@/state/navigation'
import { useUserStore } from '@/state/userStore'
import {
  usePlanStore,
  resolveItems,
  planSummaryItems,
  type ResolvedBlock,
} from '@/state/planStore'
import { useFocusStore, startSessionFromPlan } from '@/state/focusStore'
import type { Energy, StudyTask } from '@/types/domain'

const ENERGY: { key: Energy; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
]

function previewBlocks(blocks: ResolvedBlock[], maxTasks = 3): ResolvedBlock[] {
  const start = blocks.findIndex((b) => b.kind === 'task' && b.task.status !== 'done')
  const slice = start >= 0 ? blocks.slice(start) : []
  const out: ResolvedBlock[] = []
  let count = 0
  for (const b of slice) {
    if (b.kind === 'task') {
      if (count >= maxTasks) break
      count += 1
    }
    out.push(b)
  }
  while (out.length && out[out.length - 1].kind === 'break') out.pop()
  return out
}

export function TodayScreen() {
  const go = useNavigation((s) => s.go)
  const user = useUserStore((s) => s.user)
  const energy = usePlanStore((s) => s.energy)
  const setEnergy = usePlanStore((s) => s.setEnergy)
  const loadPlan = usePlanStore((s) => s.loadPlan)
  const items = usePlanStore((s) => s.items)
  const note = usePlanStore((s) => s.note)
  const loading = usePlanStore((s) => s.loading)
  const source = usePlanStore((s) => s.source)
  const taskStatus = usePlanStore((s) => s.taskStatus)
  const toggleTask = usePlanStore((s) => s.toggleTask)
  const setTaskStatus = usePlanStore((s) => s.setTaskStatus)
  const startFocus = useFocusStore((s) => s.start)

  // Fetch the plan once on mount (refreshes from the agent in live mode).
  useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  const blocks = previewBlocks(resolveItems(items, taskStatus))
  const { done, total } = planSummaryItems(items, taskStatus)

  function startStudying() {
    startSessionFromPlan()
    go('focus')
  }

  function openTask(task: StudyTask) {
    setTaskStatus(task.id, 'active')
    startFocus(task)
    go('focus')
  }

  return (
    <div className="px-5 pt-2">
      {/* Greeting header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[14px] text-muted">Good morning,</p>
          <h1 className="font-display text-[30px] font-bold leading-tight text-ink">
            {user.firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <StreakBadge days={user.streakDays} />
          <Avatar initial={user.initial} onClick={() => go('profile')} />
        </div>
      </div>

      {/* Energy card */}
      <Card className="mb-6 p-4">
        <p className="mb-3 font-display text-[15px] font-semibold text-ink">
          How&apos;s your energy right now?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY.map(({ key, label }) => {
            const active = energy === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setEnergy(key)}
                className={`flex flex-col items-center gap-1.5 rounded-btn py-3 transition-colors ${
                  active ? 'bg-primary text-white' : 'bg-bg text-muted'
                }`}
              >
                <BatteryIcon size={20} />
                <span className="text-[13px] font-semibold">{label}</span>
              </button>
            )
          })}
        </div>
        <motion.div
          key={`${energy}-${loading}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex gap-2 text-[13px] leading-snug text-muted"
        >
          <SparkIcon size={15} className="mt-0.5 shrink-0 text-primary" />
          <span>{loading ? 'Tailoring your plan…' : note}</span>
        </motion.div>
      </Card>

      {/* Today's plan */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[16px] font-semibold text-ink">
          Today&apos;s plan ·{' '}
          <span className="text-muted">
            {done} of {total} done
          </span>
        </h2>
        <button
          type="button"
          onClick={() => go('plan')}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-primary"
        >
          See all <ChevronRightIcon size={14} />
        </button>
      </div>

      <div className="space-y-2.5">
        {loading && blocks.length === 0 ? (
          <>
            <TaskRowSkeleton />
            <TaskRowSkeleton />
            <TaskRowSkeleton />
          </>
        ) : blocks.length === 0 ? (
          <Card className="px-4 py-6 text-center text-[14px] text-muted">
            All done for today — nice work. Adjust your energy to plan more.
          </Card>
        ) : (
          blocks.map((b, i) =>
            b.kind === 'task' ? (
              <TaskRow
                key={b.task.id}
                task={{
                  subject: b.task.subject,
                  detail: `${b.task.topic} · ${b.task.durationMin} min`,
                  difficulty: b.task.difficulty,
                }}
                done={b.task.status === 'done'}
                onToggleDone={() => toggleTask(b.task.id)}
                onClick={() => openTask(b.task)}
              />
            ) : (
              <BreakRow key={i} label={`${b.durationMin}-min break`} />
            ),
          )
        )}
      </div>

      {source === 'fallback' && (
        <p className="mt-3 text-center text-[12px] text-muted">
          Coach is offline — showing your saved plan.
        </p>
      )}

      <div className="mt-6 pb-2">
        <Button full onClick={startStudying}>
          <PlayIcon size={17} /> Start studying
        </Button>
      </div>
    </div>
  )
}
