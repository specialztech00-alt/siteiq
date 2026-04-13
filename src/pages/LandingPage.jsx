import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ── Hooks ────────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function useIntersectionObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        let start = null
        const step = ts => {
          if (!start) start = ts
          const p = Math.min((ts - start) / duration, 1)
          setCount(Math.floor(p * target))
          if (p < 1) requestAnimationFrame(step)
          else setCount(target)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return [count, ref]
}

// ── Sub-components ────────────────────────────────────────────────────────────

const HardhatIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 32 32" fill="none" style={{ width: size, height: size }}>
    <rect x="4" y="20" width="24" height="4" rx="2" fill="#f5c400" />
    <path d="M8 20 C8 11 24 11 24 20Z" fill="#f5c400" />
    <rect x="14.5" y="13" width="3" height="7" rx="1" fill="#080a0d" opacity="0.4" />
  </svg>
)

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400 mb-3">
      {children}
    </p>
  )
}

function SectionDivider() {
  return <div className="section-divider my-20" />
}

function CounterStat({ target, prefix = '', suffix = '', label }) {
  const [count, ref] = useCountUp(target)
  return (
    <div ref={ref} className="text-center">
      <div className="text-gradient font-heading font-bold text-4xl sm:text-5xl">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

// ── NAV ──────────────────────────────────────────────────────────────────────

function Navbar({ menuOpen, setMenuOpen }) {
  const scrolled = useScrolled()

  function scrollTo(id) {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,10,13,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #1e2530' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <HardhatIcon size={28} />
          <span className="font-heading font-bold text-xl text-white tracking-tight">
            Site<span className="text-yellow-400">IQ</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[['Features', 'features'], ['How it works', 'how-it-works'], ['Pricing', 'pricing']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/signin" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link to="/signup" className="btn-yellow text-sm px-5 py-2 rounded-lg">
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden text-gray-400 hover:text-white p-1"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-5 py-4 flex flex-col gap-4">
          {[['Features', 'features'], ['How it works', 'how-it-works'], ['Pricing', 'pricing']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-sm text-gray-300 text-left">
              {label}
            </button>
          ))}
          <Link to="/signin" className="text-sm text-gray-300">Sign in</Link>
          <Link to="/signup" className="btn-yellow text-sm px-4 py-2.5 rounded-lg text-center">
            Get started free
          </Link>
        </div>
      )}
    </nav>
  )
}

// ── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-10 overflow-hidden grid-pattern">
      {/* Glow orb */}
      <div className="hero-orb" style={{ top: '-100px', left: '-200px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT — text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 live-dot" />
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                AI-Powered Construction Intelligence
              </span>
            </div>

            <h1 className="font-heading font-bold leading-none mb-6"
              style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
              <span className="text-gradient">Every site deserves</span>
              <br />
              <span className="text-white">expert-level safety</span>
              <br />
              <span className="text-gradient">&amp; contract intelligence</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: '#8892a4' }}>
              SiteIQ uses Claude AI and computer vision to detect hazards, analyse contracts, and tell your team exactly what to do — in under 60 seconds.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/signup" className="btn-yellow px-7 py-3.5 rounded-xl text-base">
                Analyse your site free →
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost px-7 py-3.5 rounded-xl text-base"
              >
                See how it works
              </button>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#4a5568' }}>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>Trusted by site managers across Africa, Asia &amp; the Middle East</span>
              <span className="text-green-500 font-medium">· Zero safety incidents reported by beta users</span>
            </div>
          </div>

          {/* RIGHT — hero image */}
          <div className="relative">
            <div className="photo-frame photo-frame-animated relative overflow-hidden rounded-xl">
              {/* LIVE ANALYSIS badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-300 live-dot" />
                <span className="text-xs font-bold text-white tracking-wider">LIVE ANALYSIS</span>
              </div>

              {/* Image */}
              <div className="aspect-[4/3] bg-gray-900 relative">
                <img
                  src="/images/hero-site.jpg"
                  alt="Construction site under AI analysis"
                  className="w-full h-full object-cover opacity-80"
                  onError={e => { e.target.style.display = 'none' }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
                {/* Placeholder when no image */}
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                  <div className="text-center opacity-20">
                    <HardhatIcon size={64} />
                    <p className="text-gray-500 text-xs mt-2">Add /images/hero-site.jpg</p>
                  </div>
                </div>
              </div>

              {/* Scanning overlay effect */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245,196,0,0.015) 2px, rgba(245,196,0,0.015) 4px)',
                }}
              />
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-4 -left-4 dark-card px-4 py-3 shadow-xl">
              <div className="text-xs text-gray-500 mb-0.5">Safety score</div>
              <div className="text-gradient font-heading font-bold text-2xl">34/100</div>
              <div className="text-xs text-red-400 mt-0.5">⚠ 4 high-risk violations</div>
            </div>
          </div>
        </div>

        {/* Counter stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 pt-10 border-t border-gray-800/60">
          <CounterStat target={1} suffix=" in 5" label="worker deaths happen on construction sites" />
          <CounterStat prefix="$" target={625} suffix="B" label="lost to delays and contract disputes annually" />
          <CounterStat target={90} suffix="%" label="of contractors have no access to AI tools" />
        </div>
      </div>
    </section>
  )
}

// ── PROBLEM ───────────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    num: '1 in 5',
    title: 'Worker deaths globally happen on construction sites',
    body: 'Construction accounts for more fatal injuries than any other industry. Most are preventable with the right hazard assessment tools — tools that 90% of firms cannot afford.',
  },
  {
    num: '$625B',
    title: 'Lost every year to project delays and contract disputes',
    body: 'Missed notice deadlines, misunderstood LAD clauses, and disputed variations cost the global construction industry more than the GDP of most countries.',
  },
  {
    num: '90%',
    title: 'Of small contractors sign contracts they don\'t fully understand',
    body: 'Without access to affordable legal expertise, small contractors routinely sign contracts with onerous clauses, back-to-back risk transfers, and unfair termination rights.',
  },
]

function ProblemSection() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 fade-in-up">
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>
            Construction is the world's most dangerous industry.<br />
            <span className="text-gradient">It's also the least served by AI.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {PROBLEMS.map((p, i) => (
            <div key={i} className={`dark-card p-7 fade-in-up delay-${i + 1}`}>
              <div className="text-gradient-red font-heading font-bold text-5xl mb-3">{p.num}</div>
              <h3 className="text-white font-semibold text-lg leading-snug mb-3">{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* Pull quote */}
        <div className="fade-in-up">
          <div className="dark-card p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 50% 50%, #f5c400, transparent 70%)' }} />
            <div className="relative">
              <div className="text-yellow-400 text-5xl font-serif mb-4">"</div>
              <blockquote className="text-white text-xl sm:text-2xl font-heading font-semibold leading-snug max-w-3xl mx-auto mb-5">
                A site manager in Lagos shouldn't need a lawyer and a safety consultant on speed dial just to run a safe, profitable project.
              </blockquote>
              <cite className="text-sm not-italic" style={{ color: '#6b7280' }}>
                — SiteIQ Mission Statement
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Upload site photo & contract',
    body: 'Drag and drop a site photo and your contract document. Or just describe conditions in plain text. Works with JCT, NEC4, FIDIC, and any standard construction contract.',
  },
  {
    num: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'AI analyses everything',
    body: 'Claude AI reads your contract for obligations, LADs, and onerous clauses. Computer vision scans the site photo for PPE violations, fall risks, and CDM non-compliance.',
  },
  {
    num: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Get your action plan',
    body: 'Receive a prioritised list of exactly what to do, by when, and what it costs you if you don\'t. Every action is regulation-referenced and deadline-stamped.',
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 fade-in-up">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>
            From upload to action plan <span className="text-gradient">in 60 seconds</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 mb-16">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,196,0,0.3), transparent)' }} />

          {HOW_STEPS.map((step, i) => (
            <div key={i} className={`dark-card p-7 relative fade-in-up delay-${i + 1}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-yellow-400"
                  style={{ background: 'rgba(245,196,0,0.08)', border: '1px solid rgba(245,196,0,0.15)' }}>
                  {step.icon}
                </div>
                <span className="font-heading font-bold text-3xl" style={{ color: '#1e2530' }}>{step.num}</span>
              </div>
              <h3 className="text-white font-heading font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{step.body}</p>
            </div>
          ))}
        </div>

        {/* Wide photo banner */}
        <div className="photo-frame relative overflow-hidden rounded-xl fade-in-up">
          <div className="aspect-[21/6] sm:aspect-[21/5] bg-gray-900">
            <img
              src="/images/site-workers.jpg"
              alt="Site workers with PPE"
              className="w-full h-full object-cover opacity-50"
              onError={e => { e.target.style.display = 'none' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="font-heading font-bold text-white text-2xl sm:text-4xl text-center px-4"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                Real intelligence. Real consequences.{' '}
                <span className="text-gradient">Real actions.</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── FEATURES ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'AI hazard detection',
    label: 'Site Safety Analysis',
    body: 'Upload a site photo and get an instant hazard assessment. Every risk is rated High, Medium, or Low with the exact regulation being breached and the specific action to take.',
    image: '/images/scaffolding.jpg',
    badge: null,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'Contract risk scanner',
    label: 'Contract Intelligence',
    body: 'Upload any construction contract and Claude extracts every obligation, deadline, penalty clause, and financial exposure — translated into plain English your site team can act on.',
    image: '/images/contract.jpg',
    badge: null,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Your AI project manager',
    label: 'Prescriptive PM Actions',
    body: 'SiteIQ cross-references your site conditions with your contract obligations and tells you exactly what to do next — before things go wrong. Every action has a deadline and a reason.',
    image: null,
    badge: 'NEW',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'Ask your contract anything',
    label: 'Contract Q&A Chat',
    body: 'Stop ctrl+F searching through 80-page contracts. Ask plain English questions and get clause-referenced answers instantly. "What are my LADs?" takes 3 seconds, not 30 minutes.',
    image: null,
    badge: null,
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 fade-in-up">
          <SectionLabel>Features</SectionLabel>
          <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>
            Everything a site manager needs.<br />
            <span className="text-gradient">Nothing they don't.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className={`dark-card overflow-hidden fade-in-up delay-${(i % 2) + 1}`}>
              {/* Feature image (first two cards) */}
              {f.image && (
                <div className="aspect-video bg-gray-900 relative">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover opacity-60"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent" />
                </div>
              )}

              <div className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-yellow-400 flex-shrink-0"
                    style={{ background: 'rgba(245,196,0,0.08)', border: '1px solid rgba(245,196,0,0.15)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">{f.label}</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-heading font-bold text-lg">{f.title}</h3>
                      {f.badge && (
                        <span className="text-[10px] font-bold bg-yellow-400 text-gray-950 px-1.5 py-0.5 rounded tracking-wide">
                          {f.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── SOCIAL PROOF ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'Finally an AI tool that understands construction. Found a liquidated damages clause my legal team missed — saved us £40,000 in potential deductions.',
    name: 'Emeka O.',
    title: 'Project Manager, Lagos',
    initials: 'EO',
    color: '#1a472a',
  },
  {
    quote: 'Detected 4 PPE violations in seconds from a single site photo. We stopped work before an incident happened. The regulation references are exactly what our HSE reports need.',
    name: 'Priya S.',
    title: 'HSE Officer, Mumbai',
    initials: 'PS',
    color: '#1a2847',
  },
  {
    quote: 'The contract Q&A alone saved us from missing a 14-day EoT notification window. I asked "when do I need to give notice?" and got the exact clause reference in seconds.',
    name: 'James K.',
    title: 'Contracts Manager, Nairobi',
    initials: 'JK',
    color: '#3d1a1a',
  },
]

function SocialProofSection() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 fade-in-up">
          <SectionLabel>Built for the Field</SectionLabel>
          <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>
            Designed for site managers,<br />
            <span className="text-gradient">not software engineers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`dark-card p-7 flex flex-col gap-4 fade-in-up delay-${i + 1}`}>
              <div className="flex gap-1 mb-1">
                {[1,2,3,4,5].map(j => (
                  <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-300 flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                  style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wide excavation photo */}
        <div className="photo-frame relative overflow-hidden rounded-xl fade-in-up">
          <div className="aspect-[21/5] bg-gray-900 relative">
            <img
              src="/images/excavation.jpg"
              alt="Construction excavation"
              className="w-full h-full object-cover opacity-40"
              onError={e => { e.target.style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/40 to-gray-950/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-12 text-center px-8">
                {[
                  { v: '4.5M+', l: 'site workers protected annually' },
                  { v: '£625B', l: 'in disputes preventable with AI' },
                  { v: '< 60s', l: 'from upload to action plan' },
                ].map(s => (
                  <div key={s.v}>
                    <div className="text-gradient font-heading font-bold text-3xl sm:text-4xl">{s.v}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── PRICING ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    sub: 'For individuals and small sites',
    features: [
      '5 site analyses per month',
      '3 contract analyses per month',
      'Safety risk assessment',
      'Contract obligation extraction',
      'PDF report export',
    ],
    cta: 'Get started free',
    ctaLink: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    sub: 'For active site managers',
    badge: 'Most popular',
    features: [
      'Unlimited site analyses',
      'Unlimited contract analyses',
      'Contract Q&A chat',
      'Prescriptive PM actions',
      'Priority support',
      'Team sharing (up to 3 users)',
    ],
    cta: 'Start 14-day free trial',
    ctaLink: '/signup',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    sub: 'For construction firms',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom contract templates',
      'API access',
      'Dedicated account manager',
      'On-site training',
    ],
    cta: 'Contact us',
    ctaLink: '/signup',
    highlight: false,
  },
]

function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 fade-in-up">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="font-heading font-bold text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>
            Start free. <span className="text-gradient">Scale when you need to.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`dark-card p-7 flex flex-col gap-5 relative fade-in-up delay-${i + 1} ${plan.highlight ? 'pricing-pro' : ''}`}
              style={plan.highlight ? { transform: 'scale(1.03)' } : {}}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="btn-yellow text-xs px-4 py-1 rounded-full">{plan.badge}</span>
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-gradient font-heading font-bold text-5xl">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 text-sm mb-2">{plan.period}</span>}
                </div>
                <p className="text-gray-500 text-sm">{plan.sub}</p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`w-full py-3 rounded-xl text-center text-sm font-heading font-bold transition-all ${
                  plan.highlight ? 'btn-yellow' : 'btn-ghost'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FINAL CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="py-24 px-5 sm:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(245,196,0,0.4), transparent 70%)' }} />
      <div className="relative max-w-3xl mx-auto text-center fade-in-up">
        <SectionLabel>Don't wait for an incident</SectionLabel>
        <h2 className="font-heading font-bold text-white mb-5"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', lineHeight: 1.05 }}>
          Your next site incident<br />
          <span className="text-gradient">is preventable.</span>
        </h2>
        <p className="text-lg mb-8" style={{ color: '#8892a4' }}>
          Join thousands of site managers using SiteIQ to protect their workers and their business.
        </p>
        <Link to="/signup" className="btn-yellow inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg mb-5">
          Analyse your first site free →
        </Link>
        <p className="text-sm" style={{ color: '#4a5568' }}>
          No credit card required · Setup in 2 minutes · Cancel anytime
        </p>
      </div>
    </section>
  )
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: '#080a0d', borderTop: '1px solid #1e2530' }} className="relative">
      {/* Center glow on top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(245,196,0,0.5), transparent)' }} />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HardhatIcon size={24} />
              <span className="font-heading font-bold text-lg text-white">Site<span className="text-yellow-400">IQ</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered safety and contract intelligence for the global construction industry.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Product</p>
            <ul className="space-y-2.5">
              {['Features', 'How it works', 'Pricing', 'Demo'].map(l => (
                <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About', 'Mission', 'Blog', 'Careers'].map(l => (
                <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Legal</p>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2026 SiteIQ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* LinkedIn */}
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── MAIN LANDING PAGE ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  useIntersectionObserver()

  // Apply dark scrollbar to page
  useEffect(() => {
    document.documentElement.classList.add('dark-page')
    return () => document.documentElement.classList.remove('dark-page')
  }, [])

  return (
    <div className="dark-page" style={{ background: '#080a0d', color: '#e8eaf0', minHeight: '100vh' }}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <SocialProofSection />
      <SectionDivider />
      <PricingSection />
      <SectionDivider />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
