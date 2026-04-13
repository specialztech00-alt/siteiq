import { LOADING_STEPS } from '../store/useAppStore.js'

export default function LoadingScreen({ currentStep }) {
  return (
    <div className="fixed inset-0 bg-navy z-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
            <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
            <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
            <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#0f1114" opacity="0.35" />
          </svg>
          <span className="font-heading text-4xl font-bold text-white tracking-tight">
            Site<span className="text-yellow">IQ</span>
          </span>
        </div>
        <p className="text-gray-400 text-sm tracking-widest uppercase">Analysing your site &amp; contract</p>
      </div>

      {/* Spinning indicator */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-navy-700 opacity-30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-yellow font-heading font-bold text-lg">
            {currentStep + 1}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-2">
        {LOADING_STEPS.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isPending = i > currentStep

          return (
            <div
              key={step}
              className={[
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300',
                isActive ? 'bg-navy-700 border border-yellow/30' : '',
                isDone ? 'opacity-60' : '',
                isPending ? 'opacity-25' : '',
              ].join(' ')}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="w-3 h-3 rounded-full bg-yellow pulse-yellow" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-gray-600" />
                )}
              </div>

              {/* Label */}
              <span className={[
                'text-sm font-medium',
                isActive ? 'text-yellow' : isDone ? 'text-green-400' : 'text-gray-500',
              ].join(' ')}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Claude attribution */}
      <div className="mt-10 flex items-center gap-2 text-xs text-gray-600">
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Powered by Claude <span className="text-gray-500">claude-sonnet-4-20250514</span></span>
      </div>
    </div>
  )
}
