import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Nullable fields preserve old inquiries. SQLite permits multiple NULLs in a unique index.
  await db.run(sql`ALTER TABLE leads ADD COLUMN submission_id text;`)
  await db.run(sql`ALTER TABLE leads ADD COLUMN request_hash text;`)
  await db.run(sql`CREATE UNIQUE INDEX leads_submission_id_idx ON leads (submission_id);`)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX leads_submission_id_idx;`)
  await db.run(sql`ALTER TABLE leads DROP COLUMN submission_id;`)
  await db.run(sql`ALTER TABLE leads DROP COLUMN request_hash;`)
}
