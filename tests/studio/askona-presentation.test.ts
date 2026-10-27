import test from 'node:test'
import assert from 'node:assert/strict'
import { usesDefaultAskonaPresentation } from '../../src/lib/askonaPresentation'
import stories from '../../src/content/caseStories.json'

const path = '/cases/askona-life-group'
const project = () => ({ sourcePath: path, summary: 'Разные направления бизнеса в одной цифровой системе.' })
const blocks = (): Array<Record<string, unknown>> => structuredClone(stories[path].blocks)

test('Askona default and Payload persistence IDs select the curated presentation', () => {
  assert.equal(usesDefaultAskonaPresentation(project(), blocks()), true)
  assert.equal(usesDefaultAskonaPresentation({ path }, blocks().map((block, i) => ({ ...block, id: String(i), blockName: null, media: null }))), true)
})
test('Askona authored sections, text, ordering and media keep existing renderer precedence', () => {
  for (const edited of [[], [...blocks()].reverse(), blocks().slice(1)]) {
    assert.equal(usesDefaultAskonaPresentation(project(), edited), false)
  }
  const edited = blocks()
  edited[1] = { ...edited[1], body: 'Редакторский текст' }
  assert.equal(usesDefaultAskonaPresentation(project(), edited), false)
  const media = blocks().map((block, i) => i === 0 ? { ...block, media: { url: '/uploads/custom.webp' } } : block)
  assert.equal(usesDefaultAskonaPresentation(project(), media), false)
})
test('Studio layouts, hero edits and other routes cannot be silently replaced', () => {
  for (const edit of [
    { studio: { nodes: { root: { desktop: { backgroundColor: '#fff' } } } } },
    { studio: { layout: { children: [] } } },
    { summary: 'Новый текст' }, { category: 'Новая категория' },
    { coverPath: '/media/new.webp' }, { cover: 12 }, { client: 'Другой клиент' },
    { sourcePath: '/cases/page' },
  ]) assert.equal(usesDefaultAskonaPresentation({ ...project(), ...edit }, blocks()), false)
})
test('Title and year remain editable in the curated presentation', () => {
  assert.equal(usesDefaultAskonaPresentation({ ...project(), title: 'Обновлённый заголовок', year: '2025' }, blocks()), true)
})
