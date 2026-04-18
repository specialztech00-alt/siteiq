import { Component } from 'react'

const HardhatIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" style={{ width: 40, height: 40 }}>
    <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
    <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
    <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#080a0d" opacity="0.4" />
  </svg>
)

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[SiteIQ] Uncaught render error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    const isDev = import.meta.env.DEV
    const message = this.state.error?.message || 'An unexpected error occurred.'

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: '#080a0d',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}>
        <HardhatIcon />

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '20px 0 8px' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 400, marginBottom: 24, lineHeight: 1.6 }}>
          SiteIQ hit an unexpected error. Your data is safe — refreshing the page usually fixes this.
        </p>

        {/* Error message box */}
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10,
          padding: '12px 18px',
          maxWidth: 480,
          width: '100%',
          marginBottom: 28,
          textAlign: 'left',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>Error</p>
          <p style={{ fontSize: 13, color: '#fca5a5', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
            {message}
          </p>
          {isDev && this.state.info?.componentStack && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Stack trace</summary>
              <pre style={{ fontSize: 10, color: '#6b7280', marginTop: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.info.componentStack}
              </pre>
            </details>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: '#f5c400',
              color: '#080a0d',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
          <button
            onClick={() => { this.setState({ error: null, info: null }); window.location.href = '/' }}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: 'transparent',
              color: '#9ca3af',
              fontWeight: 600,
              fontSize: 14,
              border: '1px solid #374151',
              cursor: 'pointer',
            }}
          >
            Go to homepage
          </button>
        </div>
      </div>
    )
  }
}
