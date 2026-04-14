import { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

const COLLAPSED_KEY = 'siteiq-sidebar-collapsed'

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === 'true'
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleToggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, String(next))
  }

  function handleMobileToggle() {
    setMobileOpen(v => !v)
  }

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const sidebarWidth = collapsed
    ? 'var(--sidebar-collapsed)'
    : 'var(--sidebar-width)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* TopBar */}
      <TopBar
        onMenuToggle={handleMobileToggle}
        sidebarCollapsed={collapsed}
      />

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 45,
          }}
        />
      )}

      {/* Main content */}
      <main
        className="app-content"
        style={{
          marginLeft: sidebarWidth,
          marginTop: 'var(--topbar-height)',
          minHeight: 'calc(100vh - var(--topbar-height))',
          padding: '24px',
          transition: 'margin-left 0.25s ease',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>

      {/* Inline responsive CSS */}
      <style>{`
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .app-content {
            margin-left: 0 !important;
          }
          .app-topbar {
            left: 0 !important;
          }
          .topbar-hamburger {
            display: flex !important;
          }
        }
        @media (min-width: 768px) {
          .sidebar-mobile { display: none !important; }
          .topbar-hamburger { display: none !important; }
          .app-topbar.topbar-expanded {
            left: var(--sidebar-width) !important;
          }
          .app-topbar.topbar-collapsed {
            left: var(--sidebar-collapsed) !important;
          }
        }
        .sidebar-nav-item:hover {
          background: var(--bg-card) !important;
          color: var(--text-primary) !important;
        }
        .sidebar-tooltip {
          display: none;
          position: absolute;
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          box-shadow: var(--shadow);
          z-index: 100;
          pointer-events: none;
        }
        .nav-item-wrapper:hover .sidebar-tooltip {
          display: block;
        }
      `}</style>
    </div>
  )
}
