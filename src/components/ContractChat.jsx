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

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4">
            <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
            <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
          </svg>
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        {/* Render newlines as line breaks */}
        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
        <span className="block text-[10px] opacity-40 mt-1.5 text-right">
          {isUser ? 'You' : 'SiteIQ AI'}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center mr-2 flex-shrink-0">
        <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4">
          <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
          <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
        </svg>
      </div>
      <div className="chat-bubble-ai flex items-center gap-1 py-3">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export default function ContractChat() {
  const chatHistory = useAppStore(s => s.chatHistory)
  const addChatMessage = useAppStore(s => s.addChatMessage)
  const isChatLoading = useAppStore(s => s.isChatLoading)
  const setIsChatLoading = useAppStore(s => s.setIsChatLoading)
  const docText = useAppStore(s => s.docText)

  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

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
      // Build messages array from history + new user message
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
    <div className="flex flex-col h-full" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-gray-900">Contract Q&amp;A</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasContract
              ? 'Ask anything about your contract — clause-referenced answers'
              : 'No contract uploaded — answering from general construction law knowledge'}
          </p>
        </div>
        {!hasContract && (
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-medium">
            General mode
          </span>
        )}
      </div>

      {/* Quick question pills */}
      {chatHistory.length === 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick questions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isChatLoading}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-yellow hover:bg-yellow-50 hover:text-yellow-700 transition-colors disabled:opacity-50 text-gray-600"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto thin-scrollbar bg-gray-50 rounded-xl p-4 mb-4 min-h-0" style={{ maxHeight: '420px' }}>
        {chatHistory.length === 0 && !isChatLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mb-3">
              <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
                <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
                <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-600">Ask anything about your contract</p>
            <p className="text-xs text-gray-400 mt-1">Select a quick question above or type your own</p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {isChatLoading && <TypingIndicator />}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your contract... (Enter to send)"
          rows={2}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow/30 focus:border-yellow transition-colors"
          disabled={isChatLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isChatLoading}
          className="flex-shrink-0 w-11 bg-yellow hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy rounded-xl flex items-center justify-center transition-colors"
          title="Send"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-center">
        Powered by Claude · Always verify with a qualified solicitor
      </p>
    </div>
  )
}
