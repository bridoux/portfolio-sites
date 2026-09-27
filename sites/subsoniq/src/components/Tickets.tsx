import { useMemo, useState } from 'react'
import { TICKETS, type TicketId } from '../data'

const MAX = 6
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const eur = (n: number) => `€${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`

/** Deterministic pseudo-QR from a string, so the "ticket" is unique per order. */
function QrPattern({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 2166136261
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
    const out: boolean[] = []
    for (let i = 0; i < 21 * 21; i++) {
      h = Math.imul(h ^ (h >>> 13), 0x5bd1e995)
      out.push(((h >>> 7) & 1) === 1)
    }
    return out
  }, [seed])
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
  return (
    <svg viewBox="0 0 21 21" className="qr" aria-hidden="true" shapeRendering="crispEdges">
      {cells.map((on, i) => {
        const x = i % 21
        const y = Math.floor(i / 21)
        if (finder(x, y)) return null
        return on ? <rect key={i} x={x} y={y} width="1" height="1" /> : null
      })}
      {[[0, 0], [14, 0], [0, 14]].map(([x, y]) => (
        <g key={`${x}-${y}`}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>
      ))}
    </svg>
  )
}

export function Tickets() {
  const [qty, setQty] = useState<Record<TicketId, number>>({ day: 0, weekend: 2, bunker: 0 })
  const [email, setEmail] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [order, setOrder] = useState<string | null>(null)

  const count = Object.values(qty).reduce((a, b) => a + b, 0)
  const total = TICKETS.reduce((sum, t) => sum + t.price * qty[t.id], 0)
  const fee = count * 4.5
  const bump = (id: TicketId, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(MAX, q[id] + d)) }))

  const checkout = () => {
    if (count === 0) return setErr('Add at least one ticket.')
    if (!EMAIL_RE.test(email.trim())) return setErr('Enter the email your tickets should go to.')
    setErr(null)
    setOrder(`SBQ07-${Date.now().toString(36).toUpperCase().slice(-6)}`)
  }

  return (
    <section className="tix" id="tickets">
      <h2 className="h-mega">Tickets</h2>
      {order ? (
        <div className="ticket" role="status">
          <div className="ticket__main">
            <p className="ticket__brand">SUBSONIQ 07</p>
            <p className="ticket__big">{count} × admit</p>
            <p>{TICKETS.filter((t) => qty[t.id] > 0).map((t) => `${qty[t.id]}× ${t.name}`).join(' · ')}</p>
            <p>Centrale Nord · 23—25.07.2027</p>
            <p className="ticket__ref">{order}</p>
            <button type="button" className="bx" onClick={() => setOrder(null)}>Buy more</button>
          </div>
          <div className="ticket__stub">
            <QrPattern seed={order} />
            <p>Sent to {email}. Demo only, no payment taken.</p>
          </div>
        </div>
      ) : (
        <div className="tix__wrap">
          <ul className="tiers">
            {TICKETS.map((t) => {
              const soldOut = t.sold >= 0.99
              return (
                <li key={t.id} className={`tier ${qty[t.id] > 0 ? 'is-on' : ''}`}>
                  <div className="tier__info">
                    <h3>{t.name}</h3>
                    <p>{t.note}</p>
                    <div className="meter" aria-label={`${Math.round(t.sold * 100)}% sold`}><i style={{ width: `${t.sold * 100}%` }} /><span>{Math.round(t.sold * 100)}% gone</span></div>
                  </div>
                  <div className="tier__buy">
                    <span className="tier__price">{eur(t.price)}</span>
                    <div className="step">
                      <button type="button" onClick={() => bump(t.id, -1)} disabled={qty[t.id] === 0} aria-label={`Remove ${t.name}`}>−</button>
                      <output>{qty[t.id]}</output>
                      <button type="button" onClick={() => bump(t.id, 1)} disabled={soldOut || qty[t.id] >= MAX} aria-label={`Add ${t.name}`}>+</button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <aside className="cart">
            <p className="cart__label">Your order</p>
            <dl>
              <div><dt>Tickets</dt><dd>{count}</dd></div>
              <div><dt>Service</dt><dd>{eur(fee)}</dd></div>
              <div className="cart__total"><dt>Total</dt><dd>{eur(total + fee)}</dd></div>
            </dl>
            <label className="cart__email">
              <span>Email for e-tickets</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="raver@example.com" autoComplete="email" />
            </label>
            {err && <p className="cart__err" role="alert">{err}</p>}
            <button type="button" className="bx bx--lime bx--block" onClick={checkout}>Checkout →</button>
          </aside>
        </div>
      )}
    </section>
  )
}
