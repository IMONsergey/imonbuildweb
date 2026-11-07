// @vitest-environment node
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'

let payload: Payload
let post: (request: Request) => Promise<Response>
const input = () => ({ name: 'Synthetic QA', email: 'qa@example.invalid', company: '', message: 'Isolated database verification.', source: '/contact', consent: true, website: '', submissionId: randomUUID() })
const req = (data: unknown, ip: string) => new Request('http://localhost:3000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body: JSON.stringify(data) })

describe('real Payload SQLite inquiry storage', () => {
  beforeAll(async () => {
    // The test runner must point at its disposable DB, never an existing site.
    if (!process.env.DATABASE_URL?.endsWith('/inquiry-tests.db') && process.env.DATABASE_URL !== 'file:./inquiry-tests.db') throw Error('isolated test DB required')
    const { getPayload } = await import('payload')
    const config = (await import('@/payload.config')).default
    payload = await getPayload({ config })
    post = (await import('@/app/(frontend)/api/contact/route')).POST
  }, 60000)
  afterAll(async () => { await payload?.destroy() })
  it('stores one record for concurrent identical requests and supports later retries', async () => {
    const data = input()
    const replies = await Promise.all(Array.from({ length: 5 }, () => post(req(data, '192.0.2.81'))))
    expect(replies.map(r => r.status).sort()).toEqual([200, 200, 200, 200, 201])
    const found = await payload.find({ collection: 'leads', overrideAccess: true, where: { submissionId: { equals: data.submissionId } } })
    expect(found.totalDocs).toBe(1); expect(found.docs[0].requestHash).toMatch(/^[a-f0-9]{64}$/)
    expect((await post(req(data, '192.0.2.81'))).status).toBe(200)
    expect((await post(req({ ...data, message: 'Different inquiry content.' }, '192.0.2.81'))).status).toBe(409)
  })
  it('retains legacy inquiries with no receipt and denies unauthenticated collection access', async () => {
    await payload.create({ collection: 'leads', overrideAccess: true, data: { name: 'Legacy test', email: 'legacy@example.invalid', message: 'Existing inquiry without receipt.', consent: true } })
    await expect(payload.find({ collection: 'leads', overrideAccess: false })).rejects.toThrow()
    await expect(payload.create({ collection: 'leads', overrideAccess: false, data: { name: 'Bypass', email: 'bypass@example.invalid', message: 'No public collection write', consent: true } })).rejects.toThrow()
  })
})
