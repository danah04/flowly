// Normalization is the safety net: whatever the backend returns, the frontend
// only ever sees a valid AgentResponse with sane defaults. This guarantees raw
// or malformed model text can never reach the UI in an unexpected shape.

import type {
  AgentIntent,
  AgentResponse,
  NextAction,
  PlanItem,
} from '@/types/agent'
import type { Difficulty, Energy, TaskStatus } from '@/types/domain'

// Trim, collapse whitespace, strip control chars, and cap length.
export function sanitizeText(
  value: unknown,
  fallback = '',
): string {
  if (typeof value !== 'string') return fallback

  return value.trim() || fallback
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const STATUSES: TaskStatus[] = ['todo', 'active', 'done']
const ENERGIES: Energy[] = ['low', 'medium', 'high']
const ACTION_TYPES: NextAction['type'][] = [
  'start_session',
  'take_break',
  'open_plan',
  'show_progress',
  'none',
]

function asEnum<T extends string>(value: unknown, allowed: T[]): T | null {
  return typeof value === 'string' && (allowed as string[]).includes(value)
    ? (value as T)
    : null
}

function normalizePlanItem(raw: unknown, i: number): PlanItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const kind = r.kind === 'break' ? 'break' : 'task'
  const durationMin = Number(r.durationMin)
  const item: PlanItem = {
    id: typeof r.id === 'string' && r.id ? r.id : `item-${i}`,
    kind,
    durationMin: Number.isFinite(durationMin) ? Math.max(0, durationMin) : 0,
  }
  if (kind === 'task') {
    item.subject = sanitizeText(r.subject, 'Study')
    item.topic = sanitizeText(r.topic, '')
    item.difficulty = asEnum<Difficulty>(r.difficulty, DIFFICULTIES) ?? 'medium'
    item.status = asEnum<TaskStatus>(r.status, STATUSES) ?? 'todo'
  }
  return item
}

function normalizeNextAction(raw: unknown): NextAction | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const type = asEnum<NextAction['type']>(r.type, ACTION_TYPES)
  if (!type) return null
  return {
    type,
    label: sanitizeText(r.label, 'Continue'),
    taskId: typeof r.taskId === 'string' ? r.taskId : null,
  }
}

// Coerce any object into a valid AgentResponse. Missing/garbage fields become
// safe defaults; only whitelisted fields survive.
export function normalizeAgentResponse(
  raw: unknown,
  intent: AgentIntent,
): AgentResponse {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const items = Array.isArray(r.planItems)
    ? r.planItems
        .map((it, i) => normalizePlanItem(it, i))
        .filter((it): it is PlanItem => it !== null)
    : []
  return {
    intent: asEnum<AgentIntent>(r.intent, [
      'generate_plan',
      'chat',
      'start_session',
      'end_session',
      'feedback',
    ]) ?? intent,
    summary: sanitizeText(r.assistantMessage ?? r.summary),
    assistantMessage: sanitizeText(r.assistantMessage ?? r.summary),
    rationale: sanitizeText(r.rationale),
    energyLevel: asEnum<Energy>(r.energyLevel, ENERGIES),
    planItems: items,
    nextAction: normalizeNextAction(r.nextAction),
    needsUserInput: r.needsUserInput === true,
    riskFlag:
      typeof r.riskFlag === 'string' && r.riskFlag ? sanitizeText(r.riskFlag) : null,
    threadId: typeof r.threadId === 'string' && r.threadId ? r.threadId : null,
  }
}
