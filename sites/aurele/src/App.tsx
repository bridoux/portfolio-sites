import { useEffect, useRef } from 'react'
import { initReveals, initSmoothScroll } from './lib/motion'
import { WatchScroller } from './components/WatchScroller'
import { Atelier, Collection, Service, Valley } from './components/Sections'
import { Footer, Nav, Viewing } from './components/Chrome'
import { Ticker } from './components/Ticker'

export default function App() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stopScroll = initSmoothScroll()
    const stopReveals = root.current ? initReveals(root.current) : () => {}
    return () => { stopReveals(); stopScroll() }
  }, [])

  return (
    <div ref={root} id="top">
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <WatchScroller />
        <Collection />
        <Ticker />
        <Atelier />
        <Valley />
        <Service />
        <Viewing />
      </main>
      <Footer />
    </div>
  )
}
