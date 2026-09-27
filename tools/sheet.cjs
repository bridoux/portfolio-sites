// node tools/sheet.cjs out.png cols file1 file2 ...
const sharp = require('sharp')
const [out, cols, ...files] = process.argv.slice(2)
;(async () => {
  const c = Number(cols), W = 720
  const metas = await Promise.all(files.map((f) => sharp(f).metadata()))
  const H = Math.round(W * metas[0].height / metas[0].width)
  const imgs = await Promise.all(files.map((f) => sharp(f).resize(W, H).toBuffer()))
  const rows = Math.ceil(files.length / c)
  await sharp({ create: { width: W * c, height: H * rows, channels: 3, background: '#000' } })
    .composite(imgs.map((b, i) => ({ input: b, left: (i % c) * W, top: Math.floor(i / c) * H }))).png().toFile(out)
})()
