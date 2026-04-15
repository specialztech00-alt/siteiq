import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import useAuthStore from '../store/useAuthStore.js'
import StepIndicator from '../components/StepIndicator.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useWeather } from '../components/WeatherWidget.jsx'
import { getStateNames, getStateByName } from '../data/nigeriaStates.js'
import {
  getCurrentWeather,
  getConstructionSafetyRating,
  getWeatherIcon,
  getWeatherDescription,
} from '../lib/weather.js'
import { DEMO_SCENARIOS, FALLBACK_DEMO_REPORT } from '../lib/prompts.js'
import { detectObjects, extractEntities } from '../lib/huggingface.js'
import { extractTextFromFile } from '../lib/pdfParser.js'
import { analyseSite } from '../lib/claude.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Site Details' },
  { label: 'Upload Files' },
  { label: 'Analysing' },
  { label: 'Report' },
]

const CONSTRUCTION_PHASES = [
  'Site preparation & clearing',
  'Excavation & earthworks',
  'Foundation works',
  'Substructure (below ground)',
  'Structural frame',
  'Roofing works',
  'External envelope',
  'MEP rough-in',
  'Internal finishes',
  'External works & landscaping',
  'Commissioning & handover',
]

// ── Small UI atoms ────────────────────────────────────────────────────────────

function FormField({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Weather preview (Step 1) ──────────────────────────────────────────────────

function WeatherPreview({ stateName }) {
  const { weather, loading, error } = useWeather(stateName)

  if (loading) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Loading weather for {stateName}...</span>
      </div>
    )
  }

  if (error || !weather) return null

  const safety = getConstructionSafetyRating(weather)
  const safetyColor = safety.rating === 'Danger' ? 'var(--danger)' : safety.rating === 'Caution' ? 'var(--warning)' : 'var(--success)'
  const safetyBg = safety.rating === 'Danger' ? 'var(--danger-bg)' : safety.rating === 'Caution' ? 'var(--warning-bg)' : 'var(--success-bg)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{getWeatherIcon(weather.weathercode)}</span>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {Math.round(weather.temperature_2m)}°C
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {getWeatherDescription(weather.weathercode)} · {stateName}
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '20px',
          background: safetyBg,
          color: safetyColor,
          whiteSpace: 'nowrap',
        }}>
          {safety.rating === 'Safe' ? '✓ Safe to work' : safety.rating === 'Caution' ? '⚠ Use caution' : '✕ Suspend operations'}
        </span>
      </div>

      {safety.alerts.length > 0 && (
        <div style={{
          background: safety.rating === 'Danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
          border: `1px solid ${safetyColor}33`,
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: safetyColor, marginBottom: '4px' }}>
            ⚠ Current conditions in {stateName}:
          </p>
          {safety.alerts.map((alert, i) => (
            <p key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {alert.message}
            </p>
          ))}
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Factor this into your site operations today.
          </p>
        </div>
      )}
    </div>
  )
}

// ── FileUploadZone ────────────────────────────────────────────────────────────

