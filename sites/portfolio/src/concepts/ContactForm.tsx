import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { OWNER } from '../data/projects'
import { PACKAGES } from '../data/services'
import { EMPTY_INQUIRY, LIMITS, isSpam, mailtoHref, sendInquiry, validateInquiry, type Inquiry, type InquiryErrors } from '../lib/contact'

const BUDGETS = ['Under $2k', '$2k–5k', '$5k–10k', '$10k+']
const SERVICES = [...PACKAGES.map((p) => p.name), 'Not sure yet']

type Status = { kind: 'idle' | 'sending' | 'sent' | 'mailto' } | { kind: 'error'; message: string }

function Choice({ name, options, value, onChange, label }: { name: keyof Inquiry; options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <fieldset className="ca-choice">
      <legend>{label}</legend>
      {options.map((o) => (
        <label key={o} className={value === o ? 'is-on' : ''}>
          <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} />
          {o}
        </label>
      ))}
    </fieldset>
  )
}

export default function ContactForm({ preset }: { preset: string }) {
  const [form, setForm] = useState<Inquiry>(EMPTY_INQUIRY)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  // A package's "Start a…" button preselects it here
  useEffect(() => { if (preset) setForm((f) => ({ ...f, service: preset })) }, [preset])

  const set = (key: keyof Inquiry) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const onInput = (key: keyof Inquiry) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key)(e.target.value)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validateInquiry(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`cf-${Object.keys(found)[0]}`)?.focus()
      return
    }
    if (isSpam(form)) { setStatus({ kind: 'sent' }); return } // pretend success; never deliver
    if (!OWNER.contactEndpoint) {
      window.location.href = mailtoHref(form, OWNER.email)
      setStatus({ kind: 'mailto' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      await sendInquiry(form, OWNER.contactEndpoint)
      setStatus({ kind: 'sent' })
      setForm(EMPTY_INQUIRY)
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  const field = (key: 'name' | 'email' | 'company', label: string, type = 'text', autoComplete?: string) => (
    <div className={`ca-field ${errors[key] ? 'has-error' : ''}`}>
      <label htmlFor={`cf-${key}`}>{label}</label>
      <input id={`cf-${key}`} type={type} value={form[key]} onChange={onInput(key)} autoComplete={autoComplete}
        maxLength={LIMITS[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `cf-${key}-err` : undefined} />
      {errors[key] && <span className="ca-field__err" id={`cf-${key}-err`}>{errors[key]}</span>}
    </div>
  )

  if (status.kind === 'sent') {
    return (
      <div className="ca-form ca-form--done" role="status">
        <p className="ca-form__big">Thank you<em>.</em></p>
        <p>Your message is in. I reply to every inquiry within one working day.</p>
        <button type="button" className="ca-link" onClick={() => setStatus({ kind: 'idle' })}>Send another</button>
      </div>
    )
  }

  return (
    <form className="ca-form" onSubmit={submit} noValidate>
      <div className="ca-form__row">
        {field('name', 'Your name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
      </div>
      {field('company', 'Company or current website (optional)', 'text', 'organization')}
      <Choice name="service" label="What do you need?" options={SERVICES} value={form.service} onChange={set('service')} />
      <Choice name="budget" label="Budget" options={BUDGETS} value={form.budget} onChange={set('budget')} />
      <div className={`ca-field ${errors.message ? 'has-error' : ''}`}>
        <label htmlFor="cf-message">About the project</label>
        <textarea id="cf-message" rows={4} value={form.message} onChange={onInput('message')} maxLength={LIMITS.message}
          placeholder="What are you launching, who is it for, and when do you need it?"
          aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined} />
        {errors.message && <span className="ca-field__err" id="cf-message-err">{errors.message}</span>}
      </div>
      <div className="ca-hp" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={onInput('website')} />
      </div>
      <div className="ca-form__foot">
        <button type="submit" className="ca-submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Send inquiry'} <span aria-hidden="true">→</span>
        </button>
        <p className="ca-form__note" role="status" aria-live="polite">
          {status.kind === 'error' && <span className="ca-form__error">{status.message}</span>}
          {status.kind === 'mailto' && <>Your mail app should open with the message ready. If not, write to <a href={`mailto:${OWNER.email}`}>{OWNER.email}</a>.</>}
          {(status.kind === 'idle' || status.kind === 'sending') && 'Reply within one working day. No spam, ever.'}
        </p>
      </div>
    </form>
  )
}
