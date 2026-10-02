/**
 * Portfolio owner. hello@ericbridoux.com is forwarded by Namecheap email forwarding.
 * `booking` is a scheduling link (Cal.com, Calendly); the "Book a call" buttons hide while it is empty.
 * The contact form posts to VITE_CONTACT_ENDPOINT (e.g. a Formspree form URL) when set,
 * and falls back to opening the visitor's mail app.
 */
export const OWNER = {
  name: 'Eric Bridoux',
  role: 'Designer & creative technologist',
  email: 'hello@ericbridoux.com',
  booking: '',
  location: 'Worldwide',
  contactEndpoint: (import.meta.env?.VITE_CONTACT_ENDPOINT as string | undefined) ?? '',
}

export interface Project {
  /** URL slug: /work/<id> */
  id: string
  name: string
  /** Short noun phrase used in generated copy, e.g. "a watchmaker" */
  noun: string
  kind: string
  tagline: string
  summary: string
  year: string
  /** Public URL of the live site */
  url: string
  /** Local dev server, used by tools/capture.mjs; falls back to `url` */
  devUrl?: string
  hero: string
  detail: string
  medium: string[]
  signature: string
  palette: { bg: string; fg: string; accent: string }
  /** Case-study content */
  scope: string[]
  challenge: string
  approach: { title: string; body: string }[]
  /** Filter chips on the index; keep to a small shared vocabulary (see TAGS) */
  tags: string[]
  /** Generated images used in the site (feeds the stats) */
  images: number
  /** How tools/capture.mjs screenshots the site: scroll target and the fraction for the detail frame */
  capture?: { selector: string; detail: number }
}

