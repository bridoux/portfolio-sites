import { useEffect, useRef, useState } from 'react'
import { OWNER, PROJECTS, STATS, projectNumber, tagsInUse, type Project } from '../data/projects'
import { cap, listPhrase, numberWord, statLabel } from '../lib/words'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import Services from './Services'
import ContactForm from './ContactForm'
import './index-concept.css'

const BASE = { bg: '#0c0c0c', fg: '#ecebe7', accent: '#ff5a36' }

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** The counting loader plays once per visit, not on every return to the index. */
let loaderPlayed = false

function Loader({ onDone, label }: { onDone: () => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  // Keep the latest callback without restarting the timeline when the parent re-renders (clock ticks)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const finish = () => { loaderPlayed = true; doneRef.current() }
    if (prefersReducedMotion() || loaderPlayed) { finish(); el.style.display = 'none'; return }
    const counter = { v: 0 }
    const tl = gsap.timeline({ onComplete: finish })
    tl.to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { if (numRef.current) numRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0') } })
      .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=0.15')
    return () => { tl.kill() }
  }, [])
  return (
    <div className="ca-loader" ref={ref} aria-hidden="true">
      <span className="ca-loader__label">{label}</span>
      <span className="ca-loader__num" ref={numRef}>000</span>
    </div>
  )
}

export function SiteNav() {
  const clock = useClock()
  return (
    <header className="ca-nav">
      <Link to="/" className="ca-nav__mark">{OWNER.name}<sup>©26</sup></Link>
      <nav aria-label="Primary"><Link to="/#work">Work</Link><Link to="/#services">Services</Link><Link to="/#about">About</Link><Link to="/#contact">Contact</Link></nav>
      <span className="ca-nav__time">{OWNER.location} · {clock}</span>
    </header>
  )
}

type View = 'list' | 'grid'
const VIEW_KEY = 'portfolio:view'

function initialView(): View {
  try {
    const v = sessionStorage.getItem(VIEW_KEY)
    if (v === 'list' || v === 'grid') return v
  } catch { /* storage unavailable */ }
  // Big type suits a short list; a thumbnail grid scans better once there are many projects
  return PROJECTS.length > 8 ? 'grid' : 'list'
}

