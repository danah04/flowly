import { create } from 'zustand'
import { TASKS, taskById } from '@/mock/tasks'
import { PLANS } from '@/mock/plans'
import { planItemsFor } from '@/services/mockAdapter'
import { useInsightsStore } from './insightsStore'
import type { AgentSource, PlanItem } from '@/types/agent'
import type { Energy, StudyTask, TaskStatus } from '@/types/domain'

export interface ResolvedTaskBlock {
  kind: 'task'
  task: StudyTask
}
export interface ResolvedBreakBlock {
  kind: 'break'
  durationMin: number
}
export type ResolvedBlock = ResolvedTaskBlock | ResolvedBreakBlock

interface PlanState {
  energy: Energy
  items: PlanItem[] // schedule from the agent (mock or live)
  note: string // short adaptive line shown on Today
  rationale: string // "why this order" shown on Plan
  loading: boolean
  source: AgentSource
  taskStatus: Record<string, TaskStatus>
  setEnergy: (e: Energy) => void
  loadPlan: () => Promise<void>
  setTaskStatus: (id: string, status: TaskStatus) => void
  startNextTask: () => StudyTask | null
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  toggleTask: (id: string) => void
}

const seedStatus = (): Record<string, TaskStatus> =>
  Object.fromEntries(TASKS.map((t) => [t.id, t.status]))

// Plan generation is deterministic and LOCAL. It must never depend on the
// conversational coach agent, which returns free-form chat (and no structured
// plan items). Keeping this local is what stops energy changes from wiping the
// schedule or leaking coach prose into the Today screen. The live IBM agent is
// used only by the Coach screen. A future structured Planner agent could
// populate `items` here without any UI changes.
function localPlan(energy: Energy) {
  const plan = PLANS[energy]
  return {
    items: planItemsFor(energy),
    note: plan.energyNote,
    rationale: plan.rationale,
  }
}

const seed = localPlan('medium')

export const usePlanStore = create<PlanState>((set, get) => ({
  energy: 'medium',
  items: seed.items,
  note: seed.note,
  rationale: seed.rationale,
  loading: false,
  source: 'mock' as AgentSource,
  taskStatus: seedStatus(),

  setEnergy: (e) => {
    set({ energy: e })
    void get().loadPlan()
  },

  // Deterministic + synchronous. Swaps the plan for the current energy without
  // touching the network, so task completion state is preserved and no coach
  // text can leak in. Kept async-compatible for the call sites.
  loadPlan: async () => {
    const { items, note, rationale } = localPlan(get().energy)
    set({ items, note, rationale, source: 'mock', loading: false })
  },

  setTaskStatus: (id, status) =>
    set((s) => ({ taskStatus: { ...s.taskStatus, [id]: status } })),

  startNextTask: () => {
    const task = nextTodoItem(get().items, get().taskStatus)
    if (task) set((s) => ({ taskStatus: { ...s.taskStatus, [task.id]: 'active' } }))
    return task
  },

  completeTask: (id) => {
    if (get().taskStatus[id] === 'done') return
    set((s) => ({ taskStatus: { ...s.taskStatus, [id]: 'done' } }))
    useInsightsStore.getState().applyTask(itemDuration(get().items, id), 1)
  },

  uncompleteTask: (id) => {
    if (get().taskStatus[id] !== 'done') return
    set((s) => ({ taskStatus: { ...s.taskStatus, [id]: 'todo' } }))
    useInsightsStore.getState().applyTask(itemDuration(get().items, id), -1)
  },

  toggleTask: (id) => {
    if (get().taskStatus[id] === 'done') get().uncompleteTask(id)
    else get().completeTask(id)
  },
}))

// --- Selectors over plan items ---

function statusOf(
  item: PlanItem,
  taskStatus: Record<string, TaskStatus>,
): TaskStatus {
  return taskStatus[item.id] ?? item.status ?? 'todo'
}

function toTask(item: PlanItem, status: TaskStatus): StudyTask {
  return {
    id: item.id,
    subject: item.subject ?? 'Study',
    topic: item.topic ?? '',
    difficulty: item.difficulty ?? 'medium',
    durationMin: item.durationMin,
    status,
  }
}

export function resolveItems(
  items: PlanItem[],
  taskStatus: Record<string, TaskStatus>,
): ResolvedBlock[] {
  return items.map((it) =>
    it.kind === 'break'
      ? { kind: 'break', durationMin: it.durationMin }
      : { kind: 'task', task: toTask(it, statusOf(it, taskStatus)) },
  )
}

export function planSummaryItems(
  items: PlanItem[],
  taskStatus: Record<string, TaskStatus>,
): { done: number; total: number } {
  const tasks = items.filter((it) => it.kind === 'task')
  const done = tasks.filter((it) => statusOf(it, taskStatus) === 'done').length
  return { done, total: tasks.length }
}

export function planTotalMinutes(items: PlanItem[]): number {
  return items.reduce((sum, it) => sum + it.durationMin, 0)
}

export function nextTodoItem(
  items: PlanItem[],
  taskStatus: Record<string, TaskStatus>,
): StudyTask | null {
  const it = items.find(
    (b) => b.kind === 'task' && statusOf(b, taskStatus) !== 'done',
  )
  return it ? toTask(it, statusOf(it, taskStatus)) : null
}

export function lighterItem(
  items: PlanItem[],
  taskStatus: Record<string, TaskStatus>,
): StudyTask | null {
  const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 }
  const candidates = items
    .filter((b) => b.kind === 'task' && statusOf(b, taskStatus) !== 'done')
    .map((b) => toTask(b, 'todo'))
  if (candidates.length === 0) return null
  candidates.sort(
    (a, b) =>
      order[a.difficulty] - order[b.difficulty] || a.durationMin - b.durationMin,
  )
  return candidates[0]
}

export function itemDuration(items: PlanItem[], id: string): number {
  return items.find((it) => it.id === id)?.durationMin ?? taskById(id)?.durationMin ?? 0
}
