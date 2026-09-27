import { useEffect, useRef } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { Embers } from './Embers'

const CAPTIONS = [
  { tag: 'Baked daily · 4 AM', title: 'The Crown', body: 'Potato brioche from Hearth & Crumb, three blocks away. We brush it with beef tallow and toast it face-down until it crackles.' },
  { tag: '48-hour brine', title: 'The Bite', body: 'House bread-and-butter pickles and raw white onion shaved paper-thin. They add the acid and snap that cut through the richness.' },
  { tag: 'Dry-aged 21 days', title: 'Double Smash', body: 'Two 3 oz balls of chuck and short rib, smashed hard on a 500°F griddle for a lacy, caramelized crust. Ridgeline American melts over each one in forty seconds.' },
  { tag: '38 miles, farm to griddle', title: 'The Crunch', body: 'Cold iceberg and heirloom tomatoes from Bluebonnet Farm, picked Saturday morning and sliced to order.' },
  { tag: 'Recipe locked since 2019', title: 'Ember Sauce', body: 'Smoked chipotle, charred shallot and pickle brine, plus an eleventh ingredient we won’t tell you.' },
  { tag: 'Structurally sound', title: 'The Foundation', body: 'The bottom bun goes crumb-side up so it catches every drip. Nothing ends up on your shirt, and nothing gets wasted.' },
]

/** Caption windows: each focuses one layer index (top → bottom). */
const CAPTION_START = 0.26
const CAPTION_SPAN = 0.075
const CAPTION_FOCUS = [0, 1, 3.5, 6.5, 8, 9]

/**
 * Photographic ingredient layers, top → bottom. Sizes and assembled positions are in
 * units of the burger's width (W), measured against the hero photograph.
 */
const LAYERS = [
  { key: 'bun-top', src: '/img/layers/bun-top.webp', w: 0.9, y: -0.31, drift: -0.5 },
  { key: 'pickles', src: '/img/layers/pickles.webp', w: 0.86, y: -0.13, drift: 0.6 },
  { key: 'cheese-a', src: '/img/layers/cheese.webp', w: 0.96, y: -0.04, drift: -0.35 },
  { key: 'patty-a', src: '/img/layers/patty.webp', w: 1, y: 0.0, drift: 0.4 },
  { key: 'cheese-b', src: '/img/layers/cheese.webp', w: 0.94, y: 0.09, drift: 0.3, flip: true },
  { key: 'patty-b', src: '/img/layers/patty.webp', w: 0.99, y: 0.13, drift: -0.45, flip: true },
  { key: 'tomato', src: '/img/layers/tomato.webp', w: 0.8, y: 0.21, drift: 0.5 },
  { key: 'lettuce', src: '/img/layers/lettuce.webp', w: 0.98, y: 0.27, drift: -0.4 },
  { key: 'sauce', src: '/img/layers/sauce.webp', w: 0.8, y: 0.34, drift: 0.35 },
  { key: 'bun-bottom', src: '/img/layers/bun-bottom.webp', w: 0.86, y: 0.41, drift: -0.2 },
] as const