export default function IndexConcept() {
  const root = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Project | null>(null)
  const [ready, setReady] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const [view, setView] = useState<View>(initialView)
  const [preset, setPreset] = useState('')
  const palette = active?.palette ?? BASE

  const n = PROJECTS.length
  const tags = tagsInUse()
  const shown = filter ? PROJECTS.filter((p) => p.tags.includes(filter)) : PROJECTS
  const years = [...new Set(PROJECTS.map((p) => p.year))].sort()
  const yearSpan = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]
  const others = n - STATS.scroll3d

  const changeView = (v: View) => {
    setView(v)
    setActive(null)
    try { sessionStorage.setItem(VIEW_KEY, v) } catch { /* storage unavailable */ }
  }

  // Hero headline and statement reveal once the loader lifts
  useEffect(() => {
    const el = root.current
    if (!el || !ready || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.ca-hero__line > span', { yPercent: 110, rotate: 4, duration: 1.4, ease: 'expo.out', stagger: 0.09 })
      gsap.from('.ca-hero__meta > *', { y: 24, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.5 })
      gsap.fromTo('.ca-statement .w', { opacity: 0.14 }, {
        opacity: 1, stagger: 0.04, ease: 'none',
        scrollTrigger: { trigger: '.ca-statement', start: 'top 75%', end: 'bottom 55%', scrub: true },
      })
    }, el)
    // Items rise in when the index enters view (IntersectionObserver: robust to jumps and late layout)
    const items = el.querySelectorAll<HTMLElement>('.ca-item')
    gsap.set(items, { y: 60, opacity: 0 })
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      gsap.to(items, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: Math.min(0.08, 0.8 / items.length), clearProps: 'transform,opacity' })
    }, { rootMargin: '0px 0px -20% 0px' })
    const index = el.querySelector('.ca-index')
    if (index) io.observe(index)
    return () => { io.disconnect(); ctx.revert(); gsap.set(items, { clearProps: 'all' }) }
  }, [ready])

  // Cursor-trailing preview (list view)
  useEffect(() => {
    const pv = previewRef.current
    if (!pv || !window.matchMedia('(pointer: fine)').matches) return
    const xTo = gsap.quickTo(pv, 'x', { duration: 0.7, ease: 'power3' })
    const yTo = gsap.quickTo(pv, 'y', { duration: 0.7, ease: 'power3' })
    const rTo = gsap.quickTo(pv, 'rotate', { duration: 0.9, ease: 'power3' })
    let lastX = 0
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6))
      lastX = e.clientX
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const statement = `Brands invented from scratch: ${listPhrase(PROJECTS.map((p) => p.noun))}. Each one designed, written, photographed and built with AI, then refined until it felt like it had a real team behind it.`
  const metaLine = STATS.scroll3d === 0
    ? 'Every site is built around typography, layout and motion.'
    : `${n === STATS.scroll3d ? 'All of them' : `${cap(numberWord(STATS.scroll3d))} of them`} take themselves apart as you scroll.${others > 0 ? ` ${cap(numberWord(others))} ${others === 1 ? 'leans' : 'lean'} on typography and layout.` : ''}`

  const hover = (p: Project) => ({ onPointerEnter: () => setActive(p), onFocus: () => setActive(p), onClick: () => setActive(null) })

  return (
    <div ref={root} className="ca" style={{ ['--bg' as string]: palette.bg, ['--fg' as string]: palette.fg, ['--accent' as string]: palette.accent }}>
      <Loader onDone={() => setReady(true)} label="Loading new worlds" />
      <div className="ca-grain" aria-hidden="true" />

      <SiteNav />

      <section className="ca-hero" id="top">
        <h1 className="ca-hero__title">
          <span className="ca-hero__line"><span>New worlds,</span></span>
          <span className="ca-hero__line"><span><em>one</em> designer,</span></span>
          <span className="ca-hero__line"><span>built with <em>AI.</em></span></span>
        </h1>
        <div className="ca-hero__meta">
          <p>{OWNER.role}. Concept work, {yearSpan}. Now taking on client projects.</p>
          <p>{metaLine}</p>
          <a href="#work" className="ca-hero__cue">Scroll to the work <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className={`ca-index ca-index--${view}`} id="work" onPointerLeave={() => setActive(null)}>
        <div className="ca-toolbar">
          <p className="ca-toolbar__count">Concept work <sup>({String(shown.length).padStart(2, '0')})</sup></p>
          {tags.length > 1 && (
            <div className="ca-filters" role="group" aria-label="Filter projects">
              <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>All <sup>{n}</sup></button>
              {tags.map((t) => (
                <button key={t} type="button" aria-pressed={filter === t} onClick={() => setFilter(filter === t ? null : t)}>
                  {t} <sup>{PROJECTS.filter((p) => p.tags.includes(t)).length}</sup>
                </button>
              ))}
            </div>
          )}
          <div className="ca-view" role="group" aria-label="Layout">
            <button type="button" aria-pressed={view === 'list'} onClick={() => changeView('list')}>List</button>
            <button type="button" aria-pressed={view === 'grid'} onClick={() => changeView('grid')}>Grid</button>
          </div>
        </div>

        {view === 'list' ? (
          <>
            <div className="ca-index__head" aria-hidden="true"><span>No.</span><span>Project</span><span>Discipline</span><span>Year</span></div>
            <ul>
              {shown.map((p) => (
                <li key={p.id} className={`ca-row ca-item ${active && active.id !== p.id ? 'is-dim' : ''}`}>
                  <Link to={`/work/${p.id}`} {...hover(p)}>
                    <span className="ca-row__no">{projectNumber(PROJECTS.indexOf(p))}</span>
                    <span className="ca-row__name">{p.name}</span>
                    <span className="ca-row__kind">{p.kind}<small>{p.signature}</small></span>
                    <span className="ca-row__year">{p.year}<i aria-hidden="true">→</i></span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ul className="ca-grid">
            {shown.map((p) => (
              <li key={p.id} className={`ca-card ca-item ${active && active.id !== p.id ? 'is-dim' : ''}`}>
                <Link to={`/work/${p.id}`} {...hover(p)}>
                  <span className="ca-card__media"><img src={p.hero} alt="" loading="lazy" /></span>
                  <span className="ca-card__meta">
                    <span className="ca-card__no">{projectNumber(PROJECTS.indexOf(p))}</span>
                    <span className="ca-card__name">{p.name}</span>
                    <span className="ca-card__year">{p.year}</span>
                  </span>
                  <span className="ca-card__kind">{p.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {shown.length === 0 && <p className="ca-empty">Nothing tagged “{filter}” yet.</p>}
      </section>

      <div className={`ca-preview ${active && view === 'list' ? 'is-on' : ''}`} ref={previewRef} aria-hidden="true">
        {active && <img key={active.id} src={active.hero} alt="" className="is-on" />}
        <span className="ca-preview__tag">View case study</span>
      </div>

      <section className="ca-about" id="about">
        <p className="ca-label">(About the work)</p>
        <p className="ca-statement">{statement.split(' ').map((w, i) => <span key={i} className="w">{w} </span>)}</p>
        <dl className="ca-stats">
          <div><dt>Websites</dt><dd>{String(STATS.sites).padStart(2, '0')}</dd></div>
          <div><dt>Scroll-driven 3D scenes</dt><dd>{String(STATS.scroll3d).padStart(2, '0')}</dd></div>
          <div><dt>Generated images</dt><dd>{statLabel(STATS.images)}</dd></div>
          <div><dt>Templates used</dt><dd>00</dd></div>
        </dl>
      </section>

      <Services onPick={setPreset} />

      <section className="ca-contact" id="contact" aria-labelledby="contact-title">
        <div className="ca-contact__intro">
          <p className="ca-label">(Have a project in mind?)</p>
          <h2 className="ca-contact__title" id="contact-title">Let's make yours <em>next.</em></h2>
          <p>Tell me what you're building. Every inquiry gets a reply within one working day, and a free homepage mock-up if we're a fit.</p>
          <div className="ca-contact__links">
            {OWNER.booking && <a className="ca-pill" href={OWNER.booking} target="_blank" rel="noopener noreferrer">Book a 20-min call ↗</a>}
            <a className="ca-pill ca-pill--ghost" href={`mailto:${OWNER.email}`}>{OWNER.email}</a>
          </div>
        </div>
        <ContactForm preset={preset} />
      </section>

      <footer className="ca-foot">
        <a className="ca-foot__cta" href={OWNER.booking || `mailto:${OWNER.email}`}>Let's talk<span aria-hidden="true">→</span></a>
        <div className="ca-foot__row"><span>{OWNER.email}</span><span>Instagram · LinkedIn · Read.cv</span><span>© 2026 {OWNER.name}</span></div>
      </footer>
    </div>
  )
}
