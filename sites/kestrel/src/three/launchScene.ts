import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildRocket } from './rocket'
import { softSprite } from './textures'

export interface LaunchScene {
  setProgress: (p: number) => void
  dispose: () => void
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, v: number) => ease(clamp01((v - a) / (b - a)))
const ramp = (a: number, b: number, v: number) => clamp01((v - a) / (b - a))

/** Timeline beats, shared with the DOM telemetry. */
export const BEATS = {
  liftoff: [0.04, 0.26],
  meco: [0.26, 0.36],
  fairing: [0.34, 0.42],
  s2sep: [0.44, 0.52],
  explode: [0.52, 0.64],
  reassemble: [0.72, 0.8],
  orbit: [0.8, 1],
} as const

/** Rocket altitude in scene units for a given progress. */
export function altitude(p: number): number {
  const k = ramp(BEATS.liftoff[0], 0.62, p)
  return Math.pow(k, 2.2) * 70
}

export function createLaunchScene(canvas: HTMLCanvasElement): LaunchScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.5

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 600)
  const sun = new THREE.DirectionalLight(0xffe6c8, 3)
  sun.position.set(10, 12, 8)
  const skyFill = new THREE.HemisphereLight(0x9fb6ff, 0x2a1a12, 0.8)
  scene.add(sun, skyFill)

  // ── Launch pad + tower ─────────────────────────────────────────────────
  const pad = new THREE.Group()
  const concrete = new THREE.MeshStandardMaterial({ color: '#5a5c63', roughness: 0.95 })
  const padDisc = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 0.4, 64), concrete)
  padDisc.position.y = -0.4
  pad.add(padDisc)
  const steelDark = new THREE.MeshStandardMaterial({ color: '#2b2e35', roughness: 0.6, metalness: 0.6 })
  const orange = new THREE.MeshStandardMaterial({ color: '#ff6b2c', roughness: 0.5 })
  const tower = new THREE.Group()
  for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 11.5, 0.08), steelDark)
    post.position.set(x, 5.55, z)
    tower.add(post)
  }
  for (let y = 0.6; y < 11; y += 0.9) {
    for (const [w, d, x, z] of [[1, 0.05, 0, -0.5], [1, 0.05, 0, 0.5], [0.05, 1, -0.5, 0], [0.05, 1, 0.5, 0]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), steelDark)
      b.position.set(x, y, z)
      tower.add(b)
    }
  }
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.3), orange)
  arm.position.set(0.95, 9.4, 0)
  tower.add(arm)
  tower.position.set(-1.9, 0, -0.4)
  pad.add(tower)
  for (const x of [-6, 6]) {
    const lamp = new THREE.PointLight(0xffd9a0, 40, 18, 1.5)
    lamp.position.set(x, 2, 4)
    pad.add(lamp)
  }
  scene.add(pad)

  // ── Rocket ─────────────────────────────────────────────────────────────
  const R = buildRocket()
  const rocket = new THREE.Group()
  rocket.add(R.booster, R.interstage, R.stage2, R.fairingL, R.fairingR, R.capsule.root)
  scene.add(rocket)

  // ── Exhaust smoke (world space ring buffer) ───────────────────────────
  const SMOKE = 900
  const smokePos = new Float32Array(SMOKE * 3)
  const smokeVel = new Float32Array(SMOKE * 3)
  const smokeAge = new Float32Array(SMOKE).fill(99)
  const smokeGeo = new THREE.BufferGeometry()
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3))
  const smoke = new THREE.Points(smokeGeo, new THREE.PointsMaterial({
    map: softSprite('rgba(235,228,220,0.38)', 'rgba(235,228,220,0)'), size: 4.2, transparent: true, depthWrite: false, sizeAttenuation: true,
  }))
  smoke.frustumCulled = false
  scene.add(smoke)
  let smokeCursor = 0

  // ── Stars (follow the camera) ─────────────────────────────────────────
  const STARS = 1800
  const starPos = new Float32Array(STARS * 3)
  for (let i = 0; i < STARS; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(200 + Math.random() * 100)
    starPos.set([v.x, v.y, v.z], i * 3)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.PointsMaterial({ map: softSprite('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), size: 1.4, transparent: true, depthWrite: false, opacity: 0, sizeAttenuation: true })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

  let target = 0
  let current = 0
  let wide = true
  let raf = 0
  let visible = true
  const clock = new THREE.Clock()
  const tmp = new THREE.Vector3()
  const look = new THREE.Vector3()
  const camPos = new THREE.Vector3()

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    wide = w / h > 1.1
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
  io.observe(canvas)

  const setFlame = (g: THREE.Group, on: number, t: number) => {
    g.visible = on > 0.01
    const flicker = 1 + Math.sin(t * 60) * 0.05 + Math.sin(t * 37) * 0.04
    g.scale.set(on * flicker, on * (0.9 + flicker * 0.15), on * flicker)
  }

  const emitSmoke = (origin: THREE.Vector3, rate: number, spread: number, dt: number) => {
    const n = Math.floor(rate * dt * 60)
    for (let k = 0; k < n; k++) {
      const i = smokeCursor
      smokeCursor = (smokeCursor + 1) % SMOKE
      const a = Math.random() * Math.PI * 2
      smokePos.set([origin.x + (Math.random() - 0.5) * 0.6, origin.y, origin.z + (Math.random() - 0.5) * 0.6], i * 3)
      smokeVel.set([Math.cos(a) * spread * (0.5 + Math.random()), -0.6 + Math.random() * 0.8, Math.sin(a) * spread * (0.5 + Math.random())], i * 3)
      smokeAge[i] = 0
    }
  }

  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!visible) return
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    current += (target - current) * Math.min(1, dt * 4)
    const p = current

    // Ascent with a gentle gravity turn
    const alt = altitude(p)
    rocket.position.y = alt
    rocket.rotation.z = -0.12 * smooth(0.1, 0.4, p) * (1 - smooth(0.5, 0.62, p))

    // Stage 1 separation: booster + interstage fall away
    const meco = ramp(BEATS.meco[0], BEATS.meco[1], p)
    const drop = meco * meco
    R.booster.position.set(-1.2 * drop, -9 * drop, 0.6 * drop)
    R.booster.rotation.set(0.5 * drop, 0, 0.35 * drop)
    R.interstage.position.set(-0.8 * drop, 5.5 - 7 * drop, 0.4 * drop)
    R.interstage.rotation.x = 0.8 * drop
    R.booster.visible = R.interstage.visible = meco < 0.999
    setFlame(R.boosterFlame, p > BEATS.liftoff[0] - 0.005 && p < BEATS.meco[0] ? 1 : 0, t)

    // Fairing jettison
    const fj = smooth(BEATS.fairing[0], BEATS.fairing[1], p)
    R.fairingL.rotation.z = -1.2 * fj
    R.fairingL.position.x = 2.6 * fj
    R.fairingR.rotation.z = 1.2 * fj
    R.fairingR.position.x = -2.6 * fj
    R.fairingL.position.y = R.fairingR.position.y = 7.7 - 2.5 * fj * fj
    R.fairingL.visible = R.fairingR.visible = fj < 0.999

    // Stage 2 burn, then separation from the capsule
    const s2 = ramp(BEATS.s2sep[0], BEATS.s2sep[1], p)
    R.stage2.position.y = 5.8 - 8 * s2 * s2
    R.stage2.rotation.x = -0.5 * s2
    R.stage2.visible = s2 < 0.999
    setFlame(R.stage2Flame, p > 0.29 && p < BEATS.s2sep[0] ? 0.9 : 0, t)

    // Capsule exploded view (explode → hold → reassemble)
    const E = smooth(BEATS.explode[0], BEATS.explode[1], p) * (1 - smooth(BEATS.reassemble[0], BEATS.reassemble[1], p))
    const C = R.capsule
    C.trunk.position.y = -1.4 * E
    C.shield.position.y = 0.66 - 0.55 * E
    C.windows.position.y = 1.01 + 0.5 * E
    C.windows.scale.setScalar(1 + 0.25 * E)
    C.nose.position.y = 1.51 + 1.35 * E
    C.module.rotation.y = t * 0.2 * E
    const deploy = smooth(0.46, 0.56, p)
    C.panels.forEach((h) => { h.scale.x = 0.04 + 0.96 * deploy; h.visible = p > 0.42 })

    // In orbit the capsule pitches over to fly horizontally
    const orbit = smooth(BEATS.orbit[0], 0.92, p)
    C.root.rotation.z = -Math.PI / 2 * orbit * 0.85
    C.root.rotation.x = Math.sin(t * 0.3) * 0.05 * orbit

    // ── Camera ──────────────────────────────────────────────────────────
    C.root.getWorldPosition(tmp)
    tmp.y += 0.9
    const rocketMid = new THREE.Vector3(0, alt + 3.4, 0)
    const heroPos = new THREE.Vector3(wide ? -5 : -1, 3.4, wide ? 21 : 34)
    const heroLook = new THREE.Vector3(wide ? -3 : -3.4, wide ? 4.8 : 3.2, 0)
    const chasePos = rocketMid.clone().add(new THREE.Vector3(4.5, -2.5, wide ? 17 : 23))
    const capsuleAngle = lerp(0.3, 2.4, ramp(0.42, 0.78, p))
    const capR = wide ? 8.8 : 12
    const capPos = tmp.clone().add(new THREE.Vector3(Math.sin(capsuleAngle) * capR, 1.2, Math.cos(capsuleAngle) * capR))
    const capLook = tmp.clone().add(new THREE.Vector3(wide ? -1.8 : 0, wide ? -0.1 : -1.6, 0))
    const orbitPos = tmp.clone().add(new THREE.Vector3(wide ? -2.2 : 0, 1.5, wide ? 11 : 15))
    const orbitLook = tmp.clone().add(new THREE.Vector3(wide ? -2.2 : 0, -0.3, 0))

    if (p < 0.12) {
      const k = smooth(0.03, 0.12, p)
      camPos.lerpVectors(heroPos, chasePos, k); look.lerpVectors(heroLook, rocketMid, k)
    } else if (p < 0.4) {
      const k = smooth(0.3, 0.4, p)
      const capsuleFocus = tmp.clone()
      camPos.lerpVectors(chasePos, capsuleFocus.clone().add(new THREE.Vector3(3.5, -1, 9)), k)
      look.lerpVectors(rocketMid, capsuleFocus, k)
    } else if (p < BEATS.orbit[0]) {
      const k = smooth(0.4, 0.48, p)
      const prevPos = tmp.clone().add(new THREE.Vector3(3.5, -1, 9))
      camPos.lerpVectors(prevPos, capPos, k); look.lerpVectors(tmp, capLook, k)
    } else {
      const k = smooth(BEATS.orbit[0], 0.9, p)
      camPos.lerpVectors(capPos, orbitPos, k); look.lerpVectors(capLook, orbitLook, k)
    }
    camera.position.copy(camPos)
    camera.lookAt(look)

    // Smoke: heavy at the pad on liftoff, thinning with altitude
    if (p < BEATS.meco[0] && alt < 30) {
      const nozzleY = alt - 0.4
      emitSmoke(new THREE.Vector3(0, Math.max(0, nozzleY), 0), p < 0.04 ? 0.8 : 8, alt < 3 ? 3.6 : 1.4, dt)
    }
    for (let i = 0; i < SMOKE; i++) {
      if (smokeAge[i] > 8) { smokePos[i * 3 + 1] = -9999; continue }
      smokeAge[i] += dt
      smokePos[i * 3] += smokeVel[i * 3] * dt
      smokePos[i * 3 + 1] = Math.max(-0.2, smokePos[i * 3 + 1] + smokeVel[i * 3 + 1] * dt + 0.25 * dt)
      smokePos[i * 3 + 2] += smokeVel[i * 3 + 2] * dt
      smokeVel[i * 3] *= 0.985
      smokeVel[i * 3 + 2] *= 0.985
    }
    smokeGeo.attributes.position.needsUpdate = true
    ;(smoke.material as THREE.PointsMaterial).opacity = 1 - smooth(0.2, 0.3, p)

    // Sky → space
    starMat.opacity = smooth(0.1, 0.3, p)
    stars.position.copy(camera.position)
    skyFill.intensity = lerp(0.8, 0.15, smooth(0.08, 0.3, p))
    renderer.toneMappingExposure = lerp(1.0, 1.15, smooth(0.1, 0.4, p))

    renderer.render(scene, camera)
  }
  tick()
  document.fonts?.ready.then(() => R.redraws.forEach((r) => r()))

  return {
    setProgress: (v) => { target = clamp01(v) },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m) => { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose() })
        }
      })
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
