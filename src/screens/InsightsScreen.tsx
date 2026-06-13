import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/display'
import { SparkIcon } from '@/components/ui/icons'
import { useInsightsStore } from '@/state/insightsStore'

export function InsightsScreen() {
  const m = useInsightsStore((s) => s.metrics)
  const goalPct =
    m.weeklyGoalHours > 0
      ? Math.min(100, Math.round((m.weekHours / m.weeklyGoalHours) * 100))
      : 0
  const hasDays = m.byDay.length > 0
  const maxHours = Math.max(...m.byDay.map((d) => d.focusHours), 1)

  const stats = [
    { value: `${m.streakDays}d`, label: 'Streak', accent: true },
    { value: m.bestTime, label: 'Best time', accent: false },
    { value: `${m.weekHours}h`, label: 'This week', accent: false },
  ]

  return (
    <div className="px-5 pt-2">
      <h1 className="mb-5 font-display text-[28px] font-bold leading-tight text-ink">
        Your patterns
      </h1>

      {/* Stat tiles */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="px-3 py-4 text-center">
            <p
              className={`font-display text-[22px] font-bold leading-none ${
                s.accent ? 'text-primary' : 'text-ink'
              }`}
            >
              {s.value}
            </p>
            <p className="mt-1.5 text-[12px] text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Weekly goal */}
      <Card className="mb-4 p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-ink">Weekly goal</span>
          <span className="font-display text-[15px] font-semibold text-primary">{goalPct}%</span>
        </div>
        <ProgressBar value={goalPct} />
        <p className="mt-2.5 text-[13px] text-muted">
          {m.weekHours} / {m.weeklyGoalHours} focus hours
        </p>
      </Card>

      {/* Focus hours by day */}
      <Card className="mb-4 p-4">
        <p className="mb-4 font-display text-[15px] font-semibold text-ink">Focus hours by day</p>
        {hasDays ? (
          <div className="flex h-[120px] items-end justify-between gap-2.5">
            {m.byDay.map((day, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-md bg-primary/35"
                  style={{ height: `${(day.focusHours / maxHours) * 84 + 6}px` }}
                  title={`${day.focusHours}h`}
                />
                <span className="text-[12px] text-muted">{day.day}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-[13px] text-muted">
            No focus sessions logged yet this week.
          </p>
        )}
      </Card>

      {/* AI insight */}
      {m.insight && (
        <div className="rounded-card bg-success/25 p-4">
          <div className="flex gap-2">
            <SparkIcon size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-[14px] leading-snug text-ink/80">
              <span className="font-semibold text-ink">AI insight.</span> {m.insight}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
