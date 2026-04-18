import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ScanLine,
  HardHat,
  ScrollText,
  Sparkles,
  CloudSun,
  Globe,
  ShieldAlert,
  Archive,
  Plus,
} from 'lucide-react'
import { callClaude } from '../lib/claude.js'
import useAppStore from '../store/useAppStore.js'
import useAuthStore from '../store/useAuthStore.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import CircularScore from '../components/CircularScore.jsx'
import StarRating from '../components/StarRating.jsx'
import { useWeather } from '../components/WeatherWidget.jsx'
import { getConstructionScore, getRegionalRiskSummary, getFloodRiskAdvice } from '../lib/geoData.js'

// ── Greeting helpers ──────────────────────────────────────────────────────────

function getGreeting(name) {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return `Good morning, ${name}.`
  if (h >= 12 && h < 17) return `Good afternoon, ${name}.`
  if (h >= 17 && h < 21) return `Good evening, ${name}.`
  return `Working late, ${name}.`
}

function getContextLine() {
  const now = new Date()
  const day = now.getDay()   // 0=Sun, 1=Mon, ..., 6=Sat
  const h = now.getHours()
  const month = now.getMonth() + 1  // 1-12

  // Monday morning
  if (day === 1 && h < 12) {
    return 'Start of the work week. Run a site analysis before your crew arrives.'
  }
  // Friday afternoon
  if (day === 5 && h >= 12) {
    return 'End of week. Review your risk register before the weekend.'
  }
  // Rainy season — April to October
  if (month >= 4 && month <= 10) {
    return 'Rainy season is active. Check ground conditions before site operations.'
  }
  // Harmattan — November to February
  if (month >= 11 || month <= 2) {
    return 'Harmattan conditions may affect visibility and concrete curing. Monitor weather daily.'
  }
  return null
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function riskColor(level) {
  if (level === 'Very High') return 'var(--danger)'
  if (level === 'High') return 'var(--warning)'
  if (level === 'Medium') return 'var(--accent)'
  return 'var(--success)'
}

function riskBg(level) {
  if (level === 'Very High') return 'var(--danger-bg)'
  if (level === 'High') return 'var(--warning-bg)'
  if (level === 'Medium') return 'var(--accent-dim)'
  return 'var(--success-bg)'
}

function statusBadge(status) {
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '20px',
      background: 'var(--success-bg)',
      color: 'var(--success)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {status}
    </span>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      flex: '1 1 0',
      minWidth: '120px',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: accent || 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{sub}</p>
      )}
    </div>
  )
}

function QuickAction({ Icon, label, to, color }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flex: '1 1 0',
        minWidth: '80px',
        color: color || 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-card-hover)'
        e.currentTarget.style.borderColor = color || 'var(--accent)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-card)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span style={{ fontSize: '11px', fontWeight: 500, textAlign: 'center', lineHeight: 1.3, color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </button>
  )
}

// ── WeatherMini ───────────────────────────────────────────────────────────────

