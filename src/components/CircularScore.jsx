export default function CircularScore({ score = 0, size = 64, label, showLabel = true }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100)

  const color = score >= 70
    ? 'var(--success)'
    : score >= 45
    ? 'var(--warning)'
    : 'var(--danger)'

  const fontSize = size < 56 ? size * 0.26 : size * 0.24

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="4"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            fill: 'var(--text-primary)',
          }}
        >
          {Math.round(score)}
        </text>
      </svg>
      {showLabel && label && (
        <span style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
