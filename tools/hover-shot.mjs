// Proposition A: screenshot the index with the cursor over a row (preview + palette shift)
import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5100/?concept=a', { waitUntil: 'networkidle' })
await p.waitForTimeout(3500)
await p.evaluate(() => document.querySelector('#work').scrollIntoView())
await p.waitForTimeout(2500)
for (const [i, name] of [[0, 'aurele'], [3, 'togen']]) {
  const row = p.locator('.ca-row a').nth(i)
  const box = await row.boundingBox()
  await p.mouse.move(box.x + box.width * 0.45, box.y + box.height / 2, { steps: 8 })
  await p.waitForTimeout(1600)
  await p.screenshot({ path: `shots/pa-hover-${name}.png` })
}
await b.close()
