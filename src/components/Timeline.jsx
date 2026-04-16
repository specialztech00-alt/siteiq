/**
 * Timeline — Vertical chronological timeline of key contract/project dates.
 */

export default function Timeline({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
        No timeline events extracted.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: '16px', paddingBottom: '24px' }}>
            {/* Vertical connector */}
            {!isLast && (
              <div style={{
                position: 'absolute', left: '19px', top: '40px', bottom: 0,
                width: '2px', background: 'var(--border)',
              }} />
            )}

            {/* Dot */}
            <div style={{ flexShrink: 0, zIndex: 1 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: item.urgent ? 'var(--danger)' : 'var(--bg-card)',
                border: item.urgent ? 'none' : '2px solid var(--border)',
                color: item.urgent ? '#fff' : 'var(--text-tertiary)',
              }}>
                {item.urgent ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="card" style={{
              flex: 1, marginBottom: 0, padding: '12px 14px',
              borderLeft: `3px solid ${item.urgent ? 'var(--danger)' : 'var(--border)'}`,
            }}>
              {item.date && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                  {item.date}
                </span>
              )}
              <h4 style={{
                fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, lineHeight: 1.3,
                color: item.urgent ? 'var(--danger)' : 'var(--text-primary)',
              }}>
                {item.urgent && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', marginRight: '6px',
                    padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: 'var(--danger-bg)', color: 'var(--danger)',
                  }}>
                    Urgent
                  </span>
                )}
                {item.title}
              </h4>
              {item.description && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
