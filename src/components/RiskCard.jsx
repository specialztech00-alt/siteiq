import { useState } from 'react'

const SEVERITY_CLASSES = {
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
}

const SEVERITY_BORDER = {
  High: 'border-l-red-400',
  Medium: 'border-l-amber-400',
  Low: 'border-l-green-400',
}

const SEVERITY_DOT = {
  High: 'bg-red-400',
  Medium: 'bg-amber-400',
  Low: 'bg-green-400',
}

export default function RiskCard({ risk }) {
  const [expanded, setExpanded] = useState(false)
  const { id, severity, title, description, action, regulation } = risk

  return (
    <div className={`card border-l-4 ${SEVERITY_BORDER[severity] ?? 'border-l-gray-300'} p-0 overflow-hidden`}>
      {/* Header — always visible */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Dot */}
        <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${SEVERITY_DOT[severity] ?? 'bg-gray-400'}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${SEVERITY_CLASSES[severity] ?? ''}`}>
              {severity}
            </span>
            {id && (
              <span className="font-mono-clause text-gray-400">{id}</span>
            )}
          </div>
          <h3 className="font-heading font-bold text-base text-gray-900 mt-1 leading-snug">
            {title}
          </h3>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-3">
          {description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Risk</p>
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            </div>
          )}

          {action && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Required Action</p>
              <p className="text-sm text-blue-800 leading-relaxed">{action}</p>
            </div>
          )}

          {regulation && (
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-mono-clause text-gray-500">{regulation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
