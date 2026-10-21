'use client'
import { useEffect, useState } from 'react'
import { studioFetch } from './useStudioDocument'

type LinkItem = { id?: string; label: string; href: string; external?: boolean }
type SocialItem = { id?: string; label: string; url: string }
type Navigation = { links: LinkItem[]; ctaText: string; ctaHref: string }
type Settings = { brand: string; description: string; email: string; telegram: string; footerMessage: string; socials: SocialItem[] }
type Snapshot<T> = { data: T; revision: string }
type Response = { navigation: Snapshot<Navigation>; settings: Snapshot<Settings>; canEdit: boolean }
type Tab = 'navigation' | 'settings'

const emptySettings: Settings = { brand: 'I’MON', description: '', email: '', telegram: '', footerMessage: '', socials: [] }

export function StudioSettings() {
  const [tab, setTab] = useState<Tab>('navigation')
  const [navigation, setNavigation] = useState<Navigation>({ links: [], ctaText: '', ctaHref: '' })
  const [settings, setSettings] = useState<Settings>(emptySettings)
  const [revisions, setRevisions] = useState({ navigation: '', settings: '' })
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    studioFetch<Response>('preferences').then(result => {
      if (cancelled) return
      setNavigation({
        links: result.navigation.data.links || [],
        ctaText: result.navigation.data.ctaText || '',
        ctaHref: result.navigation.data.ctaHref || '',
      })
      setSettings({ ...emptySettings, ...result.settings.data, socials: result.settings.data.socials || [] })
      setRevisions({ navigation: result.navigation.revision, settings: result.settings.revision })
      setCanEdit(result.canEdit)
    }).catch(cause => { if (!cancelled) setError(cause.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const updateLink = (index: number, next: Partial<LinkItem>) => setNavigation(current => ({
    ...current, links: current.links.map((link, i) => i === index ? { ...link, ...next } : link),
  }))
  const move = (index: number, difference: number) => setNavigation(current => {
    const position = index + difference
    if (position < 0 || position >= current.links.length) return current
    const links = [...current.links]
    ;[links[index], links[position]] = [links[position], links[index]]
    return { ...current, links }
  })
  async function save() {
    if (!canEdit || saving) return
    if (!window.confirm('Изменения в меню и глобальных настройках станут видны посетителям сразу после сохранения. Продолжить?')) return
    setSaving(true); setError(''); setSuccess('')
    const slug = tab === 'navigation' ? 'navigation' : 'site-settings'
    const data = tab === 'navigation' ? navigation : settings
    try {
      const result = await studioFetch<{ data: Navigation | Settings; revision: string }>('preferences', {
        method: 'PUT',
        body: JSON.stringify({ slug, revision: revisions[tab], data }),
      })
      setRevisions(current => ({ ...current, [tab]: result.revision }))
      setSuccess('Настройки сохранены и доступны на сайте.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось сохранить настройки.')
    } finally { setSaving(false) }
  }
  const setSetting = (key: keyof Settings, value: string) => setSettings(current => ({ ...current, [key]: value }))
  return <div className="st-preferences">
    <header className="st-view-header"><div><small>ЕДИНЫЕ НАСТРОЙКИ САЙТА</small><h1>Настройки I’MON</h1><p>Меню, контакты, ссылки и футер — без технической CMS.</p></div></header>
    {loading ? <p className="st-empty">Загружаем настройки…</p> : <>
      <div className="st-pref-tabs" role="tablist" aria-label="Разделы настроек">
        <button type="button" role="tab" aria-selected={tab === 'navigation'} className={tab === 'navigation' ? 'active' : ''} onClick={() => { setTab('navigation'); setSuccess(''); setError('') }}>Навигация</button>
        <button type="button" role="tab" aria-selected={tab === 'settings'} className={tab === 'settings' ? 'active' : ''} onClick={() => { setTab('settings'); setSuccess(''); setError('') }}>Контакты и футер</button>
      </div>
      {tab === 'navigation' ? <div className="st-pref-panel" role="tabpanel">
        <div className="st-pref-section-heading"><h2>Пункты основного меню</h2><p>Порядок строк соответствует порядку на сайте.</p></div>
        <div className="st-pref-links">
          {navigation.links.map((link, index) => <div className="st-pref-link" key={link.id || index}>
            <span className="st-pref-index">{String(index + 1).padStart(2, '0')}</span>
            <label>Название<input disabled={!canEdit} value={link.label} maxLength={80} onChange={event => updateLink(index, {label:event.target.value})}/></label>
            <label>Адрес<input disabled={!canEdit} value={link.href} maxLength={400} onChange={event => updateLink(index, {href:event.target.value})}/></label>
            <label className="st-pref-check"><input disabled={!canEdit} type="checkbox" checked={link.external === true} onChange={event=>updateLink(index,{external:event.target.checked})}/>Внешняя ссылка</label>
            <div className="st-pref-reorder"><button disabled={!canEdit || index===0} title="Выше" onClick={()=>move(index,-1)}>↑</button><button disabled={!canEdit || index===navigation.links.length-1} title="Ниже" onClick={()=>move(index,1)}>↓</button><button disabled={!canEdit} title="Удалить ссылку" onClick={()=>setNavigation(current=>({...current,links:current.links.filter((_,i)=>i!==index)}))}>×</button></div>
          </div>)}
        </div>
        {canEdit && <button type="button" className="st-secondary" onClick={()=>setNavigation(current=>({...current,links:[...current.links,{label:'Новый пункт',href:'/'}]}))}>+ Добавить ссылку</button>}
        <div className="st-pref-section-heading"><h2>Кнопка в шапке</h2><p>Основное действие для посетителя.</p></div>
        <div className="st-pref-grid"><label>Надпись<input disabled={!canEdit} maxLength={100} value={navigation.ctaText} onChange={event=>setNavigation(v=>({...v,ctaText:event.target.value}))}/></label><label>Адрес<input disabled={!canEdit} maxLength={400} value={navigation.ctaHref} onChange={event=>setNavigation(v=>({...v,ctaHref:event.target.value}))}/></label></div>
      </div> : <div className="st-pref-panel" role="tabpanel">
        <div className="st-pref-section-heading"><h2>Контакты</h2><p>Единые реквизиты во всех разделах сайта.</p></div>
        <div className="st-pref-grid">
          <label>Название бренда<input disabled={!canEdit} value={settings.brand} maxLength={100} onChange={event=>setSetting('brand',event.target.value)}/></label>
          <label>Рабочая почта<input type="email" disabled={!canEdit} value={settings.email} onChange={event=>setSetting('email',event.target.value)}/></label>
          <label>Telegram<input disabled={!canEdit} value={settings.telegram} onChange={event=>setSetting('telegram',event.target.value)}/></label>
          <label className="st-pref-wide">Описание бренда<textarea disabled={!canEdit} value={settings.description} onChange={event=>setSetting('description',event.target.value)}/></label>
        </div>
        <div className="st-pref-section-heading"><h2>Футер</h2></div>
        <label className="st-pref-textarea">Крупный призыв к действию<textarea disabled={!canEdit} value={settings.footerMessage} onChange={event=>setSetting('footerMessage',event.target.value)}/></label>
        <div className="st-pref-section-heading"><h2>Социальные сети</h2></div>
        {settings.socials.map((social,index)=><div className="st-pref-social" key={social.id||index}>
          <label>Название<input disabled={!canEdit} value={social.label} onChange={event=>setSettings(v=>({...v,socials:v.socials.map((row,i)=>i===index?{...row,label:event.target.value}:row)}))}/></label>
          <label>Ссылка<input disabled={!canEdit} value={social.url} onChange={event=>setSettings(v=>({...v,socials:v.socials.map((row,i)=>i===index?{...row,url:event.target.value}:row)}))}/></label>
          <button type="button" disabled={!canEdit} aria-label="Удалить социальную сеть" onClick={()=>setSettings(v=>({...v,socials:v.socials.filter((_,i)=>i!==index)}))}>×</button>
        </div>)}
        {canEdit && <button type="button" className="st-secondary" onClick={()=>setSettings(v=>({...v,socials:[...v.socials,{label:'Новая сеть',url:'https://'}]}))}>+ Добавить социальную сеть</button>}
      </div>}
      <div className="st-pref-footer"><p>Настройки сохраняются сразу для всех опубликованных страниц. Для изменений дизайна используйте холст.</p>
        {success && <span role="status" className="st-pref-success">{success}</span>}
        {error && <span role="alert" className="st-pref-error">{error}</span>}
        {canEdit ? <button type="button" className="st-primary" disabled={saving} onClick={()=>void save()}>{saving?'Сохранение…':'Сохранить изменения'}</button> : <span>Редактор: просмотр без права публикации настроек.</span>}
      </div>
    </>}
  </div>
}
