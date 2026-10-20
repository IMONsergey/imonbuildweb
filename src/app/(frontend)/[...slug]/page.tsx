import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArticleView, PageView, ProjectView } from '@/components/Site'
import { siteArticle, sitePage, siteProject } from '@/lib/site'
import { validatePreviewToken } from '@/lib/previewToken'

type Params = { params: Promise<{ slug: string[] }>; searchParams: Promise<{ preview?: string; preview_token?: string }> }
export const dynamic = 'force-dynamic'

async function resolveContent(path: string, slug: string[], urlToken?: string) {
  return path.startsWith('/work/') || path.startsWith('/cases/')
    ? await siteProject(path, urlToken)
    : path.startsWith('/news/') ? await siteArticle(slug.slice(1).join('/'), urlToken)
    : await sitePage(path, urlToken)
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { slug } = await params
  const path = '/' + slug.join('/')
  const query = await searchParams
  const previewByUrl = query.preview === '1'
  const entity = await resolveContent(path, slug, query.preview_token)
  const { isEnabled: preview } = await draftMode()
  if (!entity) return { title: 'Страница не найдена', robots: { index: false, follow: false } }
  const data = entity as unknown as Record<string, unknown>
  const seo = (data.seo || {}) as Record<string, unknown>
  const title = typeof seo.title === 'string' && seo.title ? seo.title : entity.title
  const description = typeof seo.description === 'string' && seo.description
    ? seo.description
    : typeof data.seoDescription === 'string' && data.seoDescription
      ? data.seoDescription
      : typeof data.summary === 'string' && data.summary
        ? data.summary
        : typeof data.intro === 'string' ? data.intro : ''
  const noindex = preview || previewByUrl ||
    seo.noindex === true ||
    path.startsWith('/news/') && data.editorialReviewed !== true ||
    path.startsWith('/work/') ||
    path === '/privacy-policy' ||
    path === '/term-condition'
  return {
    title,
    description,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title, description, type: 'website' },
    referrer: previewByUrl ? 'no-referrer' : 'strict-origin-when-cross-origin',
  }
}

export default async function DynamicPage({ params, searchParams }: Params) {
  const { slug } = await params
  const path = '/' + slug.join('/')
  const urlToken = (await searchParams).preview_token
  const isPreview = validatePreviewToken(urlToken, path)
  if (path.startsWith('/work/') || path.startsWith('/cases/')) {
    const project = await siteProject(path, urlToken)
    if (!project) notFound()
    return <ProjectView project={project} isPreview={isPreview} />
  }
  if (path.startsWith('/news/')) {
    const article = await siteArticle(slug.slice(1).join('/'), urlToken)
    if (!article) notFound()
    return <ArticleView article={article} isPreview={isPreview} />
  }
  const page = await sitePage(path, urlToken)
  if (!page) notFound()
  return <PageView page={page} isPreview={isPreview} />
}
