import { useEffect, useRef } from 'react'
import { initReveals, initSmoothScroll } from './lib/motion'
import { Hero } from './components/Hero'
import { Seasons } from './components/Seasons'
import { Ceremony } from './components/Ceremony'
import { Collection, Cursor, Fields, Footer, Philosophy, Potter } from './components/Sections'

function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="nav__logo" aria-label="Tōgen home"><span lang="ja">桃源</span> Tōgen</a>
      <nav aria-label="Primary">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#teas">Teas</a></li>
          <li><a href="#clay">Clay</a></li>
          <li><a href="#ceremony">Ceremony</a></li>
        </ul>
      </nav>
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
      <div className="washi" aria-hidden="true" />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Philosophy />
        <Seasons />
        <Collection />
        <Potter />
        <Fields />
        <Ceremony />
      </main>
      <Footer />
    </div>
  )
}
