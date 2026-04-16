import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wind, Droplets, CloudRain, Thermometer, Flag, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { useWeather } from '../components/WeatherWidget'
import { getStateByName, getStateNames } from '../data/nigeriaStates'
import {
  getCurrentWeather,
  getWeatherIcon,
  getWeatherDescription,
  getConstructionSafetyRating,
  getDailyConstructionRating,
  getOperationImpact,
} from '../lib/weather'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function windDir(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

function uvLabel(uv) {
  if (uv == null) return 'N/A'
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

function getDayName(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function getShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTHS_SHORT[m - 1]}`
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = '14px', radius = '4px', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'var(--border)',
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
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
      marginBottom: '12px',
    }}>
      {children}
    </p>
  )
}

// ── Safety rating banner ──────────────────────────────────────────────────────

function SafetyBanner({ weather }) {
  const { rating, alerts } = getConstructionSafetyRating(weather)

  const cfg = {
    Safe: {
      bg: 'var(--success-bg)',
      border: 'var(--success)',
      color: 'var(--success)',
      Icon: CheckCircle2,
      title: 'Safe working conditions',
      body: 'Current weather poses no significant construction hazards.',
    },
    Caution: {
      bg: 'var(--warning-bg)',
      border: 'var(--warning)',
      color: 'var(--warning)',
      Icon: AlertTriangle,
      title: 'Exercise caution on site',
    },
    Danger: {
      bg: 'var(--danger-bg)',
      border: 'var(--danger)',
      color: 'var(--danger)',
      Icon: XCircle,
      title: 'Hazardous conditions — review operations',
    },
  }[rating]

  return (
    <div style={{
      marginTop: '20px',
      padding: '16px 18px',
      background: cfg.bg,
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: alerts.length ? '10px' : 0 }}>
        <cfg.Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: cfg.color }}>{cfg.title}</span>
      </div>
      {rating === 'Safe' && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{cfg.body}</p>
      )}
      {alerts.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {alerts.map((a, i) => (
            <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {a.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Current conditions card ───────────────────────────────────────────────────

function CurrentConditions({ weather, loading, error, stateName }) {
  return (
    <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton height="18px" width="40%" />
          <Skeleton height="52px" width="120px" />
          <Skeleton height="14px" width="60%" />
          <Skeleton height="14px" width="50%" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} height="40px" />)}
          </div>
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--danger)', fontSize: '14px' }}>
          ⚠ Could not load weather data — {error}
        </div>
      )}
      {!loading && !error && weather && (
        <>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {/* Left panel */}
            <div style={{ flex: '0 0 auto', minWidth: '160px' }}>
              <div style={{ fontSize: '48px', lineHeight: 1, marginBottom: '8px' }}>
                {getWeatherIcon(weather.weathercode)}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {Math.round(weather.temperature_2m)}°C
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Feels like {Math.round(weather.apparent_temperature)}°C
              </div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '6px' }}>
                {getWeatherDescription(weather.weathercode)}
              </div>
              <div style={{ marginTop: '10px' }}>
                <span className="badge-accent">{stateName}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Updated just now
              </div>
            </div>

            {/* Right panel — 2x3 stats grid */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              alignContent: 'start',
            }}>
              {[
                {
                  label: 'Wind',
                  value: `${Math.round(weather.windspeed_10m)} km/h`,
                  sub: windDir(weather.winddirection_10m),
                  Icon: Wind,
                },
                {
                  label: 'Humidity',
                  value: `${weather.relative_humidity_2m}%`,
                  Icon: Droplets,
                },
                {
                  label: 'Precipitation',
                  value: `${weather.precipitation} mm`,
                  Icon: CloudRain,
                },
                {
                  label: 'UV Index',
                  value: weather.uv_index ?? 'N/A',
                  sub: uvLabel(weather.uv_index),
                  Icon: Flag,
                },
                {
                  label: 'Feels Like',
                  value: `${Math.round(weather.apparent_temperature)}°C`,
                  Icon: Thermometer,
                },
              ].map(({ label, value, sub, Icon }) => (
                <div key={label} style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}>
                  <div style={{ marginBottom: '4px', color: 'var(--text-tertiary)' }}><Icon size={16} /></div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
                  {sub && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>{sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Safety banner */}
          <SafetyBanner weather={weather} />
        </>
      )}
    </div>
  )
}

// ── 7-day forecast ────────────────────────────────────────────────────────────

function ForecastRow({ forecast, loading }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <SectionLabel>7-Day Forecast</SectionLabel>
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {loading
          ? Array(7).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ padding: '14px', minWidth: '100px', flex: '1 0 100px' }}>
              <Skeleton height="12px" width="70%" style={{ marginBottom: '6px' }} />
              <Skeleton height="12px" width="50%" style={{ marginBottom: '10px' }} />
              <Skeleton height="28px" width="28px" radius="50%" style={{ marginBottom: '8px' }} />
              <Skeleton height="18px" width="60%" style={{ marginBottom: '4px' }} />
              <Skeleton height="12px" width="50%" />
            </div>
          ))
          : forecast && forecast.time.map((dateStr, i) => {
            const dayData = {
              temperature_2m_max: forecast.temperature_2m_max[i],
              temperature_2m_min: forecast.temperature_2m_min[i],
              precipitation_sum: forecast.precipitation_sum[i],
              weathercode: forecast.weathercode[i],
              windspeed_10m_max: forecast.windspeed_10m_max[i],
              precipitation_probability_max: forecast.precipitation_probability_max[i],
            }
            const rating = getDailyConstructionRating(dayData)
            const isToday = i === 0

            return (
              <div key={dateStr} className="card" style={{
                padding: '14px',
                minWidth: '108px',
                flex: '1 0 108px',
                border: isToday ? '1px solid var(--accent)' : undefined,
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: isToday ? 'var(--text-accent)' : 'var(--text-primary)', marginBottom: '2px' }}>
                  {isToday ? 'Today' : getDayName(dateStr)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  {getShortDate(dateStr)}
                </div>
                <div style={{ fontSize: '26px', marginBottom: '8px', lineHeight: 1 }}>
                  {getWeatherIcon(dayData.weathercode)}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {Math.round(dayData.temperature_2m_max)}°C
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {Math.round(dayData.temperature_2m_min)}°C
                </div>
                <div style={{ fontSize: '11px', color: 'var(--info)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Droplets size={10} /> {dayData.precipitation_probability_max ?? 0}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Wind size={10} /> {Math.round(dayData.windspeed_10m_max)} km/h
                </div>
                <span className={`badge-${rating.color}`} style={{ fontSize: '10px' }}>
                  {rating.label}
                </span>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

// ── Operations impact table ───────────────────────────────────────────────────

function OperationsImpact({ forecast, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Operations Impact Today</SectionLabel>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <Skeleton height="14px" width="40%" />
            <Skeleton height="24px" width="80px" />
          </div>
        ))}
      </div>
    )
  }
  if (!forecast) return null

  const todayData = {
    precipitation_sum: forecast.precipitation_sum[0],
    temperature_2m_max: forecast.temperature_2m_max[0],
    windspeed_10m_max: forecast.windspeed_10m_max[0],
    weathercode: forecast.weathercode[0],
  }

  const impact = getOperationImpact(todayData)
  const operations = Object.values(impact)

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
      <SectionLabel>Operations Impact Today</SectionLabel>
      <div>
        {operations.map((op, i) => (
          <div key={op.name} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 0',
            borderBottom: i < operations.length - 1 ? '1px solid var(--border)' : 'none',
            gap: '12px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {op.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{op.note}</div>
            </div>
            <span className={op.safe ? 'badge-success' : 'badge-danger'} style={{ flexShrink: 0 }}>
              {op.safe ? 'Go ahead' : 'Suspend'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── State comparison ──────────────────────────────────────────────────────────

const COMPARISON_STATES = [
  { display: 'Lagos', stateName: 'Lagos' },
  { display: 'Abuja', stateName: 'Abuja (FCT)' },
  { display: 'Kano', stateName: 'Kano' },
  { display: 'Port Harcourt', stateName: 'Rivers' },
  { display: 'Ibadan', stateName: 'Oyo' },
  { display: 'Enugu', stateName: 'Enugu' },
]

function StateComparison() {
  const [temps, setTemps] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetchAll() {
      const results = await Promise.allSettled(
        COMPARISON_STATES.map(async ({ stateName }) => {
          const state = getStateByName(stateName)
          if (!state) return { stateName, temp: null }
          const w = await getCurrentWeather(state.lat, state.lng)
          return { stateName, temp: Math.round(w.temperature_2m), code: w.weathercode }
        })
      )
      if (cancelled) return
      const map = {}
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          map[r.value.stateName] = { temp: r.value.temp, code: r.value.code }
        }
      })
      setTemps(map)
      setLoading(false)
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ marginBottom: '20px' }}>
      <SectionLabel>Major States Comparison</SectionLabel>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', marginTop: '-8px' }}>
        Current temperature overview
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {COMPARISON_STATES.map(({ display, stateName }) => {
          const data = temps[stateName]
          return (
            <div key={stateName} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '6px', color: 'var(--text-tertiary)' }}>🇳🇬</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {display}
              </div>
              {loading || !data ? (
                <Skeleton height="20px" width="60%" style={{ margin: '0 auto' }} />
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {data.temp}°C
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '2px' }}>
                    {getWeatherIcon(data.code)}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WeatherPage() {
  const { selectedState, setSelectedState } = useAppStore()
  const { weather, forecast, loading, error } = useWeather(selectedState)
  const stateNames = getStateNames()

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Site Weather Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
            Construction safety ratings for Nigerian sites
          </p>
        </div>
        <select
          className="input"
          style={{ width: '180px', flexShrink: 0 }}
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
        >
          {stateNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Current conditions */}
      <CurrentConditions
        weather={weather}
        forecast={forecast}
        loading={loading}
        error={error}
        stateName={selectedState}
      />

      {/* 7-day forecast */}
      <ForecastRow forecast={forecast} loading={loading} />

      {/* Operations impact */}
      <OperationsImpact forecast={forecast} loading={loading} />

      {/* State comparison */}
      <StateComparison />
    </div>
  )
}
