import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { studioSession } from '@/studio/server'
import { StudioError } from '@/studio/schema'
import { StudioLogin } from '@/studio/StudioLogin'

export const dynamic = 'force-dynamic'

export default async function StudioLoginPage({ searchParams }: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next: requested } = await searchParams
  const next = typeof requested === 'string' && /^\/studio(?:[/?#]|$)/.test(requested) && !requested.startsWith('//')
    ? requested : '/studio'
  let authenticated = false
  try {
    await studioSession(await headers())
    authenticated = true
  } catch (error) {
    if (!(error instanceof StudioError && error.status === 401)) throw error
  }
  if (authenticated) redirect(next)
  return <StudioLogin next={next}/>
}
