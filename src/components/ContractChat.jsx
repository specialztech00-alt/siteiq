import { useState, useRef, useEffect } from 'react'
import { chatWithContract } from '../lib/claude.js'
import useAppStore from '../store/useAppStore.js'

const QUICK_QUESTIONS = [
  'What are the LADs and how are they calculated?',
  'What notice periods do I need to comply with?',
  'Can I claim an Extension of Time?',
  'What are my payment rights under this contract?',
  'Which clauses put the most risk on the contractor?',
  'What happens if the Employer is late with information?',
]

function SiteIQIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" style={{ width: '14px', height: '14px' }}>
      <rect x="4" y="20" width="24" height="4" rx="2" fill="var(--accent)" />
      <path d="M8 20 C8 11 24 11 24 20Z" fill="var(--accent)" />
    </svg>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: '8px', flexShrink: 0, marginTop: '2px',
        }}>
          <SiteIQIcon />
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</div>
        <span style={{ display: 'block', fontSize: '10px', opacity: 0.45, marginTop: '4px', textAlign: 'right' }}>
          {isUser ? 'You' : 'SiteIQ AI'}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '8px', flexShrink: 0,
      }}>
        <SiteIQIcon />
      </div>
      <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 14px' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'var(--text-tertiary)', display: 'inline-block',
            animation: 'fc-typing-dot 1.2s ease infinite',
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

export default function ContractChat() {
  const chatHistory     = useAppStore(s => s.chatHistory)
  const addChatMessage  = useAppStore(s => s.addChatMessage)
  const isChatLoading   = useAppStore(s => s.isChatLoading)
  const setIsChatLoading = useAppStore(s => s.setIsChatLoading)
  const docText         = useAppStore(s => s.docText)

  const [input, setInput]   = useState('')
  const [error, setError]   = useState(null)
  const bottomRef           = useRef(null)
  const inputRef            = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isChatLoading])

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isChatLoading) return

    setInput('')
    setError(null)

    const userMsg = { role: 'user', content: trimmed }
    addChatMessage(userMsg)
    setIsChatLoading(true)

    try {
      const messages = [...chatHistory, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))
      const reply = await chatWithContract(messages, docText)
      addChatMessage({ role: 'assistant', content: reply })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsChatLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const hasContract = !!docText

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
      <style>{`
        @keyframes fc-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30%           { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Contract Q&A
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
            {hasContract
              ? 'Ask anything about your contract — clause-referenced answers'
              : 'No contract uploaded — answering from general construction law knowledge'}
          </p>
        </div>
        {!hasContract && (
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-md)',
            background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)',
          }}>
            General mode
          </span>
        )}
      </div>

      {/* Quick questions */}
      {chatHistory.length === 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Quick questions
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isChatLoading}
                style={{
                  fontSize: '12px', padding: '5px 10px', borderRadius: '20px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
                  opacity: isChatLoading ? 0.5 : 1,
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

      {/* Message list */}
      <div style={{
        flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '14px', marginBottom: '12px', minHeight: '200px', maxHeight: '420px',
      }} className="thin-scrollbar">
        {chatHistory.length === 0 && !isChatLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px 16px', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--accent-dim)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '12px',
            }}>
              <SiteIQIcon />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ask anything about your contract</p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Select a quick question above or type your own
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {isChatLoading && <TypingIndicator />}

        {error && (
          <div style={{
            fontSize: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginTop: '8px',
            background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)',
          }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your contract... (Enter to send)"
          rows={2}
          disabled={isChatLoading}
          className="input"
          style={{ flex: 1, resize: 'none', lineHeight: 1.5 }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isChatLoading}
          style={{
            flexShrink: 0, width: '44px', borderRadius: 'var(--radius-lg)',
            background: input.trim() && !isChatLoading ? 'var(--accent)' : 'var(--border)',
            border: 'none', cursor: input.trim() && !isChatLoading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0f1114', transition: 'background 0.15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px', textAlign: 'center' }}>
        Powered by Claude · Always verify with a qualified solicitor
      </p>
    </div>
  )
}
