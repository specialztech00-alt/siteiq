function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 8A6 6 0 1 1 8 2M14 2v4h-4" />
    </svg>
  )
}

function HardhatBadge() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 16h14v2H3v-2z" />
      <path d="M10 2C6 2 3 5 3 9v1h14V9c0-4-3-7-7-7z" />
      <path d="M2 12h16v3H2v-3z" opacity="0.7" />
    </svg>
  )
}

export default function ClaudeCard({ title, subtitle, content, loading, onRefresh, variant = 'default' }) {
  const borderColor =
    variant === 'urgent' ? 'var(--danger)' :
    variant === 'advisory' ? 'var(--info)' :
    'var(--accent)'

  const bgColor = variant === 'urgent' ? 'var(--danger-bg)' : 'var(--bg-card)'

  const iconBg =
    variant === 'urgent' ? 'rgba(239,68,68,0.15)' :
    variant === 'advisory' ? 'rgba(59,130,246,0.15)' :
    'rgba(245,196,0,0.15)'

  const iconColor =
    variant === 'urgent' ? 'var(--danger)' :
    variant === 'advisory' ? 'var(--info)' :
    'var(--accent)'

  return (
    <>
      <style>{`
        @keyframes cc-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes cc-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cc-dot {
          0%,80%,100% { opacity: 0.3; transform: scale(0.8); }
          40%          { opacity: 1;   transform: scale(1);   }
        }
        .cc-shimmer {
          background: linear-gradient(
            90deg,
            var(--border) 25%,
            var(--bg-secondary) 50%,
            var(--border) 75%
          );
          background-size: 800px 100%;
          animation: cc-shimmer 1.4s ease infinite;
          border-radius: 4px;
        }
        .cc-content {
          animation: cc-fade-in 0.4s ease;
        }
      `}</style>

      <div style={{
        background: bgColor,
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: iconBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: iconColor, flexShrink: 0,
            }}>
              <HardhatBadge />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'var(--accent-dim)',
              color: 'var(--text-accent)',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              letterSpacing: '0.03em',
            }}>
              Claude AI
            </span>
            {onRefresh && !loading && (
              <button
                onClick={onRefresh}
                title="Refresh"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                  padding: '3px', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                <RefreshIcon />
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {[80, 65, 45].map((w, i) => (
                <div key={i} className="cc-shimmer" style={{ height: '12px', width: `${w}%` }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                Claude is thinking
              </span>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'inline-block', width: '4px', height: '4px',
                  borderRadius: '50%', background: 'var(--accent)',
                  animation: 'cc-dot 1.4s ease infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && content && (
          <div className="cc-content">
            <div style={{
              fontSize: '13px', lineHeight: 1.75,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
            }}>
              {content}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: '12px',
              borderTop: '1px solid var(--border)', paddingTop: '8px',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                Generated just now
              </span>
              {subtitle && (
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{subtitle}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
