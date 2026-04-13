/**
 * ScoreStrip — Overview metric cards at the top of the report.
 * Shows safety score, contract health, risk counts, and obligation counts.
 */

function ScoreGauge({ score, label, color }) {
  if (score == null) return null

  // Arc SVG parameters
  const r = 38
  const cx = 48
  const cy = 48
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const trackColor = '#e5e7eb'
  const fillColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="card flex flex-col items-center text-center py-6">
      <div className="relative w-24 h-24 mb-3">
        <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth="8" />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={fillColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="score-number text-3xl" style={{ color: fillColor }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      <span className="font-heading font-bold text-sm text-gray-600 uppercase tracking-wide">{label}</span>
      <span className="text-xs text-gray-400 mt-0.5">
        {score >= 70 ? 'Good' : score >= 40 ? 'Needs attention' : 'Critical'}
      </span>
    </div>
  )
}

function CountCard({ count, label, sublabel, color }) {
  const colorMap = {
    red: 'text-red-500 bg-red-50 border-red-100',
    amber: 'text-amber-500 bg-amber-50 border-amber-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    gray: 'text-gray-500 bg-gray-50 border-gray-100',
  }
  const cls = colorMap[color] ?? colorMap.gray

  return (
    <div className={`card border flex flex-col items-center text-center py-6 ${cls}`}>
      <span className="score-number text-4xl">{count}</span>
      <span className="font-heading font-bold text-sm uppercase tracking-wide mt-2">{label}</span>
      {sublabel && <span className="text-xs mt-0.5 opacity-70">{sublabel}</span>}
    </div>
  )
}

export default function ScoreStrip({ report }) {
  const { safetyScore, contractScore, riskCount, obligations } = report
  const totalRisks = (riskCount?.high ?? 0) + (riskCount?.medium ?? 0) + (riskCount?.low ?? 0)
  const obligationCount = obligations?.length ?? 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <ScoreGauge score={safetyScore} label="Safety Score" />
      {contractScore != null
        ? <ScoreGauge score={contractScore} label="Contract Health" />
        : (
          <div className="card flex flex-col items-center text-center py-6 opacity-50">
            <span className="score-number text-3xl text-gray-300">—</span>
            <span className="font-heading font-bold text-sm text-gray-400 uppercase tracking-wide mt-3">Contract Health</span>
            <span className="text-xs text-gray-300 mt-0.5">No contract</span>
          </div>
        )
      }
      <CountCard
        count={riskCount?.high ?? 0}
        label="High Risks"
        sublabel={`${totalRisks} total risks`}
        color="red"
      />
      <CountCard
        count={obligationCount}
        label="Obligations"
        sublabel="requiring action"
        color="blue"
      />
    </div>
  )
}
