import { useEffect, useRef, useState, type Dispatch } from 'react'
import { LOCATIONS } from '../data/menu'
import { cartCount, cartSubtotal, fmtHour, isOpen, money, type CartAction, type CartState } from '../lib/cart'

export function Nav({ count, onOpenCart }: { count: number; onOpenCart: () => void }) {
  const [bump, setBump] = useState(false)
  const prev = useRef(count)
  useEffect(() => {
    if (count > prev.current) {
      setBump(true)
      const id = window.setTimeout(() => setBump(false), 450)
      prev.current = count
      return () => window.clearTimeout(id)
    }
    prev.current = count
  }, [count])

  return (
    <header className="nav">
      <a href="#top" className="logo" aria-label="Ember & Stack home">
        <span className="logo__flame" aria-hidden="true">✺</span>Ember<span className="logo__amp">&amp;</span>Stack
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          <li><a href="#menu">Menu</a></li>
          <li><a href="#smash">The Smash</a></li>
          <li><a href="#find">Locations</a></li>
          <li><a href="#club">Ember Club</a></li>
        </ul>
      </nav>
      <button type="button" className={`bag ${bump ? 'is-bump' : ''}`} onClick={onOpenCart} aria-label={`Open bag, ${count} items`}>
        Bag <span className="bag__count">{count}</span>
      </button>
    </header>
  )
}

export function Marquee() {
  const words = ['Smashed to order', 'No freezers. Ever.', 'Beef-tallow fries', 'Open til 2AM Fri–Sat', 'Dry-aged 21 days', 'Ember sauce on everything']
  const row = [...words, ...words]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((w, i) => <span key={i}>{w}<b>✺</b></span>)}
      </div>
    </div>
  )
}

interface CartProps { open: boolean; cart: CartState; dispatch: Dispatch<CartAction>; onClose: () => void }

export function CartDrawer({ open, cart, dispatch, onClose }: CartProps) {
  const [placed, setPlaced] = useState<string | null>(null)
  const [pickup, setPickup] = useState(LOCATIONS[0].name)
  const subtotal = cartSubtotal(cart)
  const tax = subtotal * 0.0825

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const checkout = () => {
    const order = `ES-${Math.floor(1000 + Math.random() * 9000)}`
    setPlaced(order)
    dispatch({ type: 'clear' })
  }

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your bag">
        <header className="drawer__head">
          <h2>Your bag <span>{cartCount(cart)}</span></h2>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close bag">✕</button>
        </header>
        {placed ? (
          <div className="drawer__empty">
            <p className="drawer__big">Order {placed} is on the griddle.</p>
            <p>Pickup at {pickup} in about 12 minutes. We'll text you when it's wrapped. (This is a demo, so nobody is actually cooking.)</p>
            <button type="button" className="btn btn--fire" onClick={() => { setPlaced(null); onClose() }}>Back to the menu</button>
          </div>
        ) : cart.length === 0 ? (
          <div className="drawer__empty">
            <p className="drawer__big">Your bag is empty.</p>
            <p>The griddle is hot, though.</p>
            <a href="#menu" className="btn btn--fire" onClick={onClose}>Browse the menu</a>
          </div>
        ) : (
          <>
            <ul className="lines">
              {cart.map((l) => (
                <li key={l.item.id} className="line">
                  <div>
                    <p className="line__name">{l.item.name}</p>
                    <p className="line__price">{money(l.item.price * l.qty)}</p>
                  </div>
                  <div className="qty">
                    <button type="button" onClick={() => dispatch({ type: 'decrement', id: l.item.id })} aria-label={`Remove one ${l.item.name}`}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" onClick={() => dispatch({ type: 'add', id: l.item.id })} aria-label={`Add one ${l.item.name}`}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <label className="pickup">
              <span>Pickup at</span>
              <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                {LOCATIONS.map((loc) => <option key={loc.name}>{loc.name}</option>)}
              </select>
            </label>
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              <div><dt>Tax</dt><dd>{money(tax)}</dd></div>
              <div className="totals__grand"><dt>Total</dt><dd>{money(subtotal + tax)}</dd></div>
            </dl>
            <button type="button" className="btn btn--fire btn--block" onClick={checkout}>Place pickup order</button>
          </>
        )}
      </aside>
    </div>
  )
}

export function Locations() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  const day = (now.getDay() + 6) % 7

  return (
    <section className="find" id="find">
      <div className="find__head">
        <p className="label" data-reveal>Find a griddle</p>
        <h2 data-reveal>Three griddles.<br />One city.</h2>
      </div>
      <ul className="find__list">
        {LOCATIONS.map((loc, i) => {
          const open = isOpen(loc.hours, now)
          const [o, c] = loc.hours[day]
          return (
            <li key={loc.name} className="loc" data-reveal data-delay={i * 0.1}>
              <span className={`status ${open ? 'is-open' : ''}`}>{open ? 'Open now' : 'Closed'}</span>
              <h3>{loc.name}</h3>
              <p>{loc.address}</p>
              <p className="loc__hours">Today {fmtHour(o)} – {fmtHour(c)}</p>
              <a className="loc__link" href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`} target="_blank" rel="noopener noreferrer">Directions ↗</a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Club() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle')
  return (
    <section className="club" id="club">
      <div className="club__inner">
        <p className="label">Ember Club</p>
        <h2>Your 10th burger is on us.<br /><span>So is your birthday one.</span></h2>
        {state === 'done' ? (
          <p className="club__done" role="status">You're in. Check your inbox for a free order of Tallow Fries. 🔥</p>
        ) : (
          <form className="club__form" noValidate onSubmit={(e) => { e.preventDefault(); setState(EMAIL_RE.test(email.trim()) ? 'done' : 'error') }}>
            <label className="sr-only" htmlFor="club-email">Email</label>
            <input id="club-email" type="email" placeholder="you@hungry.com" value={email} onChange={(e) => { setEmail(e.target.value); setState('idle') }} aria-invalid={state === 'error'} />
            <button type="submit" className="btn btn--dark">Join the club</button>
            {state === 'error' && <p className="club__error" role="alert">That email doesn't look right.</p>}
          </form>
        )}
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__giant" aria-hidden="true">Ember&amp;Stack</p>
      <div className="footer__row">
        <p>© 2026 Ember &amp; Stack Burger Co. A fictional restaurant made for a design portfolio.</p>
        <p>Instagram · TikTok · Careers · Allergens</p>
      </div>
    </footer>
  )
}
