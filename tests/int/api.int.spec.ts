import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})


describe('Project archive', () => {
  it('keeps a published archive record available to editors but hidden from public reads', async () => {
    const project = await payload.create({
      collection: 'projects', overrideAccess: true,
      data: { slug: 'archive-access-check', sourcePath: '/work/archive-access-check', title: 'Archive access fixture', portfolioStatus: 'archive', _status: 'published' },
    })
    try {
      const publicResult = await payload.find({ collection: 'projects', overrideAccess: false, where: { id: { equals: project.id } } })
      expect(publicResult.totalDocs).toBe(0)
      const editorResult = await payload.findByID({ collection: 'projects', id: project.id, overrideAccess: true })
      expect(editorResult.title).toBe('Archive access fixture')
    } finally {
      await payload.delete({ collection: 'projects', id: project.id, overrideAccess: true })
    }
  })
})
