import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

export function Philosophy() {
  return (
    <section className="philo" id="about">
      <p className="philo__vertical" lang="ja" aria-hidden="true">茶は一服の静けさ</p>
      <div className="philo__body">
        <p className="kicker" data-reveal>哲学 · Philosophy</p>
        <p className="philo__lead" data-reveal>
          <em>Ichigo ichie</em> means “one time, one meeting.” No bowl of tea can be poured twice. The light, the steam, the people in the room happen once, and then they are gone.
        </p>
        <div className="philo__cols">
          <p data-reveal>For four generations the Mori family has kept this house open for that one meeting. We grind our matcha by hand on granite, sixty grams an hour. We fire our kiln twice a year and let the ash settle where it likes.</p>
          <p data-reveal data-delay={0.1}>We don't have a menu. You tell us how your morning went and we choose the tea. The bowl it comes in may be three hundred years old or three weeks old. Both get used.</p>
        </div>
      </div>
    </section>
  )
}

const WARES = [
  { name: 'Raku chawan, “Yoru”', maker: 'Kenji Mori', price: 48000, img: '/img/chawan.webp', tall: true, note: 'Ash glaze, crackled in the cooling' },
  { name: 'Three forms', maker: 'Atelier collection', price: 26500, img: '/img/trio.webp', note: 'Celadon cup, iron kyūsu, shino bowl' },
  { name: 'Anagama firing', maker: 'The kiln, February', price: null, img: '/img/kiln.webp', tall: true, note: 'Five days, four hundred bundles of red pine' },
]
const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

export function Collection() {
  return (
    <section className="wares" id="clay">
      <header className="wares__head">
        <p className="kicker" data-reveal>土 · Clay</p>
        <h2 data-reveal>Bowls made to be <em>held</em>, not shelved.</h2>
      </header>
      <div className="wares__grid">
        {WARES.map((w, i) => (
          <figure key={w.name} className={`ware ware--${i} ${w.tall ? 'ware--tall' : ''}`} data-reveal data-delay={i * 0.12}>
            <div className="ware__img"><img src={w.img} alt={`${w.name} — ${w.note}`} loading="lazy" /></div>
            <figcaption>
              <span className="ware__maker">{w.maker}</span>
              <span className="ware__name">{w.name}</span>
              <span className="ware__note">{w.note}</span>
              {w.price !== null && <span className="ware__price">{yen(w.price)}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export function Potter() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.potter__img img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.potter__quote .w', { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '.potter__quote', start: 'top 80%', end: 'bottom 45%', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])
  const quote = 'The clay already knows what it wants to become. My work is mostly to stop arguing with it.'
  return (
    <section className="potter" ref={ref}>
      <figure className="potter__img"><img src="/img/potter.webp" alt="Kenji Mori's hands shaping a bowl on a kick wheel" loading="lazy" /></figure>
      <div className="potter__copy">
        <p className="kicker" data-reveal>作家 · The potter</p>
        <blockquote className="potter__quote">
          {quote.split(' ').map((w, i) => <span key={i} className="w">{w} </span>)}
        </blockquote>
        <p className="potter__cite" data-reveal>Kenji Mori, fourth-generation potter, b. 1951</p>
        <p className="potter__bio" data-reveal>Kenji throws on a wooden kick wheel his grandfather built in 1932. He makes about three hundred bowls a year and keeps around forty. The rest go back into the clay bin, which he considers a perfectly good outcome.</p>
      </div>
    </section>
  )
}

export function Fields() {
  return (
    <section className="fields" aria-label="Uji tea fields">
      <img src="/img/fields.webp" alt="Terraced tea fields in Uji on a misty morning" loading="lazy" />
      <div className="fields__haiku" lang="ja">
        <p>朝霧や</p>
        <p>茶摘みの唄の</p>
        <p>遠ざかる</p>
      </div>
      <p className="fields__en">Morning mist, the tea pickers' song drifting further off.</p>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__mark" aria-hidden="true">桃源</div>
      <div className="footer__cols">
        <div><h4>Visit</h4><p>2-214 Kiyomizu, Higashiyama-ku<br />Kyoto 605-0862</p><p lang="ja">京都市東山区清水2丁目214</p></div>
        <div><h4>Hours</h4><p>Tea room 10:00–17:00<br />Closed Wednesdays &amp; the full moon</p></div>
        <div><h4>Letters</h4><p>A seasonal letter four times a year. No sales, just tea.</p></div>
      </div>
      <p className="footer__legal">© 2026 Tōgen. A fictional tea house imagined for a design portfolio.</p>
    </footer>
  )
}

export function Cursor() {
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion())
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const t = e.target as HTMLElement
      el.classList.toggle('is-hover', !!t.closest('a, button, .ware, .tea, label'))
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [enabled])
  if (!enabled) return null
  return <div className="cursor" ref={ref} aria-hidden="true" />
}
