// Cuts the front-view Squelette reference + generated parts into aligned transparent layers.
// Geometry measured with tools/guides.cjs (reference pixels, 1360×2048).
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const RAW = path.join(__dirname, '..', '.raw', 'sq')
const OUT = path.join(__dirname, '..', 'sites', 'aurele', 'public', 'img', 'watch')
fs.mkdirSync(OUT, { recursive: true })

const G = { cx: 672, cy: 878, rd: 402, rb: 501, caseTop: 328, caseBottom: 1505 }

const raw = async (f) => { const { data, info } = await sharp(path.join(RAW, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height } }
const smooth = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
async function save(name, img, crop) {
  let s = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
  if (crop) s = s.extract(crop)
  await s.webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT, name + '.webp'))
}

async function circlePart(file, name, opts = {}) {
  const img = await raw(file)
  const { data, w, h } = img
  let minX = w, maxX = 0, minY = h, maxY = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    if (Math.max(data[i], data[i + 1], data[i + 2]) > 40) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y) }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, r = Math.max(maxX - minX, maxY - minY) / 2
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const d = Math.hypot(x - cx, y - cy)
    const lum = Math.max(data[i], data[i + 1], data[i + 2])
    let a = 1 - smooth(d, r - 1.5, r + 1)
    if (opts.keyBlack) a *= smooth(lum, opts.keyLo ?? 14, opts.keyHi ?? 42)
    if (opts.windowAlpha !== undefined && d < r * opts.windowR) a = Math.max(a, opts.windowAlpha)
    data[i + 3] = Math.round(a * 255)
  }
  const left = Math.max(0, Math.round(cx - r)), top = Math.max(0, Math.round(cy - r))
  const size = Math.round(r * 2)
  await save(name, img, { left, top, width: Math.min(size, w - left), height: Math.min(size, h - top) })
  return { cx: (cx - left) / size, cy: (cy - top) / size, r }
}

;(async () => {
  const ref = await raw('ref.png')
  const { w, h } = ref
  const layer = (keep) => {
    const out = Buffer.from(ref.data)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const d = Math.hypot(x - G.cx, y - G.cy)
      const lum = Math.max(ref.data[i], ref.data[i + 1], ref.data[i + 2])
      out[i + 3] = Math.round(keep(d, x, y) * smooth(lum, 10, 30) * 255)
    }
    return { data: out, w, h }
  }
  // Rubber strap: everything beyond the case's top and bottom edges
  await save('straps', layer((d, x, y) => Math.max(1 - smooth(y, G.caseTop - 4, G.caseTop + 4), smooth(y, G.caseBottom - 4, G.caseBottom + 4))))
  // Case: between the straps, outside the bezel (includes crown and pushers)
  await save('case', layer((d, x, y) => smooth(y, G.caseTop - 4, G.caseTop + 4) * (1 - smooth(y, G.caseBottom - 4, G.caseBottom + 4)) * smooth(d, G.rb - 1, G.rb + 1)))
  // Screwed bezel ring (with the dark rehaut inside it)
  await save('bezel', layer((d) => smooth(d, G.rd - 2, G.rd + 1) * (1 - smooth(d, G.rb - 1, G.rb + 1))))

  const dial = await circlePart('dial.png', 'dial', { keyBlack: true, keyLo: 10, keyHi: 34 })
  await circlePart('movement.png', 'movement')
  await circlePart('rotor.png', 'rotor', { keyBlack: true })
  await circlePart('caseback.png', 'caseback', { keyBlack: true, windowAlpha: 0.55, windowR: 0.68 })

  const hand = await raw('hand.png')
  let hx0 = hand.w, hx1 = 0, hy0 = hand.h, hy1 = 0
  for (let y = 0; y < hand.h; y++) for (let x = 0; x < hand.w; x++) {
    const i = (y * hand.w + x) * 4
    const lum = Math.max(hand.data[i], hand.data[i + 1], hand.data[i + 2])
    hand.data[i + 3] = Math.round(smooth(lum, 18, 50) * 255)
    if (lum > 50) { hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x); hy0 = Math.min(hy0, y); hy1 = Math.max(hy1, y) }
  }
  const pad = 6
  const crop = { left: hx0 - pad, top: hy0 - pad, width: hx1 - hx0 + pad * 2, height: hy1 - hy0 + pad * 2 }
  await save('hand', hand, crop)
  const handLen = hy1 - hy0
  const pivotY = (hy1 - handLen * 0.06 - crop.top) / crop.height

  const meta = {
    frame: { w, h },
    cx: G.cx / w, cy: G.cy / h,
    dialR: G.rd / w, bezelR: G.rb / w, caseR: G.rb / w,
    hand: { aspect: crop.width / crop.height, pivotY, lengthFrac: handLen / crop.height },
    dialCenter: { x: dial.cx, y: dial.cy },
  }
  fs.writeFileSync(path.join(__dirname, '..', 'sites', 'aurele', 'src', 'data', 'watchLayers.json'), JSON.stringify(meta, null, 2))
  console.log(meta)
})()
