import type { CollectionConfig } from 'payload'
import { contentBlocks } from '@/blocks/content'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Кейс', plural: 'Кейсы' },
  admin: {
    preview: ({ data }) => (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000') + '/api/preview?path=' + encodeURIComponent((data as {sourcePath?: string }).sourcePath || '/work'),
    useAsTitle: 'title', defaultColumns: ['title', 'slug', 'year', 'updatedAt'], group: 'Контент' },
  versions: { drafts: true, maxPerDoc: 40 },
  access: {
    read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
    create: ({ req }) => !!req.user, update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'sourcePath', label: 'Полный адрес', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'client', type: 'text' },
    { name: 'year', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'coverPath', label: 'Исходная обложка', type: 'text' },
    { name: 'sections', type: 'blocks', blocks: contentBlocks },
    { name: 'seoDescription', type: 'textarea' },
  ],
}
