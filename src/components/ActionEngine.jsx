/**
 * ActionEngine — Prescriptive, prioritised PM action plan.
 */

const DEADLINE_COLOR = (deadline) => {
  if (!deadline) return 'var(--text-tertiary)'
  const d = deadline.toLowerCase()
  if (d.includes('immediately') || d.includes('now') || d.includes('24 hour')) return 'var(--danger)'
  if (d.includes('48') || d.includes('2 day') || d.includes('today')) return 'var(--warning)'
  if (d.includes('week') || d.includes('7 day')) return 'var(--warning)'
  return 'var(--info)'
}

const SEV_COLOR = {
  High:   'var(--danger)',
  Medium: 'var(--warning)',
  Low:    'var(--success)',
}
const SEV_BG = {
  High:   'var(--danger-bg)',
  Medium: 'var(--warning-bg)',
  Low:    'var(--success-bg)',
}

function Panel({ accentColor, children }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderTop: `2px solid ${accentColor}`,
      borderRadius: 'var(--radius-lg)', padding: '20px',
    }}>
      {children}
    </div>
  )
}

function PanelHeading({ accentColor, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{ width: '3px', height: '24px', background: accentColor, borderRadius: '2px' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {children}
      </h2>
    </div>
  )
}

function PenaltyCard({ clause }) {
  const color = SEV_COLOR[clause.severity] ?? 'var(--text-secondary)'
  const bg    = SEV_BG[clause.severity]    ?? 'transparent'

  return (
    <div style={{
      borderLeft: `3px solid ${color}`, borderRadius: 'var(--radius-md)',
      padding: '12px 14px', background: bg, border: `1px solid ${color}`,
      borderLeftWidth: '3px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {clause.title}
        </span>
        <span style={{
          flexShrink: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '2px 8px', borderRadius: '4px', background: bg, color,
        }}>
          {clause.severity}
        </span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: clause.action ? '8px' : 0 }}>
        {clause.description}
      </p>
      {clause.action && (
        <p style={{ fontSize: '12px', color: 'var(--info)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
          <span style={{ fontWeight: 600 }}>Mitigation: </span>{clause.action}
        </p>
      )}
      {clause.clause && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
          {clause.clause}
        </span>
      )}
    </div>
  )
}

export default function ActionEngine({ pmActions, penaltyClauses, notices }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* PM Action Plan */}
      <Panel accentColor="var(--accent)">
        <PanelHeading accentColor="var(--accent)">Prescriptive PM Action Plan</PanelHeading>

        {pmActions && pmActions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pmActions.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-dim)', border: '1px solid rgba(245,196,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--accent)', lineHeight: 1 }}>
                      {item.priority ?? i + 1}
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' }}>{item.action}</p>
                  {item.reason && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '6px' }}>{item.reason}</p>
                  )}
                  {item.deadline && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: DEADLINE_COLOR(item.deadline) }}>
                        {item.deadline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No PM actions generated.</p>
        )}
      </Panel>

      {/* Penalty Clauses */}
      {penaltyClauses && penaltyClauses.length > 0 && (
        <Panel accentColor="var(--danger)">
          <PanelHeading accentColor="var(--danger)">Contract Risk Clauses</PanelHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {penaltyClauses.map((clause, i) => <PenaltyCard key={i} clause={clause} />)}
          </div>
        </Panel>
      )}

      {/* Required Notices */}
      {notices && notices.length > 0 && (
        <Panel accentColor="var(--info)">
          <PanelHeading accentColor="var(--info)">Required Notices &amp; Submissions</PanelHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notices.map((notice, i) => {
              const color = SEV_COLOR[notice.severity] ?? 'var(--text-secondary)'
              const bg    = SEV_BG[notice.severity]    ?? 'transparent'
              return (
                <div key={i} style={{
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {notice.title}
                    </span>
                    {notice.severity && (
                      <span style={{
                        flexShrink: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '2px 8px', borderRadius: '4px', background: bg, color,
                      }}>
                        {notice.severity}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: notice.action ? '8px' : 0 }}>
                    {notice.description}
                  </p>
                  {notice.action && (
                    <p style={{ fontSize: '12px', color: 'var(--info)', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 600 }}>Action: </span>{notice.action}
                    </p>
                  )}
                  {notice.clause && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px', display: 'block' }}>
                      {notice.clause}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>
      )}
    </div>
  )
}
