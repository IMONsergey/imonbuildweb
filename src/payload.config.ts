import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Articles } from './collections/Articles'
import { Leads } from './collections/Leads'
import { Settings } from './globals/Settings'
import { Navigation } from './globals/Navigation'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const canonicalOrigin = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const allowedOrigins = [canonicalOrigin]
try {
  const local = new URL(canonicalOrigin)
  if (local.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(local.hostname)) {
    local.hostname = local.hostname === 'localhost' ? '127.0.0.1' : 'localhost'
    allowedOrigins.push(local.origin)
  }
} catch { throw new Error('NEXT_PUBLIC_SERVER_URL must be an absolute origin') }


export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
  admin: {
    user: Users.slug,
    components: { beforeNavLinks: ['/components/admin/StudioLink#StudioLink'] },
    meta: { titleSuffix: ' — I’MON CMS' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Pages, Projects, Articles, Leads],
  globals: [Settings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    push: false,
    client: { url: process.env.DATABASE_URL || 'file:./imonbuildweb.db' },
    wal: true,
  }),
  sharp,
  cors: allowedOrigins,
  csrf: allowedOrigins,
})
