import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <a href="#top" className="nav__brand" aria-label="Aurèle Horlogerie, home">
        <span className="nav__mark">Aurèle</span>
        <span className="nav__sub">Horlogerie</span>
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          <li><a href="#calibre">Calibre</a></li>
          <li><a href="#collection">Collection</a></li>
          <li><a href="#atelier">Atelier</a></li>
        </ul>
      </nav>
      <a href="#visite" className="btn btn--ghost">Private viewing</a>
    </header>
  )
}

const BOUTIQUES = ['Genève — Rue du Rhône', 'Paris — Place Vendôme', 'Tokyo — Ginza', 'New York — Madison Avenue']
const PIECES = ['Nocturne 38', 'Squelette Titane 42', 'Lune Émail 40', 'Not sure yet']

interface FormState { name: string; email: string; boutique: string; piece: string; date: string }
type Errors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please tell us your name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'A valid email address, please.'
  if (!f.boutique) e.boutique = 'Choose a boutique.'
  if (!f.date) e.date = 'Choose a preferred date.'
  else if (new Date(f.date) < new Date(new Date().toDateString())) e.date = 'That date has already passed.'
  return e
}

export function Viewing() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', boutique: '', piece: PIECES[0], date: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length === 0) setSent(true)
  }

  return (
    <section className="viewing" id="visite">
      <div className="viewing__intro">
        <p className="eyebrow" data-reveal><span className="idx">04</span>Visite privée</p>
        <h2 data-reveal>Spend an hour <em>with the watch</em> before you decide.</h2>
        <p data-reveal>
          Our boutiques receive by appointment only. A watchmaker will open a movement at the bench and let you look through the loupe. Coffee is served.
        </p>
      </div>
      {sent ? (
        <div className="viewing__done" role="status">
          <p className="eyebrow">Merci, {form.name.split(' ')[0]}</p>
          <p className="viewing__done-text">Your request for {form.boutique.split(' — ')[0]} is with our concierge. You'll receive a confirmation at {form.email} within one business day.</p>
        </div>
      ) : (
        <form className="viewing__form" onSubmit={submit} noValidate data-reveal>
          <Field label="Full name" error={errors.name}>
            <input value={form.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Boutique" error={errors.boutique}>
            <select value={form.boutique} onChange={(e) => set('boutique')(e.target.value)}>
              <option value="">Select…</option>
              {BOUTIQUES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Preferred date" error={errors.date}>
            <input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} />
          </Field>
          <fieldset className="pieces">
            <legend>I'd like to see</legend>
            {PIECES.map((p) => (
              <label key={p} className={`chip ${form.piece === p ? 'is-on' : ''}`}>
                <input type="radio" name="piece" value={p} checked={form.piece === p} onChange={() => set('piece')(p)} />
                {p}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="btn btn--gold">Request an appointment</button>
        </form>
      )}
    </section>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error" role="alert">{error}</span>}
    </label>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__word" aria-hidden="true">Aurèle</div>
      <div className="footer__cols">
        <div>
          <h4>Manufacture</h4>
          <p>Route de l'Orbe 14<br />1347 Le Sentier<br />Vallée de Joux, Suisse</p>
        </div>
        <div>
          <h4>Boutiques</h4>
          <p>Genève · Paris · Tokyo · New York</p>
        </div>
        <div>
          <h4>Correspondence</h4>
          <p>Letters from the atelier, four times a year.</p>
          <a className="link-arrow" href="#visite">Subscribe <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <p className="footer__legal">© 2026 Aurèle Horlogerie SA. A fictional maison created for a design portfolio.</p>
    </footer>
  )
}
