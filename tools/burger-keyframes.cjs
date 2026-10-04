// Builds the start (assembled) and end (exploded) keyframes for the Higgsfield burger video.
// node tools/burger-keyframes.cjs → .raw/ember-video/start.png, end.png (1080×1920)
const sharp = require('sharp')
const fs = require('fs')
const LAYERS = require('../sites/ember-stack/src/data/stackLayers.json')
const FW = 1080, FH = 1920, BG = { r: 18, g: 11, b: 8 }
const OUT = '.raw/ember-video'
fs.mkdirSync(OUT, { recursive: true })

const glow = Buffer.from(`<svg width="${FW}" height="${FH}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="50%" cy="54%" r="55%"><stop offset="0" stop-color="#3a1a0c"/><stop offset="0.55" stop-color="#1d110b"/><stop offset="1" stop-color="#120b08"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)

async function render(file, place) {
  const comps = [{ input: glow }]
  for (const [i, L] of [...LAYERS.entries()].reverse()) {
    const { w, x, y, rot } = place(L, i)
    let img = sharp(`sites/ember-stack/public${L.src}`).resize({ width: Math.round(w) })
    if (rot) img = img.rotate(rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    const { data, info } = await img.png().toBuffer({ resolveWithObject: true })
    comps.push({ input: data, left: Math.round(x - info.width / 2), top: Math.round(y - info.height / 2) })
  }
  await sharp({ create: { width: FW, height: FH, channels: 3, background: BG } }).composite(comps).png().toFile(`${OUT}/${file}`)
}

;(async () => {
  // Assembled: burger ~80% of the frame width, centred
  const WA = FW * 0.8, cyA = FH * 0.52
  await render('start.png', (L) => ({ w: L.w * WA, x: FW / 2, y: cyA + L.y * WA }))
  // Exploded: same order; hand-weighted gaps (bigger under the bun dome and the tall layers)
  const WE = FW * 0.56, top = FH * 0.085, bottom = FH * 0.915
  const GAPS = [1.55, 0.9, 1.0, 1.15, 1.0, 1.15, 1.15, 1.2, 0.95, 1.1]
  const unit = (bottom - top) / GAPS.reduce((a, b) => a + b, 0)
  const ys = [top]
  GAPS.forEach((g) => ys.push(ys[ys.length - 1] + g * unit))
  await render('end.png', (L, i) => ({
    w: L.w * WE,
    x: FW / 2 + (i % 2 ? 1 : -1) * WE * 0.035,
    y: ys[i],
    rot: (i % 2 ? 1 : -1) * 2.5,
  }))
  // Layout for the scroller: where each layer sits (fractions of the frame) in the exploded frame
  fs.writeFileSync(`${OUT}/layout.json`, JSON.stringify({
    hero: { y: cyA / FH, w: WA / FW, top: (cyA - 0.66 * WA) / FH, bottom: (cyA + 0.57 * WA) / FH },
    exploded: { top: top / FH, bottom: bottom / FH, layers: LAYERS.map((L, i) => ({ key: L.key, y: +(ys[i] / FH).toFixed(4) })) },
  }, null, 2))
  console.log('ok')
})()
