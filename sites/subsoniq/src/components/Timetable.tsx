import { useEffect, useState } from 'react'
import { DAYS, SETS, STAGES, type Day } from '../data'

const HOURS = 12
const STORE_KEY = 'subsoniq:starred'

function readStarred(): string[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

const clock = (h: number) => {
  const total = (18 + h) % 24
  const hh = Math.floor(total)
  const mm = Math.round((total - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function Timetable() {
  const [day, setDay] = useState<Day>('fri')
  const [starred, setStarred] = useState<string[]>(readStarred)
  const [mineOnly, setMineOnly] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(starred)) } catch { /* storage unavailable: stars live for this visit only */ }
  }, [starred])

  const toggle = (id: string) => setStarred((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const sets = SETS.filter((s) => s.day === day && (!mineOnly || starred.includes(s.id)))

  return (
    <section className="tt" id="timetable">
      <header className="tt__head">
        <h2 className="h-mega">Timetable</h2>
        <div className="tt__controls">
          <div className="filters" role="tablist" aria-label="Day">
            {DAYS.map((d) => (
              <button key={d.id} role="tab" type="button" aria-selected={day === d.id} className={`filter ${day === d.id ? 'is-on' : ''}`} onClick={() => setDay(d.id)}>
                {d.label} {d.date}
              </button>
            ))}
          </div>
          <button type="button" className={`filter filter--star ${mineOnly ? 'is-on' : ''}`} onClick={() => setMineOnly((v) => !v)} aria-pressed={mineOnly}>
            ★ My plan ({starred.length})
          </button>
        </div>
      </header>

      <div className="tt__scroll">
        <div className="tt__grid" style={{ ['--hours' as string]: HOURS }}>
          <div className="tt__corner" />
          {Array.from({ length: HOURS }, (_, h) => <div key={h} className="tt__hour" style={{ gridColumn: h * 2 + 2 + ' / span 2' }}>{clock(h)}</div>)}
          {STAGES.map((st, row) => (
            <div key={st.name} className="tt__row" style={{ gridRow: row + 2 }}>
              <div className="tt__stage">{st.name}</div>
            </div>
          ))}
          {sets.map((s) => {
            const row = STAGES.findIndex((st) => st.name === s.stage) + 2
            const on = starred.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                className={`slot ${on ? 'is-on' : ''}`}
                style={{ gridRow: row, gridColumn: `${Math.round(s.start * 2) + 2} / ${Math.round(s.end * 2) + 2}` }}
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                aria-label={`${s.artist}, ${s.stage}, ${clock(s.start)} to ${clock(s.end)}${on ? ', in your plan' : ''}`}
              >
                <span className="slot__time">{clock(s.start)}–{clock(s.end)}</span>
                <span className="slot__name">{s.artist}</span>
                <span className="slot__star" aria-hidden="true">{on ? '★' : '☆'}</span>
              </button>
            )
          })}
        </div>
      </div>
      <p className="tt__note">Tap a set to add it to your plan. It's saved in this browser.</p>
    </section>
  )
}
