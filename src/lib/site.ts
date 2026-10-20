import source from '@/content/source.json'
import config from '@/payload.config'
import { getPayload } from 'payload'
import type { Article, Page, Project } from '@/payload-types'

export type OriginalPage = {
  path: string
  slug: string
  kind: string
  title: string
  intro: string
  texts: string[]
  images: string[]
  videos: string[]
  cover?: string
  category?: string
  date?: string
  year?: string
}

export type ContentPage = OriginalPage | Page
export type ContentProject = OriginalPage | Project
export type ContentArticle = OriginalPage | Article

const originals = source as OriginalPage[]

export const fallbackNavigation = [
  { label: 'О нас', href: '/about' },
  { label: 'Проекты', href: '/work' },
  { label: 'Журнал', href: '/news' },
]

export const fallbackSettings = {
  brand: 'I’MON',
  email: 'info@imon.agency',
  telegram: 'https://t.me/imonagency',
  footerMessage: 'Обсудим следующий уровень вашего бизнеса',
}

export function originalPage(path: string): OriginalPage | undefined {
  return originals.find(page => page.path === path)
}
export const originalProjects = originals.filter(page => page.kind === 'case')
export const originalWork = originalProjects.filter(page => page.path.startsWith('/work/'))
export const originalArticles = originals.filter(page => page.kind === 'article')

async function cms() {
  try { return await getPayload({ config }) } catch (err) {
    console.error('CMS unavailable, serving authored source snapshot', err instanceof Error ? err.message : err)
    return null
  }
}

export async function siteSettings() {
  const payload = await cms()
  if (!payload) return { settings: fallbackSettings, links: fallbackNavigation }
  try {
    const [settings, nav] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'navigation' }),
    ])
    const links = Array.isArray(nav.links) && nav.links.length
      ? nav.links.filter(link => !!link.href && !!link.label).map(link => ({ label: link.label, href: link.href }))
      : fallbackNavigation
    return {
      settings: { ...fallbackSettings, ...settings },
      links,
    }
  } catch {
    return { settings: fallbackSettings, links: fallbackNavigation }
  }
}

export async function sitePage(path: string): Promise<ContentPage | undefined> {
  const payload = await cms()
  if (payload) {
    try {
      const result = await payload.find({
        collection: 'pages', limit: 1, depth: 2,
        where: { path: { equals: path }, _status: { equals: 'published' } },
      })
      if (result.docs[0]) return result.docs[0]
    } catch (err) { console.error('Failed to read page', path, err instanceof Error ? err.message : err) }
  }
  return originalPage(path)
}

export async function siteProjects(): Promise<ContentProject[]> {
  const payload = await cms()
  if (payload) {
    try {
      const result = await payload.find({
        collection: 'projects', limit: 100, depth: 2, sort: 'order',
        where: { _status: { equals: 'published' } },
      })
      if (result.docs.length) return result.docs.filter(item => item.sourcePath.startsWith('/work/'))
    } catch (err) { console.error('Failed to read projects', err instanceof Error ? err.message : err) }
  }
  return originalWork
}

export async function siteProject(path: string): Promise<ContentProject | undefined> {
  const payload = await cms()
  if (payload) {
    try {
      const result = await payload.find({
        collection: 'projects', limit: 1, depth: 2,
        where: { sourcePath: { equals: path }, _status: { equals: 'published' } },
      })
      if (result.docs[0]) return result.docs[0]
    } catch (err) { console.error('Failed to read case', err instanceof Error ? err.message : err) }
  }
  return originalPage(path)
}

export async function siteArticles(): Promise<ContentArticle[]> {
  const payload = await cms()
  if (payload) {
    try {
      const result = await payload.find({
        collection: 'articles', limit: 100, depth: 2, sort: '-publishedAt',
        where: { _status: { equals: 'published' } },
      })
      if (result.docs.length) return result.docs
    } catch (err) { console.error('Failed to read articles', err instanceof Error ? err.message : err) }
  }
  return originalArticles
}

export async function siteArticle(slug: string): Promise<ContentArticle | undefined> {
  const payload = await cms()
  if (payload) {
    try {
      const result = await payload.find({
        collection: 'articles', limit: 1, depth: 2,
        where: { slug: { equals: slug }, _status: { equals: 'published' } },
      })
      if (result.docs[0]) return result.docs[0]
    } catch (err) { console.error('Failed to read article', err instanceof Error ? err.message : err) }
  }
  return originalPage('/news/' + slug)
}

export function field<T = string>(entity: ContentPage | ContentProject | ContentArticle, key: string, fallback: T): T {
  const value = (entity as unknown as Record<string, unknown>)[key]
  return (value ?? fallback) as T
}

export function mediaPath(upload: unknown, initial?: string): string {
  if (upload && typeof upload === 'object' && 'url' in upload && typeof upload.url === 'string') {
    return upload.url.startsWith('/') ? upload.url : ''
  }
  return initial && initial.startsWith('/') ? initial : ''
}

export function entityCover(entity: ContentProject | ContentArticle): string {
  return mediaPath(field(entity, 'cover', null), field(entity, 'coverPath', field(entity, 'cover', '')) as string)
}
