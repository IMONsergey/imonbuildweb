import type { CollectionConfig, AccessResult } from 'payload'
import { contentBlocks } from '@/blocks/content'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Кейс', plural: 'Кейсы' },
  admin: {
    preview: ({ data }) => (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000') + '/api/preview?path=' + encodeURIComponent((data as {sourcePath?: string }).sourcePath || '/work'),
    useAsTitle: 'title', defaultColumns: ['title', 'slug', 'year', 'updatedAt'], group: 'Контент' },
  versions: { drafts: true, maxPerDoc: 40 },
  access: {
    readVersions: ({ req }) => !!req.user,
    read: ({ req }): AccessResult => req.user ? true : { and: [{ _status: { equals: 'published' } }, { portfolioStatus: { equals: 'portfolio' } }] },
    create: ({ req }) => !!req.user, update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'studio', label: 'Настройки визуального редактора', type: 'json', admin: { hidden: true } },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'sourcePath', label: 'Полный адрес', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'client', type: 'text' },
    { name: 'year', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'portfolioStatus', label: 'Размещение', type: 'select', required: true, defaultValue: 'archive', options: [
      { label: 'Портфолио агентства', value: 'portfolio' },
      { label: 'Архив / демонстрационные материалы', value: 'archive' },
    ], admin: { description: 'В публичный каталог попадают только опубликованные записи портфолио. Архив доступен редактору.' } },
    { name: 'order', label: 'Порядок в портфолио', type: 'number', defaultValue: 0 },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'coverPath', label: 'Исходная обложка', type: 'text' },
    { name: 'sections', type: 'blocks', blocks: contentBlocks },
    { name: 'seoDescription', type: 'textarea' },
  ],
}
