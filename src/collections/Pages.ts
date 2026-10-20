import type { CollectionConfig } from 'payload'
import { contentBlocks } from '@/blocks/content'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    preview: ({ data }) => (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000') + '/api/preview?path=' + encodeURIComponent((data as {path?: string }).path || '/'),
    useAsTitle: 'title', defaultColumns: ['title', 'path', '_status', 'updatedAt'], group: 'Сайт' },
  versions: { drafts: { autosave: { interval: 350 } }, maxPerDoc: 40 },
  access: {
    readVersions: ({ req }) => !!req.user,
    read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'studio', label: 'Настройки визуального редактора', type: 'json', admin: { hidden: true } },
    { name: 'path', label: 'Адрес страницы', type: 'text', unique: true, required: true, admin: { description: 'Относительный путь, например /about или /cases/my-case' } },
    { name: 'title', label: 'Название', type: 'text', required: true },
    { name: 'kind', label: 'Тип страницы', type: 'select', defaultValue: 'standard', options: ['home', 'about', 'work', 'news', 'contact', 'case', 'article', 'legal', 'standard'].map(value => ({ label: value, value })) },
    { name: 'eyebrow', type: 'text' },
    { name: 'intro', label: 'Вступление', type: 'textarea' },
    { name: 'heroTitle', label: 'Крупный заголовок', type: 'textarea' },
    { name: 'heroVideo', label: 'Видео на первом экране', type: 'upload', relationTo: 'media' },
    { name: 'heroVideoPath', label: 'Локальный файл видео', type: 'text' },
    { name: 'heroImage', label: 'Изображение на первом экране', type: 'upload', relationTo: 'media' },
    { name: 'heroImagePath', label: 'Локальный путь изображения', type: 'text' },
    { name: 'blocks', label: 'Секции страницы', type: 'blocks', blocks: contentBlocks },
    { name: 'seo', label: 'SEO', type: 'group', fields: [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'textarea' },
      { name: 'noindex', label: 'Не индексировать', type: 'checkbox', defaultValue: false },
    ] },
  ],
}
