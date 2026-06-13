import { motion } from 'framer-motion'
import { TABS } from '@/types/navigation'
import {
  HomeIcon,
  CalendarIcon,
  TimerIcon,
  ChatIcon,
  ChartIcon,
} from '@/components/ui/icons'
import { useNavigation } from '@/state/navigation'
import type { TabKey } from '@/types/navigation'

const TAB_ICONS: Record<TabKey, typeof HomeIcon> = {
  today: HomeIcon,
  plan: CalendarIcon,
  focus: TimerIcon,
  coach: ChatIcon,
  insights: ChartIcon,
}

export function TabBar() {
  const route = useNavigation((s) => s.route)
  const go = useNavigation((s) => s.go)

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface/95 backdrop-blur-sm"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-between px-3 pt-2 pb-5">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.key]
          const active = route === (tab.key as TabKey)
          return (
            <li key={tab.key} className="flex-1">
              <button
                type="button"
                onClick={() => go(tab.key)}
                aria-current={active ? 'page' : undefined}
                className="relative flex w-full flex-col items-center gap-1 py-1 outline-none"
              >
                <span
                  className={
                    active ? 'text-primary' : 'text-muted transition-colors'
                  }
                >
                  <Icon size={22} />
                </span>
                <span
                  className={`text-[10.5px] tracking-tight ${
                    active ? 'font-semibold text-primary' : 'text-muted'
                  }`}
                >
                  {tab.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="tab-active-dot"
                    className="absolute -top-[9px] h-1 w-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
