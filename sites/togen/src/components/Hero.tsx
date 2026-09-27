import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

/** Ensō brush circle, drawn on load, with an ink-mask reveal of the tea room. */
export function Hero() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const path = el.querySelector<SVGPathElement>('.enso path')
      if (path) {
        const len = path.getTotalLength()
        gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', delay: 0.2 })
      }
      gsap.from('.hero__img', { clipPath: 'circle(0% at 50% 50%)', duration: 2.2, ease: 'expo.inOut', delay: 0.6 })
      gsap.from('.hero__kanji span', { yPercent: 100, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out', delay: 1 })
      gsap.from('.hero__meta > *', { y: 30, opacity: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 1.6 })
      gsap.from('.hanko', { scale: 2.4, rotate: -30, opacity: 0, duration: 0.7, ease: 'back.out(2)', delay: 2.4 })
      gsap.to('.hero__img img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.enso', { rotate: 40, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" ref={ref}>
      <p className="hero__kanji" aria-label="Ichigo ichie: one time, one meeting">
        {['一', '期', '一', '会'].map((k, i) => <span key={i}>{k}</span>)}
      </p>
      <div className="hero__stage">
        <svg className="enso" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="9" />
            </filter>
          </defs>
          <path d="M210 38 C 110 30, 38 110, 44 212 C 50 312, 140 370, 232 360 C 322 350, 372 270, 360 184 C 350 110, 300 60, 238 50" />
        </svg>
        <figure className="hero__img">
          <img src="/img/tearoom.webp" alt="A quiet tatami tea room in morning light, a single bowl on a wooden tray" width={1800} height={1018} />
        </figure>
      </div>
      <div className="hero__meta">
        <p className="kicker">Higashiyama · Kyoto · since 1897</p>
        <h1 className="hero__title">Tōgen</h1>
        <p className="hero__lede">Tea, clay, and <em>the space between.</em> A tea house and ceramics atelier in the lanes below Kiyomizu-dera.</p>
        <a href="#ceremony" className="ink-link">Reserve a ceremony</a>
      </div>
      <span className="hanko" aria-hidden="true">桃源</span>
      <p className="hero__scroll" aria-hidden="true">scroll</p>
    </section>
  )
}
