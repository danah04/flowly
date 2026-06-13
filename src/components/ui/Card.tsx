import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Removes the default shadow for nested/flat cards */
  flat?: boolean
}

export function Card({ children, flat, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-card bg-surface ${flat ? '' : 'shadow-card'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
