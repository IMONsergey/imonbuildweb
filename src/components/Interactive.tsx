'use client'
import { ArrowIcon } from './ArrowIcon'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type NavigationLink = { label: string; href: string }

function Clock({ zone, prefix }: { zone: string; prefix: string }) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit', minute: '2-digit', timeZone: zone, hour12: false,
    }).format(new Date()))
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [zone])
  return <span>{prefix} · {time || '—:—'}</span>
}

export function SiteHeader({ overlay = false, links, ctaText = 'Связаться', ctaHref = '/contact' }: {
  overlay?: boolean
  links: NavigationLink[]
  ctaText?: string
  ctaHref?: string
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > window.innerHeight - 90)
    update();window.addEventListener('scroll',update,{passive:true})
    return () => window.removeEventListener('scroll',update)
  }, [])
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const menu = document.getElementById('mobile-navigation')
    const background = [document.getElementById('main-content'), document.querySelector<HTMLElement>('.site-footer')].filter((el): el is HTMLElement => !!el)
    const previousInert = background.map(el => el.inert)
    background.forEach(el => { el.inert = true })
    const focusTimer = window.setTimeout(() => menu?.querySelector<HTMLElement>('a')?.focus(), 0)
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault();setOpen(false); btn.current?.focus() }
      if (event.key === 'Tab') {
        const links = Array.from(menu?.querySelectorAll<HTMLElement>('a,button') || [])
        const first = btn.current, last = links.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault();last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault();first?.focus() }
      }
    }
    document.addEventListener('keydown', escape)
    document.body.classList.add('nav-open')
    return () => { window.clearTimeout(focusTimer);background.forEach((el,index) => { el.inert = previousInert[index] });document.removeEventListener('keydown', escape); document.body.classList.remove('nav-open') }
  }, [open])
  return <>
    <header className={['site-header', overlay ? 'site-header--overlay' : '', scrolled ? 'site-header--scrolled' : '', open ? 'site-header--open' : ''].filter(Boolean).join(' ')}>
      <Link href="/" className="wordmark" aria-label="I’MON — главная" onClick={() => setOpen(false)}>I’MON</Link>
      <div className="header-clocks"><Clock zone="Europe/Moscow" prefix="МСК" /><Clock zone="Asia/Dubai" prefix="ДУБАЙ" /></div>
      <nav className="desktop-nav" aria-label="Основная навигация">
        {links.map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <Link className="header-contact" href={ctaHref}>{ctaText}</Link>
      <button type="button" className="mobile-menu-toggle" ref={btn} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
        <span /><span />
      </button>
    </header>
    <div id="mobile-navigation" className={'mobile-nav ' + (open ? 'mobile-nav--open' : '')} inert={!open}>
      <nav aria-label="Мобильная навигация">
        {links.map((link, i) => <Link href={link.href} onClick={() => setOpen(false)} key={link.href}><small>0{i + 1}</small>{link.label}<span><ArrowIcon/></span></Link>)}
        <Link href={ctaHref} onClick={() => setOpen(false)}><small>04</small>{ctaText}<span><ArrowIcon/></span></Link>
      </nav>
      <div className="mobile-nav__bottom"><Clock zone="Europe/Moscow" prefix="МСК" /><Clock zone="Asia/Dubai" prefix="ДУБАЙ" /></div>
    </div>
  </>
}

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { el.classList.add('is-visible'); observer.disconnect() }
    }, { threshold: 0.075, rootMargin: '0px 0px 25px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={'reveal is-visible ' + className}>{children}</div>
}

export type CardItem = { title: string; description: string; cover: string; href: string; category: string; year?: string }

export function FilteredGrid({ items, mode = 'work', showFilters = true }: { items: CardItem[]; mode?: 'work' | 'journal'; showFilters?: boolean }) {
  const [active, setActive] = useState('Все')
  const categories = mode === 'work'
    ? ['Все', 'Брендинг', 'Digital', 'Стратегия', 'Интерфейсы']
    : ['Все', ...Array.from(new Set(items.map(x => x.category).filter(Boolean)))]
  const filtered = active === 'Все' ? items : items.filter(item => mode === 'journal'
    ? item.category === active
    : active === 'Брендинг' ? /brand/i.test(item.category)
    : active === 'Digital' ? /web|digital|develop/i.test(item.category)
    : active === 'Стратегия' ? /strategy|стратег/i.test(item.category)
    : /product|art|ux|ui/i.test(item.category))
  return <section className={'filtered-section filtered-section--' + mode}>
    {showFilters && categories.length > 2 && <div className="filter-bar" aria-label="Фильтр материалов">
      {categories.map(category => <button key={category} type="button" aria-pressed={active === category} className={active === category ? 'is-active' : ''} onClick={() => setActive(category)}>{category}</button>)}
      <span className="filter-count">{String(filtered.length).padStart(2, '0')}</span>
    </div>}
    <div className="card-grid">
      {filtered.map((item, i) => <Link href={item.href} className="project-card" key={item.href}>
        <div className="card-meta"><span>{item.title}</span><span className="card-subtitle">{item.description || item.category}</span></div>
        <div className="card-media">{item.cover && <img src={item.cover} loading={i > 1 ? 'lazy' : 'eager'} alt={item.title} />}<span className="card-arrow"><ArrowIcon/></span></div>
        {mode === 'journal' && <div className="card-category">{item.category}</div>}
      </Link>)}
    </div>
    {!filtered.length && <p className="empty-state">Пока нет материалов в этой категории.</p>}
  </section>
}

type FormData = { name: string; email: string; company: string; message: string; consent: boolean; website: string }
const initial: FormData = { name: '', email: '', company: '', message: '', consent: false, website: '' }

export function LeadForm() {
  const [data, setData] = useState<FormData>(initial)
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    setState('sending'); setError('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, source: window.location.pathname }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Не удалось отправить заявку.')
      setData(initial);setState('success')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ошибка соединения. Попробуйте позже.')
      setState('error')
    }
  }
  return <form className="lead-form" onSubmit={submit}>
    <div className="form-grid">
      <label>Как к вам обращаться *<input type="text" required maxLength={120} autoComplete="name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Имя" /></label>
      <label>Почта для связи *<input type="email" required maxLength={254} autoComplete="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} placeholder="name@company.com" /></label>
      <label>Компания<input type="text" maxLength={180} autoComplete="organization" value={data.company} onChange={e => setData({ ...data, company: e.target.value })} placeholder="Название компании" /></label>
      <label className="form-spacer"> </label>
      <label className="form-wide">Коротко о задаче *<textarea required minLength={10} maxLength={4000} rows={4} value={data.message} onChange={e => setData({ ...data, message: e.target.value })} placeholder="Что планируете, какой результат нужен?" /></label>
    </div>
    <label className="honeypot" aria-hidden="true">Ваш сайт<input tabIndex={-1} name="website" autoComplete="off" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} /></label>
    <label className="consent-line"><input type="checkbox" required checked={data.consent} onChange={e => setData({ ...data, consent: e.target.checked })} /><span>Согласен на обработку персональных данных для ответа на обращение. <Link href="/privacy-policy">Подробнее</Link>.</span></label>
    <div className="form-actions"><button className="form-submit" disabled={state === 'sending'} type="submit">{state === 'sending' ? 'Отправляем…' : 'Отправить заявку'}<span><ArrowIcon/></span></button><span aria-live="polite" role={state === 'error' ? 'alert' : 'status'}>{state === 'success' ? 'Заявка получена. Свяжемся с вами.' : state === 'error' ? error : ''}</span></div>
  </form>
}
