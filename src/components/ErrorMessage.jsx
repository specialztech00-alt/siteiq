/**
 * Inline error banner for displaying API/network errors within page context.
 * Usage: <ErrorMessage error="Something went wrong" onRetry={() => refetch()} />
 */
export default function ErrorMessage({ error, onRetry, onDismiss, compact = false }) {
  if (!error) return null

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13,
        color: 'var(--danger)',
      }}>
        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span style={{ flex: 1 }}>{error}</span>
        {onRetry && (
          <button onClick={onRetry} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 700, fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 16, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>×</button>
        )}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '16px 18px',
      background: 'var(--danger-bg)',
      border: '1px solid var(--danger)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg style={{ width: 16, height: 16, color: 'var(--danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)', marginBottom: 3 }}>Something went wrong</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{error}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {onRetry && (
            <button onClick={onRetry} style={{
              padding: '6px 14px', borderRadius: 6,
              background: 'var(--danger)', color: '#fff',
              fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer',
            }}>
              Try again
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} style={{
              padding: '6px 14px', borderRadius: 6,
              background: 'transparent', color: 'var(--text-secondary)',
              fontWeight: 600, fontSize: 12,
              border: '1px solid var(--border)', cursor: 'pointer',
            }}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
