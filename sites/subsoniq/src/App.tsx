import { useEffect, useRef } from 'react'
import { initReveals, initSmoothScroll } from './lib/motion'
import { Hero, Ticker } from './components/Hero'
import { Lineup } from './components/Lineup'
import { Timetable } from './components/Timetable'
import { Tickets } from './components/Tickets'
import { Footer, Rules, Venue } from './components/Venue'
import { ARTISTS } from './data'

function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="nav__logo">SBQ<span>07</span></a>
      <nav aria-label="Primary">
        <ul>
          <li><a href="#lineup">Lineup</a></li>
          <li><a href="#timetable">Timetable</a></li>
          <li><a href="#venue">Venue</a></li>
        </ul>
      </nav>
      <a href="#tickets" className="bx bx--lime bx--sm">Tickets</a>
    </header>
  )
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stopScroll = initSmoothScroll()
    const stopReveals = root.current ? initReveals(root.current) : () => {}
    return () => { stopReveals(); stopScroll() }
  }, [])

  return (
    <div ref={root} id="top">
      <div className="noise" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Ticker items={ARTISTS.slice(0, 10).map((a) => a.name.toUpperCase())} />
        <Lineup />
        <Timetable />
        <Ticker items={['Centrale Nord', 'Rotterdam', '23—25.07.2027', 'Edition 07', 'No sleep till Monday']} reverse />
        <Venue />
        <Rules />
        <Tickets />
      </main>
      <Footer />
    </div>
  )
}
