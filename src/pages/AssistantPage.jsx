import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { chatWithAssistant, parseFollowUps, cleanResponseText } from '../lib/assistantApi'

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function newId() {
  return Math.random().toString(36).slice(2, 10)
}

// Render AI response text with styled clause and regulation references
function renderAIContent(text) {
  const parts = text.split(/(\[Clause [^\]]+\]|\[Reg: [^\]]+\]|\n)/g)
  return parts.map((part, i) => {
    if (/^\[Clause /.test(part)) {
      return <span key={i} className="clause-ref">{part.slice(1, -1)}</span>
    }
    if (/^\[Reg: /.test(part)) {
      const label = part.slice(6, -1)
      return <span key={i} className="reg-ref">{label}</span>
    }
    if (part === '\n') {
      return <br key={i} />
    }
    return part
  })
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function HardhatIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3C8.1 3 5 6.1 5 10v1H4a1 1 0 000 2h1v1h14v-1h1a1 1 0 000-2h-1v-1c0-3.9-3.1-7-7-7zm0 2c2.8 0 5 2.2 5 5v1H7v-1c0-2.8 2.2-5 5-5z" />
      <rect x="3" y="15" width="18" height="3" rx="1.5" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8l10-6-3 6 3 6L2 8z" fill="currentColor" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="7" y1="2" x2="7" y2="12" />
      <line x1="2" y1="7" x2="12" y2="7" />
    </svg>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <>
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <HardhatIcon size={13} color="#0f1114" />
        </div>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '3px 12px 12px 12px', padding: '14px 16px',
          display: 'flex', gap: '5px', alignItems: 'center',
        }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--text-tertiary)', display: 'inline-block',
              animation: 'typing-dot 1.2s ease infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    </>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, isLast, onFollowUp }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          borderRadius: '12px 12px 3px 12px', padding: '10px 14px',
          maxWidth: '75%', fontSize: '14px', color: 'var(--text-primary)',
          lineHeight: 1.6,
        }}>
          {msg.content}
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          {formatTime(msg.timestamp)}
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <HardhatIcon size={13} color="#0f1114" />
        </div>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '3px 12px 12px 12px', padding: '12px 16px',
          maxWidth: '80%', fontSize: '14px', lineHeight: 1.7,
          color: 'var(--text-primary)',
        }}>
          {renderAIContent(msg.content)}
        </div>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '32px' }}>
        {formatTime(msg.timestamp)}
      </span>
      {/* Follow-up suggestions — only for last AI message */}
      {isLast && msg.followUps?.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: '32px', marginTop: '2px' }}>
          {msg.followUps.map((q, i) => (
            <button key={i} onClick={() => onFollowUp(q)} style={{
              fontSize: '12px', padding: '5px 10px', borderRadius: '20px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--text-accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

const STARTERS = [
  'What PPE is required for excavation works in Nigeria?',
  'Explain liquidated damages in simple terms',
  'What are the CDM regulations for scaffold erection?',
  'How do I claim an extension of time under NEC4?',
  'What are the soil conditions like in Lagos for pile foundations?',
  'Is it safe to pour concrete in the current weather?',
]

function EmptyState({ onStart }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>
        <HardhatIcon size={56} color="var(--text-tertiary)" />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700,
        color: 'var(--text-primary)', margin: '0 0 10px',
      }}>
        SiteIQ Construction Assistant
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.6, maxWidth: '420px' }}>
        Ask me anything about construction safety, contracts, regulations, or site management in Nigeria
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '520px' }}>
        {STARTERS.map(q => (
          <div key={q} className="card" onClick={() => onStart(q)} style={{
            padding: '12px 14px', cursor: 'pointer', fontSize: '13px',
            color: 'var(--text-secondary)', lineHeight: 1.5,
            transition: 'border-color 0.15s',
            textAlign: 'left',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = ''}
          >
            {q}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Left panel — conversation history ─────────────────────────────────────────

function HistoryPanel({ conversations, activeId, search, onSearch, onSelect, onNew }) {
  const filtered = conversations.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      width: '260px', flexShrink: 0, background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* New conversation */}
      <div style={{ padding: '14px 12px 10px' }}>
        <button className="btn-primary" onClick={onNew} style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px',
        }}>
          <PlusIcon /> New conversation
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '0 12px 10px' }}>
        <input
          className="input"
          style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px', padding: '8px 10px' }}
          placeholder="Search..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
        {filtered.length === 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', padding: '12px', textAlign: 'center' }}>
            No conversations yet
          </p>
        )}
        {filtered.map(conv => {
          const isActive = conv.id === activeId
          return (
            <div key={conv.id} onClick={() => onSelect(conv.id)} style={{
              padding: '10px 14px', cursor: 'pointer',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-card)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                fontSize: '13px', fontWeight: 500,
                color: isActive ? 'var(--text-accent)' : 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                marginBottom: '3px',
              }}>
                {conv.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {relativeTime(conv.updatedAt ?? conv.createdAt)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Right panel — active chat ─────────────────────────────────────────────────

function ChatPanel({ conversation, isTyping, onSend, onClear, onTitleChange }) {
  const messages = conversation?.messages ?? []
  const [input, setInput] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-resize textarea
  function handleInput(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    setInput(el.value)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isTyping) submit()
    }
  }

  function submit() {
    const text = input.trim()
    if (!text) return
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    onSend(text)
  }

  function startEditTitle() {
    setTitleInput(conversation?.title ?? 'New conversation')
    setEditingTitle(true)
  }

  function saveTitle() {
    if (titleInput.trim()) onTitleChange(titleInput.trim())
    setEditingTitle(false)
  }

  // Last AI message index for follow-up pills
  const lastAiIndex = messages.reduce((last, m, i) => m.role === 'assistant' ? i : last, -1)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Chat header */}
      <div style={{
        height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        background: 'var(--bg-card)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingTitle ? (
            <input
              autoFocus
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle() }}
              style={{
                background: 'var(--bg-input)', border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)', padding: '4px 8px',
                fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
                outline: 'none', width: '100%', maxWidth: '300px',
              }}
            />
          ) : (
            <div
              onDoubleClick={conversation ? startEditTitle : undefined}
              title={conversation ? 'Double-click to rename' : ''}
              style={{
                fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                cursor: conversation ? 'text' : 'default',
              }}
            >
              {conversation?.title ?? 'New conversation'}
            </div>
          )}
        </div>
        {conversation && messages.length > 0 && (
          <button onClick={onClear} style={{
            fontSize: '12px', color: 'var(--text-tertiary)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '4px 8px',
            borderRadius: 'var(--radius-sm)', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && !isTyping
          ? <EmptyState onStart={onSend} />
          : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isLast={i === lastAiIndex}
                  onFollowUp={onSend}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </>
          )
        }
      </div>

      {/* Input bar */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '12px 16px',
        display: 'flex', gap: '8px', alignItems: 'flex-end',
        background: 'var(--bg-card)', flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          className="input"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask about safety, contracts, regulations..."
          rows={1}
          style={{
            flex: 1, resize: 'none', minHeight: '44px', maxHeight: '120px',
            lineHeight: 1.5, paddingTop: '11px', paddingBottom: '11px',
            overflowY: 'auto',
          }}
        />
        <button
          onClick={submit}
          disabled={!input.trim() || isTyping}
          style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: input.trim() && !isTyping ? 'var(--accent)' : 'var(--border)',
            border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0f1114', transition: 'background 0.15s', flexShrink: 0,
          }}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const {
    conversations, activeConversationId, selectedState, analyses,
    setActiveConversationId, addConversation, updateConversation, deleteConversation,
  } = useAppStore()

  const [isTyping, setIsTyping] = useState(false)
  const [search, setSearch] = useState('')

  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null
  const recentProjectTitle = analyses[0]?.projectName ?? null

  const sendMessage = useCallback(async (text) => {
    const now = new Date().toISOString()
    const userMsg = { id: newId(), role: 'user', content: text, timestamp: now }

    let conv = activeConversation
    if (!conv) {
      conv = {
        id: newId(),
        title: text.slice(0, 40) + (text.length > 40 ? '…' : ''),
        messages: [userMsg],
        createdAt: now,
        updatedAt: now,
      }
      addConversation(conv)
    } else {
      const updated = { messages: [...conv.messages, userMsg], updatedAt: now }
      updateConversation(conv.id, updated)
      conv = { ...conv, ...updated }
    }

    setIsTyping(true)

    try {
      const history = conv.messages.map(m => ({ role: m.role, content: m.content }))
      const raw = await chatWithAssistant({ messages: history, selectedState, recentProjectTitle })
      const followUps = parseFollowUps(raw)
      const content = cleanResponseText(raw)

      const aiMsg = { id: newId(), role: 'assistant', content, timestamp: new Date().toISOString(), followUps }
      updateConversation(conv.id, {
        messages: [...conv.messages, aiMsg],
        updatedAt: aiMsg.timestamp,
      })
    } catch (err) {
      const errMsg = {
        id: newId(), role: 'assistant',
        content: `Sorry, I couldn't connect to the AI. ${err.message}`,
        timestamp: new Date().toISOString(),
        followUps: [],
      }
      updateConversation(conv.id, {
        messages: [...conv.messages, errMsg],
        updatedAt: errMsg.timestamp,
      })
    } finally {
      setIsTyping(false)
    }
  }, [activeConversation, selectedState, recentProjectTitle, addConversation, updateConversation])

  function handleNew() {
    setActiveConversationId(null)
  }

  function handleTitleChange(title) {
    if (activeConversationId) updateConversation(activeConversationId, { title })
  }

  function handleClear() {
    if (activeConversationId) {
      updateConversation(activeConversationId, { messages: [] })
    }
  }

  return (
    <>
      <style>{`
        .clause-ref {
          font-family: var(--font-mono);
          font-size: 11px;
          background: var(--info-bg);
          color: var(--info);
          padding: 1px 5px;
          border-radius: 3px;
        }
        .reg-ref {
          font-family: var(--font-mono);
          font-size: 11px;
          background: var(--accent-dim);
          color: var(--text-accent);
          padding: 1px 5px;
          border-radius: 3px;
        }
      `}</style>

      <div style={{
        display: 'flex',
        height: 'calc(100vh - var(--topbar-height))',
        margin: '-24px',
        overflow: 'hidden',
      }}>
        <HistoryPanel
          conversations={conversations}
          activeId={activeConversationId}
          search={search}
          onSearch={setSearch}
          onSelect={setActiveConversationId}
          onNew={handleNew}
        />
        <ChatPanel
          conversation={activeConversation}
          isTyping={isTyping}
          onSend={sendMessage}
          onClear={handleClear}
          onTitleChange={handleTitleChange}
        />
      </div>
    </>
  )
}
