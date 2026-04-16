import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

const CHECKLIST_ITEMS = [
  { id: 'ppe', label: 'PPE compliance verified (helmets, vests, boots)' },
  { id: 'scaffold', label: 'Scaffolding and working-at-height systems inspected' },
  { id: 'excavation', label: 'Excavation shoring and safety barriers in place' },
  { id: 'electrical', label: 'Temporary electrical installations checked' },
  { id: 'fire', label: 'Fire extinguishers and emergency exits accessible' },
  { id: 'coshh', label: 'Hazardous materials stored and labelled correctly' },
  { id: 'welfare', label: 'Welfare facilities (toilets, water, first aid) available' },
  { id: 'permit', label: 'Permit to work issued for high-risk activities' },
]

const HAZARD_TYPES = [
  'Fall from height', 'Struck by object', 'Electrical hazard', 'Excavation collapse',
  'Plant/machinery', 'Fire risk', 'Structural failure', 'Chemical exposure', 'Other',
]

export default function SafetyPage() {
  const navigate = useNavigate()
  const { setPhotoFile, setSiteDescription, setDocText } = useAppStore()

  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setLocalPhotoFile] = useState(null)
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState({})
  const [selectedHazards, setSelectedHazards] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setLocalPhotoFile(file)
    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function toggleHazard(h) {
    setSelectedHazards(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])
  }

  function toggleCheck(id) {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleRunAnalysis() {
    // Build description with context
    const checklistNotes = CHECKLIST_ITEMS
      .filter(item => checklist[item.id] === false)
      .map(item => `FAIL: ${item.label}`)
      .join('\n')

    const hazardNotes = selectedHazards.length > 0
      ? `Identified hazard types: ${selectedHazards.join(', ')}.`
      : ''

    const fullDescription = [description.trim(), hazardNotes, checklistNotes].filter(Boolean).join('\n\n')

    if (photoFile) setPhotoFile(photoFile)
    if (fullDescription) setSiteDescription(fullDescription)
    setDocText('')

    navigate('/app/new-analysis')
  }

  const checkedCount = CHECKLIST_ITEMS.filter(item => checklist[item.id] === true).length
  const failedCount = CHECKLIST_ITEMS.filter(item => checklist[item.id] === false).length
  const canAnalyse = photoFile || description.trim().length > 10

  return (
    <div style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Safety Monitor
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Upload a site photo and complete the pre-analysis checklist to get an AI safety report
        </p>
      </div>

      {/* Photo upload */}
      <div style={{ marginBottom: '24px' }}>
        <SectionLabel>Site Photo</SectionLabel>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : photoFile ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '24px',
            textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'var(--accent-dim)' : 'var(--bg-secondary)',
            transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            minHeight: photoPreview ? '200px' : '120px',
          }}
        >
          {photoPreview ? (
            <div style={{ position: 'relative' }}>
              <img src={photoPreview} alt="Site preview" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                ✓ {photoFile?.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Click to replace</div>
            </div>
          ) : (
            <>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ marginBottom: '10px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Upload site photo
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Drag & drop or click — JPG, PNG, WEBP
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={e => handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Site description */}
      <div style={{ marginBottom: '24px' }}>
        <SectionLabel>Site Description (Optional)</SectionLabel>
        <textarea
          className="input"
          rows={4}
          placeholder="Describe site conditions, ongoing activities, number of workers, and any concerns you've already identified..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', fontSize: '13px', lineHeight: 1.6, resize: 'vertical' }}
        />
      </div>

      {/* Hazard types */}
      <div style={{ marginBottom: '24px' }}>
        <SectionLabel>Hazard Types Present</SectionLabel>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {HAZARD_TYPES.map(h => {
            const active = selectedHazards.includes(h)
            return (
              <button
                key={h}
                onClick={() => toggleHazard(h)}
                style={{
                  fontSize: '12px', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                  background: active ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {h}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pre-analysis checklist */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <SectionLabel>Pre-Analysis Safety Checklist</SectionLabel>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
            <span style={{ color: 'var(--success)' }}>✓ {checkedCount} pass</span>
            {failedCount > 0 && <span style={{ color: 'var(--danger)' }}>✗ {failedCount} fail</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {CHECKLIST_ITEMS.map(item => {
            const state = checklist[item.id] // true = pass, false = fail, undefined = not checked
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Pass */}
                <button
                  onClick={() => setChecklist(prev => ({ ...prev, [item.id]: prev[item.id] === true ? undefined : true }))}
                  style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-md)',
                    background: state === true ? 'var(--success)' : 'var(--bg-secondary)',
                    border: `1px solid ${state === true ? 'var(--success)' : 'var(--border)'}`,
                    color: state === true ? '#fff' : 'var(--text-tertiary)',
                    cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}
                  title="Pass"
                >✓</button>
                {/* Fail */}
                <button
                  onClick={() => setChecklist(prev => ({ ...prev, [item.id]: prev[item.id] === false ? undefined : false }))}
                  style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-md)',
                    background: state === false ? 'var(--danger)' : 'var(--bg-secondary)',
                    border: `1px solid ${state === false ? 'var(--danger)' : 'var(--border)'}`,
                    color: state === false ? '#fff' : 'var(--text-tertiary)',
                    cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}
                  title="Fail"
                >✗</button>
                <span style={{ fontSize: '13px', color: state === false ? 'var(--danger)' : state === true ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Ready to run the AI safety analysis?
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {canAnalyse
              ? 'Your inputs will be pre-loaded into the analysis engine.'
              : 'Add a photo or site description to continue.'}
          </div>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={!canAnalyse}
          className="btn"
          style={{
            padding: '12px 28px', fontSize: '14px', fontWeight: 700,
            opacity: canAnalyse ? 1 : 0.4, cursor: canAnalyse ? 'pointer' : 'not-allowed',
          }}
        >
          Run Safety Analysis →
        </button>
      </div>
    </div>
  )
}