const GAP = 0.3 // exploded spacing, in W
const MID = (LAYERS.length - 1) / 2

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutBack = (t: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const smooth = (a: number, b: number, v: number) => easeInOut(clamp01((v - a) / (b - a)))
const explodedY = (i: number) => (i - MID) * GAP

function focusIndex(p: number): number {
  const k = clamp01((p - CAPTION_START) / (CAPTION_SPAN * CAPTION_FOCUS.length)) * CAPTION_FOCUS.length
  const i = Math.min(CAPTION_FOCUS.length - 1, Math.floor(k))
  const next = Math.min(CAPTION_FOCUS.length - 1, i + 1)
  return lerp(CAPTION_FOCUS[i], CAPTION_FOCUS[next], smooth(0.6, 1, k - i))
}

interface Props { onOrder: () => void }

export function BurgerScroller({ onOrder }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLImageElement | null)[]>([])
  const captionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const photo = photoRef.current
    const column = columnRef.current
    if (!section || !photo || !column) return
    const reduce = prefersReducedMotion()
    let target = 0
    let current = 0
    let raf = 0
    let last = performance.now()

    const onUpdate = (p: number) => {
      target = p
      section.style.setProperty('--p', p.toFixed(4))
      CAPTIONS.forEach((_, i) => {
        const a = CAPTION_START + i * CAPTION_SPAN
        captionRefs.current[i]?.classList.toggle('is-active', p >= a + 0.012 && p < a + CAPTION_SPAN - 0.004)
      })
      section.classList.toggle('is-final', p > 0.9)
    }
    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', onUpdate: (s) => onUpdate(s.progress) })
    onUpdate(0)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = now / 1000
      current = reduce ? target : current + (target - current) * Math.min(1, dt * 4.5)
      const p = current
      const vw = window.innerWidth
      const vh = window.innerHeight
      const wide = vw / vh > 1.1
      const W = photo.clientWidth // the trimmed photo is exactly one burger wide

      // Ingredients: apart top-first (0.06→0.22), then restack bottom-first with a bounce (0.72→0.9)
      const apart = smooth(0.06, 0.22, p)
      const restack = clamp01((p - 0.72) / 0.18)
      const lastIdx = LAYERS.length - 1
      LAYERS.forEach((L, i) => {
        const el = layerRefs.current[i]
        if (!el) return
        const land = easeOutBack(clamp01(restack * 1.5 - (lastIdx - i) * 0.05))
        const e = p < 0.72 ? easeInOut(clamp01(apart * 1.1 - i * 0.01)) : 1 - land
        const y = lerp(L.y, explodedY(i), e) * W
        const x = L.drift * e * W * (wide ? 0.22 : 0.08)
        const rot = L.drift * 7 * e + Math.sin(t * 0.9 + i) * 1.6 * e
        el.style.width = `${L.w * W}px`
        const mirror = 'flip' in L && L.flip ? ' scaleX(-1)' : ''
        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)${mirror}`
      })

      // Camera: hero → overview → per-ingredient focus → overview → final
      const span = (lastIdx * GAP + 0.9) * W
      const overviewScale = Math.min(1, (vh * 0.76) / span)
      const focusScale = wide ? 1.02 : 0.9
      const fy = explodedY(focusIndex(p)) * W
      const heroCam = { s: 1, x: 0, y: 0 }
      const overview = { s: overviewScale, x: 0, y: -vh * 0.07 }
      const focus = { s: focusScale, x: wide ? vw * 0.17 : 0, y: -fy * focusScale + (wide ? 0 : -vh * 0.08) }
      const finalCam = { s: 0.8, x: 0, y: -vh * 0.1 }
      const mix = (a: typeof heroCam, b: typeof heroCam, k: number) => ({ s: lerp(a.s, b.s, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) })
      let cam = heroCam
      if (p < 0.22) cam = mix(heroCam, overview, smooth(0.05, 0.17, p))
      else if (p < 0.72) cam = mix(overview, focus, smooth(0.22, 0.3, p))
      else cam = mix(focus, finalCam, smooth(0.72, 0.79, p)) // restack straight into the final framing
      column.style.transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`

      // The whole photograph stands in for the assembled burger at the start and the end
      const photoIn = Math.max(1 - smooth(0.01, 0.05, p), smooth(0.86, 0.93, p))
      const heroShrink = 1 - smooth(0.01, 0.05, p) * 0.04
      const photoCam = p > 0.5 ? finalCam : { s: heroShrink, x: 0, y: 0 }
      photo.style.opacity = String(photoIn)
      photo.style.transform = `translate(-50%, -50%) translate3d(${photoCam.x}px, ${photoCam.y}px, 0) scale(${photoCam.s})`
      column.style.opacity = String(1 - photoIn)
    }
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); st.kill() }
  }, [])

  return (
    <section ref={sectionRef} className="stack" id="stack" aria-label="The Ember Double, deconstructed">
      <div className="stack__sticky">
        <Embers className="stack__embers" />
        <div className="stack__glow" aria-hidden="true" />

        <div className="stack__column" ref={columnRef} aria-hidden="true">
          {LAYERS.map((L, i) => (
            <img
              key={L.key}
              ref={(el) => { layerRefs.current[i] = el }}
              className="ingredient"
              src={L.src}
              alt=""
              style={{ zIndex: LAYERS.length - i }}
            />
          ))}
        </div>

        <div className="stack__photo" ref={photoRef}>
          <img src="/img/hero-burger.webp" alt="The Ember Double: two smashed patties, American cheese, pickles, onion, tomato and lettuce on a sesame brioche bun" width={1400} height={1451} fetchPriority="high" />
        </div>

        <div className="hero">
          <p className="hero__kicker"><span className="dot" /> Austin, TX · Smashing since 2019</p>
          <h1 className="hero__title">
            <span className="hero__line">Smashed.</span>
            <span className="hero__line hero__line--r">Stacked.</span>
            <span className="hero__line hero__line--fire">Set on fire.</span>
          </h1>
          <p className="hero__scroll">Scroll to take it apart ↓</p>
        </div>

        <ol className="captions">
          {CAPTIONS.map((c, i) => (
            <li key={c.title} className="caption" ref={(el) => { captionRefs.current[i] = el }}>
              <span className="caption__index">{String(i + 1).padStart(2, '0')} / 06</span>
              <h2 className="caption__title">{c.title}</h2>
              <p className="caption__body">{c.body}</p>
              <span className="caption__tag">{c.tag}</span>
            </li>
          ))}
        </ol>

        <div className="final">
          <p className="final__kicker">Put back together</p>
          <p className="final__title">The Ember Double <span>$14</span></p>
          <button type="button" className="btn btn--fire" onClick={onOrder}>Add to bag</button>
        </div>

        <div className="stack__meter" aria-hidden="true"><i /></div>
      </div>
    </section>
  )
}
