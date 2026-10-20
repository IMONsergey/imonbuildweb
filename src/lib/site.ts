import source from '@/content/source.json'
import config from '@/payload.config'
import { getPayload, type Payload } from 'payload'
import { cookies } from 'next/headers'
import { validatePreviewToken } from './previewToken'
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
const emergencySnapshot = process.env.IMON_ENABLE_SOURCE_SNAPSHOT === '1'

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

async function cms(): Promise<Payload | null> {
  try {
    return await getPayload({ config })
  } catch (error) {
    if (!emergencySnapshot) throw error
    console.error('CMS unavailable: explicitly enabled offline source snapshot mode')
    return null
  }
}

async function previewAuthorized(path: string, urlToken?: string): Promise<boolean> {
  if (validatePreviewToken(urlToken, path)) return true
  return validatePreviewToken((await cookies()).get('imon-preview-token')?.value, path)
}

export async function siteSettings() {
  const payload = await cms()
  if (!payload) return { settings: fallbackSettings, links: fallbackNavigation }
  const [settings, nav] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'navigation' }),
  ])
  const links = Array.isArray(nav.links) && nav.links.length
    ? nav.links.filter(link => !!link.href && !!link.label).map(link => ({
      label: link.label,
      href: link.href,
    }))
    : fallbackNavigation
  return {
    settings: { ...fallbackSettings, ...settings },
    links,
  }
}

export async function sitePage(path: string, urlToken?: string): Promise<ContentPage | undefined> {
  const payload = await cms()
  if (!payload) return originalPage(path)
  const preview = await previewAuthorized(path, urlToken)
  const result = await payload.find({
    collection: 'pages', limit: 1, depth: 2, draft: preview,
    where: preview
      ? { path: { equals: path } }
      : { and: [{ path: { equals: path } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0]
}

export async function siteProjects(): Promise<ContentProject[]> {
  const payload = await cms()
  if (!payload) return originalWork
  const preview = await previewAuthorized('/work')
  const result = await payload.find({
    collection: 'projects', limit: 100, depth: 2, draft: preview, sort: 'order',
    where: preview ? {} : { _status: { equals: 'published' } },
  })
  return result.docs.filter(project => project.sourcePath.startsWith('/work/'))
}

export async function siteProject(path: string, urlToken?: string): Promise<ContentProject | undefined> {
  const payload = await cms()
  if (!payload) return originalPage(path)
  const preview = await previewAuthorized(path, urlToken)
  const result = await payload.find({
    collection: 'projects', limit: 1, depth: 2, draft: preview,
    where: preview
      ? { sourcePath: { equals: path } }
      : { and: [{ sourcePath: { equals: path } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0]
}

export async function siteArticles(): Promise<ContentArticle[]> {
  const payload = await cms()
  if (!payload) return originalArticles
  const preview = await previewAuthorized('/news')
  const result = await payload.find({
    collection: 'articles', limit: 100, depth: 2, draft: preview, sort: '-publishedAt',
    where: preview ? {} : { _status: { equals: 'published' } },
  })
  return result.docs
}

export async function siteArticle(slug: string, urlToken?: string): Promise<ContentArticle | undefined> {
  const payload = await cms()
  if (!payload) return originalPage('/news/' + slug)
  const preview = await previewAuthorized('/news/' + slug, urlToken)
  const result = await payload.find({
    collection: 'articles', limit: 1, depth: 2, draft: preview,
    where: preview
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0]
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
