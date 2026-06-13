import { create } from 'zustand'
import { INITIAL_THREAD, QUICK_ACTIONS, type QuickAction } from '@/mock/coach'
import { usePlanStore, nextTodoItem } from './planStore'
import { useFocusStore } from './focusStore'
import { useUserStore } from './userStore'
import { useInsightsStore } from './insightsStore'
import { flowlyApi } from '@/services/flowlyApi'
import type { ChatRequest, ChatTurn } from '@/types/agent'
import type { CoachMessage } from '@/types/domain'

let seq = 0
const nextId = () => `m-${Date.now()}-${seq++}`

// Keep payloads bounded — the agent only needs recent context.
const MAX_HISTORY_TURNS = 20

// Map visible coach messages into the role/content turns the agent expects.
function toHistory(messages: CoachMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.text && m.text.trim())
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))
}

// Build the chat request from current app state so the agent can ground replies.
// `history` and `threadId` are filled in by `exchange` from the live store.
function chatRequest(
  message: string,
  quickActionKey?: QuickAction['key'],
): ChatRequest {
  const { energy, taskStatus, items } = usePlanStore.getState()
  const focus = useFocusStore.getState().session
  const user = useUserStore.getState().user
  const metrics = useInsightsStore.getState().metrics
  const next = nextTodoItem(items, taskStatus)
  return {
    intent: 'chat',
    message,
    quickActionKey,
    energy,
    focusLevel: focus.focusLevel,
    history: [],
    threadId: null,
    context: {
      streakDays: user.streakDays,
      weekHours: metrics.weekHours,
      weeklyGoalHours: metrics.weeklyGoalHours,
      nextSubject: next?.subject ?? null,
    },
  }
}

interface CoachState {
  messages: CoachMessage[]
  typing: boolean
  // IBM thread id, reused across turns for server-side conversation memory.
  threadId: string | null
  sendUserMessage: (text: string) => Promise<void>
  runQuickAction: (key: QuickAction['key']) => Promise<void>
}

export const useCoachStore = create<CoachState>((set, get) => {
  // Post the user's line, then call the agent WITH the prior conversation so it
  // has continuity and won't reintroduce itself. The full visible thread (taken
  // before we append the new user turn) is sent as history; any IBM thread id is
  // captured and reused next turn.
  async function exchange(req: ChatRequest, userText: string) {
    const history = toHistory(get().messages)
    const threadId = get().threadId

    set((s) => ({
      typing: true,
      messages: [...s.messages, { id: nextId(), from: 'user', text: userText }],
    }))

    const res = await flowlyApi.chat({ ...req, history, threadId })
    const text =
      res.data.assistantMessage ||
      res.data.summary ||
      res.data.rationale ||
      "I'm ready to help."

    set((s) => ({
      typing: false,
      threadId: res.data.threadId ?? s.threadId,
      messages: [...s.messages, { id: nextId(), from: 'coach', text }],
    }))
  }

  return {
    messages: INITIAL_THREAD,
    typing: false,
    threadId: null,

    sendUserMessage: async (text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      await exchange(chatRequest(trimmed), trimmed)
    },

    runQuickAction: async (key) => {
      const action = QUICK_ACTIONS.find((a) => a.key === key)
      if (!action) return
      await exchange(chatRequest(action.label, key), action.label)
    },
  }
})
