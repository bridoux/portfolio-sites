// Portfolio routes + navigation smoke test. BASE=https://eric-bridoux.vercel.app node tools/portfolio-e2e.mjs
import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(String(e)))
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const BASE = process.env.BASE ?? 'http://localhost:5100'
const out = []
const check = (n, ok, x = '') => out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`)

await p.goto(BASE + '/', { waitUntil: 'networkidle' })
await p.waitForTimeout(3600)
check('home: no switcher', (await p.locator('.props').count()) === 0)
check('home: 5 project rows', (await p.locator('.ca-row').count()) === 5)
check('home: title', (await p.title()).includes('Selected work'), await p.title())
await p.evaluate(() => document.querySelector('#work').scrollIntoView())
await p.waitForTimeout(1500)
await p.locator('.ca-row a').nth(2).click()
await p.waitForTimeout(2500)
check('row → case study URL', p.url().endsWith('/work/kestrel'), p.url())
check('case study: title', (await p.locator('.cs-title').textContent()).includes('Kestrel Orbital'))
check('case study: live link', (await p.locator('.cs-live').getAttribute('href')) === 'https://kestrel-orbital.vercel.app')
await p.screenshot({ path: 'shots/cs-kestrel-top.png' })
await p.locator('.cs-next').click()
await p.waitForTimeout(2000)
check('next project → togen', p.url().endsWith('/work/togen'), p.url())
await p.goBack()
await p.waitForTimeout(1500)
check('back button → kestrel', p.url().endsWith('/work/kestrel'), p.url())
await p.locator('.cs-back').click()
await p.waitForTimeout(2500)
check('← Index returns home', new URL(p.url()).pathname === '/', p.url())
check('loader skipped on return', !(await p.locator('.ca-loader').isVisible().catch(() => false)))
for (const [path, sel] of [['/exhibition', '.cb-hero'], ['/live', '.cc-hero']]) {
  await p.goto(BASE + path, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
  check(`${path} renders standalone`, await p.locator(sel).isVisible())
}
check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '))
console.log(out.join('\n'))
await b.close()
