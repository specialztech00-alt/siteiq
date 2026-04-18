import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'
import GoogleAuthButton from '../components/GoogleAuthButton.jsx'

const HardhatIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 32 32" fill="none" style={{ width: size, height: size }}>
    <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
    <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
    <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#080a0d" opacity="0.4" />
  </svg>
)

function PasswordStrength({ password }) {
  const score = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 6) s++
    if (password.length >= 10) s++
    if (/[0-9]/.test(password)) s++
    if (/[^a-zA-Z0-9]/.test(password)) s++
    return s
  })()

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : '#1e2530' }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] || '#6b7280' }}>
        {labels[score] || ''}
      </p>
    </div>
  )
}

const ROLES = [
  'Site Manager',
  'Project Manager',
  'HSE Officer',
  'Contracts Manager',
  'Director',
  'Other',
]

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, isAuthenticated } = useAuthStore()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    company: '', role: '', agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    document.documentElement.classList.add('dark-page')
    return () => document.documentElement.classList.remove('dark-page')
  }, [])

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setFieldErrors(e => ({ ...e, [field]: undefined }))
    setError('')
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.agreeTerms) errs.agreeTerms = 'You must agree to the terms'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setLoading(true)
    setError('')
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        company: form.company.trim() || null,
        role: form.role || null,
      })
      setSuccess(true)
      setTimeout(() => navigate('/app', { replace: true }), 1400)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="dark-page min-h-screen flex items-center justify-center" style={{ background: '#080a0d' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-2xl text-white mb-2">Account created!</h2>
          <p className="text-gray-400 text-sm">Taking you to SiteIQ…</p>
        </div>
      </div>
    )
  }

  const InputField = ({ label, field, type = 'text', placeholder, children, required }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label} {!required && <span className="text-gray-600 normal-case font-normal">(optional)</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={form[field]}
          onChange={e => update(field, e.target.value)}
          placeholder={placeholder}
          className={`auth-input ${fieldErrors[field] ? 'error pr-11' : children ? 'pr-11' : ''}`}
        />
        {children}
      </div>
      {fieldErrors[field] && (
        <p className="text-xs text-red-400 mt-1">{fieldErrors[field]}</p>
      )}
    </div>
  )

  return (
    <div className="dark-page min-h-screen flex" style={{ background: '#080a0d' }}>
      {/* LEFT — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative overflow-y-auto">
        {/* Orb */}
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,196,0,0.05), transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <HardhatIcon size={28} />
            <span className="font-heading font-bold text-xl text-white">
              Site<span className="text-yellow-400">IQ</span>
            </span>
          </div>

          <h1 className="font-heading font-bold text-4xl text-white mb-2">Start protecting your site</h1>
          <p className="text-sm mb-7" style={{ color: '#6b7280' }}>Create your free SiteIQ account — no credit card needed</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Your full name"
                className={`auth-input ${fieldErrors.name ? 'error' : ''}`}
                autoComplete="name"
              />
              {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@company.com"
                className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Create a password"
                  className={`auth-input pr-11 ${fieldErrors.password ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                    }
                  </svg>
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
                  className={`auth-input pr-11 ${fieldErrors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Company + Role row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Company <span className="text-gray-600 normal-case font-normal">(opt.)</span>
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => update('company', e.target.value)}
                  placeholder="Company name"
                  className="auth-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={e => update('role', e.target.value)}
                  className="auth-input"
                  style={{ background: '#0a0d12' }}
                >
                  <option value="">Select role…</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={e => update('agreeTerms', e.target.checked)}
                  className="mt-0.5 accent-yellow-400"
                />
                <span className="text-xs text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-yellow-400 hover:text-yellow-300">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-yellow-400 hover:text-yellow-300">Privacy Policy</a>
                </span>
              </label>
              {fieldErrors.agreeTerms && <p className="text-xs text-red-400 mt-1">{fieldErrors.agreeTerms}</p>}
            </div>

            {/* Global error */}
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
              className="btn-yellow w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating your account…
                </>
              ) : 'Create account →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">or sign up with</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Google */}
          <GoogleAuthButton label="Sign up with Google" />

          <p className="text-center text-sm mt-5" style={{ color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/signin" className="text-yellow-400 hover:text-yellow-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>

      {/* RIGHT — photo panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-center p-12"
        style={{ background: '#040507' }}>
        <div className="absolute inset-0">
          <img
            src="/images/hero-site.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.2 }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,10,13,0.85) 0%, rgba(8,10,13,0.65) 100%)' }} />
        </div>

        <div className="relative z-10">
          <h2 className="font-heading font-bold text-3xl text-white mb-3 leading-snug">
            Join site managers across<br />
            <span style={{
              background: 'linear-gradient(135deg, #f5c400, #ff8c00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Africa, Asia &amp; the Middle East
            </span>
          </h2>

          {/* Animated counter */}
          <div className="dark-card px-5 py-4 mb-8 inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 live-dot" />
            <span className="text-white font-heading font-bold text-2xl">1,240+</span>
            <span className="text-gray-400 text-sm">analyses completed</span>
          </div>

          <ul className="space-y-5">
            {[
              { icon: '🦺', text: 'Safety score with regulation references' },
              { icon: '📋', text: 'Contract obligations & penalty clauses' },
              { icon: '⚡', text: 'Prescriptive actions with deadlines' },
            ].map(item => (
              <li key={item.icon} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.15)' }}>
                  {item.icon}
                </div>
                <p className="text-sm text-gray-300">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