const ENTRIES: Project[] = [
  {
    id: 'aurele', name: 'Aurèle', kind: 'Swiss haute horlogerie',
    noun: 'a watchmaker',
    tagline: 'A skeleton chronograph, dissected by scroll.',
    summary: 'A maison in the Vallée de Joux. Photographic layers of a titanium chronograph lift apart in 3D, one chapter per component, then reassemble.',
    year: '2026', url: 'https://aurele-horlogerie.vercel.app', devUrl: 'http://localhost:5101',
    hero: '/shots/aurele-hero.webp', detail: '/shots/aurele-detail.webp',
    medium: ['React', 'CSS 3D', 'GSAP', 'Generated photography'],
    signature: 'Scroll-driven 3D dissection',
    palette: { bg: '#141311', fg: '#efe9df', accent: '#c8a66b' },
    scope: ["Brand & naming","Art direction","Generated photography","Web design","Front-end"],
    challenge: "Luxury watch sites usually show a product shot and a price. The brief was to make the craftsmanship itself the hero, and to show 347 hidden parts without resorting to an obviously CG render.",
    approach: [{"title":"A photograph that comes apart","body":"A front-view photo of the watch was cut into layers: straps, case and bezel. Every internal part (skeleton dial, hands, movement, rotor, caseback) was then generated to match it and stacked in CSS 3D."},{"title":"Chapters that peel away","body":"Each scroll chapter lifts one layer away and fades the ones in front of it, so the dial, the movement and the rotor each get an uninterrupted close-up."},{"title":"An editorial rhythm","body":"Bone-paper and dark sections alternate and overlap like curtains. Bronze accents sit on light sections and champagne on dark, matched to the titanium hero."}],
    tags: ["Scroll 3D","Luxury"],
    images: 18,
    capture: {"selector":".scroller","detail":0.57},
  },
  {
    id: 'ember', name: 'Ember & Stack', kind: 'Smash-burger restaurant',
    noun: 'a burger joint',
    tagline: 'A double smash that takes itself apart.',
    summary: 'An Austin burger joint. The hero burger splits into photographed ingredients, one caption each, and restacks. Includes a working menu, bag and checkout.',
    year: '2026', url: 'https://ember-and-stack.vercel.app', devUrl: 'http://localhost:5102',
    hero: '/shots/ember-hero.webp', detail: '/shots/ember-detail.webp',
    medium: ['React', 'GSAP', 'Canvas embers', 'Cart state'],
    signature: 'Ingredient-by-ingredient scroll',
    palette: { bg: '#1c110c', fg: '#f6ecd9', accent: '#ff4d17' },
    scope: ["Brand & menu","Food photography (generated)","Web design","Front-end","Commerce flow"],
    challenge: "Restaurant sites tend to be menus with a map. Ember & Stack needed to feel as loud and hot as the griddle, and the food had to look good enough to eat.",
    approach: [{"title":"Ingredient by ingredient","body":"The hero burger is a real photograph. As you scroll it dissolves into individually photographed ingredients, which float apart, get one caption each and then restack with a bounce."},{"title":"A working bag","body":"The menu tabs, add-to-bag, quantity steppers, tax, pickup location and order confirmation are all real state, not a mockup."},{"title":"Live opening hours","body":"Each location shows Open or Closed based on the visitor's clock, including late-night hours that run past midnight."}],
    tags: ["Scroll 3D","Commerce","Food & drink"],
    images: 15,
    capture: {"selector":".stack","detail":0.45},
  },
  {
    id: 'kestrel', name: 'Kestrel Orbital', kind: 'Private spaceflight',
    noun: 'a space line',
    tagline: 'Pad to orbit in one long scroll.',
    summary: 'A space-tourism company. A real-time Three.js rocket lifts off, sheds its booster and fairing, and opens into an exploded capsule with live telemetry, then reaches orbit.',
    year: '2026', url: 'https://kestrel-orbital.vercel.app', devUrl: 'http://localhost:5103',
    hero: '/shots/kestrel-hero.webp', detail: '/shots/kestrel-detail.webp',
    medium: ['React', 'Three.js', 'GSAP', 'Seat-map booking'],
    signature: 'Real-time 3D launch sequence',
    palette: { bg: '#0b1020', fg: '#efe9df', accent: '#ff6b2c' },
    scope: ["Brand & naming","3D art direction","Web design","Front-end","Booking UX"],
    challenge: "Selling a seat to orbit means selling a feeling nobody has had. The site had to deliver the launch rather than just describe it.",
    approach: [{"title":"A launch in real time","body":"A Three.js rocket lifts off the pad through smoke. The booster separates, the fairing splits and the capsule opens into an exploded view while live telemetry counts up. It ends in orbit over the Earth."},{"title":"Pick your window","body":"The reservation flow uses a top-down seat map of the capsule, with taken seats, mission switching, a deposit calculation and a generated boarding pass."},{"title":"A countdown that is real","body":"The next-launch timer always counts down to the coming Thursday at 06:42, so it never goes stale."}],
    tags: ["Scroll 3D","WebGL","Booking"],
    images: 6,
    capture: {"selector":".launch","detail":0.58},
  },
  {
    id: 'togen', name: 'Tōgen', kind: 'Kyoto tea house',
    noun: 'a tea house',
    tagline: 'Tea, clay, and the space between.',
    summary: 'A tea house and ceramics atelier. Washi textures, vertical type, a brushed ensō reveal, a pinned horizontal gallery of seasonal teas and a ceremony booking flow.',
    year: '2026', url: 'https://togen-tea-house.vercel.app', devUrl: 'http://localhost:5104',
    hero: '/shots/togen-hero.webp', detail: '/shots/togen-detail.webp',
    medium: ['React', 'GSAP ScrollTrigger', 'SVG', 'Editorial type'],
    signature: 'Japanese editorial layout',
    palette: { bg: '#ebe4d6', fg: '#1f1c18', accent: '#b8432f' },
    scope: ["Brand & copy","Editorial design","Generated photography","Front-end"],
    challenge: "A Kyoto tea house should feel quiet, which is the opposite of most scroll-heavy sites. The goal was a slow, tactile experience with no 3D at all.",
    approach: [{"title":"Paper, ink and a brushstroke","body":"Washi texture, vertical Japanese type, a hanko seal and an ensō circle that draws itself on load before revealing the tea room inside it."},{"title":"Four seasons, sideways","body":"A pinned horizontal gallery gives each seasonal tea its own colour, brewing notes and a giant kanji that drifts past in parallax."},{"title":"A calm booking flow","body":"Pick a day (the house is closed on Wednesdays), a session and a number of guests, and receive a formal invitation."}],
    tags: ["Editorial","Booking","Food & drink"],
    images: 6,
    capture: {"selector":"doc","detail":0.26},
  },
  {
    id: 'subsoniq', name: 'SUBSONIQ', kind: 'Techno festival',
    noun: 'a festival',
    tagline: 'Three nights in a power station.',
    summary: 'A brutalist festival in a decommissioned power station. A variable-font wordmark that follows the cursor, a filterable lineup, a starred timetable and ticket checkout.',
    year: '2027', url: 'https://subsoniq-festival.vercel.app', devUrl: 'http://localhost:5105',
    hero: '/shots/subsoniq-hero.webp', detail: '/shots/subsoniq-detail.webp',
    medium: ['React', 'Variable fonts', 'GSAP', 'Local storage'],
    signature: 'Neo-brutalist, variable type',
    palette: { bg: '#d7ff1e', fg: '#0a0a0a', accent: '#ff3b1f' },
    scope: ["Brand & identity","Type system","Web design","Front-end","Ticketing UX"],
    challenge: "Festival sites are usually a poster and a ticket link. SUBSONIQ needed the raw energy of a warehouse rave with the usability of a transit timetable.",
    approach: [{"title":"Type that moves with you","body":"The wordmark is set in a variable font whose width and weight follow the cursor letter by letter, so the logo reacts to the visitor."},{"title":"A planner, not a poster","body":"A day-filterable lineup with hover portraits and a four-stage timetable where you star sets. Your plan is saved in the browser."},{"title":"Tickets with a pulse","body":"Tiers show a stock meter, quantities and fees, and checkout issues a unique scannable-style ticket."}],
    tags: ["Editorial","Commerce"],
    images: 8,
    capture: {"selector":"doc","detail":0.33},
  },
]

