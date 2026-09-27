import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const COUNT = 140

interface Ember { x: number; y: number; r: number; speed: number; drift: number; phase: number; alpha: number }

/** Lightweight 2D canvas of glowing embers drifting upwards. */
export function Embers({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || prefersReducedMotion()) return
    let w = 0, h = 0, raf = 0, visible = true
    const dpr = Math.min(window.devicePixelRatio, 2)
    const embers: Ember[] = []
    const spawn = (anywhere: boolean): Ember => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.8 + Math.random() * 2.4,
      speed: 18 + Math.random() * 60,
      drift: 8 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.65,
    })
    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    for (let i = 0; i < COUNT; i++) embers.push(spawn(true))
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)

    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible) return
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        e.y -= e.speed * dt
        e.x += Math.sin(now / 900 + e.phase) * e.drift * dt
        if (e.y < -10) embers[i] = spawn(false)
        const flicker = 0.7 + 0.3 * Math.sin(now / 120 + e.phase * 3)
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4)
        g.addColorStop(0, `rgba(255, 236, 190, ${e.alpha * flicker})`)
        g.addColorStop(0.3, `rgba(255, 130, 40, ${e.alpha * 0.8 * flicker})`)
        g.addColorStop(1, 'rgba(255, 60, 0, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
