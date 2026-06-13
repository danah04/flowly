import type { StudyTask } from '@/types/domain'

// Pool of 10 realistic CS-undergrad tasks. Plans reference these by id.
// Two are pre-marked done so Today reads "2 of 5 done" out of the box.
export const TASKS: StudyTask[] = [
  { id: 't-ds', subject: 'Data Structures', topic: 'Trees', difficulty: 'medium', durationMin: 32, status: 'done' },
  { id: 't-os', subject: 'Operating Systems', topic: 'Scheduling', difficulty: 'medium', durationMin: 28, status: 'done' },
  { id: 't-ca', subject: 'Computer Architecture', topic: 'Ch. 4 · Pipelining', difficulty: 'hard', durationMin: 40, status: 'todo' },
  { id: 't-dm', subject: 'Discrete Math', topic: 'Proofs', difficulty: 'easy', durationMin: 20, status: 'todo' },
  { id: 't-algo', subject: 'Algorithms', topic: 'Dynamic programming', difficulty: 'hard', durationMin: 45, status: 'todo' },
  { id: 't-db', subject: 'Databases', topic: 'Normalization', difficulty: 'medium', durationMin: 30, status: 'todo' },
  { id: 't-net', subject: 'Networks', topic: 'TCP handshake', difficulty: 'medium', durationMin: 25, status: 'todo' },
  { id: 't-la', subject: 'Linear Algebra', topic: 'Eigenvalues', difficulty: 'hard', durationMin: 35, status: 'todo' },
  { id: 't-se', subject: 'Software Engineering', topic: 'Testing basics', difficulty: 'easy', durationMin: 22, status: 'todo' },
  { id: 't-ai', subject: 'Intro to AI', topic: 'Search algorithms', difficulty: 'medium', durationMin: 30, status: 'todo' },
]

export const taskById = (id: string): StudyTask | undefined =>
  TASKS.find((t) => t.id === id)
