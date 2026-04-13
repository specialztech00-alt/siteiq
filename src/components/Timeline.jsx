/**
 * Timeline — Vertical chronological timeline of key contract/project dates.
 */

export default function Timeline({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="card text-center py-10 text-gray-400">
        <p className="text-sm">No timeline events extracted.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={i} className="relative flex gap-4 pb-6">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Dot */}
            <div className="flex-shrink-0 z-10">
              <div className={[
                'w-10 h-10 rounded-full flex items-center justify-center',
                item.urgent
                  ? 'bg-red-500 text-white shadow-md shadow-red-200'
                  : 'bg-white border-2 border-gray-300 text-gray-400',
              ].join(' ')}>
                {item.urgent ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={[
              'flex-1 card mb-0',
              item.urgent ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-gray-200',
            ].join(' ')}>
              {item.date && (
                <span className="font-mono-clause text-xs text-gray-400 block mb-1">{item.date}</span>
              )}
              <h4 className={[
                'font-heading font-bold text-sm leading-tight',
                item.urgent ? 'text-red-700' : 'text-gray-900',
              ].join(' ')}>
                {item.urgent && (
                  <span className="inline-flex items-center mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
                    Urgent
                  </span>
                )}
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
