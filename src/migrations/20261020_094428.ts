import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_about_editorial_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`name\` text,
  	\`portrait_id\` integer,
  	\`portrait_path\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_team_order_idx\` ON \`pages_blocks_about_editorial_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_team_parent_id_idx\` ON \`pages_blocks_about_editorial_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_team_portrait_idx\` ON \`pages_blocks_about_editorial_team\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_about_editorial_culture_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_culture_items_order_idx\` ON \`pages_blocks_about_editorial_culture_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_culture_items_parent_id_idx\` ON \`pages_blocks_about_editorial_culture_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_about_editorial_symbols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`alt\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_symbols_order_idx\` ON \`pages_blocks_about_editorial_symbols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_symbols_parent_id_idx\` ON \`pages_blocks_about_editorial_symbols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_symbols_image_idx\` ON \`pages_blocks_about_editorial_symbols\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_about_editorial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`statement\` text,
  	\`team_title\` text DEFAULT 'Команда',
  	\`team_intro\` text,
  	\`culture_title\` text DEFAULT 'Culture',
  	\`symbols_title\` text DEFAULT 'Контекст',
  	\`closing_image_id\` integer,
  	\`closing_image_path\` text,
  	\`closing_href\` text DEFAULT '/contact',
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_order_idx\` ON \`pages_blocks_about_editorial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_parent_id_idx\` ON \`pages_blocks_about_editorial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_path_idx\` ON \`pages_blocks_about_editorial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_hero_image_idx\` ON \`pages_blocks_about_editorial\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_editorial_closing_image_idx\` ON \`pages_blocks_about_editorial\` (\`closing_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_about_editorial_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`name\` text,
  	\`portrait_id\` integer,
  	\`portrait_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_team_order_idx\` ON \`_pages_v_blocks_about_editorial_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_team_parent_id_idx\` ON \`_pages_v_blocks_about_editorial_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_team_portrait_idx\` ON \`_pages_v_blocks_about_editorial_team\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_about_editorial_culture_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_culture_items_order_idx\` ON \`_pages_v_blocks_about_editorial_culture_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_culture_items_parent_id_idx\` ON \`_pages_v_blocks_about_editorial_culture_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_about_editorial_symbols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`alt\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_symbols_order_idx\` ON \`_pages_v_blocks_about_editorial_symbols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_symbols_parent_id_idx\` ON \`_pages_v_blocks_about_editorial_symbols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_symbols_image_idx\` ON \`_pages_v_blocks_about_editorial_symbols\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_about_editorial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`statement\` text,
  	\`team_title\` text DEFAULT 'Команда',
  	\`team_intro\` text,
  	\`culture_title\` text DEFAULT 'Culture',
  	\`symbols_title\` text DEFAULT 'Контекст',
  	\`closing_image_id\` integer,
  	\`closing_image_path\` text,
  	\`closing_href\` text DEFAULT '/contact',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_order_idx\` ON \`_pages_v_blocks_about_editorial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_parent_id_idx\` ON \`_pages_v_blocks_about_editorial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_path_idx\` ON \`_pages_v_blocks_about_editorial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_hero_image_idx\` ON \`_pages_v_blocks_about_editorial\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_editorial_closing_image_idx\` ON \`_pages_v_blocks_about_editorial\` (\`closing_image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_about_editorial_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`name\` text,
  	\`portrait_id\` integer,
  	\`portrait_path\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_team_order_idx\` ON \`projects_blocks_about_editorial_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_team_parent_id_idx\` ON \`projects_blocks_about_editorial_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_team_portrait_idx\` ON \`projects_blocks_about_editorial_team\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_about_editorial_culture_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_culture_items_order_idx\` ON \`projects_blocks_about_editorial_culture_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_culture_items_parent_id_idx\` ON \`projects_blocks_about_editorial_culture_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_about_editorial_symbols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`alt\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_symbols_order_idx\` ON \`projects_blocks_about_editorial_symbols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_symbols_parent_id_idx\` ON \`projects_blocks_about_editorial_symbols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_symbols_image_idx\` ON \`projects_blocks_about_editorial_symbols\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_about_editorial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`statement\` text,
  	\`team_title\` text DEFAULT 'Команда',
  	\`team_intro\` text,
  	\`culture_title\` text DEFAULT 'Culture',
  	\`symbols_title\` text DEFAULT 'Контекст',
  	\`closing_image_id\` integer,
  	\`closing_image_path\` text,
  	\`closing_href\` text DEFAULT '/contact',
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_order_idx\` ON \`projects_blocks_about_editorial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_parent_id_idx\` ON \`projects_blocks_about_editorial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_path_idx\` ON \`projects_blocks_about_editorial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_hero_image_idx\` ON \`projects_blocks_about_editorial\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_about_editorial_closing_image_idx\` ON \`projects_blocks_about_editorial\` (\`closing_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_about_editorial_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`name\` text,
  	\`portrait_id\` integer,
  	\`portrait_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_team_order_idx\` ON \`_projects_v_blocks_about_editorial_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_team_parent_id_idx\` ON \`_projects_v_blocks_about_editorial_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_team_portrait_idx\` ON \`_projects_v_blocks_about_editorial_team\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_about_editorial_culture_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_culture_items_order_idx\` ON \`_projects_v_blocks_about_editorial_culture_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_culture_items_parent_id_idx\` ON \`_projects_v_blocks_about_editorial_culture_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_about_editorial_symbols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`alt\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_symbols_order_idx\` ON \`_projects_v_blocks_about_editorial_symbols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_symbols_parent_id_idx\` ON \`_projects_v_blocks_about_editorial_symbols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_symbols_image_idx\` ON \`_projects_v_blocks_about_editorial_symbols\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_about_editorial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`statement\` text,
  	\`team_title\` text DEFAULT 'Команда',
  	\`team_intro\` text,
  	\`culture_title\` text DEFAULT 'Culture',
  	\`symbols_title\` text DEFAULT 'Контекст',
  	\`closing_image_id\` integer,
  	\`closing_image_path\` text,
  	\`closing_href\` text DEFAULT '/contact',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_order_idx\` ON \`_projects_v_blocks_about_editorial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_parent_id_idx\` ON \`_projects_v_blocks_about_editorial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_path_idx\` ON \`_projects_v_blocks_about_editorial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_hero_image_idx\` ON \`_projects_v_blocks_about_editorial\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_about_editorial_closing_image_idx\` ON \`_projects_v_blocks_about_editorial\` (\`closing_image_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_about_editorial_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`name\` text,
  	\`portrait_id\` integer,
  	\`portrait_path\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_team_order_idx\` ON \`articles_blocks_about_editorial_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_team_parent_id_idx\` ON \`articles_blocks_about_editorial_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_team_portrait_idx\` ON \`articles_blocks_about_editorial_team\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_about_editorial_culture_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_culture_items_order_idx\` ON \`articles_blocks_about_editorial_culture_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_culture_items_parent_id_idx\` ON \`articles_blocks_about_editorial_culture_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_about_editorial_symbols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`alt\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_symbols_order_idx\` ON \`articles_blocks_about_editorial_symbols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_symbols_parent_id_idx\` ON \`articles_blocks_about_editorial_symbols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_symbols_image_idx\` ON \`articles_blocks_about_editorial_symbols\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_about_editorial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`statement\` text,
  	\`team_title\` text DEFAULT 'Команда',
  	\`team_intro\` text,
  	\`culture_title\` text DEFAULT 'Culture',
  	\`symbols_title\` text DEFAULT 'Контекст',
  	\`closing_image_id\` integer,
  	\`closing_image_path\` text,
  	\`closing_href\` text DEFAULT '/contact',
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_order_idx\` ON \`articles_blocks_about_editorial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_parent_id_idx\` ON \`articles_blocks_about_editorial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_path_idx\` ON \`articles_blocks_about_editorial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_hero_image_idx\` ON \`articles_blocks_about_editorial\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_about_editorial_closing_image_idx\` ON \`articles_blocks_about_editorial\` (\`closing_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_about_editorial_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`name\` text,
  	\`portrait_id\` integer,
  	\`portrait_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_team_order_idx\` ON \`_articles_v_blocks_about_editorial_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_team_parent_id_idx\` ON \`_articles_v_blocks_about_editorial_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_team_portrait_idx\` ON \`_articles_v_blocks_about_editorial_team\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_about_editorial_culture_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_culture_items_order_idx\` ON \`_articles_v_blocks_about_editorial_culture_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_culture_items_parent_id_idx\` ON \`_articles_v_blocks_about_editorial_culture_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_about_editorial_symbols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`alt\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_about_editorial\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_symbols_order_idx\` ON \`_articles_v_blocks_about_editorial_symbols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_symbols_parent_id_idx\` ON \`_articles_v_blocks_about_editorial_symbols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_symbols_image_idx\` ON \`_articles_v_blocks_about_editorial_symbols\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_about_editorial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`statement\` text,
  	\`team_title\` text DEFAULT 'Команда',
  	\`team_intro\` text,
  	\`culture_title\` text DEFAULT 'Culture',
  	\`symbols_title\` text DEFAULT 'Контекст',
  	\`closing_image_id\` integer,
  	\`closing_image_path\` text,
  	\`closing_href\` text DEFAULT '/contact',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`closing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_order_idx\` ON \`_articles_v_blocks_about_editorial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_parent_id_idx\` ON \`_articles_v_blocks_about_editorial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_path_idx\` ON \`_articles_v_blocks_about_editorial\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_hero_image_idx\` ON \`_articles_v_blocks_about_editorial\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_about_editorial_closing_image_idx\` ON \`_articles_v_blocks_about_editorial\` (\`closing_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_about_editorial_team\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_about_editorial_culture_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_about_editorial_symbols\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_about_editorial\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_about_editorial_team\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_about_editorial_culture_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_about_editorial_symbols\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_about_editorial\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_about_editorial_team\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_about_editorial_culture_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_about_editorial_symbols\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_about_editorial\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_about_editorial_team\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_about_editorial_culture_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_about_editorial_symbols\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_about_editorial\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_about_editorial_team\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_about_editorial_culture_items\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_about_editorial_symbols\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_about_editorial\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_about_editorial_team\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_about_editorial_culture_items\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_about_editorial_symbols\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_about_editorial\`;`)
}
