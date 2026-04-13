/**
 * ActionEngine — Dark panel showing prescriptive, prioritised PM actions.
 */

const DEADLINE_COLOR = (deadline) => {
  if (!deadline) return 'text-gray-400'
  const d = deadline.toLowerCase()
  if (d.includes('immediately') || d.includes('now') || d.includes('24 hour')) return 'text-red-400'
  if (d.includes('48') || d.includes('2 day') || d.includes('today')) return 'text-orange-400'
  if (d.includes('week') || d.includes('7 day')) return 'text-amber-400'
  return 'text-blue-400'
}

function PenaltyCard({ clause }) {
  const severityColors = {
    High: 'border-l-red-400 bg-red-900/10',
    Medium: 'border-l-amber-400 bg-amber-900/10',
    Low: 'border-l-green-400 bg-green-900/10',
  }

  return (
    <div className={`border-l-4 rounded-lg px-4 py-3 ${severityColors[clause.severity] ?? 'border-l-gray-600'}`}>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <span className="font-heading font-bold text-sm text-white leading-tight">{clause.title}</span>
        <span className={`flex-shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded ${
          clause.severity === 'High' ? 'bg-red-500/20 text-red-400' :
          clause.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {clause.severity}
        </span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed mb-2">{clause.description}</p>
      {clause.action && (
        <p className="text-xs text-blue-300 leading-relaxed border-t border-gray-700 pt-2 mt-2">
          <span className="font-semibold text-blue-400">Mitigation: </span>
          {clause.action}
        </p>
      )}
      {clause.clause && (
        <span className="font-mono-clause text-gray-600 text-[10px] mt-1 block">{clause.clause}</span>
      )}
    </div>
  )
}

export default function ActionEngine({ pmActions, penaltyClauses, notices }) {
  return (
    <div className="space-y-6">
      {/* PM Action Plan */}
      <div className="action-panel p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 bg-yellow rounded-full" />
          <h2 className="font-heading font-bold text-xl text-white tracking-tight">
            Prescriptive PM Action Plan
          </h2>
        </div>

        {pmActions && pmActions.length > 0 ? (
          <div className="space-y-4">
            {pmActions.map((item, i) => (
              <div key={i} className="flex gap-4">
                {/* Priority number */}
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-yellow/10 border border-yellow/30 flex items-center justify-center">
                    <span className="font-heading font-bold text-yellow text-lg leading-none">
                      {item.priority ?? i + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug mb-1">{item.action}</p>
                  {item.reason && (
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.reason}</p>
                  )}
                  {item.deadline && (
                    <div className="inline-flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`font-mono-clause text-xs font-medium ${DEADLINE_COLOR(item.deadline)}`}>
                        {item.deadline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No PM actions generated.</p>
        )}
      </div>

      {/* Penalty Clauses */}
      {penaltyClauses && penaltyClauses.length > 0 && (
        <div className="action-panel p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-red-400 rounded-full" />
            <h2 className="font-heading font-bold text-xl text-white tracking-tight">
              Contract Risk Clauses
            </h2>
          </div>
          <div className="space-y-3">
            {penaltyClauses.map((clause, i) => (
              <PenaltyCard key={i} clause={clause} />
            ))}
          </div>
        </div>
      )}

      {/* Required Notices */}
      {notices && notices.length > 0 && (
        <div className="action-panel p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-blue-400 rounded-full" />
            <h2 className="font-heading font-bold text-xl text-white tracking-tight">
              Required Notices &amp; Submissions
            </h2>
          </div>
          <div className="space-y-3">
            {notices.map((notice, i) => (
              <div key={i} className="border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-heading font-bold text-sm text-white">{notice.title}</span>
                  {notice.severity && (
                    <span className={`flex-shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      notice.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                      notice.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {notice.severity}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2 leading-relaxed">{notice.description}</p>
                {notice.action && (
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-semibold">Action: </span>{notice.action}
                  </p>
                )}
                {notice.clause && (
                  <span className="font-mono-clause text-gray-600 text-[10px] mt-1.5 block">{notice.clause}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
