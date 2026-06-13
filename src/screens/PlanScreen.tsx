import { TaskRow, BreakRow } from '@/components/ui/TaskRow'
import { Card } from '@/components/ui/Card'
import { SparkIcon } from '@/components/ui/icons'
import { useNavigation } from '@/state/navigation'
import {
  usePlanStore,
  resolveItems,
  planTotalMinutes,
} from '@/state/planStore'
import { useFocusStore } from '@/state/focusStore'

export function PlanScreen() {
  const go = useNavigation((s) => s.go)
  const energy = usePlanStore((s) => s.energy)
  const items = usePlanStore((s) => s.items)
  const rationale = usePlanStore((s) => s.rationale)
  const taskStatus = usePlanStore((s) => s.taskStatus)
  const setTaskStatus = usePlanStore((s) => s.setTaskStatus)
  const toggleTask = usePlanStore((s) => s.toggleTask)
  const startFocus = useFocusStore((s) => s.start)

  const blocks = resolveItems(items, taskStatus)
  const total = planTotalMinutes(items)
  let taskNo = 0

  function openTask(taskId: string) {
    const block = blocks.find((b) => b.kind === 'task' && b.task.id === taskId)
    if (block && block.kind === 'task') {
      setTaskStatus(taskId, 'active')
      startFocus(block.task)
    }
    go('focus')
  }

  return (
    <div className="px-5 pt-2">
      <div className="mb-5">
        <h1 className="font-display text-[28px] font-bold leading-tight text-ink">Your plan</h1>
        <p className="text-[14px] text-muted">
          {total} min · adapted to {energy} energy
        </p>
      </div>

      {/* Why this order */}
      <div className="mb-5 rounded-card bg-success/25 p-4">
        <div className="mb-1.5 flex items-center gap-1.5">
          <SparkIcon size={15} className="text-primary" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/70">
            Why this order
          </span>
        </div>
        <p className="text-[14px] leading-snug text-ink/80">{rationale}</p>
      </div>

      <div className="space-y-2.5">
        {blocks.length === 0 ? (
          <Card className="px-4 py-8 text-center text-[14px] text-muted">
            No plan yet. Set your energy on Today and Flowly will build one.
          </Card>
        ) : (
          blocks.map((b, i) => {
            if (b.kind === 'break') return <BreakRow key={i} label={`Break · ${b.durationMin} min`} />
            taskNo += 1
            return (
              <TaskRow
                key={b.task.id}
                index={taskNo}
                done={b.task.status === 'done'}
                onToggleDone={() => toggleTask(b.task.id)}
                task={{
                  subject: b.task.subject,
                  detail: `${b.task.topic} · ${b.task.durationMin} min`,
                  difficulty: b.task.difficulty,
                }}
                onClick={() => openTask(b.task.id)}
              />
            )
          })
        )}
      </div>

      <p className="mt-5 pb-2 text-center text-[13px] text-muted">
        Tap a task to start it · check it off when done
      </p>
    </div>
  )
}
