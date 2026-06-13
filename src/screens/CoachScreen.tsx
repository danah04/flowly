import { useEffect, useRef, useState } from 'react'
import { SparkIcon, SendIcon } from '@/components/ui/icons'
import { useCoachStore } from '@/state/coachStore'
import { QUICK_ACTIONS } from '@/mock/coach'
import type { CoachMessage } from '@/types/domain'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

function Bubble({ msg }: { msg: CoachMessage }) {
  const isUser = msg.from === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%]
          rounded-2xl
          px-4
          py-3
          text-[14px]
          leading-relaxed
          break-words
          ${
            isUser
              ? 'rounded-br-md bg-primary text-white'
              : 'rounded-bl-md bg-surface text-ink shadow-card'
          }
        `}
      >
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            ol: ({ children }) => (
              <ol className="my-1 ml-5 list-decimal space-y-1">{children}</ol>
            ),
            ul: ({ children }) => (
              <ul className="my-1 ml-5 list-disc space-y-1">{children}</ul>
            ),
            li: ({ children }) => <li className="pl-0.5">{children}</li>,
            a: ({ children, href }) => (
              <a href={href} className="underline" target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="rounded bg-bg px-1 py-0.5 text-[13px]">{children}</code>
            ),
          }}
        >
          {msg.text}
        </ReactMarkdown>
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface px-3.5 py-3 shadow-card">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted/60"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export function CoachScreen() {
  const messages = useCoachStore((s) => s.messages)
  const typing = useCoachStore((s) => s.typing)
  const sendUserMessage = useCoachStore((s) => s.sendUserMessage)
  const runQuickAction = useCoachStore((s) => s.runQuickAction)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function send() {
    if (!draft.trim()) return
    sendUserMessage(draft)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col px-5 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-hairline pb-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SparkIcon size={20} />
        </span>
        <div>
          <p className="font-display text-[16px] font-semibold text-ink">Flowly Coach</p>
          <p className="text-[12px] text-muted">Powered by watsonx Granite</p>
        </div>
      </div>

      {/* Thread */}
      <div
        className="no-scrollbar flex-1 space-y-3 overflow-y-auto py-4"
        aria-live="polite"
        aria-busy={typing}
      >
        {messages.length === 0 && !typing ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-[14px] text-muted">
            Ask your coach anything, or tap a suggestion below to get started.
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} msg={m} />)
        )}
        {typing && <TypingBubble />}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 pb-3">
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q.key}
            type="button"
            disabled={typing}
            onClick={() => runQuickAction(q.key)}
            className="rounded-pill border border-hairline bg-surface px-3.5 py-2 text-[13px] font-medium text-ink transition active:scale-[.97] disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mb-1 flex items-center gap-2 rounded-pill border border-hairline bg-surface py-1.5 pl-4 pr-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          placeholder="Ask your coach anything…"
          aria-label="Message your coach"
          className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-muted/80 outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || typing}
          aria-label="Send message"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 disabled:opacity-40"
        >
          <SendIcon size={17} />
        </button>
      </div>
    </div>
  )
}
