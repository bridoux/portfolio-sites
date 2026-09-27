import { MENU, type MenuItem } from '../data/menu'

export interface CartLine { item: MenuItem; qty: number }
export type CartState = CartLine[]
export type CartAction =
  | { type: 'add'; id: string }
  | { type: 'decrement'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

const MAX_QTY = 20

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const item = MENU.find((m) => m.id === action.id)
      if (!item) return state
      const existing = state.find((l) => l.item.id === action.id)
      if (existing) {
        return state.map((l) => (l.item.id === action.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l))
      }
      return [...state, { item, qty: 1 }]
    }
    case 'decrement':
      return state
        .map((l) => (l.item.id === action.id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    case 'remove':
      return state.filter((l) => l.item.id !== action.id)
    case 'clear':
      return []
  }
}

export const cartCount = (s: CartState) => s.reduce((n, l) => n + l.qty, 0)
export const cartSubtotal = (s: CartState) => s.reduce((n, l) => n + l.qty * l.item.price, 0)
export const money = (n: number) => `$${n.toFixed(2)}`

/** Whether a location is open, handling close times past midnight (e.g. 26 = 2 AM). */
export function isOpen(hours: [number, number][], now = new Date()): boolean {
  const day = (now.getDay() + 6) % 7
  const h = now.getHours() + now.getMinutes() / 60
  const [o, c] = hours[day]
  if (h >= o && h < c) return true
  const [, prevClose] = hours[(day + 6) % 7]
  return prevClose > 24 && h < prevClose - 24
}

export function fmtHour(h: number): string {
  const hh = h % 24
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const twelve = hh % 12 === 0 ? 12 : hh % 12
  return `${twelve}${suffix}`
}
