import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Bell, Menu, TriangleAlert, CheckCircle2, CloudRain, LogOut, UserCircle, Settings2, HelpCircle } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'
import useAuthStore from '../store/useAuthStore.js'
import WeatherWidget from './WeatherWidget.jsx'

// ── Route → page name map ─────────────────────────────────────────────────────

const PAGE_NAMES = {
  '/app/dashboard':    'Command Center',
  '/app/new-analysis': 'Run Analysis',
  '/app/archive':      'Project Archive',
  '/app/report':       'Report',
  '/app/assistant':    'Site Intelligence',
  '/app/weather':      'Site Weather',
  '/app/geo':          'Ground Conditions',
  '/app/risks':        'Risk Matrix',
  '/app/profile':      'Profile',
  '/app/settings':     'Settings',
  '/app/help':         'Help & Docs',
  '/app/safety':       'Safety Monitor',
  '/app/contract':     'Contract Analyser',
  '/app/regional':     'Regional Risks',
}

// ── Notification data ─────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    text: 'High risk detected on Foundation Project',
    time: '2 hours ago',
    color: 'var(--danger)',
    bg: 'var(--danger-bg)',
    Icon: TriangleAlert,
  },
  {
    text: 'Contract analysis complete for Office Block A',
    time: 'Yesterday',
    color: 'var(--success)',
    bg: 'var(--success-bg)',
    Icon: CheckCircle2,
  },
  {
    text: 'Weather alert: Heavy rain forecast for Lagos tomorrow',
    time: '1 day ago',
    color: 'var(--warning)',
    bg: 'var(--warning-bg)',
    Icon: CloudRain,
  },
]

// ── Shared icon button style ──────────────────────────────────────────────────

function iconBtn(extra = {}) {
  return {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    ...extra,
  }
}

// ── Dropdown wrapper ──────────────────────────────────────────────────────────

function Dropdown({ children, style }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 60,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Main TopBar ───────────────────────────────────────────────────────────────

export default function TopBar({ onMenuToggle, sidebarCollapsed }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useAppStore()
  const { user, signOut } = useAuthStore()

  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const notifsRef = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const pageName = PAGE_NAMES[location.pathname] ?? 'SiteIQ'

  const initials = (() => {
    const name = user?.name || user?.email || ''
    const parts = name.split(/[\s@]/).filter(Boolean)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  })()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  const barStyle = {
    height: 'var(--topbar-height)',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    transition: 'left 0.25s ease',
  }

  return (
    <header
      className={`app-topbar ${sidebarCollapsed ? 'topbar-collapsed' : 'topbar-expanded'}`}
      style={barStyle}
    >
      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger — mobile only */}
        <button
          className="topbar-hamburger"
          onClick={onMenuToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div style={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>SiteIQ</span>
          <span style={{ color: 'var(--text-tertiary)', margin: '0 2px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{pageName}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Weather widget — only on /app routes */}
        {location.pathname.startsWith('/app') && <WeatherWidget />}

        {/* Theme toggle */}
        <button
          style={iconBtn()}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifsRef}>
          <button
            style={iconBtn()}
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false) }}
            title="Notifications"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Bell size={16} />
            {/* Red dot badge */}
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--danger)',
            }} />
          </button>

          {showNotifs && (
            <Dropdown style={{ width: '280px' }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                <button style={{ fontSize: '11px', color: 'var(--text-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </button>
              </div>

              {/* Items */}
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: n.bg,
                    color: n.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    <n.Icon size={12} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '2px' }}>
                      {n.text}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{n.time}</p>
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <button style={{ fontSize: '12px', color: 'var(--text-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View all notifications
                </button>
              </div>
            </Dropdown>
          )}
        </div>

        {/* Profile avatar */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false) }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              color: 'var(--text-accent)',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid var(--accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {initials}
          </button>

          {showProfile && (
            <Dropdown style={{ width: '220px', padding: '8px' }}>
              {/* User info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px 12px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '4px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  color: 'var(--text-accent)',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || ''}
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '20px',
                    background: 'var(--accent-dim)',
                    color: 'var(--text-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginTop: '3px',
                  }}>
                    {user?.role || 'Site Manager'}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              {[
                { label: 'Edit profile', to: '/app/profile',  Icon: UserCircle },
                { label: 'Settings',     to: '/app/settings', Icon: Settings2 },
                { label: 'Help & docs',  to: '/app/help',     Icon: HelpCircle },
              ].map(item => (
                <button
                  key={item.to}
                  onClick={() => { navigate(item.to); setShowProfile(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0 8px',
                    height: '36px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <item.Icon size={14} />
                  {item.label}
                </button>
              ))}

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0 8px',
                  height: '36px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  )
}
