import { Button } from '@/components/ui/Button'
import { useNavigation } from '@/state/navigation'

function LogoMark() {
  return (
    <div
      className="flex h-[88px] w-[88px] items-center justify-center rounded-[26px] shadow-card"
      style={{
        background:
          'linear-gradient(150deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-dark)) 100%)',
      }}
    >
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        <path
          d="M9 27c4-9 7-9 11 0s7 9 11 0"
          stroke="white"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function SplashScreen() {
  const go = useNavigation((s) => s.go)

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <LogoMark />
        <div className="space-y-2">
          <h1 className="font-display text-5xl font-bold tracking-tight text-ink">Flowly</h1>
          <p className="text-[15px] text-muted">Study with your flow, not against it.</p>
        </div>
        <div className="flex items-center gap-1.5 pt-2">
          <span className="h-1.5 w-6 rounded-pill bg-primary" />
          <span className="h-1.5 w-1.5 rounded-pill bg-hairline" />
          <span className="h-1.5 w-1.5 rounded-pill bg-hairline" />
        </div>
      </div>
      <div className="w-full pb-10">
        <Button full onClick={() => go('signup')}>
          Get started
        </Button>
      </div>
    </div>
  )
}
