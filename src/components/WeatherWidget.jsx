import { useState, useEffect, useRef } from 'react'
import { Thermometer, AlertTriangle } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'
import { getStateByName, getStateNames } from '../data/nigeriaStates.js'
import {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherIcon,
  getWeatherDescription,
  getConstructionSafetyRating,
} from '../lib/weather.js'

// ── useWeather hook ───────────────────────────────────────────────────────────

export function useWeather(stateName) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!stateName) return
    const state = getStateByName(stateName)
    if (!state) { setError('State not found'); setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetch() {
      try {
        const [curr, fore] = await Promise.all([
          getCurrentWeather(state.lat, state.lng),
          getWeatherForecast(state.lat, state.lng),
        ])
        if (!cancelled) {
          setWeather(curr)
          setForecast(fore)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetch()
    const interval = setInterval(fetch, 30 * 60 * 1000) // refresh every 30 min
    return () => { cancelled = true; clearInterval(interval) }
  }, [stateName])

  return { weather, forecast, loading, error }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safetyColor(rating) {
  if (rating === 'Danger') return 'var(--danger)'
  if (rating === 'Caution') return 'var(--warning)'
  return 'var(--success)'
}

function safetyBg(rating) {
  if (rating === 'Danger') return 'var(--danger-bg)'
  if (rating === 'Caution') return 'var(--warning-bg)'
  return 'var(--success-bg)'
}

function safetyLabel(rating) {
  if (rating === 'Danger') return 'Suspend operations'
  if (rating === 'Caution') return 'Use caution'
  return 'Safe to work'
}

function WindDirection({ deg }) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return <span>{dirs[Math.round(deg / 45) % 8]}</span>
}

function Skeleton({ width = '100%', height = '14px', radius = '4px' }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background: 'var(--border)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

// ── WeatherWidget ─────────────────────────────────────────────────────────────

export default function WeatherWidget() {
  const { selectedState, setSelectedState } = useAppStore()
  const { weather, loading, error } = useWeather(selectedState)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const stateNames = getStateNames()
  const safety = weather ? getConstructionSafetyRating(weather) : null

  // ── Collapsed pill ────────────────────────────────────────────────────────

  const pill = (
    <button
      onClick={() => setOpen(v => !v)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '0 10px',
        height: '32px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      title={`Weather: ${selectedState}`}
    >
      {loading ? (
        <Thermometer size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
      ) : error ? (
        <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
      ) : (
        <>
          <span style={{ fontSize: '14px' }}>{getWeatherIcon(weather.weathercode)}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {Math.round(weather.temperature_2m)}°C
          </span>
        </>
      )}
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
        {selectedState.replace(' (FCT)', '')}
      </span>
    </button>
  )

  // ── Expanded dropdown ─────────────────────────────────────────────────────

  const panel = open && (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '280px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: '16px',
      zIndex: 60,
    }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton height="12px" width="60%" />
          <Skeleton height="36px" width="40%" />
          <Skeleton height="12px" width="80%" />
          <Skeleton height="12px" width="70%" />
          <Skeleton height="12px" width="50%" />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '10px' }}>
            Weather data unavailable
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontSize: '12px',
              color: 'var(--text-accent)',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Current conditions
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedState}</p>
          </div>

          {/* Temperature */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {Math.round(weather.temperature_2m)}°C
            </span>
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>{getWeatherIcon(weather.weathercode)}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Feels like {Math.round(weather.apparent_temperature)}°C · {getWeatherDescription(weather.weathercode)}
          </p>

          {/* Detail grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
            marginBottom: '12px', padding: '10px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
          }}>
            {[
              { label: 'Wind', value: `${Math.round(weather.windspeed_10m)} km/h`, extra: <WindDirection deg={weather.winddirection_10m} /> },
              { label: 'Humidity', value: `${weather.relative_humidity_2m}%` },
              { label: 'Precipitation', value: `${weather.precipitation}mm` },
              { label: 'UV Index', value: weather.uv_index ?? 'N/A' },
            ].map(({ label, value, extra }) => (
              <div key={label}>
                <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {value}{extra && <> <span style={{ fontSize: '11px' }}>{extra}</span></>}
                </p>
              </div>
            ))}
          </div>

          {/* Safety rating */}
          {safety && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 10px', borderRadius: 'var(--radius-md)',
              background: safetyBg(safety.rating),
              marginBottom: safety.alerts.length > 0 ? '8px' : '12px',
            }}>
              <span style={{
                display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: safetyColor(safety.rating),
              }} />
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: safetyColor(safety.rating) }}>
                  {safetyLabel(safety.rating)}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Construction safety status</p>
              </div>
            </div>
          )}

          {/* Alerts */}
          {safety?.alerts.map((alert, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 'var(--radius-md)',
              background: alert.level === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
              marginBottom: '6px', fontSize: '11px',
              color: alert.level === 'danger' ? 'var(--danger)' : 'var(--warning)',
              lineHeight: 1.4,
            }}>
              {alert.message}
            </div>
          ))}

          {/* View full forecast link */}
          <a
            href="/app/weather"
            onClick={e => { e.preventDefault(); setOpen(false); window.location.href = '/app/weather' }}
            style={{
              display: 'block', fontSize: '12px', color: 'var(--text-accent)',
              textDecoration: 'none', marginBottom: '12px',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            View full 7-day forecast →
          </a>

          {/* State selector */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Change state
            </p>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                padding: '6px 10px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {stateNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {pill}
      {panel}
    </div>
  )
}