/**
 * Dev-only stress test: /?stress=24 pads the list with clones so layouts can be
 * checked with many projects. Ignored in production builds.
 */
function withStress(list: Project[]): Project[] {
  const dev = typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV
  if (!dev || typeof window === 'undefined') return list
  const fromUrl = new URLSearchParams(window.location.search).get('stress')
  const n = Number(fromUrl ?? sessionStorageGet('stress'))
  if (!Number.isFinite(n) || n <= list.length) {
    if (fromUrl !== null) { try { sessionStorage.removeItem('stress') } catch { /* ignore */ } } // ?stress=0 turns it off
    return list
  }
  try { sessionStorage.setItem('stress', String(n)) } catch { /* ignore */ }
  return Array.from({ length: Math.min(n, 60) }, (_, k) => {
    const base = list[k % list.length]
    return k < list.length ? base : { ...base, id: `${base.id}-${k}`, name: `${base.name} ${Math.floor(k / list.length) + 1}` }
  })
}
function sessionStorageGet(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}

export const PROJECTS: Project[] = withStress(ENTRIES)

/** Shared tag vocabulary, in display order (only tags in use are shown). */
export const TAGS = ['Scroll 3D', 'WebGL', 'Editorial', 'Commerce', 'Booking', 'Luxury', 'Food & drink']
export const tagsInUse = () => TAGS.filter((t) => PROJECTS.some((p) => p.tags.includes(t)))

/** Zero-padded running number, derived from order: 1 → "01", 120 → "120". */
export const projectNumber = (i: number) => String(i + 1).padStart(2, '0')

/** Aggregate stats, all derived from the list. */
export const STATS = {
  get sites() { return PROJECTS.length },
  get scroll3d() { return PROJECTS.filter((p) => p.tags.includes('Scroll 3D')).length },
  get flows() { return PROJECTS.filter((p) => p.tags.some((t) => t === 'Commerce' || t === 'Booking')).length },
  get images() { return PROJECTS.reduce((n, p) => n + p.images, 0) },
}
