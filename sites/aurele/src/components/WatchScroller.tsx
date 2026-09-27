import { useEffect, useRef, type CSSProperties } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import geo from '../data/watchLayers.json'

interface Chapter {
  range: [number, number]
  numeral: string
  title: string
  body: string
  spec: string
}

const PARTS = 347

const CHAPTERS: Chapter[] = [
  { range: [0.3, 0.408], numeral: 'I', title: 'Verre saphir', body: 'A domed sapphire crystal, ground for nine hours and coated seven times against reflection. Only diamond is harder.', spec: '9 Mohs · 7-layer AR' },
  { range: [0.408, 0.516], numeral: 'II', title: 'Lunette & aiguilles', body: 'The bezel is milled from a single block of grade 5 titanium and held by six hexagonal screws. The skeleton sword hands are filled with luminescent paint, so you can read the time in the dark.', spec: 'Titane grade 5 · 6 vis' },
  { range: [0.516, 0.624], numeral: 'III', title: 'Cadran squelette', body: 'Most of the dial has been cut away. What remains is a chapter ring and three chronograph counters, so you can watch the movement working behind them.', spec: '3 counters · open-worked' },
  { range: [0.624, 0.732], numeral: 'IV', title: 'Calibre A-42', body: 'Our in-house flyback chronograph, with a column wheel, vertical clutch and 60-hour power reserve. Every bridge is skeletonized and bevelled by hand.', spec: `${PARTS} parts · 39 rubis · 60 h` },
  { range: [0.732, 0.84], numeral: 'V', title: 'Masse oscillante', body: 'An open-worked titanium rotor with a tungsten rim for weight. It winds the mainspring as your wrist moves, and you can watch it through the sapphire caseback.', spec: 'Titane · masse tungstène' },
]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, v: number) => ease(clamp01((v - a) / (b - a)))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Each photographic layer: assembled depth (z0), exploded depth (z1, px) and its
 * front-to-back "peel" index — once the chapters move past it, it lifts away and fades.
 */
type LayerKey = 'crystal' | 'bezel' | 'chrono' | 'minute' | 'hour' | 'dial' | 'case' | 'strapTop' | 'strapBottom' | 'movement' | 'rotor' | 'caseback'
const LAYERS: Record<LayerKey, { z0: number; z1: number; peel: number; y1?: number; delay: number }> = {
  crystal: { z0: 34, z1: 640, peel: 0, delay: 0 },
  bezel: { z0: 28, z1: 520, peel: 1, delay: 0.04 },
  chrono: { z0: 24, z1: 450, peel: 1, delay: 0.06 },
  minute: { z0: 21, z1: 400, peel: 1, delay: 0.07 },
  hour: { z0: 18, z1: 340, peel: 1, delay: 0.09 },
  dial: { z0: 10, z1: 210, peel: 2, delay: 0.12 },
  case: { z0: 0, z1: 0, peel: 2, delay: 0 },
  strapTop: { z0: -6, z1: -90, peel: 2, y1: -30, delay: 0.05 },
  strapBottom: { z0: -6, z1: -90, peel: 2, y1: 30, delay: 0.05 },
  movement: { z0: -20, z1: -300, peel: 3, delay: 0.16 },
  rotor: { z0: -40, z1: -470, peel: 4, delay: 0.2 },
  caseback: { z0: -52, z1: -640, peel: 6, delay: 0.24 },
}

/** Skeleton dial geometry, in fractions of the dial image (measured from the generated part). */
const DIAL = {
  hub: { x: 0.52, y: 0.47 },
  subdials: [
    { key: 'sec', x: 0.24, y: 0.468 },
    { key: 'min30', x: 0.763, y: 0.468 },
    { key: 'hr12', x: 0.5, y: 0.683 },
  ],
  subHandLen: 0.1,
} as const

/** A circular part centred on the dial axis, as a % box within the reference photo's frame. */
function circleStyle(radiusFrac: number, shift = { x: 0, y: 0 }): CSSProperties {
  const d = radiusFrac * 2
  const hPct = (d * geo.frame.w) / geo.frame.h
  return {
    width: `${d * 100}%`, height: `${hPct * 100}%`,
    left: `${(geo.cx - radiusFrac + shift.x * d) * 100}%`,
    top: `${(geo.cy - hPct / 2 + shift.y * hPct) * 100}%`,
  }
}

