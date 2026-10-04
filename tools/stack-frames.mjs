// Contact sheet of the Ember & Stack burger scroll at several progress points. node tools/stack-frames.mjs [desktop|mobile]
import { chromium } from 'playwright-core'
import sharp from 'sharp'
const mode = process.argv[2] ?? 'desktop'
const viewport = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const PS = [0, 0.04, 0.12, 0.22, 0.3, 0.42, 0.5, 0.62, 0.74, 0.8, 0.88, 0.95]
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport })
p.setDefaultTimeout(20000)
await p.goto('http://localhost:5102/', { waitUntil: 'load' })
await p.waitForTimeout(3000)
const frames = []
for (const f of PS) {
  await p.evaluate((f) => { const s = document.querySelector('.stack'); const top = s.offsetTop; window.scrollTo(0, top + (s.offsetHeight - innerHeight) * f) }, f)
  await p.waitForTimeout(1800)
  frames.push(await p.screenshot())
}
const tw = mode === 'mobile' ? 195 : 480, th = Math.round(tw * viewport.height / viewport.width), cols = mode === 'mobile' ? 6 : 4
const comps = await Promise.all(frames.map(async (buf, i) => ({ input: await sharp(buf).resize(tw, th).png().toBuffer(), left: (i % cols) * tw, top: Math.floor(i / cols) * th })))
await sharp({ create: { width: cols * tw, height: Math.ceil(frames.length / cols) * th, channels: 3, background: '#000' } }).composite(comps).png().toFile(`shots/stack-${mode}.png`)
await b.close()
console.log('ok')
