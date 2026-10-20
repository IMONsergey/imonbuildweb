import type { MetadataRoute } from 'next'
import { siteArticles, sitePage, siteProject } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://imon.agency').replace(/\/$/, '')
  const routes: MetadataRoute.Sitemap = []
  for (const path of ['/', '/about', '/work', '/news', '/contact']) {
    const page = await sitePage(path)
    if (page) routes.push({ url: siteUrl + path, lastModified: new Date(), changeFrequency: path === '/' ? 'weekly' : 'monthly' })
  }
  const articles = await siteArticles()
  for (const path of ['/cases/page', '/cases/askona-life-group']) {
    if (await siteProject(path)) routes.push({ url: siteUrl + path, lastModified: new Date(), changeFrequency: 'yearly' })
  }
  for (const article of articles) {
    if ('editorialReviewed' in article && article.editorialReviewed === true)
      routes.push({ url: siteUrl + '/news/' + article.slug, lastModified: new Date(), changeFrequency: 'monthly' })
  }
  return routes
}
