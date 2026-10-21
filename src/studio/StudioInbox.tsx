'use client'
import { useEffect, useState } from 'react'
import { studioFetch } from './useStudioDocument'

type Lead = { id: number; createdAt: string; name: string; email: string; company: string; message: string; status: 'new' | 'processing' | 'done' }
type Response = { leads: Lead[]; total: number }
const statusLabel = { new: 'Новая', processing: 'В работе', done: 'Завершена' }

export function StudioInbox() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    studioFetch<Response>('leads').then(result => { if (!cancelled) { setLeads(result.leads); setTotal(result.total) } })
      .catch(cause => { if (!cancelled) setError(cause.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])
  async function changeStatus(id: number, status: Lead['status']) {
    setBusyId(id); setError('')
    try {
      await studioFetch('leads', { method: 'PUT', body: JSON.stringify({ id, status }) })
      setLeads(current => current.map(item => item.id === id ? { ...item, status } : item))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось обновить заявку') }
    finally { setBusyId(null) }
  }
  const filtered = leads.filter(item => statusFilter === 'all' || item.status === statusFilter)
  return <div className="st-inbox">
    <div className="st-view-header"><div><small>ОБРАЩЕНИЯ С САЙТА</small><h1>Заявки</h1><p>{total} обращений в базе. Здесь можно прочитать сообщение и отметить его статус.</p></div></div>
    <div className="st-inbox-filters"><label>Показать <select aria-label="Фильтр по заявкам" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="all">Все заявки</option>{Object.entries(statusLabel).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><span>Последние 100 записей</span></div>
    {error && <p className="st-pref-error" role="alert">{error}</p>}
    {loading ? <p className="st-empty">Загружаем заявки…</p> : filtered.length ? <div className="st-inbox-list">{filtered.map(lead=><article className="st-inbox-card" key={lead.id}><header><div><h2>{lead.name}{lead.company ? ' · ' + lead.company : ''}</h2><a href={'mailto:'+lead.email}>{lead.email}</a></div><time dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleString('ru-RU')}</time></header><p>{lead.message}</p><footer><label>Статус <select aria-label={'Статус заявки ' + lead.id} value={lead.status} disabled={busyId===lead.id} onChange={event=>void changeStatus(lead.id,event.target.value as Lead['status'])}>{Object.entries(statusLabel).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></footer></article>)}</div> : <p className="st-empty">Нет заявок с выбранным статусом.</p>}
  </div>
}
