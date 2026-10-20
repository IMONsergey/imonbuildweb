'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { LayerTree } from './LayerTree'
import { Inspector } from './Inspector'
import { useStudioDocument, studioFetch } from './useStudioDocument'
import { collections, fieldNodeID, blockField, cloneLayer, isRecord, layerName, newFields, nodeID, readPath, viewports, type RecordData, type StudioCollection, type FieldSpec, type DocumentSummary, type MediaAsset, type StudioDocument, type Breakpoint } from './model'
import { normalizeDesign, changeNodeStyle, type NodeStyle } from './styles'

type Bootstrap = { documents: DocumentSummary[]; schemas: Record<StudioCollection, FieldSpec[]>; user: { id: number; name: string; role: string } }
type Version = { id: number; createdAt: string; status: string; title: string }
type MediaPage = { docs: MediaAsset[]; hasNextPage: boolean; nextPage?: number }
const collectionLabels = { pages: 'Страницы сайта', projects: 'Кейсы', articles: 'Журнал' }
const stateLabels = { loading: 'Загрузка…', saved: 'Все изменения сохранены', editing: 'Есть изменения', saving: 'Сохраняем черновик…', error: 'Не сохранено', conflict: 'Конфликт версий' }
function Icon({ name }: { name: 'pages' | 'layers' | 'assets' | 'arrow' | 'plus' | 'play' | 'settings' | 'history' }) {
  const paths: Record<string, ReactNode> = {
    pages: <><path d="M5 2h8l4 4v14H5z"/><path d="M13 2v5h4M8 11h6M8 15h6"/></>,
    layers: <><path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/></>,
    assets: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 5 5 3-3 5 5"/><circle cx="16" cy="8" r="1.4"/></>,
    arrow: <><path d="m5 3 14 9-7 1-3 7z"/></>,
    plus: <path d="M12 4v16M4 12h16"/>, play: <path d="m8 4 12 8-12 8z"/>,
    settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
    history: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 6v6l4 3"/></>,
  }
  return <svg className="st-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
function Dialog({ title, children, close, wide = false }: { title: string; children: ReactNode; close: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('input,button,select')?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key !== 'Tab') return
      const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,a[href],textarea') || []).filter(node => node.getClientRects().length)
      const first = nodes[0], last = nodes.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('keydown', key); previous?.focus() }
  }, [close])
  return <div className="st-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}><div className={'st-modal ' + (wide ? 'st-modal-wide' : '')} ref={ref} role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button type="button" aria-label="Закрыть" onClick={close}>×</button></header>{children}</div></div>
}

