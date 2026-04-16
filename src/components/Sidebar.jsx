import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ScanLine,
  Archive,
  FileBarChart,
  HardHat,
  ScrollText,
  Sparkles,
  ShieldAlert,
  CloudSun,
  Globe,
  Map,
  UserCircle,
  Settings2,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore.js'

// ── Nav data ─────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { label: 'Command Center', icon: LayoutDashboard, to: '/app/dashboard' },
      { label: 'Run Analysis',   icon: ScanLine,        to: '/app/new-analysis' },
      { label: 'Project Archive',icon: Archive,         to: '/app/archive' },
      { label: 'Reports',        icon: FileBarChart,    to: '/app/report' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Safety Monitor',    icon: HardHat,    to: '/app/safety' },
      { label: 'Contract Analyser', icon: ScrollText, to: '/app/contract' },
      { label: 'Site Intelligence', icon: Sparkles,   to: '/app/assistant' },
      { label: 'Risk Matrix',       icon: ShieldAlert,to: '/app/risks' },
    ],
  },
  {
    label: 'Location',
    items: [
      { label: 'Site Weather',      icon: CloudSun, to: '/app/weather' },
      { label: 'Ground Conditions', icon: Globe,    to: '/app/geo' },
      { label: 'Regional Risks',    icon: Map,      to: '/app/regional' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',  icon: UserCircle, to: '/app/profile' },
      { label: 'Settings', icon: Settings2,  to: '/app/settings' },
      { label: 'Help',     icon: HelpCircle, to: '/app/help' },
    ],
  },
]

// ── Styles (CSS-in-JS objects for var() usage) ────────────────────────────────

const s = {
  sidebar: (collapsed) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    transition: 'width 0.25s ease',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
  }),
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    minHeight: 'var(--topbar-height)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent)',
    color: '#0f1114',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: (collapsed) => ({
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    opacity: collapsed ? 0 : 1,
    width: collapsed ? 0 : 'auto',
    transition: 'opacity 0.2s ease, width 0.25s ease',
    flexShrink: 0,
  }),
  toggleBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: 'var(--radius-sm)',
    flexShrink: 0,
  },
  nav: {
    flex: 1,
    padding: '8px 0',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  sectionLabel: (collapsed) => ({
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-tertiary)',
    padding: '16px 16px 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    opacity: collapsed ? 0 : 1,
    height: collapsed ? 0 : 'auto',
    transition: 'opacity 0.2s ease, height 0.2s ease',
  }),
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '12px 16px',
    flexShrink: 0,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    color: 'var(--text-accent)',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}

// ── NavItem component ─────────────────────────────────────────────────────────

function NavItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === item.to ||
    (item.to === '/app/report' && location.pathname.startsWith('/app/report'))

  const Icon = item.icon

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: isActive ? '9px 14px 9px 12px' : '9px 14px',
    margin: '1px 8px',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-dim)' : 'transparent',
    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative',
  }

  return (
    <div style={{ position: 'relative' }} className="nav-item-wrapper">
      <NavLink to={item.to} style={baseStyle} className="sidebar-nav-item">
        <span style={{ flexShrink: 0, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} />
        </span>
        <span style={{
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 'auto',
          overflow: 'hidden',
          transition: 'opacity 0.2s ease, width 0.25s ease',
          whiteSpace: 'nowrap',
        }}>
          {item.label}
        </span>
      </NavLink>
      {collapsed && (
        <div className="sidebar-tooltip">{item.label}</div>
      )}
    </div>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useAuthStore()

  const initials = (() => {
    const name = user?.name || user?.email || ''
    const parts = name.split(/[\s@]/).filter(Boolean)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  })()

  // Mobile overlay sidebar
  const mobileStyle = {
    position: 'fixed',
    top: 0,
    left: mobileOpen ? 0 : '-100%',
    bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    transition: 'left 0.25s ease',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
  }

  const LogoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17h18v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
      <path d="M12 3C8 3 5 6 5 10v1h14v-1c0-4-3-7-7-7z"/>
      <path d="M3 13h18v3H3v-3z" opacity="0.7"/>
    </svg>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div style={s.sidebar(collapsed)} className="sidebar-desktop">
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.iconBox}>
            <LogoIcon />
          </div>
          <span style={s.logoText(collapsed)}>SiteIQ</span>
          <button style={s.toggleBtn} onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed
              ? <PanelLeftOpen size={16} />
              : <PanelLeftClose size={16} />
            }
          </button>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div style={s.sectionLabel(collapsed)}>{section.label}</div>
              {section.items.map(item => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={s.footer}>
          <div style={s.userRow}>
            <div style={s.avatar}>{initials}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || user?.email || 'User'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {user?.role || 'Site Manager'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div style={mobileStyle} className="sidebar-mobile">
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.iconBox}>
            <LogoIcon />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            SiteIQ
          </span>
          <button style={{ ...s.toggleBtn, marginLeft: 'auto' }} onClick={onMobileClose}>
            <X size={16} />
          </button>
        </div>

        <nav style={s.nav}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', padding: '16px 16px 4px' }}>
                {section.label}
              </div>
              {section.items.map(item => (
                <NavItem key={item.to} item={item} collapsed={false} />
              ))}
            </div>
          ))}
        </nav>

        <div style={s.footer}>
          <div style={s.userRow}>
            <div style={s.avatar}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || user?.email || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {user?.role || 'Site Manager'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
