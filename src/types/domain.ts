// Domain model for the Flowly prototype. All shapes mirror what the
// wireframes and spec show — no fields beyond what the UI renders.

export type Difficulty = 'easy' | 'medium' | 'hard'
export type Energy = 'low' | 'medium' | 'high'

export type TaskStatus = 'todo' | 'active' | 'done'

export interface StudyTask {
  id: string
  subject: string
  topic: string
  difficulty: Difficulty
  durationMin: number
  status: TaskStatus
}

// A plan block is either a task reference or a break.
export type PlanBlock =
  | { kind: 'task'; taskId: string }
  | { kind: 'break'; durationMin: number }

export interface StudyPlan {
  id: string
  energy: Energy
  totalMin: number
  // Short line under the energy selector on Today.
  energyNote: string
  // Longer "why this order" rationale shown on Plan.
  rationale: string
  blocks: PlanBlock[]
}

export interface CoachMessage {
  id: string
  from: 'coach' | 'user'
  text: string
}

export interface FocusSessionRecord {
  id: string
  subject: string
  dateLabel: string
  durationMin: number
  focusScore: number // 0..100
  distractionsBlocked: number
}

export interface DayProgress {
  day: string // 'M' | 'T' ...
  focusHours: number
  completed: number
  planned: number
}

export interface InsightMetrics {
  streakDays: number
  bestTime: string // e.g. "10–12"
  weekHours: number
  weeklyGoalHours: number
  byDay: DayProgress[]
  insight: string
}

export interface UserSettings {
  appBlocking: boolean
  smartReminders: boolean
  aiRecommendations: boolean
  connectedCalendar: string | null
}

export type StudyGoal =
  | 'exams'
  | 'assignments'
  | 'habit'
  | 'procrastination'

export interface UserPersona {
  firstName: string
  fullName: string
  initial: string
  role: string
  email: string
  goal: StudyGoal
  streakDays: number
  settings: UserSettings
}
