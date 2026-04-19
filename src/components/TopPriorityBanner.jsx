import { AlertTriangle } from 'lucide-react'

export default function TopPriorityBanner({ action, deadline, onDismiss, dismissed }) {
  if (dismissed || !action) return null

  return (
    <div style={{
      background: 'var(--accent)',
      color: '#0f1114',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderRadius: 'var(--radius-md)',
      marginBottom: '16px',
    }}>
      <AlertTriangle size={18} color="#0f1114" style={{ flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: '2px', opacity: 0.8,
        }}>
          Priority action
        </p>
        <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
          {action}
        </p>
        {deadline && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            opacity: 0.75, marginTop: '2px',
          }}>
            {deadline}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: '1px solid rgba(15,17,20,0.5)',
          color: '#0f1114',
          padding: '5px 12px',
          fontSize: '11px',
          fontWeight: 600,
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'opacity 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Mark as actioned
      </button>
    </div>
  )
}