function handStyle(lengthFrac: number): CSSProperties {
  // Image height such that pivot→tip spans `lengthFrac` of the frame width
  const imgH = (lengthFrac / (geo.hand.pivotY - (1 - geo.hand.lengthFrac))) * geo.frame.w / geo.frame.h
  const imgW = imgH * geo.hand.aspect * (geo.frame.h / geo.frame.w)
  return {
    width: `${imgW * 100}%`, height: `${imgH * 100}%`,
    left: `${(geo.cx - imgW / 2) * 100}%`, top: `${(geo.cy - imgH * geo.hand.pivotY) * 100}%`,
    transformOrigin: `50% ${geo.hand.pivotY * 100}%`,
  }
}

/** Central chronograph seconds hand: a thin CSS needle sharing the dial axis. */
function chronoStyle(): CSSProperties {
  const len = geo.dialR * 0.97
  const tail = geo.dialR * 0.2
  const hPct = ((len + tail) * geo.frame.w) / geo.frame.h
  const w = 0.006
  return {
    width: `${w * 100}%`, height: `${hPct * 100}%`,
    left: `${(geo.cx - w / 2) * 100}%`, top: `${(geo.cy - (len * geo.frame.w) / geo.frame.h) * 100}%`,
    transformOrigin: `50% ${(len / (len + tail)) * 100}%`,
  }
}

// Shift the dial so its central hub sits exactly on the hands' axis
const dialShift = { x: -(DIAL.hub.x - 0.5), y: -(DIAL.hub.y - 0.5) }

