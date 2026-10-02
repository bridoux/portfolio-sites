/** Fixed-price packages shown in the Services section. Prices are starting points, in USD. */
export interface ServicePackage {
  id: string
  name: string
  /** Starting price, whole dollars */
  from: number
  delivery: string
  pitch: string
  includes: string[]
  /** Concept project that shows this kind of build (Project.id) */
  example: string
}

export const PACKAGES: ServicePackage[] = [
  {
    id: 'launch', name: 'Launch page', from: 1200, delivery: '5–7 days',
    pitch: 'One page that makes a first impression worth sharing. For launches, events and new ventures.',
    includes: ['Art direction & copy', 'Custom type and motion', 'Generated imagery', 'Mobile-first build', 'Hosting setup'],
    example: 'subsoniq',
  },
  {
    id: 'business', name: 'Business site', from: 2800, delivery: '2 weeks',
    pitch: 'Four to six pages with real features: menus, booking, contact. For restaurants, studios and shops.',
    includes: ['Everything in Launch', 'Up to 6 pages', 'Booking or order flow', 'Basic SEO', 'Two revision rounds'],
    example: 'togen',
  },
  {
    id: 'signature', name: 'Signature product story', from: 5500, delivery: '2–3 weeks',
    pitch: 'A scroll-driven 3D reveal of your product, built to stop the scroll and sell the craft.',
    includes: ['Everything in Business', 'Scroll-driven 3D scene', 'Product layer art', 'Performance tuning', 'Launch support'],
    example: 'aurele',
  },
]

export const CARE_PLAN = { from: 120, includes: 'hosting, updates and small edits each month' }

/** Shared formatting, e.g. 2800 → "$2,800". */
export const usd = (n: number) => `$${n.toLocaleString('en-US')}`
