import { motion } from 'framer-motion'
import { useState } from 'react'

interface ToggleProps {
  /** Controlled value. If provided, the toggle reflects this and calls onChange. */
  checked?: boolean
  onChange?: (next: boolean) => void
  /** Uncontrolled initial value (used only when `checked` is omitted). */
  defaultOn?: boolean
  label?: string
}

// Visual switch. Works controlled (checked + onChange) or uncontrolled.
export function Toggle({ checked, onChange, defaultOn = false, label }: ToggleProps) {
  const [internal, setInternal] = useState(defaultOn)
  const isControlled = checked !== undefined
  const on = isControlled ? checked : internal

  function toggle() {
    const next = !on
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={toggle}
      className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${
        on ? 'bg-primary' : 'bg-hairline'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ left: on ? 'calc(100% - 1.25rem - 0.25rem)' : '0.25rem' }}
      />
    </button>
  )
}
