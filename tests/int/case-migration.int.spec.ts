import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createLocalReq, getPayload } from 'payload'
import { sqliteAdapter, sql } from '@payloadcms/db-sqlite'
import { describe, expect, it } from 'vitest'
import config from '@/payload.config'
import { migrations } from '@/migrations'
import { up } from '@/migrations/20261027_051821_case_editorial'

describe('case editorial migration on an existing database', () => {
  it('preserves unknown projects, drafts and versions, and respects choices on rerun', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'imon-migration-'))
    const adapter = sqliteAdapter({ push: false, client: { url: `file:${directory}/test.db` } })
    const isolated = await getPayload({
      key: directory,
      config: { ...await config, db: { ...adapter, name: adapter.name || 'sqlite', allowIDOnCreate: adapter.allowIDOnCreate ?? false } },
    })
    try {
      const db = isolated.db.drizzle
      const args = { db, payload: isolated, req: await createLocalReq({}, isolated) }
      for (const migration of migrations.filter(m => m.name !== '20261027_051821_case_editorial')) await migration.up(args)
      await db.run(sql`INSERT INTO projects (id, slug, source_path, title, summary, studio, _status) VALUES
        (9001, 'new-client', '/cases/new-client', 'Real existing project', 'Newer client edits', '{"nodes":{"hero":{"color":"red"}}}', 'published'),
        (9002, 'be-fresh', '/work/be-fresh', 'Reworked client project', 'Custom content on an old demo route', null, 'published'),
        (9003, 'unreleased', '/cases/unreleased', 'Unreleased project', 'Keep this draft', null, 'draft')`)
      await db.run(sql`INSERT INTO _projects_v (parent_id, version_slug, version_source_path, version_title, version__status) VALUES
        (9001, 'new-client', '/cases/new-client', 'Earlier client version', 'published')`)
      await db.run(sql`INSERT INTO projects_blocks_text (_order,_parent_id,_path,id,heading,body) VALUES (1,9001,'sections','custom-block','Client heading','Newer untouched case body')`)
      const blocksBefore = await db.all(sql`SELECT * FROM projects_blocks_text`)
      const versionsBefore = await db.all(sql`SELECT version_title,version__status FROM _projects_v`)
      const before = await db.all(sql`SELECT id,title,summary,studio,_status,updated_at FROM projects ORDER BY id`)
      await up(args)
      expect(await db.all(sql`SELECT id,title,summary,studio,_status,updated_at FROM projects ORDER BY id`)).toEqual(before)
      expect(await db.all(sql`SELECT portfolio_status FROM projects`)).toEqual([
        { portfolio_status: 'portfolio' }, { portfolio_status: 'portfolio' }, { portfolio_status: 'portfolio' },
      ])
      const visible = await isolated.find({ collection: 'projects', overrideAccess: false, sort: 'id' })
      expect(visible.docs.map(p => p.id)).toEqual([9001, 9002])
      expect(await db.all(sql`SELECT version_portfolio_status FROM _projects_v`)).toEqual([{ version_portfolio_status: 'portfolio' }])
      // A deliberate editor decision must not be undone by a repeated migration.
      await db.run(sql`UPDATE projects SET portfolio_status = 'archive' WHERE id = 9002`)
      const once = await db.all(sql`SELECT * FROM projects ORDER BY id`)
      await up(args)
      expect(await db.all(sql`SELECT * FROM projects ORDER BY id`)).toEqual(once)
      const after = await isolated.find({ collection: 'projects', overrideAccess: false })
      expect(after.docs.map(p => p.id)).toEqual([9001])
      expect(await db.all(sql`SELECT * FROM projects_blocks_text`)).toEqual(blocksBefore)
      expect(await db.all(sql`SELECT version_title,version__status FROM _projects_v`)).toEqual(versionsBefore)
      await db.run(sql`INSERT INTO projects (slug,source_path,title,_status) VALUES ('fresh','/cases/fresh','New unreviewed','published')`)
      expect(await db.all(sql`SELECT portfolio_status FROM projects WHERE slug='fresh'`)).toEqual([{ portfolio_status: 'archive' }])
    } finally {
      await isolated.destroy()
      await rm(directory, { recursive: true, force: true })
    }
  }, 30_000)
})
