import * as THREE from 'three'

function canvas(w: number, h = w): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  return [c, ctx]
}

function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Rocket skin: off-white panels, seams, a black band and a vertical wordmark. */
export function hullTexture(opts: { band?: boolean; wordmark?: boolean; soot?: number }): { texture: THREE.CanvasTexture; redraw: () => void } {
  const [c, ctx] = canvas(1024, 2048)
  const draw = () => {
    ctx.fillStyle = '#efeae1'
    ctx.fillRect(0, 0, 1024, 2048)
    // panel seams
    ctx.strokeStyle = 'rgba(60,60,70,0.18)'
    ctx.lineWidth = 3
    for (let y = 128; y < 2048; y += 256) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke() }
    for (let x = 0; x < 1024; x += 256) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 2048); ctx.stroke() }
    // subtle rivet rows
    ctx.fillStyle = 'rgba(40,40,50,0.18)'
    for (let y = 128; y < 2048; y += 256) for (let x = 8; x < 1024; x += 24) { ctx.beginPath(); ctx.arc(x, y + 10, 2, 0, Math.PI * 2); ctx.fill() }
    if (opts.band) {
      ctx.fillStyle = '#111317'
      ctx.fillRect(0, 1780, 1024, 150)
      ctx.fillStyle = '#ff6b2c'
      ctx.fillRect(0, 1760, 1024, 16)
    }
    if (opts.wordmark) {
      ctx.save()
      ctx.translate(300, 1500)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = '#111317'
      ctx.font = '700 150px "Unbounded", "Arial Black", sans-serif'
      ctx.fillText('KESTREL', 0, 0)
      ctx.restore()
      ctx.fillStyle = '#ff6b2c'
      ctx.fillRect(640, 200, 120, 120)
      ctx.fillStyle = '#111317'
      ctx.font = '500 44px "IBM Plex Mono", monospace'
      ctx.fillText('K-1 · HERON', 560, 400)
    }
    if (opts.soot) {
      const g = ctx.createLinearGradient(0, 2048, 0, 2048 - 900 * opts.soot)
      g.addColorStop(0, 'rgba(30,24,20,0.85)')
      g.addColorStop(1, 'rgba(30,24,20,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 1024, 2048)
    }
  }
  draw()
  const texture = tex(c)
  return { texture, redraw: () => { draw(); texture.needsUpdate = true } }
}

/** Vertical flame gradient: white-hot at the nozzle to transparent orange. */
export function flameTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(64, 512)
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, 'rgba(255,90,20,0)')
  g.addColorStop(0.45, 'rgba(255,120,40,0.55)')
  g.addColorStop(0.8, 'rgba(255,210,140,0.95)')
  g.addColorStop(1, 'rgba(255,255,245,1)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 512)
  return tex(c)
}

export function softSprite(inner: string, outer: string): THREE.CanvasTexture {
  const [c, ctx] = canvas(128)
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return tex(c)
}

/** Heat-shield ablative tiles. */
export function shieldTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512)
  ctx.fillStyle = '#3b2a20'
  ctx.fillRect(0, 0, 512, 512)
  for (let y = 0; y < 512; y += 32) for (let x = 0; x < 512; x += 32) {
    ctx.fillStyle = `rgba(${70 + Math.random() * 30},${48 + Math.random() * 20},${34 + Math.random() * 12},1)`
    ctx.fillRect(x + 1, y + 1, 30, 30)
  }
  return tex(c)
}

/** Solar array cells. */
export function solarTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512, 256)
  ctx.fillStyle = '#0c1a3a'
  ctx.fillRect(0, 0, 512, 256)
  for (let y = 4; y < 256; y += 32) for (let x = 4; x < 512; x += 32) {
    const g = ctx.createLinearGradient(x, y, x + 28, y + 28)
    g.addColorStop(0, '#1d3f8a')
    g.addColorStop(1, '#0f2456')
    ctx.fillStyle = g
    ctx.fillRect(x, y, 28, 28)
  }
  ctx.strokeStyle = 'rgba(200,210,230,0.5)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 510, 254)
  return tex(c)
}
