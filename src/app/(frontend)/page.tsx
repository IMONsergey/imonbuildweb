import { PageView } from '@/components/Site'
import { sitePage } from '@/lib/site'
import { validatePreviewToken } from '@/lib/previewToken'
export const dynamic = 'force-dynamic'
export default async function HomePage({ searchParams }: { searchParams: Promise<{ preview_token?: string }> }) {
  const urlToken = (await searchParams).preview_token
  const page = await sitePage('/', urlToken)
  if (!page) return null
  return <PageView page={page} isPreview={validatePreviewToken(urlToken, '/')} />
}
