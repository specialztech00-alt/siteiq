import { useState } from 'react'

const SEVERITY_COLOR = {
  High:   'var(--danger)',
  Medium: 'var(--warning)',
  Low:    'var(--success)',
}

const SEVERITY_BG = {
  High:   'var(--danger-bg)',
  Medium: 'var(--warning-bg)',
  Low:    'var(--success-bg)',
}

export default function RiskCard({ risk }) {
  const [expanded, setExpanded] = useState(false)
  const { id, severity, title, description, action, regulation } = risk

  const color  = SEVERITY_COLOR[severity] ?? 'var(--text-tertiary)'
  const bg     = SEVERITY_BG[severity]    ?? 'transparent'

  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}`, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '14px 16px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        {/* Dot */}
        <span style={{
          marginTop: '3px', width: '9px', height: '9px', borderRadius: '50%',
          background: color, flexShrink: 0, display: 'inline-block',
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: '4px',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              background: bg, color,
            }}>
              {severity}
            </span>
            {id && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {id}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {title}
          </h3>
        </div>

        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, marginTop: '3px', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="2,5 7,9 12,5" />
        </svg>
      </button>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
          {description && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Risk
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
            </div>
          )}

          {action && (
            <div style={{
              marginTop: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--info-bg)', border: '1px solid var(--info)',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--info)', marginBottom: '4px' }}>
                Required Action
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{action}</p>
            </div>
          )}

          {regulation && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ marginTop: '1px', flexShrink: 0 }}>
                <path d="M2 1h7l3 3v9H2V1z"/><line x1="5" y1="6" x2="9" y2="6"/><line x1="5" y1="8.5" x2="9" y2="8.5"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{regulation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
