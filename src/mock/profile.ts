import type {
  UserPersona,
  InsightMetrics,
  FocusSessionRecord,
} from '@/types/domain'

export const USER: UserPersona = {
  firstName: 'Sara',
  fullName: 'Sara Mohammad',
  initial: 'S',
  role: 'Undergraduate student',
  email: 'sara@university.edu',
  goal: 'exams',
  streakDays: 12,
  settings: {
    appBlocking: true,
    smartReminders: true,
    aiRecommendations: true,
    connectedCalendar: 'Google',
  },
}

// One week of progress. Bars on Insights read from focusHours.
export const INSIGHTS: InsightMetrics = {
  streakDays: 12,
  bestTime: '10–12',
  weekHours: 20.1,
  weeklyGoalHours: 30,
  insight:
    'You focus best in the morning — tomorrow’s plan is already adjusted to start earlier.',
  byDay: [
    { day: 'M', focusHours: 3.2, completed: 4, planned: 5 },
    { day: 'T', focusHours: 2.1, completed: 3, planned: 4 },
    { day: 'W', focusHours: 3.9, completed: 5, planned: 5 },
    { day: 'T', focusHours: 2.7, completed: 3, planned: 4 },
    { day: 'F', focusHours: 4.4, completed: 5, planned: 6 },
    { day: 'S', focusHours: 1.5, completed: 2, planned: 3 },
    { day: 'S', focusHours: 2.3, completed: 3, planned: 4 },
  ],
}

// Recent focus sessions (not all surfaced in the wireframe, kept for realism).
export const FOCUS_HISTORY: FocusSessionRecord[] = [
  { id: 'f1', subject: 'Computer Architecture', dateLabel: 'Today · 9:37', durationMin: 40, focusScore: 82, distractionsBlocked: 12 },
  { id: 'f2', subject: 'Data Structures', dateLabel: 'Today · 9:00', durationMin: 32, focusScore: 90, distractionsBlocked: 6 },
  { id: 'f3', subject: 'Operating Systems', dateLabel: 'Yesterday · 18:20', durationMin: 28, focusScore: 74, distractionsBlocked: 9 },
  { id: 'f4', subject: 'Discrete Math', dateLabel: 'Yesterday · 16:05', durationMin: 20, focusScore: 88, distractionsBlocked: 3 },
]
