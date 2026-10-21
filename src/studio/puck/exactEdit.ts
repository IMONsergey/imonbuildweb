import type { StudioCollection } from '../model'
import type { PuckData } from './adapter'

const rootFields: Record<StudioCollection, ReadonlySet<string>> = {
  pages: new Set(['title', 'intro', 'heroTitle']),
  projects: new Set(['title', 'summary']),
  articles: new Set(['title', 'excerpt']),
}

const unsafe = new Set(['__proto__', 'constructor', 'prototype'])
const mediaOrNavigation = new Set(['src', 'href', 'url', 'imagePath', 'portraitPath', 'heroImagePath', 'heroVideoPath', 'image', 'media', 'video', 'cover', 'portrait', 'blockType', 'blockName', 'id'])
const segmentPattern = /^(?:[a-zA-Z_][a-zA-Z0-9_]*|0|[1-9][0-9]*)$/

function member(value: unknown, key: string): unknown {
  if (unsafe.has(key) || !segmentPattern.test(key)) return undefined
  if (Array.isArray(value)) {
    const index = Number(key)
    return Number.isSafeInteger(index) && index >= 0 && index < value.length ? value[index] : undefined
  }
  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, key))
    return (value as Record<string, unknown>)[key]
  return undefined
}

/**
 * Translate text edits made on the real CMS page into Puck's editable data.
 * Never invent fields or alter media, IDs, SEO, component types or collections.
 */
export function applyExactTextEdit(
  data: PuckData,
  collection: StudioCollection,
  path: string,
  value: string,
): PuckData | null {
  if (typeof value !== 'string' || value.length > 250_000) return null
  const segments = path.split('.')
  if (!segments.length || segments.some(segment => unsafe.has(segment) || !segmentPattern.test(segment))) return null

  if (segments.length === 1) {
    const field = segments[0]
    if (!rootFields[collection].has(field) || typeof data.root?.props?.[field] !== 'string') return null
    if (data.root.props[field] === value) return null
    return { ...data, root: { ...data.root, props: { ...data.root.props, [field]: value } } }
  }

  const blockKey = collection === 'pages' ? 'blocks' : 'sections'
  if (segments[0] !== blockKey || !/^(0|[1-9][0-9]*)$/.test(segments[1])) return null
  const index = Number(segments[1])
  if (!Number.isSafeInteger(index) || index >= data.content.length) return null
  const original = data.content[index]
  if (!original?.props || segments.length < 3 || mediaOrNavigation.has(segments.at(-1)!)) return null
  let originalCursor: unknown = original.props
  for (const segment of segments.slice(2)) originalCursor = member(originalCursor, segment)
  if (typeof originalCursor !== 'string' || originalCursor === value) return null

  const props = structuredClone(original.props)
  let cursor: unknown = props
  for (const segment of segments.slice(2, -1)) cursor = member(cursor, segment)
  const finalKey = segments.at(-1)!
  if (!cursor || typeof cursor !== 'object') return null
  if (Array.isArray(cursor)) {
    const position = Number(finalKey)
    if (!Number.isSafeInteger(position) || position < 0 || position >= cursor.length) return null
    cursor[position] = value
  } else {
    if (!Object.prototype.hasOwnProperty.call(cursor, finalKey)) return null
    ;(cursor as Record<string, unknown>)[finalKey] = value
  }
  const content = data.content.slice()
  content[index] = { ...original, props }
  return { ...data, content }
}
