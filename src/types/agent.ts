// The single contract every Flowly agent call resolves to. The frontend only
// ever consumes this structured shape — raw model text never reaches the UI.
// Mirrors the agent response schema in the project spec (section 13).

import type { Difficulty, Energy, TaskStatus } from './domain'

export type AgentIntent =
  | 'generate_plan'
  | 'chat'
  | 'start_session'
  | 'end_session'
  | 'feedback'

export interface PlanItem {
  id: string
  kind: 'task' | 'break'
  subject?: string
  topic?: string
  difficulty?: Difficulty
  durationMin: number
  status?: TaskStatus
}

export interface NextAction {
  type:
    | 'start_session'
    | 'take_break'
    | 'open_plan'
    | 'show_progress'
    | 'none'
  label: string
  taskId: string | null
}

// The normalized response contract. Every field is always present.
export interface AgentResponse {
  intent: string
  assistantMessage?: string
  summary: string
  rationale: string
  energyLevel: Energy | null
  planItems: PlanItem[]
  nextAction: NextAction | null
  needsUserInput: boolean
  riskFlag: string | null
  // IBM conversation/thread id, when the backend has one to reuse next turn.
  threadId?: string | null
  raw?: unknown
}

// --- Requests, one per endpoint ---

export interface TaskContext {
  id: string
  subject: string
  topic: string
  difficulty: Difficulty
  durationMin: number
  status: TaskStatus
}

export interface PlanRequest {
  intent: 'generate_plan'
  energy: Energy
  tasks: TaskContext[]
  availableMinutes?: number
}

// One turn of the visible conversation, sent so the agent has continuity.
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  intent: 'chat'
  message: string
  // Set when the message came from a quick-action chip rather than free text.
  quickActionKey?: 'start' | 'adjust' | 'break' | 'progress'
  energy: Energy
  focusLevel: number
  // Prior turns (oldest first), so the agent remembers the conversation.
  history: ChatTurn[]
  // IBM thread id from a previous turn, reused to keep server-side memory.
  threadId?: string | null
  // Light context so the agent can ground its reply.
  context: {
    streakDays: number
    weekHours: number
    weeklyGoalHours: number
    nextSubject: string | null
  }
}

export interface SessionStartRequest {
  intent: 'start_session'
  taskId: string | null
  subject: string
  durationMin: number
  energy: Energy
}

export interface SessionEndRequest {
  intent: 'end_session'
  taskId: string | null
  subject: string
  elapsedMin: number
  focusScore: number
  distractionsBlocked: number
  completed: boolean
}

export interface FeedbackRequest {
  intent: 'feedback'
  target: 'plan' | 'session' | 'coach'
  value: 'up' | 'down' | 'completed'
  note?: string
}

export type AgentRequest =
  | PlanRequest
  | ChatRequest
  | SessionStartRequest
  | SessionEndRequest
  | FeedbackRequest

// --- Error + result envelope ---

export interface AgentError {
  code: 'network' | 'timeout' | 'bad_response' | 'server' | 'unknown'
  message: string
  recoverable: boolean
}

// Where the data came from. `data` is ALWAYS a valid AgentResponse, even on
// error (a mock fallback), so screens never have to handle a missing payload.
export type AgentSource = 'mock' | 'live' | 'fallback'

export interface AgentResult {
  data: AgentResponse
  source: AgentSource
  error: AgentError | null
}
