// Scripted smoke tests of each site's interactive flows (headless Edge).
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ channel: 'msedge' })
const results = []
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)

async function site(url, fn) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  try { await fn(page) } catch (e) { check(url + ' flow', false, String(e).slice(0, 200)) }
  check(url + ' no console errors', errors.length === 0, errors.slice(0, 3).join(' | '))
  await page.close()
}
const reveal = (page) => page.addStyleTag({ content: '[data-reveal]{opacity:1!important;visibility:visible!important;transform:none!important}' })

await site('http://localhost:5101', async (p) => {
  await reveal(p)
  await p.locator('#visite').scrollIntoViewIfNeeded()
  await p.click('text=Request an appointment')
  check('aurele: validation errors shown', (await p.locator('.field__error').count()) >= 3)
  await p.fill('input[autocomplete=name]', 'Test Person')
  await p.fill('input[type=email]', 'test@example.com')
  await p.selectOption('select', { index: 1 })
  await p.fill('input[type=date]', '2027-03-01')
  await p.click('text=Request an appointment')
  check('aurele: booking confirmed', await p.locator('.viewing__done').isVisible())
})

await site('http://localhost:5102', async (p) => {
  await reveal(p)
  await p.locator('#menu').scrollIntoViewIfNeeded()
  await p.click('button[aria-label="Add The Ember Double to bag"]')
  await p.click('button[aria-label="Add Hellfire Triple to bag"]')
  await p.click('role=tab[name="Shakes"]')
  await p.click('button[aria-label="Add Burnt Caramel to bag"]')
  check('ember: bag count = 3', (await p.textContent('.bag__count')) === '3')
  await p.click('.bag')
  await p.waitForTimeout(700)
  const total = await p.textContent('.totals__grand dd')
  check('ember: total correct ($40 + tax = $43.30)', total === '$43.30', total)
  await p.click('text=Place pickup order')
  check('ember: order placed', (await p.textContent('.drawer__big')).includes('on the griddle'))
})

await site('http://localhost:5103', async (p) => {
  await reveal(p)
  await p.locator('#reserve').scrollIntoViewIfNeeded()
  await p.click('text=Hold my seat')
  check('kestrel: seat error shown', await p.locator('.seatmap .err').isVisible())
  await p.click('.seg__opt:has-text("Kármán Hop")')
  check('kestrel: taken seat disabled', await p.locator('button[aria-label="Window seat W2, taken"]').isDisabled())
  await p.click('button[aria-label="Window seat W3"]')
  await p.fill('.fld input[autocomplete=name]', 'Ada Lovelace')
  await p.fill('.fld input[type=email]', 'ada@example.com')
  const dep = await p.textContent('.reserve__total strong')
  check('kestrel: deposit 10% of $225,000', dep === '$22,500', dep)
  await p.click('text=Hold my seat')
  check('kestrel: boarding pass shown', await p.locator('.boarding').isVisible())
  const clock = await p.locator('.clock__num').first().textContent()
  check('kestrel: countdown renders', /^\d\d$/.test(clock))
})

await site('http://localhost:5104', async (p) => {
  await reveal(p)
  await p.locator('#ceremony').scrollIntoViewIfNeeded()
  const session = p.locator('.session:not([disabled])').first()
  await session.click()
  await p.click('button[aria-label="More guests"]')
  await p.fill('.email input', 'guest@example.jp')
  const total = await p.textContent('.booking__foot strong')
  check('togen: total reflects 3 guests', /¥[\d,]+/.test(total), total)
  await p.click('text=Request invitation')
  check('togen: invitation shown', await p.locator('.invite').isVisible())
})

await site('http://localhost:5105', async (p) => {
  await reveal(p)
  await p.locator('#lineup').scrollIntoViewIfNeeded()
  await p.click('role=tab[name="Sat 24.07"] >> nth=0')
  const n = await p.locator('.poster .act:not(.act--more)').count()
  check('subsoniq: Saturday filter = 8 acts', n === 8, String(n))
  await p.locator('#timetable').scrollIntoViewIfNeeded()
  await p.click('.slot >> nth=0')
  check('subsoniq: star persists count', (await p.textContent('.filter--star')).includes('(1)'))
  await p.locator('#tickets').scrollIntoViewIfNeeded()
  await p.click('button[aria-label="Add Day Ticket"]')
  const tot = await p.textContent('.cart__total dd')
  check('subsoniq: total 89 + 2×219 + 3×4.5 = €540.50', tot === '€540.50', tot)
  await p.fill('.cart__email input', 'raver@example.com')
  await p.click('text=Checkout →')
  check('subsoniq: ticket issued with QR', await p.locator('.ticket .qr').isVisible())
})

console.log(results.join('\n'))
await browser.close()
