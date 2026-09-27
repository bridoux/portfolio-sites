import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

const STEPS = [
  { n: '500°F', t: 'Griddle temp', d: 'Carbon steel, seasoned daily and never scraped bare.' },
  { n: '3 oz', t: 'Per ball', d: 'Loosely packed so it spreads into lace, not a hockey puck.' },
  { n: '10 sec', t: 'Hard smash', d: 'A 6 lb steel press, leaned on with full body weight.' },
  { n: '90 sec', t: 'Total cook', d: 'Scrape, flip, cheese, stack. You get it seconds later.' },
]

export function Smash() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.smash__img', { scale: 1.3, rotate: -3 }, {
        scale: 1, rotate: 0, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.fromTo('.smash__word', { xPercent: 20 }, {
        xPercent: -35, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="smash" id="smash" ref={ref}>
      <p className="smash__word" aria-hidden="true">SMASH SMASH SMASH</p>
      <div className="smash__grid">
        <figure className="smash__media">
          <img className="smash__img" src="/img/smash.webp" alt="A cook pressing a patty onto a flaming griddle" loading="lazy" />
          <figcaption>Pit boss Marisol Reyes, 11:52 PM on a Saturday</figcaption>
        </figure>
        <div className="smash__copy">
          <p className="label" data-reveal>The Smash</p>
          <h2 data-reveal>Crust is a flavor.<br /><span>We chase it every time.</span></h2>
          <p data-reveal>Smashing a loose ball of beef onto screaming-hot steel sets off the Maillard reaction across every square inch. That crackly brown lace is the reason we exist.</p>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.t} data-reveal data-delay={i * 0.08}>
                <span className="steps__n">{s.n}</span>
                <span className="steps__t">{s.t}</span>
                <span className="steps__d">{s.d}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function Gallery() {
  return (
    <section className="gallery" aria-label="Inside Ember & Stack">
      <figure className="gallery__a" data-reveal><img src="/img/interior.webp" alt="The East Sixth dining room at night" loading="lazy" /></figure>
      <figure className="gallery__b" data-reveal data-delay={0.1}><img src="/img/table.webp" alt="Friends sharing burgers, fries and shakes" loading="lazy" /></figure>
      <blockquote className="gallery__quote" data-reveal>
        “Austin's best smash burger. Worth the line, and worth the napkins.”
        <cite>Austin Chronicle, Best of Austin 2025</cite>
      </blockquote>
    </section>
  )
}
