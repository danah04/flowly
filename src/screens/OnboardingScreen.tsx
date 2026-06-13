import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import {
  TargetIcon,
  CheckIcon,
  DropletIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@/components/ui/icons'
import { useNavigation } from '@/state/navigation'
import { useUserStore } from '@/state/userStore'
import type { ReactElement } from 'react'
import type { StudyGoal } from '@/types/domain'

interface Goal {
  key: StudyGoal
  label: string
  Icon: (p: { size?: number }) => ReactElement
}

const GOALS: Goal[] = [
  { key: 'exams', label: 'Ace my exams', Icon: TargetIcon },
  { key: 'assignments', label: 'Keep up with assignments', Icon: CheckIcon },
  { key: 'habit', label: 'Build a study habit', Icon: DropletIcon },
  { key: 'procrastination', label: 'Stop procrastinating', Icon: ClockIcon },
]

export function OnboardingScreen() {
  const go = useNavigation((s) => s.go)
  const setGoal = useUserStore((s) => s.setGoal)
  const [selected, setSelected] = useState<StudyGoal>('exams')

  function next() {
    setGoal(selected)
    go('today')
  }

  return (
    <div className="flex h-full flex-col px-7 pt-3">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-pill bg-primary" />
          <span className="h-1.5 w-1.5 rounded-pill bg-hairline" />
          <span className="h-1.5 w-1.5 rounded-pill bg-hairline" />
        </div>
        <span className="text-[13px] text-muted">Step 1 of 3</span>
      </div>

      <div className="mt-6 space-y-1.5">
        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">
          What are you working toward?
        </h1>
        <p className="text-[14px] text-muted">
          Pick what matters most — Flowly tailors your plan around it.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {GOALS.map(({ key, label, Icon }) => {
          const active = selected === key
          return (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(key)}
              className={`flex h-[124px] flex-col justify-between rounded-card border p-4 text-left transition-colors ${
                active ? 'border-primary bg-primary/8' : 'border-hairline bg-surface'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active ? 'bg-primary text-white' : 'bg-bg text-muted'
                }`}
              >
                <Icon size={18} />
              </span>
              <span
                className={`text-[15px] font-semibold leading-snug ${
                  active ? 'text-primary' : 'text-ink'
                }`}
              >
                {label}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-auto pb-8">
        <p className="mb-3 text-center text-[13px] text-muted">
          Next: your schedule &amp; energy patterns
        </p>
        <Button full onClick={next}>
          Continue <ChevronRightIcon size={18} />
        </Button>
      </div>
    </div>
  )
}
