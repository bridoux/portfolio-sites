// Previews the assembled burger from the photo layers so stack positions can be tuned.
// node tools/burger-stack.cjs <out.png>   — edit LAYERS below (mirrors BurgerScroller.tsx)
const sharp = require('sharp')
const LAYERS = require('../sites/ember-stack/src/data/stackLayers.json')
const W = 600, PAD = 260
;(async () => {
  const H = Math.round(W * 1.6), cx = (W + PAD * 2) / 2, cy = H / 2
  const comps = []
  for (const L of [...LAYERS].reverse()) { // bottom first so upper layers paint on top
    const lw = Math.round(L.w * W)
    const buf = await sharp(`sites/ember-stack/public${L.src}`).resize({ width: lw }).toBuffer({ resolveWithObject: true })
    comps.push({ input: buf.data, left: Math.round(cx - lw / 2 + (L.x || 0) * W), top: Math.round(cy + L.y * W - buf.info.height / 2) })
  }
  await sharp({ create: { width: W + PAD * 2, height: H, channels: 3, background: '#1c110c' } }).composite(comps).png().toFile(process.argv[2] || 'shots/burger-stack.png')
  console.log('ok')
})()
