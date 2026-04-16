import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { extractTextFromFile } from '../lib/pdfParser.js'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

const CONTRACT_TYPES = ['JCT', 'NEC4', 'FIDIC', 'JBCC', 'EPC / Turnkey', 'BOQ Lump Sum', 'Labour-Only', 'Measured Works', 'Other / Bespoke']

const KEY_CLAUSES = [
  { id: 'ld', label: 'Liquidated Damages (LD)', desc: 'Rate and cap on delay penalties' },
  { id: 'eot', label: 'Extension of Time (EOT)', desc: 'Grounds and notice periods' },
  { id: 'variation', label: 'Variation Order Procedure', desc: 'Written instruction requirements' },
  { id: 'retention', label: 'Retention Money', desc: 'Percentage held and release conditions' },
  { id: 'dispute', label: 'Dispute Resolution', desc: 'ADR/arbitration/court jurisdiction' },
  { id: 'insurance', label: 'Insurance Requirements', desc: 'Contractor\'s all risk / public liability' },
]

export default function ContractPage() {
  const navigate = useNavigate()
  const { setDocFile, setDocText, setPhotoFile, setSiteDescription } = useAppStore()

  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [contractType, setContractType] = useState('')
  const [projectValue, setProjectValue] = useState('')
  const [notes, setNotes] = useState('')
  const [checkedClauses, setCheckedClauses] = useState({})
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [extractedPreview, setExtractedPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [tab, setTab] = useState('upload') // 'upload' | 'paste'
  const fileInputRef = useRef(null)

  async function handleFile(selectedFile) {
    if (!selectedFile) return
    setFile(selectedFile)
    setExtractedPreview(null)
    setExtractError(null)

    if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
      setExtracting(true)
      try {
        const text = await extractTextFromFile(selectedFile)
        setExtractedPreview(text.slice(0, 400) + (text.length > 400 ? '…' : ''))
        setExtractError(null)
      } catch (err) {
        setExtractError('Could not extract text from PDF. You can paste the contract text instead.')
      } finally {
        setExtracting(false)
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function toggleClause(id) {
    setCheckedClauses(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleAnalyse() {
    const clauseNotes = Object.entries(checkedClauses)
      .filter(([, checked]) => checked)
      .map(([id]) => {
        const clause = KEY_CLAUSES.find(c => c.id === id)
        return clause ? `Review required: ${clause.label} — ${clause.desc}` : null
      })
      .filter(Boolean)
      .join('\n')

    const contextNote = [
      contractType && `Contract type: ${contractType}.`,
      projectValue && `Project value: ₦${projectValue}.`,
      notes.trim() && `Notes: ${notes.trim()}`,
      clauseNotes,
    ].filter(Boolean).join('\n')

    if (tab === 'paste' && pastedText.trim()) {
      const fullText = contextNote ? `${contextNote}\n\n---CONTRACT TEXT---\n${pastedText}` : pastedText
      setDocText(fullText)
      setDocFile(null)
    } else if (file) {
      setDocFile(file)
      if (contextNote) setDocText(contextNote)
    }

    setPhotoFile(null)
    setSiteDescription('')

    navigate('/app/new-analysis')
  }

  const canAnalyse = tab === 'paste' ? pastedText.trim().length > 50 : file !== null

  return (
    <div style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Contract Analyser
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Upload or paste a contract to get AI-powered risk, LD, and obligation analysis
        </p>
      </div>

      {/* Contract context */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Contract Details</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Contract Standard
            </label>
            <select
              className="input"
              value={contractType}
              onChange={e => setContractType(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px' }}
            >
              <option value="">Select type (optional)...</option>
              {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Contract Value (₦)
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. 150,000,000"
              value={projectValue}
              onChange={e => setProjectValue(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Additional Notes
          </label>
          <textarea
            className="input"
            rows={2}
            placeholder="Anything specific you want the AI to focus on..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Key clauses checklist */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <SectionLabel>Flag Clauses for Review</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {KEY_CLAUSES.map(clause => {
            const checked = !!checkedClauses[clause.id]
            return (
              <button
                key={clause.id}
                onClick={() => toggleClause(clause.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
                  background: checked ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                  border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                  background: checked ? 'var(--accent)' : 'transparent',
                  border: `2px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {checked && <span style={{ fontSize: '10px', color: '#0f1114', fontWeight: 900 }}>✓</span>}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: checked ? 'var(--text-accent)' : 'var(--text-primary)' }}>
                    {clause.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {clause.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Upload / paste tabs */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '3px', width: 'fit-content', marginBottom: '16px' }}>
          {[['upload', 'Upload PDF / DOCX'], ['paste', 'Paste Text']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '7px 18px', borderRadius: 'calc(var(--radius-md) - 2px)', border: 'none',
                background: tab === id ? 'var(--accent)' : 'transparent',
                color: tab === id ? '#0f1114' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: tab === id ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'upload' ? (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center',
                cursor: 'pointer', background: dragOver ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {file ? (
                <div>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" style={{ marginBottom: '10px' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    <polyline points="9 15 11 17 15 13" />
                  </svg>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {extracting ? 'Extracting text…' : extractedPreview ? 'Text extracted successfully' : 'Click to replace'}
                  </div>
                </div>
              ) : (
                <div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ marginBottom: '10px' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="12" y2="12" /><line x1="15" y1="15" x2="12" y2="12" />
                  </svg>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Upload contract document
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>PDF, DOCX, or TXT — drag & drop or click</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={e => handleFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>

            {extractError && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--danger)' }}>
                {extractError}
              </div>
            )}

            {extractedPreview && !extractError && (
              <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
                  Extracted preview
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                  {extractedPreview}
                </p>
              </div>
            )}
          </>
        ) : (
          <textarea
            className="input"
            rows={10}
            placeholder="Paste the full contract text here. Include all clauses — the AI will identify risk areas, obligations, and key dates..."
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px', lineHeight: 1.6, resize: 'vertical', fontFamily: 'var(--font-mono)' }}
          />
        )}
      </div>

      {/* CTA */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Ready to analyse this contract?
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {canAnalyse
              ? 'Claude will identify risk clauses, LD exposure, obligations, and PM actions.'
              : tab === 'paste' ? 'Paste at least 50 characters of contract text.' : 'Upload a contract document to continue.'}
          </div>
        </div>
        <button
          onClick={handleAnalyse}
          disabled={!canAnalyse}
          className="btn"
          style={{
            padding: '12px 28px', fontSize: '14px', fontWeight: 700,
            opacity: canAnalyse ? 1 : 0.4, cursor: canAnalyse ? 'pointer' : 'not-allowed',
          }}
        >
          Analyse Contract →
        </button>
      </div>
    </div>
  )
}
