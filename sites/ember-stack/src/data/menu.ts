export type Category = 'burgers' | 'sides' | 'shakes'

export interface MenuItem {
  id: string
  category: Category
  name: string
  description: string
  price: number
  tags?: string[]
}

export const CATEGORIES: { id: Category; label: string; image: string; blurb: string }[] = [
  { id: 'burgers', label: 'Burgers', image: '/img/burger.webp', blurb: 'Dry-aged, smashed to order. Never frozen, never pre-formed.' },
  { id: 'sides', label: 'Sides', image: '/img/fries.webp', blurb: 'Hand-cut daily, fried twice in beef tallow.' },
  { id: 'shakes', label: 'Shakes', image: '/img/shake.webp', blurb: 'Frozen custard spun thick enough to stand a straw in.' },
]

export const MENU: MenuItem[] = [
  { id: 'ember-double', category: 'burgers', name: 'The Ember Double', description: 'Two smashed patties, American, pickles, shaved onion, Ember sauce, potato brioche.', price: 14, tags: ['Signature'] },
  { id: 'single-flame', category: 'burgers', name: 'Single Flame', description: 'One patty, one slice, all the crust. The minimalist’s smash.', price: 10 },
  { id: 'hellfire', category: 'burgers', name: 'Hellfire Triple', description: 'Three patties, ghost-pepper jack, charred jalapeño relish, hot honey.', price: 18, tags: ['Spicy'] },
  { id: 'smokestack', category: 'burgers', name: 'Smokestack', description: 'Double, smoked bacon jam, cheddar, crispy shallots, bourbon BBQ.', price: 16 },
  { id: 'garden', category: 'burgers', name: 'Garden Smash', description: 'Smashed mushroom-black bean patty, Swiss, caramelized onion, herb mayo.', price: 13, tags: ['Veg'] },
  { id: 'tallow-fries', category: 'sides', name: 'Tallow Fries', description: 'Hand-cut Kennebecs, rosemary salt, chipotle aioli.', price: 6 },
  { id: 'rings', category: 'sides', name: 'Onion Rings', description: 'Buttermilk-soaked, beer batter, comeback sauce.', price: 7 },
  { id: 'loaded', category: 'sides', name: 'Ember Loaded Fries', description: 'Fries, chopped smash patty, cheese sauce, pickled chilies.', price: 11, tags: ['Spicy'] },
  { id: 'burnt-caramel', category: 'shakes', name: 'Burnt Caramel', description: 'Salted caramel custard, torched sugar crunch.', price: 8, tags: ['Signature'] },
  { id: 'black-vanilla', category: 'shakes', name: 'Black Vanilla', description: 'Madagascar vanilla, activated charcoal, cocoa nib.', price: 8 },
  { id: 'strawberry-smoke', category: 'shakes', name: 'Strawberry Smoke', description: 'Roasted strawberries, smoked sea salt, graham.', price: 8 },
]

export const LOCATIONS = [
  { name: 'East Sixth', address: '1108 E 6th St, Austin TX', hours: [[11, 23], [11, 23], [11, 23], [11, 23], [11, 26], [11, 26], [11, 22]] as [number, number][] },
  { name: 'South Congress', address: '2420 S Congress Ave, Austin TX', hours: [[11, 22], [11, 22], [11, 22], [11, 22], [11, 24], [10, 24], [10, 22]] as [number, number][] },
  { name: 'The Domain', address: '11601 Rock Rose Ave, Austin TX', hours: [[11, 21], [11, 21], [11, 21], [11, 21], [11, 22], [11, 22], [12, 20]] as [number, number][] },
]
