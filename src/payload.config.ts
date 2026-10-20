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

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — I’MON CMS' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Pages, Projects, Articles, Leads],
  globals: [Settings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./imonbuildweb.db' },
    wal: true,
  }),
  sharp,
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
})
