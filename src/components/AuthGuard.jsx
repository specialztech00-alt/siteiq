import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore(s => ({
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading,
  }))
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
        gap: '16px',
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
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Loading your workspace…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}
