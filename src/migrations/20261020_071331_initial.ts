import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_text\` (
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
  await db.run(sql`CREATE INDEX \`pages_blocks_text_order_idx\` ON \`pages_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_parent_id_idx\` ON \`pages_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_path_idx\` ON \`pages_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_visual\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`display\` text DEFAULT 'wide',
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_visual_order_idx\` ON \`pages_blocks_visual\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_visual_parent_id_idx\` ON \`pages_blocks_visual\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_visual_path_idx\` ON \`pages_blocks_visual\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_visual_media_idx\` ON \`pages_blocks_visual\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_items_order_idx\` ON \`pages_blocks_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_items_parent_id_idx\` ON \`pages_blocks_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_items_media_idx\` ON \`pages_blocks_gallery_items\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_order_idx\` ON \`pages_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_parent_id_idx\` ON \`pages_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_path_idx\` ON \`pages_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`details\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_items_order_idx\` ON \`pages_blocks_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_items_parent_id_idx\` ON \`pages_blocks_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_items_image_idx\` ON \`pages_blocks_services_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_order_idx\` ON \`pages_blocks_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_parent_id_idx\` ON \`pages_blocks_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_path_idx\` ON \`pages_blocks_services\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_order_idx\` ON \`pages_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_items_parent_id_idx\` ON \`pages_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'FAQ',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_order_idx\` ON \`pages_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_parent_id_idx\` ON \`pages_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_faq_path_idx\` ON \`pages_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`quote\` text,
  	\`attribution\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_order_idx\` ON \`pages_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_parent_id_idx\` ON \`pages_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_path_idx\` ON \`pages_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_quote_image_idx\` ON \`pages_blocks_quote\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`href\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_items_order_idx\` ON \`pages_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_items_parent_id_idx\` ON \`pages_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_items_image_idx\` ON \`pages_blocks_cards_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_order_idx\` ON \`pages_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_parent_id_idx\` ON \`pages_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cards_path_idx\` ON \`pages_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'projects',
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`limit\` numeric DEFAULT 8,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_listing_order_idx\` ON \`pages_blocks_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_listing_parent_id_idx\` ON \`pages_blocks_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_listing_path_idx\` ON \`pages_blocks_listing\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`show_form\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_order_idx\` ON \`pages_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_parent_id_idx\` ON \`pages_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_path_idx\` ON \`pages_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`button_text\` text DEFAULT 'Обсудить задачу',
  	\`href\` text DEFAULT '/contact',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`path\` text,
  	\`title\` text,
  	\`kind\` text DEFAULT 'standard',
  	\`eyebrow\` text,
  	\`intro\` text,
  	\`hero_title\` text,
  	\`hero_video_id\` integer,
  	\`hero_video_path\` text,
  	\`hero_image_id\` integer,
  	\`hero_image_path\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_path_idx\` ON \`pages\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_video_idx\` ON \`pages\` (\`hero_video_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_image_idx\` ON \`pages\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_text\` (
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
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_order_idx\` ON \`_pages_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_parent_id_idx\` ON \`_pages_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_text_path_idx\` ON \`_pages_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_visual\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`display\` text DEFAULT 'wide',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_visual_order_idx\` ON \`_pages_v_blocks_visual\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_visual_parent_id_idx\` ON \`_pages_v_blocks_visual\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_visual_path_idx\` ON \`_pages_v_blocks_visual\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_visual_media_idx\` ON \`_pages_v_blocks_visual\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_items_order_idx\` ON \`_pages_v_blocks_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_items_parent_id_idx\` ON \`_pages_v_blocks_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_items_media_idx\` ON \`_pages_v_blocks_gallery_items\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_order_idx\` ON \`_pages_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_parent_id_idx\` ON \`_pages_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_path_idx\` ON \`_pages_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`details\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_items_order_idx\` ON \`_pages_v_blocks_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_items_parent_id_idx\` ON \`_pages_v_blocks_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_items_image_idx\` ON \`_pages_v_blocks_services_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_order_idx\` ON \`_pages_v_blocks_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_parent_id_idx\` ON \`_pages_v_blocks_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_path_idx\` ON \`_pages_v_blocks_services\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_order_idx\` ON \`_pages_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_items_parent_id_idx\` ON \`_pages_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'FAQ',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_order_idx\` ON \`_pages_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_parent_id_idx\` ON \`_pages_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_faq_path_idx\` ON \`_pages_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`quote\` text,
  	\`attribution\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_order_idx\` ON \`_pages_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_parent_id_idx\` ON \`_pages_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_path_idx\` ON \`_pages_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_quote_image_idx\` ON \`_pages_v_blocks_quote\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`href\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_items_order_idx\` ON \`_pages_v_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_items_parent_id_idx\` ON \`_pages_v_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_items_image_idx\` ON \`_pages_v_blocks_cards_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_order_idx\` ON \`_pages_v_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_parent_id_idx\` ON \`_pages_v_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cards_path_idx\` ON \`_pages_v_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'projects',
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`limit\` numeric DEFAULT 8,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_listing_order_idx\` ON \`_pages_v_blocks_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_listing_parent_id_idx\` ON \`_pages_v_blocks_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_listing_path_idx\` ON \`_pages_v_blocks_listing\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`show_form\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_order_idx\` ON \`_pages_v_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_parent_id_idx\` ON \`_pages_v_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_path_idx\` ON \`_pages_v_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`button_text\` text DEFAULT 'Обсудить задачу',
  	\`href\` text DEFAULT '/contact',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_path\` text,
  	\`version_title\` text,
  	\`version_kind\` text DEFAULT 'standard',
  	\`version_eyebrow\` text,
  	\`version_intro\` text,
  	\`version_hero_title\` text,
  	\`version_hero_video_id\` integer,
  	\`version_hero_video_path\` text,
  	\`version_hero_image_id\` integer,
  	\`version_hero_image_path\` text,
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_path_idx\` ON \`_pages_v\` (\`version_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_hero_video_idx\` ON \`_pages_v\` (\`version_hero_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_hero_image_idx\` ON \`_pages_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_text\` (
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
  await db.run(sql`CREATE INDEX \`projects_blocks_text_order_idx\` ON \`projects_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_parent_id_idx\` ON \`projects_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_path_idx\` ON \`projects_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_visual\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`display\` text DEFAULT 'wide',
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_visual_order_idx\` ON \`projects_blocks_visual\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_visual_parent_id_idx\` ON \`projects_blocks_visual\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_visual_path_idx\` ON \`projects_blocks_visual\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_visual_media_idx\` ON \`projects_blocks_visual\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_items_order_idx\` ON \`projects_blocks_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_items_parent_id_idx\` ON \`projects_blocks_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_items_media_idx\` ON \`projects_blocks_gallery_items\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_order_idx\` ON \`projects_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_parent_id_idx\` ON \`projects_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_path_idx\` ON \`projects_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`details\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_services_items_order_idx\` ON \`projects_blocks_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_services_items_parent_id_idx\` ON \`projects_blocks_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_services_items_image_idx\` ON \`projects_blocks_services_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_services_order_idx\` ON \`projects_blocks_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_services_parent_id_idx\` ON \`projects_blocks_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_services_path_idx\` ON \`projects_blocks_services\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_faq_items_order_idx\` ON \`projects_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_faq_items_parent_id_idx\` ON \`projects_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'FAQ',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_faq_order_idx\` ON \`projects_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_faq_parent_id_idx\` ON \`projects_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_faq_path_idx\` ON \`projects_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`quote\` text,
  	\`attribution\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_order_idx\` ON \`projects_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_parent_id_idx\` ON \`projects_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_path_idx\` ON \`projects_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_image_idx\` ON \`projects_blocks_quote\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`href\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_cards_items_order_idx\` ON \`projects_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_cards_items_parent_id_idx\` ON \`projects_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_cards_items_image_idx\` ON \`projects_blocks_cards_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_cards_order_idx\` ON \`projects_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_cards_parent_id_idx\` ON \`projects_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_cards_path_idx\` ON \`projects_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'projects',
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`limit\` numeric DEFAULT 8,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_listing_order_idx\` ON \`projects_blocks_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_listing_parent_id_idx\` ON \`projects_blocks_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_listing_path_idx\` ON \`projects_blocks_listing\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`show_form\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_contact_order_idx\` ON \`projects_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_contact_parent_id_idx\` ON \`projects_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_contact_path_idx\` ON \`projects_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`button_text\` text DEFAULT 'Обсудить задачу',
  	\`href\` text DEFAULT '/contact',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_cta_order_idx\` ON \`projects_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_cta_parent_id_idx\` ON \`projects_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_cta_path_idx\` ON \`projects_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`source_path\` text,
  	\`title\` text,
  	\`summary\` text,
  	\`client\` text,
  	\`year\` text,
  	\`category\` text,
  	\`order\` numeric DEFAULT 0,
  	\`cover_id\` integer,
  	\`cover_path\` text,
  	\`seo_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_source_path_idx\` ON \`projects\` (\`source_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_cover_idx\` ON \`projects\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_text\` (
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
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_order_idx\` ON \`_projects_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_parent_id_idx\` ON \`_projects_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_path_idx\` ON \`_projects_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_visual\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`display\` text DEFAULT 'wide',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_visual_order_idx\` ON \`_projects_v_blocks_visual\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_visual_parent_id_idx\` ON \`_projects_v_blocks_visual\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_visual_path_idx\` ON \`_projects_v_blocks_visual\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_visual_media_idx\` ON \`_projects_v_blocks_visual\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_items_order_idx\` ON \`_projects_v_blocks_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_items_parent_id_idx\` ON \`_projects_v_blocks_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_items_media_idx\` ON \`_projects_v_blocks_gallery_items\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_order_idx\` ON \`_projects_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_parent_id_idx\` ON \`_projects_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_path_idx\` ON \`_projects_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`details\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_services_items_order_idx\` ON \`_projects_v_blocks_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_services_items_parent_id_idx\` ON \`_projects_v_blocks_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_services_items_image_idx\` ON \`_projects_v_blocks_services_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_services_order_idx\` ON \`_projects_v_blocks_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_services_parent_id_idx\` ON \`_projects_v_blocks_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_services_path_idx\` ON \`_projects_v_blocks_services\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_faq_items_order_idx\` ON \`_projects_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_faq_items_parent_id_idx\` ON \`_projects_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'FAQ',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_faq_order_idx\` ON \`_projects_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_faq_parent_id_idx\` ON \`_projects_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_faq_path_idx\` ON \`_projects_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`quote\` text,
  	\`attribution\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_order_idx\` ON \`_projects_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_parent_id_idx\` ON \`_projects_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_path_idx\` ON \`_projects_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_image_idx\` ON \`_projects_v_blocks_quote\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`href\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cards_items_order_idx\` ON \`_projects_v_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cards_items_parent_id_idx\` ON \`_projects_v_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cards_items_image_idx\` ON \`_projects_v_blocks_cards_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cards_order_idx\` ON \`_projects_v_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cards_parent_id_idx\` ON \`_projects_v_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cards_path_idx\` ON \`_projects_v_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'projects',
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`limit\` numeric DEFAULT 8,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_listing_order_idx\` ON \`_projects_v_blocks_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_listing_parent_id_idx\` ON \`_projects_v_blocks_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_listing_path_idx\` ON \`_projects_v_blocks_listing\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`show_form\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_contact_order_idx\` ON \`_projects_v_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_contact_parent_id_idx\` ON \`_projects_v_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_contact_path_idx\` ON \`_projects_v_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`button_text\` text DEFAULT 'Обсудить задачу',
  	\`href\` text DEFAULT '/contact',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cta_order_idx\` ON \`_projects_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cta_parent_id_idx\` ON \`_projects_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_cta_path_idx\` ON \`_projects_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_source_path\` text,
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_client\` text,
  	\`version_year\` text,
  	\`version_category\` text,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_cover_id\` integer,
  	\`version_cover_path\` text,
  	\`version_seo_description\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_source_path_idx\` ON \`_projects_v\` (\`version_source_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_cover_idx\` ON \`_projects_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_text\` (
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
  await db.run(sql`CREATE INDEX \`articles_blocks_text_order_idx\` ON \`articles_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_text_parent_id_idx\` ON \`articles_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_text_path_idx\` ON \`articles_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_visual\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`display\` text DEFAULT 'wide',
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_visual_order_idx\` ON \`articles_blocks_visual\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_visual_parent_id_idx\` ON \`articles_blocks_visual\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_visual_path_idx\` ON \`articles_blocks_visual\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_visual_media_idx\` ON \`articles_blocks_visual\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_gallery_items_order_idx\` ON \`articles_blocks_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_gallery_items_parent_id_idx\` ON \`articles_blocks_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_gallery_items_media_idx\` ON \`articles_blocks_gallery_items\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_gallery_order_idx\` ON \`articles_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_gallery_parent_id_idx\` ON \`articles_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_gallery_path_idx\` ON \`articles_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`details\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_services_items_order_idx\` ON \`articles_blocks_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_services_items_parent_id_idx\` ON \`articles_blocks_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_services_items_image_idx\` ON \`articles_blocks_services_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_services_order_idx\` ON \`articles_blocks_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_services_parent_id_idx\` ON \`articles_blocks_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_services_path_idx\` ON \`articles_blocks_services\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_faq_items_order_idx\` ON \`articles_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_faq_items_parent_id_idx\` ON \`articles_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'FAQ',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_faq_order_idx\` ON \`articles_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_faq_parent_id_idx\` ON \`articles_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_faq_path_idx\` ON \`articles_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`quote\` text,
  	\`attribution\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_order_idx\` ON \`articles_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_parent_id_idx\` ON \`articles_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_path_idx\` ON \`articles_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_quote_image_idx\` ON \`articles_blocks_quote\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`href\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_cards_items_order_idx\` ON \`articles_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_cards_items_parent_id_idx\` ON \`articles_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_cards_items_image_idx\` ON \`articles_blocks_cards_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_cards_order_idx\` ON \`articles_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_cards_parent_id_idx\` ON \`articles_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_cards_path_idx\` ON \`articles_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'projects',
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`limit\` numeric DEFAULT 8,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_listing_order_idx\` ON \`articles_blocks_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_listing_parent_id_idx\` ON \`articles_blocks_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_listing_path_idx\` ON \`articles_blocks_listing\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`show_form\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_contact_order_idx\` ON \`articles_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_contact_parent_id_idx\` ON \`articles_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_contact_path_idx\` ON \`articles_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`button_text\` text DEFAULT 'Обсудить задачу',
  	\`href\` text DEFAULT '/contact',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`articles_blocks_cta_order_idx\` ON \`articles_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_cta_parent_id_idx\` ON \`articles_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_blocks_cta_path_idx\` ON \`articles_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`title\` text,
  	\`excerpt\` text,
  	\`category\` text,
  	\`published_at\` text,
  	\`editorial_reviewed\` integer DEFAULT false,
  	\`cover_id\` integer,
  	\`cover_path\` text,
  	\`body\` text,
  	\`seo_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`articles_cover_idx\` ON \`articles\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`articles__status_idx\` ON \`articles\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_text\` (
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
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_order_idx\` ON \`_articles_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_parent_id_idx\` ON \`_articles_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_text_path_idx\` ON \`_articles_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_visual\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`display\` text DEFAULT 'wide',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_visual_order_idx\` ON \`_articles_v_blocks_visual\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_visual_parent_id_idx\` ON \`_articles_v_blocks_visual\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_visual_path_idx\` ON \`_articles_v_blocks_visual\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_visual_media_idx\` ON \`_articles_v_blocks_visual\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`src\` text,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_gallery_items_order_idx\` ON \`_articles_v_blocks_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_gallery_items_parent_id_idx\` ON \`_articles_v_blocks_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_gallery_items_media_idx\` ON \`_articles_v_blocks_gallery_items\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_gallery_order_idx\` ON \`_articles_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_gallery_parent_id_idx\` ON \`_articles_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_gallery_path_idx\` ON \`_articles_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`details\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_services_items_order_idx\` ON \`_articles_v_blocks_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_services_items_parent_id_idx\` ON \`_articles_v_blocks_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_services_items_image_idx\` ON \`_articles_v_blocks_services_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_services\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_services_order_idx\` ON \`_articles_v_blocks_services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_services_parent_id_idx\` ON \`_articles_v_blocks_services\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_services_path_idx\` ON \`_articles_v_blocks_services\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_faq_items_order_idx\` ON \`_articles_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_faq_items_parent_id_idx\` ON \`_articles_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text DEFAULT 'FAQ',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_faq_order_idx\` ON \`_articles_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_faq_parent_id_idx\` ON \`_articles_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_faq_path_idx\` ON \`_articles_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`quote\` text,
  	\`attribution\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_order_idx\` ON \`_articles_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_parent_id_idx\` ON \`_articles_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_path_idx\` ON \`_articles_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_quote_image_idx\` ON \`_articles_v_blocks_quote\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_cards_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`body\` text,
  	\`href\` text,
  	\`image_id\` integer,
  	\`image_path\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v_blocks_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cards_items_order_idx\` ON \`_articles_v_blocks_cards_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cards_items_parent_id_idx\` ON \`_articles_v_blocks_cards_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cards_items_image_idx\` ON \`_articles_v_blocks_cards_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cards_order_idx\` ON \`_articles_v_blocks_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cards_parent_id_idx\` ON \`_articles_v_blocks_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cards_path_idx\` ON \`_articles_v_blocks_cards\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_listing\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'projects',
  	\`heading\` text,
  	\`eyebrow\` text,
  	\`limit\` numeric DEFAULT 8,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_listing_order_idx\` ON \`_articles_v_blocks_listing\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_listing_parent_id_idx\` ON \`_articles_v_blocks_listing\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_listing_path_idx\` ON \`_articles_v_blocks_listing\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`intro\` text,
  	\`show_form\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_contact_order_idx\` ON \`_articles_v_blocks_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_contact_parent_id_idx\` ON \`_articles_v_blocks_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_contact_path_idx\` ON \`_articles_v_blocks_contact\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`button_text\` text DEFAULT 'Обсудить задачу',
  	\`href\` text DEFAULT '/contact',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_articles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cta_order_idx\` ON \`_articles_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cta_parent_id_idx\` ON \`_articles_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_blocks_cta_path_idx\` ON \`_articles_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_articles_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_title\` text,
  	\`version_excerpt\` text,
  	\`version_category\` text,
  	\`version_published_at\` text,
  	\`version_editorial_reviewed\` integer DEFAULT false,
  	\`version_cover_id\` integer,
  	\`version_cover_path\` text,
  	\`version_body\` text,
  	\`version_seo_description\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_articles_v_parent_idx\` ON \`_articles_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_slug_idx\` ON \`_articles_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_cover_idx\` ON \`_articles_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_updated_at_idx\` ON \`_articles_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version_created_at_idx\` ON \`_articles_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_version_version__status_idx\` ON \`_articles_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_created_at_idx\` ON \`_articles_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_updated_at_idx\` ON \`_articles_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_articles_v_latest_idx\` ON \`_articles_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`leads\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`company\` text,
  	\`message\` text NOT NULL,
  	\`source\` text,
  	\`status\` text DEFAULT 'new',
  	\`consent\` integer DEFAULT false NOT NULL,
  	\`ip_hash\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`leads_updated_at_idx\` ON \`leads\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`leads_created_at_idx\` ON \`leads\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	\`projects_id\` integer,
  	\`articles_id\` integer,
  	\`leads_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`articles_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`leads_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`articles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_leads_id_idx\` ON \`payload_locked_documents_rels\` (\`leads_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_socials_order_idx\` ON \`site_settings_socials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_socials_parent_id_idx\` ON \`site_settings_socials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`brand\` text DEFAULT 'I’MON',
  	\`description\` text DEFAULT 'Бренд, продукт и digital — как единая система.',
  	\`email\` text DEFAULT 'info@imon.agency',
  	\`telegram\` text DEFAULT 'https://t.me/imonagency',
  	\`footer_message\` text DEFAULT 'Обсудим следующий уровень вашего бизнеса',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`navigation_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	\`external\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_links_order_idx\` ON \`navigation_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_links_parent_id_idx\` ON \`navigation_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_text\` text DEFAULT 'Связаться',
  	\`cta_href\` text DEFAULT '/contact',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_visual\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_services_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_services\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_listing\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_visual\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_services_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_services\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_listing\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_visual\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_services_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_services\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_listing\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_visual\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_services_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_services\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_listing\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_visual\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_services_items\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_services\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_listing\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`articles_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_visual\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_services_items\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_services\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_cards_items\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_cards\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_listing\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_contact\`;`)
  await db.run(sql`DROP TABLE \`_articles_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_articles_v\`;`)
  await db.run(sql`DROP TABLE \`leads\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings_socials\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`navigation_links\`;`)
  await db.run(sql`DROP TABLE \`navigation\`;`)
}
