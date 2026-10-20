import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import source from '../src/content/source.json'

// One-time local import publishing: the acquired template's 8 articles are
// visible but excluded from search indexing until an editor verifies them.
const expected = new Set(source.filter(page => page.kind === 'article').map(page => page.slug.split('/').pop()))
const payload = await getPayload({ config })
const result = await payload.find({ collection: 'articles', limit: 100, draft: true, overrideAccess: true })
for (const article of result.docs) {
  if (!expected.has(article.slug) || article._status !== 'draft') continue
  await payload.update({
    collection: 'articles',
    id: article.id,
    draft: false,
    overrideAccess: true,
    data: { _status: 'published', editorialReviewed: false },
  })
  console.log('Published but NOINDEX (editorial review pending):', article.slug)
}
process.exit(0)
