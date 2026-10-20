import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_text\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_text\` ADD \`image_path\` text;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_image_idx\` ON \`pages_blocks_text\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_quote\` ADD \`heading\` text DEFAULT 'Принцип';`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`studio\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_text\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_text\` ADD \`image_path\` text;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_image_idx\` ON \`_pages_v_blocks_text\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_quote\` ADD \`heading\` text DEFAULT 'Принцип';`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_studio\` text;`)
  await db.run(sql`ALTER TABLE \`projects_blocks_text\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`projects_blocks_text\` ADD \`image_path\` text;`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_image_idx\` ON \`projects_blocks_text\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`projects_blocks_quote\` ADD \`heading\` text DEFAULT 'Принцип';`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`studio\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v_blocks_text\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_projects_v_blocks_text\` ADD \`image_path\` text;`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_image_idx\` ON \`_projects_v_blocks_text\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_projects_v_blocks_quote\` ADD \`heading\` text DEFAULT 'Принцип';`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_studio\` text;`)
  await db.run(sql`ALTER TABLE \`articles_blocks_text\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`articles_blocks_text\` ADD \`image_path\` text;`)
  await db.run(sql`CREATE INDEX \`articles_blocks_text_image_idx\` ON \`articles_blocks_text\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`articles_blocks_quote\` ADD \`heading\` text DEFAULT 'Принцип';`)
  await db.run(sql`ALTER TABLE \`articles\` ADD \`studio\` text;`)
  await db.run(sql`ALTER TABLE \`_articles_v_blocks_text\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_articles_v_blocks_text\` ADD \`image_path\` text;`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_image_idx\` ON \`_articles_v_blocks_text\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_articles_v_blocks_quote\` ADD \`heading\` text DEFAULT 'Принцип';`)
  await db.run(sql`ALTER TABLE \`_articles_v\` ADD \`version_studio\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`layout\` text DEFAULT 'split',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_text\`("_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "block_name") SELECT "_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "block_name" FROM \`pages_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_text\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_text\` RENAME TO \`pages_blocks_text\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_order_idx\` ON \`pages_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_parent_id_idx\` ON \`pages_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_path_idx\` ON \`pages_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`layout\` text DEFAULT 'split',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_text\`("_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "_uuid", "block_name" FROM \`_pages_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_text\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_text\` RENAME TO \`_pages_v_blocks_text\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_order_idx\` ON \`_pages_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_parent_id_idx\` ON \`_pages_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_path_idx\` ON \`_pages_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new_projects_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`layout\` text DEFAULT 'split',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projects_blocks_text\`("_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "block_name") SELECT "_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "block_name" FROM \`projects_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_text\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects_blocks_text\` RENAME TO \`projects_blocks_text\`;`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_order_idx\` ON \`projects_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_parent_id_idx\` ON \`projects_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_path_idx\` ON \`projects_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__projects_v_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`layout\` text DEFAULT 'split',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__projects_v_blocks_text\`("_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "_uuid", "block_name" FROM \`_projects_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_text\`;`)
  await db.run(sql`ALTER TABLE \`__new__projects_v_blocks_text\` RENAME TO \`_projects_v_blocks_text\`;`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_order_idx\` ON \`_projects_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_parent_id_idx\` ON \`_projects_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_path_idx\` ON \`_projects_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new_articles_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`layout\` text DEFAULT 'split',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_articles_blocks_text\`("_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "block_name") SELECT "_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "block_name" FROM \`articles_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_text\`;`)
  await db.run(sql`ALTER TABLE \`__new_articles_blocks_text\` RENAME TO \`articles_blocks_text\`;`)
  await db.run(sql`CREATE INDEX \`articles_blocks_text_order_idx\` ON \`articles_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_text_parent_id_idx\` ON \`articles_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_text_path_idx\` ON \`articles_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__articles_v_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`body\` text,
  	\`layout\` text DEFAULT 'split',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__articles_v_blocks_text\`("_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "eyebrow", "heading", "body", "layout", "_uuid", "block_name" FROM \`_articles_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_text\`;`)
  await db.run(sql`ALTER TABLE \`__new__articles_v_blocks_text\` RENAME TO \`_articles_v_blocks_text\`;`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_order_idx\` ON \`_articles_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_parent_id_idx\` ON \`_articles_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_path_idx\` ON \`_articles_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_quote\` DROP COLUMN \`heading\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`studio\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_quote\` DROP COLUMN \`heading\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_studio\`;`)
  await db.run(sql`ALTER TABLE \`projects_blocks_quote\` DROP COLUMN \`heading\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`studio\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v_blocks_quote\` DROP COLUMN \`heading\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_studio\`;`)
  await db.run(sql`ALTER TABLE \`articles_blocks_quote\` DROP COLUMN \`heading\`;`)
  await db.run(sql`ALTER TABLE \`articles\` DROP COLUMN \`studio\`;`)
  await db.run(sql`ALTER TABLE \`_articles_v_blocks_quote\` DROP COLUMN \`heading\`;`)
  await db.run(sql`ALTER TABLE \`_articles_v\` DROP COLUMN \`version_studio\`;`)
}
