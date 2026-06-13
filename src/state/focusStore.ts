import { create } from 'zustand'
import { FOCUS_HISTORY } from '@/mock/profile'
import { usePlanStore, lighterItem } from './planStore'
import { flowlyApi } from '@/services/flowlyApi'
import { taskById } from '@/mock/tasks'
import type { FocusSessionRecord, StudyTask } from '@/types/domain'

const POMODORO_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

export type SessionStatus = 'idle' | 'running' | 'paused' | 'ended'

export interface FocusSession {
  taskId: string | null
  subject: string
  topic: string
  status: SessionStatus
  isBreak: boolean
  totalSeconds: number
  remainingSeconds: number
  pomodoroIndex: number
  pomodoroCount: number
  focusLevel: number
  distractionsBlocked: number
}

interface FocusState {
  session: FocusSession
  history: FocusSessionRecord[]
  start: (task?: StudyTask | null) => void
  pause: () => void
  resume: () => void
  end: () => void
  startBreak: () => void
  endBreak: () => void
  switchToLighterTask: () => StudyTask | null
  tick: () => void
  attach: () => () => void
}

function seedSession(): FocusSession {
  return {
    taskId: 't-ca',
    subject: 'Computer Architecture',
    topic: 'Ch. 4',
    status: 'running',
    isBreak: false,
    totalSeconds: POMODORO_SECONDS,
    remainingSeconds: 18 * 60 + 24,
    pomodoroIndex: 1,
    pomodoroCount: 4,
    focusLevel: 82,
    distractionsBlocked: 12,
  }
}

let interval: ReturnType<typeof setInterval> | null = null
let prevSession: FocusSession | null = null

function stopInterval() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

// Notify the agent layer that a session started (Focus Guard). Fire-and-forget;
// the countdown is local UI and does not depend on the response.
async function notifyStart(session: FocusSession) {
  const energy = usePlanStore.getState().energy
  await flowlyApi.startSession({
    intent: 'start_session',
    taskId: session.taskId,
    subject: session.subject,
    durationMin: Math.round(session.totalSeconds / 60),
    energy,
  })
}

async function notifyEnd(session: FocusSession, completed: boolean, elapsedMin: number) {
  await flowlyApi.endSession({
    intent: 'end_session',
    taskId: session.taskId,
    subject: session.subject,
    elapsedMin,
    focusScore: session.focusLevel,
    distractionsBlocked: session.distractionsBlocked,
    completed,
  })
  // Implicit completion feedback (Streak Tracker). No UI surface.
  if (completed) {
    void flowlyApi.sendFeedback({ intent: 'feedback', target: 'session', value: 'completed' })
  }
}

export const useFocusStore = create<FocusState>((set, get) => {
  function startInterval() {
    stopInterval()
    interval = setInterval(() => get().tick(), 1000)
  }

  return {
    session: seedSession(),
    history: FOCUS_HISTORY,

    start: (task) => {
      prevSession = null
      const t = task ?? null
      const durationMin = t?.durationMin ?? 25
      const session: FocusSession = {
        taskId: t?.id ?? null,
        subject: t?.subject ?? 'Focus session',
        topic: t?.topic ?? '',
        status: 'running',
        isBreak: false,
        totalSeconds: POMODORO_SECONDS,
        remainingSeconds: POMODORO_SECONDS,
        pomodoroIndex: 1,
        pomodoroCount: Math.max(1, Math.round(durationMin / 25)),
        focusLevel: 70,
        distractionsBlocked: 0,
      }
      set({ session })
      startInterval()
      void notifyStart(session)
    },

    pause: () => {
      stopInterval()
      set((s) => ({ session: { ...s.session, status: 'paused' } }))
    },

    resume: () => {
      set((s) => ({ session: { ...s.session, status: 'running' } }))
      startInterval()
    },

    end: () => {
      stopInterval()
      const { session } = get()
      const elapsedMin = Math.max(
        1,
        Math.round((session.totalSeconds - session.remainingSeconds) / 60),
      )
      if (!session.isBreak) {
        const record: FocusSessionRecord = {
          id: `f-${Date.now()}`,
          subject: session.subject,
          dateLabel: 'Today · just now',
          durationMin: elapsedMin,
          focusScore: session.focusLevel,
          distractionsBlocked: session.distractionsBlocked,
        }
        if (session.taskId) usePlanStore.getState().completeTask(session.taskId)
        set((s) => ({
          history: [record, ...s.history],
          session: { ...s.session, status: 'ended' },
        }))
        void notifyEnd(session, Boolean(session.taskId), elapsedMin)
      } else {
        set((s) => ({ session: { ...s.session, status: 'ended' } }))
      }
      prevSession = null
    },

    startBreak: () => {
      const { session } = get()
      if (!session.isBreak) prevSession = session
      set({
        session: {
          taskId: null,
          subject: 'Break',
          topic: '5-minute reset',
          status: 'running',
          isBreak: true,
          totalSeconds: BREAK_SECONDS,
          remainingSeconds: BREAK_SECONDS,
          pomodoroIndex: session.pomodoroIndex,
          pomodoroCount: session.pomodoroCount,
          focusLevel: session.focusLevel,
          distractionsBlocked: session.distractionsBlocked,
        },
      })
      startInterval()
    },

    endBreak: () => {
      stopInterval()
      const restored: FocusSession = prevSession
        ? { ...prevSession, status: 'paused' }
        : { ...seedSession(), status: 'paused' }
      prevSession = null
      set({ session: restored })
    },

    switchToLighterTask: () => {
      const { taskStatus, items, setTaskStatus } = usePlanStore.getState()
      const task = lighterItem(items, taskStatus)
      if (task) {
        setTaskStatus(task.id, 'active')
        get().start(task)
      }
      return task
    },

    tick: () => {
      const { session } = get()
      if (session.status !== 'running') return
      const remaining = Math.max(0, session.remainingSeconds - 1)
      const blocked =
        !session.isBreak && remaining % 47 === 0
          ? session.distractionsBlocked + 1
          : session.distractionsBlocked
      set({
        session: { ...session, remainingSeconds: remaining, distractionsBlocked: blocked },
      })
      if (remaining === 0) {
        if (session.isBreak) get().endBreak()
        else get().pause()
      }
    },

    attach: () => {
      if (get().session.status === 'running') startInterval()
      return () => stopInterval()
    },
  }
})

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function focusLevelLabel(value: number): string {
  if (value >= 75) return 'Strong'
  if (value >= 50) return 'Steady'
  return 'Building'
}

export function startSessionFromPlan(): StudyTask | null {
  const task = usePlanStore.getState().startNextTask()
  useFocusStore.getState().start(task ?? taskById('t-ca'))
  return task
}

