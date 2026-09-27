import { useEffect, useRef, useState } from 'react'
import { ARTISTS, DAYS, type Day } from '../data'
import { gsap } from '../lib/motion'

/** Typographic poster lineup with a portrait that trails the cursor on hover. */
export function Lineup() {
  const [day, setDay] = useState<Day | 'all'>('all')
  const [hover, setHover] = useState<string | null>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const visible = ARTISTS.filter((a) => day === 'all' || a.day === day).sort((a, b) => a.tier - b.tier)
  const hovered = ARTISTS.find((a) => a.name === hover)

  useEffect(() => {
    const f = floatRef.current
    const list = listRef.current
    if (!f || !list || !window.matchMedia('(pointer: fine)').matches) return
    const xTo = gsap.quickTo(f, 'x', { duration: 0.6, ease: 'power3' })
    const yTo = gsap.quickTo(f, 'y', { duration: 0.6, ease: 'power3' })
    const rTo = gsap.quickTo(f, 'rotate', { duration: 0.8, ease: 'power3' })
    let lastX = 0
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 24)
      yTo(e.clientY - 140)
      rTo(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.8))
      lastX = e.clientX
    }
    list.addEventListener('pointermove', move)
    return () => list.removeEventListener('pointermove', move)
  }, [])

  return (
    <section className="lineup" id="lineup">
      <header className="lineup__head">
        <h2 className="h-mega">Lineup<sup>{visible.length}</sup></h2>
        <div className="filters" role="tablist" aria-label="Filter by day">
          {(['all', ...DAYS.map((d) => d.id)] as const).map((d) => (
            <button key={d} role="tab" type="button" aria-selected={day === d} className={`filter ${day === d ? 'is-on' : ''}`} onClick={() => setDay(d)}>
              {d === 'all' ? 'All days' : `${DAYS.find((x) => x.id === d)?.label} ${DAYS.find((x) => x.id === d)?.date}`}
            </button>
          ))}
        </div>
      </header>
      <div className="poster" ref={listRef} onPointerLeave={() => setHover(null)} key={day}>
        {visible.map((a, i) => (
          <span
            key={a.name}
            className={`act act--t${a.tier} ${hover && hover !== a.name ? 'is-dim' : ''}`}
            style={{ animationDelay: `${i * 25}ms` }}
            onPointerEnter={() => setHover(a.name)}
            tabIndex={0}
            onFocus={() => setHover(a.name)}
            onBlur={() => setHover(null)}
          >
            {a.name}
            <small>{a.day.toUpperCase()} · {a.from}</small>
          </span>
        ))}
        <span className="act act--more">+ 40 more tba</span>
      </div>
      <div className={`float ${hovered?.img ? 'is-on' : ''}`} ref={floatRef} aria-hidden="true">
        {hovered?.img && <img src={hovered.img} alt="" />}
        {hovered && <span>{hovered.name}</span>}
      </div>
    </section>
  )
}
