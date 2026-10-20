import type { CollectionConfig } from 'payload'
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Система' },
  auth: { tokenExpiration: 60 * 60 * 8, maxLoginAttempts: 8, lockTime: 1000 * 60 * 15 },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || (req.user ? { id: { equals: req.user.id } } : false),
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin' || (req.user ? { id: { equals: req.user.id } } : false),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', label: 'Имя', type: 'text' },
    { name: 'role', label: 'Роль', type: 'select', required: true, defaultValue: 'editor', options: [{ label: 'Администратор', value: 'admin' }, { label: 'Редактор', value: 'editor' }], access: { update: ({ req }) => req.user?.role === 'admin' } },
  ],
}
