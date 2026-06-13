import { MotionConfig } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'

export default function App() {
  // Respect the user's OS "reduce motion" setting for all Framer animations.
  return (
    <MotionConfig reducedMotion="user">
      <AppShell />
    </MotionConfig>
  )
}
