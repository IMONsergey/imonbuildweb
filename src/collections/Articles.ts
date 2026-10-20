import type { CollectionConfig } from 'payload'
import { contentBlocks } from '@/blocks/content'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Публикация', plural: 'Журнал' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', '_status', 'updatedAt'], group: 'Контент' },
  versions: { drafts: true, maxPerDoc: 40 },
  access: {
    read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
    create: ({ req }) => !!req.user, update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'slug', type: 'text', unique: true, required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'category', type: 'text' },
    { name: 'publishedAt', type: 'date' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'coverPath', type: 'text' },
    { name: 'body', type: 'richText' },
    { name: 'sections', type: 'blocks', blocks: contentBlocks },
    { name: 'seoDescription', type: 'textarea' },
  ],
}
