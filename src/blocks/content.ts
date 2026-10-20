import type { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Текстовый раздел', plural: 'Текстовые разделы' },
  fields: [
    { name: 'eyebrow', label: 'Надзаголовок', type: 'text' },
    { name: 'heading', label: 'Заголовок', type: 'text' },
    { name: 'body', label: 'Текст', type: 'textarea' },
    { name: 'image', label: 'Иллюстрация раздела', type: 'upload', relationTo: 'media' },
    { name: 'imagePath', label: 'Исходная иллюстрация', type: 'text' },
    { name: 'layout', label: 'Композиция', type: 'select', defaultValue: 'split', options: ['split', 'full', 'narrow', 'dark'].map(value => ({ label: value, value })) },
  ],
}

export const MediaBlock: Block = {
  slug: 'visual',
  labels: { singular: 'Изображение или видео', plural: 'Медиа' },
  fields: [
    { name: 'media', label: 'Медиафайл', type: 'upload', relationTo: 'media' },
    { name: 'src', label: 'Локальный путь исходного файла', type: 'text' },
    { name: 'caption', label: 'Подпись', type: 'text' },
    { name: 'display', label: 'Размер', type: 'select', defaultValue: 'wide', options: ['wide', 'full', 'portrait', 'contain'].map(value => ({ label: value, value })) },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Галерея', plural: 'Галереи' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'items', type: 'array', minRows: 1, fields: [
      { name: 'media', type: 'upload', relationTo: 'media' },
      { name: 'src', type: 'text' },
      { name: 'caption', type: 'text' },
    ] },
  ],
}

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Направления', plural: 'Направления' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'eyebrow', type: 'text' },
    { name: 'items', type: 'array', fields: [
      { name: 'number', type: 'text' },
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea' },
      { name: 'details', type: 'textarea', admin: { description: 'Одна услуга в строке' } },
      { name: 'image', type: 'upload', relationTo: 'media' },
      { name: 'imagePath', type: 'text' },
    ] },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Частые вопросы', plural: 'FAQ' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'FAQ' },
    { name: 'items', type: 'array', fields: [
      { name: 'question', type: 'text', required: true },
      { name: 'answer', type: 'textarea', required: true },
    ] },
  ],
}

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Цитата', plural: 'Цитаты' },
  fields: [
    { name: 'heading', label: 'Заголовок раздела', type: 'text', defaultValue: 'Принцип' },
    { name: 'eyebrow', type: 'text' },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'imagePath', type: 'text' },
  ],
}

export const CardGridBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Карточки', plural: 'Карточки' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'eyebrow', type: 'text' },
    { name: 'items', type: 'array', fields: [
      { name: 'heading', type: 'text' },
      { name: 'body', type: 'textarea' },
      { name: 'href', type: 'text' },
      { name: 'image', type: 'upload', relationTo: 'media' },
      { name: 'imagePath', type: 'text' },
    ] },
  ],
}

export const ListingBlock: Block = {
  slug: 'listing',
  labels: { singular: 'Список кейсов / публикаций', plural: 'Списки' },
  fields: [
    { name: 'kind', type: 'select', required: true, defaultValue: 'projects', options: [{ label: 'Проекты', value: 'projects' }, { label: 'Журнал', value: 'articles' }] },
    { name: 'heading', type: 'text' },
    { name: 'eyebrow', type: 'text' },
    { name: 'limit', type: 'number', defaultValue: 8, min: 1, max: 100 },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Контакты и форма', plural: 'Контакты' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    { name: 'showForm', type: 'checkbox', defaultValue: true },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Призыв к действию', plural: 'CTA' },
  fields: [
    { name: 'heading', type: 'textarea', required: true },
    { name: 'buttonText', type: 'text', defaultValue: 'Обсудить задачу' },
    { name: 'href', type: 'text', defaultValue: '/contact' },
  ],
}

export const AboutEditorialBlock: Block = {
  slug: 'aboutEditorial',
  labels: { singular: 'Редакционный блок «О нас»', plural: 'Редакционные блоки «О нас»' },
  fields: [
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'heroImagePath', type: 'text', label: 'Исходное фото' },
    { name: 'statement', type: 'textarea', label: 'Описание подхода' },
    { name: 'values', label: 'Принципы работы', type: 'array', fields: [
      { name: 'heading', label: 'Заголовок', type: 'text' },
      { name: 'body', label: 'Описание', type: 'textarea' },
    ] },
    { name: 'teamTitle', type: 'text', defaultValue: 'Команда' },
    { name: 'teamIntro', type: 'textarea', label: 'Вступление команды' },
    { name: 'team', type: 'array', label: 'Дисциплины и портреты', fields: [
      { name: 'role', type: 'text', required: true },
      { name: 'name', type: 'text', label: 'Имя, только если согласовано' },
      { name: 'portrait', type: 'upload', relationTo: 'media' },
      { name: 'portraitPath', type: 'text' },
    ] },
    { name: 'cultureTitle', type: 'text', defaultValue: 'Culture' },
    { name: 'cultureItems', type: 'array', fields: [
      { name: 'text', type: 'textarea', required: true },
    ] },
    { name: 'symbolsTitle', type: 'text', defaultValue: 'Контекст' },
    { name: 'symbols', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media' },
      { name: 'imagePath', type: 'text' },
      { name: 'alt', type: 'text' },
    ] },
    { name: 'closingImage', type: 'upload', relationTo: 'media' },
    { name: 'closingImagePath', type: 'text' },
    { name: 'closingHref', type: 'text', defaultValue: '/contact' },
  ],
}

export const contentBlocks = [TextBlock, MediaBlock, GalleryBlock, ServicesBlock, FaqBlock, QuoteBlock, CardGridBlock, ListingBlock, ContactBlock, CtaBlock, AboutEditorialBlock]
