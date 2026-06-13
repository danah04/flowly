// The five tab-bar destinations (wireframes 04–08, spec §7 IA).
// Profile (09) is reached from the avatar, not the tab bar.

export type TabKey = 'today' | 'plan' | 'focus' | 'coach' | 'insights'

// Routes that exist outside the tab bar.
export type RouteKey =
  | 'splash'
  | 'signup'
  | 'onboarding'
  | TabKey
  | 'profile'

export interface TabDef {
  key: TabKey
  label: string
}

// Order matches the wireframe tab bar, left to right.
export const TABS: TabDef[] = [
  { key: 'today', label: 'Today' },
  { key: 'plan', label: 'Plan' },
  { key: 'focus', label: 'Focus' },
  { key: 'coach', label: 'Coach' },
  { key: 'insights', label: 'Stats' },
]

// Screens that show the tab bar. Profile (09) shows it too, with no active tab,
// since it's reached from the avatar rather than a tab.
export const TABBED_ROUTES: RouteKey[] = [
  'today',
  'plan',
  'focus',
  'coach',
  'insights',
  'profile',
]
