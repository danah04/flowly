import { create } from 'zustand'
import { USER } from '@/mock/profile'
import type { UserPersona, UserSettings } from '@/types/domain'

interface UserState {
  user: UserPersona
  setGoal: (goal: UserPersona['goal']) => void
  toggleSetting: (key: keyof Omit<UserSettings, 'connectedCalendar'>) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: USER,
  setGoal: (goal) => set((s) => ({ user: { ...s.user, goal } })),
  toggleSetting: (key) =>
    set((s) => ({
      user: {
        ...s.user,
        settings: { ...s.user.settings, [key]: !s.user.settings[key] },
      },
    })),
}))
