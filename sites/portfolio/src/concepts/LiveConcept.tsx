import { useEffect, useRef, useState } from 'react'
import { OWNER, PROJECTS, STATS, type Project } from '../data/projects'
import { cap, counted, statLabel } from '../lib/words'
import { gsap, prefersReducedMotion } from '../lib/motion'
import './live-concept.css'

/** Window chrome height (title bar + caption) in px, on top of the 16:10 screenshot. */
const CHROME = 70
const GAP = 22

/**
 * Fit N windows into the desk: try every column count and keep the one that gives
 * the largest window. Returns the window width and each window's centre (px).
 */
function layoutGrid(n: number, w: number, h: number) {
  let best = { cols: 1, win: 0 }
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols)
    const byWidth = (w - GAP * (cols - 1)) / cols
    const byHeight = ((h - GAP * (rows - 1)) / rows - CHROME) / 0.625
    const win = Math.min(byWidth, byHeight, 560)
    if (win > best.win) best = { cols, win }
  }
  const { cols, win } = best
  const rows = Math.ceil(n / cols)
  const winH = win * 0.625 + CHROME
  const gridH = rows * winH + (rows - 1) * GAP
  const centres = Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols)
    const inRow = row === rows - 1 ? n - row * cols : cols // centre a short last row
    const col = i % cols
    const rowW = inRow * win + (inRow - 1) * GAP
    return { x: (w - rowW) / 2 + col * (win + GAP) + win / 2, y: (h - gridH) / 2 + row * (winH + GAP) + winH / 2 }
  })
  return { win, centres }
}

/** Deterministic loose "pile" offsets around the centre, so the stack looks tossed, not random each load. */
const pile = (i: number) => ({ x: Math.sin(i * 2.4) * 6, y: Math.cos(i * 1.7) * 4, r: Math.sin(i * 3.1) * 8 })

const hostOf = (p: Project) => `${p.id}.site`

function Window({ p, onOpen }: { p: Project; onOpen: (p: Project) => void }) {
  return (
    <button type="button" className="cc-win" onClick={() => onOpen(p)} aria-label={`Open ${p.name} live`} style={{ ['--acc' as string]: p.palette.accent }}>
      <span className="cc-win__bar">
        <span className="cc-win__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="cc-win__url">{hostOf(p)}</span>
        <span className="cc-win__live"><i />Live</span>
      </span>
      <span className="cc-win__body">
        <img src={p.hero} alt="" loading="lazy" />
        <img src={p.detail} alt="" loading="lazy" className="cc-win__alt" />
      </span>
      <span className="cc-win__caption"><b>{p.name}</b><span>{p.kind}</span></span>
    </button>
  )
}

export default function LiveConcept() {
  const root = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<Project | null>(null)

  useEffect(() => {
    const el = root.current
    const desk = deskRef.current
    if (!el || !desk) return
    const reduce = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const wins = gsap.utils.toArray<HTMLElement>('.cc-win')
      if (!reduce) gsap.from('.cc-hero__line > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.1 })
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const area = desk.querySelector<HTMLElement>('.cc-desk__area')
        if (!area) return
        // Layout is measured from the live desk size and recomputed on every refresh (resize)
        const grid = () => layoutGrid(wins.length, area.clientWidth, area.clientHeight)
        const pileWidth = () => Math.min(area.clientWidth * 0.34, 520)
        const stagger = Math.min(0.06, 0.6 / wins.length)
        wins.forEach((w, i) => gsap.set(w, {
          xPercent: -50, yPercent: -50,
          width: pileWidth, left: () => area.clientWidth / 2 + (pile(i).x / 100) * area.clientWidth, top: () => area.clientHeight / 2 + (pile(i).y / 100) * area.clientHeight,
          rotate: pile(i).r,
        }))
        const tl = gsap.timeline({ scrollTrigger: { trigger: desk, start: 'top top', end: '+=140%', pin: true, scrub: 0.8, invalidateOnRefresh: true } })
        wins.forEach((w, i) => {
          tl.to(w, { width: () => grid().win, left: () => grid().centres[i].x, top: () => grid().centres[i].y, rotate: 0, ease: 'power3.inOut', duration: 1 }, i * stagger)
        })
        tl.from('.cc-desk__hint', { opacity: 0, y: 20, duration: 0.3 }, 0.7)
      })
      gsap.from('.cc-tile', { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.cc-bento', start: 'top 75%', once: true } })
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = '' }
  }, [open])

  return (
    <div ref={root} className="cc">
      <div className="cc-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="cc-grain" aria-hidden="true" />

      <header className="cc-nav">
        <a href="#top" className="cc-nav__mark"><span className="cc-dot" />{OWNER.name}</a>
        <nav aria-label="Primary"><a href="#desk">Work</a><a href="#stack">Stack</a><a href={`mailto:${OWNER.email}`}>Contact</a></nav>
      </header>

      <section className="cc-hero" id="top">
        <p className="cc-pill"><span className="cc-dot" /> {PROJECTS.length} {PROJECTS.length === 1 ? 'site' : 'sites'} running right now</p>
        <h1 className="cc-hero__title">
          <span className="cc-hero__line"><span>Not mockups.</span></span>
          <span className="cc-hero__line"><span>Real sites, <em>live.</em></span></span>
        </h1>
        <p className="cc-hero__sub">{cap(counted(PROJECTS.length, 'brand'))} invented and built end-to-end with AI, from photography and copy to 3D scroll scenes and working checkouts. Open any window to try the real thing.</p>
      </section>

      <section className="cc-desk" id="desk" ref={deskRef}>
        <div className="cc-desk__area">
          {PROJECTS.map((p) => <Window key={p.id} p={p} onOpen={setOpen} />)}
        </div>
        <p className="cc-desk__hint">Click a window to open it live ↗</p>
      </section>

      <section className="cc-bento" id="stack">
        <p className="cc-pill">Under the hood</p>
        <div className="cc-bento__grid">
          <div className="cc-tile cc-tile--big"><b>{STATS.scroll3d}</b><span>scroll-driven 3D scenes, each built around the product it sells</span></div>
          <div className="cc-tile"><b>{statLabel(STATS.images)}</b><span>generated photographs, all brand-consistent</span></div>
          <div className="cc-tile"><b>{STATS.sites}</b><span>distinct type systems, one per brand</span></div>
          <div className="cc-tile cc-tile--wide"><b>{STATS.flows}</b><span>sites with working flows: checkout, booking or ticketing</span></div>
          <div className="cc-tile"><b>0</b><span>templates</span></div>
        </div>
      </section>

      <footer className="cc-foot">
        <h2>Let's build <em>yours.</em></h2>
        <a href={`mailto:${OWNER.email}`} className="cc-foot__btn">{OWNER.email}<span aria-hidden="true">→</span></a>
        <p>© 2026 {OWNER.name} · {OWNER.role}</p>
      </footer>

      {open && (
        <div className="cc-modal" role="dialog" aria-modal="true" aria-label={`${open.name}, live`}>
          <div className="cc-modal__scrim" onClick={() => setOpen(null)} />
          <div className="cc-modal__win">
            <div className="cc-win__bar">
              <span className="cc-win__dots" aria-hidden="true"><i /><i /><i /></span>
              <span className="cc-win__url">{hostOf(open)}</span>
              <a className="cc-modal__ext" href={open.url} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
              <button type="button" className="cc-modal__close" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            </div>
            <iframe src={open.url} title={`${open.name} — live site`} />
          </div>
        </div>
      )}
    </div>
  )
}
