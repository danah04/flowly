import type { ReactElement, ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { SectionLabel } from '@/components/ui/display'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TargetIcon,
  CalendarIcon,
  ShieldIcon,
  BellIcon,
  SparkIcon,
  CheckIcon,
} from '@/components/ui/icons'
import { useNavigation } from '@/state/navigation'
import { useUserStore } from '@/state/userStore'

function Row({
  icon,
  label,
  right,
}: {
  icon: ReactElement
  label: string
  right: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg text-primary">
        {icon}
      </span>
      <span className="flex-1 text-[15px] font-medium text-ink">{label}</span>
      {right}
    </div>
  )
}

export function ProfileScreen() {
  const back = useNavigation((s) => s.back)
  const user = useUserStore((s) => s.user)
  const toggleSetting = useUserStore((s) => s.toggleSetting)
  const { settings } = user

  return (
    <div className="px-5 pt-1">
      {/* Header */}
      <button
        type="button"
        onClick={back}
        className="mb-4 flex items-center gap-1.5 font-display text-[20px] font-bold text-ink"
      >
        <ChevronLeftIcon size={22} /> Profile
      </button>

      {/* Identity */}
      <div className="mb-6 flex items-center gap-3.5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-[22px] font-semibold text-white">
          {user.initial}
        </span>
        <div>
          <p className="font-display text-[18px] font-semibold text-ink">{user.fullName}</p>
          <p className="text-[14px] text-muted">{user.role}</p>
        </div>
      </div>

      {/* Study */}
      <div className="mb-2 space-y-2">
        <SectionLabel>Study</SectionLabel>
        <Card className="divide-y divide-hairline">
          <Row
            icon={<TargetIcon size={18} />}
            label="Study goals"
            right={<ChevronRightIcon size={18} className="text-muted" />}
          />
          <Row
            icon={<CalendarIcon size={18} />}
            label="Connected calendar"
            right={
              <span className="text-[14px] text-muted">
                {settings.connectedCalendar ?? 'Not connected'}
              </span>
            }
          />
        </Card>
      </div>

      {/* Focus & control */}
      <div className="mt-5 mb-2 space-y-2">
        <SectionLabel>Focus &amp; control</SectionLabel>
        <Card className="divide-y divide-hairline">
          <Row
            icon={<ShieldIcon size={18} />}
            label="Focus mode & app blocking"
            right={
              <Toggle
                checked={settings.appBlocking}
                onChange={() => toggleSetting('appBlocking')}
                label="Focus mode and app blocking"
              />
            }
          />
          <Row
            icon={<BellIcon size={18} />}
            label="Smart reminders"
            right={
              <Toggle
                checked={settings.smartReminders}
                onChange={() => toggleSetting('smartReminders')}
                label="Smart reminders"
              />
            }
          />
          <Row
            icon={<SparkIcon size={18} />}
            label="AI plan recommendations"
            right={
              <Toggle
                checked={settings.aiRecommendations}
                onChange={() => toggleSetting('aiRecommendations')}
                label="AI plan recommendations"
              />
            }
          />
        </Card>
        <div className="flex items-center gap-2 px-1 pt-1 text-[13px] text-muted">
          <CheckIcon size={15} className="text-success" />
          You&apos;re always in control — override the plan or pause blocking anytime.
        </div>
      </div>

      {/* Account */}
      <div className="mt-5 space-y-2 pb-2">
        <SectionLabel>Account</SectionLabel>
        <Card className="divide-y divide-hairline">
          <Row
            icon={<span className="font-display text-[14px] font-bold">@</span>}
            label="Email & password"
            right={<ChevronRightIcon size={18} className="text-muted" />}
          />
          <button type="button" onClick={back} className="w-full text-left">
            <Row icon={<ChevronRightIcon size={18} />} label="Sign out" right={<span />} />
          </button>
        </Card>
      </div>
    </div>
  )
}
