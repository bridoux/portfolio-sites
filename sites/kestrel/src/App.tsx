import { useEffect, useRef, useState } from 'react'
import { initReveals, initSmoothScroll } from './lib/motion'
import { LaunchScroller } from './components/LaunchScroller'
import { Aboard, Countdown, Faq, Footer, Missions, Training, type MissionId } from './components/Sections'
import { Reserve } from './components/Reserve'

function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <a href="#top" className="brand" aria-label="Kestrel Orbital home">
        <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 26 L20 8 L32 26 L20 20 Z" fill="#ff6b2c" /></svg>
        <span>Kestrel<small>Orbital</small></span>
      </a>
      <nav aria-label="Primary">
        <ul>
          <li><a href="#flight">Flight</a></li>
          <li><a href="#missions">Missions</a></li>
          <li><a href="#training">Training</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </nav>
      <a href="#reserve" className="btn btn--orange btn--sm">Reserve</a>
    </header>
  )
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const [mission, setMission] = useState<MissionId>('weekend')

  useEffect(() => {
    const stopScroll = initSmoothScroll()
    const stopReveals = root.current ? initReveals(root.current) : () => {}
    return () => { stopReveals(); stopScroll() }
  }, [])

  return (
    <div ref={root} id="top">
      <Nav />
      <main>
        <LaunchScroller />
        <Missions onPick={setMission} />
        <Aboard />
        <Training />
        <Countdown />
        <Reserve mission={mission} onMission={setMission} />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
