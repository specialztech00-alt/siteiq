import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import UploadZone from '../components/UploadZone.jsx'
import DemoScenarios from '../components/DemoScenarios.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import useAppStore from '../store/useAppStore.js'

export default function HomePage() {
  const navigate = useNavigate()
  const [activeDemoId, setActiveDemoId] = useState(null)

  const {
    photoFile, setPhotoFile,
    docFile, setDocFile,
    docText,
    siteDescription, setSiteDescription,
    isLoading, loadingStep, loadingError,
    runAnalysis,
  } = useAppStore()

  async function handleAnalyse() {
    const ok = await runAnalysis()
    if (ok) navigate('/report')
  }

  const hasAnyInput = photoFile || docFile || siteDescription.trim() || docText

  if (isLoading) {
    return <LoadingScreen currentStep={loadingStep} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 leading-tight mb-2">
            AI-Powered Site Safety<br />
            <span className="text-yellow-600">&amp; Contract Intelligence</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mt-3">
            Upload a site photo and contract. Get a full safety risk assessment, contract obligations register, and prescriptive PM action plan — in seconds.
          </p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-600 text-sm">1 in 5</span>
              worker deaths are on construction sites
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-600 text-sm">90%</span>
              of firms have no access to AI tools
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-bold text-gray-600 text-sm">Free</span>
              for any site manager, anywhere
            </div>
          </div>
        </div>

        {/* Upload card */}
        <div className="card mb-4">
          <h2 className="font-heading font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📎</span> Upload Site Data
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <UploadZone
              accept="image/*"
              label="Site Photo"
              icon="📷"
              hint="JPG, PNG, WEBP — AI detects PPE, plant, hazards"
              file={photoFile}
              onFile={setPhotoFile}
              onClear={() => setPhotoFile(null)}
            />
            <UploadZone
              accept=".pdf,.txt,.docx"
              label="Contract Document"
              icon="📄"
              hint="PDF, TXT, or DOCX — JCT, NEC4, FIDIC, CIOB"
              file={docFile}
              onFile={(f) => { setDocFile(f); setActiveDemoId(null) }}
              onClear={() => setDocFile(null)}
            />
          </div>

          {/* Site description textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Site conditions description{' '}
              <span className="text-gray-400 font-normal">(or use instead of a photo)</span>
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Describe what you see on site — activities under way, PPE compliance, access arrangements, plant on site, any concerns...&#10;&#10;Example: 'Scaffolding erection in progress at 4th floor level. Two workers not wearing harnesses. No brick guards on upper lifts. Adjacent to public pavement with no exclusion zone.'"
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-yellow/30 focus:border-yellow transition-colors placeholder:text-gray-300"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">
                {docText && !docFile && (
                  <span className="text-green-600 font-medium">
                    ✓ Contract text loaded from demo ({docText.length.toLocaleString()} chars)
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-300">{siteDescription.length} chars</p>
            </div>
          </div>
        </div>

        {/* Demo scenarios */}
        <div className="card mb-4">
          <DemoScenarios
            activeId={activeDemoId}
            onSelect={(id) => setActiveDemoId(id)}
          />
        </div>

        {/* Error */}
        {loadingError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {loadingError}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAnalyse}
          disabled={!hasAnyInput || isLoading}
          className={[
            'w-full py-4 rounded-xl font-heading font-bold text-xl tracking-wide transition-all duration-150 flex items-center justify-center gap-3',
            hasAnyInput
              ? 'bg-yellow hover:bg-yellow-400 text-navy shadow-lg shadow-yellow/20 hover:shadow-yellow/30 hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Analyse Site + Contract
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Powered by Claude AI · Analysis takes 10–30 seconds · Results are not a substitute for professional advice
        </p>

        {/* Feature strip */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            { icon: '🦺', title: 'Safety Analysis', desc: 'CDM 2015, HSE regs, PPE compliance, risk scoring' },
            { icon: '📋', title: 'Contract Intelligence', desc: 'JCT · NEC4 · FIDIC obligations, LADs, notices' },
            { icon: '⚡', title: 'PM Action Plan', desc: 'Prioritised actions with deadlines and reasons' },
          ].map(f => (
            <div key={f.title} className="card text-center py-5">
              <span className="text-2xl block mb-2">{f.icon}</span>
              <p className="font-heading font-bold text-sm text-gray-800">{f.title}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-5 text-xs text-gray-400 border-t border-gray-200 mt-4">
        SiteIQ — Built for the Claude Builder Hackathon 2026 · Not legal or safety advice
      </footer>
    </div>
  )
}
