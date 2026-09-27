// Cuts the reference photo + generated parts into aligned, transparent layers for the CSS 3D dissection.
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const RAW = path.join(__dirname, '..', '.raw', 'watch')
const OUT = path.join(__dirname, '..', 'sites', 'aurele', 'public', 'img', 'watch')
fs.mkdirSync(OUT, { recursive: true })

const raw = async (f) => { const { data, info } = await sharp(path.join(RAW, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height } }
const smooth = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
const isGold = (r, g, b) => r > 120 && r > b + 45 && g > 60 && r > g + 15 && (r + g + b) > 300
const isBlue = (r, g, b) => b > 55 && b > r + 25 && b > g + 5

async function save(name, img, crop) {
  let s = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
  if (crop) s = s.extract(crop)
  await s.webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT, name + '.webp'))
}

/** Circular component on black → square RGBA cut to its circle, black keyed to transparent. */
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
    if (opts.keyBlack) a *= smooth(lum, 14, 42)
    if (opts.windowAlpha !== undefined && d < r * opts.windowR) a = Math.max(a, opts.windowAlpha)
    data[i + 3] = Math.round(a * 255)
  }
  const size = Math.round(r * 2)
  await save(name, img, { left: Math.max(0, Math.round(cx - r)), top: Math.max(0, Math.round(cy - r)), width: Math.min(size, w - Math.round(cx - r)), height: Math.min(size, h - Math.round(cy - r)) })
  return { cx, cy, r }
}

;(async () => {
  // ── Reference photo: find the dial and case geometry ─────────────────
  const ref = await raw('ref.png')
  const { w, h } = ref
  let bx0 = w, bx1 = 0, by0 = h, by1 = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    if (isBlue(ref.data[i], ref.data[i + 1], ref.data[i + 2])) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y) }
  }
  // Vertical extent only: the crown's blue cabochon would skew the horizontal one.
  const rd = (by1 - by0) / 2
  const cy = (by0 + by1) / 2
  const cx = bx0 + rd
  // Case outer edge: first gold pixel scanning inwards from the left on the center row
  let left = 0
  for (let x = 0; x < cx; x++) { const i = (Math.round(cy) * w + x) * 4; if (isGold(ref.data[i], ref.data[i + 1], ref.data[i + 2])) { left = x; break } }
  const ro = cx - left
  const rb = rd + (ro - rd) * 0.5
  console.log({ w, h, cx, cy, rd, rb, ro })

  const layer = (keep) => {
    const out = Buffer.from(ref.data)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const r = ref.data[i], g = ref.data[i + 1], b = ref.data[i + 2]
      const d = Math.hypot(x - cx, y - cy)
      out[i + 3] = Math.round(keep(d, r, g, b, x, y) * smooth(Math.max(r, g, b), 10, 34) * 255)
    }
    return { data: out, w, h }
  }
  const lugZone = (y) => Math.abs(y - cy) < ro * 1.32
  await save('straps', layer((d, r, g, b, x, y) => (d > ro + 1 && !(isGold(r, g, b) && lugZone(y)) ? 1 : 0)))
  await save('case', layer((d, r, g, b, x, y) => {
    if (d >= rb && d <= ro + 1) return smooth(d, rb - 1, rb + 1)
    if (d > ro + 1 && isGold(r, g, b) && (lugZone(y) || x > cx + ro * 0.9)) return 1
    return 0
  }))
  await save('bezel', layer((d) => smooth(d, rd - 3, rd) * (1 - smooth(d, rb - 1, rb + 1))))

  // ── Generated parts ───────────────────────────────────────────────────
  await circlePart('dial.png', 'dial')
  await circlePart('movement.png', 'movement')
  await circlePart('rotor.png', 'rotor', { keyBlack: true })
  await circlePart('caseback.png', 'caseback', { keyBlack: true, windowAlpha: 0.55, windowR: 0.7 })

  // Hand: key out black, crop to the hand, record the pivot (the ring at the bottom)
  const hand = await raw('hands.png')
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
  // Pivot sits ~5% of the hand length above the bottom tip of the counterweight ring
  const pivotY = (hy1 - handLen * 0.05 - crop.top) / crop.height

  const meta = {
    frame: { w, h },
    cx: cx / w, cy: cy / h,
    dialR: rd / w, bezelR: rb / w, caseR: ro / w,
    hand: { aspect: crop.width / crop.height, pivotY, lengthFrac: handLen / crop.height },
  }
  fs.writeFileSync(path.join(__dirname, '..', 'sites', 'aurele', 'src', 'data', 'watchLayers.json'), JSON.stringify(meta, null, 2))
  console.log(meta)
})()
