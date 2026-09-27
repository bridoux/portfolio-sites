import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

const WATCHES = [
  {
    name: 'Nocturne 38',
    ref: 'Réf. 1891-NR',
    img: '/img/nocturne.webp',
    material: '18k rose gold · midnight sunburst',
    detail: 'Small seconds · 72 h reserve · 38 mm',
    price: 'CHF 32,400',
  },
  {
    name: 'Squelette Titane 42',
    ref: 'Réf. 2210-ST',
    img: '/img/squelette.webp',
    material: 'Grade 5 titanium · open-worked',
    detail: 'Flyback chronograph · 60 h · 42 mm',
    price: 'CHF 48,900',
  },
  {
    name: 'Lune Émail 40',
    ref: 'Réf. 1720-LE',
    img: '/img/lune.webp',
    material: 'Steel · grand feu enamel',
    detail: 'Astronomical moonphase · 40 mm',
    price: 'CHF 27,600',
  },
]

export function Collection() {
  return (
    <section className="collection" id="collection">
      <header className="section-head">
        <p className="eyebrow" data-reveal><span className="idx">01</span>La Collection · 2026</p>
        <h2 className="section-head__title" data-reveal>
          Three watches. <em>No hurry.</em>
        </h2>
        <p className="section-head__lede" data-reveal>
          We make fewer than four hundred watches a year. Each one is assembled, regulated and cased by a single watchmaker, who signs the movement by hand.
        </p>
      </header>
      <div className="collection__grid">
        {WATCHES.map((w, i) => (
          <article key={w.name} className={`watch-card watch-card--${i}`} data-reveal data-delay={i * 0.12}>
            <div className="watch-card__media">
              <img src={w.img} alt={`${w.name}, ${w.material}`} loading="lazy" width={872} height={1168} />
              <span className="watch-card__ref">{w.ref}</span>
            </div>
            <div className="watch-card__body">
              <h3>{w.name}</h3>
              <p>{w.material}</p>
              <p className="watch-card__detail">{w.detail}</p>
              <div className="watch-card__foot">
                <span>{w.price}</span>
                <a href="#visite" className="link-arrow">Reserve <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const STATS = [
  { value: 1891, label: 'Founded in Le Sentier' },
  { value: 14, label: 'Master watchmakers' },
  { value: 480, label: 'Hours in every watch' },
  { value: 31, label: 'Jewels in the A-27' },
]

export function Atelier() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.atelier__media img', { yPercent: -12, scale: 1.15 }, {
        yPercent: 12, scale: 1.05, ease: 'none',
        scrollTrigger: { trigger: '.atelier__media', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.utils.toArray<HTMLElement>('.stat__value').forEach((node) => {
        const end = Number(node.dataset.value)
        const obj = { v: end > 1000 ? 1800 : 0 }
        gsap.to(obj, {
          v: end, duration: 2.2, ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 90%', once: true },
          onUpdate: () => { node.textContent = String(Math.round(obj.v)) },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="atelier" id="atelier" ref={ref}>
      <div className="atelier__media">
        <img src="/img/atelier.webp" alt="A watchmaker's hands assembling a movement under a brass lamp" loading="lazy" />
      </div>
      <div className="atelier__copy">
        <p className="eyebrow" data-reveal><span className="idx">02</span>L'Atelier</p>
        <blockquote data-reveal>
          “Our clients are paying for the hours nobody will ever see: the underside of a bridge, polished as carefully as the dial.”
        </blockquote>
        <p className="atelier__cite" data-reveal>Hélène Vautier, Maître horloger, fourth generation</p>
        <dl className="stats">
          {STATS.map((s) => (
            <div key={s.label} className="stat" data-reveal>
              <dt className="stat__label">{s.label}</dt>
              <dd className="stat__value" data-value={s.value}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function Valley() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.valley__img', { scale: 1.25 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.fromTo('.valley__line span', { yPercent: 110 }, {
        yPercent: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 60%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="valley" ref={ref} aria-label="The Vallée de Joux">
      <img className="valley__img" src="/img/joux.webp" alt="Misty dawn over the Vallée de Joux" loading="lazy" />
      <div className="valley__copy">
        <p className="valley__line"><span>Winters here last six months.</span></p>
        <p className="valley__line"><span>So farmers learned to make</span></p>
        <p className="valley__line"><span><em>very small, very patient things.</em></span></p>
      </div>
    </section>
  )
}

export function Service() {
  return (
    <section className="service">
      <figure className="service__media" data-reveal>
        <img src="/img/wrist.webp" alt="A rose-gold Nocturne worn with a charcoal suit" loading="lazy" />
      </figure>
      <div className="service__copy">
        <p className="eyebrow" data-reveal><span className="idx">03</span>Le Service Perpétuel</p>
        <h2 data-reveal>Every Aurèle is serviced by us for as long as it exists.</h2>
        <p data-reveal>
          Every watch comes with a lifetime service covenant. Every seven years it returns to Le Sentier to be stripped, cleaned, re-oiled and regulated by the atelier that made it. The service record passes with the watch from owner to owner.
        </p>
        <ul className="service__list" data-reveal>
          <li><span>01</span>Full disassembly &amp; ultrasonic cleaning</li>
          <li><span>02</span>Gaskets, mainspring &amp; oils renewed</li>
          <li><span>03</span>Regulation in six positions, ±2 s/day</li>
          <li><span>04</span>Case &amp; bracelet refinished by hand</li>
        </ul>
      </div>
    </section>
  )
}
