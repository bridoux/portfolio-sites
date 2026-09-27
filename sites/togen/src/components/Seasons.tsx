import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

const TEAS = [
  { season: 'Spring', kanji: '春', name: 'Shincha', jp: '新茶', note: 'The first flush, picked in the eighty-eighth night after the start of spring. It tastes of cut grass, sweet pea and morning rain.', temp: '70°C', steep: '60 s', price: '¥3,800 / 50 g', hue: '#b9c98a', ink: '#3f4a22' },
  { season: 'Summer', kanji: '夏', name: 'Gyokuro', jp: '玉露', note: 'Shaded under straw for three weeks until the leaves turn deep jade. Serve it cool, in thimble-sized cups. The taste is pure umami.', temp: '55°C', steep: '120 s', price: '¥6,200 / 50 g', hue: '#6f8f5a', ink: '#1f2e17' },
  { season: 'Autumn', kanji: '秋', name: 'Hōjicha', jp: 'ほうじ茶', note: 'Roasted over charcoal until the leaves go the colour of chestnut. It smells of toasted rice and fallen leaves, with very little caffeine.', temp: '90°C', steep: '30 s', price: '¥2,400 / 80 g', hue: '#b0784a', ink: '#3a2111' },
  { season: 'Winter', kanji: '冬', name: 'Usucha Matcha', jp: '薄茶', note: 'Stone-ground tencha from a single Uji garden, whisked thin and frothy. We serve it in winter beside the brazier with a sweet of white bean and yuzu.', temp: '80°C', steep: 'whisk 15 s', price: '¥5,400 / 30 g', hue: '#8aa04d', ink: '#233010' },
]

export function Seasons() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track || prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const distance = () => track.scrollWidth - window.innerWidth
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      gsap.utils.toArray<HTMLElement>('.tea__kanji').forEach((k) => {
        gsap.fromTo(k, { yPercent: 30 }, {
          yPercent: -30, ease: 'none',
          scrollTrigger: { trigger: k.closest('.tea'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        })
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="seasons" id="teas" ref={sectionRef}>
      <div className="seasons__track" ref={trackRef}>
        <header className="seasons__intro">
          <p className="kicker">四季の茶 · Four seasons of tea</p>
          <h2>Each season<br />gets <em>its own</em> tea.</h2>
          <p>We source from four family gardens in Uji and Wazuka. Each tea is released only in its season and only until it runs out.</p>
          <span className="seasons__hint" aria-hidden="true">drag your scroll →</span>
        </header>
        {TEAS.map((t, i) => (
          <article key={t.name} className="tea" style={{ ['--hue' as string]: t.hue, ['--ink' as string]: t.ink }}>
            <span className="tea__kanji" aria-hidden="true">{t.kanji}</span>
            <div className="tea__top">
              <span className="tea__num">0{i + 1}</span>
              <span className="tea__season">{t.season}</span>
            </div>
            <div className="tea__leaf" aria-hidden="true">
              <svg viewBox="0 0 120 120"><path d="M60 10 C 20 40, 20 90, 60 110 C 100 90, 100 40, 60 10 Z" /><path d="M60 18 L60 104" className="vein" /></svg>
            </div>
            <div className="tea__body">
              <h3>{t.name} <span lang="ja">{t.jp}</span></h3>
              <p>{t.note}</p>
              <dl>
                <div><dt>Water</dt><dd>{t.temp}</dd></div>
                <div><dt>Steep</dt><dd>{t.steep}</dd></div>
              </dl>
              <p className="tea__price">{t.price}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
