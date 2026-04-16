import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'
import useAppStore from '../store/useAppStore'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

const ROLE_OPTIONS = ['Site Manager', 'Safety Officer', 'Project Engineer', 'Quantity Surveyor', 'Contracts Manager', 'Architect', 'Other']

export default function ProfilePage() {
  const { user, signOut } = useAuthStore()
  const { analyses } = useAppStore()

  const [name, setName] = useState(user?.name || '')
  const [company, setCompany] = useState(user?.company || '')
  const [role, setRole] = useState(user?.role || '')
  const [saved, setSaved] = useState(false)

  const totalAnalyses = analyses.length
  const safeCount = analyses.filter(a => (a.safetyScore ?? 0) >= 70).length
  const riskCount = analyses.filter(a => (a.safetyScore ?? 0) < 45).length
  const avgSafety = totalAnalyses > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.safetyScore ?? 0), 0) / totalAnalyses)
    : 0

  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  function handleSave(e) {
    e.preventDefault()
    // In a real app we'd call an API. Here we just show a saved banner.
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Profile
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Your account details and usage summary
        </p>
      </div>

      {/* Avatar + name strip */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--accent)', color: '#0f1114',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-display)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{name || 'Unnamed User'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email}</div>
          {role && <div style={{ fontSize: '12px', color: 'var(--text-accent)', marginTop: '4px' }}>{role}{company ? ` · ${company}` : ''}</div>}
        </div>
      </div>

      {/* Usage stats */}
      <div style={{ marginBottom: '24px' }}>
        <SectionLabel>Usage This Session</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          <StatCard label="Total Analyses" value={totalAnalyses} sub="this session" />
          <StatCard label="Safe Sites" value={safeCount} sub="score ≥ 70" />
          <StatCard label="High Risk" value={riskCount} sub="score < 45" />
          <StatCard label="Avg Safety Score" value={totalAnalyses > 0 ? avgSafety : '—'} sub={totalAnalyses > 0 ? 'across all reports' : 'no analyses yet'} />
        </div>
      </div>

      {/* Edit profile form */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <SectionLabel>Edit Profile</SectionLabel>
        {saved && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: '13px', color: 'var(--success)', marginBottom: '16px',
          }}>
            Profile saved successfully.
          </div>
        )}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              className="input"
              value={user?.email || ''}
              disabled
              style={{ width: '100%', boxSizing: 'border-box', opacity: 0.5 }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Email cannot be changed in demo mode</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Company / Firm
              </label>
              <input
                className="input"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Julius Berger"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <select
                className="input"
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select role...</option>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn" style={{ padding: '10px 24px' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: '24px', borderColor: 'var(--danger)' }}>
        <SectionLabel>Account</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Sign out</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>End your current session</div>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-md)',
              background: 'transparent', border: '1px solid var(--danger)',
              color: 'var(--danger)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
