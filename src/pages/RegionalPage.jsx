import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { nigeriaStates } from '../data/nigeriaStates.js'
import { getConstructionScore } from '../lib/geoData.js'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

const RISK_COLORS = {
  'Very High': 'var(--danger)',
  High: 'var(--warning)',
  Medium: 'var(--warning)',
  Low: 'var(--success)',
}

function RiskDot({ level }) {
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
      background: RISK_COLORS[level] || 'var(--text-tertiary)',
      flexShrink: 0,
    }} title={level} />
  )
}

function ScoreBadge({ score }) {
  const color = score >= 7 ? 'var(--success)' : score >= 4 ? 'var(--warning)' : 'var(--danger)'
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
      color, background: `${color}18`, padding: '2px 8px',
      borderRadius: '4px',
    }}>
      {score}/10
    </span>
  )
}

export default function RegionalPage() {
  const navigate = useNavigate()

  const statesWithScores = useMemo(() => {
    return (nigeriaStates || []).map(state => ({
      ...state,
      score: getConstructionScore(state.name)?.score ?? 5,
    })).sort((a, b) => b.score - a.score)
  }, [])

  const top5Safest = statesWithScores.slice(0, 5)
  const top5Riskiest = [...statesWithScores].sort((a, b) => a.score - b.score).slice(0, 5)

  const zoneMap = useMemo(() => {
    const map = {}
    ;(nigeriaStates || []).forEach(s => {
      if (!map[s.zone]) map[s.zone] = []
      map[s.zone].push(s.name)
    })
    return map
  }, [])

  const avgByZone = useMemo(() => {
    return Object.entries(zoneMap).map(([zone, names]) => {
      const scores = (names || []).map(n => getConstructionScore(n)?.score ?? 5)
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      return { zone, avg, count: names.length }
    }).sort((a, b) => b.avg - a.avg)
  }, [zoneMap])

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Regional Risks
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Construction risk intelligence across all 37 Nigerian states
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'States Covered', value: nigeriaStates.length },
          { label: 'High Risk States', value: statesWithScores.filter(s => s.score < 4).length, color: 'var(--danger)' },
          { label: 'Medium Risk', value: statesWithScores.filter(s => s.score >= 4 && s.score < 7).length, color: 'var(--warning)' },
          { label: 'Low Risk', value: statesWithScores.filter(s => s.score >= 7).length, color: 'var(--success)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: color || 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Safest */}
        <div className="card" style={{ padding: '20px' }}>
          <SectionLabel>Safest for Construction</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {top5Safest.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', width: '16px' }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{s.zone}</span>
                <ScoreBadge score={s.score} />
              </div>
            ))}
          </div>
        </div>

        {/* Riskiest */}
        <div className="card" style={{ padding: '20px' }}>
          <SectionLabel>Highest Risk</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {top5Riskiest.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', width: '16px' }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{s.zone}</span>
                <ScoreBadge score={s.score} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone averages */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <SectionLabel>Score by Geopolitical Zone</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(avgByZone || []).map(({ zone, avg, count }) => {
            const color = avg >= 7 ? 'var(--success)' : avg >= 4 ? 'var(--warning)' : 'var(--danger)'
            return (
              <div key={zone} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, width: '130px', flexShrink: 0 }}>{zone}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avg * 10}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color, fontWeight: 700, width: '40px', textAlign: 'right' }}>{avg}/10</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', width: '60px' }}>{count} states</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* All states grid */}
      <div style={{ marginBottom: '12px' }}>
        <SectionLabel>All States — Construction Risk Matrix</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {(statesWithScores || []).map(state => {
            const scoreColor = state.score >= 7 ? 'var(--success)' : state.score >= 4 ? 'var(--warning)' : 'var(--danger)'
            return (
              <div
                key={state.name}
                className="card"
                onClick={() => navigate('/app/geo')}
                style={{ padding: '14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{state.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{state.zone}</div>
                  </div>
                  <div style={{
                    fontSize: '16px', fontWeight: 700, color: scoreColor,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {state.score}
                  </div>
                </div>

                {/* Risk dots row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.entries(state.risks || {}).map(([key, level]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <RiskDot level={level} />
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Score bar */}
                <div style={{ marginTop: '10px', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${state.score * 10}%`, height: '100%', background: scoreColor, borderRadius: '2px' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Risk dots:</div>
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
