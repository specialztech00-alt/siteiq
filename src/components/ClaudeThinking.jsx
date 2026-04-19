function HardhatIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C8.1 3 5 6.1 5 10v1H4a1 1 0 000 2h1v1h14v-1h1a1 1 0 000-2h-1v-1c0-3.9-3.1-7-7-7zm0 2c2.8 0 5 2.2 5 5v1H7v-1c0-2.8 2.2-5 5-5z" />
      <rect x="3" y="15" width="18" height="3" rx="1.5" />
    </svg>
  )
}

export default function ClaudeThinking({ message = 'Claude is thinking', size = 'sm' }) {
  const isSm = size === 'sm'

  return (
    <>
      <style>{`
        @keyframes ct-dot {
          0%,80%,100% { opacity: 0.3; transform: scale(0.8); }
          40%          { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ color: 'var(--text-accent)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <HardhatIcon size={isSm ? 16 : 20} />
        </div>
        <span style={{
          fontSize: isSm ? '12px' : '14px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          {message}
        </span>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'inline-block',
              width: '5px', height: '5px',
              borderRadius: '50%',
              background: 'var(--accent)',
              animation: 'ct-dot 1.4s ease infinite',
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      </div>
    </>
  )
}
