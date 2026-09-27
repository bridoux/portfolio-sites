// Captures the portfolio's hero + detail frames for every project (or just the ids given).
//   node tools/capture.mjs              → all projects with a `capture` config
//   node tools/capture.mjs aurele togen → only those
// Reads the list straight from sites/portfolio/src/data/projects.ts (Node strips the types).
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { PROJECTS } from '../sites/portfolio/src/data/projects.ts'

const OUT = 'sites/portfolio/public/shots'
const only = process.argv.slice(2)
const targets = PROJECTS.filter((p) => p.capture && (only.length === 0 || only.includes(p.id)))
if (targets.length === 0) {
  console.error('Nothing to capture. Check the ids, and that each project has a `capture` config.')
  process.exit(1)
}

const browser = await chromium.launch({ channel: 'msedge' })
for (const p of targets) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  try {
    await page.goto(p.devUrl ?? p.url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (err) {
    console.error(`✗ ${p.id}: could not load ${p.devUrl ?? p.url} (is its dev server running?)`)
    await page.close()
    continue
  }
  await page.addStyleTag({ content: '[data-reveal]{opacity:1!important;visibility:visible!important;transform:none!important}' })
  await page.waitForTimeout(2500)
  for (const [label, f] of [['hero', 0], ['detail', p.capture.detail]]) {
    await page.evaluate(([t, f]) => {
      const el = t === 'doc' ? null : document.querySelector(t)
      const start = el ? el.getBoundingClientRect().top + scrollY : 0
      const span = el ? el.offsetHeight - innerHeight : document.documentElement.scrollHeight - innerHeight
      window.scrollTo(0, start + span * f)
    }, [p.capture.selector, f])
    await page.waitForTimeout(3200)
    await sharp(await page.screenshot()).webp({ quality: 84 }).toFile(`${OUT}/${p.id}-${label}.webp`)
    console.log(`✓ ${p.id} ${label}`)
  }
  await page.close()
}
await browser.close()
