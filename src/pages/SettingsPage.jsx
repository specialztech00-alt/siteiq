import { useState } from 'react'
import useAppStore from '../store/useAppStore'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '40px', height: '22px', borderRadius: '11px',
        background: checked ? 'var(--accent)' : 'var(--border)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0, padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: checked ? '#0f1114' : 'var(--text-tertiary)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Abuja (FCT)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
  'Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau',
  'Rivers','Sokoto','Taraba','Yobe','Zamfara'
]

export default function SettingsPage() {
  const { theme, toggleTheme, selectedState, setSelectedState, analyses, clearAll } = useAppStore()

  const [notifWeather, setNotifWeather] = useState(() => localStorage.getItem('siteiq-notif-weather') !== 'false')
  const [notifRisk, setNotifRisk] = useState(() => localStorage.getItem('siteiq-notif-risk') !== 'false')
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('siteiq-autosave') !== 'false')
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)

  function handleToggleNotif(key, val, setter) {
    localStorage.setItem(key, String(val))
    setter(val)
  }

  function handleExport() {
    const data = JSON.stringify({ exportedAt: new Date().toISOString(), analyses }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `siteiq-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClearData() {
    if (!confirmClear) { setConfirmClear(true); return }
    clearAll()
    localStorage.removeItem('siteiq-risk-statuses')
    setConfirmClear(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Customise SiteIQ to your preferences
        </p>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Appearance</SectionLabel>
        <SettingRow label="Dark Mode" desc="Switch between dark and light themes">
          <ToggleSwitch checked={theme === 'dark'} onChange={() => toggleTheme()} />
        </SettingRow>
        <div style={{ borderBottom: 'none' }}>
          <SettingRow label="Default State" desc="Pre-selected Nigerian state for weather and geo intelligence">
            <select
              className="input"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={{ fontSize: '13px', padding: '6px 10px' }}
            >
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </SettingRow>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Notifications</SectionLabel>
        <SettingRow label="Weather Alerts" desc="Get notified when conditions change for your selected state">
          <ToggleSwitch
            checked={notifWeather}
            onChange={v => handleToggleNotif('siteiq-notif-weather', v, setNotifWeather)}
          />
        </SettingRow>
        <div style={{ borderBottom: 'none' }}>
          <SettingRow label="High Risk Warnings" desc="Alert when a new analysis returns a safety score below 45">
            <ToggleSwitch
              checked={notifRisk}
              onChange={v => handleToggleNotif('siteiq-notif-risk', v, setNotifRisk)}
            />
          </SettingRow>
        </div>
      </div>

      {/* Analysis defaults */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Analysis</SectionLabel>
        <div style={{ borderBottom: 'none' }}>
          <SettingRow label="Auto-save Reports" desc="Automatically save every completed analysis to the archive">
            <ToggleSwitch
              checked={autoSave}
              onChange={v => { localStorage.setItem('siteiq-autosave', String(v)); setAutoSave(v) }}
            />
          </SettingRow>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Data & Privacy</SectionLabel>
        <SettingRow label="Export All Data" desc={`${analyses.length} saved ${analyses.length === 1 ? 'analysis' : 'analyses'} — download as JSON`}>
          <button
            onClick={handleExport}
            disabled={analyses.length === 0}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: analyses.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
              fontSize: '13px', fontWeight: 600, cursor: analyses.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Export JSON
          </button>
        </SettingRow>
        <div style={{ borderBottom: 'none' }}>
          <SettingRow
            label="Clear All Data"
            desc="Remove all saved analyses and reset risk statuses. This cannot be undone."
          >
            {cleared ? (
              <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>Cleared</span>
            ) : (
              <button
                onClick={handleClearData}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-md)',
                  background: confirmClear ? 'var(--danger)' : 'transparent',
                  border: '1px solid var(--danger)',
                  color: confirmClear ? '#fff' : 'var(--danger)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {confirmClear ? 'Confirm Clear' : 'Clear Data'}
              </button>
            )}
          </SettingRow>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ padding: '20px' }}>
        <SectionLabel>About</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['Version', '1.0.0'],
            ['AI Engine', 'Claude claude-sonnet-4-6 (Anthropic)'],
            ['Vision Engine', 'DETR (Hugging Face)'],
            ['Weather Data', 'Open-Meteo API'],
            ['Platform', 'React + Vite'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>{k}</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
