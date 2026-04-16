import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HardHat,
  ShieldAlert,
  Camera,
  ScrollText,
  Globe,
  CloudSun,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

const ONBOARDING_KEY = 'siteiq_onboarded'

export function useOnboarding() {
  return {
    isDone: () => localStorage.getItem(ONBOARDING_KEY) === 'true',
    complete: () => localStorage.setItem(ONBOARDING_KEY, 'true'),
  }
}

// ── Feature cards for slide 3 ──────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Camera,
    title: 'Hazard Detection',
    body: 'Upload a site photo. Get an instant AI hazard assessment with corrective actions.',
  },
  {
    Icon: ScrollText,
    title: 'Contract Intelligence',
    body: 'Upload your contract PDF. Identify risk clauses, payment obligations, and liquidated damages exposure.',
  },
  {
    Icon: Globe,
    title: 'Ground Conditions',
    body: 'Select your Nigerian state. Get real soil, flood risk, and regulatory data for your site location.',
  },
  {
    Icon: CloudSun,
    title: 'Weather Intelligence',
    body: 'Live weather data translated into construction operation safety ratings.',
  },
]

// ── Slides ─────────────────────────────────────────────────────────────────────

function Slide1() {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'var(--accent-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        border: '2px solid var(--accent)',
      }}>
        <HardHat size={36} color="var(--accent)" />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
        lineHeight: 1.2,
      }}>
        Welcome to SiteIQ
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-accent)', fontWeight: 500, marginBottom: '16px' }}>
        Your AI-powered construction intelligence platform
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>
        SiteIQ gives every site manager access to expert safety analysis, contract risk intelligence,
        and prescriptive project management — powered by Claude AI and built specifically
        for the Nigerian construction market.
      </p>
    </div>
  )
}

function Slide2() {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(217,58,43,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        border: '2px solid var(--danger)',
      }}>
        <ShieldAlert size={36} color="var(--danger)" />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '16px',
        lineHeight: 1.2,
      }}>
        Built for the realities of Nigerian construction
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
        Every week, workers die on sites with no safety officer present. Every month,
        contractors lose money to contract clauses they never fully understood.
        <br /><br />
        SiteIQ puts a certified safety officer and a contract lawyer in your pocket —
        in under 60 seconds.
      </p>
    </div>
  )
}

function Slide3() {
  return (
    <div style={{ padding: '8px 0' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: '4px',
      }}>
        Everything your site needs. In one platform.
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
        Four intelligence modules, all working together.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {FEATURES.map(({ Icon, title, body }) => (
          <div key={title} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}>
              <Icon size={18} color="var(--accent)" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {body}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Slide4({ onComplete }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'var(--accent-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        border: '2px solid var(--accent)',
      }}>
        <HardHat size={36} color="var(--accent)" />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '12px',
      }}>
        Run your first analysis
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto 28px' }}>
        Upload a site photo and contract to generate your first full intelligence report.
        Demo scenarios are available if you do not have files ready.
      </p>
      <button
        onClick={onComplete}
        className="btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 28px',
          fontSize: '15px',
        }}
      >
        Go to Command Center
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function OnboardingModal({ onClose }) {
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()
  const totalSlides = 4

  function handleComplete() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onClose()
    navigate('/app/dashboard')
  }

  function handleSkip() {
    setSlide(3)
  }

  const slides = [
    <Slide1 key="s1" />,
    <Slide2 key="s2" />,
    <Slide3 key="s3" />,
    <Slide4 key="s4" onComplete={handleComplete} />,
  ]

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '600px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Getting started
            </span>
            {slide < 3 && (
              <button
                onClick={handleSkip}
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                Skip to finish
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          {/* Slide content */}
          <div style={{
            padding: '28px 32px',
            overflowY: 'auto',
            flex: 1,
          }}>
            {slides[slide]}
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {/* Back */}
            <button
              onClick={() => setSlide(s => Math.max(0, s - 1))}
              disabled={slide === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: slide === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: slide === 0 ? 'default' : 'pointer',
                opacity: slide === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={14} />
              Back
            </button>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === slide ? 'var(--accent)' : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Next */}
            {slide < 3 ? (
              <button
                onClick={() => setSlide(s => Math.min(totalSlides - 1, s + 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            ) : (
              <div style={{ width: '60px' }} /> /* spacer to keep dots centered */
            )}
          </div>
        </div>
      </div>
    </>
  )
}
