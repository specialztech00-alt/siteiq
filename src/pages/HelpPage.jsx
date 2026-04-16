import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Shared atoms ──────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
      {children}
    </p>
  )
}

// ── Getting started cards ─────────────────────────────────────────────────────

const CARDS = [
  {
    title: 'Run your first analysis',
    desc: 'Upload a site photo or describe conditions to get a full safety and contract report',
    route: '/app/new-analysis',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Read your report',
    desc: 'Understand safety scores, risk cards, contract obligations and PM action plans',
    route: '/app/archive',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Use the AI assistant',
    desc: 'Ask plain English questions about safety, contracts and Nigerian regulations',
    route: '/app/assistant',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Check site conditions',
    desc: 'View live weather and ground condition intelligence for any Nigerian state',
    route: '/app/weather',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
]

// ── Score explanation ─────────────────────────────────────────────────────────

const SCORE_ROWS = [
  { label: 'Safety Score', items: [
    { range: '70–100', color: 'var(--success)', text: 'Site performing well' },
    { range: '45–69', color: 'var(--warning)', text: 'Moderate risks present' },
    { range: '0–44', color: 'var(--danger)', text: 'Immediate action required' },
  ]},
  { label: 'Contract Score', items: [
    { range: '70–100', color: 'var(--success)', text: 'Contract low risk' },
    { range: '45–69', color: 'var(--warning)', text: 'Some risk clauses present' },
    { range: '0–44', color: 'var(--danger)', text: 'High financial exposure' },
  ]},
]

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: 'What construction contracts does SiteIQ support?', a: 'SiteIQ works with any construction contract in text form — JCT, NEC4, FIDIC, JBCC, UAE FIDIC, bespoke EPC, and more. Upload a PDF or paste text directly. Our AI understands contract structure regardless of the standard used.' },
  { q: 'How accurate is the AI hazard detection?', a: 'SiteIQ uses Claude AI for semantic hazard analysis and computer vision (DETR object detection) for physical site elements. Accuracy is high for common hazards like missing PPE, fall risks, and CDM violations. All output should be reviewed by a qualified safety professional — SiteIQ is a decision-support tool, not a replacement for expert assessment.' },
  { q: 'Is my contract data kept private?', a: 'Your contract text and site photos are sent to Claude AI for analysis and are not stored on SiteIQ servers. Anthropic\'s data usage policies apply to API calls. We recommend anonymising sensitive commercial data before upload for maximum privacy.' },
  { q: 'Can I use SiteIQ on a mobile device on-site?', a: 'Yes. SiteIQ is fully responsive and works on any modern smartphone. You can take a photo directly on-site and upload it instantly for analysis. Results are optimised for small screens.' },
  { q: 'What happens if the AI analysis takes too long or fails?', a: 'SiteIQ has a built-in fallback system. If the Claude API is unavailable, you\'ll receive a realistic demo report so you can evaluate the product. When the API is available, analysis typically completes in 20–40 seconds.' },
  { q: 'Does SiteIQ provide legal advice?', a: 'No. SiteIQ provides AI-generated analysis for informational purposes only. Nothing in the output constitutes legal advice. Always consult a qualified construction lawyer for formal contract advice and a certified HSE professional for safety-critical decisions.' },
  { q: 'How do I export or share my report?', a: 'Use the Export button on the report page to print or save as PDF — it includes a branded print layout with your project info. Use the Share button to copy a summary to your clipboard for pasting into WhatsApp, email, or a project management tool.' },
  { q: 'Is there a free plan? What are the limits?', a: 'Yes — the Free plan includes 5 site analyses and 3 contract analyses per month with no credit card required. Upgrade to Pro ($29/month) for unlimited analyses, contract Q&A chat, and prescriptive PM actions.' },
]

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIdx === i
        return (
          <div key={i} className="card" style={{ borderLeft: isOpen ? '3px solid var(--accent)' : '3px solid transparent', transition: 'border-color 0.15s' }}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: isOpen ? 'var(--text-accent)' : 'var(--text-primary)' }}>{item.q}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"
                style={{ flexShrink: 0, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                <line x1="7" y1="2" x2="7" y2="12" /><line x1="2" y1="7" x2="12" y2="7" />
              </svg>
            </button>
            {isOpen && (
              <div style={{ padding: '0 16px 14px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {item.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Help & Documentation
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
          Everything you need to get the most from SiteIQ
        </p>
      </div>

      {/* Getting started */}
      <div style={{ marginBottom: '24px' }}>
        <SectionLabel>Getting Started</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {CARDS.map(card => (
            <div key={card.title} className="card" onClick={() => navigate(card.route)}
              style={{ padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div style={{ marginBottom: '10px' }}>{card.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{card.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Understanding scores */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <SectionLabel>Understanding Scores</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {SCORE_ROWS.map(({ label, items }) => (
            <div key={label}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>{label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(({ range, color, text }) => (
                  <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color, background: `${color}18`, padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>{range}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: '24px' }}>
        <SectionLabel>Frequently Asked Questions</SectionLabel>
        <FAQAccordion />
      </div>

      {/* Contact */}
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Need help? We're here.</div>
        <a href="mailto:hello@siteiq.ai" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-accent)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          hello@siteiq.ai
        </a>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Response within 24 hours</div>
      </div>
    </div>
  )
}
