import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleView, PageView, ProjectView } from '@/components/Site'
import { siteArticle, sitePage, siteProject } from '@/lib/site'

type Params = { params: Promise<{ slug: string[] }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const path = '/' + slug.join('/')
  const entity = path.startsWith('/work/') || path.startsWith('/cases/')
    ? await siteProject(path)
    : path.startsWith('/news/') ? await siteArticle(slug.slice(1).join('/'))
    : await sitePage(path)
  const title = entity?.title || 'Страница не найдена'
  return { title, robots: path.startsWith('/news/') || path.startsWith('/privacy-policy') || path.startsWith('/term-condition') ? { index: false, follow: false } : undefined }
}

export default async function DynamicPage({ params }: Params) {
  const { slug } = await params
  const path = '/' + slug.join('/')
  if (path.startsWith('/work/') || path.startsWith('/cases/')) {
    const project = await siteProject(path)
    if (!project) notFound()
    return <ProjectView project={project} />
  }
  if (path.startsWith('/news/')) {
    const article = await siteArticle(slug.slice(1).join('/'))
    if (!article) notFound()
    return <ArticleView article={article} />
  }
  const page = await sitePage(path)
  if (!page) notFound()
  return <PageView page={page} />
}
