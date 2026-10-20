import 'server-only'
import { createHash } from 'node:crypto'
import { getPayload, createLocalReq, type Payload, type PayloadRequest } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import { collections, documentPath, isRecord, type StudioCollection, type StudioDocument, type RecordData } from './model'
import { schema, sanitizeDocument, StudioError } from './schema'

export async function studioSession(headers: Headers) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  if (!user || !['admin', 'editor'].includes(user.role)) throw new StudioError('Войдите в аккаунт редактора', 401)
  return { payload, user }
}
export function revision(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}
function contentData(document: unknown): RecordData {
  if (!isRecord(document)) return {}
  const { id: _id, createdAt: _created, updatedAt: _updated, _status: _status, ...rest } = document
  return rest
}
export async function readDocument(payload: Payload, user: User, collection: StudioCollection, id: number, req?: PayloadRequest): Promise<StudioDocument> {
  const latest = await payload.findByID({ collection, id, draft: true, depth: 0, overrideAccess: false, user, req })
  const published = await payload.findByID({ collection, id, draft: false, depth: 0, overrideAccess: false, user, req })
  return { id, collection, data: contentData(latest), revision: revision(latest), fields: schema(collection), published: published._status === 'published', path: documentPath(collection, latest as unknown as RecordData) }
}
export async function bootstrap(payload: Payload, user: User) {
  const docs = await Promise.all(collections.map(async collection => {
    const result = await payload.find({ collection, draft: true, depth: 0, limit: 500, sort: collection === 'projects' ? 'order' : 'createdAt', overrideAccess: false, user })
    const publicRecords = await payload.find({ collection, draft: false, depth: 0, limit: 500, overrideAccess: false, user })
    const publicStatus = new Map(publicRecords.docs.map(document => [document.id, document._status]))
    return result.docs.map(document => ({
      id: document.id, collection, title: document.title, path: documentPath(collection, document as unknown as RecordData),
      status: document._status === 'draft' && publicStatus.get(document.id) === 'published' ? 'changed' : document._status || 'draft', updatedAt: document.updatedAt, kind: 'kind' in document ? document.kind || undefined : undefined,
    }))
  }))
  return { documents: docs.flat(), schemas: { pages: schema('pages'), projects: schema('projects'), articles: schema('articles') }, user: { id: user.id, name: user.name || 'Редактор', role: user.role }, limit: 500 }
}

// The current deployment is a single Node process with SQLite. Serialize Studio writes;
// the DB transaction and revision check additionally reject stale edits from Payload.
const writeQueues = new Map<string, Promise<unknown>>()
export async function serialize<T>(key: string, run: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(key) || Promise.resolve()
  const current = previous.catch(() => {}).then(run)
  writeQueues.set(key, current)
  try { return await current } finally { if (writeQueues.get(key) === current) writeQueues.delete(key) }
}
export async function saveDocument(payload: Payload, user: User, collection: StudioCollection, id: number, data: unknown, expected: string, mode: 'draft' | 'publish') {
  const clean = sanitizeDocument(collection, data)
  return serialize(collection + ':' + id, async () => {
    const req = await createLocalReq({ user }, payload)
    const tx = await payload.db.beginTransaction()
    if (tx !== null) req.transactionID = tx
    try {
      const current = await readDocument(payload, user, collection, id, req)
      if (expected !== current.revision) throw new StudioError('Документ уже изменён в другой вкладке. Ваши изменения сохранены в этом окне; загрузите актуальную версию перед повторной записью.', 409)
      await payload.update({
        collection, id, data: { ...clean, _status: mode === 'publish' ? 'published' : 'draft' } as never,
        draft: mode === 'draft', overrideAccess: false, overrideLock: false, user, req,
      })
      const result = await readDocument(payload, user, collection, id, req)
      if (tx !== null) await payload.db.commitTransaction(tx)
      return result
    } catch (error) {
      if (tx !== null) await payload.db.rollbackTransaction(tx)
      throw error
    }
  })
}
