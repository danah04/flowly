// IBM watsonx Orchestrate client. Credentials live ONLY here, read from the
// server environment — they are never sent to or referenced by the frontend.
//
// Required env for live IBM calls:
//   WATSONX_ORCHESTRATE_URL      e.g. https://api.<region>.watson-orchestrate.ibm.com
//   WATSONX_ORCHESTRATE_API_KEY
//   WATSONX_ORCHESTRATE_AGENT_ID the deployed Flowly (supervisor) agent id
//
// When these are absent the server uses a deterministic stub instead (see
// stub.js), so the integration is fully demoable without real credentials.

const URL = process.env.WATSONX_ORCHESTRATE_URL
const API_KEY = process.env.WATSONX_ORCHESTRATE_API_KEY
const AGENT_ID = process.env.WATSONX_ORCHESTRATE_AGENT_ID

export function isConfigured() {
  return Boolean(URL && API_KEY && AGENT_ID)
}

// Map a Flowly request into a single grounded prompt for the supervisor agent.
// The Flowly Agent routes to its collaborators (Planner, Coach, Focus Guard,
// Streak Tracker) and is instructed to reply with ONLY the JSON contract.
function buildPrompt(req) {
  const contract =
    'Respond with ONLY a JSON object matching: ' +
    '{intent,summary,rationale,energyLevel,planItems,nextAction,needsUserInput,riskFlag}. ' +
    'No prose outside the JSON.'
  return `${contract}\n\nRequest:\n${JSON.stringify(req)}`
}

// Extract the assistant's JSON from an Orchestrate chat-completions response.
function extractJson(payload) {
  const content =
    payload?.choices?.[0]?.message?.content ??
    payload?.output_text ??
    payload?.content ??
    ''

  const text = typeof content === 'string' ? content : JSON.stringify(content)
  const match = text.match(/\{[\s\S]*\}/)

  if (match) {
    try {
      return JSON.parse(match[0])
    } catch {
      // fall through to text fallback
    }
  }

  // Fallback so the UI still gets something visible.
  return {
    intent: 'chat',
    summary: text || 'I’m ready to help.',
    rationale: '',
    energyLevel: null,
    planItems: [],
    nextAction: null,
    needsUserInput: false,
    riskFlag: null,
  }
}

async function getIamAccessToken(apiKey) {
  const body = new URLSearchParams({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey: apiKey,
  });

  const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`IAM token request failed ${res.status}: ${text}`);
  }

  const data = JSON.parse(text);

  if (!data.access_token) {
    throw new Error(`IAM token response missing access_token: ${text}`);
  }

  return data.access_token;
}

export async function callOrchestrate(req, { timeoutMs = 30000 } = {}) {
  if (!URL || !API_KEY || !AGENT_ID) {
    throw new Error('Orchestrate not configured');
  }

  const iamToken = await getIamAccessToken(API_KEY);
  const endpoint = `${URL}/v1/orchestrate/${AGENT_ID}/chat/completions`;

  console.log('================================');
  console.log('FLOWLY IBM REQUEST');
  console.log('Agent ID:', AGENT_ID);
  console.log('Base URL:', URL);
  console.log('Endpoint:', endpoint);
  console.log('Request payload:', JSON.stringify(req, null, 2));
  console.log('================================');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Build the conversation for the agent: prior turns + the new message,
    // so it has memory and won't reintroduce itself. A short system nudge
    // reinforces continuity without overriding the agent's persona.
    const history = Array.isArray(req?.history) ? req.history : []
    const conversation = history
      .filter((t) => t && typeof t.content === 'string' && t.content.trim())
      .map((t) => ({
        role: t.role === 'user' ? 'user' : 'assistant',
        content: t.content,
      }))

    const messages = [
      {
        role: 'system',
        content:
          'You are in an ongoing conversation. Continue naturally and do not reintroduce yourself or repeat your greeting.',
      },
      ...conversation,
      { role: 'user', content: req?.message ?? 'What should I study today?' },
    ]

    const body = {
      messages,
      stream: false,
    }
    // Reuse the IBM thread when we have one, for server-side memory.
    if (req?.threadId) body.thread_id = req.threadId

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    console.log('IBM Status:', res.status);
    console.log('IBM OK:', res.ok);

    const rawText = await res.text();
    console.log('IBM Raw Text:', rawText);

    if (!res.ok) {
      throw new Error(`IBM returned ${res.status}: ${rawText}`);
    }

    const payload = JSON.parse(rawText);

    console.log(
      'IBM Parsed Payload:',
      JSON.stringify(payload, null, 2)
    );

    const assistantText =
      payload?.choices?.[0]?.message?.content?.trim() ?? '';

    console.log('ASSISTANT TEXT EXTRACTED:')
    console.log(assistantText)

    // Capture the IBM conversation/thread id so the next turn can reuse it.
    const threadId =
      payload?.thread_id ??
      payload?.conversation_id ??
      payload?.threadId ??
      payload?.choices?.[0]?.thread_id ??
      req?.threadId ??
      null

    // Normalize into Flowly schema
    return {
      intent: 'chat',
      assistantMessage: assistantText,
      summary: assistantText,
      rationale: '',
      planItems: [],
      nextAction: null,
      needsUserInput: assistantText.includes('?'),
      riskFlag: null,
      threadId,
      raw: payload,
    };
  } catch (error) {
    console.error('FLOWLY IBM ERROR:', error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}