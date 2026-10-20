import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { studioSession } from '@/studio/server'
import { collectionName, identifier, StudioError } from '@/studio/schema'
import { CanvasBridge } from '@/studio/CanvasBridge'
import { ArticleView, PageView, ProjectView } from '@/components/Site'
import type { Page, Project, Article } from '@/payload-types'
import type { RecordData } from '@/studio/model'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Холст — I’MON Studio', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default async function StudioCanvas({ searchParams }: { searchParams: Promise<{ collection?: string; id?: string }> }) {
  const query = await searchParams
  const collection = collectionName(query.collection), id = identifier(query.id)
  let session
  try { session = await studioSession(await headers()) } catch (error) { if (error instanceof StudioError && error.status === 401) notFound(); throw error }
  const { payload, user } = session
  const content = await payload.findByID({ collection, id, draft: true, depth: 2, user, overrideAccess: false })
  if (!content) notFound()
  return <>{collection === 'pages' ? <PageView page={content as Page}/> : collection === 'projects' ? <ProjectView project={content as Project}/> : <ArticleView article={content as Article}/>}<CanvasBridge data={content as unknown as RecordData}/></>
}
