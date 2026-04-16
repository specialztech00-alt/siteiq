/**
 * ScoreStrip — Overview metric cards at the top of the report.
 */

function ScoreGauge({ score, label }) {
  if (score == null) return null

  const r = 38, cx = 48, cy = 48
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const trackColor = 'var(--border)'
  const fillColor  = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ position: 'relative', width: '96px', height: '96px', marginBottom: '12px' }}>
        <svg viewBox="0 0 96 96" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth="8" />
          <circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke={fillColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, lineHeight: 1, color: fillColor }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
        {score >= 70 ? 'Good' : score >= 40 ? 'Needs attention' : 'Critical'}
      </span>
    </div>
  )
}

function CountCard({ count, label, sublabel, colorVar, bgVar }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', border: `1px solid ${colorVar}` }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: colorVar, lineHeight: 1 }}>{count}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginTop: '8px' }}>
        {label}
      </span>
      {sublabel && (
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{sublabel}</span>
      )}
    </div>
  )
}

export default function ScoreStrip({ report }) {
  const { safetyScore, contractScore, riskCount, obligations } = report
  const totalRisks = (riskCount?.high ?? 0) + (riskCount?.medium ?? 0) + (riskCount?.low ?? 0)
  const obligationCount = obligations?.length ?? 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
      <ScoreGauge score={safetyScore} label="Safety Score" />
      {contractScore != null
        ? <ScoreGauge score={contractScore} label="Contract Health" />
        : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', opacity: 0.5 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-tertiary)', lineHeight: 1 }}>—</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginTop: '12px' }}>
              Contract Health
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>No contract</span>
          </div>
        )
      }
      <CountCard
        count={riskCount?.high ?? 0}
        label="High Risks"
        sublabel={`${totalRisks} total risks`}
        colorVar="var(--danger)"
        bgVar="var(--danger-bg)"
      />
      <CountCard
        count={obligationCount}
        label="Obligations"
        sublabel="requiring action"
        colorVar="var(--info)"
        bgVar="var(--info-bg)"
      />
    </div>
  )
}
