const sharp = require('sharp')
const [cx, cy, rd, rb, top, bot] = process.argv.slice(2).map(Number)
const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1360' height='2048'>
<circle cx='${cx}' cy='${cy}' r='${rd}' fill='none' stroke='#0f0' stroke-width='3'/>
<circle cx='${cx}' cy='${cy}' r='${rb}' fill='none' stroke='#f0f' stroke-width='3'/>
<circle cx='${cx}' cy='${cy}' r='8' fill='#f00'/>
<line x1='0' x2='1360' y1='${top}' y2='${top}' stroke='#ff0' stroke-width='3'/>
<line x1='0' x2='1360' y1='${bot}' y2='${bot}' stroke='#ff0' stroke-width='3'/></svg>`
;(async () => {
  const buf = await sharp('.raw/sq/ref.png').composite([{ input: Buffer.from(svg) }]).png().toBuffer()
  await sharp(buf).resize(800).toFile('shots/sq-guides.png')
})()
