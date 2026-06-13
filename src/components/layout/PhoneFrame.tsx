import type { ReactNode } from 'react'

// The physical device shell. Fixed 390 x 844 (spec §6) with a rounded bezel,
// notch, and home indicator. Children render inside the screen surface.

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
      <div
        className="relative shrink-0 rounded-[44px] bg-ink p-[10px] shadow-float"
        style={{ width: 390 + 20, height: 844 + 20 }}
      >
        {/* Screen surface */}
        <div
          className="relative overflow-hidden rounded-[36px] bg-bg"
          style={{ width: 390, height: 844 }}
        >
          {/* Notch */}
          <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-6 w-[120px] -translate-x-1/2 rounded-b-2xl bg-ink" />
          {children}
          {/* Home indicator */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-[120px] -translate-x-1/2 rounded-full bg-ink/25" />
        </div>
      </div>
    </div>
  )
}
