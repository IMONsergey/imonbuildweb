'use client'
import type { Config, Field } from '@puckeditor/core'
import { useState, type ChangeEvent, type ReactNode } from 'react'
import { newFields, type FieldSpec, type StudioDocument } from '../model'
import { PreviewBlock, PreviewRoot, type PreviewAsset, type PreviewContext } from './Preview'

export type AssetUpdater = (asset: PreviewAsset) => void

type MediaKind = 'image' | 'video' | 'all'
function MediaInput({ value, onChange, assets, uploaded, kind }: {
  value: unknown; onChange: (v: number | null) => void; assets: PreviewAsset[]; uploaded: AssetUpdater; kind: MediaKind
}) {
  const [loading, setLoading] = useState(false), [error, setError] = useState('')
  const id = typeof value === 'number' ? value : value && typeof value === 'object' && 'id' in value ? Number(value.id) : 0
  const compatible=assets.filter(asset => kind === 'all' || (asset.mimeType || '').startsWith(kind + '/'))
  const selected = compatible.find(asset => asset.id === id)
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (kind !== 'all' && !file.type.startsWith(kind + '/')) { setError('Этот тип файла не подходит для выбранного поля.'); return }
    setLoading(true); setError('')
    try {
      const form = new FormData()
      form.set('file', file); form.set('alt', file.name)
      const response = await fetch('/api/studio/media', {
        method: 'POST', body: form, credentials: 'same-origin',
      })
      const result = await response.json().catch(()=>({}))
      if (!response.ok) throw new Error(result.message || 'Не удалось загрузить медиа')
      const asset: PreviewAsset = { id: result.id, url: result.url, alt: result.alt || file.name, mimeType: result.mimeType || file.type }
      uploaded(asset)
      onChange(asset.id)
    } catch (error) { setError(error instanceof Error ? error.message : 'Ошибка загрузки') }
    finally { setLoading(false) }
  }
  return <div className="puck-file-field" data-puck-media-kind={kind}>
    {selected?.url && !/\.(mp4|webm)(\?|$)/i.test(selected.url) && <img src={selected.url} alt={selected.alt || 'Медиа'} />}
    <select aria-label="Выбрать файл" value={id} onChange={event => onChange(Number(event.target.value) || null)}>
      <option value={0}>Выбрать из медиатеки</option>
      {compatible.map(asset=><option key={asset.id} value={asset.id}>{asset.alt || asset.url.split('/').at(-1)} #{asset.id}</option>)}
    </select>
    <label className="puck-upload-field">{loading ? 'Загрузка…' : 'Загрузить новый файл'}<input type="file" disabled={loading} accept={kind === 'image' ? 'image/png,image/jpeg,image/webp,image/gif' : kind === 'video' ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,application/pdf'} onChange={upload}/></label>
    {error && <p role="alert">{error}</p>}
  </div>
}

export function makePuckConfig(
  doc: StudioDocument,
  assets: PreviewAsset[],
  uploaded: AssetUpdater,
): Config {
  const specs = doc.fields.find(field => field.name === (doc.collection === 'pages' ? 'blocks' : 'sections'))?.blocks || []
  const context: PreviewContext = {
    media: assets,
    heroVideo: typeof doc.data.heroVideoPath === 'string' ? doc.data.heroVideoPath : '',
    heroImage: typeof doc.data.heroImagePath === 'string' ? doc.data.heroImagePath : '',
    kind: typeof doc.data.kind === 'string' ? doc.data.kind : '',
  }
  const transform = (spec: FieldSpec, depth = 0): Field | undefined => {
    if (depth > 6) return undefined
    const label = spec.label || spec.name
    switch (spec.type) {
      case 'text': case 'email': case 'date': return { type: 'text', label, contentEditable: true }
      case 'textarea': return { type: 'textarea', label, contentEditable: true }
      case 'number': return { type: 'number', label, min: spec.min, max: spec.max }
      case 'select': return { type: 'select', label, options: (spec.options || []).map(option => ({ label: option.label, value: option.value })) }
      case 'checkbox': return { type: 'custom', label, render: ({value,onChange}) => <label className="puck-check-field"><input type="checkbox" checked={value === true} onChange={event=>onChange(event.target.checked)}/>{label}</label> }
      case 'upload': return { type: 'custom', label, render: ({ value, onChange }) =>
        <MediaInput value={value} onChange={onChange} assets={assets} uploaded={uploaded} kind={spec.name.toLowerCase().includes('video') ? 'video' : /^(heroImage|image|portrait|cover|closingImage)$/i.test(spec.name) ? 'image' : 'all'}/> }
      case 'array': {
        const items: Record<string, Field> = {}
        for (const field of spec.fields || []) {
          const converted=transform(field,depth+1)
          if (converted) items[field.name]=converted
        }
        return { type: 'array', label, arrayFields: items,
          defaultItemProps: () => ({ id: crypto.randomUUID(), ...newFields(spec.fields || []) }),
          getItemSummary: (item,index) => String(item.heading || item.title || item.question || item.name || item.role || ('Элемент ' + ((index ?? 0)+1))).slice(0,80) }
      }
      case 'group': {
        const items: Record<string,Field>={}
        for (const f of spec.fields || []) { const converted=transform(f,depth+1); if (converted) items[f.name]=converted }
        return { type: 'object', label, objectFields: items }
      }
      case 'richText': return undefined // Lexical content is preserved unchanged and edited in the technical CMS.
      default: return undefined
    }
  }
  const fromFields = (fields: FieldSpec[]): Record<string,Field> => {
    const result: Record<string,Field>={}
    for (const f of fields) {
      if (f.name === 'studio' || f.name === 'id' || f.name === 'blockType') continue
      const mapped=transform(f)
      if (mapped) result[f.name]=mapped
    }
    return result
  }
  const allComponents: Record<string,unknown>={}
  const categoryMap: Record<string,string[]> = { 'Контент':[], 'Медиа':[], 'Коллекции':[] }
  for (const spec of specs) {
    const defaultProps = { id: undefined, blockName: spec.label, ...newFields(spec.fields), __motion: '', __motionDuration: null, __motionDelay: null, __motionDistance: null, __motionTablet: '', __motionPhone: '' }
    if (spec.slug === 'cta') Object.assign(defaultProps, { heading:'Обсудим следующий уровень вашего бизнеса' })
    if (spec.slug === 'quote') Object.assign(defaultProps, { quote:'Новая цитата' })
    const fields = fromFields(spec.fields)
    fields.blockName = { type: 'text', label: 'Название слоя' }
    const motionOptions = [
      { label: 'Как в исходном сайте', value: '' },
      { label: 'Без анимации', value: 'none' },
      { label: 'Мягкое появление', value: 'fade' },
      { label: 'Появление снизу', value: 'rise' },
      { label: 'Масштабирование', value: 'scale' },
      { label: 'Параллакс', value: 'parallax' },
    ]
    fields.__motion = { type: 'select', label: 'Анимация — Desktop', options: motionOptions }
    fields.__motionDuration = { type: 'number', label: 'Длительность (сек)', min: 0.15, max: 6, step: 0.05 }
    fields.__motionDelay = { type: 'number', label: 'Задержка (сек)', min: 0, max: 5, step: 0.05 }
    fields.__motionDistance = { type: 'number', label: 'Расстояние (px)', min: 0, max: 180 }
    fields.__motionTablet = { type: 'select', label: 'Анимация — Tablet', options: motionOptions }
    fields.__motionPhone = { type: 'select', label: 'Анимация — Phone', options: motionOptions }
    allComponents[spec.slug] = {
      label: spec.label, fields, defaultProps,
      render: (props: Record<string,unknown>) => <PreviewBlock type={spec.slug} props={props} context={context}/>,
    }
    const key = ['visual', 'gallery'].includes(spec.slug) ? 'Медиа' : ['listing', 'aboutEditorial'].includes(spec.slug) ? 'Коллекции' : 'Контент'
    categoryMap[key].push(spec.slug)
  }
  const rootFields = doc.collection === 'pages'
    ? ['title','heroTitle','intro','heroVideo','heroImage']
    : doc.collection === 'projects' ? ['title','summary'] : ['title','excerpt']
  const fields = fromFields(doc.fields.filter(field => rootFields.includes(field.name)))
  return {
    components: allComponents as Config['components'],
    categories: Object.fromEntries(Object.entries(categoryMap).map(([name,names]) => [name,{title:name,components:names}])) as Config['categories'],
    root: {
      fields,
      render: (props: Record<string, unknown> & { children?: ReactNode }) => <PreviewRoot
        title={String(props.title || '')} heroTitle={String(props.heroTitle || '')}
        intro={String(props.intro || '')} summary={String(props.summary || '')}
        excerpt={String(props.excerpt || '')} context={context}
        heroVideo={typeof props.heroVideo === 'number' ? assets.find(a=>a.id===props.heroVideo)?.url : undefined}
        heroImage={typeof props.heroImage === 'number' ? assets.find(a=>a.id===props.heroImage)?.url : undefined}
      >{props.children}</PreviewRoot>,
    },
  }
}
