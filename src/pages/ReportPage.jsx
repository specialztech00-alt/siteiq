import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, HardHat, ScrollText, ClipboardList, MessageSquare, Share2, Printer, CheckCircle2 } from 'lucide-react'
import ScoreStrip from '../components/ScoreStrip.jsx'
import RiskCard from '../components/RiskCard.jsx'
import ObligationTable from '../components/ObligationTable.jsx'
import Timeline from '../components/Timeline.jsx'
import ActionEngine from '../components/ActionEngine.jsx'
import ContractChat from '../components/ContractChat.jsx'
import useAppStore from '../store/useAppStore.js'

// ── Constants ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 0, label: 'Overview',   Icon: LayoutDashboard },
  { id: 1, label: 'Safety',     Icon: HardHat },
  { id: 2, label: 'Contract',   Icon: ScrollText },
  { id: 3, label: 'PM Actions', Icon: ClipboardList },
  { id: 4, label: 'Q&A',        Icon: MessageSquare },
]

// ── Shared heading ─────────────────────────────────────────────────────────────

function SectionHeading({ children, sub }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {children}
      </h2>
      {sub && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{sub}</p>}
    </div>
  )
}

// ── Overview tab ───────────────────────────────────────────────────────────────

function OverviewTab({ report }) {
  const { summary, risks, pmActions, safeObservations } = report
  const topRisks   = (risks ?? []).filter(r => r.severity === 'High').slice(0, 3)
  const topActions = (pmActions ?? []).slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ScoreStrip report={report} />

      {summary && (
        <div className="card" style={{ borderLeft: '3px solid var(--accent)', padding: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Executive Summary
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{summary}</p>
        </div>
      )}

      {safeObservations && safeObservations.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="var(--success)" /> Safe Observations
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
            {safeObservations.map((obs, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={14} color="var(--success)" style={{ marginTop: '1px', flexShrink: 0 }} />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {topRisks.length > 0 && (
        <div>
          <SectionHeading sub="Most critical safety issues requiring immediate action">
            Top High Risks
          </SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topRisks.map(risk => <RiskCard key={risk.id} risk={risk} />)}
          </div>
        </div>
      )}

      {topActions.length > 0 && (
        <div>
          <SectionHeading sub="Immediate actions for the site manager">
            Priority Actions
          </SectionHeading>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topActions.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px' }}>
                <div style={{
                  flexShrink: 0, width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(245,196,0,0.1)', border: '1px solid rgba(245,196,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--accent)', lineHeight: 1 }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.action}</p>
                  {item.deadline && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--danger)', marginTop: '3px', display: 'block' }}>{item.deadline}</span>
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

// ── Safety tab ─────────────────────────────────────────────────────────────────

function SafetyTab({ report }) {
  const { detectedObjects, risks } = report
  const high   = (risks ?? []).filter(r => r.severity === 'High')
  const medium = (risks ?? []).filter(r => r.severity === 'Medium')
  const low    = (risks ?? []).filter(r => r.severity === 'Low')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {detectedObjects && detectedObjects.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Detected on Site
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {detectedObjects.map(obj => (
              <span key={obj} style={{
                display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
                borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}>
                {obj}
              </span>
            ))}
          </div>
        </div>
      )}

      {high.length > 0 && (
        <div>
          <SectionHeading sub={`${high.length} issue${high.length > 1 ? 's' : ''} — immediate action required`}>
            High Severity Risks
          </SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {high.map(r => <RiskCard key={r.id} risk={r} />)}
          </div>
        </div>
      )}

      {medium.length > 0 && (
        <div>
          <SectionHeading sub={`${medium.length} issue${medium.length > 1 ? 's' : ''} — action required within 48 hours`}>
            Medium Severity Risks
          </SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {medium.map(r => <RiskCard key={r.id} risk={r} />)}
          </div>
        </div>
      )}

      {low.length > 0 && (
        <div>
          <SectionHeading sub={`${low.length} issue${low.length > 1 ? 's' : ''} — monitor and address`}>
            Low Severity Risks
          </SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {low.map(r => <RiskCard key={r.id} risk={r} />)}
          </div>
        </div>
      )}

      {(!risks || risks.length === 0) && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <CheckCircle2 size={40} color="var(--success)" />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>No risks identified</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Provide more site details for a detailed assessment</p>
        </div>
      )}
    </div>
  )
}

// ── Contract tab ───────────────────────────────────────────────────────────────

function ContractTab({ report }) {
  const { obligations, penaltyClauses, timeline } = report

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <SectionHeading sub="All contractual obligations extracted from the contract">
          Obligations Register
        </SectionHeading>
        <ObligationTable obligations={obligations} />
      </div>

      {penaltyClauses && penaltyClauses.length > 0 && (
        <div>
          <SectionHeading sub="Clauses with financial risk to the contractor">
            Penalty &amp; Risk Clauses
          </SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {penaltyClauses.map((clause, i) => (
              <RiskCard key={i} risk={{
                id: clause.clause,
                severity: clause.severity,
                title: clause.title,
                description: clause.description,
                action: clause.action,
                regulation: clause.clause,
              }} />
            ))}
          </div>
        </div>
      )}

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTimestamp(date) {
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const d = date.getDate()
  const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th'
  const h = date.getHours(), m = date.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM', h12 = h % 12 || 12
  return `${days[date.getDay()]} ${d}${suffix} ${months[date.getMonth()]} ${date.getFullYear()} · ${h12}:${m} ${ampm}`
}

// ── ProjectInfoForm ────────────────────────────────────────────────────────────

function ProjectInfoForm({ projectInfo, setProjectInfo }) {
  const fields = [
    { key: 'projectName',  label: 'Project name',  placeholder: 'e.g. Block C Foundation Works' },
    { key: 'company',      label: 'Company',        placeholder: 'e.g. Ace Contractors Ltd' },
    { key: 'siteLocation', label: 'Site location',  placeholder: 'e.g. Victoria Island, Lagos' },
    { key: 'siteManager',  label: 'Site manager',   placeholder: 'e.g. J. Okafor' },
  ]
  return (
    <div className="print-project-info" style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: '16px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
        Project Information
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              {label}
            </label>
            <input
              type="text"
              value={projectInfo[key]}
              onChange={e => setProjectInfo({ [key]: e.target.value })}
              placeholder={placeholder}
              className="input no-print"
              style={{ padding: '7px 10px', fontSize: '13px' }}
            />
            <span className="hidden print-only" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {projectInfo[key] || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ShareToast ─────────────────────────────────────────────────────────────────

function ShareToast({ show }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: show ? 'translate(-50%, 0)' : 'translate(-50%, 16px)',
      zIndex: 50, display: 'flex', alignItems: 'center', gap: '10px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      color: 'var(--text-primary)', fontSize: '13px', padding: '10px 16px',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
      transition: 'all 0.3s ease',
      opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none',
    }}>
      <CheckCircle2 size={14} color="var(--success)" />
      Report link copied to clipboard
    </div>
  )
}

// ── Main ReportPage ────────────────────────────────────────────────────────────

export default function ReportPage() {
  const navigate        = useNavigate()
  const reportData      = useAppStore(s => s.reportData)
  const activeTab       = useAppStore(s => s.activeTab)
  const setActiveTab    = useAppStore(s => s.setActiveTab)
  const projectInfo     = useAppStore(s => s.projectInfo)
  const setProjectInfo  = useAppStore(s => s.setProjectInfo)
  const analysisId      = useAppStore(s => s.analysisId)
  const [showToast, setShowToast] = useState(false)
  const [generatedAt]   = useState(() => new Date())

  useEffect(() => {
    if (!reportData) navigate('/')
  }, [reportData, navigate])

  if (!reportData) return null

  const isFallback  = reportData._isFallback
  const displayId   = analysisId ?? ('SITEIQ-' + Math.random().toString(36).toUpperCase().slice(2, 8))

  function handleShare() {
    const text = [
      'SiteIQ Analysis Report',
      `ID: ${displayId}`,
      `Generated: ${formatTimestamp(generatedAt)}`,
      projectInfo.projectName && `Project: ${projectInfo.projectName}`,
      projectInfo.company && `Company: ${projectInfo.company}`,
      '',
      `Safety Score: ${reportData.safetyScore ?? 'N/A'}/100`,
      `Risks: ${reportData.riskCount?.high ?? 0} High, ${reportData.riskCount?.medium ?? 0} Medium, ${reportData.riskCount?.low ?? 0} Low`,
      '',
      window.location.href,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(text).catch(() => {})
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>

      {/* Report header */}
      <div style={{
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
      }} className="no-print">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <ProjectInfoForm projectInfo={projectInfo} setProjectInfo={setProjectInfo} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>
                {reportData.reportTitle}
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Generated: {formatTimestamp(generatedAt)}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                {displayId}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {isFallback && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)',
                }}>
                  Demo mode
                </span>
              )}
              <button
                onClick={handleShare}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                title="Copy report summary to clipboard"
              >
                <Share2 size={13} />
                Share
              </button>
              <button
                onClick={() => window.print()}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
              >
                <Printer size={13} />
                Export
              </button>
            </div>
          </div>

          {/* Risk summary chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            {reportData.riskCount?.high > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
                {reportData.riskCount.high} High
              </span>
            )}
            {reportData.riskCount?.medium > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
                {reportData.riskCount.medium} Medium
              </span>
            )}
            {reportData.riskCount?.low > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                {reportData.riskCount.low} Low
              </span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {reportData.obligations?.length ?? 0} obligation{reportData.obligations?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <ShareToast show={showToast} />

      {/* Tab bar */}
      <div style={{
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 'var(--topbar-height)', zIndex: 40,
      }} className="no-print">
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <nav style={{ display: 'flex', gap: 0, overflowX: 'auto' }} className="thin-scrollbar">
            {TABS.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '12px 16px', fontSize: '13px', fontWeight: active ? 600 : 500,
                    whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <tab.Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {activeTab === 0 && <OverviewTab report={reportData} />}
        {activeTab === 1 && <SafetyTab report={reportData} />}
        {activeTab === 2 && <ContractTab report={reportData} />}
        {activeTab === 3 && <ActionEngine pmActions={reportData.pmActions} penaltyClauses={reportData.penaltyClauses} notices={reportData.notices} />}
        {activeTab === 4 && (
          <div className="card" style={{ padding: '20px' }}>
            <ContractChat />
          </div>
        )}
      </main>

      <footer style={{
        textAlign: 'center', padding: '14px 16px',
        fontSize: '11px', color: 'var(--text-tertiary)',
        borderTop: '1px solid var(--border)',
      }} className="no-print">
        SiteIQ — AI analysis only · Always verify with qualified safety and legal professionals
      </footer>
    </div>
  )
}
