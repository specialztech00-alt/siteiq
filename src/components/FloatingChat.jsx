import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { chatWithAssistant, parseFollowUps, cleanResponseText } from '../lib/assistantApi'
import { buildAppContext } from '../lib/contextBuilder'
import { buildChatSystemPrompt } from '../lib/prompts'

// ── Helpers ───────────────────────────────────────────────────────────────────

function newId() {
  return Math.random().toString(36).slice(2, 10)
}

function renderAIContent(text) {
  const parts = text.split(/(\[Clause [^\]]+\]|\[Reg: [^\]]+\]|\n)/g)
  return parts.map((part, i) => {
    if (/^\[Clause /.test(part)) return <span key={i} className="clause-ref">{part.slice(1, -1)}</span>
    if (/^\[Reg: /.test(part)) return <span key={i} className="reg-ref">{part.slice(6, -1)}</span>
    if (part === '\n') return <br key={i} />
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

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="2" x2="12" y2="12" />
      <line x1="12" y1="2" x2="2" y2="12" />
    </svg>
  )
}

function SendArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 7L12 7M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Quick questions (page-aware) ──────────────────────────────────────────────

function usePageQuestions(pathname, selectedState) {
  return useMemo(() => {
    if (pathname.includes('weather')) return [
      'Is today safe for concrete pours?',
      'Should I suspend any operations today?',
      'What\'s the heat stress risk this week?',
    ]
    if (pathname.includes('geo')) return [
      `What foundation suits ${selectedState}?`,
      'What are the soil risks here?',
      'Which regulations apply in this state?',
    ]
    if (pathname.includes('report')) return [
      'Explain the highest risk in detail',
      'What\'s my most urgent contract action?',
      'Summarise this report in 2 sentences',
    ]
    if (pathname.includes('risks')) return [
      'Which risk should I fix first?',
      'What\'s the pattern across my projects?',
      'How do I close these risks?',
    ]
    if (pathname.includes('archive')) return [
      'Which project needs attention most?',
      'Compare my two latest projects',
      'What\'s my average safety score?',
    ]
    return [
      'What are common Lagos excavation risks?',
      'Explain extension of time simply',
      'What PPE is required for roofing?',
    ]
  }, [pathname, selectedState])
}

// ── Floating chat component ───────────────────────────────────────────────────

export default function FloatingChat() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const store = useAppStore()
  const { selectedState, analyses, reportData } = store

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  const recentProjectTitle = analyses[0]?.projectName ?? null
  const quickQuestions = usePageQuestions(pathname, selectedState)

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (!isOpen) return
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Don't close if clicking the toggle button (it has its own handler)
        const btn = document.getElementById('float-chat-btn')
        if (btn && btn.contains(e.target)) return
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = useCallback(async (text) => {
    const content = text.trim()
    if (!content) return

    const userMsg = { id: newId(), role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const appContext = buildAppContext(useAppStore.getState())
      const systemPromptOverride = `You are SiteIQ Construction Assistant — a specialist AI for Nigerian construction professionals.

${appContext}

You have full access to the user's analysis data above. When asked about risks, reference them by name. When asked about contract clauses, quote actual clause numbers. When asked about regional risks, use the Nigerian geo data.

Always be specific. Never give generic answers when project data exists.
Keep responses under 200 words.
Format: [Reg: X] for regulations, [Clause X.X] for contract refs.`
      const raw = await chatWithAssistant({ messages: history, selectedState, recentProjectTitle, systemPromptOverride })
      const followUps = parseFollowUps(raw)
      const responseContent = cleanResponseText(raw)

      setMessages(prev => [...prev, {
        id: newId(), role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        followUps,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: newId(), role: 'assistant',
        content: `Sorry, I couldn't connect. ${err.message}`,
        timestamp: new Date().toISOString(),
        followUps: [],
      }])
    } finally {
      setIsTyping(false)
    }
  }, [messages, selectedState, recentProjectTitle])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isTyping) sendMessage(inputValue)
    }
  }

  const lastAiIndex = messages.reduce((last, m, i) => m.role === 'assistant' ? i : last, -1)

  return (
    <>
      <style>{`
        @keyframes float-pulse {
          0%,100% { box-shadow: 0 4px 16px rgba(245,196,0,0.4); }
          50%      { box-shadow: 0 4px 24px rgba(245,196,0,0.7); }
        }
        @keyframes slide-up-chat {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fc-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30%           { transform: translateY(-4px); opacity: 1; }
        }
        #float-chat-btn:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Expanded panel */}
      {isOpen && (
        <div ref={panelRef} style={{
          position: 'fixed', bottom: '84px', right: '24px',
          width: '360px', height: '480px', zIndex: 998,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderTop: '2px solid var(--accent)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
          animation: 'slide-up-chat 0.2s ease',
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            height: '48px', background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)', padding: '0 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <HardhatIcon size={20} color="var(--accent)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                SiteIQ Assistant
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => { setIsOpen(false); navigate('/app/assistant') }}
                style={{
                  fontSize: '11px', color: 'var(--text-accent)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                  textDecoration: 'none',
                }}
              >
                Open full page →
              </button>
              <button onClick={() => setIsOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                padding: '2px',
              }}>
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Quick questions — only when no messages */}
            {messages.length === 0 && !isTyping && (
              <div style={{ padding: '8px 0 4px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px', textAlign: 'center' }}>
                  Quick questions
                </p>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {quickQuestions.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      fontSize: '12px', padding: '6px 10px', borderRadius: '20px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              const isLastAi = i === lastAiIndex
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '3px' }}>
                  {isUser ? (
                    <div style={{
                      background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                      borderRadius: '10px 10px 3px 10px', padding: '8px 12px',
                      maxWidth: '85%', fontSize: '13px', color: 'var(--text-primary)',
                      lineHeight: 1.5,
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: 'var(--accent)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                        }}>
                          <HardhatIcon size={11} color="#0f1114" />
                        </div>
                        <div style={{
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          borderRadius: '3px 10px 10px 10px', padding: '8px 12px',
                          maxWidth: '85%', fontSize: '13px', lineHeight: 1.6,
                          color: 'var(--text-primary)',
                        }}>
                          {renderAIContent(msg.content)}
                        </div>
                      </div>
                      {/* Follow-up pills for last AI message */}
                      {isLastAi && msg.followUps?.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginLeft: '26px', marginTop: '2px' }}>
                          {msg.followUps.map((q, qi) => (
                            <button key={qi} onClick={() => sendMessage(q)} style={{
                              fontSize: '11px', padding: '4px 8px', borderRadius: '20px',
                              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                              color: 'var(--text-secondary)', cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-accent)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HardhatIcon size={11} color="#0f1114" />
                </div>
                <div style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '3px 10px 10px 10px', padding: '10px 12px',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: 'var(--text-tertiary)', display: 'inline-block',
                      animation: 'fc-typing-dot 1.2s ease infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{
            borderTop: '1px solid var(--border)', padding: '8px 12px',
            display: 'flex', gap: '8px', alignItems: 'center',
            background: 'var(--bg-card)', flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              className="input"
              style={{ flex: 1, fontSize: '13px', padding: '8px 10px', height: '36px', boxSizing: 'border-box' }}
              placeholder="Ask anything..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              onClick={() => inputValue.trim() && !isTyping && sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              style={{
                width: '30px', height: '30px', borderRadius: 'var(--radius-md)',
                background: inputValue.trim() && !isTyping ? 'var(--accent)' : 'var(--border)',
                border: 'none', cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0f1114', flexShrink: 0, transition: 'background 0.15s',
              }}
            >
              <SendArrowIcon />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        id="float-chat-btn"
        onClick={() => setIsOpen(v => !v)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--accent)', color: '#0f1114',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'float-pulse 2s ease infinite',
          transition: 'transform 0.15s ease',
          zIndex: 999,
        }}
        title="SiteIQ Assistant"
      >
        <HardhatIcon size={24} color="#0f1114" />
        {/* AI badge */}
        <span style={{
          position: 'absolute', top: '2px', right: '2px',
          background: 'var(--bg-secondary)', color: 'var(--text-accent)',
          fontSize: '9px', fontWeight: 700, borderRadius: '10px',
          padding: '1px 4px', border: '1px solid var(--accent)',
          lineHeight: 1.4,
        }}>
          AI
        </span>
      </button>
    </>
  )
}
