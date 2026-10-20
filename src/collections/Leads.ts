import type { CollectionConfig } from 'payload'
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: { useAsTitle: 'email', defaultColumns: ['createdAt', 'name', 'email', 'status'], group: 'Коммуникации' },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', label: 'Компания', type: 'text' },
    { name: 'message', label: 'Описание задачи', type: 'textarea', required: true },
    { name: 'source', type: 'text' },
    { name: 'status', type: 'select', defaultValue: 'new', options: [{ label: 'Новая', value: 'new' }, { label: 'В работе', value: 'processing' }, { label: 'Завершена', value: 'done' }] },
    { name: 'consent', label: 'Согласие на обработку данных', type: 'checkbox', required: true },
    { name: 'ipHash', label: 'Хеш адреса', type: 'text', admin: { readOnly: true } },
  ],
}
