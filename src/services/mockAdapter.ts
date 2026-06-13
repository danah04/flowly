// Mock adapter — produces fully-formed AgentResponse objects from the local
// mock data. Used both for mock mode and as the safe fallback when the live
// backend is unavailable. This is the bridge that lets mock and live share one
// interface, so screens never know which they're talking to.

import { PLANS } from '@/mock/plans'
import { taskById } from '@/mock/tasks'
import {
  coachQuickReply,
  coachFreeReply,
  type CoachContext,
} from '@/mock/coach'
import type {
  AgentResponse,
  ChatRequest,
  FeedbackRequest,
  PlanItem,
  PlanRequest,
  SessionEndRequest,
  SessionStartRequest,
} from '@/types/agent'
import type { Energy } from '@/types/domain'

function focusLabel(value: number): string {
  if (value >= 75) return 'strong'
  if (value >= 50) return 'steady'
  return 'building'
}

export function planItemsFor(energy: Energy): PlanItem[] {
  return PLANS[energy].blocks.map((b, i) => {
    if (b.kind === 'break') {
      return { id: `break-${energy}-${i}`, kind: 'break', durationMin: b.durationMin }
    }
    const t = taskById(b.taskId)!
    return {
      id: t.id,
      kind: 'task',
      subject: t.subject,
      topic: t.topic,
      difficulty: t.difficulty,
      durationMin: t.durationMin,
    }
  })
}

export function buildPlan(req: PlanRequest): AgentResponse {
  const plan = PLANS[req.energy]
  const items = planItemsFor(req.energy)
  const firstTask = items.find((it) => it.kind === 'task')
  return {
    intent: 'generate_plan',
    summary: `${plan.totalMin} min plan adapted to ${req.energy} energy.`,
    rationale: plan.rationale,
    energyLevel: req.energy,
    planItems: items,
    nextAction: firstTask
      ? { type: 'start_session', label: `Start ${firstTask.subject}`, taskId: firstTask.id }
      : { type: 'none', label: 'All done', taskId: null },
    needsUserInput: false,
    riskFlag: null,
  }
}

function ctxFrom(req: ChatRequest): CoachContext {
  return {
    energy: req.energy,
    focusLabel: focusLabel(req.focusLevel),
    streak: req.context.streakDays,
    weekHours: req.context.weekHours,
    goalHours: req.context.weeklyGoalHours,
    donePct: Math.round(
      (req.context.weekHours / Math.max(1, req.context.weeklyGoalHours)) * 100,
    ),
    nextSubject: req.context.nextSubject,
    nextDuration: null,
  }
}

export function buildChat(req: ChatRequest): AgentResponse {
  const ctx = ctxFrom(req)
  const text = req.quickActionKey
    ? coachQuickReply(req.quickActionKey, ctx)
    : coachFreeReply(req.message, ctx)

  const action = ((): AgentResponse['nextAction'] => {
    if (req.quickActionKey === 'break') return { type: 'take_break', label: 'Take a 5-min break', taskId: null }
    if (req.quickActionKey === 'start') return { type: 'start_session', label: 'Start session', taskId: null }
    if (req.quickActionKey === 'adjust') return { type: 'open_plan', label: 'Open plan', taskId: null }
    if (req.quickActionKey === 'progress') return { type: 'show_progress', label: 'Show progress', taskId: null }
    return null
  })()

  return {
    intent: 'chat',
    summary: text,
    rationale: '',
    energyLevel: req.energy,
    planItems: [],
    nextAction: action,
    needsUserInput: false,
    riskFlag: null,
  }
}

export function buildSessionStart(req: SessionStartRequest): AgentResponse {
  return {
    intent: 'start_session',
    summary: `Focus session started for ${req.subject}.`,
    rationale: 'Distraction blocking is on for the duration of this session.',
    energyLevel: req.energy,
    planItems: [],
    nextAction: { type: 'none', label: 'In session', taskId: req.taskId },
    needsUserInput: false,
    riskFlag: null,
  }
}

export function buildSessionEnd(req: SessionEndRequest): AgentResponse {
  const summary = req.completed
    ? `Nice — ${req.subject} done in ${req.elapsedMin} min with ${req.distractionsBlocked} distractions blocked.`
    : `Session ended after ${req.elapsedMin} min. Progress saved.`
  return {
    intent: 'end_session',
    summary,
    rationale: 'Logged to your focus history and weekly progress.',
    energyLevel: null,
    planItems: [],
    nextAction: { type: 'show_progress', label: 'See progress', taskId: null },
    needsUserInput: false,
    riskFlag: null,
  }
}

export function buildFeedback(req: FeedbackRequest): AgentResponse {
  return {
    intent: 'feedback',
    summary: 'Thanks — noted. I’ll use this to tune future plans.',
    rationale: '',
    energyLevel: null,
    planItems: [],
    nextAction: { type: 'none', label: 'Done', taskId: null },
    needsUserInput: false,
    riskFlag: req.value === 'down' ? 'user_flagged_plan' : null,
  }
}
