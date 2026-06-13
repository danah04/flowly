import type { CoachMessage, Energy } from '@/types/domain'

export const INITIAL_THREAD: CoachMessage[] = [
  { id: 'c1', from: 'coach', text: "Hi Sara! Ready to make today count? I've lined up your plan." },
  { id: 'c2', from: 'user', text: 'What should I start with?' },
  { id: 'c3', from: 'coach', text: "Let's warm up with Data Structures, then move into Computer Architecture while you're fresh. Sound good?" },
  { id: 'c4', from: 'user', text: "Let's do it" },
  { id: 'c5', from: 'coach', text: "Love that. I'll set a 32-minute session and check in at your break. You've got this 🌱" },
]

export interface QuickAction {
  key: 'start' | 'adjust' | 'break' | 'progress'
  label: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  { key: 'start', label: 'Start my session' },
  { key: 'adjust', label: 'Adjust my plan' },
  { key: 'break', label: 'Suggest a break' },
  { key: 'progress', label: 'Show my progress' },
]

// Live context the coach reasons over. Built from the stores at call time.
export interface CoachContext {
  energy: Energy
  focusLabel: string
  streak: number
  weekHours: number
  goalHours: number
  donePct: number
  nextSubject: string | null
  nextDuration: number | null
}

function adjustReply(ctx: CoachContext): string {
  if (ctx.energy === 'low')
    return "You're low on energy, so I'd push the hardest subject later and keep sessions short. Want me to reorder it that way?"
  if (ctx.energy === 'high')
    return "You're high on energy, so I front-loaded the hard subjects while focus is strongest. Want to keep that order or even it out?"
  return "You're at medium energy, so I kept the order steady. Want the hardest subject moved earlier, or left where it is?"
}

function breakReply(ctx: CoachContext): string {
  return `Your focus is ${ctx.focusLabel.toLowerCase()} right now — a 5-minute reset will keep it there. I'll hold your place and we'll pick up after.`
}

function progressReply(ctx: CoachContext): string {
  return `You're on a ${ctx.streak}-day streak with ${ctx.weekHours} of ${ctx.goalHours} focus hours (${ctx.donePct}% of your weekly goal). Mornings are your strongest window — let's protect them.`
}

function startReply(ctx: CoachContext): string {
  if (!ctx.nextSubject)
    return "You've cleared today's plan — really nice work. Want to add a short stretch session, or call it for the day?"
  return `Let's begin with ${ctx.nextSubject} for ${ctx.nextDuration} minutes while your focus is fresh. I'll keep distractions out of your way.`
}

export function coachQuickReply(key: QuickAction['key'], ctx: CoachContext): string {
  switch (key) {
    case 'start':
      return startReply(ctx)
    case 'adjust':
      return adjustReply(ctx)
    case 'break':
      return breakReply(ctx)
    case 'progress':
      return progressReply(ctx)
  }
}

export function coachFreeReply(text: string, ctx: CoachContext): string {
  const t = text.toLowerCase()
  if (/tired|exhausted|drained|sleepy/.test(t))
    return `That's okay. At ${ctx.energy} energy I'd switch you to something lighter and shorten the session so it still counts — want me to?`
  if (/break|rest|pause/.test(t)) return breakReply(ctx)
  if (/start|study|begin|focus/.test(t)) return startReply(ctx)
  if (/plan|schedule|reorder|adjust|order/.test(t)) return adjustReply(ctx)
  if (/progress|streak|how am i|stats|goal/.test(t)) return progressReply(ctx)
  if (/energy/.test(t))
    return `You're set to ${ctx.energy} energy. I can re-balance today's plan around that — open Plan to see the order.`
  return ctx.nextSubject
    ? `Got it. I'd keep it simple — one focused session on ${ctx.nextSubject}, then a check-in at the break. Want me to set it up?`
    : "Got it. You're all caught up for today — want to review your progress or set tomorrow up?"
}
