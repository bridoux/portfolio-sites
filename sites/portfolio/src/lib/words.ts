/** Copy helpers so headlines and labels scale with the number of projects. */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** 5 → "five", 42 → "forty-two"; 100+ falls back to digits. */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n >= 100) return String(n)
  if (n < 20) return ONES[n]
  const t = TENS[Math.floor(n / 10)]
  return n % 10 ? `${t}-${ONES[n % 10]}` : t
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "one world" / "five worlds" */
export const counted = (n: number, singular: string, plural = `${singular}s`) => `${numberWord(n)} ${n === 1 ? singular : plural}`

/** 1 → "I", 14 → "XIV" */
export function toRoman(n: number): string {
  const map: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''
  let rest = Math.max(1, Math.floor(n))
  for (const [v, s] of map) while (rest >= v) { out += s; rest -= v }
  return out
}

/**
 * Human list that stays short: ["a", "b", "c"] → "a, b and c";
 * long lists are summarised: "a, b, c, d and 8 more".
 */
export function listPhrase(items: string[], max = 5): string {
  const unique = [...new Set(items)]
  if (unique.length <= 1) return unique[0] ?? ''
  if (unique.length <= max) return `${unique.slice(0, -1).join(', ')} and ${unique[unique.length - 1]}`
  return `${unique.slice(0, max - 1).join(', ')} and ${unique.length - (max - 1)} more`
}

/** Round a stat down for display: 53 → "50+", 7 → "07". */
export function statLabel(n: number): string {
  if (n >= 20) return `${Math.floor(n / 10) * 10}+`
  return String(n).padStart(2, '0')
}
