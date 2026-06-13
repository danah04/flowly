import { create } from 'zustand'
import { INSIGHTS } from '@/mock/profile'
import type { InsightMetrics } from '@/types/domain'

interface InsightsState {
  metrics: InsightMetrics
  // Apply a completed/uncompleted task's time to this week's progress.
  // delta is +1 (completed) or -1 (undone). Updates week hours, today's bar,
  // and today's completed count. Streak is a consecutive-day metric and is
  // intentionally left unchanged within a single day.
  applyTask: (durationMin: number, delta: 1 | -1) => void
}

const round1 = (n: number) => Math.round(n * 10) / 10

export const useInsightsStore = create<InsightsState>((set) => ({
  metrics: INSIGHTS,
  applyTask: (durationMin, delta) =>
    set((s) => {
      const hours = durationMin / 60
      const byDay = s.metrics.byDay.map((d, i) =>
        i === s.metrics.byDay.length - 1
          ? {
              ...d,
              focusHours: Math.max(0, round1(d.focusHours + delta * hours)),
              completed: Math.max(0, d.completed + delta),
            }
          : d,
      )
      return {
        metrics: {
          ...s.metrics,
          weekHours: Math.max(0, round1(s.metrics.weekHours + delta * hours)),
          byDay,
        },
      }
    }),
}))
