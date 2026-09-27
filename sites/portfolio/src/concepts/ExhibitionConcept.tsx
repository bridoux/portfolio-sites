import { useEffect, useRef } from 'react'
import { OWNER, PROJECTS } from '../data/projects'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { cap, counted, listPhrase, numberWord, toRoman } from '../lib/words'
import './exhibition-concept.css'


export default function ExhibitionConcept() {
  const n = PROJECTS.length
  const countWord = cap(numberWord(n))
  const root = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = root.current
    const gallery = galleryRef.current
    const track = trackRef.current
    if (!el || !gallery || !track) return
    const reduce = prefersReducedMotion()
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.from('.cb-hero__word', { yPercent: 105, duration: 1.5, ease: 'expo.out', stagger: 0.12, delay: 0.2 })
        gsap.from('.cb-hero__aside > *', { opacity: 0, y: 20, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.7 })
      }
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const distance = () => track.scrollWidth - window.innerWidth
        const tween = gsap.to(track, {
          x: () => -distance(), ease: 'none',
          scrollTrigger: {
            trigger: gallery, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (counterRef.current) counterRef.current.textContent = toRoman(Math.min(PROJECTS.length, Math.floor(self.progress * PROJECTS.length) + 1))
            },
          },
        })
        gsap.utils.toArray<HTMLElement>('.cb-work').forEach((w) => {
          const img = w.querySelector('.cb-work__canvas img')
          const frame = w.querySelector('.cb-work__frame')
          gsap.fromTo(img, { filter: 'grayscale(1) contrast(1.05)' }, {
            filter: 'grayscale(0) contrast(1)', ease: 'none',
            scrollTrigger: { trigger: w, containerAnimation: tween, start: 'left 85%', end: 'left 35%', scrub: true },
          })
          gsap.fromTo(frame, { rotateY: -14 }, {
            rotateY: 10, ease: 'none',
            scrollTrigger: { trigger: w, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          })
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="cb">
      <header className="cb-nav">
        <span>{OWNER.name}</span>
        <span className="cb-nav__center">{countWord} Sites — an exhibition in code</span>
        <a href={`mailto:${OWNER.email}`}>Contact</a>
      </header>

      <section className="cb-hero">
        <h1 className="cb-hero__title" aria-label={`${countWord} sites`} style={{ ['--len' as string]: Math.max(4, countWord.length) }}>
          <span className="cb-hero__mask"><span className="cb-hero__word">{countWord}</span></span>
          <span className="cb-hero__mask cb-hero__mask--r"><span className="cb-hero__word"><i>Sites</i></span></span>
        </h1>
        <aside className="cb-hero__aside">
          <p className="cb-tag">Exhibition · 2026</p>
          <p>{cap(counted(n, 'invented brand'))}, each with its own identity, photography, copy and a working website: {listPhrase(PROJECTS.map((p) => p.noun))}.</p>
          <p className="cb-small">Works in React, WebGL, CSS 3D and generated imagery. Curated by {OWNER.name}.</p>
        </aside>
        <div className="cb-hero__poster">
          <img src={PROJECTS[0].detail} alt="" />
          <span>Room I — scroll to enter</span>
        </div>
      </section>

      <section className="cb-gallery" ref={galleryRef} aria-label="The works">
        <div className="cb-gallery__room" aria-hidden="true">Room <span ref={counterRef}>I</span> / {toRoman(n)}</div>
        <div className="cb-track" ref={trackRef}>
          <div className="cb-intro">
            <p className="cb-tag">The works</p>
            <h2>Each site has <i>its own</i> brand, voice and way of moving.</h2>
            <p className="cb-small">Walk left to right. Click any canvas to visit the live work.</p>
          </div>
          {PROJECTS.map((p, i) => (
            <article key={p.id} className="cb-work">
              <a className="cb-work__frame" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.name}`}>
                <div className="cb-work__canvas"><img src={p.hero} alt={`${p.name} homepage`} loading="lazy" /></div>
              </a>
              <div className="cb-label">
                <span className="cb-label__no">No. {i + 1}</span>
                <h3>{p.name}</h3>
                <p className="cb-label__kind">{p.kind}, {p.year}</p>
                <p className="cb-label__medium">{p.medium.join(', ')}</p>
                <p className="cb-label__dims">1600 × 1000 px, responsive</p>
                <p className="cb-label__note">{p.summary}</p>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="cb-label__link">Visit the work ↗</a>
              </div>
            </article>
          ))}
          <div className="cb-exit"><span>Exit through the gift shop →</span></div>
        </div>
      </section>

      <section className="cb-plan">
        <p className="cb-tag">List of works</p>
        <ol>
          {PROJECTS.map((p, i) => (
            <li key={p.id}>
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                <span>{toRoman(i + 1)}.</span><span className="cb-plan__name">{p.name}</span><span>{p.signature}</span><span>{p.year}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <footer className="cb-foot">
        <p className="cb-foot__big">Commissions <i>open.</i></p>
        <div className="cb-foot__row">
          <a href={`mailto:${OWNER.email}`}>{OWNER.email}</a>
          <span>{OWNER.role}</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  )
}
