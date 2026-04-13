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
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Demo scenarios
        </span>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">pre-load realistic site data</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DEMO_SCENARIOS.map((scenario) => {
          const isActive = activeId === scenario.id
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario)}
              className={[
                'text-left px-3 py-2.5 rounded-lg border transition-all duration-150 group',
                isActive
                  ? 'border-yellow bg-yellow-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/50',
              ].join(' ')}
            >
              <span className="text-lg block mb-1">{scenario.icon}</span>
              <span className={[
                'block text-xs font-bold leading-tight',
                isActive ? 'text-yellow-700' : 'text-gray-700 group-hover:text-gray-900',
              ].join(' ')}>
                {scenario.label}
              </span>
              <span className="block text-[10px] text-gray-400 mt-0.5 leading-tight">
                {scenario.tag}
              </span>
            </button>
          )
        })}
      </div>

      {activeId && (
        <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-600">
            <span className="font-semibold">Demo loaded.</span>{' '}
            Site description and contract text pre-filled. Click <strong>Analyse</strong> to run the full AI pipeline.
          </p>
        </div>
      )}
    </div>
  )
}
