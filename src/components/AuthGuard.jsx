import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'

export default function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isLoading       = useAuthStore(s => s.isLoading)
  const authError       = useAuthStore(s => s.authError)
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: 16,
      }}>
        <svg viewBox="0 0 32 32" fill="none" style={{ width: 44, height: 44 }}>
          <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
          <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
          <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#080a0d" opacity="0.4" />
        </svg>
        <svg style={{ width: 24, height: 24, color: 'var(--accent)', animation: 'spin 1s linear infinite' }}
          fill="none" viewBox="0 0 24 24">
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Loading your workspace…</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: 'var(--bg-primary)',
        textAlign: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: 24, height: 24, color: 'var(--danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Authentication error</h2>
          <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{authError}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/signin" style={{
            padding: '9px 20px', borderRadius: 8,
            background: 'var(--accent)', color: '#080a0d',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>
            Sign in again
          </a>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '9px 20px', borderRadius: 8,
              background: 'transparent', color: 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13,
              border: '1px solid var(--border)', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}
