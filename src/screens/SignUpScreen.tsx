import { Button } from '@/components/ui/Button'
import { useNavigation } from '@/state/navigation'

function Field({
  label,
  placeholder,
  type = 'text',
}: {
  label: string
  placeholder: string
  type?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-btn border border-hairline bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-muted/70 outline-none transition focus:border-primary"
      />
    </label>
  )
}

export function SignUpScreen() {
  const go = useNavigation((s) => s.go)

  return (
    <div className="flex h-full flex-col px-7 pt-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-[28px] font-bold leading-tight text-ink">
          Welcome to Flowly
        </h1>
        <p className="text-[15px] text-muted">Create your account to start studying smarter.</p>
      </div>

      <div className="mt-7 space-y-4">
        <Field label="Full name" placeholder="Sara Mohammad" />
        <Field label="Email" placeholder="sara@university.edu" type="email" />
        <Field label="Password" placeholder="••••••••" type="password" />
      </div>

      <div className="mt-6">
        <Button full onClick={() => go('onboarding')}>
          Create account
        </Button>
      </div>

      <div className="my-5 flex items-center gap-3 text-[13px] text-muted">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <button
        type="button"
        onClick={() => go('onboarding')}
        className="flex w-full items-center justify-center gap-2.5 rounded-btn border border-hairline bg-surface py-3.5 text-[15px] font-semibold text-ink transition active:scale-[.985]"
      >
        <span className="font-display text-[17px] font-bold text-primary">G</span>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-[14px] text-muted">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => go('today')}
          className="font-semibold text-primary"
        >
          Log in
        </button>
      </p>
    </div>
  )
}
