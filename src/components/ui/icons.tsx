import type { SVGProps } from 'react'

// Thin-stroke line icons sized to inherit currentColor.
// Matches the lightweight outline style used in the Flowly wireframes.

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

export function HomeIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

export function CalendarIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8 3.5v4M16 3.5v4" />
    </svg>
  )
}

export function TimerIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 13.5V9.5M9.5 3.5h5" />
    </svg>
  )
}

export function ChatIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3A7.9 7.9 0 0 1 4 12Z" />
    </svg>
  )
}

export function ChartIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V7M17 20v-9" />
    </svg>
  )
}

export function ChevronLeftIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  )
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m10 6 6 6-6 6" />
    </svg>
  )
}

export function LockIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="10.5" width="14" height="9" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}

export function FlameIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3.5c3 3 4.5 5.5 4.5 8a4.5 4.5 0 0 1-9 0c0-1 .4-2 1.3-3 .2 1 .7 1.5 1.2 1.8C9.8 8.8 10 6.5 12 3.5Z" />
    </svg>
  )
}

export function SparkIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
    </svg>
  )
}

export function SendIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12 19 5l-4.5 14-3-6.5L5 12Z" />
    </svg>
  )
}

export function PauseIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="7" y="5" width="3.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
    </svg>
  )
}

export function PlayIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M7 5.5v13l11-6.5L7 5.5Z" />
    </svg>
  )
}

export function BatteryIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="8" width="15" height="8" rx="2" />
      <path d="M20.5 11v2" />
    </svg>
  )
}

export function TargetIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function DropletIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3.5c3.2 3.8 5.5 6.6 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2.9 2.3-5.7 5.5-9.5Z" />
    </svg>
  )
}

export function ClockIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.3l2.8 1.7" />
    </svg>
  )
}

export function ShieldIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3.5 19 6v5.5c0 4.4-3 7.3-7 9-4-1.7-7-4.6-7-9V6l7-2.5Z" />
    </svg>
  )
}

export function BellIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6.5 16V10a5.5 5.5 0 0 1 11 0v6l1.5 2h-14L6.5 16Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function GoogleIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.2-.18-1.8H12v3.4h5.4c-.1.9-.7 2.3-2 3.2l2.9 2.27c1.85-1.7 2.92-4.22 2.92-7.07Z" />
      <path fill="#34A853" d="M12 21.6c2.64 0 4.85-.87 6.47-2.37l-3.08-2.4c-.83.58-1.94.98-3.39.98-2.6 0-4.8-1.74-5.58-4.07l-3.13 2.4A9.6 9.6 0 0 0 12 21.6Z" />
      <path fill="#FBBC05" d="M6.42 13.74A5.9 5.9 0 0 1 6.1 12c0-.6.1-1.2.27-1.74L3.26 7.82A9.6 9.6 0 0 0 2.4 12c0 1.55.37 3.01 1.02 4.18l3-2.44Z" />
      <path fill="#EA4335" d="M12 6.18c1.84 0 3.08.8 3.79 1.46l2.77-2.7C16.84 3.3 14.64 2.4 12 2.4A9.6 9.6 0 0 0 3.26 7.82l3.13 2.44C7.2 7.92 9.4 6.18 12 6.18Z" />
    </svg>
  )
}

