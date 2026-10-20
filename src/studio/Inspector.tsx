'use client'
import { useState } from 'react'
import { labels, readPath, isRecord, schemaAtPath, newFields, type StudioDocument, type FieldSpec, type RecordData, type MediaAsset, type Breakpoint } from './model'
import { normalizeDesign, type NodeStyle } from './styles'

type Props = {
  document: StudioDocument; data: RecordData; selection: string; node: string; breakpoint: Breakpoint
  assets: MediaAsset[]; setField: (path: string, value: unknown) => void
  select: (path: string) => void; chooseMedia: (path: string) => void
  setStyle: (key: keyof NodeStyle, value: unknown) => void
  resetStyle: () => void
}
function relative(prefix: string, key: string) { return prefix ? prefix + '.' + key : key }
export function Inspector(props: Props) {
  const [tab, setTab] = useState<'content' | 'layout' | 'seo'>('content')
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
  const numberStyle = (key: keyof NodeStyle, title: string, unit = 'px', step = 1) => <label className="st-property" key={key}><span>{title}</span><div className="st-unit-input"><input aria-label={title} type="number" min={0} step={step} value={String(style[key] ?? '')} placeholder="Auto" onChange={event => props.setStyle(key, event.target.value === '' ? '' : Number(event.target.value))}/><small>{unit}</small></div></label>
  return <aside className="st-inspector" aria-label="Свойства выбранного элемента">
    <div className="st-panel-heading"><span>{title}</span><small>{selection || document.collection}</small></div>
    <div className="st-tabs st-inspector-tabs">{(['content', 'layout', 'seo'] as const).map(key => <button type="button" key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{key === 'content' ? 'Контент' : key === 'layout' ? 'Макет' : 'SEO'}</button>)}</div>
    <div className="st-inspector-scroll">
      {tab !== 'layout' ? <FieldGroup fields={fields} data={data} prefix={prefix} assets={assets} setField={setField} chooseMedia={chooseMedia} select={select} depth={0} document={document}/> : <>
        <div className="st-property-section"><h3>Адаптив <span>{breakpoint}</span></h3><p className="st-hint">{breakpoint === 'desktop' ? 'Базовые значения для всех размеров.' : 'Пустое поле наследует больший экран. Меняется только выбранный адаптив.'}</p></div>
        <div className="st-property-section"><h3>Размер и расстояния</h3>{numberStyle('maxWidth', 'Максимальная ширина')}{numberStyle('minHeight', 'Минимальная высота')}{numberStyle('paddingTop', 'Отступ сверху')}{numberStyle('paddingBottom', 'Отступ снизу')}{numberStyle('paddingLeft', 'Отступ слева')}{numberStyle('paddingRight', 'Отступ справа')}{numberStyle('marginTop', 'Внешний сверху')}{numberStyle('marginBottom', 'Внешний снизу')}{numberStyle('borderRadius', 'Скругление')}{numberStyle('gap', 'Интервал')}</div>
        <div className="st-property-section"><h3>Заголовок</h3>{numberStyle('fontSize', 'Размер шрифта')}{numberStyle('lineHeight', 'Высота строки', '×', 0.05)}<label className="st-property"><span>Выравнивание</span><select value={style.textAlign || ''} onChange={event => props.setStyle('textAlign', event.target.value)}><option value="">Auto</option><option value="left">Слева</option><option value="center">По центру</option><option value="right">Справа</option></select></label></div>
        <div className="st-property-section"><h3>Цвет и видимость</h3>{(['backgroundColor', 'color'] as const).map(key => <label className="st-property" key={key}><span>{key === 'color' ? 'Текст' : 'Фон'}</span><div className="st-color-field"><input type="color" aria-label={key} value={/^#[a-f0-9]{6}$/i.test(String(style[key])) ? String(style[key]) : '#ffffff'} onChange={event => props.setStyle(key, event.target.value)}/><input aria-label={key + ' hex'} placeholder="Auto" value={style[key] || ''} onChange={event => props.setStyle(key, event.target.value)} /></div></label>)}<label className="st-check"><input type="checkbox" checked={style.hidden === true} onChange={event => props.setStyle('hidden', event.target.checked)}/>Скрыть на этом размере</label></div>
        <button type="button" className="st-secondary st-full" onClick={props.resetStyle}>Сбросить переопределения</button>
      </>}
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
