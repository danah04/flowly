import type { ReactElement } from 'react'
import type { RouteKey } from '@/types/navigation'
import { SplashScreen } from './SplashScreen'
import { SignUpScreen } from './SignUpScreen'
import { OnboardingScreen } from './OnboardingScreen'
import { TodayScreen } from './TodayScreen'
import { PlanScreen } from './PlanScreen'
import { FocusScreen } from './FocusScreen'
import { CoachScreen } from './CoachScreen'
import { InsightsScreen } from './InsightsScreen'
import { ProfileScreen } from './ProfileScreen'

export const SCREENS: Record<RouteKey, () => ReactElement> = {
  splash: SplashScreen,
  signup: SignUpScreen,
  onboarding: OnboardingScreen,
  today: TodayScreen,
  plan: PlanScreen,
  focus: FocusScreen,
  coach: CoachScreen,
  insights: InsightsScreen,
  profile: ProfileScreen,
}
