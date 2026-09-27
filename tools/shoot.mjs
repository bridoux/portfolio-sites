// Usage: node tools/shoot.mjs <url> <name> <w>x<h> <selector|doc> <fractions...>
import { chromium } from 'playwright-core'
const [url, name, size = '1440x900', target = 'doc', ...fr] = process.argv.slice(2)
const [width, height] = size.split('x').map(Number)
const browser = await chromium.launch({ channel: 'msedge', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width, height } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(Number(process.env.SETTLE ?? 1500))
for (const f of fr.length ? fr : ['0']) {
  await page.evaluate(([t, f]) => {
    const el = t === 'doc' ? null : document.querySelector(t)
    const start = el ? el.getBoundingClientRect().top + scrollY : 0
    const span = el ? el.offsetHeight - innerHeight : document.documentElement.scrollHeight - innerHeight
    window.scrollTo(0, start + span * Number(f))
  }, [target, f])
  await page.waitForTimeout(Number(process.env.WAIT ?? 2200))
  await page.screenshot({ path: `shots/${name}-${f}.png` })
}
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'))
await browser.close()
console.log('done')
