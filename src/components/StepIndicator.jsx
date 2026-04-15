// ── CheckIcon ─────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  )
}

// ── StepIndicator ─────────────────────────────────────────────────────────────

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep
        const isLast = index === steps.length - 1

        return (
          <div
            key={index}
            style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? '0 0 auto' : '1 1 0' }}
          >
            {/* Circle + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              {/* Circle */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isCompleted
                  ? 'var(--success)'
                  : isCurrent
                  ? 'var(--accent)'
                  : 'transparent',
                border: isCompleted || isCurrent
                  ? 'none'
                  : '2px solid var(--border)',
                transition: 'all 0.3s ease',
              }}>
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isCurrent ? '#000' : 'var(--text-tertiary)',
                    lineHeight: 1,
                  }}>
                    {stepNum}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={isCurrent ? '' : 'step-label-hidden'}
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  transition: 'color 0.3s ease',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line (not after last step) */}
            {!isLast && (
              <div style={{
                flex: 1,
                height: '2px',
                marginTop: '13px',
                marginLeft: '6px',
                marginRight: '6px',
                background: isCompleted ? 'var(--success)' : 'var(--border)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
