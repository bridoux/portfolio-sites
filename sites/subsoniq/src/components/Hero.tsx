import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

/** The wordmark's variable-font width follows the pointer; letters jitter in on load. */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const wordRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    const word = wordRef.current
    if (!el || !word || prefersReducedMotion()) return
    const letters = word.querySelectorAll<HTMLElement>('.ch')
    const ctx = gsap.context(() => {
      gsap.from(letters, { yPercent: 120, rotate: () => gsap.utils.random(-25, 25), duration: 0.9, ease: 'back.out(1.6)', stagger: { each: 0.05, from: 'random' } })
      gsap.from('.hero__box', { clipPath: 'inset(50% 0 50% 0)', duration: 1.2, ease: 'expo.inOut', delay: 0.4 })
      gsap.from('.sticker', { scale: 0, rotate: -180, duration: 1, ease: 'back.out(2)', delay: 1 })
    }, el)

    const onMove = (e: PointerEvent) => {
      const r = word.getBoundingClientRect()
      letters.forEach((l) => {
        const lr = l.getBoundingClientRect()
        const dx = Math.abs(e.clientX - (lr.left + lr.width / 2)) / r.width
        const wdth = gsap.utils.clamp(62, 125, 125 - dx * 190)
        const wght = gsap.utils.clamp(500, 900, 900 - dx * 700)
        gsap.to(l, { fontVariationSettings: `'wdth' ${wdth}, 'wght' ${wght}`, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
      })
    }
    el.addEventListener('pointermove', onMove)
    return () => { el.removeEventListener('pointermove', onMove); ctx.revert() }
  }, [])

  return (
    <section className="hero" ref={ref}>
      <div className="hero__top">
        <span>Edition 07</span>
        <span>23—25.07.2027</span>
        <span>Centrale Nord · Rotterdam</span>
        <span className="hero__live"><i /> Tickets live</span>
      </div>
      <h1 className="hero__word" ref={wordRef} aria-label="Subsoniq">
        {'SUBSONIQ'.split('').map((c, i) => <span key={i} className="ch" aria-hidden="true">{c}</span>)}
      </h1>
      <div className="hero__grid">
        <figure className="hero__box">
          <img src="/img/crowd.webp" alt="Crowd under green and red lasers inside the concrete turbine hall" width={1800} height={1018} />
          <figcaption>[ REC ] Turbine Hall · 03:14 AM · 2025</figcaption>
        </figure>
        <div className="hero__side">
          <p className="hero__lede">Three nights of techno, bass and noise inside a decommissioned coal power station. Four stages, 62 artists, one 64-metre cooling tower.</p>
          <div className="hero__ctas">
            <a href="#tickets" className="bx bx--lime">Get tickets ↘</a>
            <a href="#lineup" className="bx">Lineup</a>
          </div>
        </div>
      </div>
      <div className="sticker" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <defs><path id="circ" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" /></defs>
          <text><textPath href="#circ">3 NIGHTS ✶ 4 STAGES ✶ 62 ARTISTS ✶ NO SLEEP ✶</textPath></text>
        </svg>
        <span>07</span>
      </div>
    </section>
  )
}

export function Ticker({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items]
  return (
    <div className={`ticker ${reverse ? 'ticker--rev' : ''}`} aria-hidden="true">
      <div className="ticker__track">{row.map((t, i) => <span key={i}>{t}<b>✶</b></span>)}</div>
    </div>
  )
}
