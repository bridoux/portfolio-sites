import { useState } from 'react'
import { CATEGORIES, MENU, type Category } from '../data/menu'

interface Props { onAdd: (id: string) => void }

export function Menu({ onAdd }: Props) {
  const [active, setActive] = useState<Category>('burgers')
  const [flash, setFlash] = useState<string | null>(null)
  const cat = CATEGORIES.find((c) => c.id === active) ?? CATEGORIES[0]
  const items = MENU.filter((m) => m.category === active)

  const handleAdd = (id: string) => {
    onAdd(id)
    setFlash(id)
    window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 900)
  }

  return (
    <section className="menu" id="menu">
      <div className="menu__visual">
        {CATEGORIES.map((c) => (
          <img key={c.id} src={c.image} alt="" aria-hidden="true" className={c.id === active ? 'is-on' : ''} loading="lazy" />
        ))}
        <p className="menu__blurb">{cat.blurb}</p>
      </div>
      <div className="menu__list">
        <p className="label" data-reveal>The menu</p>
        <h2 className="menu__title" data-reveal>Short menu.<br /><span>Zero shortcuts.</span></h2>
        <div className="tabs" role="tablist" aria-label="Menu categories" data-reveal>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={active === c.id}
              className={`tab ${active === c.id ? 'is-on' : ''}`}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <ul className="items" role="tabpanel" key={active}>
          {items.map((m, i) => (
            <li key={m.id} className="item" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="item__main">
                <h3>
                  {m.name}
                  {m.tags?.map((t) => <span key={t} className={`tag tag--${t.toLowerCase()}`}>{t}</span>)}
                </h3>
                <p>{m.description}</p>
              </div>
              <div className="item__side">
                <span className="item__price">${m.price}</span>
                <button type="button" className={`add ${flash === m.id ? 'is-added' : ''}`} onClick={() => handleAdd(m.id)} aria-label={`Add ${m.name} to bag`}>
                  {flash === m.id ? '✓' : '+'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
