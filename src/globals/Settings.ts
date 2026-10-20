import type { GlobalConfig } from 'payload'
export const Settings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  admin: { group: 'Сайт' },
  access: { read: () => true, update: ({ req }) => req.user?.role === 'admin' },
  fields: [
    { name: 'brand', label: 'Название бренда', type: 'text', defaultValue: 'I’MON' },
    { name: 'description', type: 'textarea', defaultValue: 'Бренд, продукт и digital — как единая система.' },
    { name: 'email', type: 'email', defaultValue: 'info@imon.agency' },
    { name: 'telegram', type: 'text', defaultValue: 'https://t.me/imonagency' },
    { name: 'footerMessage', type: 'textarea', defaultValue: 'Обсудим следующий уровень вашего бизнеса' },
    { name: 'socials', type: 'array', fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'url', type: 'text', required: true },
    ] },
  ],
}
