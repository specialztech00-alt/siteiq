import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import useAuthStore from '../store/useAuthStore.js'
import CircularScore from '../components/CircularScore.jsx'
import StarRating from '../components/StarRating.jsx'
import { useWeather } from '../components/WeatherWidget.jsx'
import { getConstructionScore, getRegionalRiskSummary, getFloodRiskAdvice } from '../lib/geoData.js'

// ── Static demo data ──────────────────────────────────────────────────────────

const RECENT_ANALYSES = [
  {
    id: 'SITEIQ-A1B2C3',
    projectName: 'Foundation Block — Phase 1',
    location: 'Lagos',
    date: '12 Apr 2026',
    safetyScore: 74,
    contractScore: 81,
    status: 'Complete',
  },
  {
    id: 'SITEIQ-D4E5F6',
    projectName: 'Office Complex — Structural',
    location: 'Abuja (FCT)',
    date: '10 Apr 2026',
    safetyScore: 42,
    contractScore: 68,
    status: 'Complete',
  },
  {
    id: 'SITEIQ-G7H8I9',
    projectName: 'Residential Estate — Block C',
    location: 'Rivers',
    date: '8 Apr 2026',
    safetyScore: 88,
    contractScore: 92,
    status: 'Complete',
  },
  {
    id: 'SITEIQ-J0K1L2',
    projectName: 'Industrial Shed — Kano North',
    location: 'Kano',
    date: '5 Apr 2026',
    safetyScore: 31,
    contractScore: 55,
    status: 'Complete',
  },
]

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

function QuickAction({ icon, label, to, color }) {
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
      <span style={{ fontSize: '20px' }}>{icon}</span>
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

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedState, reportData } = useAppStore()

  const firstName = (user?.name || user?.email || 'there').split(/[\s@]/)[0]
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const geoScore = getConstructionScore(selectedState)
  const riskSummary = getRegionalRiskSummary(selectedState)
  const floodAdvice = getFloodRiskAdvice(selectedState)

  const avgSafety = Math.round(RECENT_ANALYSES.reduce((s, a) => s + a.safetyScore, 0) / RECENT_ANALYSES.length)
  const avgContract = Math.round(RECENT_ANALYSES.reduce((s, a) => s + a.contractScore, 0) / RECENT_ANALYSES.length)

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Good {getGreeting()}, {firstName}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{dateStr}</p>
        </div>

        <button
          onClick={() => navigate('/app/new-analysis')}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
          </svg>
          New Analysis
        </button>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <StatCard label="Analyses Run" value={RECENT_ANALYSES.length} sub="This month" />
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

          {RECENT_ANALYSES.map((a, i) => {
            const combined = a.safetyScore + a.contractScore  // 0–200 for StarRating
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 20px',
                  borderBottom: i < RECENT_ANALYSES.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate('/app/report')}
              >
                {/* Safety circle */}
                <CircularScore score={a.safetyScore} size={48} showLabel={false} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.projectName}
                    </span>
                    {statusBadge(a.status)}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    {a.location} · {a.date} · {a.id}
                  </p>
                  <StarRating score={combined} size={12} />
                </div>

                {/* Contract score pill */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Contract</p>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: a.contractScore >= 70 ? 'var(--success)' : a.contractScore >= 45 ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {a.contractScore}
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
                <span style={{ fontSize: '14px' }}>
                  {floodAdvice.level === 'Very High' || floodAdvice.level === 'High' ? '🌊' : floodAdvice.level === 'Medium' ? '⚠️' : '✓'}
                </span>
                <p style={{ fontSize: '12px', fontWeight: 600, color: riskColor(floodAdvice.level) }}>
                  Flood Risk: {floodAdvice.level}
                </p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{floodAdvice.action}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <p className="section-label" style={{ marginBottom: '10px' }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <QuickAction icon="🔍" label="New Analysis" to="/app/new-analysis" color="var(--accent)" />
          <QuickAction icon="🛡️" label="Safety Monitor" to="/app/safety" color="var(--warning)" />
          <QuickAction icon="📄" label="Contract Analyser" to="/app/contract" color="var(--accent)" />
          <QuickAction icon="🤖" label="AI Assistant" to="/app/assistant" color="var(--success)" />
          <QuickAction icon="🌦️" label="Site Weather" to="/app/weather" color="var(--accent)" />
          <QuickAction icon="🗺️" label="Geo Intelligence" to="/app/geo" color="var(--accent)" />
          <QuickAction icon="⚠️" label="Risk Register" to="/app/risks" color="var(--danger)" />
          <QuickAction icon="📁" label="Archive" to="/app/archive" color="var(--text-secondary)" />
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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
