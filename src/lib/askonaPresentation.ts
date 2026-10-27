import caseStories from '../content/caseStories.json'
import source from '../content/source.json'

export const askonaPresentation = {
  path: '/cases/askona-life-group',
  year: '2024',
  type: 'Корпоративный сайт',
  task: 'Разные направления бизнеса.\nЕдиный принцип взаимодействия.',
  system: 'Общие принципы навигации и подачи контента.',
  roles: ['Структура', 'UX/UI', 'Разработка'],
  phones: '/media/XVtclO78Zy9cgdbTgJCOm4EBCU.webp',
  history: '/media/eoFAWJMd4l5EgteSz5TVb4QTaQ.webp',
  hand: '/media/WJ03F8jDjA8VMtymeGc4BU3ADo.webp',
} as const

// This is a default art-directed presentation, never a replacement for an
// authored CMS document. Payload adds IDs and nullable fields when persisting
// unchanged blocks; ignore only those persistence details, not actual edits.
function comparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparable)
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).filter(([key, child]) => !['id', 'blockName'].includes(key) && child != null && child !== '')
      .sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, comparable(child)]),
  )
  return value
}

export function usesDefaultAskonaPresentation(project: Record<string, unknown>, blocks: unknown[]): boolean {
  if ((project.sourcePath || project.path) !== askonaPresentation.path) return false
  // Fail closed on any Studio configuration, including custom layout trees.
  if (project.studio && Object.keys(project.studio as object).length) return false
  const original = source.find(page => page.path === askonaPresentation.path)!
  if (project.summary && project.summary !== original.intro) return false
  if (project.cover && typeof project.cover !== 'string') return false
  if (project.coverPath && project.coverPath !== original.cover) return false
  if (typeof project.cover === 'string' && project.cover !== original.cover) return false
  if (project.category && project.category !== original.category) return false
  if (project.client && project.client !== original.title) return false
  return JSON.stringify(comparable(blocks)) === JSON.stringify(comparable(caseStories[askonaPresentation.path].blocks))
}
