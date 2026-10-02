// Checks the concept credit on each site: visible, not overlapping clickable UI, hidden in iframes.
// node tools/credit-check.mjs   (dev servers on 5101–5105)
import { chromium } from 'playwright-core'
import sharp from 'sharp'
const SITES = { aurele: 5101, 'ember-stack': 5102, kestrel: 5103, togen: 5104, subsoniq: 5105 }
const b = await chromium.launch({ channel: 'msedge' })
const out = []
const tiles = []
for (const [vp, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  for (const [name, port] of Object.entries(SITES)) {
    const p = await b.newPage({ viewport })
    p.setDefaultTimeout(15000)
    await p.goto(`http://localhost:${port}/`, { waitUntil: 'load' })
    await p.waitForTimeout(2500)
    const res = []
    for (const frac of [0, 0.5, 0.97]) {
      await p.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), frac)
      await p.waitForTimeout(900)
      res.push(await p.evaluate(() => {
        const c = document.getElementById('concept-credit')
        if (!c) return 'missing'
        const r = c.getBoundingClientRect()
        // Anything clickable under the badge's corners/centre (other than the badge)?
        const pts = [[r.left + 4, r.top + 4], [r.right - 4, r.top + 4], [r.left + 4, r.bottom - 4], [r.right - 4, r.bottom - 4], [(r.left + r.right) / 2, (r.top + r.bottom) / 2]]
        c.style.visibility = 'hidden'
        if (getComputedStyle(c).pointerEvents === 'none') return 'hidden'
        const hits = pts.map(([x, y]) => document.elementFromPoint(x, y)?.closest('a,button,input,select,textarea,[role=button],label')).filter(Boolean)
        c.style.visibility = ''
        return hits.length ? 'overlaps ' + hits.map((h) => h.tagName.toLowerCase() + '.' + (h.className || '').toString().split(' ')[0] + ' "' + (h.textContent || '').trim().slice(0, 20) + '"').join(', ') : 'clear'
      }))
    }
    if (vp === 'desktop' || true) {
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600)
      const buf = await p.screenshot({ clip: { x: 0, y: viewport.height - 120, width: Math.min(viewport.width, 520), height: 120 } })
      tiles.push({ label: `${name} ${vp}`, buf, w: Math.min(viewport.width, 520) })
    }
    out.push(`${vp.padEnd(8)} ${name.padEnd(12)} top:${res[0]} | mid:${res[1]} | end:${res[2]}`)
    await p.close()
  }
}
// iframe check
const p = await b.newPage()
await p.setContent(`<iframe src="http://localhost:5101/" width="800" height="600"></iframe>`)
await p.waitForTimeout(3000)
const inFrame = await p.frames()[1].evaluate(() => !!document.getElementById('concept-credit'))
out.push(`iframe: credit ${inFrame ? 'SHOWN (bad)' : 'hidden (good)'}`)
console.log(out.join('\n'))
const H = tiles.length * 130
await sharp({ create: { width: 520, height: H, channels: 3, background: '#888' } })
  .composite(tiles.map((t, i) => ({ input: t.buf, left: 0, top: i * 130 })))
  .png().toFile('shots/credit-sheet.png')
await b.close()
