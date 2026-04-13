import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import useAuthStore from '../store/useAuthStore.js'

export default function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearAll = useAppStore(s => s.clearAll)
  const { user, isAuthenticated, signOut } = useAuthStore()

  const isReport = location.pathname === '/report'

  function handleNewAnalysis() {
    clearAll()
    navigate('/app')
  }

  function handleSignOut() {
    signOut()
    clearAll()
    navigate('/')
  }

  return (
    <header className="topbar bg-navy text-white px-4 sm:px-6 py-3 flex items-center justify-between no-print sticky top-0 z-50 shadow-lg">
      {/* Logo */}
      <button
        onClick={isReport ? handleNewAnalysis : () => navigate('/app')}
        className="flex items-center gap-3 group"
      >
        <div className="w-8 h-8 flex-shrink-0">
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
            <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
            <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#0f1114" opacity="0.35" />
          </svg>
        </div>
        <div>
          <span className="font-heading text-2xl font-bold tracking-tight">
            Site<span className="text-yellow">IQ</span>
          </span>
          <span className="hidden sm:block text-[10px] text-gray-400 tracking-widest uppercase -mt-1 ml-0.5">
            Safety &amp; Contract Intelligence
          </span>
        </div>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {isReport && (
          <button
            onClick={handleNewAnalysis}
            className="flex items-center gap-2 bg-yellow hover:bg-yellow-400 text-navy font-heading font-bold text-sm px-4 py-2 rounded-lg transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </button>
        )}

        {isReport && (
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors duration-150"
            title="Print / Export PDF"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export
          </button>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow/20 border border-yellow/30 flex items-center justify-center">
                <span className="text-yellow font-bold text-xs">
                  {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <span className="text-sm text-gray-300 max-w-[120px] truncate">
                {user.name || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/signin"
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-yellow hover:bg-yellow-400 text-navy font-heading font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI Ready
        </div>
      </div>
    </header>
  )
}
