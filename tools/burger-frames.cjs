// Turns the Higgsfield burger video into a scroll-scrubbed WebP frame sequence.
// node tools/burger-frames.cjs <video.mp4> [--from 0] [--to 5] [--frames 96] [--width 720] [--quality 66]
// → sites/ember-stack/public/img/seq/f000.webp … and src/data/burgerSeq.json
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const args = process.argv.slice(2)
const video = args[0]
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? Number(args[i + 1]) : d }
const from = opt('from', 0), to = opt('to', 0), frames = opt('frames', 96), width = opt('width', 720), quality = opt('quality', 66)
const tmp = path.join('.raw', 'ember-video', 'png')
const out = path.join('sites', 'ember-stack', 'public', 'img', 'seq')
fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true })
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true })
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString())
const end = to > 0 ? to : dur
const fps = frames / (end - from)
execFileSync('ffmpeg', ['-v', 'error', '-ss', String(from), '-to', String(end), '-i', video, '-vf', `fps=${fps.toFixed(4)},hqdn3d=2.5:2.5:5:5,scale=${width}:-2:flags=lanczos`, path.join(tmp, 'f%03d.png')])
;(async () => {
  const pngs = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort()
  let bytes = 0, w = 0, h = 0
  for (const [i, f] of pngs.entries()) {
    const file = path.join(out, `f${String(i).padStart(3, '0')}.webp`)
    const info = await sharp(path.join(tmp, f)).webp({ quality, effort: 6, smartSubsample: true }).toFile(file)
    bytes += info.size; w = info.width; h = info.height
  }
  const layout = JSON.parse(fs.readFileSync(path.join('.raw', 'ember-video', 'layout.json'), 'utf8'))
  fs.writeFileSync(path.join('sites', 'ember-stack', 'src', 'data', 'burgerSeq.json'), JSON.stringify({ count: pngs.length, width: w, height: h, path: '/img/seq/f', ...layout }, null, 2) + '\n')
  console.log(`${pngs.length} frames ${w}x${h}, ${(bytes / 1024 / 1024).toFixed(2)} MB total, avg ${(bytes / pngs.length / 1024).toFixed(0)} KB`)
})()
