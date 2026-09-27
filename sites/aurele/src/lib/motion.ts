import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}
  const lenis = new Lenis({ lerp: 0.085, anchors: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
  }
}

/**
 * Fade/rise any element marked with data-reveal as it enters the viewport.
 * IntersectionObserver (not ScrollTrigger) so late-loading images can't leave stale trigger positions.
 * Elements jumped over entirely (anchor links, fast flings) are shown instantly by a scroll check.
 */
export function initReveals(root: HTMLElement): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (prefersReducedMotion()) return () => {}
  const pending = new Set(els)
  gsap.set(els, { y: 48, autoAlpha: 0 })

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const el = e.target as HTMLElement
      if (!e.isIntersecting || !pending.has(el)) return
      pending.delete(el)
      io.unobserve(el)
      gsap.to(el, { y: 0, autoAlpha: 1, duration: 1.2, delay: Number(el.dataset.delay ?? 0), ease: 'expo.out' })
    })
  }, { rootMargin: '0px 0px -8% 0px' })
  els.forEach((el) => io.observe(el))

  let queued = false
  const sweep = () => {
    queued = false
    pending.forEach((el) => {
      if (el.getBoundingClientRect().bottom < 0) {
        pending.delete(el)
        io.unobserve(el)
        gsap.set(el, { y: 0, autoAlpha: 1 })
      }
    })
  }
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(sweep) } }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Keep scroll-linked triggers accurate as images decode and fonts land.
  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh)
  document.fonts?.ready.then(refresh)
  return () => {
    io.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('load', refresh)
    gsap.set(els, { clearProps: 'all' })
  }
}
