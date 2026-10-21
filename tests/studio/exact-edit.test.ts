import test from 'node:test'
import assert from 'node:assert/strict'
import type { PuckData } from '../../src/studio/puck/adapter'
import { applyExactTextEdit } from '../../src/studio/puck/exactEdit'

const example = (): PuckData => ({
  root: { props: { title: 'Первоначально', intro: 'Вступление', heroTitle: 'Главная' } },
  content: [
    { type: 'services', props: { id: 'one', heading: 'Направления', items: [{ title: 'Бренд', description: 'Описание' }] } },
    { type: 'visual', props: { id: 'two', src: '/media/cover.png', caption: 'Подпись', media: 13 } },
  ],
})

test('exact canvas updates the page hero without altering the source object', () => {
  const source = example()
  const updated = applyExactTextEdit(source, 'pages', 'heroTitle', 'Новый заголовок')!
  assert.equal(updated.root.props?.heroTitle, 'Новый заголовок')
  assert.equal(source.root.props?.heroTitle, 'Главная')
  assert.deepEqual(updated.content, source.content)
})

test('exact canvas supports deep text fields in an existing CMS block', () => {
  const source = example()
  const updated = applyExactTextEdit(source, 'pages', 'blocks.0.items.0.title', 'Новый бренд')!
  assert.equal((updated.content[0].props.items as {title:string}[])[0].title, 'Новый бренд')
  assert.equal((source.content[0].props.items as {title:string}[])[0].title, 'Бренд')
  assert.equal(updated.content[1], source.content[1])
})

test('project sections and articles map correctly into editable blocks', () => {
  const source = example()
  const project = applyExactTextEdit(source, 'projects', 'sections.1.caption', 'Текст')!
  assert.equal(project.content[1].props.caption, 'Текст')
  assert.equal(applyExactTextEdit(source, 'projects', 'blocks.1.caption', 'Нет'), null)
  assert.equal(applyExactTextEdit(source, 'articles', 'excerpt', 'Нет'), null)
})

test('exact canvas refuses non-text fields, unsupported roots and unknown paths', () => {
  const source = example()
  for (const path of ['blocks.1.media', 'blocks.1.src', 'blocks.1.blockType', 'blocks.0.items.3.title', 'blocks.2.heading', 'blocks.0.badProperty', 'blocks.0.items.0.__proto__.x', 'constructor', 'studio', 'path']) {
    assert.equal(applyExactTextEdit(source, 'pages', path, 'bad'), null, path)
  }
  assert.equal(applyExactTextEdit(source, 'pages', 'heroTitle', 'Главная'), null)
  assert.equal(applyExactTextEdit(source, 'pages', 'blocks.1.caption', 'Подпись'), null)
})

test('exact text edits round-trip through the CMS adapter', async () => {
  const { puckToDocument } = await import('../../src/studio/puck/adapter')
  const source = example()
  const modified = applyExactTextEdit(source, 'pages', 'blocks.0.items.0.description', 'Новая информация')!
  const result = puckToDocument(modified, {
    title: 'Первоначально', intro: 'Вступление', heroTitle: 'Главная',
    path: '/', seo: { noindex: false },
    blocks: [
      { blockType: 'services', ...source.content[0].props },
      { blockType: 'visual', ...source.content[1].props },
    ],
  }, 'pages')
  assert.equal(((result.blocks as {items:{description:string}[]}[])[0].items[0].description), 'Новая информация')
  assert.deepEqual(result.seo, { noindex: false })
})
