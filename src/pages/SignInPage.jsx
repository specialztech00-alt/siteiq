import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'
import GoogleAuthButton from '../components/GoogleAuthButton.jsx'

const HardhatIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 32 32" fill="none" style={{ width: size, height: size }}>
    <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
    <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
    <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#080a0d" opacity="0.4" />
  </svg>
)

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isAuthenticated } = useAuthStore()


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/app'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    document.documentElement.classList.add('dark-page')
    return () => document.documentElement.classList.remove('dark-page')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email address is required.'); return }
    if (!password) { setError('Password is required.'); return }

    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark-page min-h-screen flex" style={{ background: '#080a0d' }}>
      {/* LEFT — photo panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-center p-12"
        style={{ background: '#040507' }}>
        {/* Photo */}
        <div className="absolute inset-0">
          <img
            src="/images/site-workers.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.25 }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,10,13,0.9) 0%, rgba(8,10,13,0.7) 100%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <HardhatIcon size={36} />
            <span className="font-heading font-bold text-2xl text-white">
              Site<span className="text-yellow-400">IQ</span>
            </span>
          </div>

          <h2 className="font-heading font-bold text-3xl text-white leading-snug mb-4">
            Protecting workers and contracts<br />
            <span style={{
              background: 'linear-gradient(135deg, #f5c400, #ff8c00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              with AI intelligence
            </span>
          </h2>

          <ul className="space-y-4 mt-8">
            {[
              'Instant hazard detection from site photos',
              'Contract risk analysis in plain English',
              'Prescriptive PM actions with deadlines',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          {/* Ambient glow */}
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,196,0,0.08), transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative">
        {/* Orb */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,196,0,0.06), transparent 70%)', transform: 'translate(30%, -30%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <HardhatIcon size={28} />
            <span className="font-heading font-bold text-xl text-white">
              Site<span className="text-yellow-400">IQ</span>
            </span>
          </div>

          <h1 className="font-heading font-bold text-4xl text-white mb-2">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>Sign in to your SiteIQ account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={`auth-input ${error && !email ? 'error' : ''}`}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-yellow-400 hover:text-yellow-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`auth-input pr-11 ${error && !password ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-yellow w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">or continue with</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Google button */}
          <GoogleAuthButton label="Sign in with Google" />

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
