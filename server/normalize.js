// Server-side normalization. Whatever IBM Orchestrate returns is coerced into
// the strict Flowly contract before it leaves the backend, so the frontend
// only ever receives clean, predictable JSON — never raw model text.

const DIFFICULTIES = ['easy', 'medium', 'hard']
const STATUSES = ['todo', 'active', 'done']
const ENERGIES = ['low', 'medium', 'high']
const ACTION_TYPES = ['start_session', 'take_break', 'open_plan', 'show_progress', 'none']
const INTENTS = ['generate_plan', 'chat', 'start_session', 'end_session', 'feedback']

// Strip only dangerous control characters. Crucially we KEEP \n (\u000a),
// \r (\u000d) and \t (\u0009) so markdown structure (lists, paragraphs, line
// breaks) survives. No length cap — the full agent response reaches the UI.
function sanitizeText(value, fallback = '') {
  if (typeof value !== 'string') return fallback
  const cleaned = value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+\n/g, '\n') // tidy trailing spaces before newlines
    .trim()
  return cleaned || fallback
}

const asEnum = (v, allowed) => (typeof v === 'string' && allowed.includes(v) ? v : null)

function normalizePlanItem(raw, i) {
  if (!raw || typeof raw !== 'object') return null
  const kind = raw.kind === 'break' ? 'break' : 'task'
  const durationMin = Number(raw.durationMin)
  const item = {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `item-${i}`,
    kind,
    durationMin: Number.isFinite(durationMin) ? Math.max(0, durationMin) : 0,
  }
  if (kind === 'task') {
    item.subject = sanitizeText(raw.subject, 'Study')
    item.topic = sanitizeText(raw.topic, '')
    item.difficulty = asEnum(raw.difficulty, DIFFICULTIES) || 'medium'
    item.status = asEnum(raw.status, STATUSES) || 'todo'
  }
  return item
}

function normalizeNextAction(raw) {
  if (!raw || typeof raw !== 'object') return null
  const type = asEnum(raw.type, ACTION_TYPES)
  if (!type) return null
  return {
    type,
    label: sanitizeText(raw.label, 'Continue'),
    taskId: typeof raw.taskId === 'string' ? raw.taskId : null,
  }
}

export function normalizeResponse(raw, intent) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const planItems = Array.isArray(r.planItems)
    ? r.planItems.map(normalizePlanItem).filter(Boolean)
    : []
  return {
    intent: asEnum(r.intent, INTENTS) || intent,
    summary: sanitizeText(r.summary ?? r.assistantMessage),
    assistantMessage: sanitizeText(r.assistantMessage ?? r.summary),
    rationale: sanitizeText(r.rationale),
    energyLevel: asEnum(r.energyLevel, ENERGIES),
    planItems,
    nextAction: normalizeNextAction(r.nextAction),
    needsUserInput: r.needsUserInput === true,
    riskFlag: typeof r.riskFlag === 'string' && r.riskFlag ? sanitizeText(r.riskFlag) : null,
    threadId: typeof r.threadId === 'string' && r.threadId ? r.threadId : null,
  }
}
