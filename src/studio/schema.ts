import { isVideoEmbed } from '@/lib/mediaPolicy'
import type { Field } from 'payload'
import { Pages } from '@/collections/Pages'
import { Projects } from '@/collections/Projects'
import { Articles } from '@/collections/Articles'
import { collections, isRecord, labels, type FieldSpec, type RecordData, type StudioCollection } from './model'
import { normalizeDesign } from './styles'

export class StudioError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}
const configs = { pages: Pages, projects: Projects, articles: Articles }
const systemKeys = new Set(['id', 'createdAt', 'updatedAt', '_status', 'studio'])
function label(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : isRecord(value) ? String(value.ru || value.en || fallback) : fallback
}
export function fieldSpecs(fields: Field[]): FieldSpec[] {
  return fields.flatMap(field => {
    if (!('name' in field)) return 'fields' in field ? fieldSpecs(field.fields) : []
    if (systemKeys.has(field.name) || field.type === 'ui') return []
    const result: FieldSpec = {
      name: field.name, label: typeof field.label === 'string' && /[А-Яа-яЁё]/.test(field.label) ? field.label : labels[field.name] || label(field.label, field.name), type: field.type,
      required: 'required' in field ? field.required : undefined,
    }
    if ('fields' in field) result.fields = fieldSpecs(field.fields)
    if ('defaultValue' in field && typeof field.defaultValue !== 'function') result.defaultValue = field.defaultValue
    if ('min' in field && typeof field.min === 'number') result.min = field.min
    if ('max' in field && typeof field.max === 'number') result.max = field.max
    if (field.type === 'blocks') result.blocks = field.blocks.map(block => ({
      slug: block.slug, label: label(block.labels?.singular, block.slug), fields: fieldSpecs(block.fields),
    }))
    if (field.type === 'select') result.options = field.options.map(option => typeof option === 'string' ? { value: option, label: option } : { value: option.value, label: label(option.label, option.value) })
    return [result]
  })
}
export function schema(collection: StudioCollection) { return fieldSpecs(configs[collection].fields) }
export function collectionName(value: unknown): StudioCollection {
  if (!collections.includes(value as StudioCollection)) throw new StudioError('Неизвестная коллекция', 400)
  return value as StudioCollection
}
export function identifier(value: unknown): number {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) throw new StudioError('Некорректный идентификатор', 400)
  return id
}
export function safeRoute(value: unknown): string {
  if (typeof value !== 'string' || value.length > 240 || !/^\/(?:[a-z0-9]+(?:[-/][a-z0-9]+)*)?$/.test(value)) throw new StudioError('Адрес должен начинаться с / и содержать латинские буквы, цифры и дефисы', 422)
  if (/^\/(admin|api|studio|_next|robots|sitemap)(\/|$)/.test(value)) throw new StudioError('Этот адрес зарезервирован системой', 422)
  return value
}
export function sanitize(data: unknown, fields: FieldSpec[], level = 0): RecordData {
  if (!isRecord(data) || level > 8) throw new StudioError('Некорректная структура контента', 422)
  const output: RecordData = {}
  if (level > 0 && typeof data.id === 'string' && /^[\w-]{1,80}$/.test(data.id)) output.id = data.id
  for (const field of fields) {
    const value = data[field.name]
    if (value === undefined) continue
    if (value === null) { output[field.name] = null; continue }
    switch (field.type) {
      case 'text': case 'textarea': case 'email': case 'date': {
        if (typeof value !== 'string' || value.length > (field.type === 'textarea' ? 30_000 : 4000)) throw new StudioError('Некорректное поле: ' + field.label, 422)
        if (/^(href|url|closingHref)$/i.test(field.name) && value && !/^(\/(?!\/)|https:\/\/|mailto:|tel:|#)/.test(value)) throw new StudioError('Разрешены относительные ссылки, https, mailto и tel', 422)
        if (/Path$|^src$/.test(field.name) && !['sourcePath'].includes(field.name) && value && !/^\/(?!\/)/.test(value) && !(field.name === 'src' && isVideoEmbed(value))) throw new StudioError('Медиа должно находиться в локальной медиатеке', 422)
        output[field.name] = value; break
      }
      case 'number': {
        if (typeof value !== 'number' || !Number.isFinite(value) || (field.min !== undefined && value < field.min) || (field.max !== undefined && value > field.max)) throw new StudioError('Проверьте число в поле ' + field.label, 422)
        output[field.name] = value; break
      }
      case 'checkbox': if (typeof value !== 'boolean') throw new StudioError('Некорректный переключатель', 422); output[field.name] = value; break
      case 'select': if (!field.options?.some(option => option.value === value)) throw new StudioError('Некорректный вариант: ' + field.label, 422); output[field.name] = value; break
      case 'upload': case 'relationship': output[field.name] = identifier(isRecord(value) ? value.id : value); break
      case 'group': output[field.name] = sanitize(value, field.fields || [], level + 1); break
      case 'array': case 'blocks': {
        if (!Array.isArray(value) || value.length > 200) throw new StudioError('Слишком много элементов в ' + field.label, 422)
        output[field.name] = value.map(row => {
          if (!isRecord(row)) throw new StudioError('Некорректный элемент', 422)
          if (field.type === 'array') return sanitize(row, field.fields || [], level + 1)
          const block = field.blocks?.find(item => item.slug === row.blockType)
          if (!block) throw new StudioError('Неизвестный компонент', 422)
          return { ...sanitize(row, block.fields, level + 1), blockType: block.slug, ...(typeof row.blockName === 'string' ? { blockName: row.blockName.slice(0, 160) } : {}) }
        }); break
      }
      case 'richText':
        if (!isRecord(value) || !isRecord(value.root)) throw new StudioError('Некорректный rich text', 422)
        // Rich text is managed by the existing Lexical editor; Studio preserves it unchanged.
        output[field.name] = value; break
    }
  }
  return output
}
export function sanitizeDocument(collection: StudioCollection, value: unknown) {
  const result = sanitize(value, schema(collection))
  if (!isRecord(value)) throw new StudioError('Нет документа')
  result.studio = normalizeDesign(value.studio)
  if (collection === 'pages') safeRoute(result.path)
  else if (collection === 'projects') { safeRoute(result.sourcePath); if (!/^\/(work|cases)\//.test(String(result.sourcePath))) throw new StudioError('Кейс должен находиться в /work/ или /cases/', 422) }
  if ('slug' in result && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(result.slug))) throw new StudioError('Проверьте URL-идентификатор', 422)
  return result
}
