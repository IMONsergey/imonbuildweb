'use client'
import type { ReactNode } from 'react'
import { ArrowUpRight } from '@/components/ArrowUpRight'
import type { RecordData } from '../model'

export type PreviewAsset = { id: number; url: string; alt: string; mimeType?: string }
export type PreviewContext = { media: PreviewAsset[]; heroImage?: string; heroVideo?: string; kind?: string }

const txt = (v: unknown) => typeof v === 'string' ? v : ''
const arr = (v: unknown): RecordData[] => Array.isArray(v) ? v.filter((x): x is RecordData => !!x && typeof x === 'object' && !Array.isArray(x)) : []

export function previewURL(item: RecordData, media: PreviewAsset[], mediaKey = 'media', sourceKey = 'src') {
  const value = item[mediaKey]
  const id = typeof value === 'number' ? value : value && typeof value === 'object' && 'id' in value ? Number(value.id) : undefined
  return media.find(asset => asset.id === id)?.url || (typeof item[sourceKey] === 'string' && item[sourceKey].startsWith('/') ? item[sourceKey] : '')
}

export function PreviewMedia({ src, alt = '' }: { src: string; alt?: string }) {
  if (!src) return <div className="puck-media-empty">Медиа — выберите файл в свойствах</div>
  if (/\.(mp4|webm)(\?|$)/i.test(src)) return <video src={src} muted playsInline loop autoPlay preload="metadata" aria-label={alt}/>
  if (/^\/[^/]/.test(src)) return <img src={src} alt={alt}/>
  return <div className="puck-media-empty">Внешнее медиа</div>
}
export function PreviewBlock({ type, props, context }: { type: string; props: RecordData; context: PreviewContext }) {
  const h = txt(props.heading), caption = txt(props.eyebrow)
  const base = (mediaKey='media', sourceKey='src') => previewURL(props, context.media, mediaKey, sourceKey)
  if (type === 'text') return <section className={'puck-section puck-text puck-layout-' + (txt(props.layout) || 'split')}>
    <small>{caption}</small><div>{h && <h2>{h}</h2>}{!!props.body && <p>{txt(props.body)}</p>}{base('image','imagePath') && <PreviewMedia src={base('image','imagePath')} alt={h}/>}</div>
  </section>
  if (type === 'visual') return <section className={'puck-section puck-media puck-media-' + (txt(props.display) || 'wide')}>
    <PreviewMedia src={base()} alt={txt(props.caption)}/>{!!props.caption && <p>{txt(props.caption)}</p>}
  </section>
  if (type === 'gallery') return <section className="puck-section">{h && <h2>{h}</h2>}
    <div className="puck-gallery">{arr(props.items).map((item,index)=><figure key={index}><PreviewMedia src={previewURL(item,context.media)} alt={txt(item.caption)}/><figcaption>{txt(item.caption)}</figcaption></figure>)}</div>
  </section>
  if (type === 'cards') return <section className="puck-section">{h && <h2>{h}</h2>}<div className="puck-cards">{arr(props.items).map((item,index)=>
    <article key={index}><small>{String(index+1).padStart(2,'0')}</small>{previewURL(item,context.media,'image','imagePath') && <PreviewMedia src={previewURL(item,context.media,'image','imagePath')}/>}<h3>{txt(item.heading)}</h3><p>{txt(item.body)}</p></article>
  )}</div></section>
  if (type === 'services') return <section className="puck-section"><small>{caption}</small><h2>{h || 'Направления'}</h2>
    <div className="puck-services">{arr(props.items).map((item,index)=><div key={index}><small>{txt(item.number) || String(index+1).padStart(2,'0')}</small><h3>{txt(item.title)}</h3><span>＋</span></div>)}</div>
  </section>
  if (type === 'faq') return <section className="puck-section puck-faq"><h2>{h || 'FAQ'}</h2><div>{arr(props.items).map((item,index)=><details key={index}><summary>{txt(item.question)}<span>＋</span></summary><p>{txt(item.answer)}</p></details>)}</div></section>
  if (type === 'quote') return <section className="puck-section puck-quote"><div>{base('image','imagePath') && <PreviewMedia src={base('image','imagePath')}/>}</div><div><small>{caption}</small><blockquote>{txt(props.quote)}</blockquote><p>{txt(props.attribution)}</p></div></section>
  if (type === 'listing') return <section className="puck-section"><small>{caption}</small><h2>{h || (props.kind === 'articles' ? 'Журнал' : 'Проекты')}</h2><div className="puck-dynamic"><span>Динамическая коллекция: {props.kind === 'articles' ? 'Журнал' : 'Кейсы'}</span><small>Список берётся из CMS. Точная версия — в предпросмотре сайта.</small></div></section>
  if (type === 'contact') return <section className="puck-section puck-contact"><h2>{h || 'Расскажите о задаче'}</h2><p>{txt(props.intro)}</p><div className="puck-form-preview">Имя <span/>Email <span/>Сообщение <span/><small>Форма отключена в режиме редактирования</small></div></section>
  if (type === 'cta') return <section className="puck-section puck-cta"><h2>{h}</h2><span>{txt(props.buttonText) || 'Обсудить задачу'} <ArrowUpRight/></span></section>
  if (type === 'aboutEditorial') return <section className="puck-section puck-about"><div><PreviewMedia src={base('heroImage','heroImagePath')} alt="Фото студии"/></div><h2>{txt(props.statement) || 'О студии'}</h2><div className="puck-cards">{arr(props.values).map((v,index)=><article key={index}><small>{String(index+1).padStart(2,'0')}</small><h3>{txt(v.heading)}</h3><p>{txt(v.body)}</p></article>)}</div>
    <h2>{txt(props.teamTitle)}</h2><p>{txt(props.teamIntro)}</p><div className="puck-portraits">{arr(props.team).map((v,index)=><div key={index}><PreviewMedia src={previewURL(v,context.media,'portrait','portraitPath')} alt={txt(v.name)}/><span>{txt(v.name)||txt(v.role)}</span></div>)}</div>
  </section>
  return <section className="puck-section puck-dynamic"><h3>{txt(props.blockName)||type}</h3><p>Этот блок редактируется через свойства справа, а точный вид доступен через предпросмотр.</p></section>
}
export function PreviewRoot({ children, title, intro, heroTitle, summary, excerpt, context, heroVideo, heroImage }: {
  children: ReactNode; title?: string; intro?: string; heroTitle?: string; summary?: string; excerpt?: string; context: PreviewContext; heroVideo?: string; heroImage?: string
}) {
  const isHome = context.kind === 'home'
  return <div className="puck-imon-site">
    <header className={'puck-brand-header ' + (isHome?'puck-brand-header-home':'')}><strong>I’MON</strong><span>О нас　 Проекты　 Журнал</span><small>Связаться</small></header>
    <section className={'puck-site-hero ' + (isHome?'puck-site-hero-home':'')}>
      {isHome && (heroVideo || context.heroVideo) && <video className="puck-hero-video" src={heroVideo || context.heroVideo} autoPlay playsInline loop muted preload="metadata"/>}
      {isHome && !(heroVideo || context.heroVideo) && (heroImage || context.heroImage) && <img className="puck-hero-video" src={heroImage || context.heroImage} alt=""/>}
      <div className="puck-hero-copy"><p>{intro || summary || excerpt}</p><h1>{heroTitle || title}</h1></div>
    </section>
    <main>{children}</main>
    <footer className="puck-site-footer"><h2>Обсудим следующий уровень вашего бизнеса</h2><small>© I’MON</small></footer>
  </div>
}
