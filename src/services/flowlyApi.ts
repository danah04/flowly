// The one interface every screen uses. In mock mode it returns local data; in
// live mode it POSTs to the backend, normalizes the JSON, and falls back to
// mock if anything goes wrong. Callers always get a valid AgentResult.

import { API_BASE, REQUEST_TIMEOUT_MS, isLive } from './config'
import { normalizeAgentResponse } from './normalize'
import {
  buildChat,
  buildFeedback,
  buildPlan,
  buildSessionEnd,
  buildSessionStart,
} from './mockAdapter'
import type {
  AgentError,
  AgentRequest,
  AgentResult,
  ChatRequest,
  FeedbackRequest,
  PlanRequest,
  SessionEndRequest,
  SessionStartRequest,
} from '@/types/agent'

function toAgentError(e: unknown): AgentError {
  if (e instanceof DOMException && e.name === 'AbortError')
    return { code: 'timeout', message: 'The request timed out.', recoverable: true }
  if (e instanceof TypeError)
    return { code: 'network', message: 'Could not reach the server.', recoverable: true }
  if (e instanceof Error)
    return { code: 'server', message: e.message, recoverable: true }
  return { code: 'unknown', message: 'Unexpected error.', recoverable: true }
}

async function postJson(path: string, body: AgentRequest): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Backend responded ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// Core dispatch: mock short-circuits; live tries the backend then falls back.
async function call<TReq extends AgentRequest>(
  path: string,
  req: TReq,
  mockFn: (r: TReq) => AgentResult['data'],
): Promise<AgentResult> {
  if (!isLive()) return { data: mockFn(req), source: 'mock', error: null }
  try {
    const raw = await postJson(path, req)
    return { data: normalizeAgentResponse(raw, req.intent), source: 'live', error: null }
  } catch (e) {
    // Live failed — degrade gracefully to the mock so the UI keeps working.
    return { data: mockFn(req), source: 'fallback', error: toAgentError(e) }
  }
}

export const flowlyApi = {
  getPlan: (req: PlanRequest) => call('/plan', req, buildPlan),
  chat: (req: ChatRequest) => call('/chat', req, buildChat),
  startSession: (req: SessionStartRequest) =>
    call('/session/start', req, buildSessionStart),
  endSession: (req: SessionEndRequest) =>
    call('/session/end', req, buildSessionEnd),
  sendFeedback: (req: FeedbackRequest) => call('/feedback', req, buildFeedback),
}
