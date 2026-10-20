'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function SiteMotion() {
  const pathname = usePathname()
  useEffect(() => {
    if (reduced()) return
    gsap.registerPlugin(ScrollTrigger)
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 700)
    const ctx = gsap.context(() => {
      const triggers: gsap.core.Tween[] = []
      document.querySelectorAll<HTMLElement>('[data-tone-title]').forEach(title => {
        const animation = gsap.fromTo(title,
          { color: 'rgb(172, 172, 174)' },
          { color: 'rgb(30, 30, 33)', ease: 'none', scrollTrigger: {
            trigger: title, start: 'top 95%', end: 'top 35%', scrub: .65,
          }},
        )
        triggers.push(animation)
      })
      document.querySelectorAll<HTMLElement>('[data-animate="reveal"]').forEach((el) => {
        if (el.closest('.hero-video')) return
        const animation = gsap.fromTo(el,
          { y: 32, opacity: .15, filter: 'blur(3px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: .95,
            ease: 'power3.out', clearProps: 'filter,transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 95%', once: true }},
        )
        triggers.push(animation)
      })
      document.querySelectorAll<HTMLElement>('[data-parallax-media]').forEach(el => {
        const image = el.querySelector('img,video') as HTMLElement | null
        if (!image) return
        gsap.fromTo(image,{ yPercent: -7 }, { yPercent: 7, ease: 'none',
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
        gsap.fromTo(image,{scale:1.095},{scale:1,duration:1.35,ease:'power3.out',
          scrollTrigger:{trigger:el,start:'top 92%',once:true}})
      })
    })
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load',onLoad,{once:true})
    return () => { window.clearTimeout(timer); window.removeEventListener('load',onLoad); ctx.revert() }
  },[pathname])
  return null
}

export type ServiceEntry = { number: string; title: string; description: string; details: string; imagePath: string }

export function ServiceAccordion({ items }: { items: ServiceEntry[] }) {
  const [active,setActive] = useState<number|null>(0)
  return <div className="imon-services-accordion">
    {items.map((item,i)=><div className={'imon-service-item '+(active===i?'is-open':'')} key={item.number||i}>
      <button type="button" className="imon-service-trigger" aria-expanded={active===i}
        aria-controls={'imon-service-panel-'+i} onClick={()=>setActive(active===i?null:i)}>
        <span className="imon-service-number">{item.number||String(i+1).padStart(2,'0')}</span>
        <span className="imon-service-label">{item.title}</span>
        <span className="imon-service-control" aria-hidden="true">{active===i?'−':'+'}</span>
      </button>
      <div id={'imon-service-panel-'+i} className="imon-service-panel" inert={active!==i}>
        <div className="imon-service-panel-inner">
          <div className="imon-service-media">{item.imagePath && <img src={item.imagePath} alt={'Визуальное направление: '+item.title} loading="lazy"/>}</div>
          <div className="imon-service-info"><p>{item.description}</p><ul>
            {item.details.split('•').map(x=>x.trim()).filter(Boolean).map((entry,n)=><li key={n}>{entry}</li>)}
          </ul></div>
        </div>
      </div>
    </div>)}
  </div>
}

export type FaqEntry = { question: string; answer: string }
export function HomeFaq({ items }: { items: FaqEntry[] }) {
  const [active,setActive]=useState<number|null>(null)
  return <div className="imon-faq-list">
    {items.map((faq,i)=><div className={'imon-faq-item '+(active===i?'is-open':'')} key={faq.question}>
      <button type="button" className="imon-faq-trigger" onClick={()=>setActive(active===i?null:i)} aria-expanded={active===i} aria-controls={'imon-faq-panel-'+i}>
        <span>{String(i+1).padStart(2,'0')}</span><strong>{faq.question}</strong><i aria-hidden="true">{active===i?'−':'+'}</i>
      </button>
      <div className="imon-faq-panel" id={'imon-faq-panel-'+i} inert={active!==i}><div className="imon-faq-panel-inner">{faq.answer}</div></div>
    </div>)}
  </div>
}
