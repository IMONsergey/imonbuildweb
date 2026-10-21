'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function StudioLogin({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        cache: 'no-store',
      })
      if (!response.ok) {
        setError(response.status === 429 ? 'Слишком много попыток. Попробуйте позже.' : 'Неверный логин или пароль.')
        return
      }
      router.replace(next)
      router.refresh()
    } catch {
      setError('Не удалось установить соединение. Повторите попытку.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="imon-login">
    <div className="imon-login-top"><span className="imon-login-logo">I’MON<span>Studio</span></span><span>Управление сайтом</span></div>
    <div className="imon-login-body">
      <div className="imon-login-lead"><small>РАБОЧАЯ ОБЛАСТЬ I’MON</small><h1>Вход в Studio</h1><p>Страницы, тексты, фотографии, кейсы, анимации и публикации — в одной рабочей области.</p></div>
      <form className="imon-login-form" onSubmit={signIn}>
        <label htmlFor="imon-login-email">Рабочая почта</label>
        <input id="imon-login-email" autoFocus type="email" autoComplete="username" placeholder="name@imon.agency" required maxLength={256} value={email} onChange={event => setEmail(event.target.value)}/>
        <label htmlFor="imon-login-password">Пароль</label>
        <input id="imon-login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)}/>
        {error && <p className="imon-login-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Проверяем доступ…' : 'Войти в Studio'}<span aria-hidden="true">↗</span></button>
      </form>
    </div>
    <div className="imon-login-footer">© {new Date().getFullYear()} I’MON <span>Закрытая рабочая область</span></div>
  </main>
}
