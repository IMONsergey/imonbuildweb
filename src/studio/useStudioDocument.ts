'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type RecordData, type StudioCollection, type StudioDocument, writePath } from './model'

export async function studioFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch('/api/studio/' + path, { ...options, credentials: 'same-origin', cache: 'no-store', headers: { ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options?.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data.message || 'Не удалось выполнить запрос'), { status: response.status })
  return data as T
}
export function useStudioDocument(userID: number) {
  const [document, setDocument] = useState<StudioDocument | null>(null)
  const [data, setData] = useState<RecordData>({})
  const [dirty, setDirty] = useState(false)
  const [state, setState] = useState<'loading' | 'saved' | 'editing' | 'saving' | 'error' | 'conflict'>('loading')
  const [error, setError] = useState('')
  const [frameVersion, setFrameVersion] = useState(0)
  const [historyCounts, setHistoryCounts] = useState([0, 0])
  const latest = useRef<StudioDocument | null>(null), draft = useRef<RecordData>({})
  const past = useRef<RecordData[]>([]), future = useRef<RecordData[]>([])
  const revisionNumber = useRef(0), dirtyRef = useRef(false), loadSequence = useRef(0)
  const saving = useRef<Promise<boolean> | null>(null)
  const lastEdit = useRef({ path: '', time: 0 })
  const storageKey = useCallback((doc: StudioDocument) => `imon-studio:${userID}:${doc.collection}:${doc.id}`, [userID])

  const open = useCallback(async (collection: StudioCollection, id: number, discard = false): Promise<boolean> => {
    if (dirtyRef.current && !discard && !window.confirm('Есть несохранённые изменения. Перейти без них? Локальная резервная копия останется в этой вкладке.')) return false
    const sequence = ++loadSequence.current
    setState('loading'); setError('')
    try {
      const doc = await studioFetch<StudioDocument>(`document?collection=${collection}&id=${id}`)
      if (sequence !== loadSequence.current) return false
      let recovered: RecordData | undefined
      try {
        const backup = JSON.parse(sessionStorage.getItem(storageKey(doc)) || 'null')
        if (backup && backup.revision === doc.revision && window.confirm('Найден несохранённый черновик этой вкладки. Восстановить?')) recovered = backup.data
      } catch {}
      latest.current = doc; draft.current = recovered || doc.data; dirtyRef.current = !!recovered
      past.current = []; future.current = []; revisionNumber.current = 0
      setDocument(doc); setData(draft.current); setDirty(!!recovered); setHistoryCounts([0, 0]); setState(recovered ? 'editing' : 'saved'); setFrameVersion(version => version + 1)
      const url = new URL(location.href); url.searchParams.set('collection', collection); url.searchParams.set('id', String(id)); history.replaceState(null, '', url)
      return true
    } catch (cause) {
      if (sequence === loadSequence.current) { setState('error'); setError(cause instanceof Error ? cause.message : 'Документ недоступен') }
      return false
    }
  }, [storageKey])

  const commit = useCallback((next: RecordData, path = '') => {
    if (!latest.current || JSON.stringify(next) === JSON.stringify(draft.current)) return
    const now = Date.now()
    if (!path || lastEdit.current.path !== path || now - lastEdit.current.time > 800) past.current = [...past.current, draft.current].slice(-60)
    lastEdit.current = { path, time: now }; future.current = []
    draft.current = next; dirtyRef.current = true; revisionNumber.current++
    setData(next); setDirty(true); setState(current => current === 'conflict' ? current : 'editing'); setHistoryCounts([past.current.length, 0])
    try { sessionStorage.setItem(storageKey(latest.current), JSON.stringify({ revision: latest.current.revision, data: next })) } catch {}
  }, [storageKey])
  const setField = useCallback((path: string, value: unknown) => commit(writePath(draft.current, path, value), path), [commit])
  const undo = useCallback(() => {
    const previous = past.current.pop(); if (!previous) return
    future.current.push(draft.current); draft.current = previous; dirtyRef.current = true; revisionNumber.current++
    setData(previous); setDirty(true); setState('editing'); setHistoryCounts([past.current.length, future.current.length]); lastEdit.current = { path: '', time: 0 }
  }, [])
  const redo = useCallback(() => {
    const next = future.current.pop(); if (!next) return
    past.current.push(draft.current); draft.current = next; dirtyRef.current = true; revisionNumber.current++
    setData(next); setDirty(true); setState('editing'); setHistoryCounts([past.current.length, future.current.length]); lastEdit.current = { path: '', time: 0 }
  }, [])

  const save = useCallback(async (mode: 'draft' | 'publish' = 'draft'): Promise<boolean> => {
    if (saving.current) { const succeeded = await saving.current; if (!succeeded) return false }
    const current = latest.current
    if (!current || (mode === 'draft' && !dirtyRef.current)) return true
    const number = revisionNumber.current, sequence = loadSequence.current
    const snapshot = structuredClone(draft.current)
    setState('saving'); setError('')
    const operation = (async () => {
      try {
        const updated = await studioFetch<StudioDocument>('document', { method: 'PUT', body: JSON.stringify({ collection: current.collection, id: current.id, revision: current.revision, data: snapshot, mode }) })
        if (sequence !== loadSequence.current) return true
        latest.current = updated; setDocument(updated)
        if (revisionNumber.current === number) {
          draft.current = updated.data; dirtyRef.current = false; setData(updated.data); setDirty(false); setState('saved')
          try { sessionStorage.removeItem(storageKey(updated)) } catch {}
        } else {
          setState('editing')
          try { sessionStorage.setItem(storageKey(updated), JSON.stringify({ revision: updated.revision, data: draft.current })) } catch {}
        }
        setFrameVersion(version => version + 1)
        return true
      } catch (cause) {
        if (sequence === loadSequence.current) {
          setState((cause as { status?: number }).status === 409 ? 'conflict' : 'error')
          setError(cause instanceof Error ? cause.message : 'Ошибка сохранения')
        }
        return false
      }
    })()
    saving.current = operation
    try { return await operation } finally { if (saving.current === operation) saving.current = null }
  }, [storageKey])

  useEffect(() => {
    if (dirty && document) { try { sessionStorage.setItem(storageKey(document), JSON.stringify({ revision: document.revision, data })) } catch {} }
  }, [data, dirty, document, storageKey])
  useEffect(() => {
    if (!dirty || state !== 'editing') return
    const timer = setTimeout(() => { void save('draft') }, 1200)
    return () => clearTimeout(timer)
  }, [data, dirty, state, save])
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', prevent)
    return () => window.removeEventListener('beforeunload', prevent)
  }, [])
  return { document, data, dirty, state, error, historyCounts, frameVersion, open, commit, setField, undo, redo, save, setError, refresh: () => latest.current && open(latest.current.collection, latest.current.id, true) }
}