export function Studio({ initial }: { initial: Bootstrap }) {
  const editor = useStudioDocument(initial.user.id)
  const [documents, setDocuments] = useState(initial.documents)
  const [view, setView] = useState<'canvas' | 'cms' | 'assets'>('canvas')
  const [left, setLeft] = useState<'pages' | 'layers' | 'assets'>('pages')
  const [selection, setSelection] = useState('hero')
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [zoom, setZoom] = useState(0.5)
  const [autoFit, setAutoFit] = useState(true)
  const [preview, setPreview] = useState(false)
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [assetSearch, setAssetSearch] = useState('')
  const [mediaPath, setMediaPath] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'insert' | 'publish' | 'new' | 'versions' | 'settings' | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [busy, setBusy] = useState(false)
  const [notification, setNotification] = useState('')
  const [newTitle, setNewTitle] = useState('Новая страница')
  const [newPath, setNewPath] = useState('/new-page')
  const [newCollection, setNewCollection] = useState<StudioCollection>('pages')
  const [duplicatePage, setDuplicatePage] = useState(false)
  const [inlineEdit, setInlineEdit] = useState(false)
  const [renderVersion, setRenderVersion] = useState(0)
  const [ready, setReady] = useState(false)
  const [cmsCollection, setCmsCollection] = useState<StudioCollection>('projects')
  const [cmsStatus, setCmsStatus] = useState('all')
  const [pan, setPan] = useState(false)
  const iframe = useRef<HTMLIFrameElement>(null), stage = useRef<HTMLDivElement>(null)
  const canvasScroll = useRef(0), dragLayer = useRef(''), initialized = useRef(false)
  const currentDoc = editor.document, data = editor.data
  const base = currentDoc ? blockField(currentDoc.collection) : 'blocks'
  const layers = Array.isArray(data[base]) ? data[base] as RecordData[] : []
  const selectedIndex = selection.startsWith(base + '.') ? Number(selection.split('.')[1]) : -1
  const selectedNode = /^(blocks|sections)\.\d+$/.test(selection) && layers[selectedIndex] ? nodeID(layers[selectedIndex], selectedIndex) : !selection ? 'root' : selection === 'hero' ? 'hero' : fieldNodeID(data, selection)
  const send = useCallback((message: RecordData) => iframe.current?.contentWindow?.postMessage({ source: 'imon-studio', ...message }, location.origin), [])
  const closeDialog = useCallback(() => { setDialog(null); setMediaPath(null) }, [])
  const refreshList = useCallback(async () => { const next = await studioFetch<Bootstrap>('bootstrap'); setDocuments(next.documents) }, [])
  const fit = useCallback(() => {
    const width = stage.current?.clientWidth || 850, height = stage.current?.clientHeight || 850
    setAutoFit(true)
    setZoom(Math.min(1, Math.max(0.25, Math.min((width - 100) / viewports[breakpoint].width, (height - 110) / viewports[breakpoint].height))))
  }, [breakpoint])
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const query = new URLSearchParams(location.search)
    const requested = documents.find(doc => doc.collection === query.get('collection') && doc.id === Number(query.get('id')))
    const first = requested || documents.find(doc => doc.path === '/') || documents[0]
    if (first) void editor.open(first.collection, first.id)
    void (async () => {
      let page = 1
      do {
        const result = await studioFetch<MediaPage>('media?page=' + page)
        setAssets(current => [...new Map([...current, ...result.docs].map(asset => [asset.id, asset])).values()])
        if (!result.hasNextPage || !result.nextPage) break
        page = result.nextPage
      } while (page <= 20)
    })().catch(error => setNotification(error.message))
  }, []) // Initial boot only; document transitions are explicit and guarded by the editor.
  useEffect(() => { if (view === 'canvas') fit() }, [fit, view, currentDoc?.id, currentDoc?.collection])
  useEffect(() => {
    if (!stage.current || !autoFit) return
    const observer = new ResizeObserver(() => fit())
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [autoFit, fit, view])
  useEffect(() => { if (!inlineEdit) { setRenderVersion(editor.frameVersion); setReady(false) } }, [editor.frameVersion, inlineEdit])
  useEffect(() => { send({ type: 'mode', preview }) }, [preview, ready, send])
  useEffect(() => { send({ type: 'design', design: data.studio }) }, [data.studio, ready, send])
  useEffect(() => { if (!notification) return; const timer = setTimeout(() => setNotification(''), 4500); return () => clearTimeout(timer) }, [notification])
  const select = (path: string, scroll = true) => { setSelection(path); setLeft('layers'); send({ type: 'select', path, scroll }) }
  const edit = (path: string, value: unknown) => { editor.setField(path, value); if (typeof value === 'string') send({ type: 'patch', path, value }) }
  const reorder = (from: string, to: string) => {
    const matchFrom = from.match(/^(blocks|sections)\.(\d+)/), matchTo = to.match(/^(blocks|sections)\.(\d+)/)
    if (!matchFrom || !matchTo || matchFrom[1] !== base || matchTo[1] !== base) return
    const start = Number(matchFrom[2]), end = Number(matchTo[2])
    if (!layers[start] || !layers[end] || start === end) return
    const next = layers.slice(); const [moved] = next.splice(start, 1); next.splice(end, 0, moved)
    editor.setField(base, next); setSelection(base + '.' + end)
  }
  const duplicateLayer = () => {
    if (!layers[selectedIndex]) return
    const copy = cloneLayer(layers[selectedIndex]) as RecordData
    copy.blockName = layerName(copy, selectedIndex) + ' — копия'
    const next = layers.slice(); next.splice(selectedIndex + 1, 0, copy)
    editor.setField(base, next); setSelection(base + '.' + (selectedIndex + 1))
  }
  const removeLayer = () => {
    if (!layers[selectedIndex]) return
    editor.setField(base, layers.filter((_, index) => index !== selectedIndex)); setSelection('hero')
    setNotification('Секция удалена из черновика. Действие можно отменить.')
  }
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow || !isRecord(event.data) || event.data.source !== 'imon-canvas') return
      const info = event.data
      if (info.type === 'ready') { setReady(true); send({ type: 'mode', preview }); send({ type: 'select', path: selection }); send({ type: 'design', design: data.studio }); send({ type: 'scroll', y: canvasScroll.current }) }
      if (info.type === 'select' && typeof info.path === 'string') { setSelection(info.path); setLeft('layers') }
      if (info.type === 'edit' && typeof info.path === 'string' && typeof info.value === 'string') editor.setField(info.path, info.value)
      if (info.type === 'edit-start') setInlineEdit(true)
      if (info.type === 'edit-end') setInlineEdit(false)
      if (info.type === 'scroll' && typeof info.y === 'number') canvasScroll.current = info.y
      if (info.type === 'save') void editor.save()
      if (info.type === 'reorder' && typeof info.from === 'string' && typeof info.to === 'string') reorder(info.from, info.to)
    }
    window.addEventListener('message', message)
    return () => window.removeEventListener('message', message)
  }, [selection, data, preview, layers, base, editor.setField, editor.save, send])
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const input = (event.target as HTMLElement).closest('input,textarea,select,[contenteditable=true]')
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void editor.save() }
      if (input || dialog || mediaPath) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? editor.redo() : editor.undo() }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd' && selectedIndex >= 0) { event.preventDefault(); duplicateLayer() }
      if ((event.metaKey || event.ctrlKey) && event.key === '0') { event.preventDefault(); fit() }
      if (event.code === 'Space') { event.preventDefault(); setPan(true) }
      if (event.key === 'Escape') { setPreview(false); setSelection('hero') }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIndex >= 0) { event.preventDefault(); removeLayer() }
    }
    const up = (event: KeyboardEvent) => { if (event.code === 'Space') setPan(false) }
    const blur = () => setPan(false)
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [dialog, mediaPath, selectedIndex, layers, editor.save, editor.undo, editor.redo, fit])
  async function openDocument(summary: DocumentSummary) {
    if (await editor.open(summary.collection, summary.id)) { setView('canvas'); setSelection('hero'); canvasScroll.current = 0; setPreview(false) }
  }
  async function showVersions() {
    if (!currentDoc) return
    setDialog('versions'); setBusy(true)
    try { const result = await studioFetch<{ versions: Version[] }>(`versions?collection=${currentDoc.collection}&id=${currentDoc.id}`); setVersions(result.versions) } catch (error) { setNotification((error as Error).message) } finally { setBusy(false) }
  }
  async function restore(version: Version) {
    if (!currentDoc || !window.confirm('Восстановить эту версию в новый черновик? Опубликованный сайт не изменится.')) return
    setBusy(true)
    try {
      if (!await editor.save()) return
      const fresh = await studioFetch<StudioDocument>(`document?collection=${currentDoc.collection}&id=${currentDoc.id}`)
      await studioFetch('restore', { method: 'PUT', body: JSON.stringify({ collection: fresh.collection, id: fresh.id, revision: fresh.revision, version: version.id }) })
      await editor.open(fresh.collection, fresh.id, true); setDialog(null); setNotification('Версия восстановлена в черновик')
    } catch (error) { setNotification((error as Error).message) } finally { setBusy(false) }
  }
  async function upload(file: File) {
    setBusy(true)
    try {
      const form = new FormData(); form.set('file', file); form.set('alt', file.name)
      const asset = await studioFetch<MediaAsset>('media', { method: 'POST', body: form })
      setAssets(current => [asset, ...current]); setNotification('Файл добавлен в медиатеку')
    } catch (error) { setNotification((error as Error).message) } finally { setBusy(false) }
  }
  async function createDocument() {
    setBusy(true)
    try {
      const createdData = duplicatePage && currentDoc?.collection === newCollection ? cloneLayer(data) as RecordData : newFields(initial.schemas[newCollection])
      createdData.title = newTitle
      if (newCollection === 'pages') { createdData.path = newPath; if (!duplicatePage) createdData.kind = 'standard' }
      else { createdData.slug = newPath.split('/').filter(Boolean).at(-1); if (newCollection === 'projects') createdData.sourcePath = newPath }
      const created = await studioFetch<StudioDocument>('document', { method: 'POST', body: JSON.stringify({ collection: newCollection, data: createdData }) })
      await refreshList(); await editor.open(created.collection, created.id, true); setView('canvas'); setDialog(null); setSelection('hero'); canvasScroll.current = 0
    } catch (error) { setNotification((error as Error).message) } finally { setBusy(false) }
  }
  const matchingAssets = assets.filter(asset => (asset.filename + ' ' + asset.alt).toLowerCase().includes(assetSearch.toLowerCase()))
  const mediaGrid = <><div className="st-media-toolbar"><input className="st-search" value={assetSearch} placeholder="Поиск медиа" aria-label="Поиск медиа" onChange={event => setAssetSearch(event.target.value)}/><label className="st-primary st-upload">{busy ? 'Загрузка…' : 'Загрузить'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,application/pdf" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = '' }}/></label></div><div className="st-asset-grid">{matchingAssets.map(asset => <button type="button" key={asset.id} className="st-asset" title={asset.alt || asset.filename} onClick={() => { if (mediaPath) { editor.setField(mediaPath, asset.id); setMediaPath(null) } else setNotification(asset.filename + ' · #' + asset.id) }}>{asset.mimeType?.startsWith('image/') ? <img src={asset.thumbnailURL || asset.url} alt={asset.alt || ''} loading="lazy"/> : <div className="st-file-icon">{asset.mimeType?.startsWith('video/') ? '▶' : 'PDF'}</div>}<span>{asset.filename}</span><small>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : asset.mimeType}</small></button>)}</div>{!matchingAssets.length && <p className="st-empty">Медиа не найдено</p>}</>
  const filteredDocuments = documents.filter(item => (item.title + ' ' + item.path).toLowerCase().includes(search.toLowerCase()))
  const vp = viewports[breakpoint]
  return <div className="st-shell">
    <header className="st-toolbar"><a href="/studio" className="st-brand" aria-label="I’MON Studio">I’MON<span>Studio</span></a><div className="st-project-name">Новый сайт I’MON <span>↗</span></div><nav className="st-workspace-nav" aria-label="Рабочая область">{(['canvas', 'cms', 'assets'] as const).map(key => <button type="button" key={key} onClick={() => setView(key)} className={view === key ? 'active' : ''}>{key === 'canvas' ? 'Холст' : key === 'cms' ? 'CMS' : 'Медиа'}</button>)}</nav><div className="st-toolbar-end"><button type="button" title="Настройки проекта" onClick={() => setDialog('settings')}><Icon name="settings"/></button><button type="button" title="История версий" onClick={() => void showVersions()} disabled={!currentDoc}><Icon name="history"/></button><button type="button" className={'st-preview-button ' + (preview ? 'active' : '')} onClick={() => { setPreview(!preview); setView('canvas') }} disabled={!currentDoc}><Icon name="play"/><span>Предпросмотр</span></button><button type="button" className="st-primary" disabled={!currentDoc || editor.state === 'loading'} onClick={() => setDialog('publish')}>Опубликовать</button><span className="st-avatar" title={initial.user.name}>{initial.user.name.slice(0, 1).toUpperCase()}</span></div></header>
    <div className="st-body">
      <aside className="st-sidebar"><div className="st-tabs">{(['pages', 'layers', 'assets'] as const).map(key => <button type="button" key={key} className={left === key ? 'active' : ''} onClick={() => setLeft(key)}><Icon name={key}/><span>{key === 'pages' ? 'Страницы' : key === 'layers' ? 'Слои' : 'Вставка'}</span></button>)}</div>
        {left === 'pages' && <><div className="st-sidebar-search"><input className="st-search" aria-label="Поиск страниц" placeholder="Найти страницу…" value={search} onChange={event => setSearch(event.target.value)}/></div><div className="st-tree">{collections.map(collection => <details open key={collection}><summary>{collectionLabels[collection]}<span>{documents.filter(item => item.collection === collection).length}</span></summary>{filteredDocuments.filter(item => item.collection === collection).map(item => <button type="button" key={collection + item.id} className={'st-page-item ' + (currentDoc?.collection === item.collection && currentDoc.id === item.id ? 'active' : '')} onClick={() => void openDocument(item)}><Icon name="pages"/><span>{item.title}<small>{item.path}</small></span><i className={'st-status-dot ' + (item.status !== 'draft' ? 'published' : '')} title={item.status}/></button>)}</details>)}</div><div className="st-sidebar-bottom"><button type="button" className="st-secondary st-full" onClick={() => { setDuplicatePage(false); setNewCollection('pages'); setNewTitle('Новая страница'); setNewPath('/new-page'); setDialog('new') }}><Icon name="plus"/>Новая страница</button></div></>}
        {left === 'layers' && <><div className="st-panel-heading"><span>{String(data.title || 'Страница')}</span><button type="button" title="Добавить секцию" disabled={!currentDoc} onClick={() => setDialog('insert')}><Icon name="plus"/></button></div><div className="st-tree st-layer-tree"><button type="button" className={'st-layer ' + (selection === 'hero' ? 'active' : '')} onClick={() => select('hero')}><Icon name="layers"/><span>Первый экран</span><small>Frame</small></button>{layers.map((block, index) => <div key={String(block.id || index)} className={'st-layer-group ' + (selectedIndex === index ? 'selected' : '')} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); reorder(dragLayer.current, base + '.' + index); dragLayer.current = '' }}><button type="button" data-testid="studio-layer" draggable className={'st-layer ' + (selectedIndex === index ? 'active' : '')} onDragStart={event => { dragLayer.current = base + '.' + index; event.dataTransfer.setData('text/plain', dragLayer.current) }} onClick={() => select(base + '.' + index)}><span className="st-layer-handle">⠿</span><span>{layerName(block, index)}</span><small>{String(index + 1).padStart(2, '0')}</small></button>{selectedIndex === index && <div className="st-layer-actions"><button type="button" title="Сдвинуть вверх" disabled={index === 0} onClick={() => reorder(base + '.' + index, base + '.' + (index - 1))}>↑</button><button type="button" title="Сдвинуть вниз" disabled={index === layers.length - 1} onClick={() => reorder(base + '.' + index, base + '.' + (index + 1))}>↓</button><button type="button" title="Дублировать секцию" onClick={duplicateLayer}>Копия</button><button type="button" title="Удалить секцию из черновика" onClick={removeLayer}>Убрать</button></div>}{selectedIndex === index && <LayerTree fields={currentDoc?.fields.find(field => field.type === 'blocks')?.blocks?.find(spec => spec.slug === block.blockType)?.fields || []} data={data} prefix={base + '.' + index} selection={selection} select={select}/>}</div>)}</div><div className="st-sidebar-bottom"><p className="st-hint">Перетащите секцию или используйте стрелки. Изменения остаются в черновике.</p><button type="button" className="st-secondary st-full" onClick={() => setDialog('insert')}>+ Добавить секцию</button></div></>}
        {left === 'assets' && <div className="st-insert-list"><h3>Компоненты страницы</h3>{(currentDoc?.fields.find(field => field.type === 'blocks')?.blocks || []).map(block => <button type="button" key={block.slug} onClick={() => { const next = { id: crypto.randomUUID(), blockType: block.slug, blockName: block.label, ...newFields(block.fields) }; editor.setField(base, [...layers, next]); setSelection(base + '.' + layers.length); setLeft('layers') }}><Icon name="plus"/><span>{block.label}<small>{block.slug}</small></span></button>)}<button type="button" onClick={() => setView('assets')}><Icon name="assets"/><span>Открыть медиатеку</span></button></div>}
      </aside>
      <section className="st-workspace">
        {view === 'canvas' && <><div className="st-canvas-toolbar"><div className="st-canvas-tools"><button type="button" title="Выбрать элемент" className={!pan ? 'active' : ''} onClick={() => { setPan(false); setPreview(false) }}><Icon name="arrow"/></button><button type="button" title="Отменить" disabled={!editor.historyCounts[0]} onClick={editor.undo}>↶</button><button type="button" title="Повторить" disabled={!editor.historyCounts[1]} onClick={editor.redo}>↷</button></div><div className="st-breakpoints">{(Object.keys(viewports) as Breakpoint[]).map(key => <button type="button" key={key} className={breakpoint === key ? 'active' : ''} onClick={() => { setBreakpoint(key); canvasScroll.current = 0 }}><span>{viewports[key].label}</span><small>{viewports[key].width}</small></button>)}</div><div className="st-canvas-tools"><select aria-label="Масштаб холста" value={Math.round(zoom * 100)} onChange={event => { setAutoFit(false); setZoom(Number(event.target.value) / 100) }}>{Array.from(new Set([25, 50, 75, 100, 125, Math.round(zoom * 100)])).sort((a, b) => a - b).map(value => <option value={value} key={value}>{value}%</option>)}</select><button type="button" onClick={fit} title="Вписать холст (⌘0)">⊡</button></div></div><div className={'st-canvas-stage ' + (pan ? 'is-panning' : '')} ref={stage} onPointerDown={event => { if (!pan || !stage.current) return; const element = stage.current, x = event.clientX, y = event.clientY, left = element.scrollLeft, top = element.scrollTop; element.setPointerCapture(event.pointerId); const move = (next: PointerEvent) => { element.scrollLeft = left - next.clientX + x; element.scrollTop = top - next.clientY + y }; const up = () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerup', up) }; element.addEventListener('pointermove', move); element.addEventListener('pointerup', up) }}>
          {currentDoc && editor.state !== 'loading' ? <div className="st-artboard-wrap" style={{ width: vp.width * zoom, height: vp.height * zoom }}><div className="st-artboard-label"><span>{String(data.title || currentDoc.path)}</span><span>{vp.label} · {vp.width} × {vp.height}{preview ? ' · Preview' : ''}</span></div><iframe key={currentDoc.collection + currentDoc.id + renderVersion} ref={iframe} title={'Холст — ' + String(data.title || currentDoc.path)} src={`/studio/canvas?collection=${currentDoc.collection}&id=${currentDoc.id}&v=${renderVersion}`} className="st-artboard" style={{ width: vp.width, height: vp.height, transform: `scale(${zoom})`, pointerEvents: pan ? 'none' : 'auto' }} sandbox="allow-scripts allow-same-origin allow-forms"/>{!ready && <div className="st-canvas-loading">Загружаем холст…</div>}</div> : <div className="st-loading-state">{editor.error || 'Загружаем страницу…'}</div>}
        </div><div className="st-canvas-status"><span>{currentDoc?.path || '/'}</span><span>Колесо — прокрутка страницы · Пробел — перемещение холста · ⌘0 — вписать</span><button type="button" title="Сохранить черновик" onClick={() => void editor.save()} disabled={editor.state === 'saving'}><i className={'st-save-dot ' + editor.state}/>{stateLabels[editor.state]}</button></div></>}
        {view === 'cms' && <div className="st-cms"><div className="st-view-header"><div><small>КОЛЛЕКЦИИ</small><h1>Управление контентом</h1><p>Те же записи, которые используются на сайте и на холсте.</p></div><button type="button" className="st-primary" onClick={() => { setNewCollection(cmsCollection); setNewTitle('Новый материал'); setNewPath(cmsCollection === 'projects' ? '/work/new-project' : cmsCollection === 'articles' ? '/news/new-article' : '/new-page'); setDuplicatePage(false); setDialog('new') }}>+ Новый материал</button></div><div className="st-cms-filters"><div className="st-tabs">{collections.map(collection => <button type="button" key={collection} className={cmsCollection === collection ? 'active' : ''} onClick={() => setCmsCollection(collection)}>{collectionLabels[collection]}</button>)}</div><select aria-label="Статус публикации" value={cmsStatus} onChange={event => setCmsStatus(event.target.value)}><option value="all">Все статусы</option><option value="published">Опубликованные</option><option value="draft">Черновики</option><option value="changed">Есть изменения</option></select></div><table className="st-table"><thead><tr><th>Название</th><th>Адрес</th><th>Статус</th><th>Изменено</th></tr></thead><tbody>{filteredDocuments.filter(item => item.collection === cmsCollection && (cmsStatus === 'all' || item.status === cmsStatus)).map(item => <tr key={item.id}><td><button type="button" onClick={() => void openDocument(item)}>{item.title}</button></td><td>{item.path}</td><td><span className={'st-badge ' + item.status}>{item.status === 'published' ? 'Опубликован' : item.status === 'changed' ? 'Есть изменения' : 'Черновик'}</span></td><td>{new Date(item.updatedAt).toLocaleDateString('ru-RU')}</td></tr>)}</tbody></table></div>}
        {view === 'assets' && <div className="st-library-view"><div className="st-view-header"><div><small>РЕСУРСЫ ПРОЕКТА</small><h1>Медиатека</h1><p>{assets.length} файлов · Изображения, видео и документы</p></div></div>{mediaGrid}</div>}
      </section>
      {currentDoc && view === 'canvas' && <Inspector document={currentDoc} data={data} selection={selection} node={selectedNode} breakpoint={breakpoint} assets={assets} setField={edit} select={select} chooseMedia={setMediaPath} setStyle={(key: keyof NodeStyle, value: unknown) => editor.commit({ ...data, studio: changeNodeStyle(data.studio, selectedNode, breakpoint, key, value) }, 'studio.' + selectedNode + '.' + breakpoint + '.' + key)} resetStyle={() => { const design = normalizeDesign(data.studio); if (design.nodes[selectedNode]) delete design.nodes[selectedNode][breakpoint]; editor.commit({ ...data, studio: design }) }}/>}</div>
    {editor.error && <div className="st-error-bar" role="alert"><span>{editor.error}</span><button type="button" onClick={() => void editor.save()}>Повторить запись</button><button type="button" onClick={() => { if (window.confirm('Загрузить серверную версию? Несохранённые правки останутся только в локальной резервной копии.')) void editor.refresh() }}>Загрузить актуальную</button></div>}
    {notification && <div className="st-toast" role="status">{notification}</div>}
    {mediaPath !== null && <Dialog title="Выбрать медиа" wide close={closeDialog}><p className="st-dialog-note">Файл будет привязан к полю {mediaPath}. Публикация не выполняется.</p>{mediaGrid}</Dialog>}
    {dialog === 'insert' && <Dialog title="Добавить секцию" close={closeDialog}><div className="st-insert-list">{currentDoc?.fields.find(field => field.type === 'blocks')?.blocks?.map(block => <button type="button" key={block.slug} onClick={() => { const next = layers.slice(); const index = selectedIndex >= 0 ? selectedIndex + 1 : next.length; next.splice(index, 0, { id: crypto.randomUUID(), blockType: block.slug, blockName: block.label, ...newFields(block.fields) }); editor.setField(base, next); setSelection(base + '.' + index); setLeft('layers'); setDialog(null) }}><Icon name="plus"/><span>{block.label}<small>{block.slug}</small></span></button>)}</div></Dialog>}
    {dialog === 'publish' && currentDoc && <Dialog title="Опубликовать изменения" close={closeDialog}><div className="st-publish-summary"><span className="st-badge draft">{currentDoc.published ? 'Изменения страницы' : 'Первая публикация'}</span><h3>{String(data.title || '')}</h3><code>{currentDoc.path}</code><p>Будет опубликован только этот документ. Остальные страницы и их черновики не изменятся. Перед публикацией проверьте три адаптива.</p><div className="st-dialog-actions"><button type="button" className="st-secondary" onClick={closeDialog}>Отмена</button><button type="button" className="st-primary" disabled={editor.state === 'saving'} onClick={async () => { if (await editor.save('publish')) { setDialog(null); await refreshList(); setNotification('Документ опубликован') } }}>Опубликовать документ</button></div></div></Dialog>}
    {dialog === 'new' && <Dialog title="Новый документ" close={closeDialog}><div className="st-dialog-form"><label className="st-field"><span>Коллекция</span><select value={newCollection} onChange={event => setNewCollection(event.target.value as StudioCollection)}>{collections.map(collection => <option key={collection} value={collection}>{collectionLabels[collection]}</option>)}</select></label><label className="st-field"><span>Название</span><input value={newTitle} onChange={event => setNewTitle(event.target.value)}/></label><label className="st-field"><span>Адрес</span><input value={newPath} onChange={event => setNewPath(event.target.value)}/></label>{currentDoc?.collection === newCollection && <label className="st-check"><input type="checkbox" checked={duplicatePage} onChange={event => setDuplicatePage(event.target.checked)}/>Копировать текущий документ</label>}<p className="st-hint">Новая запись создаётся только как черновик.</p><button type="button" className="st-primary st-full" disabled={busy || !newTitle.trim()} onClick={() => void createDocument()}>{busy ? 'Создаём…' : 'Создать черновик'}</button></div></Dialog>}
    {dialog === 'versions' && <Dialog title="История версий" close={closeDialog}><p className="st-dialog-note">Восстановление создаёт черновик и не заменяет опубликованную страницу.</p><div className="st-version-list">{busy ? <p>Загрузка…</p> : versions.map(version => <div key={version.id}><span><strong>{new Date(version.createdAt).toLocaleString('ru-RU')}</strong><small>{version.status === 'published' ? 'Публикация' : 'Черновик'} · {version.title}</small></span><button type="button" className="st-secondary" onClick={() => void restore(version)}>Восстановить</button></div>)}</div></Dialog>}
    {dialog === 'settings' && <Dialog title="Настройки проекта" close={closeDialog}><div className="st-settings-links"><p>Визуальный редактор использует действующие права, медиатеку и историю Payload. Технические настройки открываются отдельно.</p><a href="/admin/globals/navigation" target="_blank" rel="noreferrer">Навигация и меню <span>↗</span></a><a href="/admin/globals/site-settings" target="_blank" rel="noreferrer">Глобальные контакты и футер <span>↗</span></a><a href="/admin/collections/leads" target="_blank" rel="noreferrer">Заявки с сайта <span>↗</span></a><a href="/admin/collections/users" target="_blank" rel="noreferrer">Команда и доступы <span>↗</span></a><a href="/admin?technical=1" target="_blank" rel="noreferrer">Техническая CMS <span>↗</span></a></div></Dialog>}
  </div>
}
