export type RecordData = Record<string, unknown>
export type StudioCollection = 'pages' | 'projects' | 'articles'
export const collections: StudioCollection[] = ['pages', 'projects', 'articles']
export type Breakpoint = 'desktop' | 'tablet' | 'phone'
export const viewports = {
  desktop: { label: 'Desktop', width: 1440, height: 900 },
  tablet: { label: 'Tablet', width: 768, height: 1024 },
  phone: { label: 'Phone', width: 390, height: 844 },
} as const
export type FieldSpec = {
  name: string; label: string; type: string; required?: boolean
  fields?: FieldSpec[]; options?: { label: string; value: string }[]
  blocks?: BlockSpec[]; defaultValue?: unknown; min?: number; max?: number
}
export type BlockSpec = { slug: string; label: string; fields: FieldSpec[] }
export type DocumentSummary = {
  id: number; collection: StudioCollection; title: string; path: string
  status: string; updatedAt: string; kind?: string
}
export type StudioDocument = {
  id: number; collection: StudioCollection; data: RecordData; revision: string
  fields: FieldSpec[]; published: boolean; path: string
}
export type MediaAsset = {
  id: number; url: string; filename: string; alt?: string; mimeType?: string
  width?: number; height?: number; thumbnailURL?: string
}
export const labels: Record<string, string> = {
  title: 'Название', heading: 'Заголовок', body: 'Текст', intro: 'Вступление', eyebrow: 'Подпись',
  heroTitle: 'Заголовок первого экрана', heroImage: 'Обложка', heroVideo: 'Фоновое видео',
  heroVideoPath: 'Исходное видео', heroImagePath: 'Исходное изображение',
  path: 'Адрес страницы', sourcePath: 'Адрес кейса', slug: 'Идентификатор URL', kind: 'Тип страницы',
  sections: 'Секции', blocks: 'Секции', items: 'Элементы', image: 'Изображение', media: 'Медиафайл',
  imagePath: 'Исходное изображение', src: 'Исходный файл', caption: 'Подпись', display: 'Вписывание',
  layout: 'Композиция', description: 'Описание', details: 'Перечень услуг', number: 'Номер',
  question: 'Вопрос', answer: 'Ответ', quote: 'Цитата', attribution: 'Автор / подпись',
  buttonText: 'Текст кнопки', href: 'Ссылка', limit: 'Количество', showForm: 'Показывать форму',
  summary: 'Описание проекта', client: 'Клиент', year: 'Год', category: 'Категория', order: 'Порядок',
  cover: 'Обложка', coverPath: 'Исходная обложка', excerpt: 'Краткое описание', publishedAt: 'Дата публикации',
  editorialReviewed: 'Проверено редактором', seo: 'Поисковая оптимизация', seoDescription: 'SEO-описание',
  noindex: 'Не индексировать', statement: 'Описание подхода', teamTitle: 'Заголовок команды',
  teamIntro: 'Описание команды', team: 'Команда', role: 'Роль', name: 'Имя', portrait: 'Портрет',
  portraitPath: 'Исходный портрет', cultureTitle: 'Заголовок принципов', cultureItems: 'Принципы',
  text: 'Текст', symbolsTitle: 'Заголовок графики', symbols: 'Графика', alt: 'Альтернативный текст',
  closingImage: 'Заключительное фото', closingImagePath: 'Исходное заключительное фото', closingHref: 'Ссылка',
}
export function isRecord(value: unknown): value is RecordData {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
export function readPath(object: unknown, path: string): unknown {
  if (!path) return object
  return path.split('.').reduce<unknown>((value, part) => {
    if (['__proto__', 'prototype', 'constructor'].includes(part)) return undefined
    if (Array.isArray(value)) return value[Number(part)]
    return isRecord(value) ? value[part] : undefined
  }, object)
}
export function writePath(object: RecordData, path: string, value: unknown): RecordData {
  const parts = path.split('.')
  if (parts.some(part => !/^[a-zA-Z0-9_-]+$/.test(part) || ['__proto__', 'constructor', 'prototype'].includes(part))) return object
  const next = structuredClone(object)
  let current: RecordData | unknown[] = next
  parts.slice(0, -1).forEach((key, i) => {
    const record = current as RecordData
    if (!isRecord(record[key]) && !Array.isArray(record[key])) record[key] = /^\d+$/.test(parts[i + 1]) ? [] : {}
    current = record[key] as RecordData
  })
  ;(current as RecordData)[parts.at(-1)!] = value
  return next
}
export function blockField(collection: StudioCollection): 'blocks' | 'sections' {
  return collection === 'pages' ? 'blocks' : 'sections'
}
export function documentPath(collection: StudioCollection, data: RecordData): string {
  return String(collection === 'pages' ? data.path || '/' : collection === 'projects' ? data.sourcePath || '/work' : '/news/' + (data.slug || ''))
}
export function nodeID(block: unknown, index: number): string {
  return isRecord(block) && typeof block.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(block.id) ? 'block-' + block.id : 'block-index-' + index
}
export function nodeProps(block: unknown, index: number, base = 'blocks') {
  return { 'data-studio-node': nodeID(block, index), 'data-studio-path': base + '.' + index }
}
export function fieldProps(path: string) { return { 'data-studio-field': path } }
export function layerName(block: RecordData, index: number): string {
  return String(block.blockName || block.heading || block.title || block.eyebrow || ({ text: 'Текст', cards: 'Карточки', visual: 'Медиа', gallery: 'Галерея', services: 'Направления', faq: 'Вопросы', quote: 'Цитата', listing: 'Коллекция', cta: 'Призыв к действию', contact: 'Форма', aboutEditorial: 'О студии' } as Record<string, string>)[String(block.blockType)] || 'Секция ' + (index + 1))
}
export function newFields(fields: FieldSpec[]): RecordData {
  const result: RecordData = {}
  for (const field of fields) {
    if (field.defaultValue !== undefined) result[field.name] = structuredClone(field.defaultValue)
    else if (field.type === 'array' || field.type === 'blocks') result[field.name] = []
    else if (field.type === 'group') result[field.name] = newFields(field.fields || [])
    else if (field.type === 'checkbox') result[field.name] = false
    else if (field.type === 'select') result[field.name] = field.options?.[0]?.value || ''
    else if (field.type !== 'upload' && field.type !== 'number' && field.type !== 'richText') result[field.name] = ''
  }
  return result
}
export function cloneLayer(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneLayer)
  if (!isRecord(value)) return value
  return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, key === 'id' ? crypto.randomUUID() : cloneLayer(val)]))
}
export function schemaAtPath(fields: FieldSpec[], data: RecordData, path: string): FieldSpec[] {
  if (!path || path === 'hero') return fields.filter(field => !['blocks', 'sections', 'studio'].includes(field.name))
  let list = fields
  let value: unknown = data
  const parts = path.split('.')
  for (let i = 0; i < parts.length; i++) {
    const spec = list.find(field => field.name === parts[i])
    if (!spec) return list
    value = isRecord(value) ? value[spec.name] : undefined
    if (spec.type === 'blocks' || spec.type === 'array') {
      value = Array.isArray(value) ? value[Number(parts[++i])] : undefined
      list = spec.type === 'blocks' ? spec.blocks?.find(block => block.slug === (isRecord(value) ? value.blockType : ''))?.fields || [] : spec.fields || []
    } else if (spec.type === 'group') list = spec.fields || []
    else return [spec]
  }
  return list
}

/** IDs follow persisted row IDs, not array positions, so styles survive reordering. */
export function fieldNodeID(data: unknown, path: string): string {
  let value: unknown = data
  const tokens = path.split('.').map(part => {
    if (Array.isArray(value)) {
      value = value[Number(part)]
      return isRecord(value) && typeof value.id === 'string' ? 'id-' + value.id : 'n-' + part
    }
    value = isRecord(value) ? value[part] : undefined
    return part
  })
  return 'field-' + tokens.join('--')
}
export function fieldSelectors(data: unknown): Record<string,string> {
  const result: Record<string,string> = {}
  const walk = (value: unknown, path: string, depth: number) => {
    if (depth > 9) return
    if (path && /^[a-zA-Z0-9_.-]+$/.test(path)) result[fieldNodeID(data, path)] = `[data-studio-field="${path}"]`
    if (Array.isArray(value)) value.forEach((item, index) => walk(item, path + '.' + index, depth + 1))
    else if (isRecord(value) && !('url' in value && 'filename' in value)) {
      for (const [key,item] of Object.entries(value)) if (!['studio','createdAt','updatedAt','id','_status'].includes(key)) walk(item, path ? path + '.' + key : key, depth + 1)
    }
  }
  walk(data,'',0)
  return result
}
