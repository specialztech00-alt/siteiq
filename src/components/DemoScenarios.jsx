import { DEMO_SCENARIOS } from '../lib/prompts.js'
import useAppStore from '../store/useAppStore.js'

export default function DemoScenarios({ activeId, onSelect }) {
  const loadDemoScenario = useAppStore(s => s.loadDemoScenario)

  function handleSelect(scenario) {
    loadDemoScenario(scenario)
    onSelect?.(scenario.id)
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
          Demo scenarios
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>pre-load realistic site data</span>
      </div>

      {/* Scenario grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
        {DEMO_SCENARIOS.map(scenario => {
          const isActive = activeId === scenario.id
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                background: isActive ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.background = 'var(--accent-dim2)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                }
              }}
            >
              <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{scenario.icon}</span>
              <span style={{
                display: 'block', fontSize: '12px', fontWeight: 700, lineHeight: 1.3,
                color: isActive ? 'var(--text-accent)' : 'var(--text-primary)',
              }}>
                {scenario.label}
              </span>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', lineHeight: 1.3 }}>
                {scenario.tag}
              </span>
            </button>
          )
        })}
      </div>

      {/* Demo loaded banner */}
      {activeId && (
        <div style={{
          marginTop: '10px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
          background: 'var(--info-bg)', border: '1px solid var(--info)',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--info)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>Demo loaded.</span>{' '}
            Site description and contract text pre-filled. Click <strong>Analyse</strong> to run the full AI pipeline.
          </p>
        </div>
      )}
    </div>
  )
}
