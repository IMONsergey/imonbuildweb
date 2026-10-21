import { isRecord } from './model'

export type GlobalSlug = 'navigation' | 'site-settings'

function required(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new Error('Проверьте поле «' + field + '»')
  return value.trim()
}
function optional(value: unknown, field: string, max: number): string {
  if (value == null || value === '') return ''
  if (typeof value !== 'string' || value.length > max)
    throw new Error('Проверьте поле «' + field + '»')
  return value.trim()
}
export function safeHref(value: unknown): string {
  const link = required(value, 'Ссылка', 400)
  if (link.startsWith('/') && !link.startsWith('//') && !link.includes('\\')) return link
  if (link.startsWith('#') && /^#[a-zA-Z0-9_-]{1,100}$/.test(link)) return link
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(link)) return link
  if (/^tel:\+?[0-9\-() ]{4,25}$/.test(link)) return link
  try {
    const url = new URL(link)
    if (url.protocol === 'https:' && !url.username && !url.password) return link
  } catch {}
  throw new Error('Недопустимый адрес ссылки: используйте /путь или HTTPS')
}
function array(value: unknown, max: number): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > max || !value.every(isRecord)) throw new Error('Некорректный список элементов')
  return value
}
function id(row: Record<string, unknown>) {
  return typeof row.id === 'string' && /^[a-z0-9_-]+$/i.test(row.id) ? { id: row.id } : {}
}

export function cleanPreferences(slug: GlobalSlug, value: unknown) {
  if (!isRecord(value)) throw new Error('Неверные настройки')
  if (slug === 'navigation') {
    return {
      links: array(value.links || [], 40).map(row => ({
        ...id(row),
        label: required(row.label, 'Название пункта', 80),
        href: safeHref(row.href),
        external: row.external === true,
      })),
      ctaText: required(value.ctaText, 'Кнопка меню', 100),
      ctaHref: safeHref(value.ctaHref),
    }
  }
  const email = required(value.email, 'Email', 256)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Некорректная рабочая почта')
  const telegram = optional(value.telegram, 'Telegram', 400)
  return {
    brand: required(value.brand, 'Бренд', 100),
    description: optional(value.description, 'Описание', 1000),
    email,
    telegram: telegram ? safeHref(telegram) : '',
    footerMessage: required(value.footerMessage, 'Подпись футера', 1200),
    socials: array(value.socials || [], 30).map(row => ({
      ...id(row),
      label: required(row.label, 'Название социальной сети', 80),
      url: safeHref(row.url),
    })),
  }
}
