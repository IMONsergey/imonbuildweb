import type { CollectionConfig } from 'payload'
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медиатека' },
  admin: { useAsTitle: 'alt', group: 'Контент' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'alt', label: 'Альтернативный текст', type: 'text', required: true },
    { name: 'caption', label: 'Подпись', type: 'text' },
  ],
  upload: { staticDir: 'uploads', mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'application/pdf'], imageSizes: [
    { name: 'card', width: 1000 },
    { name: 'hero', width: 1920 },
  ], adminThumbnail: 'card' },
}
