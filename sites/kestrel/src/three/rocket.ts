import * as THREE from 'three'
import { flameTexture, hullTexture, shieldTexture, solarTexture } from './textures'

const TAU = Math.PI * 2
const R = 0.52

export interface RocketParts {
  booster: THREE.Group
  boosterFlame: THREE.Group
  interstage: THREE.Mesh
  stage2: THREE.Group
  stage2Flame: THREE.Group
  fairingL: THREE.Mesh
  fairingR: THREE.Mesh
  capsule: CapsuleParts
  redraws: (() => void)[]
}

export interface CapsuleParts {
  root: THREE.Group
  trunk: THREE.Group
  panels: THREE.Group[]
  shield: THREE.Mesh
  module: THREE.Mesh
  windows: THREE.Mesh
  nose: THREE.Group
}

const white = (map?: THREE.Texture) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, map, roughness: 0.38, metalness: 0.05, clearcoat: 0.4 })
const dark = new THREE.MeshPhysicalMaterial({ color: 0x15171c, roughness: 0.5, metalness: 0.3 })
const steel = new THREE.MeshPhysicalMaterial({ color: 0x9aa1ab, roughness: 0.3, metalness: 1 })
const copper = new THREE.MeshPhysicalMaterial({ color: 0xb8683c, roughness: 0.35, metalness: 1, side: THREE.DoubleSide })

function flame(length: number, radius: number): THREE.Group {
  const map = flameTexture()
  const g = new THREE.Group()
  const outer = new THREE.Mesh(
    new THREE.ConeGeometry(radius, length, 32, 1, true),
    new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, color: 0xff8a3a }),
  )
  outer.rotation.x = Math.PI
  outer.position.y = -length / 2
  const inner = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.45, length * 0.55, 24, 1, true),
    new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, color: 0xfff1d6 }),
  )
  inner.rotation.x = Math.PI
  inner.position.y = -length * 0.275
  const light = new THREE.PointLight(0xff8a3a, 30, 14, 1.6)
  light.position.y = -0.8
  g.add(outer, inner, light)
  return g
}

function nozzle(r0: number, r1: number, h: number, mat: THREE.Material) {
  const g = new THREE.CylinderGeometry(r0, r1, h, 32, 1, true)
  return new THREE.Mesh(g, mat)
}

export function buildRocket(): RocketParts {
  const redraws: (() => void)[] = []

  // ── Stage 1 booster: y 0 → 5.2 ──────────────────────────────────────────
  const booster = new THREE.Group()
  const bHull = hullTexture({ band: true, wordmark: true, soot: 0.55 })
  redraws.push(bHull.redraw)
  const bBody = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 5.2, 64, 1, true), white(bHull.texture))
  bBody.position.y = 2.6
  booster.add(bBody)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.02, 0.12, 64), dark)
  base.position.y = 0.06
  booster.add(base)
  // Nine engine bells
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * TAU
    const rr = i === 8 ? 0 : 0.3
    const bell = nozzle(0.06, 0.13, 0.32, copper)
    bell.position.set(Math.cos(a) * rr, -0.16, Math.sin(a) * rr)
    booster.add(bell)
  }
  // Landing legs (folded) and grid fins
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.06), dark)
    leg.position.set(Math.cos(a) * (R + 0.03), 0.9, Math.sin(a) * (R + 0.03))
    leg.rotation.y = -a
    booster.add(leg)
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.03), steel)
    fin.position.set(Math.cos(a) * (R + 0.17), 4.9, Math.sin(a) * (R + 0.17))
    fin.rotation.y = -a + Math.PI / 2
    booster.add(fin)
  }
  const boosterFlame = flame(5.2, 0.72)
  booster.add(boosterFlame)

  // ── Interstage: 5.2 → 5.8 ──────────────────────────────────────────────
  const interstage = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.6, 64), dark)
  interstage.position.y = 5.5

  // ── Stage 2: 5.8 → 7.7 ─────────────────────────────────────────────────
  const stage2 = new THREE.Group()
  const s2Hull = hullTexture({})
  const s2Body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.9, 64, 1, true), white(s2Hull.texture))
  s2Body.position.y = 0.95
  const mvac = nozzle(0.1, 0.36, 0.7, copper)
  mvac.position.y = -0.35
  stage2.add(s2Body, mvac)
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.04, 64), steel)
  cap.position.y = 1.9
  stage2.add(cap)
  const stage2Flame = flame(2.6, 0.4)
  stage2Flame.position.y = -0.7
  stage2.add(stage2Flame)
  stage2.position.y = 5.8

  // ── Fairing halves: 7.7 → 10.4, an ogive split down the middle ─────────
  const ogive: THREE.Vector2[] = []
  for (let i = 0; i <= 30; i++) {
    const t = i / 30
    const y = t * 2.7
    const r = t < 0.35 ? R + 0.08 : (R + 0.08) * Math.sqrt(1 - Math.pow((t - 0.35) / 0.65, 2))
    ogive.push(new THREE.Vector2(Math.max(r, 0.001), y))
  }
  const fairingMat = white(hullTexture({}).texture)
  fairingMat.side = THREE.DoubleSide
  const fairingL = new THREE.Mesh(new THREE.LatheGeometry(ogive, 48, 0, Math.PI), fairingMat)
  const fairingR = new THREE.Mesh(new THREE.LatheGeometry(ogive, 48, Math.PI, Math.PI), fairingMat)
  fairingL.position.y = fairingR.position.y = 7.7

  const capsule = buildCapsule()
  capsule.root.position.y = 7.78

  return { booster, boosterFlame, interstage, stage2, stage2Flame, fairingL, fairingR, capsule, redraws }
}

