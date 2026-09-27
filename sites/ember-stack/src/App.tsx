import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { initReveals, initSmoothScroll } from './lib/motion'
import { cartCount, cartReducer } from './lib/cart'
import { BurgerScroller } from './components/BurgerScroller'
import { Menu } from './components/Menu'
import { Gallery, Smash } from './components/Smash'
import { CartDrawer, Club, Footer, Locations, Marquee, Nav } from './components/Chrome'

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const [cart, dispatch] = useReducer(cartReducer, [])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const stopScroll = initSmoothScroll()
    const stopReveals = root.current ? initReveals(root.current) : () => {}
    return () => { stopReveals(); stopScroll() }
  }, [])

  const add = useCallback((id: string) => dispatch({ type: 'add', id }), [])
  const close = useCallback(() => setCartOpen(false), [])

  return (
    <div ref={root} id="top">
      <Nav count={cartCount(cart)} onOpenCart={() => setCartOpen(true)} />
      <main>
        <BurgerScroller onOrder={() => { add('ember-double'); setCartOpen(true) }} />
        <Marquee />
        <Menu onAdd={add} />
        <Smash />
        <Gallery />
        <Locations />
        <Club />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} cart={cart} dispatch={dispatch} onClose={close} />
    </div>
  )
}
