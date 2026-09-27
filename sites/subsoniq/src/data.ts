export type Day = 'fri' | 'sat' | 'sun'
export type Stage = 'Turbine Hall' | 'Cooling Tower' | 'Switchyard' | 'Bunker'

export const DAYS: { id: Day; label: string; date: string }[] = [
  { id: 'fri', label: 'Fri', date: '23.07' },
  { id: 'sat', label: 'Sat', date: '24.07' },
  { id: 'sun', label: 'Sun', date: '25.07' },
]

export const STAGES: { name: Stage; capacity: string; sound: string }[] = [
  { name: 'Turbine Hall', capacity: '8,000', sound: 'Void Incubus array · 180 kW' },
  { name: 'Cooling Tower', capacity: '3,500', sound: '360° ring · 64 m acoustic chimney' },
  { name: 'Switchyard', capacity: '5,000', sound: 'Open air · Funktion-One' },
  { name: 'Bunker', capacity: '600', sound: 'Concrete box · no phones' },
]

export interface Artist { name: string; day: Day; tier: 1 | 2 | 3; img?: string; from: string }

export const ARTISTS: Artist[] = [
  { name: 'Kaiju Mother', day: 'fri', tier: 1, img: '/img/a1.webp', from: 'Berlin' },
  { name: 'Nōra Vex', day: 'sat', tier: 1, img: '/img/a2.webp', from: 'Lagos / London' },
  { name: 'Obsidian Choir', day: 'sun', tier: 1, img: '/img/a3.webp', from: 'Tbilisi' },
  { name: 'Halogen Twins', day: 'sat', tier: 1, img: '/img/a4.webp', from: 'Detroit' },
  { name: 'Petra Lux', day: 'fri', tier: 2, img: '/img/booth.webp', from: 'Kyiv' },
  { name: 'Teeth of Glass', day: 'fri', tier: 2, img: '/img/dancer.webp', from: 'Glasgow' },
  { name: 'Slowburn', day: 'sat', tier: 2, img: '/img/booth.webp', from: 'Rotterdam' },
  { name: 'Mira Okonkwo', day: 'sun', tier: 2, img: '/img/a2.webp', from: 'Johannesburg' },
  { name: 'Hex Culture', day: 'sun', tier: 2, img: '/img/dancer.webp', from: 'Bogotá' },
  { name: 'Ultravoid', day: 'sat', tier: 2, img: '/img/a3.webp', from: 'Seoul' },
  { name: 'Baritone Ghost', day: 'fri', tier: 3, from: 'Lisbon' },
  { name: 'Lune Automat', day: 'fri', tier: 3, from: 'Lyon' },
  { name: 'Carbon Dating', day: 'fri', tier: 3, from: 'Oslo' },
  { name: 'Wavetable Widow', day: 'sat', tier: 3, from: 'Mexico City' },
  { name: 'Sister Saturn', day: 'sat', tier: 3, from: 'Leeds' },
  { name: 'Low Orbit', day: 'sat', tier: 3, from: 'Antwerp' },
  { name: 'Grayscale Hymn', day: 'sun', tier: 3, from: 'Warsaw' },
  { name: 'Ada Kiln', day: 'sun', tier: 3, from: 'Dublin' },
  { name: 'Rust Parade', day: 'sun', tier: 3, from: 'Marseille' },
  { name: 'Neon Ascetic', day: 'fri', tier: 3, from: 'Taipei' },
  { name: 'Tidal Array', day: 'sat', tier: 3, from: 'Reykjavík' },
  { name: 'Oona Grid', day: 'sun', tier: 3, from: 'Helsinki' },
]

export interface SetSlot { id: string; artist: string; stage: Stage; day: Day; start: number; end: number }

/** Hours past 18:00 on the festival clock (0 = 18:00, 12 = 06:00). */
const S = (id: string, artist: string, stage: Stage, day: Day, start: number, end: number): SetSlot => ({ id, artist, stage, day, start, end })

export const SETS: SetSlot[] = [
  S('f1', 'Lune Automat', 'Turbine Hall', 'fri', 0, 2), S('f2', 'Petra Lux', 'Turbine Hall', 'fri', 2, 4.5), S('f3', 'Kaiju Mother', 'Turbine Hall', 'fri', 4.5, 7.5), S('f4', 'Carbon Dating', 'Turbine Hall', 'fri', 7.5, 10),
  S('f5', 'Neon Ascetic', 'Cooling Tower', 'fri', 1, 3.5), S('f6', 'Teeth of Glass', 'Cooling Tower', 'fri', 3.5, 6), S('f7', 'Baritone Ghost', 'Cooling Tower', 'fri', 6, 9),
  S('f8', 'Carbon Dating', 'Switchyard', 'fri', 0, 3), S('f9', 'Lune Automat', 'Switchyard', 'fri', 3, 5),
  S('f10', 'Baritone Ghost', 'Bunker', 'fri', 4, 12),
  S('s1', 'Tidal Array', 'Turbine Hall', 'sat', 0, 2), S('s2', 'Ultravoid', 'Turbine Hall', 'sat', 2, 4), S('s3', 'Nōra Vex', 'Turbine Hall', 'sat', 4, 6.5), S('s4', 'Halogen Twins', 'Turbine Hall', 'sat', 6.5, 9.5),
  S('s5', 'Sister Saturn', 'Cooling Tower', 'sat', 1, 3), S('s6', 'Slowburn', 'Cooling Tower', 'sat', 3, 6), S('s7', 'Low Orbit', 'Cooling Tower', 'sat', 6, 9),
  S('s8', 'Wavetable Widow', 'Switchyard', 'sat', 0, 2.5), S('s9', 'Low Orbit', 'Switchyard', 'sat', 2.5, 5),
  S('s10', 'Slowburn', 'Bunker', 'sat', 6, 12),
  S('u1', 'Oona Grid', 'Turbine Hall', 'sun', 0, 2), S('u2', 'Hex Culture', 'Turbine Hall', 'sun', 2, 4.5), S('u3', 'Obsidian Choir', 'Turbine Hall', 'sun', 4.5, 7.5),
  S('u4', 'Ada Kiln', 'Cooling Tower', 'sun', 1, 3.5), S('u5', 'Mira Okonkwo', 'Cooling Tower', 'sun', 3.5, 6.5), S('u6', 'Grayscale Hymn', 'Cooling Tower', 'sun', 6.5, 9),
  S('u7', 'Rust Parade', 'Switchyard', 'sun', 0, 3), S('u8', 'Ada Kiln', 'Switchyard', 'sun', 3, 5),
  S('u9', 'Grayscale Hymn', 'Bunker', 'sun', 3, 10),
]

export const TICKETS = [
  { id: 'day', name: 'Day Ticket', note: 'One day, all stages, any day', price: 89, sold: 0.62 },
  { id: 'weekend', name: 'Weekend', note: 'Fri–Sun, all stages, re-entry', price: 219, sold: 0.88 },
  { id: 'bunker', name: 'Bunker+', note: 'Weekend + guaranteed Bunker entry + locker', price: 329, sold: 0.97 },
] as const

export type TicketId = (typeof TICKETS)[number]['id']
