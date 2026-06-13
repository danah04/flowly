// Cosmetic device status bar. Mirrors the wireframes: time left, "Flowly" right.
// `showBrand` is false on the splash screen, which has no top-right wordmark.

interface StatusBarProps {
  showBrand?: boolean
}

export function StatusBar({ showBrand = true }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1 text-[13px] font-medium text-ink select-none">
      <span>9:41</span>
      {showBrand && <span className="font-display text-muted">Flowly</span>}
    </div>
  )
}
