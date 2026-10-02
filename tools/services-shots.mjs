// Viewport screenshots of the Services + Contact sections at desktop and mobile. node tools/services-shots.mjs
import { chromium } from 'playwright-core'
const BASE = process.env.BASE ?? 'http://localhost:5100'
const b = await chromium.launch({ channel: 'msedge' })
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport })
  p.setDefaultTimeout(15000)
  await p.goto(BASE + '/', { waitUntil: 'load' })
  await p.waitForTimeout(3800)
  for (const [id, shots] of [['services', 3], ['contact', 2]]) {
    const top = await p.evaluate((s) => document.getElementById(s).getBoundingClientRect().top + window.scrollY, id)
    for (let k = 0; k < shots; k++) {
      await p.evaluate((y) => window.scrollTo(0, y), top + k * viewport.height * 0.9)
      await p.waitForTimeout(1200)
      await p.screenshot({ path: `shots/${id}-${name}-${k}.png` })
    }
  }
  await p.close()
}
await b.close()
console.log('done')
