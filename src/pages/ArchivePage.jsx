import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, HardHat, TriangleAlert, CheckCircle2, Plus } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import useAuthStore from '../store/useAuthStore'
import CircularScore from '../components/CircularScore'
import StarRating from '../components/StarRating'
import { CardSkeleton } from '../components/SkeletonCard'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS[d.getMonth()]
  const year = d.getFullYear()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} · ${h}:${m}`
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTER_TABS = ['All', 'High Risk', 'Medium Risk', 'Safe', 'Contract Issues']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'safety-high', label: 'Highest safety score' },
  { value: 'safety-low', label: 'Lowest safety score' },
  { value: 'contract-high', label: 'Highest contract score' },
]

// ── Icons ─────────────────────────────────────────────────────────────────────

// SearchIcon, TrashIcon from lucide-react

function ConstructionIcon() {
  return (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '72px', height: '72px' }}>
      {/* Ground slab */}
      <rect x="8" y="52" width="56" height="8" rx="3" fill="var(--border)" />
      {/* Building body */}
      <rect x="20" y="26" width="32" height="26" rx="2" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
      {/* Door */}
      <rect x="30" y="38" width="12" height="14" rx="1" fill="var(--border)" />
      {/* Roof beam */}
      <rect x="16" y="20" width="40" height="7" rx="2" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1.5" />
      {/* Windows */}
      <rect x="24" y="30" width="8" height="6" rx="1" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1" />
      <rect x="40" y="30" width="8" height="6" rx="1" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1" />
      {/* Crane arm */}
      <line x1="56" y1="8" x2="56" y2="30" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="8" x2="60" y2="8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="8" x2="48" y2="18" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      {/* Crane base */}
      <rect x="53" y="30" width="6" height="22" rx="1" fill="var(--border)" />
    </svg>
  )
}

// ── Summary Stats Bar ─────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
      <div style={{
        fontSize: '22px',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        color: 'var(--text-primary)',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
        {label}
      </div>
    </div>
  )
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({ analysis, onViewReport, onDelete }) {
  const safety = analysis.reportData?.safetyScore ?? 0
  const contract = analysis.reportData?.contractScore ?? null
  const riskCount = analysis.reportData?.riskCount ?? { high: 0, medium: 0, low: 0 }
  const starScore = (safety ?? 0) + (contract ?? 0)

  const isHighRisk = safety < 45
  const hasContractIssues = contract !== null && contract < 45
  const isPerformingWell = safety >= 70 && (contract === null || contract >= 70)

  return (
    <div className="card" style={{ padding: '18px 20px' }}>

      {/* Top row: project name + ID badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {analysis.projectName || 'Unnamed Project'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {analysis.companyName || '—'}
          </div>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          background: 'var(--accent-dim)',
          color: 'var(--text-accent)',
          borderRadius: '20px',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {analysis.id}
        </span>
      </div>

      {/* State + Phase + Workers row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {analysis.selectedState && (
          <span className="badge-accent">{analysis.selectedState}</span>
        )}
        {analysis.constructionPhase && (
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '20px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}>
            {analysis.constructionPhase}
          </span>
        )}
        {analysis.workerCount && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HardHat size={12} />
            {analysis.workerCount} workers
          </span>
        )}
      </div>

      {/* Scores row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CircularScore score={safety} size={56} label="Safety" />
          {contract !== null && (
            <CircularScore score={contract} size={56} label="Contract" />
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <StarRating score={starScore} size={16} />
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginTop: '5px',
          }}>
            {formatDate(analysis.createdAt)}
          </div>
        </div>
      </div>

      {/* Risk summary */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <span className="badge-danger">{riskCount.high ?? 0} High</span>
        <span className="badge-warning">{riskCount.medium ?? 0} Medium</span>
        <span className="badge-success">{riskCount.low ?? 0} Low</span>
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 14px' }} />

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          {isHighRisk && (
            <div style={{ fontSize: '12px', color: 'var(--danger)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TriangleAlert size={12} /> High risk — immediate action required
            </div>
          )}
          {hasContractIssues && (
            <div style={{ fontSize: '12px', color: 'var(--warning)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TriangleAlert size={12} /> Contract issues detected
            </div>
          )}
          {isPerformingWell && (
            <div style={{ fontSize: '12px', color: 'var(--success)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Site performing well
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
            onClick={() => onViewReport(analysis)}
          >
            View Report
          </button>
          <button
            onClick={() => onDelete(analysis)}
            title="Delete analysis"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ArchivePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { analyses, setReportData, setProjectInfo, setAnalysisId, removeAnalysis, loadAnalysesFromDb } = useAppStore()

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [dbLoading, setDbLoading] = useState(false)

  useEffect(() => {
    setDbLoading(true)
    loadAnalysesFromDb(user?.id).finally(() => setDbLoading(false))
  }, [user?.id])

  // Unique project count
  const uniqueProjects = useMemo(
    () => new Set(analyses.map(a => a.projectName).filter(Boolean)).size,
    [analyses]
  )

  // Filtered + sorted analyses
  const filtered = useMemo(() => {
    let result = [...analyses]

    // Search
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(a =>
        a.projectName?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q)
      )
    }

    // Filter tabs
    if (activeFilter === 'High Risk') {
      result = result.filter(a => (a.reportData?.safetyScore ?? 0) < 45)
    } else if (activeFilter === 'Medium Risk') {
      result = result.filter(a => {
        const s = a.reportData?.safetyScore ?? 0
        return s >= 45 && s < 70
      })
    } else if (activeFilter === 'Safe') {
      result = result.filter(a => (a.reportData?.safetyScore ?? 0) >= 70)
    } else if (activeFilter === 'Contract Issues') {
      result = result.filter(a => (a.reportData?.contractScore ?? 0) < 45)
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'safety-high') {
      result.sort((a, b) => (b.reportData?.safetyScore ?? 0) - (a.reportData?.safetyScore ?? 0))
    } else if (sortBy === 'safety-low') {
      result.sort((a, b) => (a.reportData?.safetyScore ?? 0) - (b.reportData?.safetyScore ?? 0))
    } else if (sortBy === 'contract-high') {
      result.sort((a, b) => (b.reportData?.contractScore ?? 0) - (a.reportData?.contractScore ?? 0))
    }

    return result
  }, [analyses, search, activeFilter, sortBy])

  // Summary stats (only when there are analyses)
  const stats = useMemo(() => {
    if (!analyses.length) return null
    const count = analyses.length
    const safetyAvg = Math.round(
      analyses.reduce((s, a) => s + (a.reportData?.safetyScore ?? 0), 0) / count
    )
    const contractAvg = Math.round(
      analyses.reduce((s, a) => s + (a.reportData?.contractScore ?? 0), 0) / count
    )
    const totalHigh = analyses.reduce(
      (s, a) => s + (a.reportData?.riskCount?.high ?? 0), 0
    )
    const stateCounts = {}
    analyses.forEach(a => {
      if (a.selectedState) stateCounts[a.selectedState] = (stateCounts[a.selectedState] || 0) + 1
    })
    const mostCommonState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { safetyAvg, contractAvg, totalHigh, mostCommonState }
  }, [analyses])

  // Handlers
  function handleViewReport(analysis) {
    setReportData(analysis.reportData)
    setProjectInfo({
      projectName: analysis.projectName || '',
      company: analysis.companyName || '',
      siteLocation: analysis.selectedState || '',
      siteManager: '',
    })
    setAnalysisId(analysis.id)
    navigate('/app/report')
  }

  function handleDelete(analysis) {
    const ok = window.confirm('Delete this analysis?\nThis cannot be undone.')
    if (ok) removeAnalysis(analysis.id)
  }

  // Empty state type
  const totalEmpty = analyses.length === 0
  const hasSearch = search.trim().length > 0
  const hasFilter = activeFilter !== 'All'
  const resultsEmpty = !totalEmpty && filtered.length === 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}>
            Project Archive
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} · {uniqueProjects} {uniqueProjects === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/app/new-analysis')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} strokeWidth={2.5} />
          Run Analysis
        </button>
      </div>

      {/* ── Filter & Search bar — only shown when there are analyses ── */}
      {!totalEmpty && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {/* Search input */}
          <div style={{ position: 'relative', width: '280px', flexShrink: 0 }}>
            <span style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
              display: 'flex',
            }}>
              <Search size={15} />
            </span>
            <input
              className="input"
              style={{ width: '100%', paddingLeft: '34px', boxSizing: 'border-box' }}
              placeholder="Search by project or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs + sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: activeFilter === tab
                      ? '1px solid var(--accent)'
                      : '1px solid var(--border)',
                    background: activeFilter === tab ? 'var(--accent-dim)' : 'transparent',
                    color: activeFilter === tab ? 'var(--text-accent)' : 'var(--text-secondary)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <select
              className="input"
              style={{ width: '160px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Summary stats bar ── */}
      {analyses.length > 0 && stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <StatCard label="Avg Safety Score" value={stats.safetyAvg} />
          <StatCard label="Avg Contract Score" value={stats.contractAvg} />
          <StatCard label="Total High Risks" value={stats.totalHigh} />
          <StatCard label="Top State Analysed" value={stats.mostCommonState} />
        </div>
      )}

      {/* ── DB loading skeletons ── */}
      {dbLoading && analyses.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '12px' }}>
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
          <CardSkeleton lines={3} />
        </div>
      )}

      {/* ── Empty state: no analyses at all ── */}
      {!dbLoading && totalEmpty && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '20px', color: 'var(--text-tertiary)' }}>
            <ConstructionIcon />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            No projects yet
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>
            Run your first site analysis to build your project archive
          </p>
          <button className="btn-primary" onClick={() => navigate('/app/new-analysis')}>
            Start first analysis →
          </button>
        </div>
      )}

      {/* ── Empty state: search returns nothing ── */}
      {resultsEmpty && hasSearch && !hasFilter && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            No projects match your search
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            Try a different search term
          </p>
          <button
            onClick={() => setSearch('')}
            style={{
              fontSize: '14px',
              color: 'var(--text-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Empty state: filter returns nothing ── */}
      {resultsEmpty && hasFilter && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            {activeFilter === 'Safe'
              ? 'No safe projects found'
              : `No ${activeFilter} projects found`}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            {activeFilter === 'Safe'
              ? 'All projects are performing well'
              : `No projects match the "${activeFilter}" filter`}
          </p>
          <button
            onClick={() => { setActiveFilter('All'); setSearch('') }}
            style={{
              fontSize: '14px',
              color: 'var(--text-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* ── Project cards grid ── */}
      {filtered.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map(analysis => (
            <ProjectCard
              key={analysis.id}
              analysis={analysis}
              onViewReport={handleViewReport}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
