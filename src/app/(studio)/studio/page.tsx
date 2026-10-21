import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Studio } from '@/studio/Studio'
import { bootstrap, studioSession } from '@/studio/server'
import { StudioError } from '@/studio/schema'
export const dynamic = 'force-dynamic'
export default async function StudioPage() {
  let session
  try { session = await studioSession(await headers()) }
  catch (error) { if (error instanceof StudioError && error.status === 401) redirect('/studio/login?next=%2Fstudio'); throw error }
  const initial = await bootstrap(session.payload, session.user)
  return <Studio initial={initial}/>
}