function FileUploadZone({ accept, icon, title, subtitle, file, onFile, onRemove, extracting, extracted, children }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const borderColor = file
    ? 'var(--success)'
    : dragging
    ? 'var(--accent)'
    : 'var(--border)'

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }, [onFile])

  return (
    <div
      style={{
        background: dragging ? 'var(--accent-dim)' : 'var(--bg-card)',
        border: `1.5px dashed ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'center',
        cursor: file ? 'default' : 'pointer',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        minHeight: '180px',
        justifyContent: 'center',
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />

      {!file ? (
        <>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            {icon}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{subtitle}</p>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-accent)', fontWeight: 500 }}>Browse files</span>
        </>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {children}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
            }}>
              ✓ Ready
            </span>
            {extracting && (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Extracting text...</span>
            )}
            {extracted && (
              <span style={{ fontSize: '11px', color: 'var(--success)' }}>✓ {extracted}</span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{file.name}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            {(file.size / 1024).toFixed(0)} KB
          </p>
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            style={{
              fontSize: '12px',
              color: 'var(--danger)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function NewAnalysisPage() {
  const navigate = useNavigate()
  const { selectedState, setSelectedState, setReportData, setProjectInfo, setAnalysisId, addAnalysis } = useAppStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [projectInfo, setLocalProjectInfo] = useState({
    projectName: '',
    companyName: '',
    siteLocation: '',
    siteManagerName: '',
    selectedState: selectedState,
    constructionPhase: '',
    workerCount: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [docFile, setDocFile] = useState(null)
  const [docText, setDocText] = useState('')
  const [docExtracting, setDocExtracting] = useState(false)
  const [docWordCount, setDocWordCount] = useState(null)
  const [siteDescription, setSiteDescription] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [errors, setErrors] = useState({})

  const stateNames = getStateNames()

  // ── Field helpers ───────────────────────────────────────────────────────────

  function updateField(key, value) {
    setLocalProjectInfo(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }))
  }

  function handleStateChange(stateName) {
    updateField('selectedState', stateName)
    setSelectedState(stateName)
  }

  // ── Photo handling ──────────────────────────────────────────────────────────

  function handlePhotoFile(file) {
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  // ── Contract handling ───────────────────────────────────────────────────────

  async function handleDocFile(file) {
    setDocFile(file)
    setDocExtracting(true)
    setDocWordCount(null)
    try {
      const text = await extractTextFromFile(file)
      setDocText(text)
      const words = text.trim().split(/\s+/).filter(Boolean).length
      setDocWordCount(words.toLocaleString())
    } catch {
      setDocText('')
    } finally {
      setDocExtracting(false)
    }
  }

  function removeDoc() {
    setDocFile(null)
    setDocText('')
    setDocWordCount(null)
    setDocExtracting(false)
  }

  // ── Demo scenarios ──────────────────────────────────────────────────────────

  function loadScenario(scenario) {
    setSiteDescription(scenario.siteDescription)
    if (!docText) setDocText(scenario.contractText)
  }

  // ── Step 1 validation ───────────────────────────────────────────────────────

  function validateStep1() {
    const newErrors = {}
    if (!projectInfo.projectName.trim()) newErrors.projectName = true
    if (!projectInfo.companyName.trim()) newErrors.companyName = true
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Run analysis ────────────────────────────────────────────────────────────

  async function runAnalysis() {
    setCurrentStep(3)
    setLoadingStep(0)

    try {
      const stateData = getStateByName(projectInfo.selectedState)

      // Step 0 — Weather context
      let weatherContext = ''
      try {
        if (stateData) {
          const weather = await getCurrentWeather(stateData.lat, stateData.lng)
          const safetyRating = getConstructionSafetyRating(weather)
          weatherContext = `
CURRENT WEATHER — ${projectInfo.selectedState}:
Temperature: ${Math.round(weather.temperature_2m)}°C (feels like ${Math.round(weather.apparent_temperature)}°C)
Wind speed: ${Math.round(weather.windspeed_10m)} km/h
Precipitation: ${weather.precipitation}mm
Humidity: ${weather.relative_humidity_2m}%
Conditions: ${getWeatherDescription(weather.weathercode)}
Construction safety rating: ${safetyRating.rating}
Active weather alerts: ${safetyRating.alerts.map(a => a.message).join('; ') || 'None'}`
        }
      } catch {
        weatherContext = `Weather data unavailable for ${projectInfo.selectedState}`
      }

      // Step 1 — Geo context
      setLoadingStep(1)
      let geoContext = ''
      if (stateData) {
        geoContext = `
GROUND CONDITIONS — ${projectInfo.selectedState}:
Soil type: ${stateData.soil.type}
Bearing capacity: ${stateData.soil.bearingCapacity}
Water table: ${stateData.soil.waterTable}
Foundation recommendation: ${stateData.soil.foundationRec}
Special considerations: ${stateData.soil.specialConsiderations}
Flood risk: ${stateData.risks.flood}
Erosion risk: ${stateData.risks.erosion}
Rainy season: ${stateData.rainy.start} to ${stateData.rainy.end}
Construction impact: ${stateData.rainy.constructionImpact}
Regulatory body: ${stateData.regulatory.body}`
      }

      // Step 2 — HF image detection
      setLoadingStep(2)
      let detectedObjects = []
      if (photoFile) {
        try {
          const dets = await detectObjects(photoFile)
          detectedObjects = dets.map(d => `${d.label} (${Math.round((d.score ?? 0) * 100)}% confidence)`)
        } catch {
          detectedObjects = []
        }
      }

      // Step 3 — PDF extraction (already done async, use cached)
      setLoadingStep(3)
      let contractText = docText || ''
      if (docFile && !contractText) {
        try {
          contractText = await extractTextFromFile(docFile)
        } catch {
          contractText = ''
        }
      }

      // Step 4 — NER
      setLoadingStep(4)
      let nerEntities = []
      if (contractText) {
        try {
          nerEntities = await extractEntities(contractText.slice(0, 500))
        } catch {
          nerEntities = []
        }
      }

      // Step 5 — Build enhanced description
      setLoadingStep(5)
      const projectContext = `PROJECT INFORMATION:
Project name: ${projectInfo.projectName}
Company: ${projectInfo.companyName}
Site location: ${projectInfo.siteLocation || 'Not specified'}
Site manager: ${projectInfo.siteManagerName || 'Not specified'}
Nigerian state: ${projectInfo.selectedState}
Construction phase: ${projectInfo.constructionPhase || 'Not specified'}
Workers on site: ${projectInfo.workerCount || 'Not specified'}`

      const enrichedDescription = [
        projectContext,
        weatherContext,
        geoContext,
        siteDescription ? `SITE CONDITIONS (described by manager):\n${siteDescription}` : '',
      ].filter(Boolean).join('\n\n')

      // Step 6 — Claude analysis
      setLoadingStep(6)
      const report = await analyseSite({
        siteDescription: enrichedDescription,
        detectedObjects,
        contractText,
        nerEntities,
      })

      // Step 7 — Save and navigate
      setLoadingStep(7)

      const analysisId = 'SITEIQ-' + Math.random().toString(36).substr(2, 6).toUpperCase()

      setProjectInfo({
        projectName: projectInfo.projectName,
        company: projectInfo.companyName,
        siteLocation: projectInfo.siteLocation,
        siteManager: projectInfo.siteManagerName,
      })
      setAnalysisId(analysisId)
      setReportData(report)
      addAnalysis({
        id: analysisId,
        projectName: projectInfo.projectName,
        companyName: projectInfo.companyName,
        selectedState: projectInfo.selectedState,
        constructionPhase: projectInfo.constructionPhase,
        reportData: report,
        createdAt: new Date().toISOString(),
      })

      navigate('/app/report')
    } catch (err) {
      console.error('Analysis failed:', err)
      setReportData({ ...FALLBACK_DEMO_REPORT, _isFallback: true })
      navigate('/app/report')
    }
  }

  // ── Step 3 overlay ──────────────────────────────────────────────────────────

  if (currentStep === 3) {
    return <LoadingScreen currentStep={loadingStep} />
  }

  // ── Step 1 & 2 layout ───────────────────────────────────────────────────────

  const step1Valid = projectInfo.projectName.trim() && projectInfo.companyName.trim()
  const step2Valid = photoFile !== null || siteDescription.trim().length > 0

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Step indicator */}
      <div style={{ marginBottom: '32px' }}>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Tell us about your site
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              This information personalises your analysis for Nigerian conditions
            </p>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 2×2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <FormField label="Project name" required>
                <input
                  className={`input${errors.projectName ? ' input-error' : ''}`}
                  placeholder="e.g. Lekki Office Complex Phase 2"
                  value={projectInfo.projectName}
                  onChange={e => updateField('projectName', e.target.value)}
                  style={{ borderColor: errors.projectName ? 'var(--danger)' : undefined }}
                />
                {errors.projectName && (
                  <span style={{ fontSize: '11px', color: 'var(--danger)' }}>Project name is required</span>
                )}
              </FormField>

              <FormField label="Company name" required>
                <input
                  className="input"
                  placeholder="e.g. BuildRight Nigeria Ltd"
                  value={projectInfo.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  style={{ borderColor: errors.companyName ? 'var(--danger)' : undefined }}
                />
                {errors.companyName && (
                  <span style={{ fontSize: '11px', color: 'var(--danger)' }}>Company name is required</span>
                )}
              </FormField>

              <FormField label="Site address">
                <input
                  className="input"
                  placeholder="e.g. 14 Admiralty Way, Lekki, Lagos"
                  value={projectInfo.siteLocation}
                  onChange={e => updateField('siteLocation', e.target.value)}
                />
              </FormField>

              <FormField label="Site manager">
                <input
                  className="input"
                  placeholder="Full name"
                  value={projectInfo.siteManagerName}
                  onChange={e => updateField('siteManagerName', e.target.value)}
                />
              </FormField>
            </div>

            {/* State selector */}
            <FormField label="State where site is located" required>
              <select
                className="input"
                value={projectInfo.selectedState}
                onChange={e => handleStateChange(e.target.value)}
              >
                {stateNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </FormField>

            {/* Weather preview */}
            <WeatherPreview stateName={projectInfo.selectedState} />

            {/* Construction phase + worker count */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <FormField label="Current construction phase">
                <select
                  className="input"
                  value={projectInfo.constructionPhase}
                  onChange={e => updateField('constructionPhase', e.target.value)}
                >
                  <option value="">Select phase...</option>
                  {CONSTRUCTION_PHASES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Number of workers on site today">
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="e.g. 24"
                  value={projectInfo.workerCount}
                  onChange={e => updateField('workerCount', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              className="btn-primary"
              disabled={!step1Valid}
              onClick={() => {
                if (validateStep1()) setCurrentStep(2)
              }}
              style={{ opacity: step1Valid ? 1 : 0.5, cursor: step1Valid ? 'pointer' : 'not-allowed' }}
            >
              Next: Upload Files →
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Upload site evidence
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Photo and contract optional — text description alone works too
            </p>
          </div>

          {/* Project info summary bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            {[
              projectInfo.projectName,
              projectInfo.selectedState,
              projectInfo.constructionPhase,
              projectInfo.workerCount ? `${projectInfo.workerCount} workers` : null,
            ].filter(Boolean).map((item, i) => (
              <span key={i} style={{
                fontSize: '12px',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
                {item}
              </span>
            ))}
            <button
              onClick={() => setCurrentStep(1)}
              style={{ fontSize: '12px', color: 'var(--text-accent)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
              Edit
            </button>
          </div>

          {/* Upload zones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <FileUploadZone
              accept="image/jpeg,image/png,image/webp"
              icon="📷"
              title="Site photo"
              subtitle="JPG, PNG, WEBP · Max 10MB"
              file={photoFile}
              onFile={handlePhotoFile}
              onRemove={removePhoto}
            >
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Site preview"
                  style={{ maxHeight: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
              )}
            </FileUploadZone>

            <FileUploadZone
              accept=".pdf,.txt,.docx"
              icon="📄"
              title="Contract document"
              subtitle="PDF, TXT, DOCX · Max 25MB"
              file={docFile}
              onFile={handleDocFile}
              onRemove={removeDoc}
              extracting={docExtracting}
              extracted={docWordCount ? `Text extracted (${docWordCount} words)` : null}
            />
          </div>

          {/* Description textarea */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Describe site conditions
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Required if no photo uploaded. The more detail you provide, the more accurate the analysis.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                className="input"
                style={{ minHeight: '120px', resize: 'vertical', width: '100%', boxSizing: 'border-box', paddingBottom: '24px' }}
                placeholder="Describe what you see on site today — worker activities, equipment in use, any concerns you've noticed, progress status, weather conditions at the time..."
                value={siteDescription}
                maxLength={2000}
                onChange={e => setSiteDescription(e.target.value)}
              />
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '10px',
                fontSize: '11px',
                color: siteDescription.length > 1800 ? 'var(--warning)' : 'var(--text-tertiary)',
              }}>
                {siteDescription.length} / 2000
              </span>
            </div>
          </div>

          {/* Demo scenarios */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Or load a demo scenario
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DEMO_SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => loadScenario(scenario)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {scenario.icon} {scenario.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <button
              className="btn-ghost"
              onClick={() => setCurrentStep(1)}
            >
              ← Back
            </button>
            <button
              className="btn-primary"
              disabled={!step2Valid}
              onClick={runAnalysis}
              style={{ opacity: step2Valid ? 1 : 0.5, cursor: step2Valid ? 'pointer' : 'not-allowed' }}
            >
              Start Analysis →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
