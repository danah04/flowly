import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-card hover:bg-primary-dark',
  secondary: 'bg-secondary text-ink hover:brightness-95',
  outline: 'border border-hairline bg-surface text-ink hover:bg-bg',
  ghost: 'text-primary hover:bg-primary/5',
}

export function Button({
  variant = 'primary',
  full,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3.5 text-[15px] font-semibold transition active:scale-[.985] disabled:opacity-50 ${
        VARIANTS[variant]
      } ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
