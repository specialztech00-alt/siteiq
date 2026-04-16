import { useRef } from 'react'
import useAppStore from '../store/useAppStore'
import { getStateByName, getStateNames, nigeriaStates } from '../data/nigeriaStates'
import { getConstructionScore } from '../lib/geoData'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function monthIndex(name) {
  return MONTH_NAMES.indexOf(name)
}

function isInRainySeason(monthIdx, start, end) {
  const s = monthIndex(start)
  const e = monthIndex(end)
  if (s < 0 || e < 0) return false
  if (s <= e) return monthIdx >= s && monthIdx <= e
  return monthIdx >= s || monthIdx <= e
}

function isPeakMonth(monthName, peakMonthsStr) {
  return peakMonthsStr?.includes(monthName) ?? false
}

const RISK_LEVEL_VALUE = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 }

function riskBarWidth(level) {
  return { 'Very High': '100%', 'High': '75%', 'Medium': '50%', 'Low': '25%' }[level] ?? '25%'
}

function riskBarColor(level) {
  return level === 'Very High' || level === 'High'
    ? 'var(--danger)'
    : level === 'Medium'
    ? 'var(--warning)'
    : 'var(--success)'
}

function riskBadgeClass(level) {
  return level === 'Very High' || level === 'High'
    ? 'badge-danger'
    : level === 'Medium'
    ? 'badge-warning'
    : 'badge-success'
}

function bearingBadgeClass(bc) {
  const l = bc?.toLowerCase() ?? ''
  if (l.startsWith('high')) return 'badge-success'
  if (l.startsWith('low')) return 'badge-danger'
  return 'badge-warning'
}

function scoreColor(score) {
  if (score >= 8) return 'var(--success)'
  if (score >= 6) return 'var(--text-accent)'
  if (score >= 4) return 'var(--warning)'
  return 'var(--danger)'
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      marginBottom: '14px',
    }}>
      {children}
    </p>
  )
}

// ── State selector (shared) ───────────────────────────────────────────────────

function StateSelector({ value, onChange }) {
  const stateNames = getStateNames()
  return (
    <select
      className="input"
      style={{ width: '180px', flexShrink: 0 }}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {stateNames.map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  )
}

// ── State overview banner ─────────────────────────────────────────────────────

function StateOverviewBanner({ state }) {
  const { score, label, description } = getConstructionScore(state.name)

  return (
    <div className="card" style={{
      padding: '24px 28px',
      borderLeft: '4px solid var(--accent)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
      flexWrap: 'wrap',
      marginBottom: '16px',
    }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
          lineHeight: 1.1,
        }}>
          {state.name}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
          Capital: {state.capital} · {state.zone}
        </p>
        <span className="badge-accent">{state.code}</span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '48px',
          fontWeight: 700,
          color: scoreColor(score),
          lineHeight: 1,
        }}>
          {score}<span style={{ fontSize: '20px', color: 'var(--text-tertiary)' }}>/10</span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: scoreColor(score), marginTop: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
          Construction difficulty
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '260px', lineHeight: 1.5, textAlign: 'right' }}>
          {description}
        </div>
      </div>
    </div>
  )
}

// ── Soil profile diagram (CSS only) ──────────────────────────────────────────

