import { NextRequest, NextResponse } from 'next/server'
import { bootstrap, readDocument, saveDocument, studioSession, serialize, revision } from '@/studio/server'
import { cleanPreferences, type GlobalSlug } from '@/studio/preferences'
import { collectionName, identifier, sanitizeDocument, StudioError } from '@/studio/schema'
import { isRecord, type RecordData } from '@/studio/model'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ action: string }> }
const noCache = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noCache })
function failure(error: unknown) {
  if (error instanceof StudioError) return json({ message: error.message }, error.status)
  if (isRecord(error) && typeof error.status === 'number' && error.status >= 400 && error.status < 500) return json({ message: 'Не удалось сохранить: проверьте обязательные поля и права доступа.', details: error.name }, error.status)
  console.error('Studio operation failed:', error instanceof Error ? error.name + ': ' + error.message.slice(0, 200) : 'Unknown error')
  return json({ message: 'Не удалось выполнить операцию. Изменения остались в редакторе.' }, 503)
}
function originGuard(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  let sameOrigin = false
  try {
    const external = new URL(origin || '')
    sameOrigin = !!host && external.host.toLowerCase() === host.toLowerCase() && external.protocol === request.nextUrl.protocol
  } catch {}
  if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site') throw new StudioError('Запрос разрешён только из редактора на этом сайте', 403)
}
async function body(request: NextRequest): Promise<RecordData> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new StudioError('Ожидается JSON', 415)
  if (!request.body) throw new StudioError('Пустой запрос')
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    size += value.byteLength
    if (size > 1_048_576) { await reader.cancel(); throw new StudioError('Документ больше 1 МБ', 413) }
    chunks.push(value)
  }
  try { const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (isRecord(value)) return value } catch {}
  throw new StudioError('Некорректный JSON', 400)
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const { payload, user } = await studioSession(request.headers)
    const action = (await context.params).action
    const query = request.nextUrl.searchParams
    if (action === 'bootstrap') return json(await bootstrap(payload, user))
    if (action === 'preferences') {
      const [navigation, settings] = await Promise.all([
        payload.findGlobal({ slug: 'navigation', user, overrideAccess: false, depth: 0 }),
        payload.findGlobal({ slug: 'site-settings', user, overrideAccess: false, depth: 0 }),
      ])
      return json({
        navigation: { data: navigation, revision: revision(navigation) },
        settings: { data: settings, revision: revision(settings) },
        canEdit: user.role === 'admin',
      })
    }
    if (action === 'leads') {
      if (user.role !== 'admin') throw new StudioError('Недостаточно прав для просмотра заявок', 403)
      const result = await payload.find({ collection: 'leads', sort: '-createdAt', limit: 100,
        depth: 0, user, overrideAccess: false })
      return json({ leads: result.docs.map(item => ({ id: item.id, createdAt: item.createdAt,
        name: item.name, email: item.email, company: item.company || '',
        message: item.message, status: item.status || 'new' })), total: result.totalDocs })
    }
    if (action === 'media') {
      const page = Math.max(1, Math.min(10000, Number(query.get('page')) || 1))
      const search = (query.get('q') || '').slice(0, 120)
      const result = await payload.find({ collection: 'media', limit: 36, page, depth: 0, sort: '-createdAt', user, overrideAccess: false, where: search ? { or: [{ alt: { contains: search } }, { filename: { contains: search } }] } : {} })
      return json({ ...result, docs: result.docs.map(item => ({ id: item.id, filename: item.filename, url: '/api/media/file/' + encodeURIComponent(item.filename || ''), thumbnailURL: item.sizes?.card?.filename ? '/api/media/file/' + encodeURIComponent(item.sizes.card.filename) : undefined, alt: item.alt, mimeType: item.mimeType, width: item.width, height: item.height })) })
    }
    const collection = collectionName(query.get('collection')), id = identifier(query.get('id'))
    if (action === 'document') return json(await readDocument(payload, user, collection, id))
    if (action === 'versions') {
      await readDocument(payload, user, collection, id)
      const result = await payload.findVersions({ collection, where: { parent: { equals: id } }, depth: 0, limit: 25, sort: '-createdAt', overrideAccess: false, user })
      return json({ versions: result.docs.map(item => ({ id: item.id, createdAt: item.createdAt, status: item.version._status, title: item.version.title })) })
    }
    throw new StudioError('Неизвестная операция', 404)
  } catch (error) { return failure(error) }
}
export async function PUT(request: NextRequest, context: Context) {
  try {
    originGuard(request)
    const { payload, user } = await studioSession(request.headers)
    const input = await body(request), action = (await context.params).action
    if (action === 'preferences') {
      if (user.role !== 'admin') throw new StudioError('Только администратор может менять настройки', 403)
      if (!['navigation', 'site-settings'].includes(String(input.slug))) throw new StudioError('Неизвестный раздел настроек', 400)
      const slug = input.slug as GlobalSlug
      if (typeof input.revision !== 'string' || !/^[a-f0-9]{64}$/.test(input.revision))
        throw new StudioError('Обновите настройки перед сохранением', 409)
      let clean
      try { clean = cleanPreferences(slug, input.data) }
      catch (error) { throw new StudioError(error instanceof Error ? error.message : 'Некорректные настройки', 422) }
      return json(await serialize('preferences:' + slug, async () => {
        const current = await payload.findGlobal({ slug, user, overrideAccess: false, depth: 0 })
        if (revision(current) !== input.revision) throw new StudioError('Настройки были изменены в другой вкладке. Обновите страницу перед сохранением.', 409)
        await payload.updateGlobal({ slug, data: clean as never, user, overrideAccess: false })
        const updated = await payload.findGlobal({ slug, user, overrideAccess: false, depth: 0 })
        return { data: updated, revision: revision(updated) }
      }))
    }
    if (action === 'leads') {
      if (user.role !== 'admin') throw new StudioError('Недостаточно прав для работы с заявками', 403)
      const id = identifier(input.id)
      if (!['new', 'processing', 'done'].includes(String(input.status)))
        throw new StudioError('Неизвестный статус заявки', 422)
      const updated = await payload.update({ collection: 'leads', id, data: { status: input.status as 'new' | 'processing' | 'done' }, user, overrideAccess: false })
      return json({ id: updated.id, status: updated.status })
    }
    const collection = collectionName(input.collection), id = identifier(input.id)
    if (typeof input.revision !== 'string' || !/^[a-f0-9]{64}$/.test(input.revision)) throw new StudioError('Загрузите актуальную версию документа', 409)
    if (action === 'document') {
      if (!['draft', 'publish'].includes(String(input.mode))) throw new StudioError('Неизвестный режим сохранения')
      return json(await saveDocument(payload, user, collection, id, input.data, input.revision, input.mode as 'draft' | 'publish'))
    }
    if (action === 'restore') {
      const version = await payload.findVersionByID({ collection, id: String(identifier(input.version)), depth: 0, overrideAccess: false, user })
      const parent = isRecord(version.parent) ? version.parent.id : version.parent
      if (Number(parent) !== id) throw new StudioError('Версия принадлежит другому документу', 403)
      return json(await saveDocument(payload, user, collection, id, version.version, input.revision, 'draft'))
    }
    throw new StudioError('Неизвестная операция', 404)
  } catch (error) { return failure(error) }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    originGuard(request)
    const { payload, user } = await studioSession(request.headers)
    const action = (await context.params).action
    if (action === 'document') {
      const input = await body(request), collection = collectionName(input.collection)
      const data = sanitizeDocument(collection, input.data)
      const created = await payload.create({ collection, data: { ...data, _status: 'draft' } as never, draft: true, overrideAccess: false, user })
      return json(await readDocument(payload, user, collection, created.id), 201)
    }
    if (action === 'media') {
      const length = Number(request.headers.get('content-length'))
      if (!length || length > 25 * 1024 * 1024) throw new StudioError('Максимум 25 МБ на файл', 413)
      const data = await request.formData(), file = data.get('file')
      if (!(file instanceof File) || file.size > 24 * 1024 * 1024) throw new StudioError('Нет файла или размер больше 24 МБ', 422)
      const extensions: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm', 'application/pdf': 'pdf' }
      const ext = extensions[file.type]
      if (!ext) throw new StudioError('Разрешены PNG, JPEG, WebP, GIF, MP4, WebM и PDF. SVG загружается через техническую медиатеку.', 415)
      const buffer = Buffer.from(await file.arrayBuffer())
      const signature = buffer.subarray(0, 16)
      const valid = file.type === 'image/png' ? signature.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : file.type === 'image/jpeg' ? signature[0] === 255 && signature[1] === 216
        : file.type === 'image/webp' ? signature.toString('ascii', 0, 4) === 'RIFF' && signature.toString('ascii', 8, 12) === 'WEBP'
        : file.type === 'image/gif' ? signature.toString('ascii', 0, 3) === 'GIF'
        : file.type === 'application/pdf' ? signature.toString('ascii', 0, 5) === '%PDF-'
        : file.type === 'video/mp4' ? signature.toString('ascii', 4, 8) === 'ftyp'
        : signature.subarray(0, 4).equals(Buffer.from([26,69,223,163]))
      if (!valid) throw new StudioError('Содержимое файла не соответствует формату', 415)
      const stem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 90) || 'asset'
      const alt = String(data.get('alt') || file.name).slice(0, 300)
      const asset = await payload.create({ collection: 'media', file: { data: buffer, name: stem + '.' + ext, mimetype: file.type, size: buffer.length }, data: { alt }, overrideAccess: false, user })
      return json({ id: asset.id, url: '/api/media/file/' + encodeURIComponent(asset.filename || ''), filename: asset.filename, alt: asset.alt, mimeType: asset.mimeType }, 201)
    }
    throw new StudioError('Неизвестная операция', 404)
  } catch (error) { return failure(error) }
}
