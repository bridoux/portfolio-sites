import { useState } from 'react'
import { STAGES, type Stage } from '../data'

/** Brutalist schematic of the power station; stages highlight from the list and the map. */
const SHAPES: Record<Stage, { d: string; lx: number; ly: number }> = {
  'Turbine Hall': { d: 'M40 60 H300 V200 H40 Z', lx: 170, ly: 135 },
  'Cooling Tower': { d: 'M380 70 C 360 130, 360 170, 372 220 H468 C 480 170, 480 130, 460 70 Z', lx: 420, ly: 150 },
  Switchyard: { d: 'M40 240 H300 V340 H40 Z', lx: 170, ly: 295 },
  Bunker: { d: 'M340 270 H440 V340 H340 Z', lx: 390, ly: 310 },
}

export function Venue() {
  const [active, setActive] = useState<Stage>('Turbine Hall')
  return (
    <section className="venue" id="venue">
      <div className="venue__photo">
        <img src="/img/venue.webp" alt="Centrale Nord power station at dusk with festival-goers queuing" loading="lazy" />
        <span className="venue__tag">Centrale Nord · built 1968 · decommissioned 2015</span>
      </div>
      <div className="venue__info">
        <h2 className="h-big">The venue is a 1968 coal power station.</h2>
        <svg className="map" viewBox="0 0 500 380" role="img" aria-label="Site map of Centrale Nord">
          <rect x="10" y="20" width="480" height="345" className="map__site" />
          <path d="M310 130 H370" className="map__path" />
          <path d="M170 200 V240" className="map__path" />
          <path d="M300 300 H340" className="map__path" />
          {STAGES.map((s) => (
            <g key={s.name} className={`map__stage ${active === s.name ? 'is-on' : ''}`} onPointerEnter={() => setActive(s.name)}>
              <path d={SHAPES[s.name].d} />
              <text x={SHAPES[s.name].lx} y={SHAPES[s.name].ly} textAnchor="middle">{s.name.toUpperCase()}</text>
            </g>
          ))}
          <text x="20" y="14" className="map__legend">N ↑   ENTRANCE: MAASHAVEN GATE (SW)</text>
        </svg>
        <ul className="stages">
          {STAGES.map((s, i) => (
            <li key={s.name}>
              <button type="button" className={`stage ${active === s.name ? 'is-on' : ''}`} onClick={() => setActive(s.name)} onPointerEnter={() => setActive(s.name)}>
                <span className="stage__n">0{i + 1}</span>
                <span className="stage__name">{s.name}</span>
                <span className="stage__cap">{s.capacity}</span>
                <span className="stage__sound">{s.sound}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const RULES = [
  ['No phones in the Bunker', 'We put a sticker over your camera at the door. The dancefloor is for dancing.'],
  ['Free water, always', 'There are refill taps at every stage. Reusable cups carry a €2 deposit.'],
  ['Safer spaces', 'Awareness crew in lime vests all night. Find us at the Switchyard info point.'],
  ['Late metro', 'Line D runs until 07:00 all weekend. Rotterdam Zuid is a 6-minute walk away.'],
]

export function Rules() {
  return (
    <section className="rules" aria-label="House rules">
      {RULES.map(([t, d], i) => (
        <article key={t} className="rule">
          <span className="rule__n">{String(i + 1).padStart(2, '0')}</span>
          <h3>{t}</h3>
          <p>{d}</p>
        </article>
      ))}
    </section>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'bad' | 'ok'>('idle')
  return (
    <footer className="footer">
      <div className="footer__signup">
        <p className="h-big">First to know when Edition 08 drops.</p>
        {status === 'ok' ? (
          <p className="footer__ok" role="status">YOU'RE ON THE LIST ✶</p>
        ) : (
          <form className="footer__form" noValidate onSubmit={(e) => { e.preventDefault(); setStatus(EMAIL_RE.test(email.trim()) ? 'ok' : 'bad') }}>
            <label className="sr-only" htmlFor="nl">Email</label>
            <input id="nl" type="email" placeholder="YOUR@EMAIL" value={email} onChange={(e) => { setEmail(e.target.value); setStatus('idle') }} aria-invalid={status === 'bad'} />
            <button type="submit" className="bx bx--red">Sign up</button>
            {status === 'bad' && <p className="footer__bad" role="alert">THAT EMAIL LOOKS OFF</p>}
          </form>
        )}
      </div>
      <p className="footer__word" aria-hidden="true">SUBSONIQ</p>
      <div className="footer__row">
        <span>© 2027 Subsoniq Festival BV</span>
        <span>A fictional festival designed for a portfolio</span>
        <span>IG · RA · SoundCloud</span>
      </div>
    </footer>
  )
}