function WeatherMini({ stateName }) {
  const { weather, loading, error } = useWeather(stateName)

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[70, 50, 80].map((w, i) => (
          <div key={i} style={{ height: '12px', width: `${w}%`, borderRadius: '4px', background: 'var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    )
  }

  if (error || !weather) {
    return <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Weather data unavailable</p>
  }

  const { temperature_2m, apparent_temperature, windspeed_10m, precipitation, relative_humidity_2m } = weather

  const rows = [
    { label: 'Temperature', value: `${Math.round(temperature_2m)}°C (feels ${Math.round(apparent_temperature)}°C)` },
    { label: 'Wind', value: `${Math.round(windspeed_10m)} km/h` },
    { label: 'Precipitation', value: `${precipitation} mm` },
    { label: 'Humidity', value: `${relative_humidity_2m}%` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {rows.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{label}</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Portfolio Intelligence ────────────────────────────────────────────────────

function PortfolioIntelligence({ analyses }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (analyses.length < 2 || ranRef.current) return
    ranRef.current = true
    setLoading(true)

    const summary = analyses.slice(0, 10).map((a, i) => {
      const safety = a.reportData?.safetyScore ?? 'N/A'
      const contract = a.reportData?.contractScore ?? 'N/A'
      const high = a.reportData?.riskCount?.high ?? 0
      return `${i + 1}. ${a.projectName || 'Unnamed'} — ${a.selectedState || 'Unknown state'} — Safety: ${safety}/100, Contract: ${contract}/100, High risks: ${high}`
    }).join('\n')

    const prompt = `You are a construction portfolio analyst for a Nigerian PM firm.

Here are ${analyses.length} recent site analyses:
${summary}

Provide 3-4 cross-project portfolio insights. Identify:
- Recurring safety weaknesses or patterns across projects
- Which states or project types carry the most risk
- Contract health trends and financial exposure patterns
- 1-2 specific recommendations to improve overall portfolio performance

Be direct and data-driven. Plain text only. 2-3 sentences per insight. Label each with a short bold title.`

    callClaude({
      systemPrompt: 'You are a construction portfolio risk analyst. Be concise and insight-driven.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 600,
    }).then(text => {
      setInsight(text)
      setLoading(false)
    }).catch(err => {
      setError(err.message)
      setLoading(false)
    })
  }, [analyses.length])

  if (analyses.length < 2) return null

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Sparkles size={15} style={{ color: 'var(--accent)' }} />
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Portfolio Intelligence
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>
          Patterns across {analyses.length} analyses
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[85, 70, 90, 60].map((w, i) => (
            <div key={i} style={{ height: '13px', width: `${w}%`, borderRadius: '4px', background: 'var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {error && (
        <p style={{ fontSize: '13px', color: 'var(--danger)' }}>Could not load insights — {error}</p>
      )}

      {insight && !loading && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {insight}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedState, reportData, analyses, loadAnalysesFromDb, loadRiskStatuses } = useAppStore()
  const [dataError, setDataError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadAnalysesFromDb(user.id).catch(err => setDataError(err?.message || 'Could not load your analyses.'))
      loadRiskStatuses(user.id)
    }
  }, [user?.id])

  const firstName = (user?.name || user?.email || 'there').split(/[\s@]/)[0]
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const greeting = getGreeting(firstName)
  const contextLine = getContextLine()

  const geoScore = getConstructionScore(selectedState)
  const riskSummary = getRegionalRiskSummary(selectedState)
  const floodAdvice = getFloodRiskAdvice(selectedState)

  const recentAnalyses = analyses.slice(0, 4)
  const avgSafety = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.reportData?.safetyScore ?? 0), 0) / analyses.length)
    : 0
  const avgContract = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.reportData?.contractScore ?? 0), 0) / analyses.length)
    : 0

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {greeting}
          </h1>
          {contextLine && (
            <p style={{ fontSize: '13px', color: 'var(--text-accent)', marginBottom: '2px', fontWeight: 500 }}>
              {contextLine}
            </p>
          )}
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{dateStr}</p>
        </div>

        <button
          onClick={() => navigate('/app/new-analysis')}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Run Analysis
        </button>
      </div>

      {/* ── DB error ── */}
      {dataError && (
        <div style={{ marginBottom: 16 }}>
          <ErrorMessage error={dataError} onDismiss={() => setDataError(null)} compact />
        </div>
      )}

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <StatCard label="Analyses Run" value={analyses.length} sub="Total" />
        <StatCard label="Avg Safety Score" value={`${avgSafety}`} sub="Out of 100" accent={avgSafety >= 70 ? 'var(--success)' : avgSafety >= 45 ? 'var(--warning)' : 'var(--danger)'} />
        <StatCard label="Avg Contract Score" value={`${avgContract}`} sub="Out of 100" accent="var(--accent)" />
        <StatCard label="Selected State" value={selectedState.replace(' (FCT)', '')} sub={`Score: ${geoScore.score}/10 — ${geoScore.label}`} accent="var(--text-primary)" />
      </div>

      {/* ── Main two-column grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '16px', marginBottom: '24px', alignItems: 'start' }}>

        {/* LEFT — Recent analyses ─────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Analyses</h2>
            <button
              onClick={() => navigate('/app/archive')}
              style={{ fontSize: '12px', color: 'var(--text-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View all
            </button>
          </div>

          {recentAnalyses.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>No analyses yet</p>
              <button className="btn-primary" onClick={() => navigate('/app/new-analysis')} style={{ fontSize: '13px' }}>
                Run your first analysis
              </button>
            </div>
          ) : recentAnalyses.map((a, i) => {
            const safety = a.reportData?.safetyScore ?? 0
            const contract = a.reportData?.contractScore ?? 0
            const combined = safety + contract
            const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 20px',
                  borderBottom: i < recentAnalyses.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate('/app/archive')}
              >
                <CircularScore score={safety} size={48} showLabel={false} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.projectName || 'Unnamed Project'}
                    </span>
                    {statusBadge('Complete')}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    {a.selectedState || '—'} · {date} · {a.id}
                  </p>
                  <StarRating score={combined} size={12} />
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Contract</p>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: contract >= 70 ? 'var(--success)' : contract >= 45 ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {contract || '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT — Weather + Geo panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Weather card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Site Weather</h3>
              <button
                onClick={() => navigate('/app/weather')}
                style={{ fontSize: '11px', color: 'var(--text-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Full forecast
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>{selectedState}</p>
            <WeatherMini stateName={selectedState} />
          </div>

          {/* Geo score card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Construction Index</h3>
              <button
                onClick={() => navigate('/app/geo')}
                style={{ fontSize: '11px', color: 'var(--text-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Details
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <CircularScore score={geoScore.score * 10} size={56} showLabel={false} />
              <div>
                <p style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {geoScore.score}<span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>/10</span>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{geoScore.label}</p>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{geoScore.description}</p>
          </div>

          {/* Flood risk card */}
          {floodAdvice && (
            <div style={{
              background: riskBg(floodAdvice.level),
              border: `1px solid ${riskColor(floodAdvice.level)}33`,
              borderRadius: 'var(--radius-lg)',
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: riskColor(floodAdvice.level) }}>
                  Flood Risk: {floodAdvice.level}
                </p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{floodAdvice.action}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Portfolio Intelligence ──────────────────────────────────────────── */}
      <PortfolioIntelligence analyses={analyses} />

      {/* ── Quick actions ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <p className="section-label" style={{ marginBottom: '10px' }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <QuickAction Icon={ScanLine}   label="Run Analysis"     to="/app/new-analysis" color="var(--accent)" />
          <QuickAction Icon={HardHat}    label="Safety Monitor"   to="/app/safety"       color="var(--warning)" />
          <QuickAction Icon={ScrollText} label="Contract Analyser"to="/app/contract"     color="var(--accent)" />
          <QuickAction Icon={Sparkles}   label="Site Intelligence"to="/app/assistant"    color="var(--success)" />
          <QuickAction Icon={CloudSun}   label="Site Weather"     to="/app/weather"      color="var(--accent)" />
          <QuickAction Icon={Globe}      label="Ground Conditions"to="/app/geo"          color="var(--accent)" />
          <QuickAction Icon={ShieldAlert}label="Risk Matrix"      to="/app/risks"        color="var(--danger)" />
          <QuickAction Icon={Archive}    label="Project Archive"  to="/app/archive"      color="var(--text-secondary)" />
        </div>
      </div>

      {/* ── Regional risk banner ─────────────────────────────────────────────── */}
      {riskSummary && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Regional Risk Profile — {riskSummary.state}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{riskSummary.zone}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {riskSummary.allRisks.map(({ label, level }) => (
              <span key={label} style={{
                fontSize: '11px',
                fontWeight: 500,
                padding: '3px 10px',
                borderRadius: '20px',
                background: riskBg(level),
                color: riskColor(level),
                border: `1px solid ${riskColor(level)}33`,
              }}>
                {label}: {level}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', flex: 1 }}>{riskSummary.rainySeasonNote}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', flex: 1 }}>{riskSummary.soilNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}