export function buildCapsule(): CapsuleParts {
  const root = new THREE.Group()
  const hull = white()
  hull.color.set('#f4f1ea')

  // Service trunk with folded solar wings
  const trunk = new THREE.Group()
  const trunkBody = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.6, 48), hull)
  trunkBody.position.y = 0.3
  trunk.add(trunkBody)
  const radiator = new THREE.Mesh(new THREE.CylinderGeometry(0.465, 0.505, 0.3, 48, 1, true), dark)
  radiator.position.y = 0.3
  trunk.add(radiator)
  const panels: THREE.Group[] = []
  const solarMat = new THREE.MeshPhysicalMaterial({ map: solarTexture(), roughness: 0.2, metalness: 0.6, clearcoat: 1, side: THREE.DoubleSide })
  for (const side of [-1, 1]) {
    const hinge = new THREE.Group()
    hinge.position.set(side * 0.5, 0.3, 0)
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.02), solarMat)
    wing.position.x = side * 0.8
    hinge.add(wing)
    hinge.userData.side = side
    trunk.add(hinge)
    panels.push(hinge)
  }
  root.add(trunk)

  // Heat shield
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.54, 0.09, 64), new THREE.MeshStandardMaterial({ map: shieldTexture(), roughness: 0.9 }))
  shield.position.y = 0.66
  root.add(shield)

  // Crew module (frustum) — base at local 0
  const profile = [[0.001, 0], [0.56, 0], [0.55, 0.05], [0.33, 0.78], [0.3, 0.8], [0.001, 0.8]].map(([x, y]) => new THREE.Vector2(x, y))
  const module = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), hull)
  module.position.y = 0.71
  root.add(module)

  // Panorama window band, slightly proud of the hull
  const windows = new THREE.Mesh(
    new THREE.CylinderGeometry(0.405, 0.475, 0.22, 64, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0x0b1830, roughness: 0.05, metalness: 0.2, clearcoat: 1, envMapIntensity: 2, side: THREE.DoubleSide }),
  )
  windows.position.y = 0.71 + 0.3
  root.add(windows)

  // Nose / docking adapter
  const nose = new THREE.Group()
  const adapter = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.2, 40), steel)
  adapter.position.y = 0.1
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 12, 40), new THREE.MeshStandardMaterial({ color: '#ff6b2c', roughness: 0.4 }))
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.21
  nose.add(adapter, ring)
  nose.position.y = 0.71 + 0.8
  root.add(nose)

  return { root, trunk, panels, shield, module, windows, nose }
}
