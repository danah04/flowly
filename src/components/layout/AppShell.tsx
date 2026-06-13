import { AnimatePresence, motion } from 'framer-motion'
import { PhoneFrame } from './PhoneFrame'
import { StatusBar } from './StatusBar'
import { TabBar } from './TabBar'
import { SCREENS } from '@/screens/registry'
import { useNavigation } from '@/state/navigation'
import { TABBED_ROUTES } from '@/types/navigation'

export function AppShell() {
  const route = useNavigation((s) => s.route)
  const hasTabBar = TABBED_ROUTES.includes(route)
  const showBrand = route !== 'splash'
  const Screen = SCREENS[route]

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col">
        <StatusBar showBrand={showBrand} />

        {/* Screen outlet — scrolls independently, leaves room for the tab bar */}
        <main
          className={`no-scrollbar relative flex-1 overflow-y-auto ${
            hasTabBar ? 'pb-24' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </main>

        {hasTabBar && <TabBar />}
      </div>
    </PhoneFrame>
  )
}
