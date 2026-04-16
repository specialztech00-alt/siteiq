/**
 * ObligationTable — Shows the contract obligations register.
 */

const STATUS_STYLE = {
  pending: { background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' },
  done:    { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' },
  overdue: { background: 'var(--danger-bg)',  color: 'var(--danger)',  border: '1px solid var(--danger)'  },
}

const PARTY_STYLE = {
  Contractor: { background: 'var(--info-bg)',    color: 'var(--info)' },
  Client:     { background: 'var(--accent-dim)', color: 'var(--text-accent)' },
  Both:       { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
      ...style,
    }}>
      {status}
    </span>
  )
}

function PartyBadge({ party }) {
  const style = PARTY_STYLE[party] ?? PARTY_STYLE.Both
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: '4px', fontSize: '11px', fontWeight: 600,
      ...style,
    }}>
      {party}
    </span>
  )
}

export default function ObligationTable({ obligations }) {
  if (!obligations || obligations.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
        No obligations extracted — upload a contract to populate this table.
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'none' }} data-desktop>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Obligation', 'Party', 'Clause', 'Due', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 16px',
                  fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {obligations.map((ob, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{ob.obligation}</td>
                <td style={{ padding: '12px 16px' }}><PartyBadge party={ob.party} /></td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{ob.clause}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{ob.due}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={ob.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive table for all screen sizes */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', minWidth: '560px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              {['Obligation', 'Party', 'Clause', 'Due', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 16px',
                  fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {obligations.map((ob, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{ob.obligation}</td>
                <td style={{ padding: '12px 16px' }}><PartyBadge party={ob.party} /></td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>{ob.clause}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{ob.due}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={ob.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
