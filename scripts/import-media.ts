import 'dotenv/config'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import source from '../src/content/source.json'

const payload = await getPayload({ config })
const sources = source as Array<{ kind: string; title: string; images: string[]; videos: string[] }>
const dir = path.resolve(process.cwd(), 'public/media')
const extensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp4', '.webm'])
const onlyAttach = process.argv.includes('--attach-only')
const all = readdirSync(dir).filter(filename => extensions.has(path.extname(filename).toLowerCase())).sort()
const idByPath = new Map<string, number | string>()
const failures: Array<{ file: string; error: string }> = []

function description(filename: string): string {
  const filePath = '/media/' + filename
  const seen = sources.find(page => page.images.includes(filePath) || page.videos.includes(filePath))
  const label = seen?.kind === 'case' ? 'Материал кейса' : seen?.kind === 'article' ? 'Иллюстрация публикации' : 'Медиа I’MON'
  if (filename === 'hero-desktop.mp4' || filename === 'hero-mobile.mp4') return 'Главное видео сайта I’MON'
  if (filename === 'hero-poster.jpg') return 'Первый экран сайта I’MON'
  return label + (seen ? ' — ' + seen.title : '')
}

for (let index = 0; index < all.length; index++) {
  const filename = all[index]
  try {
    const existing = await payload.find({
      collection: 'media',
      overrideAccess: true,
      limit: 1,
      depth: 0,
      where: { filename: { equals: filename } },
    })
    let media = existing.docs[0]
    if (!media && !onlyAttach) {
      media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        filePath: path.join(dir, filename),
        data: { alt: description(filename) },
      })
    }
    if (media) idByPath.set('/media/' + filename, media.id)
    if ((index + 1) % 10 === 0 || index === all.length - 1) {
      console.log('Media:', index + 1, '/', all.length, 'registered:', idByPath.size)
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown upload error'
    failures.push({ file: filename, error: detail })
    console.error('Media import failed:', filename, detail)
  }
}

type Entry = Record<string, unknown>

function connectMedia(entry: Entry, idField: string, sourceField: string): boolean {
  const current = entry[idField]
  const source = entry[sourceField]
  if (current || typeof source !== 'string') return false
  const mediaId = idByPath.get(source)
  if (mediaId === undefined) return false
  entry[idField] = mediaId
  return true
}

function connectBlocks(blocks: Entry[]): { blocks: Entry[]; changes: number } {
  let changes = 0
  const updated = blocks.map(original => {
    const block: Entry = { ...original }
    const type = block.blockType
    if (type === 'visual') changes += Number(connectMedia(block, 'media', 'src'))
    if (type === 'quote') changes += Number(connectMedia(block, 'image', 'imagePath'))
    if (type === 'gallery' || type === 'cards' || type === 'services') {
      if (Array.isArray(block.items)) {
        block.items = block.items.map((originalItem: Entry) => {
          const item = { ...originalItem }
          if (type === 'gallery') changes += Number(connectMedia(item, 'media', 'src'))
          else changes += Number(connectMedia(item, 'image', 'imagePath'))
          return item
        })
      }
    }
    return block
  })
  return { blocks: updated, changes }
}

let connected = 0
for (const collection of ['pages', 'projects', 'articles'] as const) {
  const docs = await payload.find({ collection, limit: 200, depth: 0, draft: true, overrideAccess: true })
  for (const doc of docs.docs) {
    const data: Entry = {}
    const record = doc as unknown as Entry
    const blockField = collection === 'pages' ? 'blocks' : 'sections'
    if (Array.isArray(record[blockField])) {
      const modified = connectBlocks(record[blockField] as Entry[])
      if (modified.changes) {
        data[blockField] = modified.blocks
        connected += modified.changes
      }
    }
    if (collection === 'pages') {
      if (connectMedia(record, 'heroVideo', 'heroVideoPath')) data.heroVideo = record.heroVideo
      if (connectMedia(record, 'heroImage', 'heroImagePath')) data.heroImage = record.heroImage
    } else if (connectMedia(record, 'cover', 'coverPath')) {
      data.cover = record.cover
      connected++
    }
    if (Object.keys(data).length) {
      await payload.update({
        collection,
        id: doc.id,
        data: data as never,
        overrideAccess: true,
        draft: false,
      })
    }
  }
  console.log('Updated CMS media references:', collection)
}
console.log('Media sync complete:', idByPath.size, 'assets, linked:', connected, 'references, failed:', failures.length)
if (failures.length) {
  console.error('Failed files:', failures.map(x => x.file).join(', '))
  process.exit(1)
}
process.exit(0)