function SoilProfileDiagram({ soil }) {
  const wt = soil.waterTable?.toLowerCase() ?? ''
  // Estimate water table position as percentage of diagram height
  let wtPercent = 70
  if (wt.includes('0.5') || wt.includes('1.0') || wt.includes('very shallow') || wt.includes('at surface')) wtPercent = 25
  else if (wt.includes('2') || wt.includes('shallow')) wtPercent = 35
  else if (wt.includes('5') || wt.includes('moderate')) wtPercent = 55
  else if (wt.includes('10') || wt.includes('15') || wt.includes('deep')) wtPercent = 75
  else if (wt.includes('25') || wt.includes('40') || wt.includes('very deep')) wtPercent = 88

  const soilColors = {
    clay: '#8B6914',
    sandy: '#C8A96E',
    sand: '#C8A96E',
    laterite: '#A0522D',
    granite: '#7A7A7A',
    alluvial: '#6B8E6B',
    loam: '#8B7355',
    peat: '#4A3728',
  }

  let midColor = '#A0522D' // default laterite
  const soilLower = soil.type?.toLowerCase() ?? ''
  for (const [key, color] of Object.entries(soilColors)) {
    if (soilLower.includes(key)) { midColor = color; break }
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
      {/* Diagram */}
      <div style={{
        width: '80px',
        height: '200px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Topsoil */}
        <div style={{ height: '15%', background: '#5C4033', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '8px', color: '#fff', fontWeight: 600, textAlign: 'center' }}>Topsoil</span>
        </div>
        {/* Main soil layer */}
        <div style={{ height: '60%', background: midColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '8px', color: '#fff', fontWeight: 600, textAlign: 'center', padding: '0 4px', lineHeight: 1.3 }}>
            {soil.type?.split(' ').slice(0, 3).join(' ')}
          </span>
        </div>
        {/* Bedrock */}
        <div style={{ height: '25%', background: '#4A4A5A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '8px', color: '#ccc', fontWeight: 600, textAlign: 'center', padding: '0 4px', lineHeight: 1.3 }}>Bedrock</span>
        </div>
        {/* Water table line */}
        <div style={{
          position: 'absolute',
          top: `${wtPercent}%`,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--info)',
          borderTop: '2px dashed var(--info)',
        }} />
        {/* Water table label */}
        <div style={{
          position: 'absolute',
          top: `${wtPercent}%`,
          right: '2px',
          transform: 'translateY(-100%)',
          fontSize: '7px',
          color: 'var(--info)',
          fontWeight: 700,
          background: 'rgba(0,0,0,0.5)',
          padding: '1px 2px',
          borderRadius: '2px',
        }}>
          WT
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
        {[
          { color: '#5C4033', label: 'Topsoil' },
          { color: midColor, label: soil.type?.split(' ').slice(0, 2).join(' ') || 'Subsoil' },
          { color: '#4A4A5A', label: 'Bedrock' },
          { color: 'var(--info)', label: 'Water table', dashed: true },
        ].map(({ color, label, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px',
              height: '3px',
              background: color,
              borderTop: dashed ? `2px dashed ${color}` : undefined,
              borderRadius: '2px',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Ground conditions card ────────────────────────────────────────────────────

function GroundConditions({ state }) {
  const { soil } = state

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
      <SectionLabel>Soil & Ground Conditions</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
        {/* Left column */}
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {soil.type}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
            {soil.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '150px' }}>Bearing capacity</span>
              <span className={bearingBadgeClass(soil.bearingCapacity)}>{soil.bearingCapacity}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '150px' }}>Water table depth</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{soil.waterTable}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '150px' }}>Foundation rec.</span>
              <span style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-accent)' }}>{soil.foundationRec}</span>
            </div>
          </div>

          {soil.specialConsiderations && (
            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--warning)',
              lineHeight: 1.5,
            }}>
              ⚠ {soil.specialConsiderations}
            </div>
          )}
        </div>

        {/* Right column: soil profile diagram */}
        <SoilProfileDiagram soil={soil} />
      </div>
    </div>
  )
}

// ── Construction risk profile ─────────────────────────────────────────────────

const RISK_ROWS = [
  { key: 'flood',       label: 'Flood Risk',     icon: null },
  { key: 'erosion',     label: 'Erosion Risk',   icon: null },
  { key: 'landslide',   label: 'Landslide Risk', icon: null },
  { key: 'extremeHeat', label: 'Extreme Heat',   icon: null },
  { key: 'harmattan',   label: 'Harmattan Dust', icon: null },
]

