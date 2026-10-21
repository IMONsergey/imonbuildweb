import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { basename } from 'node:path'
if (basename(process.cwd()) !== 'imonbuildweb-studio') throw new Error('QA cleanup only allowed in isolated Studio worktree')

const payload = await getPayload({ config })
const result = await payload.find({ collection: 'pages', overrideAccess: true, limit: 100,
  where: { or: [{ path: { like: 'qa-studio-' } }, { path: { like: 'qa-puck-' } }] } })
let count = 0
for (const page of result.docs) {
  const isStudio=/^\/qa-studio-[a-z0-9]+$/.test(page.path) && /^QA Studio [a-z0-9]+$/.test(page.title)
  const isPuck=/^\/qa-puck-[a-z0-9]+$/.test(page.path) && /^QA Puck [a-z0-9]+$/.test(page.title)
  const isPuckNew=/^\/qa-puck-new-[a-z0-9]+$/.test(page.path) && /^QA New Puck [a-z0-9]+$/.test(page.title)
  if (!(isStudio || isPuck || isPuckNew)) continue
  await payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })
  count++
}
console.log('Removed isolated QA fixtures:', count)
process.exit(0)