export function WatchScroller() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Partial<Record<LayerKey, HTMLElement | null>>>({})
  const subRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const chaptersRef = useRef<(HTMLElement | null)[]>([])
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stack = stackRef.current
    if (!section || !stack) return
    const reduce = prefersReducedMotion()
    let target = 0
    let current = 0
    let px = 0, py = 0, spx = 0, spy = 0
    let raf = 0
    let last = performance.now()
    const chronoStart = performance.now()

    const onUpdate = (p: number) => {
      target = p
      section.style.setProperty('--p', p.toFixed(4))
      CHAPTERS.forEach((c, i) => chaptersRef.current[i]?.classList.toggle('is-active', p >= c.range[0] && p < c.range[1]))
      section.classList.toggle('is-final', p > 0.92)
      if (counterRef.current) counterRef.current.textContent = String(Math.round(smooth(0.06, 0.3, p) * PARTS)).padStart(3, '0')
    }
    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', onUpdate: (s) => onUpdate(s.progress) })
    onUpdate(0)

    const onMove = (e: PointerEvent) => { px = (e.clientX / window.innerWidth) * 2 - 1; py = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', onMove)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      current = reduce ? target : current + (target - current) * Math.min(1, dt * 5)
      spx += (px - spx) * Math.min(1, dt * 3)
      spy += (py - spy) * Math.min(1, dt * 3)
      const p = current
      const wide = window.innerWidth / window.innerHeight > 1.1

      // Apart (0.08→0.3), hold with chapters peeling front→back, then reassemble (0.84→0.95)
      const E = smooth(0.08, 0.3, p) * (1 - smooth(0.84, 0.95, p))
      const peelCursor = clamp01((p - 0.3) / 0.54) * 5 * E

      const d = new Date()
      const sec = d.getSeconds() + d.getMilliseconds() / 1000
      const min = d.getMinutes() + sec / 60
      const chronoSec = ((now - chronoStart) / 1000) % 60

      ;(Object.keys(LAYERS) as LayerKey[]).forEach((k) => {
        const el = layerRefs.current[k]
        if (!el) return
        const L = LAYERS[k]
        const e = ease(clamp01(E * 1.3 - L.delay))
        const peel = smooth(L.peel + 0.72, L.peel + 1.02, peelCursor)
        const isFrame = k === 'case' || k === 'strapTop' || k === 'strapBottom'
        const z = lerp(L.z0, L.z1, e) + peel * (isFrame ? 60 : 520)
        const y = (L.y1 ?? 0) * e
        let rot = ''
        if (k === 'minute') rot = ` rotate(${(min / 60) * 360}deg)`
        if (k === 'hour') rot = ` rotate(${(((d.getHours() % 12) + min / 60) / 12) * 360}deg)`
        if (k === 'chrono') rot = ` rotate(${chronoSec * 6}deg)`
        if (k === 'rotor') rot = ` rotate(${Math.sin(now / 2600) * 38 + p * 540}deg)`
        el.style.transform = `translate3d(0, ${y}%, ${z}px)${rot}`
        el.style.opacity = String(1 - peel * (isFrame ? 0.78 : 0.94))
      })

      // Subdials: running seconds at 9, 30-minute counter at 3, 12-hour counter at 6
      const chronoMin = ((now - chronoStart) / 60000) % 30
      const subAngles: Record<string, number> = { sec: Math.floor(sec) * 6, min30: chronoMin * 12, hr12: (chronoMin / 30) * 15 }
      Object.entries(subAngles).forEach(([key, deg]) => {
        const el = subRefs.current[key]
        if (el) el.style.transform = `rotate(${deg}deg)`
      })

      const tiltX = lerp(0, 56, E) - spy * 6 * (1 - E * 0.5)
      const tiltZ = lerp(0, -24, E)
      const tiltY = spx * 9 * (1 - E * 0.5)
      const scale = lerp(1, wide ? 0.66 : 0.6, E)
      const x = wide ? lerp(17, 15, E) : 0
      const yShift = wide ? lerp(0, 4, E) : lerp(-6, 6, E)
      stack.style.transform = `translate3d(${x}vw, ${yShift}vh, 0) scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${tiltZ}deg)`
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      st.kill()
    }
  }, [])

  const set = (k: LayerKey) => (el: HTMLElement | null) => { layerRefs.current[k] = el }

  return (
    <section ref={sectionRef} className="scroller" id="calibre" aria-label="The Squelette Titane 42, disassembled">
      <div className="scroller__sticky">
        <div className="scroller__word" aria-hidden="true">Aurèle</div>

        <div className="stage" aria-hidden="true">
          <div className="stack" ref={stackRef}>
            <img ref={set('caseback')} className="layer layer--round" src="/img/watch/caseback.webp" alt="" style={circleStyle(geo.bezelR * 0.98)} />
            <img ref={set('rotor')} className="layer layer--round" src="/img/watch/rotor.webp" alt="" style={circleStyle(geo.dialR * 1.02)} />
            <img ref={set('movement')} className="layer layer--round" src="/img/watch/movement.webp" alt="" style={circleStyle(geo.dialR * 1.02)} />
            <img ref={set('strapTop')} className="layer layer--frame layer--strap-top" src="/img/watch/straps.webp" alt="" />
            <img ref={set('strapBottom')} className="layer layer--frame layer--strap-bottom" src="/img/watch/straps.webp" alt="" />
            <img ref={set('case')} className="layer layer--frame" src="/img/watch/case.webp" alt="" />
            <div ref={set('dial')} className="layer layer--dial" style={circleStyle(geo.dialR * 1.04, dialShift)}>
              <img src="/img/watch/dial.webp" alt="" />
              {DIAL.subdials.map((s) => (
                <div key={s.key} className="subhand" style={{ left: `${s.x * 100}%`, top: `${(s.y - DIAL.subHandLen) * 100}%`, height: `${DIAL.subHandLen * 100}%` }}>
                  <div ref={(el) => { subRefs.current[s.key] = el }} className="subhand__needle" />
                </div>
              ))}
            </div>
            <img ref={set('hour')} className="layer layer--hand" src="/img/watch/hand.webp" alt="" style={handStyle(geo.dialR * 0.58)} />
            <img ref={set('minute')} className="layer layer--hand" src="/img/watch/hand.webp" alt="" style={handStyle(geo.dialR * 0.9)} />
            <div ref={set('chrono')} className="layer layer--chrono" style={chronoStyle()} />
            <img ref={set('bezel')} className="layer layer--frame" src="/img/watch/bezel.webp" alt="" />
            <div ref={set('crystal')} className="layer layer--crystal" style={circleStyle(geo.dialR * 1.02)} />
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Maison d'horlogerie · Vallée de Joux · 1891</p>
          <h1 className="hero-copy__title">
            The quiet art of <em>measuring</em> a life.
          </h1>
          <p className="hero-copy__lede">Squelette Titane 42 — flyback chronograph, Calibre A-42, open-worked by hand.</p>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll to disassemble</span>
          <i />
        </div>

        <ol className="chapters">
          {CHAPTERS.map((c, i) => (
            <li key={c.numeral} ref={(el) => { chaptersRef.current[i] = el }} className="chapter">
              <span className="chapter__numeral">{c.numeral}</span>
              <h2 className="chapter__title">{c.title}</h2>
              <p className="chapter__body">{c.body}</p>
              <p className="chapter__spec">{c.spec}</p>
            </li>
          ))}
        </ol>

        <div className="parts-counter" aria-hidden="true">
          <span ref={counterRef}>000</span>
          <small>/ {PARTS} components</small>
        </div>

        <div className="final-line">
          <p className="eyebrow">Reassembled</p>
          <p className="final-line__text">{PARTS} parts. One heartbeat.</p>
        </div>

        <div className="rail" aria-hidden="true"><i /></div>
      </div>
    </section>
  )
}
