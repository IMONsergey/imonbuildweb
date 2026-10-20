import { PageView } from '@/components/Site'
import { sitePage } from '@/lib/site'
export const dynamic = 'force-dynamic'
export default async function HomePage() {
  const page = await sitePage('/')
  if (!page) return null
  return <PageView page={page}/>
}
