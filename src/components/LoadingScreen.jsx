import { useState, useEffect } from 'react'
import { LOADING_STEPS } from '../store/useAppStore.js'
import { CheckCircle2 } from 'lucide-react'

const STEP_ATTRIBUTION = [
  null,
  'Hugging Face · facebook/detr-resnet-50',
  'pdfjs-dist · local extraction',
  'Hugging Face · dslim/bert-base-NER',
  'Claude · claude-sonnet-4-20250514',
  'Claude · claude-sonnet-4-20250514',
  'Claude · claude-sonnet-4-20250514',
  null,
]

function getCountdownMessage(seconds) {
  if (seconds > 20) return 'Running AI analysis — this takes about 30 seconds...'
  if (seconds > 10) return 'Claude is reading your contract and site conditions...'
  if (seconds > 5) return 'Building your risk register and action plan...'
  if (seconds > 0) return 'Almost there — assembling your report...'
  return 'Taking a little longer than usual — still working...'
}

export default function LoadingScreen({ currentStep }) {
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [overtime, setOvertime] = useState(false)

  useEffect(() => {
    setSecondsLeft(30)
    setOvertime(false)
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setOvertime(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const progress = Math.round((currentStep / (LOADING_STEPS.length - 1)) * 100)
  const attribution = STEP_ATTRIBUTION[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
            <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
            <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
            <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#0f1114" opacity="0.35" />
          </svg>
          <span className="font-heading text-4xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            Site<span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
        </div>
        <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
          Analysing your site &amp; contract
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Progress</span>
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Countdown timer */}
      <div className="w-full max-w-sm mb-6 flex items-center justify-between">
        <p className="text-xs flex-1 pr-4" style={{ color: 'var(--text-tertiary)' }}>
          {getCountdownMessage(secondsLeft)}
        </p>
        <div
          className="flex-shrink-0 font-mono font-bold text-sm tabular-nums px-2.5 py-1 rounded-lg"
          style={overtime
            ? { color: 'var(--warning)', background: 'var(--warning-bg)' }
            : { color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }
          }
        >
          {overtime ? '—' : `${secondsLeft}s`}
        </div>
      </div>

      {/* Spinning indicator */}
      <div className="relative w-14 h-14 mb-6">
        <div className="absolute inset-0 rounded-full border-4 opacity-30"
          style={{ borderColor: 'var(--border)' }} />
        <div className="absolute inset-0 rounded-full border-4 border-transparent spin-slow"
          style={{ borderTopColor: 'var(--accent)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-bold text-base" style={{ color: 'var(--accent)' }}>
            {currentStep + 1}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-1.5">
        {LOADING_STEPS.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isPending = i > currentStep

          return (
            <div
              key={step}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300"
              style={{
                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                border: isActive ? `1px solid rgba(245,196,0,0.3)` : '1px solid transparent',
                opacity: isPending ? 0.2 : isDone ? 0.6 : 1,
              }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                ) : isActive ? (
                  <div className="w-3 h-3 rounded-full pulse-yellow"
                    style={{ background: 'var(--accent)' }} />
                ) : (
                  <div className="w-3 h-3 rounded-full border"
                    style={{ borderColor: 'var(--border)' }} />
                )}
              </div>

              {/* Label + attribution */}
              <div className="flex-1 min-w-0">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isActive ? 'var(--accent)' : isDone ? 'var(--success)' : 'var(--text-tertiary)',
                  }}
                >
                  {step}
                </span>
                {isActive && STEP_ATTRIBUTION[i] && (
                  <p className="text-xs mt-0.5 truncate font-mono"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {STEP_ATTRIBUTION[i]}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Claude attribution */}
      <div className="mt-8 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Powered by Claude <span style={{ color: 'var(--text-tertiary)' }}>claude-sonnet-4-20250514</span></span>
      </div>
    </div>
  )
}
