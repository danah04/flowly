import { create } from 'zustand'
import type { RouteKey } from '@/types/navigation'

interface NavigationState {
  route: RouteKey
  // History stack so the Profile back-arrow can return to the prior screen.
  history: RouteKey[]
  go: (route: RouteKey) => void
  back: () => void
}

export const useNavigation = create<NavigationState>((set, get) => ({
  route: 'splash',
  history: [],
  go: (route) =>
    set((s) => ({
      route,
      history: s.route === route ? s.history : [...s.history, s.route],
    })),
  back: () => {
    const { history } = get()
    if (history.length === 0) return
    const prev = history[history.length - 1]
    set({ route: prev, history: history.slice(0, -1) })
  },
}))
