import { useEffect, useRef } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { loadFrameSequence, frameUrl } from '../lib/frameSequence'
import { Embers } from './Embers'
import SEQ from '../data/burgerSeq.json'

const CAPTIONS = [
  { tag: 'Baked daily · 4 AM', title: 'The Crown', body: 'Potato brioche from Hearth & Crumb, three blocks away. We brush it with beef tallow and toast it face-down until it crackles.' },
  { tag: '48-hour brine', title: 'The Bite', body: 'House bread-and-butter pickles and raw white onion shaved paper-thin. They add the acid and snap that cut through the richness.' },
  { tag: 'Dry-aged 21 days', title: 'Double Smash', body: 'Two 3 oz balls of chuck and short rib, smashed hard on a 500°F griddle for a lacy, caramelized crust. Ridgeline American melts over each one in forty seconds.' },
  { tag: '38 miles, farm to griddle', title: 'The Crunch', body: 'Cold iceberg and heirloom tomatoes from Bluebonnet Farm, picked Saturday morning and sliced to order.' },
  { tag: 'Recipe locked since 2019', title: 'Ember Sauce', body: 'Smoked chipotle, charred shallot and pickle brine, plus an eleventh ingredient we won’t tell you.' },
  { tag: 'Structurally sound', title: 'The Foundation', body: 'The bottom bun goes crumb-side up so it catches every drip. Nothing ends up on your shirt, and nothing gets wasted.' },
]

/** Caption windows, and the layer each one frames (index into SEQ.exploded.layers; fractional = between two). */
const CAPTION_START = 0.26
const CAPTION_SPAN = 0.075
const CAPTION_FOCUS = [0, 1.5, 4.5, 7.5, 9, 10]

/** Scroll phases: the film plays forward to take the burger apart, then backward to restack it. */
const EXPLODE = [0.05, 0.22] as const
const RESTACK = [0.72, 0.88] as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, v: number) => easeInOut(clamp01((v - a) / (b - a)))

const LAYER_Y = SEQ.exploded.layers.map((l) => l.y)
const layerY = (f: number) => {
  const i = Math.floor(f)
  return lerp(LAYER_Y[i], LAYER_Y[Math.min(LAYER_Y.length - 1, i + 1)], f - i)
}

function focusIndex(p: number): number {
  const k = clamp01((p - CAPTION_START) / (CAPTION_SPAN * CAPTION_FOCUS.length)) * CAPTION_FOCUS.length
  const i = Math.min(CAPTION_FOCUS.length - 1, Math.floor(k))
  const next = Math.min(CAPTION_FOCUS.length - 1, i + 1)
  return lerp(CAPTION_FOCUS[i], CAPTION_FOCUS[next], smooth(0.6, 1, k - i))
}

/** Film frame for scroll progress p: 0 = assembled, last = fully apart. Linear, so motion keeps the film's own timing. */
function frameAt(p: number): number {
  const last = SEQ.count - 1
  if (p < RESTACK[0]) return clamp01((p - EXPLODE[0]) / (EXPLODE[1] - EXPLODE[0])) * last
  return (1 - clamp01((p - RESTACK[0]) / (RESTACK[1] - RESTACK[0]))) * last
}

interface Cam { s: number; x: number; y: number }
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ s: lerp(a.s, b.s, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) })

interface Props { onOrder: () => void }

export function BurgerScroller({ onOrder }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!section || !canvas || !ctx) return
    const reduce = prefersReducedMotion()
    canvas.width = SEQ.width
    canvas.height = SEQ.height
    let drawn: HTMLImageElement | null = null
    const seq = loadFrameSequence(SEQ.path, SEQ.count, () => { drawn = null })
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
      current = reduce ? target : current + (target - current) * Math.min(1, dt * 5)
      const p = current

      // Paint the nearest loaded frame, only when it changes
      const img = seq.nearest(frameAt(p))
      if (img && img !== drawn) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawn = img
      }

      // Camera: the film is fitted to the viewport ("contain"), then scaled and moved per phase
      const vw = window.innerWidth
      const vh = window.innerHeight
      const wide = vw / vh > 1.1
      const fit = Math.min(vw / SEQ.width, vh / SEQ.height)
      const Dw = SEQ.width * fit
      const Dh = SEQ.height * fit
      canvas.style.width = `${Dw}px`
      canvas.style.height = `${Dh}px`
      /** Camera putting frame-height fraction `fy` at viewport offset `ty` (from centre) at scale s. */
      const aim = (s: number, fy: number, ty: number, x = 0): Cam => ({ s, x, y: ty - (fy - 0.5) * Dh * s })

      const intro = reduce ? 1 : easeInOut(clamp01((now - born) / 1100))
      const still = p < EXPLODE[0] || p > RESTACK[1] ? 1 : 0
      const bob = Math.sin(t * 1.05) * vh * 0.006 * still
      const heroBox = wide ? Math.min(vw * 0.47, vh * 0.82) * 0.84 : Math.min(vw * 0.98, vh * 0.64) * 0.9
      const heroS = heroBox / (SEQ.hero.w * Dw)
      const hero = aim(heroS * (0.92 + 0.08 * intro), SEQ.hero.y, vh * (wide ? 0.07 : 0.03) + (1 - intro) * vh * 0.04 + bob)
      const span = (SEQ.exploded.bottom - SEQ.exploded.top) * Dh
      const overview = aim(Math.min(1.05, (vh * 0.8) / span), (SEQ.exploded.top + SEQ.exploded.bottom) / 2, vh * 0.03)
      const focusS = (wide ? vw * 0.3 : vw * 0.78) / (0.56 * Dw)
      const focus = aim(focusS, layerY(focusIndex(p)), wide ? vh * 0.02 : -vh * 0.12, wide ? vw * 0.17 : 0)
      const final = aim(heroS * 0.82, SEQ.hero.y, -vh * 0.06 + bob)

      let cam: Cam
      if (p < EXPLODE[1]) cam = mixCam(hero, overview, smooth(0.04, 0.2, p))
      else if (p < RESTACK[0]) cam = mixCam(overview, focus, smooth(0.22, 0.3, p))
      else cam = mixCam(focus, final, smooth(RESTACK[0], 0.8, p))
      canvas.style.transform = `translate(-50%, -50%) translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`
      canvas.style.opacity = String(Math.min(1, intro * 1.4))
    }
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); st.kill(); seq.dispose() }
  }, [])

  return (
    <section ref={sectionRef} className="stack" id="stack" aria-label="The Ember Double, deconstructed">
      <div className="stack__sticky">
        <div className="stack__glow" aria-hidden="true" />
        <canvas
          ref={canvasRef}
          className="stack__film"
          role="img"
          aria-label="The Ember Double: two smashed patties with American cheese, pickles, onion, tomato, lettuce and Ember sauce on a sesame brioche bun"
          style={{ backgroundImage: `url(${frameUrl(SEQ.path, 0)})` }}
        />
        <Embers className="stack__embers" />

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
