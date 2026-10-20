import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_about_editorial_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_values_order_idx\` ON \`pages_blocks_about_editorial_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_values_parent_id_idx\` ON \`pages_blocks_about_editorial_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_about_editorial_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_values_order_idx\` ON \`_pages_v_blocks_about_editorial_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_values_parent_id_idx\` ON \`_pages_v_blocks_about_editorial_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_about_editorial_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_values_order_idx\` ON \`projects_blocks_about_editorial_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_values_parent_id_idx\` ON \`projects_blocks_about_editorial_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_about_editorial_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_values_order_idx\` ON \`_projects_v_blocks_about_editorial_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_values_parent_id_idx\` ON \`_projects_v_blocks_about_editorial_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_about_editorial_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_values_order_idx\` ON \`articles_blocks_about_editorial_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_values_parent_id_idx\` ON \`articles_blocks_about_editorial_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_about_editorial_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_values_order_idx\` ON \`_articles_v_blocks_about_editorial_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_values_parent_id_idx\` ON \`_articles_v_blocks_about_editorial_values\` (\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_about_editorial_values\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_about_editorial_values\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_about_editorial_values\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_about_editorial_values\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_about_editorial_values\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_about_editorial_values\`;`)
}
