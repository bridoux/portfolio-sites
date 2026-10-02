/** Contact form model: validation, delivery and a mailto fallback. Framework-free so it can be unit tested. */
export interface Inquiry {
  name: string
  email: string
  company: string
  service: string
  budget: string
  message: string
  /** Honeypot: hidden from people, filled in by bots */
  website: string
}

export type InquiryErrors = Partial<Record<keyof Inquiry, string>>

export const EMPTY_INQUIRY: Inquiry = { name: '', email: '', company: '', service: '', budget: '', message: '', website: '' }

export const LIMITS = { name: 120, email: 200, company: 160, message: 4000, minMessage: 10 }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateInquiry(i: Inquiry): InquiryErrors {
  const errors: InquiryErrors = {}
  const name = i.name.trim()
  const email = i.email.trim()
  const message = i.message.trim()
  if (!name) errors.name = 'Please tell me your name.'
  else if (name.length > LIMITS.name) errors.name = 'That name is a little long.'
  if (!email) errors.email = 'I need an email to reply to.'
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'That email doesn’t look right.'
  if (i.company.trim().length > LIMITS.company) errors.company = 'Please shorten this.'
  if (message.length < LIMITS.minMessage) errors.message = 'A sentence or two about the project, please.'
  else if (message.length > LIMITS.message) errors.message = `Please keep it under ${LIMITS.message} characters.`
  return errors
}

export const isSpam = (i: Inquiry) => i.website.trim() !== ''

/** Trimmed copy without the honeypot, ready to send. */
export function cleanInquiry(i: Inquiry) {
  return {
    name: i.name.trim(), email: i.email.trim(), company: i.company.trim(),
    service: i.service, budget: i.budget, message: i.message.trim(),
  }
}

/** Opens the visitor's mail app with the inquiry prefilled; used when no form endpoint is configured. */
export function mailtoHref(i: Inquiry, to: string): string {
  const c = cleanInquiry(i)
  const subject = `Project inquiry${c.service ? ` · ${c.service}` : ''} — ${c.name}`
  const details = [
    `Name: ${c.name}`, `Email: ${c.email}`,
    c.company && `Company / site: ${c.company}`,
    c.service && `Package: ${c.service}`,
    c.budget && `Budget: ${c.budget}`,
  ].filter(Boolean).join('\n')
  const body = `${c.message}\n\n${details}`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * POSTs the inquiry as JSON to a form service (Formspree, Web3Forms, Getform…).
 * Throws with a user-facing message on failure.
 */
export async function sendInquiry(i: Inquiry, endpoint: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  let res: Response
  try {
    res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cleanInquiry(i)),
    })
  } catch {
    throw new Error('Couldn’t reach the server. Check your connection and try again.')
  }
  if (!res.ok) throw new Error('Something went wrong sending your message. Please try again, or email me directly.')
}
