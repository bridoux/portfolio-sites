import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/motion'
import { altitude, createLaunchScene } from '../three/launchScene'

interface Chapter { range: [number, number]; code: string; title: string; body: string }

const CHAPTERS: Chapter[] = [
  { range: [0.06, 0.22], code: 'T+00:00:08', title: 'Liftoff', body: 'Nine methalox engines, 7.6 meganewtons of thrust. You feel it in your chest before you hear it.' },
  { range: [0.25, 0.35], code: 'T+00:02:34', title: 'Stage separation', body: 'The booster lets go and turns back for a propulsive landing on the pad it left. It will fly again next Thursday.' },
  { range: [0.35, 0.45], code: 'T+00:03:10', title: 'Fairing jettison', body: 'Above the atmosphere there is nothing left to push against, so the nose splits open. The first thing you see is sunlight.' },
  { range: [0.52, 0.6], code: 'HERON · 01', title: 'Panorama deck', body: 'A continuous 360° window, 1.2 m tall. It is the largest single piece of glass ever flown, and your seat faces it.' },
  { range: [0.6, 0.67], code: 'HERON · 02', title: 'PICA-X heat shield', body: 'Ablative tiles that turn 1,600°C of re-entry into a glowing orange sky outside your window.' },
  { range: [0.67, 0.74], code: 'HERON · 03', title: 'Service trunk', body: 'Roll-out solar wings and 96 hours of life support, with triple redundancy on everything that keeps you breathing.' },
  { range: [0.84, 1.01], code: 'ORBIT · 400 KM', title: 'Sixteen sunrises a day', body: 'You are moving at 27,600 km/h and every 92 minutes you go around the planet. Take your time at the window.' },
]

export function LaunchScroller() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chapterRefs = useRef<(HTMLElement | null)[]>([])
  const hud = useRef<{ t: HTMLElement | null; alt: HTMLElement | null; vel: HTMLElement | null }>({ t: null, alt: null, vel: null })

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    let scene: ReturnType<typeof createLaunchScene> | null = null
    try {
      scene = createLaunchScene(canvas)
    } catch (err) {
      console.error('WebGL scene failed to start', err)
      section.classList.add('is-fallback')
      return
    }

    const update = (p: number) => {
      scene?.setProgress(p)
      section.style.setProperty('--p', p.toFixed(4))
      CHAPTERS.forEach((c, i) => chapterRefs.current[i]?.classList.toggle('is-active', p >= c.range[0] && p < c.range[1]))
      // Telemetry mapped from the scene's altitude curve to real-world-ish numbers
      const km = Math.min(400, (altitude(p) / 70) * 400)
      const seconds = Math.max(0, (p - 0.04) / 0.96) * 540
      const vel = Math.min(27600, Math.pow(Math.max(0, (p - 0.04) / 0.6), 1.3) * 27600)
      const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
      const ss = String(Math.floor(seconds % 60)).padStart(2, '0')
      if (hud.current.t) hud.current.t.textContent = p < 0.04 ? 'T−00:00:10' : `T+00:${mm}:${ss}`
      if (hud.current.alt) hud.current.alt.textContent = km.toFixed(1)
      if (hud.current.vel) hud.current.vel.textContent = Math.round(vel).toLocaleString('en-US')
    }
    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', onUpdate: (s) => update(s.progress) })
    update(0)
    return () => { st.kill(); scene?.dispose() }
  }, [])

  return (
    <section ref={sectionRef} className="launch" id="flight" aria-label="A Kestrel flight, from pad to orbit">
      <div className="launch__sticky">
        <div className="sky sky--dusk" aria-hidden="true" />
        <div className="sky sky--earth" aria-hidden="true" />
        <canvas ref={canvasRef} className="launch__canvas" />
        <img className="launch__fallback" src="/img/pad.webp" alt="A Kestrel rocket on the pad at blue hour" />

        <div className="intro">
          <p className="mono-tag"><span className="blink" />Flight K-114 · Boca Chica · Go for launch</p>
          <h1 className="intro__title">Your window seat<br />to the <em>whole planet.</em></h1>
          <p className="intro__lede">Kestrel Orbital flies private citizens to low Earth orbit on fully reusable rockets. No test pilot's license needed, just nine days of training.</p>
          <div className="intro__cta">
            <a href="#reserve" className="btn btn--orange">Reserve a seat</a>
            <span className="intro__scroll">Scroll to launch ↓</span>
          </div>
        </div>

        <ol className="chapters">
          {CHAPTERS.map((c, i) => (
            <li key={c.title} className="chapter" ref={(el) => { chapterRefs.current[i] = el }}>
              <span className="chapter__code">{c.code}</span>
              <h2 className="chapter__title">{c.title}</h2>
              <p className="chapter__body">{c.body}</p>
            </li>
          ))}
        </ol>

        <dl className="hud" aria-hidden="true">
          <div><dt>Mission clock</dt><dd ref={(el) => { hud.current.t = el }}>T−00:00:10</dd></div>
          <div><dt>Altitude km</dt><dd ref={(el) => { hud.current.alt = el }}>0.0</dd></div>
          <div><dt>Velocity km/h</dt><dd ref={(el) => { hud.current.vel = el }}>0</dd></div>
        </dl>
        <div className="progress" aria-hidden="true">
          {['Pad', 'Max-Q', 'MECO', 'Fairing', 'Heron', 'Orbit'].map((l) => <span key={l}>{l}</span>)}
          <i />
        </div>
      </div>
    </section>
  )
}
