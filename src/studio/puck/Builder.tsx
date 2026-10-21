'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Puck } from '@puckeditor/core'
import { type StudioDocument, type DocumentSummary, type StudioCollection } from '../model'
import { studioFetch } from '../useStudioDocument'
import { makePuckConfig } from './config'
import { comparePuckData, documentToPuck, puckToDocument, type PuckData } from './adapter'
import type { PreviewAsset } from './Preview'

type Status = 'saved' | 'editing' | 'saving' | 'published' | 'conflict' | 'error'

export function PuckBuilder({ initial, directory, initialAssets }: {
  initial: StudioDocument
  directory: DocumentSummary[]
  initialAssets: PreviewAsset[]
}) {
  const router=useRouter()
  const [assets, setAssets] = useState(initialAssets)
  const [status, setStatus] = useState<Status>('saved')
  const [error, setError] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [showDocuments, setShowDocuments] = useState(false)
  const [exactPreview, setExactPreview] = useState(false)
  const [exactLoading, setExactLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createCollection, setCreateCollection] = useState<StudioCollection>('pages')
  const [createTitle, setCreateTitle] = useState('Новая страница')
  const [createPath, setCreatePath] = useState('/new-page')
  const [createBusy, setCreateBusy] = useState(false)
  const initialPuck = useMemo(() => documentToPuck(initial), [initial])
  const currentData = useRef<PuckData>(initialPuck)
  const lastSaved = useRef<PuckData>(initialPuck)
  const documentRef = useRef(initial.data)
  const revisionRef = useRef(initial.revision)
  const pending = useRef<Promise<boolean>>(Promise.resolve(true))
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = useRef(true)
  const dirtyRef = useRef(false)
  const config = useMemo(() => makePuckConfig(initial, assets, asset =>
    setAssets(previous => previous.some(a=>a.id===asset.id) ? previous : [asset, ...previous])),
    [initial, assets])
  useEffect(()=>()=>{ active.current=false;if(timer.current)clearTimeout(timer.current) },[])
  const path = initial.path
  const route = (record:DocumentSummary)=>'/studio/builder?collection='+record.collection+'&id='+record.id
  const sendSave = useCallback((data:PuckData, mode:'draft'|'publish'):Promise<boolean> => {
    const snapshot = structuredClone(data)
    const work = pending.current.catch(()=>false).then(async()=>{
      if (!active.current) return false
      if (mode === 'draft' && comparePuckData(snapshot,lastSaved.current)) return true
      setStatus('saving');setError('')
      try {
        const update = puckToDocument(snapshot, documentRef.current, initial.collection)
        const updated = await studioFetch<StudioDocument>('document', {
          method: 'PUT',
          body: JSON.stringify({ collection:initial.collection,id:initial.id,revision:revisionRef.current,data:update,mode }),
        })
        revisionRef.current=updated.revision
        documentRef.current=updated.data
        lastSaved.current=documentToPuck(updated)
        if (mode === 'publish') {
          setPublishDate(new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}))
          setStatus('published')
        } else {
          const nowDirty=!comparePuckData(currentData.current,snapshot)
          dirtyRef.current=nowDirty
          setStatus(nowDirty?'editing':'saved')
        }
        return true
      }catch(cause){
        const status=(cause as {status?:number}).status===409?'conflict':'error'
        setStatus(status)
        setError(cause instanceof Error?cause.message:'Не удалось записать изменения')
        return false
      }
    })
    pending.current=work
    return work
  },[initial.collection,initial.id])
  const onChanged = useCallback((data:PuckData)=>{
    const previous=currentData.current
    currentData.current=data
    if(comparePuckData(data,previous))return
    dirtyRef.current=!comparePuckData(data,lastSaved.current)
    setStatus(dirtyRef.current?'editing':'saved')
    if (timer.current)clearTimeout(timer.current)
    if (!dirtyRef.current) return
    timer.current=setTimeout(()=>{
      timer.current=null
      void sendSave(currentData.current,'draft')
    },1000)
  },[sendSave])
  const onPublish=useCallback(async(data:PuckData)=>{
    if(timer.current){clearTimeout(timer.current);timer.current=null}
    currentData.current=data
    const succeeded=await sendSave(data,'publish')
    if(!succeeded)throw new Error('Не удалось опубликовать документ. Изменения остаются в редакторе.')
  },[sendSave])
  const toggleExactPreview = useCallback(async () => {
    if (exactLoading) return
    if (exactPreview) { setExactPreview(false); return }
    if (timer.current) { clearTimeout(timer.current);timer.current=null }
    setExactLoading(true)
    try {
      const ok=await sendSave(currentData.current,'draft')
      if (ok) setExactPreview(true)
    } finally { setExactLoading(false) }
  }, [exactLoading, exactPreview, sendSave])
  const createDocument = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (createBusy) return
    if (dirtyRef.current && !window.confirm('Есть несохранённые изменения текущей страницы. Перейти к созданию нового документа?')) return
    setCreateBusy(true);setError('')
    try {
      const path=createPath.trim()
      const slug=path.split('/').filter(Boolean).at(-1)||''
      const data: Record<string,unknown> = { title:createTitle.trim() }
      if (createCollection === 'pages') Object.assign(data,{path,kind:'standard',blocks:[]})
      else if (createCollection === 'projects') Object.assign(data,{slug,sourcePath:path,sections:[],order:0})
      else Object.assign(data,{slug,sections:[]})
      const result=await studioFetch<StudioDocument>('document',{method:'POST',body:JSON.stringify({collection:createCollection,data})})
      router.push('/studio/builder?collection='+result.collection+'&id='+result.id)
    }catch(cause){setError(cause instanceof Error?cause.message:'Не удалось создать документ');setCreateBusy(false)}
  },[createBusy,createCollection,createTitle,createPath,router])
  useEffect(()=>{
    if (!showCreate) return
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!createBusy)setShowCreate(false)}
    window.addEventListener('keydown',close)
    return ()=>window.removeEventListener('keydown',close)
  },[showCreate,createBusy])
  useEffect(()=>{
    const leave=(event:BeforeUnloadEvent)=>{if(dirtyRef.current){event.preventDefault();event.returnValue=''}}
    window.addEventListener('beforeunload',leave)
    return ()=>window.removeEventListener('beforeunload',leave)
  },[])
  return <div className="imon-puck-builder">
    <div className="imon-puck-toolbar">
      <Link className="imon-puck-logo" href="/studio">I’MON <span>Builder</span></Link>
      <button className="imon-puck-document" type="button" onClick={()=>setShowDocuments(value=>!value)} aria-expanded={showDocuments} aria-controls="imon-puck-documents">
        {String(initial.data.title || 'Страница')} <span>⌄</span>
      </button>
      <button className="imon-puck-new" type="button" onClick={()=>{setCreateTitle('Новая страница');setCreatePath('/new-page');setCreateCollection('pages');setShowCreate(true)}}>+ Страница</button>
      <span className="imon-puck-url">{path}</span>
      <div className="imon-puck-actions">
        <button type="button" className={'imon-puck-exact-toggle'+(exactPreview?' active':'')} aria-pressed={exactPreview} disabled={exactLoading || status==='saving'} onClick={()=>void toggleExactPreview()}>{exactLoading?'Сохраняем…':exactPreview?'Вернуться к блокам':'Точный вид сайта'}</button>
        <Link href={'/studio?collection='+initial.collection+'&id='+initial.id}>Редактор макета</Link>
        <a href={'/studio/canvas?collection='+initial.collection+'&id='+initial.id} target="_blank" rel="noreferrer">Точная страница ↗</a>
        <span className={'imon-puck-state imon-puck-state-'+status} role="status">
          {status==='saving'?'Сохранение…':status==='saved'?'Черновик сохранён':status==='editing'?'Есть изменения':status==='published'?'Опубликовано · '+publishDate:status==='conflict'?'Изменён в другой вкладке':'Ошибка записи'}
        </span>
      </div>
    </div>
    {showDocuments && <div className="imon-puck-documents" id="imon-puck-documents">
      <div className="imon-puck-document-search"><input aria-label="Найти страницу" placeholder="Поиск страниц, кейсов и журнала" value={search} onChange={event=>setSearch(event.target.value)}/><button type="button" onClick={()=>setShowDocuments(false)} aria-label="Закрыть список">×</button></div>
      {directory.filter(item=>(item.title+' '+item.path).toLowerCase().includes(search.toLowerCase())).map(item=>
        <Link key={item.collection+item.id} href={route(item)}><span>{item.title}<small>{item.path}</small></span><span>{item.status==='published'?'●':'○'}</span></Link>)}
    </div>}
    {showCreate && <div className="imon-puck-create-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget&&!createBusy)setShowCreate(false)}}>
      <form className="imon-puck-create" role="dialog" aria-modal="true" aria-label="Новый документ" onSubmit={event=>void createDocument(event)}>
        <header><h2>Новый документ</h2><button type="button" aria-label="Закрыть" onClick={()=>setShowCreate(false)} disabled={createBusy}>×</button></header>
        <label>Что создаём<select aria-label="Тип документа" value={createCollection} onChange={event=>{const next=event.target.value as StudioCollection;setCreateCollection(next);setCreatePath(next==='pages'?'/new-page':next==='projects'?'/work/new-project':'/news/new-article')}}>
          <option value="pages">Страницу</option><option value="projects">Кейс</option><option value="articles">Публикацию</option>
        </select></label>
        <label>Название<input required aria-label="Название нового документа" maxLength={180} value={createTitle} onChange={event=>setCreateTitle(event.target.value)}/></label>
        <label>Адрес на сайте<input required aria-label="Адрес нового документа" placeholder={createCollection==='projects'?'/work/project':'/new-page'} maxLength={230} value={createPath} onChange={event=>setCreatePath(event.target.value)}/></label>
        <p>Создастся только черновик. Увидеть его посетители смогут после отдельной публикации.</p>
        <footer><button type="button" onClick={()=>setShowCreate(false)} disabled={createBusy}>Отмена</button><button type="submit" disabled={createBusy||!createTitle.trim()}>{createBusy?'Создаём…':'Создать черновик'}</button></footer>
      </form>
    </div>}
    {error && <div className="imon-puck-alert" role="alert"><strong>{error}</strong><span>Черновик остался в редакторе. Не закрывайте вкладку до устранения ошибки.</span><button type="button" onClick={()=>void sendSave(currentData.current,'draft')}>Повторить сохранение</button></div>}
    <div className="imon-puck-editor">
      <Puck
        key={initial.collection+':'+initial.id}
        config={config}
        data={initialPuck}
        dictionary={{
          'header-publish':'Опубликовать', 'header-undo':'Отменить','header-redo':'Повторить',
          'header-toggle-leftsidebar':'Показать левую панель','header-toggle-rightsidebar':'Показать свойства',
          'action-selectparent':'Выбрать родительский элемент','action-duplicate':'Дублировать','action-delete':'Удалить',
          'label-page':'Страница','label-component':'Компонент',
          'outline-header-title':'Слои','outline-empty':'Нет элементов',
          'outline-item-collapse':'Свернуть','outline-item-expand':'Развернуть',
          'outline-header-collapseall':'Свернуть все','outline-item-duplicate':'Дублировать','outline-item-delete':'Удалить',
          'drawer-category-collapse':'Свернуть {title}','drawer-category-expand':'Развернуть {title}',
          'drawer-category-other':'Другие','field-arrayitem-summary':'Элемент {index}',
          'field-arrayitem-duplicate':'Дублировать','field-arrayitem-delete':'Удалить',
          'plugin-blocks':'Блоки','plugin-outline':'Слои','plugin-fields':'Свойства','plugin-components':'Компоненты',
          'viewport-switch':'Переключить на {label}','viewport-zoom-in':'Увеличить масштаб',
          'viewport-zoom-out':'Уменьшить масштаб','viewport-zoom-auto':'{zoom}% (авто)',
          'loader-loading':'Загрузка…',
        }}
        onChange={onChanged}
        onPublish={onPublish}
        overrides={{
          headerActions: () => <button type="button" className="imon-puck-publish" disabled={status === 'saving'} onClick={() => {
            if (!window.confirm('Опубликовать страницу «' + String(documentRef.current.title || '') + '» на сайте?')) return
            void onPublish(currentData.current).catch(() => {})
          }}>Опубликовать</button>,
        }}
        headerTitle={String(initial.data.title || '')}
        headerPath={path}
        height="calc(100dvh - 60px)"
        viewports={[
          {width:1440,height:'auto',label:'Desktop · 1440'},
          {width:768,height:'auto',label:'Tablet · 768'},
          {width:390,height:'auto',label:'Phone · 390'},
        ]}
      />
      {exactPreview && <div className="imon-puck-exact-view" role="region" aria-label="Точная версия сайта">
        <header><span>Настоящий сайт · {path} · черновик</span><button type="button" onClick={()=>setExactPreview(false)}>Вернуться к редактированию ×</button></header>
        <iframe title="Точный предпросмотр страницы" src={'/studio/canvas?collection='+initial.collection+'&id='+initial.id+'&mode=preview'} sandbox="allow-scripts allow-same-origin allow-forms"/>
      </div>}
    </div>
    <div className="imon-puck-preview-notice">Конструктор редактирует настоящие блоки CMS. Для точной проверки сетки и GSAP используйте «Точная страница» — это тот же рендерер, что на сайте.</div>
  </div>
}
