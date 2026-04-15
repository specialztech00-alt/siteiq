const THRESHOLDS = [160, 120, 80, 40, 0]

function starCount(score) {
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (score >= THRESHOLDS[i]) return 5 - i
  }
  return 1
}

function Star({ filled, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? 'var(--accent)' : 'none'} stroke={filled ? 'var(--accent)' : 'var(--border)'} strokeWidth="1.5">
      <polygon points="8,1.5 10.1,6.1 15.1,6.6 11.4,10 12.6,15 8,12.3 3.4,15 4.6,10 0.9,6.6 5.9,6.1" strokeLinejoin="round" />
    </svg>
  )
}

export default function StarRating({ score = 0, size = 16, showCount = false }) {
  const stars = starCount(Math.max(0, Math.min(200, score)))

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < stars} size={size} />
      ))}
      {showCount && (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px' }}>
          {stars}/5
        </span>
      )}
    </div>
  )
}
