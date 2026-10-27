import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Only a newly added placement column is backfilled. Existing decisions survive
  // reruns, including explicit archive choices and newer editorial content.
  const columns = [
    ['pages_blocks_visual', 'alt'],
    ['pages_blocks_gallery_items', 'alt'],
    ['_pages_v_blocks_visual', 'alt'],
    ['_pages_v_blocks_gallery_items', 'alt'],
    ['projects_blocks_visual', 'alt'],
    ['projects_blocks_gallery_items', 'alt'],
    ['projects', 'portfolio_status'],
    ['_projects_v_blocks_visual', 'alt'],
    ['_projects_v_blocks_gallery_items', 'alt'],
    ['_projects_v', 'version_portfolio_status'],
    ['articles_blocks_visual', 'alt'],
    ['articles_blocks_gallery_items', 'alt'],
    ['_articles_v_blocks_visual', 'alt'],
    ['_articles_v_blocks_gallery_items', 'alt'],
  ] as const
  for (const [table, column] of columns) {
    const existing = await db.all<{ name: string }>(sql`PRAGMA table_info(${sql.identifier(table)})`)
    if (existing.some(field => field.name === column)) continue
    const placement = column.endsWith('portfolio_status')
    await db.run(sql`ALTER TABLE ${sql.identifier(table)} ADD ${sql.identifier(column)} text ${placement ? sql`DEFAULT 'archive'` : sql``}`)
    if (placement) {
      // Preserve visibility of ALL pre-existing records, regardless of route/name.
      // _status remains unchanged: drafts stay drafts. New records default to archive.
      await db.run(sql`UPDATE ${sql.identifier(table)} SET ${sql.identifier(column)} = 'portfolio'`)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_visual\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_gallery_items\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_visual\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_gallery_items\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`projects_blocks_visual\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`projects_blocks_gallery_items\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`portfolio_status\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v_blocks_visual\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v_blocks_gallery_items\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_portfolio_status\`;`)
  await db.run(sql`ALTER TABLE \`articles_blocks_visual\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`articles_blocks_gallery_items\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`_articles_v_blocks_visual\` DROP COLUMN \`alt\`;`)
  await db.run(sql`ALTER TABLE \`_articles_v_blocks_gallery_items\` DROP COLUMN \`alt\`;`)
}
