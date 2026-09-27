import { useMemo, useState, type FormEvent } from 'react'

const SESSIONS = [
  { id: 'dawn', time: '07:30', name: 'Asa-cha', jp: '朝茶', desc: 'Dawn ceremony in the garden room', price: 12000 },
  { id: 'noon', time: '11:00', name: 'Hiru', jp: '昼', desc: 'Usucha with seasonal wagashi', price: 8500 },
  { id: 'dusk', time: '16:00', name: 'Yūzari', jp: '夕ざり', desc: 'Koicha by lantern light, kaiseki sweets', price: 16000 },
]
const MAX_GUESTS = 5
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Next 14 days, excluding Wednesdays (the house is closed). */
function upcomingDays(): Date[] {
  const days: Date[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (days.length < 12) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 3) days.push(new Date(d))
  }
  return days
}

/** Deterministic "fully booked" slots so the calendar looks lived-in. */
const isFull = (day: Date, session: string) => (day.getDate() * 7 + session.length * 3) % 5 === 0

export function Ceremony() {
  const days = useMemo(upcomingDays, [])
  const [day, setDay] = useState(0)
  const [session, setSession] = useState<string | null>(null)
  const [guests, setGuests] = useState(2)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const s = SESSIONS.find((x) => x.id === session)
  const chosen = days[day]
  const total = s ? s.price * guests : 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!s) return setError('Please choose a session.')
    if (!EMAIL_RE.test(email.trim())) return setError('We need an email to send your invitation.')
    setError(null)
    setDone(true)
  }

  return (
    <section className="ceremony" id="ceremony">
      <div className="ceremony__intro">
        <p className="kicker" data-reveal>茶会 · Tea ceremony</p>
        <h2 data-reveal>Sit with us<br />for <em>one bowl.</em></h2>
        <p data-reveal>Ceremonies are for up to five guests and last about ninety minutes. Wear socks you like, because shoes stay at the door.</p>
      </div>

      {done && s ? (
        <div className="invite" role="status">
          <p className="invite__jp" lang="ja">ご招待</p>
          <p className="invite__main">{s.name} · {chosen.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {s.time}</p>
          <p>Your invitation for {guests} {guests === 1 ? 'guest' : 'guests'} has been sent to {email}. Please arrive ten minutes early to walk the garden path.</p>
          <p className="invite__note">A portfolio demo, so no booking was actually made.</p>
          <button type="button" className="ink-link" onClick={() => { setDone(false); setSession(null) }}>Choose another time</button>
        </div>
      ) : (
        <form className="booking" onSubmit={submit} noValidate>
          <fieldset>
            <legend>Day</legend>
            <div className="days" role="radiogroup">
              {days.map((d, i) => (
                <button key={d.toISOString()} type="button" role="radio" aria-checked={day === i} className={`day ${day === i ? 'is-on' : ''}`} onClick={() => { setDay(i); setSession(null) }}>
                  <span>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                  <strong>{d.getDate()}</strong>
                  <span>{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Session</legend>
            <div className="sessions">
              {SESSIONS.map((x) => {
                const full = isFull(chosen, x.id)
                return (
                  <button key={x.id} type="button" disabled={full} className={`session ${session === x.id ? 'is-on' : ''}`} onClick={() => setSession(x.id)} aria-pressed={session === x.id}>
                    <span className="session__time">{x.time}</span>
                    <span className="session__name">{x.name} <span lang="ja">{x.jp}</span></span>
                    <span className="session__desc">{full ? 'Fully seated' : x.desc}</span>
                    <span className="session__price">¥{x.price.toLocaleString('ja-JP')}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="booking__row">
            <div className="stepper" role="group" aria-label="Guests">
              <span>Guests</span>
              <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Fewer guests" disabled={guests <= 1}>−</button>
              <output aria-live="polite">{guests}</output>
              <button type="button" onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))} aria-label="More guests" disabled={guests >= MAX_GUESTS}>+</button>
            </div>
            <label className="email">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.jp" />
            </label>
          </div>
          {error && <p className="booking__error" role="alert">{error}</p>}
          <div className="booking__foot">
            <p>{s ? <>Total <strong>¥{total.toLocaleString('ja-JP')}</strong></> : 'Choose a session'}</p>
            <button type="submit" className="btn-ink">Request invitation</button>
          </div>
        </form>
      )}
    </section>
  )
}
