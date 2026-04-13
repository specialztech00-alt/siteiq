import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import ScoreStrip from '../components/ScoreStrip.jsx'
import RiskCard from '../components/RiskCard.jsx'
import ObligationTable from '../components/ObligationTable.jsx'
import Timeline from '../components/Timeline.jsx'
import ActionEngine from '../components/ActionEngine.jsx'
import ContractChat from '../components/ContractChat.jsx'
import useAppStore from '../store/useAppStore.js'

const TABS = [
  { id: 0, label: 'Overview', icon: '📊' },
  { id: 1, label: 'Safety', icon: '🦺' },
  { id: 2, label: 'Contract', icon: '📋' },
  { id: 3, label: 'PM Actions', icon: '⚡' },
  { id: 4, label: 'Q&A', icon: '💬' },
]

function SectionHeading({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="font-heading font-bold text-2xl text-gray-900">{children}</h2>
      {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Tab panels ───────────────────────────────────────────────────────────────

function OverviewTab({ report }) {
  const { summary, risks, pmActions, safeObservations } = report
  const topRisks = (risks ?? []).filter(r => r.severity === 'High').slice(0, 3)
  const topActions = (pmActions ?? []).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Scores */}
      <ScoreStrip report={report} />

      {/* Summary */}
      {summary && (
        <div className="card border-l-4 border-l-yellow">
          <h3 className="font-heading font-bold text-base text-gray-700 mb-2 uppercase tracking-wide text-sm">Executive Summary</h3>
          <p className="text-gray-700 leading-relaxed text-sm">{summary}</p>
        </div>
      )}

      {/* Safe observations */}
      {safeObservations && safeObservations.length > 0 && (
        <div className="card">
          <h3 className="font-heading font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-green-500">✓</span> Safe Observations
          </h3>
          <ul className="space-y-1.5">
            {safeObservations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top risks */}
      {topRisks.length > 0 && (
        <div>
          <SectionHeading sub="Most critical safety issues requiring immediate action">
            Top High Risks
          </SectionHeading>
          <div className="space-y-3">
            {topRisks.map(risk => <RiskCard key={risk.id} risk={risk} />)}
          </div>
        </div>
      )}

      {/* Top PM actions */}
      {topActions.length > 0 && (
        <div>
          <SectionHeading sub="Immediate actions for the site manager">
            Priority Actions
          </SectionHeading>
          <div className="action-panel p-5 space-y-4">
            {topActions.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-yellow/10 border border-yellow/30 flex items-center justify-center">
                  <span className="font-heading font-bold text-yellow text-lg">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.action}</p>
                  {item.deadline && (
                    <span className="text-xs font-mono-clause text-red-400 mt-1 block">{item.deadline}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SafetyTab({ report }) {
  const { detectedObjects, risks } = report
  const high = (risks ?? []).filter(r => r.severity === 'High')
  const medium = (risks ?? []).filter(r => r.severity === 'Medium')
  const low = (risks ?? []).filter(r => r.severity === 'Low')

  return (
    <div className="space-y-6">
      {/* Detected objects */}
      {detectedObjects && detectedObjects.length > 0 && (
        <div className="card">
          <h3 className="font-heading font-bold text-base text-gray-800 mb-3">
            Detected on Site
          </h3>
          <div className="flex flex-wrap gap-2">
            {detectedObjects.map(obj => (
              <span
                key={obj}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-navy/5 border border-navy/10 text-navy"
              >
                {obj}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risks by severity */}
      {high.length > 0 && (
        <div>
          <SectionHeading sub={`${high.length} issue${high.length > 1 ? 's' : ''} — immediate action required`}>
            🔴 High Severity Risks
          </SectionHeading>
          <div className="space-y-3">
            {high.map(r => <RiskCard key={r.id} risk={r} />)}
          </div>
        </div>
      )}

      {medium.length > 0 && (
        <div>
          <SectionHeading sub={`${medium.length} issue${medium.length > 1 ? 's' : ''} — action required within 48 hours`}>
            🟡 Medium Severity Risks
          </SectionHeading>
          <div className="space-y-3">
            {medium.map(r => <RiskCard key={r.id} risk={r} />)}
          </div>
        </div>
      )}

      {low.length > 0 && (
        <div>
          <SectionHeading sub={`${low.length} issue${low.length > 1 ? 's' : ''} — monitor and address`}>
            🟢 Low Severity Risks
          </SectionHeading>
          <div className="space-y-3">
            {low.map(r => <RiskCard key={r.id} risk={r} />)}
          </div>
        </div>
      )}

      {(!risks || risks.length === 0) && (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-heading font-bold text-lg text-green-600">No risks identified</p>
          <p className="text-sm text-gray-400 mt-1">Provide more site details for a detailed assessment</p>
        </div>
      )}
    </div>
  )
}

function ContractTab({ report }) {
  const { obligations, penaltyClauses, timeline } = report

  return (
    <div className="space-y-6">
      {/* Obligations table */}
      <div>
        <SectionHeading sub="All contractual obligations extracted from the contract">
          Obligations Register
        </SectionHeading>
        <ObligationTable obligations={obligations} />
      </div>

      {/* Penalty / risk clauses */}
      {penaltyClauses && penaltyClauses.length > 0 && (
        <div>
          <SectionHeading sub="Clauses with financial risk to the contractor">
            Penalty &amp; Risk Clauses
          </SectionHeading>
          <div className="space-y-3">
            {penaltyClauses.map((clause, i) => (
              <RiskCard
                key={i}
                risk={{
                  id: clause.clause,
                  severity: clause.severity,
                  title: clause.title,
                  description: clause.description,
                  action: clause.action,
                  regulation: clause.clause,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <div>
          <SectionHeading sub="Key dates and contractual milestones">
            Key Dates Timeline
          </SectionHeading>
          <Timeline items={timeline} />
        </div>
      )}
    </div>
  )
}

function PMActionsTab({ report }) {
  return (
    <ActionEngine
      pmActions={report.pmActions}
      penaltyClauses={report.penaltyClauses}
      notices={report.notices}
    />
  )
}

// ── Main report page ─────────────────────────────────────────────────────────

export default function ReportPage() {
  const navigate = useNavigate()
  const reportData = useAppStore(s => s.reportData)
  const activeTab = useAppStore(s => s.activeTab)
  const setActiveTab = useAppStore(s => s.setActiveTab)

  if (!reportData) {
    navigate('/')
    return null
  }

  const isFallback = reportData._isFallback

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />

      {/* Report title bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 no-print">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-gray-900 leading-tight">
                {reportData.reportTitle}
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-mono-clause">
                Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {isFallback && (
              <span className="flex-shrink-0 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-medium">
                Demo mode
              </span>
            )}
          </div>

          {/* Risk count summary */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {reportData.riskCount?.high > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {reportData.riskCount.high} High
              </span>
            )}
            {reportData.riskCount?.medium > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {reportData.riskCount.medium} Medium
              </span>
            )}
            {reportData.riskCount?.low > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {reportData.riskCount.low} Low
              </span>
            )}
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">
              {reportData.obligations?.length ?? 0} obligation{reportData.obligations?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-0 -mb-px overflow-x-auto thin-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                  activeTab === tab.id
                    ? 'border-yellow text-yellow-700 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ].join(' ')}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        {activeTab === 0 && <OverviewTab report={reportData} />}
        {activeTab === 1 && <SafetyTab report={reportData} />}
        {activeTab === 2 && <ContractTab report={reportData} />}
        {activeTab === 3 && <PMActionsTab report={reportData} />}
        {activeTab === 4 && (
          <div className="card">
            <ContractChat />
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 no-print">
        SiteIQ — AI analysis only · Always verify with qualified safety and legal professionals
      </footer>
    </div>
  )
}
