'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useId } from 'react'
import { fieldProps } from '@/studio/model'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function SiteMotion() {
  const pathname = usePathname()
  const [canvasPreview, setCanvasPreview] = useState(false)
  useEffect(() => {
    const mode = (event: Event) => setCanvasPreview((event as CustomEvent<{preview:boolean}>).detail.preview)
    window.addEventListener('imon:canvas-mode', mode)
    return () => window.removeEventListener('imon:canvas-mode', mode)
  }, [])
  useEffect(() => {
    if (reduced() || pathname.startsWith('/studio/canvas') && !canvasPreview) return
    gsap.registerPlugin(ScrollTrigger)
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 700)
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('[data-tone-title]').forEach(title => {
        gsap.fromTo(title,
          { color: 'rgb(172, 172, 174)' },
          { color: 'rgb(30, 30, 33)', ease: 'none', scrollTrigger: {
            trigger: title, start: 'top 95%', end: 'top 35%', scrub: .65,
          }},
        )
      })
      document.querySelectorAll<HTMLElement>('[data-animate="reveal"]').forEach((el) => {
        if (el.closest('.hero-video')) return
        gsap.fromTo(el,
          { y: 32, opacity: .15, filter: 'blur(3px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: .95,
            ease: 'power3.out', clearProps: 'filter,transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 95%', once: true }},
        )
      })
      document.querySelectorAll<HTMLElement>('[data-parallax-media]').forEach(el => {
        const image = el.querySelector('img,video') as HTMLElement | null
        if (!image) return
        gsap.fromTo(image,{ yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .7 },
        })
      })
      document.querySelectorAll<HTMLElement>('.hero-title-line').forEach((el,i) => {
        gsap.fromTo(el, { y: 42, opacity: 0, filter: 'blur(8px)' }, {
          y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2,
          delay: .12+i*.11, ease: 'power3.out', clearProps: 'all',
        })
      })
      document.querySelectorAll<HTMLElement>('[data-photo-in]').forEach(el=>{
        const image=el.querySelector('img')
        if (!image)return
        gsap.fromTo(image,{scale:1.095},{scale:1,duration:1.35,ease:'power3.out',clearProps:'transform',
          scrollTrigger:{trigger:el,start:'top 92%',once:true}})
      })
    })
    let resizeTimer = 0
    const onLoad = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120) }
    const resize = new ResizeObserver(onLoad)
    const main = document.getElementById('main-content'); if (main) resize.observe(main)
    document.addEventListener('load', onLoad, true)
    void document.fonts.ready.then(onLoad)
    window.addEventListener('load',onLoad,{once:true})
    return () => { window.clearTimeout(timer);window.clearTimeout(resizeTimer);resize.disconnect();document.removeEventListener('load',onLoad,true); window.removeEventListener('load',onLoad); ctx.revert() }
  },[pathname,canvasPreview])
  return null
}

export type ServiceEntry = { number: string; title: string; description: string; details: string; imagePath: string }

export function ServiceAccordion({ items, fieldBase = '' }: { items: ServiceEntry[]; fieldBase?: string }) {
  const id = useId()
  const [active,setActive] = useState<number|null>(0)
  return <div className="imon-services-accordion">
    {items.map((item,i)=><div className={'imon-service-item '+(active===i?'is-open':'')} key={item.number||i}>
      <button type="button" className="imon-service-trigger" aria-expanded={active===i}
        aria-controls={id+'-service-panel-'+i} onClick={()=>setActive(active===i?null:i)}>
        <span className="imon-service-number">{item.number||String(i+1).padStart(2,'0')}</span>
        <span className="imon-service-label" {...fieldProps(`${fieldBase}.${i}.title`)}>{item.title}</span>
        <span className="imon-service-control" aria-hidden="true">{active===i?'−':'+'}</span>
      </button>
      <div id={id+'-service-panel-'+i} className="imon-service-panel" inert={active!==i}>
        <div className="imon-service-panel-inner">
          <div className="imon-service-media">{item.imagePath && <img src={item.imagePath} alt={'Визуальное направление: '+item.title} loading="lazy"/>}</div>
          <div className="imon-service-info"><p {...fieldProps(`${fieldBase}.${i}.description`)}>{item.description}</p><ul>
            {item.details.split('•').map(x=>x.trim()).filter(Boolean).map((entry,n)=><li key={n}>{entry}</li>)}
          </ul></div>
        </div>
      </div>
    </div>)}
  </div>
}

export type FaqEntry = { question: string; answer: string }
export function HomeFaq({ items, fieldBase = '' }: { items: FaqEntry[]; fieldBase?: string }) {
  const id = useId()
  const [active,setActive]=useState<number|null>(null)
  return <div className="imon-faq-list">
    {items.map((faq,i)=><div className={'imon-faq-item '+(active===i?'is-open':'')} key={faq.question}>
      <button type="button" className="imon-faq-trigger" onClick={()=>setActive(active===i?null:i)} aria-expanded={active===i} aria-controls={id+'-faq-panel-'+i}>
        <span>{String(i+1).padStart(2,'0')}</span><strong {...fieldProps(`${fieldBase}.${i}.question`)}>{faq.question}</strong><i aria-hidden="true">{active===i?'−':'+'}</i>
      </button>
      <div className="imon-faq-panel" id={id+'-faq-panel-'+i} inert={active!==i}><div className="imon-faq-panel-inner" {...fieldProps(`${fieldBase}.${i}.answer`)}>{faq.answer}</div></div>
    </div>)}
  </div>
}
