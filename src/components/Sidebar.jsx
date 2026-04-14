import { NavLink, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'

// ── Icons ────────────────────────────────────────────────────────────────────

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="6" height="6" rx="1"/>
    <rect x="10" y="2" width="6" height="6" rx="1"/>
    <rect x="2" y="10" width="6" height="6" rx="1"/>
    <rect x="10" y="10" width="6" height="6" rx="1"/>
  </svg>
)

const PlusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7"/>
    <line x1="9" y1="6" x2="9" y2="12"/>
    <line x1="6" y1="9" x2="12" y2="9"/>
  </svg>
)

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 5a2 2 0 012-2h3l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/>
  </svg>
)

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 2H4a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6l-4-4z"/>
    <polyline points="10,2 10,6 14,6"/>
    <line x1="5" y1="9" x2="13" y2="9"/>
    <line x1="5" y1="12" x2="10" y2="12"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 2L3 5v5c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L9 2z"/>
  </svg>
)

const ScalesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="9" y1="2" x2="9" y2="16"/>
    <line x1="3" y1="6" x2="15" y2="6"/>
    <path d="M3 6L1 10h4L3 6z"/>
    <path d="M15 6l-2 4h4l-2-4z"/>
    <line x1="6" y1="16" x2="12" y2="16"/>
  </svg>
)

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 2l1.5 4.5L15 8l-4.5 1.5L9 14l-1.5-4.5L3 8l4.5-1.5L9 2z"/>
    <path d="M15 13l.75 2.25L18 16l-2.25.75L15 19l-.75-2.25L12 16l2.25-.75z" opacity="0.6"/>
  </svg>
)

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 2L1 16h16L9 2z"/>
    <line x1="9" y1="8" x2="9" y2="11"/>
    <circle cx="9" cy="13.5" r="0.5" fill="currentColor"/>
  </svg>
)

const CloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 14H5a4 4 0 010-8 4.5 4.5 0 019 1 3 3 0 01-1 7z"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 2a5 5 0 015 5c0 4-5 9-5 9S4 11 4 7a5 5 0 015-5z"/>
    <circle cx="9" cy="7" r="2"/>
  </svg>
)

const MapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="1,4 6,2 12,4 17,2 17,14 12,16 6,14 1,16"/>
    <line x1="6" y1="2" x2="6" y2="14"/>
    <line x1="12" y1="4" x2="12" y2="16"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="6" r="3"/>
    <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
  </svg>
)

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="2.5"/>
    <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4"/>
  </svg>
)

const QuestionCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="7"/>
    <path d="M7 7a2 2 0 114 0c0 1-1 1.5-2 2"/>
    <circle cx="9" cy="13" r="0.5" fill="currentColor"/>
  </svg>
)

const ChevronIcon = ({ rotated }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5"
    style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
  >
    <polyline points="10,4 6,8 10,12"/>
  </svg>
)

// ── Nav data ─────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard',    icon: GridIcon,         to: '/app/dashboard' },
      { label: 'New Analysis', icon: PlusCircleIcon,   to: '/app/new-analysis' },
      { label: 'Archive',      icon: FolderIcon,       to: '/app/archive' },
      { label: 'Reports',      icon: DocumentIcon,     to: '/app/report' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Safety Monitor',    icon: ShieldIcon,   to: '/app/safety' },
      { label: 'Contract Analyser', icon: ScalesIcon,   to: '/app/contract' },
      { label: 'AI Assistant',      icon: SparklesIcon, to: '/app/assistant' },
      { label: 'Risk Register',     icon: WarningIcon,  to: '/app/risks' },
    ],
  },
  {
    label: 'Location',
    items: [
      { label: 'Site Weather',     icon: CloudIcon,  to: '/app/weather' },
      { label: 'Geo Intelligence', icon: MapPinIcon, to: '/app/geo' },
      { label: 'Regional Risks',   icon: MapIcon,    to: '/app/regional' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',   icon: PersonIcon,        to: '/app/profile' },
      { label: 'Settings',  icon: GearIcon,          to: '/app/settings' },
      { label: 'Help',      icon: QuestionCircleIcon, to: '/app/help' },
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
        <span style={{ flexShrink: 0, width: '18px', height: '18px', display: 'flex' }}>
          <item.icon />
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

  return (
    <>
      {/* Desktop sidebar */}
      <div style={s.sidebar(collapsed)} className="sidebar-desktop">
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.iconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17h18v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
              <path d="M12 3C8 3 5 6 5 10v1h14v-1c0-4-3-7-7-7z"/>
              <path d="M3 13h18v3H3v-3z" opacity="0.7"/>
            </svg>
          </div>
          <span style={s.logoText(collapsed)}>SiteIQ</span>
          <button style={s.toggleBtn} onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <ChevronIcon rotated={!collapsed} />
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17h18v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
              <path d="M12 3C8 3 5 6 5 10v1h14v-1c0-4-3-7-7-7z"/>
              <path d="M3 13h18v3H3v-3z" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            SiteIQ
          </span>
          <button style={{ ...s.toggleBtn, marginLeft: 'auto' }} onClick={onMobileClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="3" x2="13" y2="13"/>
              <line x1="13" y1="3" x2="3" y2="13"/>
            </svg>
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
