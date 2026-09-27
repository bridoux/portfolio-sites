// Screenshot each boundary between consecutive top-level sections, centred in the viewport.
import { chromium } from 'playwright-core'
const [url, name, size = '1440x900'] = process.argv.slice(2)
const [width, height] = size.split('x').map(Number)
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width, height } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: '[data-reveal]{opacity:1!important;visibility:visible!important;transform:none!important}' })
await page.waitForTimeout(1200)
const tops = await page.evaluate(() => [...document.querySelectorAll('main > section, main > .ticker, footer')].map((s) => ({ cls: s.className.split(' ')[0], top: s.getBoundingClientRect().top + scrollY })))
for (let i = 1; i < tops.length; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), tops[i].top - height / 2)
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `shots/${name}-seam${i}.png` })
}
console.log(tops.map((t) => t.cls).join(' → '))
await browser.close()
