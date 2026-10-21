'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function StudioAccount({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useEffect(() => {
    if (!open) return
    const click = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false) }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key) }
  }, [open])
  async function logout() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/users/logout', { method: 'POST', credentials: 'same-origin' })
      if (!response.ok) throw new Error('logout')
      router.replace('/studio/login')
      router.refresh()
    } catch {
      setError('Не удалось выйти. Повторите попытку.')
      setBusy(false)
    }
  }
  return <div className="st-account" ref={ref}>
    <button className="st-account-trigger" type="button" aria-expanded={open} aria-label="Аккаунт и выход" onClick={()=>setOpen(v=>!v)}><span className="st-avatar">{(name || 'I').slice(0,1).toUpperCase()}</span><span aria-hidden="true">⌄</span></button>
    {open && <div className="st-account-menu" role="group" aria-label="Аккаунт"><strong>{name}</strong><small>{role === 'admin' ? 'Администратор' : 'Редактор'}</small><button disabled={busy} type="button" onClick={()=>void logout()}>{busy ? 'Выходим…' : 'Выйти из Studio'}</button>{error && <p role="alert">{error}</p>}</div>}
  </div>
}
