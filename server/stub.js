// Deterministic server-side stub. Used when IBM Orchestrate isn't configured,
// so "live mode" is fully demoable end to end. Returns the same contract shape
// the real agent would; swapping in real credentials replaces this transparently.

const PLAN_TEXT = {
  low: {
    note: 'Low energy — fewer tasks and shorter sessions, easy work first.',
    rationale:
      "You're low on energy, so I front-loaded the lighter work and cut the session count to keep today achievable.",
    items: [
      { id: 't-dm', kind: 'task', subject: 'Discrete Math', topic: 'Proofs', difficulty: 'easy', durationMin: 20 },
      { id: 'b1', kind: 'break', durationMin: 5 },
      { id: 't-se', kind: 'task', subject: 'Software Engineering', topic: 'Testing basics', difficulty: 'easy', durationMin: 22 },
      { id: 'b2', kind: 'break', durationMin: 5 },
      { id: 't-ds', kind: 'task', subject: 'Data Structures', topic: 'Trees', difficulty: 'medium', durationMin: 32 },
    ],
  },
  medium: {
    note: 'Balanced energy — steady order, slightly shorter sessions to protect focus.',
    rationale:
      "You're at medium energy, so I kept the order steady and trimmed sessions a little to protect your focus.",
    items: [
      { id: 't-ds', kind: 'task', subject: 'Data Structures', topic: 'Trees', difficulty: 'medium', durationMin: 32 },
      { id: 'b1', kind: 'break', durationMin: 5 },
      { id: 't-os', kind: 'task', subject: 'Operating Systems', topic: 'Scheduling', difficulty: 'medium', durationMin: 28 },
      { id: 'b2', kind: 'break', durationMin: 5 },
      { id: 't-ca', kind: 'task', subject: 'Computer Architecture', topic: 'Ch. 4 · Pipelining', difficulty: 'hard', durationMin: 40 },
      { id: 't-dm', kind: 'task', subject: 'Discrete Math', topic: 'Proofs', difficulty: 'easy', durationMin: 20 },
      { id: 't-net', kind: 'task', subject: 'Networks', topic: 'TCP handshake', difficulty: 'medium', durationMin: 25 },
    ],
  },
  high: {
    note: 'High energy — tackle the hard subjects first while focus is strong.',
    rationale:
      "You're high on energy, so I put the hardest subjects first while your focus is strongest, then eased off.",
    items: [
      { id: 't-algo', kind: 'task', subject: 'Algorithms', topic: 'Dynamic programming', difficulty: 'hard', durationMin: 45 },
      { id: 'b1', kind: 'break', durationMin: 5 },
      { id: 't-ca', kind: 'task', subject: 'Computer Architecture', topic: 'Ch. 4 · Pipelining', difficulty: 'hard', durationMin: 40 },
      { id: 'b2', kind: 'break', durationMin: 5 },
      { id: 't-la', kind: 'task', subject: 'Linear Algebra', topic: 'Eigenvalues', difficulty: 'hard', durationMin: 35 },
      { id: 'b3', kind: 'break', durationMin: 5 },
      { id: 't-os', kind: 'task', subject: 'Operating Systems', topic: 'Scheduling', difficulty: 'medium', durationMin: 28 },
    ],
  },
}

function focusLabel(v) {
  if (v >= 75) return 'strong'
  if (v >= 50) return 'steady'
  return 'building'
}

function plan(req) {
  const p = PLAN_TEXT[req.energy] || PLAN_TEXT.medium
  const first = p.items.find((it) => it.kind === 'task')
  const total = p.items.reduce((s, it) => s + it.durationMin, 0)
  return {
    intent: 'generate_plan',
    summary: p.note,
    rationale: p.rationale,
    energyLevel: req.energy,
    planItems: p.items,
    nextAction: first
      ? { type: 'start_session', label: `Start ${first.subject}`, taskId: first.id }
      : { type: 'none', label: 'All done', taskId: null },
    needsUserInput: false,
    riskFlag: null,
  }
}

function chat(req) {
  const energy = req.energy || 'medium'
  const lvl = focusLabel(req.focusLevel ?? 70)
  const next = req.context?.nextSubject
  let summary
  let action = null
  switch (req.quickActionKey) {
    case 'break':
      summary = `Your focus is ${lvl} right now — a 5-minute reset will keep it there. I'll hold your place.`
      action = { type: 'take_break', label: 'Take a 5-min break', taskId: null }
      break
    case 'adjust':
      summary =
        energy === 'low'
          ? "You're low on energy, so I'd push the hardest subject later and keep sessions short. Want me to reorder?"
          : energy === 'high'
          ? "You're high on energy, so I front-loaded the hard subjects. Keep that order or even it out?"
          : "You're at medium energy, so I kept the order steady. Move the hardest subject earlier, or leave it?"
      action = { type: 'open_plan', label: 'Open plan', taskId: null }
      break
    case 'progress':
      summary = `You're on a ${req.context?.streakDays ?? 0}-day streak with ${req.context?.weekHours ?? 0} of ${req.context?.weeklyGoalHours ?? 30} focus hours. Mornings are your strongest window.`
      action = { type: 'show_progress', label: 'Show progress', taskId: null }
      break
    case 'start':
      summary = next
        ? `Let's begin with ${next} while your focus is fresh. I'll keep distractions out of your way.`
        : "You've cleared today's plan — nice work. Want to add a short stretch session?"
      action = { type: 'start_session', label: 'Start session', taskId: null }
      break
    default: {
      const t = (req.message || '').toLowerCase()
      if (/tired|exhausted|drained/.test(t))
        summary = `That's okay. At ${energy} energy I'd switch you to something lighter and shorten the session. Want me to?`
      else if (/break|rest|pause/.test(t))
        summary = `Your focus is ${lvl} — a 5-minute reset will keep it there. I'll hold your place.`
      else if (/plan|adjust|reorder|order/.test(t))
        summary = `I kept today at ${energy} energy with steady sessions. Want the hardest subject moved?`
      else if (/progress|streak|stats|goal/.test(t))
        summary = `You're on a ${req.context?.streakDays ?? 0}-day streak at ${req.context?.weekHours ?? 0} focus hours this week.`
      else summary = next ? `I'd start with one focused session on ${next}, then check in at the break. Set it up?` : "You're all caught up for today — want to review your progress?"
    }
  }
  return {
    intent: 'chat',
    summary,
    rationale: '',
    energyLevel: energy,
    planItems: [],
    nextAction: action,
    needsUserInput: false,
    riskFlag: null,
  }
}

function sessionStart(req) {
  return {
    intent: 'start_session',
    summary: `Focus session started for ${req.subject}.`,
    rationale: 'Distraction blocking is on for the duration of this session.',
    energyLevel: req.energy ?? null,
    planItems: [],
    nextAction: { type: 'none', label: 'In session', taskId: req.taskId ?? null },
    needsUserInput: false,
    riskFlag: null,
  }
}

function sessionEnd(req) {
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

function feedback(req) {
  return {
    intent: 'feedback',
    summary: 'Thanks — noted. I will use this to tune future plans.',
    rationale: '',
    energyLevel: null,
    planItems: [],
    nextAction: { type: 'none', label: 'Done', taskId: null },
    needsUserInput: false,
    riskFlag: req.value === 'down' ? 'user_flagged_plan' : null,
  }
}

export const stub = { plan, chat, sessionStart, sessionEnd, feedback }
