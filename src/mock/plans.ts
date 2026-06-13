import type { StudyPlan, Energy } from '@/types/domain'

// Three daily plans, one per energy level. Selecting energy on Today
// swaps which plan is active — this is the prototype's "adaptive" behavior.
// The medium plan matches the wireframe exactly.

export const PLANS: Record<Energy, StudyPlan> = {
  low: {
    id: 'plan-low',
    energy: 'low',
    totalMin: 80,
    energyNote: 'Low energy — fewer tasks and shorter sessions, easy work first.',
    rationale:
      "You're low on energy, so I front-loaded the lighter work and cut the session count to keep today achievable.",
    blocks: [
      { kind: 'task', taskId: 't-dm' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-se' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-ds' },
    ],
  },
  medium: {
    id: 'plan-medium',
    energy: 'medium',
    totalMin: 120,
    energyNote: 'Balanced energy — steady order, slightly shorter sessions to protect focus.',
    rationale:
      "You're at medium energy, so I kept the order steady and trimmed sessions a little to protect your focus.",
    blocks: [
      { kind: 'task', taskId: 't-ds' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-os' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-ca' },
      { kind: 'task', taskId: 't-dm' },
      { kind: 'task', taskId: 't-net' },
    ],
  },
  high: {
    id: 'plan-high',
    energy: 'high',
    totalMin: 150,
    energyNote: 'High energy — tackle the hard subjects first while focus is strong.',
    rationale:
      "You're high on energy, so I put the hardest subjects first while your focus is strongest, then eased off.",
    blocks: [
      { kind: 'task', taskId: 't-algo' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-ca' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-la' },
      { kind: 'break', durationMin: 5 },
      { kind: 'task', taskId: 't-os' },
    ],
  },
}
