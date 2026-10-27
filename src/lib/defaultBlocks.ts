import type { OriginalPage } from './site'
import caseStories from '@/content/caseStories.json'

export type DisplayBlock = {
  id?: string; blockName?: string
  blockType: string
  eyebrow?: string
  heading?: string
  body?: string
  layout?: string
  quote?: string
  attribution?: string
  src?: string
  alt?: string
  caption?: string
  display?: string
  items?: Array<Record<string, unknown>>
  kind?: string
  limit?: number
  showForm?: boolean
  intro?: string
  buttonText?: string
  href?: string
  imagePath?: string
}

const t = (page: OriginalPage, i: number) => page.texts[i] || ''

export function defaultBlocks(page: OriginalPage): DisplayBlock[] {
  if (page.kind === 'home') return [
    { blockType: 'text', eyebrow: '(Стратегический партнёр)', heading: t(page, 3), body: t(page, 2), layout: 'split' },
    { blockType: 'cards', eyebrow: '(Наш подход)', items: [
      { heading: t(page, 5), body: t(page, 6) },
      { heading: t(page, 7), body: t(page, 8) },
      { heading: t(page, 9), body: t(page, 10) },
    ] },
    { blockType: 'listing', eyebrow: '(Избранные работы)', heading: 'Проекты', kind: 'projects', limit: 4 },
    { blockType: 'services', heading: t(page, 22), eyebrow: t(page, 23), items: [
      { number: '01', title: t(page, 25), description: t(page, 26), details: t(page, 27), imagePath: page.images[7] || '' },
      { number: '02', title: t(page, 29), description: t(page, 30), details: t(page, 31), imagePath: page.images[8] || '' },
      { number: '03', title: t(page, 33), description: t(page, 34), details: t(page, 35), imagePath: page.images[9] || '' },
      { number: '04', title: t(page, 37), description: t(page, 38), details: t(page, 39), imagePath: page.images[10] || '' },
    ] },
    { blockType: 'text', eyebrow: '(Когда мы нужны)', heading: t(page, 40), layout: 'full' },
    { blockType: 'cards', items: [
      { heading: t(page, 42), body: t(page, 43) },
      { heading: t(page, 44), body: t(page, 45) },
      { heading: t(page, 46), body: t(page, 47) },
    ] },
    { blockType: 'text', heading: t(page, 49), eyebrow: '(Основа подхода)', layout: 'dark' },
    { blockType: 'cards', items: [
      { heading: t(page, 51), body: 'Стратегия, исследования, позиционирование и архитектура решений.' },
      { heading: t(page, 52), body: 'Согласованная система языка, визуала и коммуникации.' },
      { heading: t(page, 53), body: 'Сайты, цифровые интерфейсы и их развитие.' },
    ] },
    { blockType: 'quote', eyebrow: '(Как мы работаем)', quote: t(page, 56).replace(/^[“"]|[”"]$/g, ''), attribution: 'I’MON / стратегический партнёр', imagePath: page.images[11] },
    { blockType: 'faq', heading: 'FAQ', items: [
      { question: 'Чем I’MON отличается от обычного агентства?', answer: 'Мы подключаемся не к отдельному макету, а к задаче бизнеса. Связываем стратегию, коммуникацию, дизайн и digital в управляемую систему.' },
      { question: 'На каком этапе вы подключаетесь?', answer: 'На старте, во время роста, при выходе на новые рынки или в момент существенных изменений продукта и компании.' },
      { question: 'С какими компаниями вы работаете?', answer: 'С командами, которым важны системные решения: от технологических и B2B-продуктов до сложных корпоративных сервисов.' },
      { question: 'Что может входить в проект?', answer: 'Исследование, стратегия, бренд-система, UX, интерфейсы, сайт, презентационные материалы и дальнейшее развитие.' },
      { question: 'Вы берётесь за отдельные задачи?', answer: 'Да, если понимаем их контекст и последствия. Не предлагаем отдельное решение там, где оно не решит задачу бизнеса.' },
      { question: 'Как начинается работа?', answer: 'С разговора о задаче, сроках, ограничениях и критериях результата. После этого формируем объём работ и этапы.' },
    ] },
    { blockType: 'listing', eyebrow: '(Мы говорим)', heading: 'I’MON Magazine', kind: 'articles', limit: 4 },
    { blockType: 'cta', heading: 'Обсудим следующий уровень вашего бизнеса', buttonText: 'Обсудить задачу', href: '/contact' },
  ]
  if (page.kind === 'work') return [{ blockType: 'listing', heading: '', kind: 'projects', limit: 100 }]
  if (page.kind === 'news') return [{ blockType: 'listing', heading: '', kind: 'articles', limit: 100 }]
  if (page.kind === 'contact') return [
    { blockType: 'gallery', items: page.images.slice(0, 2).map(src => ({ src })) },
    { blockType: 'contact', heading: 'Расскажите о задаче', intro: 'Опишите вашу ситуацию, и мы предложим формат работы.', showForm: true },
  ]
  if (page.kind === 'about') return [
    { blockType: 'text', heading: 'I’MON подключается в момент решения', eyebrow: '(О нас)', body: page.texts.slice(0, 2).join('\n\n'), layout: 'full' },
    { blockType: 'cards', heading: 'Принципы работы', items: page.texts.slice(2).map((value, i) => ({ heading: i < 3 ? ['Глубина', 'Системность', 'Партнерство'][i] : 'Подход', body: value })) },
    { blockType: 'text', heading: 'Не отдельный дизайн. Система, которая выдерживает рост.', body: 'Работаем с бизнесом, его коммуникацией и digital-присутствием как с одним целым.', layout: 'dark' },
    { blockType: 'cta', heading: 'Предложите задачу — обсудим контекст и результат', buttonText: 'Связаться', href: '/contact' },
  ]
  if (page.kind === 'legal') return [{ blockType: 'text', heading: page.path === '/privacy-policy' ? 'Обработка персональных данных' : 'Условия использования', body: page.texts[0], layout: 'narrow' }]
  if (page.kind === 'case') {
    const story = (caseStories as Record<string, { blocks: DisplayBlock[] }>)[page.path]
    if (story) return structuredClone(story.blocks)
    const blocks: DisplayBlock[] = []
    const start = page.path.startsWith('/cases/') ? 7 : 8
    if (page.path.startsWith('/cases/')) {
      const headings = ['О проекте', 'Задача', 'Архитектура', 'Визуальная система', 'UX/UI', 'История', 'Экосистема', 'Носители', 'Результат', 'Автомобиль как пространство для бизнеса', 'Главная промо-страница']
      for (let i=start; i<page.texts.length-1; i++) {
        if (headings.includes(page.texts[i]) && page.texts[i+1]?.length>40)
          blocks.push({ blockType: 'text', heading: page.texts[i], body: page.texts[i+1], layout: i===start ? 'full' : 'split' })
      }
    }
    const images=page.images.filter(src => !src.endsWith('.svg')).slice(0, 26)
    if (images.length) blocks.push({ blockType: 'gallery', items: images.map(src => ({ src })) })
    if (page.videos.length) page.videos.forEach(src => blocks.push({ blockType: 'visual', src, display: 'full' }))
    blocks.push({ blockType: 'listing', heading: 'Другие проекты', kind: 'projects', limit: 2 })
    return blocks
  }
  if (page.kind === 'article') {
    const blocks: DisplayBlock[] = []
    const content=page.texts.slice(3).filter(value=>value.length>20 && !value.startsWith('Jul'))
    for(const value of content.slice(0,18)){
      if(value.length<110) blocks.push({blockType:'text',heading:value,layout:'narrow'})
      else blocks.push({blockType:'text',body:value,layout:'narrow'})
    }
    if(page.images[0]) blocks.splice(Math.min(2,blocks.length),0,{blockType:'visual',src:page.images[0],display:'full'})
    blocks.push({blockType:'listing',heading:'Другие публикации',kind:'articles',limit:4})
    return blocks
  }
  return [{ blockType: 'text', heading: page.title, body: page.texts.join('\n\n'), layout: 'full' }]
}
