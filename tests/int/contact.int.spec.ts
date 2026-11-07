// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { randomUUID } from 'node:crypto'
import { receiveInquiry, type Inquiry, type InquiryStore } from '@/lib/contact'

const secret = 'test-only-not-a-production-secret-0000000000'
const fixture = () => ({ name: 'Test Person', email: 'TEST@example.invalid', company: '', message: 'Synthetic inquiry for isolated tests.', source: '/contact', consent: true, website: '', submissionId: randomUUID() })
const request = (value: unknown, headers: Record<string,string> = {}) => new Request('https://new.example/api/contact', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(value),
})
function memory() {
  const records = new Map<string, Inquiry>()
  const db: InquiryStore = {
    find: async id => records.get(id),
    countRecent: async () => records.size,
    create: async data => { if (records.has(data.submissionId)) throw Error('unique'); records.set(data.submissionId, data) },
  }
  return { db, records, run: (value: unknown, headers?: Record<string,string>) => receiveInquiry(request(value, headers), async () => db, secret) }
}
describe('durable inquiry receipts', () => {
  it('confirms only a saved inquiry and normalizes its email', async () => {
    const m = memory(), data = fixture(), r = await m.run(data)
    expect(r.status).toBe(201)
    expect(await r.json()).toEqual({ ok: true, receipt: data.submissionId, duplicate: false })
    expect(m.records.get(data.submissionId)?.email).toBe('test@example.invalid')
    expect(r.headers.get('Cache-Control')).toBe('no-store')
  })
  it('replays the same receipt without writing or charging the rate limit', async () => {
    const m = memory(), data = fixture(); await m.run(data)
    m.db.countRecent = async () => 5
    expect((await m.run(data)).status).toBe(200); expect(m.records.size).toBe(1)
  })
  it('rejects a changed body under an existing key', async () => {
    const m = memory(), data = fixture(); await m.run(data)
    expect((await m.run({ ...data, message: 'Another distinct inquiry.' })).status).toBe(409)
    expect(m.records.size).toBe(1)
  })
  it('recovers a write whose acknowledgement was lost', async () => {
    const m = memory(), data = fixture()
    m.db.create = async d => { m.records.set(d.submissionId, d); throw Error('lost ack') }
    expect((await m.run(data)).status).toBe(200); expect(m.records.size).toBe(1)
  })
  it('does not confirm a failed write and does not log inquiry data', async () => {
    const m = memory(); m.db.create = async () => { throw Error('SECRET FORM BODY') }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try { expect((await m.run(fixture())).status).toBe(503); expect(log).toHaveBeenCalledWith('Lead persistence unavailable'); expect(m.records.size).toBe(0) }
    finally { log.mockRestore() }
  })
  it('resolves concurrent retries to one stored inquiry', async () => {
    const m = memory(), data = fixture()
    const replies = await Promise.all(Array.from({ length: 8 }, () => m.run(data)))
    expect(replies.every(r => [200, 201].includes(r.status))).toBe(true)
    expect(replies.filter(r => r.status === 201)).toHaveLength(1); expect(m.records.size).toBe(1)
  })
  it.each([null, [], 'text', 3])('rejects a non-object JSON body: %j', async value => {
    expect((await memory().run(value)).status).toBe(400)
  })
  it('limits actual streamed bytes even without Content-Length', async () => {
    expect((await memory().run({ ...fixture(), message: 'x'.repeat(15000) })).status).toBe(413)
  })
  it('rejects missing consent, forged source, invalid id and rate excess', async () => {
    const m = memory()
    expect((await m.run({ ...fixture(), consent: false })).status).toBe(422)
    expect((await m.run(fixture(), { origin: 'https://other.example' })).status).toBe(403)
    expect((await m.run({ ...fixture(), submissionId: 'a' })).status).toBe(422)
    m.db.countRecent = async () => 5
    expect((await m.run(fixture())).status).toBe(429)
  })
  it('drops tracking query data from the submitted source', async () => {
    const m = memory(), data = { ...fixture(), source: '/contact?email=private' }
    await m.run(data); expect(m.records.get(data.submissionId)?.source).toBe('/')
  })
  it('accepts a honeypot silently without creating a record', async () => {
    const m = memory(); expect((await m.run({ ...fixture(), website: 'spam' })).status).toBe(200); expect(m.records.size).toBe(0)
  })
})
