import { useState } from 'react'
import useAuthStore from '../store/useAuthStore.js'
import { isSupabaseConfigured } from '../lib/supabase.js'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
  </svg>
)

export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const disabled = !isSupabaseConfigured

  async function handleClick() {
    if (disabled || loading) return
    setLoading(true)
    setError('')
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If no error, Supabase redirects to Google — loading stays true until navigation
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        title={disabled ? 'Enable Supabase to use Google sign in' : undefined}
        style={{
          width: '100%',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md, 8px)',
          background: '#ffffff',
          border: '1px solid var(--border, #e2e5ea)',
          color: 'var(--text-primary, #0f1114)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          opacity: disabled ? 0.5 : 1,
          transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
        }}
        onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.background = 'var(--bg-card-hover, #f8f9fb)'; e.currentTarget.style.borderColor = 'var(--border-hover, #c8cdd6)' } }}
        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'var(--border, #e2e5ea)' }}
        onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.98)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {loading ? <SpinnerIcon /> : <GoogleIcon />}
        <span>{loading ? 'Redirecting to Google…' : label}</span>
      </button>
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--danger, #b91c1c)', marginTop: '6px', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
