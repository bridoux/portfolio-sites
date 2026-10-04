import { useEffect, useRef } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { Embers } from './Embers'
import STACK from '../data/stackLayers.json'

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
const CAPTION_FOCUS = [0, 1.5, 4.5, 7.5, 9, 10]

interface Layer { key: string; src: string; w: number; y: number; drift: number }

/**
 * Photographic ingredient layers, top → bottom (tuned with tools/burger-stack.cjs). Widths and
 * assembled centres are in units of the burger's width (W); together they form the hero burger.
 */
const LAYERS: Layer[] = STACK

/** Assembled burger: height and centre offset in W, so it can be fitted to the hero box. */
const ASSEMBLED = { height: 1.23, centre: -0.045 }

const GAP = 0.27 // exploded spacing, in W
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
    const born = last

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
      // The hero box (.stack__photo) sets the burger's size; fit the assembled stack's height into it
      const box = photo.clientWidth
      const W = (box * 1.04) / ASSEMBLED.height
      const intro = reduce ? 1 : easeOutBack(clamp01((now - born) / 1200))

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
        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`
      })

      // Camera: hero → overview → per-ingredient focus → overview → final
      const span = (lastIdx * GAP + 0.9) * W
      const overviewScale = Math.min(1, (vh * 0.76) / span)
      const focusScale = wide ? 1.02 : 0.9
      const fy = explodedY(focusIndex(p)) * W
      const bob = Math.sin(t * 1.05) * 0.008 * W * (1 - apart)
      const heroCam = { s: 0.9 + 0.1 * intro, x: 0, y: -ASSEMBLED.centre * W + (1 - intro) * 0.08 * W + bob }
      const overview = { s: overviewScale, x: 0, y: -vh * 0.07 }
      const focus = { s: focusScale, x: wide ? vw * 0.17 : 0, y: -fy * focusScale + (wide ? 0 : -vh * 0.08) }
      const finalCam = { s: 0.8, x: 0, y: -vh * 0.13 - ASSEMBLED.centre * W * 0.8 + bob }
      const mix = (a: typeof heroCam, b: typeof heroCam, k: number) => ({ s: lerp(a.s, b.s, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) })
      let cam = heroCam
      if (p < 0.22) cam = mix(heroCam, overview, smooth(0.05, 0.17, p))
      else if (p < 0.72) cam = mix(overview, focus, smooth(0.22, 0.3, p))
      else cam = mix(focus, finalCam, smooth(0.72, 0.79, p)) // restack straight into the final framing
      column.style.transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`

      // Warm glow under the assembled burger at the start and the end
      const glow = Math.max(1 - smooth(0.01, 0.06, p), smooth(0.86, 0.93, p))
      const glowCam = p > 0.5 ? finalCam : heroCam
      photo.style.opacity = String(glow * intro)
      photo.style.transform = `translate(-50%, -50%) translate3d(${glowCam.x}px, ${glowCam.y + ASSEMBLED.centre * W * glowCam.s}px, 0) scale(${glowCam.s})`
      column.style.opacity = String(Math.min(1, intro * 1.5))
    }
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); st.kill() }
  }, [])

  return (
    <section ref={sectionRef} className="stack" id="stack" aria-label="The Ember Double, deconstructed">
      <div className="stack__sticky">
        <Embers className="stack__embers" />
        <div className="stack__glow" aria-hidden="true" />

        <div className="stack__column" ref={columnRef} role="img" aria-label="The Ember Double: two smashed patties with American cheese, pickles, onion, tomato, lettuce and Ember sauce on a sesame brioche bun">
          {LAYERS.map((L, i) => (
            <img
              key={L.key}
              ref={(el) => { layerRefs.current[i] = el }}
              className="ingredient"
              src={L.src}
              alt=""
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              style={{ zIndex: LAYERS.length - i }}
            />
          ))}
        </div>

        <div className="stack__photo" ref={photoRef} aria-hidden="true" />

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
