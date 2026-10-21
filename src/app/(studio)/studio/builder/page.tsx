import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { studioSession, readDocument, bootstrap } from '@/studio/server'
import { StudioError } from '@/studio/schema'
import { PuckBuilder } from '@/studio/puck/Builder'
import type { StudioCollection } from '@/studio/model'
import '@puckeditor/core/puck.css'
import '@/studio/puck/builder.css'

export const dynamic = 'force-dynamic'

export default async function PuckBuilderPage({ searchParams }: {
  searchParams: Promise<{ collection?: string; id?: string }>
}) {
  let session
  try { session = await studioSession(await headers()) }
  catch (cause) {
    if (cause instanceof StudioError && cause.status === 401) redirect('/admin/login?redirect=%2Fstudio%2Fbuilder')
    throw cause
  }
  const query = await searchParams
  const directory = await bootstrap(session.payload,session.user)
  const selection = directory.documents.find(item=>item.collection===query.collection && String(item.id)===query.id)
    || directory.documents.find(item=>item.collection==='pages' && item.path==='/')
  if (!selection) notFound()
  const collection:StudioCollection=selection.collection
  const [doc,media] = await Promise.all([
    readDocument(session.payload,session.user,collection,selection.id),
    session.payload.find({collection:'media',limit:500,depth:0,overrideAccess:false,user:session.user}),
  ])
  const assets = media.docs.filter(item=>item.filename).map(item=>({
    id:item.id,
    url:'/api/media/file/'+encodeURIComponent(item.filename!),
    alt:item.alt || item.filename || '',
    mimeType:item.mimeType || '',
  }))
  return <PuckBuilder key={collection + ':' + selection.id} initial={doc} directory={directory.documents} initialAssets={assets}/>
}
