# Flowly

**An adaptive AI study companion.** Flowly plans your study session around how much energy you have right now, runs a focus timer with smart breaks, and gives you an AI coach to talk things through — backed by IBM watsonx Orchestrate.

Built by **Team Codeminds** for the **IBM SkillsBuild AI Experiential Learning Lab**.

Accessible at: https://flowly-bkia.onrender.com

---

## What it does

- **Energy-based planning** — tell Flowly your energy level (low / medium / high) and it builds a study schedule tuned to it.
- **Focus sessions** — a timer with pause/resume, smart breaks, and a "switch to a lighter task" option.
- **AI coach** — a chat coach (powered by watsonx Orchestrate) that grounds its replies in your current energy, focus, streak, and progress, and remembers the conversation.
- **Insights** — weekly focus hours, streaks, and goal progress at a glance.

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State | Zustand |
| Chat rendering | react-markdown + remark-breaks |
| Backend | Node + Express |
| AI | IBM watsonx Orchestrate (agent + IAM auth) |

---

## Quick start

### 1. Install

```bash
npm install
```

### 2. Run in mock mode (no setup)

```bash
npm run dev
```

Open the printed local URL. Everything works on sample data.

### 3. Run in live mode (with IBM)

Create a `.env` file in the project root:

```bash
# Frontend (read at build time)
VITE_FLOWLY_MODE=live
VITE_FLOWLY_API_BASE=/api/flowly

# Backend (server only — NEVER exposed to the frontend)
WATSONX_ORCHESTRATE_URL=https://api.<region>.watson-orchestrate.cloud.ibm.com/instances/<id>
WATSONX_ORCHESTRATE_API_KEY=<your-api-key>
WATSONX_ORCHESTRATE_AGENT_ID=<your-agent-id>
PORT=8787
```

Then run the frontend and backend together:

```bash
npm run dev:live
```

The backend logs `(IBM configured)` when credentials are loaded, or `(stub mode)` when they're blank (it falls back to deterministic responses so live mode is still demoable without keys).

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Frontend only, mock mode |
| `npm run dev:live` | Frontend + backend together, live mode |
| `npm run build` | Type-check and build the frontend to `dist/` |
| `npm start` | Run the production server (serves built `dist/` **and** the API on one origin) |
| `npm run lint` | Lint the codebase |

---

## Architecture

```
Browser (React app)
   │  flowlyApi  ── mock mode ─▶ local mock adapter
   │             ── live mode ─▶ POST /api/flowly/chat
   ▼
Express backend (server/)
   ├─ ibmClient.js    IAM token exchange + Orchestrate call
   ├─ normalize.js    coerces IBM's reply into the Flowly contract
   └─ stub.js         deterministic responses when IBM isn't configured
   ▼
IBM watsonx Orchestrate agent
```

**Key design choices**

- **Plans are deterministic and local.** Changing energy never depends on the conversational agent, so the schedule is always consistent. The agent is used for the **coach** conversation only.
- **One contract everywhere.** Every agent reply is normalized to a fixed shape (`assistantMessage`, `summary`, `planItems`, `energyLevel`, …) on both the server and the client, so raw model text can never reach the UI in an unexpected form.
- **Conversation memory.** The coach sends prior turns plus the IBM `thread_id` on every message, so it remembers context instead of re-introducing itself.
- **Safe fallback.** If a live IBM call fails or times out, the app degrades gracefully to local responses rather than breaking.

### Project layout

```
src/
  screens/      Today, Plan, Focus, Coach, Insights, Profile, onboarding
  components/   UI primitives + phone-frame layout
  state/        Zustand stores (plan, focus, coach, insights, user, navigation)
  services/     flowlyApi (mock/live switch), normalize, mock adapter, config
  mock/         sample tasks, plans, profile, coach data
  types/        domain + agent contract types
server/         Express backend (index, ibmClient, normalize, stub)
```

---

## Deployment

URL: https://flowly-bkia.onrender.com

---

## Team

**Codeminds** — IBM SkillsBuild AI Experiential Learning Lab.

---

## License

Built for the IBM SkillsBuild program. Not licensed for production use.
