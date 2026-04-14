import { Link } from 'react-router-dom'

export default function PlaceholderPage({ title }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: '16px',
    }}>
      {/* Icon */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--accent-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
        </svg>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '32px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.1,
      }}>
        {title}
      </h1>

      {/* Subtitle */}
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: 1.6 }}>
        This page is coming in a future piece of the workspace redesign.
      </p>

      {/* Badge */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: '20px',
        background: 'var(--accent-dim)',
        color: 'var(--text-accent)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        border: '1px solid var(--accent)',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="10" height="10" rx="2"/>
          <line x1="6" y1="4" x2="6" y2="8"/>
          <line x1="4" y1="6" x2="8" y2="6"/>
        </svg>
        Under Construction
      </span>

      {/* Back link */}
      <Link
        to="/app/dashboard"
        style={{
          marginTop: '8px',
          fontSize: '13px',
          color: 'var(--text-accent)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="8,2 3,7 8,12"/>
          <line x1="3" y1="7" x2="12" y2="7"/>
        </svg>
        Back to Dashboard
      </Link>
    </div>
  )
}
