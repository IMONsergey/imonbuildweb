import type { GlobalConfig } from 'payload'
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Навигация',
  admin: { group: 'Сайт' },
  access: { read: () => true, update: ({ req }) => req.user?.role === 'admin' },
  fields: [
    { name: 'links', type: 'array', labels: { singular: 'Ссылка', plural: 'Ссылки' }, fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'href', type: 'text', required: true },
      { name: 'external', type: 'checkbox', defaultValue: false },
    ] },
    { name: 'ctaText', type: 'text', defaultValue: 'Связаться' },
    { name: 'ctaHref', type: 'text', defaultValue: '/contact' },
  ],
}
