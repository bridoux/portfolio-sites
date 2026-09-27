import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'msedge' })
for (const n of [5, 12, 24]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(`http://localhost:5100/live?stress=${n}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(2000)
  // End of the fan-out: desk top + 125% of the 140% pin length
  await p.evaluate(() => { const d = document.querySelector('.cc-desk'); window.scrollTo(0, d.getBoundingClientRect().top + scrollY + innerHeight * 1.25) })
  await p.waitForTimeout(3000)
  const r = await p.evaluate(() => {
    const nav = document.querySelector('.cc-nav').getBoundingClientRect()
    const wins = [...document.querySelectorAll('.cc-win')].map((w) => w.getBoundingClientRect())
    return { navBottom: Math.round(nav.bottom), top: Math.round(Math.min(...wins.map((w) => w.top))), bottom: Math.round(Math.max(...wins.map((w) => w.bottom))), vh: innerHeight }
  })
  console.log(n, JSON.stringify(r), r.top > r.navBottom && r.bottom < r.vh ? 'fits' : 'OVERFLOW')
  await p.screenshot({ path: `shots/live-${n}.png` })
  await p.close()
}
await b.close()
