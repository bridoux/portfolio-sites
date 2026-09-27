// Screenshots each portfolio page with ?stress=N clones, to check layouts at scale.
import { chromium } from 'playwright-core'
const N = Number(process.argv[2] ?? 24)
const b = await chromium.launch({ channel: 'msedge' })
const errors = []
async function shot(path, name, fn) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  p.on('pageerror', (e) => errors.push(`${path}: ${e}`))
  await p.goto(`http://localhost:5100${path}${path.includes('?') ? '&' : '?'}stress=${N}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(3800)
  await fn(p)
  await p.screenshot({ path: `shots/stress-${name}.png` })
  await p.close()
}
await shot('/', 'hero', async () => {})
await shot('/', 'grid', async (p) => { await p.evaluate(() => document.querySelector('#work').scrollIntoView()); await p.waitForTimeout(2000) })
await shot('/', 'list', async (p) => {
  await p.evaluate(() => document.querySelector('#work').scrollIntoView()); await p.waitForTimeout(800)
  await p.click('.ca-view button:first-child'); await p.waitForTimeout(1500)
})
await shot('/', 'filter', async (p) => {
  await p.evaluate(() => document.querySelector('#work').scrollIntoView()); await p.waitForTimeout(800)
  await p.click('.ca-view button:last-child'); await p.click('.ca-filters button:nth-child(3)'); await p.waitForTimeout(1500)
})
await shot('/', 'about', async (p) => { await p.evaluate(() => document.querySelector('#about').scrollIntoView()); await p.waitForTimeout(2000) })
await shot('/exhibition', 'exh-hero', async () => {})
await shot('/exhibition', 'exh-gallery', async (p) => { await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45)); await p.waitForTimeout(2500) })
await shot('/live', 'live-grid', async (p) => { await p.evaluate(() => window.scrollTo(0, innerHeight * 1.0 + innerHeight * 1.5)); await p.waitForTimeout(3000) })
await shot('/work/kestrel-17', 'case', async () => {})
console.log(errors.length ? errors.join('\n') : 'no page errors')
await b.close()
