// Unit tests for the portfolio contact form logic. Run: node --test tools/contact.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EMPTY_INQUIRY, LIMITS, cleanInquiry, isSpam, mailtoHref, sendInquiry, validateInquiry } from '../sites/portfolio/src/lib/contact.ts'

const valid = { ...EMPTY_INQUIRY, name: ' Ada ', email: 'ada@studio.com ', message: 'We need a site for our new café.' }

test('accepts a complete inquiry', () => {
  assert.deepEqual(validateInquiry(valid), {})
})

test('requires name, email and a real message', () => {
  const errors = validateInquiry(EMPTY_INQUIRY)
  assert.ok(errors.name && errors.email && errors.message)
  assert.ok(validateInquiry({ ...valid, message: 'hi' }).message)
})

test('rejects malformed emails', () => {
  for (const email of ['ada', 'ada@', 'ada@studio', 'a da@studio.com', '@studio.com']) {
    assert.ok(validateInquiry({ ...valid, email }).email, email)
  }
})

test('enforces length limits', () => {
  assert.ok(validateInquiry({ ...valid, name: 'x'.repeat(LIMITS.name + 1) }).name)
  assert.ok(validateInquiry({ ...valid, message: 'x'.repeat(LIMITS.message + 1) }).message)
  assert.ok(validateInquiry({ ...valid, company: 'x'.repeat(LIMITS.company + 1) }).company)
})

test('flags the honeypot as spam', () => {
  assert.equal(isSpam(valid), false)
  assert.equal(isSpam({ ...valid, website: 'http://spam.example' }), true)
})

test('cleanInquiry trims and drops the honeypot', () => {
  const c = cleanInquiry({ ...valid, website: 'bot' })
  assert.equal(c.name, 'Ada')
  assert.equal(c.email, 'ada@studio.com')
  assert.equal('website' in c, false)
})

test('mailtoHref encodes subject and body', () => {
  const href = mailtoHref({ ...valid, service: 'Launch page', budget: '$1–3k' }, 'me@example.com')
  assert.ok(href.startsWith('mailto:me@example.com?subject='))
  const url = new URL(href)
  assert.equal(url.searchParams.get('subject'), 'Project inquiry · Launch page — Ada')
  const body = url.searchParams.get('body')
  assert.ok(body.startsWith('We need a site for our new café.\n\nName: Ada'))
  assert.ok(body.includes('Budget: $1–3k'))
  assert.ok(!body.includes('Company'))
})

test('sendInquiry posts JSON and resolves on success', async () => {
  let call
  const fake = async (url, init) => { call = { url, init }; return new Response('{}', { status: 200 }) }
  await sendInquiry(valid, 'https://forms.example/f/abc', fake)
  assert.equal(call.url, 'https://forms.example/f/abc')
  assert.equal(call.init.method, 'POST')
  assert.equal(JSON.parse(call.init.body).name, 'Ada')
})

test('sendInquiry throws a friendly error on HTTP failure', async () => {
  const fake = async () => new Response('nope', { status: 422 })
  await assert.rejects(sendInquiry(valid, 'https://forms.example', fake), /Something went wrong/)
})

test('sendInquiry throws a friendly error when offline', async () => {
  const fake = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(sendInquiry(valid, 'https://forms.example', fake), /Couldn’t reach the server/)
})
