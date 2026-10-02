// Builds the 1200×630 social preview image for the portfolio. node tools/og-image.mjs
import sharp from 'sharp'
const W = 1200, H = 630
const shots = ['aurele', 'ember', 'kestrel'].map((id) => `sites/portfolio/public/shots/${id}-hero.webp`)
const tw = 360, th = 225
const tiles = await Promise.all(shots.map(async (f, i) => ({
  input: await sharp(f).resize(tw, th, { fit: 'cover' })
    .composite([{ input: Buffer.from(`<svg width="${tw}" height="${th}"><rect width="${tw}" height="${th}" rx="10" fill="none" stroke="#ecebe7" stroke-opacity=".18" stroke-width="2"/></svg>`) }])
    .png().toBuffer(),
  left: 60 + i * (tw + 30), top: 345,
})))
const text = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .n{font:600 30px 'Helvetica Neue',Arial,sans-serif;fill:#ecebe7;letter-spacing:-.5px}
    .h{font:600 74px 'Helvetica Neue',Arial,sans-serif;fill:#ecebe7;letter-spacing:-3px}
    .s{font:italic 400 74px Georgia,serif;fill:#ff5a36}
    .u{font:500 24px 'Helvetica Neue',Arial,sans-serif;fill:#ecebe7;opacity:.6}
  </style>
  <text x="60" y="88" class="n">Eric Bridoux</text>
  <text x="1140" y="88" text-anchor="end" class="u">ericbridoux.com</text>
  <text x="60" y="200" class="h">Websites that feel like a</text>
  <text x="60" y="282" class="h"><tspan class="s">whole team</tspan> built them.</text>
</svg>`
await sharp({ create: { width: W, height: H, channels: 3, background: '#0c0c0c' } })
  .composite([{ input: Buffer.from(text) }, ...tiles])
  .png().toFile('sites/portfolio/public/og.png')
console.log('wrote sites/portfolio/public/og.png')
