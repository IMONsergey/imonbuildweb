import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { basename } from 'node:path'
if (basename(process.cwd()) !== 'imonbuildweb-studio') throw new Error('QA cleanup only allowed in isolated Studio worktree')

const payload = await getPayload({ config })
const result = await payload.find({ collection: 'pages', overrideAccess: true, limit: 100,
  where: { path: { like: 'qa-studio-' } } })
let count = 0
for (const page of result.docs) {
  if (!/^\/qa-studio-[a-z0-9]+$/.test(page.path) || !/^QA Studio [a-z0-9]+$/.test(page.title)) continue
  await payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })
  count++
}
console.log('Removed isolated QA fixtures:', count)
process.exit(0)
