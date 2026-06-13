// Integration config. Mode and endpoint come from Vite env vars so the same
// build can run fully mocked (default) or against the live backend.
//
//   VITE_FLOWLY_MODE=mock|live   (default: mock)
//   VITE_FLOWLY_API_BASE=/api/flowly
//
// Credentials are NEVER referenced here — they live only on the backend.

export type FlowlyMode = 'mock' | 'live'

const rawMode = import.meta.env.VITE_FLOWLY_MODE as string | undefined

export const FLOWLY_MODE: FlowlyMode = rawMode === 'live' ? 'live' : 'mock'

export const API_BASE: string =
  (import.meta.env.VITE_FLOWLY_API_BASE as string | undefined) ?? '/api/flowly'

// Live calls abort after this long and fall back to mock.
// Live IBM/Orchestrate calls (incl. the IAM token exchange) routinely take
// 5–20s. This must be LONGER than the backend's own IBM timeout, otherwise the
// frontend aborts first and falls back to mock even when IBM is succeeding.
export const REQUEST_TIMEOUT_MS = 35000

export const isLive = () => FLOWLY_MODE === 'live'
