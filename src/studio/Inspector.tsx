'use client'
import { useState } from 'react'
import { labels, readPath, isRecord, schemaAtPath, newFields, type StudioDocument, type FieldSpec, type RecordData, type MediaAsset, type Breakpoint } from './model'
import { normalizeDesign, type NodeStyle } from './styles'
import { LayoutControls, MotionControls } from './PropertyPanels'

type Props = {
  document: StudioDocument; data: RecordData; selection: string; node: string; breakpoint: Breakpoint
  assets: MediaAsset[]; setField: (path: string, value: unknown) => void
  select: (path: string) => void; chooseMedia: (path: string) => void
  setStyle: (key: keyof NodeStyle, value: unknown) => void
  resetStyle: () => void
}
function relative(prefix: string, key: string) { return prefix ? prefix + '.' + key : key }
export function Inspector(props: Props) {
  const [tab, setTab] = useState<'content' | 'layout' | 'motion' | 'seo'>('content')
  const { document, data, selection, node, breakpoint, assets, setField, chooseMedia, select } = props
  const value = readPath(data, selection)
  let prefix = !selection || selection === 'hero' ? '' : isRecord(value) || Array.isArray(value) ? selection : selection.split('.').slice(0, -1).join('.')
  let fields = schemaAtPath(document.fields, data, selection)
  if (tab === 'seo') {
    const seo = document.fields.find(field => field.name === 'seo')
    prefix = seo ? 'seo' : ''; fields = seo?.fields || document.fields.filter(field => ['seoDescription', 'editorialReviewed', 'publishedAt'].includes(field.name))
  } else if (!selection || selection === 'hero') {
    fields = fields.filter(field => field.name !== 'seo')
    if (selection === 'hero') {
      const order = ['heroTitle','title','intro','summary','excerpt','heroImage','cover','heroVideo','client','year','category']
      fields = fields.filter(field => order.includes(field.name)).sort((a,b) => order.indexOf(a.name) - order.indexOf(b.name))
    }
  }
  const title = selection === 'hero' ? 'Первый экран' : isRecord(value) ? String(value.blockName || value.heading || value.blockType || 'Секция') : !selection ? 'Страница' : labels[selection.split('.').at(-1)!] || 'Элемент'
  const design = normalizeDesign(data.studio), style = design.nodes[node]?.[breakpoint] || {}
  return <aside className="st-inspector" aria-label="Свойства выбранного элемента">
    <div className="st-panel-heading"><span>{title}</span><small>{selection || document.collection}</small></div>
    <div className="st-tabs st-inspector-tabs">{(['content', 'layout', 'motion', 'seo'] as const).map(key => <button type="button" key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{key === 'content' ? 'Контент' : key === 'layout' ? 'Макет' : key === 'motion' ? 'Анимация' : 'SEO'}</button>)}</div>
    <div className="st-inspector-scroll">
      {(tab === 'content' || tab === 'seo')
        ? <FieldGroup fields={fields} data={data} prefix={prefix} assets={assets} setField={setField} chooseMedia={chooseMedia} select={select} depth={0} document={document}/>
        : tab === 'layout'
          ? <LayoutControls style={style} breakpoint={breakpoint} setStyle={props.setStyle} resetStyle={props.resetStyle}/>
          : <MotionControls style={style} setStyle={props.setStyle} available={!!node && node !== 'root'}/>
      }
      <div className="st-inspector-note"><span>Компонентная вёрстка</span><p>Исходные CSS и анимации сохраняются. Макет задаёт только явные переопределения выбранной секции.</p></div>
    </div>
  </aside>
}
function FieldGroup({ fields, data, prefix, assets, setField, chooseMedia, select, depth, document }: {
  fields: FieldSpec[]; data: RecordData; prefix: string; assets: MediaAsset[]
  setField: Props['setField']; chooseMedia: Props['chooseMedia']; select: Props['select']; depth: number; document: StudioDocument
}) {
  return <>{fields.filter(field => !['studio', 'blocks', 'sections'].includes(field.name)).map(field => {
    const path = relative(prefix, field.name), value = readPath(data, path)
    if (field.type === 'group') return <details key={path} className="st-field-group" open={field.name === 'seo'}><summary>{field.label}</summary><FieldGroup {...{ data, assets, setField, chooseMedia, select, document }} fields={field.fields || []} prefix={path} depth={depth + 1}/></details>
    if (field.type === 'array') {
      const rows = Array.isArray(value) ? value : []
      return <div key={path} className="st-property-section"><h3>{field.label}<span>{rows.length}</span></h3><div className="st-inspector-rows">{rows.map((row, index) => <details key={isRecord(row) && typeof row.id === 'string' ? row.id : index} className="st-row-details"><summary><span>{isRecord(row) ? String(row.title || row.heading || row.question || row.name || row.role || 'Элемент ' + (index + 1)).slice(0, 42) : 'Элемент'}</span><small>{index + 1}</small></summary><div className="st-row-tools"><button type="button" title="Вверх" disabled={index === 0} onClick={() => { const next = rows.slice(); [next[index - 1], next[index]] = [next[index], next[index - 1]]; setField(path, next) }}>↑</button><button type="button" title="Вниз" disabled={index === rows.length - 1} onClick={() => { const next = rows.slice(); [next[index], next[index + 1]] = [next[index + 1], next[index]]; setField(path, next) }}>↓</button><button type="button" className="st-danger" onClick={() => setField(path, rows.filter((_, i) => i !== index))}>Убрать</button></div>{depth < 5 && <FieldGroup {...{ data, assets, setField, chooseMedia, select, document }} fields={field.fields || []} prefix={path + '.' + index} depth={depth + 1}/>}</details>)}</div><button type="button" className="st-secondary st-full" onClick={() => setField(path, [...rows, { id: crypto.randomUUID(), ...newFields(field.fields || []) }])}>+ Добавить элемент</button></div>
    }
    if (field.type === 'upload') {
      const id = isRecord(value) ? Number(value.id) : Number(value)
      const asset = assets.find(item => item.id === id)
      return <div key={path} className="st-media-property"><span>{field.label}</span><button type="button" className="st-media-control" onClick={() => chooseMedia(path)}>{asset?.mimeType?.startsWith('image/') ? <img src={asset.thumbnailURL || asset.url} alt=""/> : <span className="st-media-placeholder">{asset?.mimeType?.startsWith('video/') ? '▶' : '▧'}</span>}<span>{asset?.filename || (id ? 'Файл #' + id : 'Выбрать файл')}<small>Медиатека ↗</small></span></button>{!!value && <button type="button" className="st-text-button" onClick={() => setField(path, null)}>Снять привязку</button>}</div>
    }
    if (field.type === 'richText') return <div className="st-property-section" key={path}><h3>{field.label}</h3><p className="st-hint">Форматирование и ссылки сохраняются без преобразования.</p><a className="st-secondary st-full" href={'/admin/collections/' + document.collection + '/' + document.id} target="_blank" rel="noreferrer">Открыть текстовый редактор ↗</a></div>
    if (field.type === 'checkbox') return <label className="st-check" key={path}><input type="checkbox" checked={value === true} onChange={event => setField(path, event.target.checked)}/>{field.label}</label>
    if (field.type === 'select') return <label className="st-field" key={path}><span>{field.label}</span><select value={typeof value === 'string' ? value : ''} onChange={event => setField(path, event.target.value)}><option value="" disabled>Выберите</option>{field.options?.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
    if (['text', 'textarea', 'email', 'number', 'date'].includes(field.type)) return <label className="st-field" key={path}><span>{field.label}{field.required && <i> *</i>}</span>{field.type === 'textarea' ? <textarea aria-label={field.label} rows={4} value={String(value || '')} onChange={event => setField(path, event.target.value)}/> : <input aria-label={field.label} type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'} min={field.min} max={field.max} value={value === null || value === undefined ? '' : String(value)} onChange={event => setField(path, field.type === 'number' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value)}/>}</label>
    return null
  })}</>
}
