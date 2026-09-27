import { useEffect, useState } from 'react'

export const MISSIONS = [
  { id: 'hop', name: 'Kármán Hop', duration: '11 minutes', altitude: '105 km', price: 225_000, seats: 6, blurb: 'Four minutes of weightlessness and the curve of the Earth, then home in time for lunch.', img: '/img/launch.webp' },
  { id: 'weekend', name: 'Orbital Weekend', duration: '3 days', altitude: '400 km', price: 1_450_000, seats: 4, blurb: 'Forty-eight orbits, three hundred sunrises, and a zero-g dinner cooked by our flight chef.', img: '/img/cabin.webp', featured: true },
  { id: 'lunar', name: 'Selene Flyby', duration: '6 days', altitude: '384,400 km', price: 8_900_000, seats: 2, blurb: 'Loop around the far side of the Moon, where no private citizen has been. The first flight departs in 2028.', img: '/img/earth.webp' },
] as const

export type MissionId = (typeof MISSIONS)[number]['id']

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function Missions({ onPick }: { onPick: (id: MissionId) => void }) {
  return (
    <section className="missions" id="missions">
      <header className="sec-head">
        <p className="mono-tag" data-reveal>Missions · 2026–2028 manifest</p>
        <h2 data-reveal>Pick how far<br />you want to go.</h2>
      </header>
      <div className="missions__grid">
        {MISSIONS.map((m, i) => (
          <article key={m.id} className={`mission ${'featured' in m && m.featured ? 'mission--featured' : ''}`} data-reveal data-delay={i * 0.1}>
            <div className="mission__img"><img src={m.img} alt="" loading="lazy" /></div>
            <div className="mission__body">
              <span className="mission__idx">0{i + 1}</span>
              <h3>{m.name}</h3>
              <p>{m.blurb}</p>
              <dl className="mission__specs">
                <div><dt>Duration</dt><dd>{m.duration}</dd></div>
                <div><dt>Apogee</dt><dd>{m.altitude}</dd></div>
                <div><dt>Crew</dt><dd>{m.seats} seats</dd></div>
              </dl>
              <div className="mission__foot">
                <span className="mission__price">{usd(m.price)}</span>
                <a href="#reserve" className="btn btn--line" onClick={() => onPick(m.id)}>Select</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const TRAINING = [
  { day: 'Day 1–2', title: 'Centrifuge', body: 'Learn to breathe through 4.5 g, and find out you can.' },
  { day: 'Day 3–4', title: 'Parabolic flights', body: 'Thirty rounds of weightlessness aboard our modified 727.' },
  { day: 'Day 5–7', title: 'Heron simulator', body: 'Suit-up drills, emergency egress and 3 a.m. alarm scenarios.' },
  { day: 'Day 8–9', title: 'Quarantine & launch', body: 'Rest, a medical check and a last dinner with your family on the beach.' },
]

export function Training() {
  return (
    <section className="training" id="training">
      <figure className="training__portrait" data-reveal>
        <img src="/img/crew.webp" alt="Kestrel civilian astronaut Amara Osei in her flight suit" loading="lazy" />
        <figcaption>Amara Osei, pediatric nurse, flight K-098</figcaption>
      </figure>
      <div className="training__copy">
        <p className="mono-tag" data-reveal>Nine days to astronaut</p>
        <h2 data-reveal>You don't need the right stuff. <em>We'll teach it to you.</em></h2>
        <ol className="timeline">
          {TRAINING.map((t, i) => (
            <li key={t.title} data-reveal data-delay={i * 0.08}>
              <span className="timeline__day">{t.day}</span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Aboard() {
  return (
    <section className="aboard" aria-label="Life aboard">
      <div className="aboard__text">
        <p className="mono-tag" data-reveal>Life aboard Heron</p>
        <p className="aboard__quote" data-reveal>“I cried at the window for twenty minutes. Then I spent another hour chasing a strawberry around the cabin.”</p>
        <p className="aboard__cite" data-reveal>Lena Park, architect, Orbital Weekend K-102</p>
      </div>
      <figure className="aboard__a" data-reveal><img src="/img/float.webp" alt="A passenger laughing in weightlessness beside a floating strawberry" loading="lazy" /></figure>
      <figure className="aboard__b" data-reveal data-delay={0.12}><img src="/img/earth.webp" alt="Earth's horizon at sunrise through the panorama window" loading="lazy" /></figure>
    </section>
  )
}

/** Next launch: the upcoming Thursday at 06:42 local time. */
function nextLaunch(now: Date): Date {
  const d = new Date(now)
  d.setHours(6, 42, 0, 0)
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7))
  if (d <= now) d.setDate(d.getDate() + 7)
  return d
}

export function Countdown() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const target = nextLaunch(now)
  const diff = Math.max(0, target.getTime() - now.getTime())
  const parts = [
    ['Days', Math.floor(diff / 86_400_000)],
    ['Hours', Math.floor(diff / 3_600_000) % 24],
    ['Min', Math.floor(diff / 60_000) % 60],
    ['Sec', Math.floor(diff / 1000) % 60],
  ] as const

  return (
    <section className="countdown" aria-label="Next launch countdown">
      <img className="countdown__bg" src="/img/pad.webp" alt="" loading="lazy" />
      <div className="countdown__inner">
        <p className="mono-tag">Next launch · K-115 · {target.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · 06:42</p>
        <div className="clock" role="timer" aria-live="off">
          {parts.map(([label, v]) => (
            <div key={label} className="clock__cell">
              <span className="clock__num">{String(v).padStart(2, '0')}</span>
              <span className="clock__label">{label}</span>
            </div>
          ))}
        </div>
        <p className="countdown__note">Watch every launch live from the Kestrel beach viewing deck. Entry is free.</p>
      </div>
    </section>
  )
}

const FAQ = [
  ['Is it safe?', 'Heron has flown 114 crewed missions with a perfect safety record. Every system has at least two backups, and the launch escape system can pull the capsule clear of the rocket at any point in the flight.'],
  ['Do I need to be super fit?', 'No. If you can climb three flights of stairs and pass a standard aviation medical, you can fly. Our oldest flyer was 82.'],
  ['What happens if my flight is scrubbed?', 'Weather scrubs are common, and your seat simply moves to the next window. Your crew quarters and meals are covered for as long as it takes.'],
  ['Can I bring anything with me?', 'Yes, up to 1.5 kg of personal items, stowed in your locker beside the panorama window. Instruments, letters and seeds have all flown before.'],
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="faq" id="faq">
      <h2 className="faq__title" data-reveal>Questions<br />from the ground</h2>
      <ul className="faq__list">
        {FAQ.map(([q, a], i) => (
          <li key={q} className={`faq__item ${open === i ? 'is-open' : ''}`}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span>{q}</span><i aria-hidden="true" />
            </button>
            <div className="faq__a"><p>{a}</p></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__big" aria-hidden="true">KESTREL<span>ORBITAL</span></div>
      <div className="footer__row">
        <p>Launch Complex 7 · Boca Chica, Texas</p>
        <p>© 2026 Kestrel Orbital Inc. A fictional company designed for a portfolio.</p>
      </div>
    </footer>
  )
}
