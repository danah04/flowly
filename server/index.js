// Flowly backend adapter.
// Receives frontend requests, formats them for IBM watsonx Orchestrate (when
// configured), normalizes the response to the Flowly contract, and returns it.
// Falls back to a deterministic stub when IBM isn't configured. If a configured
// IBM call fails, responds 503 so the frontend degrades to its own mock.

import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isConfigured, callOrchestrate } from './ibmClient.js'
import { normalizeResponse } from './normalize.js'
import { stub } from './stub.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(express.json({ limit: '256kb' }))

// Minimal permissive CORS (dev uses the Vite proxy, so same-origin in practice).
app.use((_req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// One handler per endpoint. `intent` and `stubFn` are bound per route.
function handler(intent, stubFn) {
  return async (req, res) => {
    const payload = { ...req.body, intent }
    try {
      if (isConfigured()) {
        const raw = await callOrchestrate(payload)
        return res.json(normalizeResponse(raw, intent))
      }
      // No IBM creds — serve the normalized stub so live mode still works.
      return res.json(normalizeResponse(stubFn(payload), intent))
    } catch (err) {
      // A configured IBM call failed: let the frontend fall back to mock.
      return res.status(503).json({
        error: { code: 'server', message: String(err.message || err), recoverable: true },
      })
    }
  }
}

app.post('/api/flowly/plan', handler('generate_plan', stub.plan))
app.post('/api/flowly/chat', handler('chat', stub.chat))
app.post('/api/flowly/session/start', handler('start_session', stub.sessionStart))
app.post('/api/flowly/session/end', handler('end_session', stub.sessionEnd))
app.post('/api/flowly/feedback', handler('feedback', stub.feedback))

app.get('/api/flowly/health', (_req, res) =>
  res.json({ ok: true, ibmConfigured: isConfigured() }),
)

// In production, serve the built frontend from this same server so the whole
// app lives behind ONE url (no CORS, no separate frontend host). The Vite dev
// proxy handles this during local development instead.
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  // SPA fallback for any non-API route.
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

const PORT = process.env.PORT || 8787
app.listen(PORT, () => {
  console.log(`Flowly backend on :${PORT} (IBM ${isConfigured() ? 'configured' : 'stub mode'})`)
})
