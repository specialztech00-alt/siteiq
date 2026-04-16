import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Accepted']

const STATUS_COLORS = {
  Open: 'var(--danger)',
  'In Progress': 'var(--warning)',
  Resolved: 'var(--success)',
  Accepted: 'var(--text-tertiary)',
}

const SEVERITY_COLORS = {
  Critical: 'var(--danger)',
  High: '#f97316',
  Medium: 'var(--warning)',
  Low: 'var(--success)',
}

function loadStatuses() {
  try { return JSON.parse(localStorage.getItem('siteiq-risk-statuses') || '{}') } catch { return {} }
}

function saveStatuses(statuses) {
  localStorage.setItem('siteiq-risk-statuses', JSON.stringify(statuses))
}

export default function RiskRegisterPage() {
  const navigate = useNavigate()
  const { analyses } = useAppStore()
  const [statuses, setStatuses] = useState(loadStatuses)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [sortBy, setSortBy] = useState('severity')

  // Aggregate all risks from all analyses
  const allRisks = useMemo(() => {
    const risks = []
    analyses.forEach(analysis => {
      const reportRisks = analysis.reportData?.risks ?? []
      reportRisks.forEach((risk, idx) => {
        const id = `${analysis.id}-${idx}`
        risks.push({
          id,
          analysisId: analysis.id,
          projectName: analysis.projectName || 'Unnamed Project',
          date: analysis.date,
          title: risk.title || risk.name || `Risk ${idx + 1}`,
          description: risk.description || risk.detail || '',
          severity: risk.severity || risk.level || 'Medium',
          category: risk.category || risk.type || 'Safety',
          recommendation: risk.recommendation || risk.action || '',
          status: statuses[id] || 'Open',
        })
      })
    })
    return risks
  }, [analyses, statuses])

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = allRisks
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'All') list = list.filter(r => r.status === filterStatus)
    if (filterSeverity !== 'All') list = list.filter(r => r.severity === filterSeverity)

    const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    if (sortBy === 'severity') list = [...list].sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3))
    else if (sortBy === 'status') list = [...list].sort((a, b) => a.status.localeCompare(b.status))
    else if (sortBy === 'project') list = [...list].sort((a, b) => a.projectName.localeCompare(b.projectName))
    else if (sortBy === 'date') list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))

    return list
  }, [allRisks, search, filterStatus, filterSeverity, sortBy])

  function handleStatusChange(riskId, newStatus) {
    const next = { ...statuses, [riskId]: newStatus }
    setStatuses(next)
    saveStatuses(next)
  }

  // Summary counts
  const openCount = allRisks.filter(r => r.status === 'Open').length
  const inProgressCount = allRisks.filter(r => r.status === 'In Progress').length
  const resolvedCount = allRisks.filter(r => r.status === 'Resolved').length
  const criticalCount = allRisks.filter(r => (r.severity === 'Critical' || r.severity === 'High') && r.status === 'Open').length

  if (analyses.length === 0) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" style={{ marginBottom: '20px' }}>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
        </svg>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          No risks yet
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Run your first site analysis to populate the risk register.
        </p>
        <button className="btn" onClick={() => navigate('/app/new-analysis')} style={{ padding: '10px 24px' }}>
          Run Analysis
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Risk Register
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          All risks aggregated across {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Risks', value: allRisks.length },
          { label: 'Open', value: openCount, color: 'var(--danger)' },
          { label: 'In Progress', value: inProgressCount, color: 'var(--warning)' },
          { label: 'Resolved', value: resolvedCount, color: 'var(--success)' },
          { label: 'Critical / High Open', value: criticalCount, color: criticalCount > 0 ? 'var(--danger)' : 'var(--success)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, color: color || 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Search risks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: '160px', fontSize: '13px', padding: '8px 12px' }}
        />
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: '13px', padding: '8px 10px' }}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={{ fontSize: '13px', padding: '8px 10px' }}>
          <option value="All">All Severities</option>
          {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: '13px', padding: '8px 10px' }}>
          <option value="severity">Sort: Severity</option>
          <option value="status">Sort: Status</option>
          <option value="project">Sort: Project</option>
          <option value="date">Sort: Date</option>
        </select>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
          {filtered.length} of {allRisks.length}
        </span>
      </div>

      {/* Risk list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No risks match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(risk => (
            <div key={risk.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>

                {/* Severity badge */}
                <div style={{
                  width: '4px', borderRadius: '2px', alignSelf: 'stretch', flexShrink: 0,
                  background: SEVERITY_COLORS[risk.severity] || 'var(--text-tertiary)',
                }} />

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                      {risk.title}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                      borderRadius: '4px', flexShrink: 0,
                      color: SEVERITY_COLORS[risk.severity] || 'var(--text-tertiary)',
                      background: `${SEVERITY_COLORS[risk.severity] || 'var(--text-tertiary)'}18`,
                    }}>
                      {risk.severity}
                    </span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
                      background: 'var(--bg-secondary)', color: 'var(--text-tertiary)',
                      border: '1px solid var(--border)',
                    }}>
                      {risk.category}
                    </span>
                  </div>

                  {risk.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {risk.description}
                    </p>
                  )}

                  {risk.recommendation && (
                    <p style={{ fontSize: '12px', color: 'var(--text-accent)', margin: '0 0 8px', lineHeight: 1.5 }}>
                      → {risk.recommendation}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {risk.projectName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {new Date(risk.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status select */}
                <select
                  value={risk.status}
                  onChange={e => handleStatusChange(risk.id, e.target.value)}
                  style={{
                    fontSize: '12px', padding: '5px 8px',
                    borderRadius: 'var(--radius-md)',
                    background: `${STATUS_COLORS[risk.status]}18`,
                    border: `1px solid ${STATUS_COLORS[risk.status]}`,
                    color: STATUS_COLORS[risk.status],
                    cursor: 'pointer', flexShrink: 0, fontWeight: 600,
                  }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