function RiskProfile({ state }) {
  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
      <SectionLabel>Construction Risk Profile</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {RISK_ROWS.map(({ key, label, icon }) => {
          const level = state.risks[key] ?? 'Low'
          return (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                </div>
                <span className={riskBadgeClass(level)}>{level}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: riskBarWidth(level),
                  background: riskBarColor(level),
                  borderRadius: '3px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Seasonal calendar ─────────────────────────────────────────────────────────

function SeasonalCalendar({ state }) {
  const { rainy } = state
  const currentMonth = new Date().getMonth()

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
      <SectionLabel>Seasonal Calendar</SectionLabel>

      {/* Month pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {MONTH_NAMES.map((month, i) => {
          const inRainy = isInRainySeason(i, rainy.start, rainy.end)
          const isPeak = isPeakMonth(month, rainy.peakMonths)
          const isCurrent = i === currentMonth

          let bg, color, border
          if (isPeak) {
            bg = 'rgba(59,130,246,0.25)'
            color = 'var(--info)'
            border = '1px solid var(--info)'
          } else if (inRainy) {
            bg = 'rgba(59,130,246,0.1)'
            color = 'var(--info)'
            border = '1px solid rgba(59,130,246,0.3)'
          } else {
            bg = 'rgba(217,119,6,0.1)'
            color = 'var(--warning)'
            border = '1px solid rgba(217,119,6,0.25)'
          }

          return (
            <div key={month} style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: bg,
              color,
              border,
              fontSize: '12px',
              fontWeight: isCurrent ? 700 : 500,
              outline: isCurrent ? `2px solid ${color}` : 'none',
              outlineOffset: '2px',
            }}>
              {MONTH_SHORT[i]}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[
          { color: 'rgba(217,119,6,0.5)', label: 'Ideal construction period' },
          { color: 'rgba(59,130,246,0.35)', label: 'Rainy season — plan carefully' },
          { color: 'rgba(59,130,246,0.7)', label: 'Peak rains — major works not recommended' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '6px 12px',
        alignItems: 'baseline',
        marginBottom: '14px',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Rainy season</span>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
          {rainy.start} – {rainy.end}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Peak months</span>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
          {rainy.peakMonths}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Annual rainfall</span>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
          {rainy.annualRainfallMm?.toLocaleString()} mm
        </span>
      </div>

      {/* Construction impact */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        borderLeft: '3px solid var(--accent)',
      }}>
        {rainy.constructionImpact}
      </div>
    </div>
  )
}

// ── Regulatory information ────────────────────────────────────────────────────

function RegulatoryInfo({ state }) {
  const { regulatory } = state

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
      <SectionLabel>Regulatory Requirements</SectionLabel>
      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {regulatory.body}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        {regulatory.localCode}
      </div>
      <div style={{
        padding: '12px 14px',
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        color: 'var(--text-primary)',
        lineHeight: 1.6,
      }}>
        {regulatory.notes}
      </div>
    </div>
  )
}

// ── All states quick reference ────────────────────────────────────────────────

function AllStatesGrid({ selectedState, onSelectState }) {
  const topRef = useRef(null)

  function handleSelect(name) {
    onSelectState(name)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <SectionLabel>All States Quick Reference</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
        {nigeriaStates.map(state => {
          const isSelected = state.name === selectedState
          return (
            <div
              key={state.name}
              className="card"
              onClick={() => handleSelect(state.name)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent)' : undefined,
                background: isSelected ? 'var(--accent-dim)' : undefined,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'
              }}
              onMouseLeave={e => {
                if (!isSelected) e.currentTarget.style.borderColor = ''
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--text-accent)' : 'var(--text-primary)' }}>
                  {state.name}
                </span>
                {/* Flood risk dot */}
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: state.risks.flood === 'Very High' || state.risks.flood === 'High'
                    ? 'var(--danger)'
                    : state.risks.flood === 'Medium'
                    ? 'var(--warning)'
                    : 'var(--success)',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                {state.zone}
              </div>
              <span className={bearingBadgeClass(state.soil.bearingCapacity)} style={{ fontSize: '10px' }}>
                {state.soil.bearingCapacity.split(' ')[0]} BC
              </span>
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--danger)', label: 'High/Very High flood risk' },
          { color: 'var(--warning)', label: 'Medium flood risk' },
          { color: 'var(--success)', label: 'Low flood risk' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GeoPage() {
  const { selectedState, setSelectedState } = useAppStore()
  const state = getStateByName(selectedState)

  if (!state) {
    return (
      <div style={{ padding: '28px 32px', color: 'var(--text-secondary)' }}>
        State data not found for "{selectedState}"
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-primary)',
          }}>
            Geo Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0', lineHeight: 1.5 }}>
            Ground conditions and construction risk profiles for all Nigerian states
          </p>
        </div>
        <StateSelector value={selectedState} onChange={setSelectedState} />
      </div>

      {/* State overview banner */}
      <StateOverviewBanner state={state} />

      {/* Ground conditions */}
      <GroundConditions state={state} />

      {/* Risk profile */}
      <RiskProfile state={state} />

      {/* Seasonal calendar */}
      <SeasonalCalendar state={state} />

      {/* Regulatory info */}
      <RegulatoryInfo state={state} />

      {/* All states grid */}
      <AllStatesGrid selectedState={selectedState} onSelectState={setSelectedState} />
    </div>
  )
}
