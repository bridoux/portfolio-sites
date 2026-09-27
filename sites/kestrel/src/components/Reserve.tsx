import { useState, type FormEvent } from 'react'
import { MISSIONS, type MissionId } from './Sections'

/** Seats already taken on the next flight, per mission (fixed so the demo is repeatable). */
const TAKEN: Record<MissionId, number[]> = { hop: [1, 4], weekend: [2], lunar: [] }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Props { mission: MissionId; onMission: (id: MissionId) => void }

export function Reserve({ mission, onMission }: Props) {
  const [seat, setSeat] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [code, setCode] = useState<string | null>(null)

  const m = MISSIONS.find((x) => x.id === mission) ?? MISSIONS[0]
  const deposit = m.price * 0.1

  const pickMission = (id: MissionId) => { onMission(id); setSeat(null) }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (seat === null) errs.seat = 'Choose a seat by the window.'
    if (name.trim().length < 2) errs.name = 'Your full name, as on your passport.'
    if (!EMAIL_RE.test(email.trim())) errs.email = 'We need a valid email for your flight dossier.'
    setErrors(errs)
    if (Object.keys(errs).length === 0) setCode(`K115-${m.id.slice(0, 2).toUpperCase()}${seat! + 1}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)
  }

  return (
    <section className="reserve" id="reserve">
      <div className="reserve__head">
        <p className="mono-tag" data-reveal>Reservation · Flight K-115</p>
        <h2 data-reveal>Claim your<br /><em>window.</em></h2>
        <p data-reveal>A fully refundable 10% deposit holds your seat until your medical clearance comes through.</p>
      </div>

      {code ? (
        <div className="boarding" role="status">
          <div className="boarding__row"><span>Passenger</span><strong>{name}</strong></div>
          <div className="boarding__row"><span>Mission</span><strong>{m.name}</strong></div>
          <div className="boarding__row"><span>Seat</span><strong>W{seat! + 1}</strong></div>
          <div className="boarding__row"><span>Reference</span><strong>{code}</strong></div>
          <p className="boarding__note">Your flight dossier is on its way to {email}. Welcome to the crew. (Portfolio demo: no charge was made.)</p>
          <button type="button" className="btn btn--line" onClick={() => { setCode(null); setSeat(null) }}>Book another seat</button>
        </div>
      ) : (
        <form className="reserve__form" onSubmit={submit} noValidate>
          <fieldset className="seg">
            <legend>Mission</legend>
            {MISSIONS.map((x) => (
              <label key={x.id} className={`seg__opt ${mission === x.id ? 'is-on' : ''}`}>
                <input type="radio" name="mission" checked={mission === x.id} onChange={() => pickMission(x.id)} />
                {x.name}
              </label>
            ))}
          </fieldset>

          <fieldset className="seatmap">
            <legend>Seat · top-down view of Heron</legend>
            <div className="seatmap__ring" style={{ ['--n' as string]: m.seats }}>
              <span className="seatmap__core">Heron</span>
              {Array.from({ length: m.seats }, (_, i) => {
                const taken = TAKEN[m.id].includes(i)
                const angle = (i / m.seats) * 360 - 90
                return (
                  <button
                    key={`${m.id}-${i}`}
                    type="button"
                    className={`seat ${seat === i ? 'is-on' : ''} ${taken ? 'is-taken' : ''}`}
                    style={{ transform: `rotate(${angle}deg) translate(var(--ring)) rotate(${-angle}deg)` }}
                    disabled={taken}
                    aria-pressed={seat === i}
                    aria-label={`Window seat W${i + 1}${taken ? ', taken' : ''}`}
                    onClick={() => setSeat(i)}
                  >
                    W{i + 1}
                  </button>
                )
              })}
            </div>
            {errors.seat && <p className="err" role="alert">{errors.seat}</p>}
          </fieldset>

          <div className="fields">
            <label className="fld">
              <span>Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
              {errors.name && <em className="err" role="alert">{errors.name}</em>}
            </label>
            <label className="fld">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
              {errors.email && <em className="err" role="alert">{errors.email}</em>}
            </label>
          </div>

          <div className="reserve__total">
            <div>
              <span>Deposit today</span>
              <strong>{deposit.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</strong>
            </div>
            <button type="submit" className="btn btn--orange">Hold my seat</button>
          </div>
        </form>
      )}
    </section>
  )
}
