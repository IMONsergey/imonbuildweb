import Link from 'next/link'
import type { ReactNode } from 'react'
import { SiteHeader, FilteredGrid, LeadForm } from './Interactive'
import { PreviewIndicator } from './PreviewIndicator'
import { HomeSections } from './HomeSections'
import { AboutSections } from './AboutSections'
import { NewsSections } from './NewsSections'
import { ContactSections } from './ContactSections'
import { ArticleEditorial } from './ArticleEditorial'
import { CaseBlocks } from './CaseBlocks'
import { SiteMotion } from './SiteMotion'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { defaultBlocks, type DisplayBlock } from '@/lib/defaultBlocks'
import {
  type ContentPage, type ContentProject, type ContentArticle, type OriginalPage,
  field, mediaPath, entityCover, originalPage, siteArticles, siteProjects, siteSettings,
} from '@/lib/site'

function textField(object: unknown, key: string, fallback = ''): string {
  if (!object || typeof object !== 'object') return fallback
  const value = (object as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : fallback
}
function listField(object: unknown, key: string): Array<Record<string, unknown>> {
  if (!object || typeof object !== 'object') return []
  const value = (object as Record<string, unknown>)[key]
  return Array.isArray(value) ? value as Array<Record<string, unknown>> : []
}
function mediaField(object: unknown, uploadKey = 'media', sourceKey = 'src'): string {
  return mediaPath(object && typeof object === 'object' ? (object as Record<string, unknown>)[uploadKey] : null, textField(object, sourceKey))
}
function eyebrow(value?: string) {
  return value ? <span className="eyebrow">{value}</span> : null
}
function Visual({ src, alt = '', className = '', priority = false }: { src: string; alt?: string; className?: string; priority?: boolean }) {
  if (!src) return null
  if (/\.(mp4|webm)(?:$|\?)/i.test(src)) return <video className={className} src={src} controls playsInline preload="metadata" aria-label={alt || 'Видео проекта'} />
  return <img src={src} className={className} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" />
}

export async function SiteShell({ children, overlay = false, isPreview = false, footerHeading }: { children: ReactNode; overlay?: boolean; isPreview?: boolean; footerHeading?: string }) {
  const { settings, links } = await siteSettings()
  return <div className="site-shell">
    <SiteHeader overlay={overlay} links={links} />
    <main id="main-content">{children}</main><SiteMotion/><PreviewIndicator forceVisible={isPreview} />
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-menu"><span>Меню</span><nav aria-label="Нижняя навигация">
          {links.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}
          <Link href="/contact">Контакт</Link>
        </nav></div>
        <div className="footer-social"><span className="footer-social-label">Контакт</span>
          <a href={'mailto:'+settings.email}>{settings.email}</a>
          <a href={settings.telegram || 'https://t.me/imonagency'} target="_blank" rel="noopener noreferrer">Telegram ↗</a>
        </div>
      </div>
      <div className="footer-main"><p>{footerHeading || settings.footerMessage || 'Обсудим следующий уровень вашего бизнеса'}</p><Link href="/contact">Обсудить задачу <span>↗</span></Link></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} I’MON</span>
        <div><Link href="/privacy-policy">Конфиденциальность</Link><Link href="/term-condition">Условия использования</Link></div>
        <div className="footer-contact"><a href={'mailto:'+settings.email}>{settings.email}</a><a href={settings.telegram || 'https://t.me/imonagency'} target="_blank" rel="noopener noreferrer">Telegram ↗</a></div>
      </div>
    </footer>
  </div>
}

function normalizedBlocks(page: ContentPage | ContentProject | ContentArticle): DisplayBlock[] {
  const record=page as unknown as Record<string, unknown>
  const direct=(record.blocks || record.sections)
  return Array.isArray(direct) ? direct as DisplayBlock[] : 'id' in page ? [] : defaultBlocks(page as OriginalPage)
}

function defaultDescription(p: ContentPage | ContentProject | ContentArticle): string {
  return field(p, 'summary', field(p, 'intro', field(p, 'excerpt', '')))
}

function CardList({ type, items, showAll = false }: { type: 'projects' | 'articles'; items: Array<ContentProject | ContentArticle>; showAll?: boolean }) {
  const formatted=items.map(item => {
    const slug=field(item, 'slug', '')
    const sourcePath=field(item, 'sourcePath', '')
    const originalPath=field(item, 'path', '')
    return {
      title: field(item, 'title', ''),
      description: type==='projects' ? field(item,'category','') : field(item,'title',''),
      category: field(item,'category', type==='projects'?'Проект':'Журнал'),
      href: type==='projects' ? (sourcePath || originalPath || '/work/' + slug) : ('/news/'+(slug.startsWith('news/')?slug.slice(5):slug)),
      cover: entityCover(item),
      year: field(item,'year',''),
    }
  })
  return <><FilteredGrid items={formatted} mode={type==='articles'?'journal':'work'} showFilters={showAll} />{!showAll && <div className="section-more"><Link href={type==='projects'?'/work':'/news'}>Смотреть все {type==='projects'?'проекты':'публикации'} <span>↗</span></Link></div>}</>
}

export async function Blocks({ blocks }: { blocks: DisplayBlock[] }) {
  const sections: ReactNode[]=[]
  for(let i=0;i<blocks.length;i++) {
    const block=blocks[i]
    if(block.blockType==='text') sections.push(<section key={i} className={'section section-text layout-'+(block.layout||'split')}>
      <div className="text-eyebrow">{eyebrow(block.eyebrow)}</div>
      <div className="section-text-content">{block.heading && <h2>{block.heading}</h2>}{block.body && <p>{block.body}</p>}</div>
    </section>)
    else if(block.blockType==='cards') sections.push(<section key={i} className="section cards-section">
      {block.heading && <div className="section-heading">{eyebrow(block.eyebrow)}<h2>{block.heading}</h2></div>}
      <div className="editorial-grid">{(block.items||[]).map((item,j)=><div className="editorial-card" key={j}><span className="editorial-card__number">{String(j+1).padStart(2,'0')}</span><h3>{textField(item,'heading')}</h3><p>{textField(item,'body')}</p>{textField(item,'href') && <Link href={textField(item,'href')}>Подробнее ↗</Link>}</div>)}</div>
    </section>)
    else if(block.blockType==='visual') sections.push(<section key={i} className={'section visual-section visual-section--'+(block.display||'wide')}><Visual src={mediaField(block)} alt={block.caption||''}/>{block.caption && <span className="media-caption">{block.caption}</span>}</section>)
    else if(block.blockType==='gallery') sections.push(<section key={i} className="section gallery-section">{block.heading && <h2>{block.heading}</h2>}<div className="image-gallery">{(block.items||[]).map((item,j)=>{
      const src=mediaField(item)
      return <figure key={j} className={'gallery-item gallery-item--'+(j%5===0?'full':'half')}><Visual src={src} alt={textField(item,'caption')||'Изображение проекта '+(j+1)} /><figcaption>{textField(item,'caption')}</figcaption></figure>
    })}</div></section>)
    else if(block.blockType==='services') sections.push(<section key={i} className="section services-section">
      <div className="section-heading">{eyebrow(block.eyebrow)}<h2>{block.heading||'Направления'}</h2></div>
      <div className="services-list">{(block.items||[]).map((item,j)=><details className="service" key={j}><summary><span className="service-num">{textField(item,'number')||String(j+1).padStart(2,'0')}</span><span>{textField(item,'title')}</span><span className="service-plus">+</span></summary><div className="service-open"><div><p>{textField(item,'description')}</p><ul>{textField(item,'details').split('•').map(x=>x.trim()).filter(Boolean).map((x,k)=><li key={k}>{x}</li>)}</ul></div><Visual src={mediaField(item,'image','imagePath')} alt={textField(item,'title')} /></div></details>)}</div>
    </section>)
    else if(block.blockType==='faq') sections.push(<section key={i} className="section faq-section"><div className="section-heading">{eyebrow('(Вопросы о работе)')}<h2>{block.heading||'FAQ'}</h2><p>Остались вопросы? <Link href="/contact">Обсудим задачу ↗</Link></p></div><div className="faq-list">{(block.items||[]).map((item,j)=><details key={j} className="faq-item"><summary><span>{String(j+1).padStart(2,'0')}</span><strong>{textField(item,'question')}</strong><i>+</i></summary><div className="faq-answer">{textField(item,'answer')}</div></details>)}</div></section>)
    else if(block.blockType==='quote') sections.push(<section key={i} className="section quote-section">
      <div className="quote-media"><Visual src={mediaField(block,'image','imagePath')} alt="Принцип работы"/></div><div className="quote-text">{eyebrow(block.eyebrow)}<blockquote>“{block.quote}”</blockquote><p>{block.attribution}</p></div>
    </section>)
    else if(block.blockType==='listing') {
      const kind=block.kind==='articles'?'articles':'projects'
      const all=kind==='articles'?await siteArticles():await siteProjects()
      sections.push(<section key={i} className="section listing-section"><div className="section-heading">{eyebrow(block.eyebrow)}{block.heading && <h2>{block.heading}</h2>}</div><CardList type={kind} items={all.slice(0,block.limit||all.length)} showAll={all.length <= (block.limit||all.length)}/></section>)
    } else if(block.blockType==='contact') sections.push(<section key={i} className="section contact-section"><div className="section-heading"><h2>{block.heading||'Обсудим задачу'}</h2>{block.intro && <p>{block.intro}</p>}</div>{block.showForm!==false && <LeadForm />}</section>)
    else if(block.blockType==='cta') sections.push(<section key={i} className="section cta-section"><h2>{block.heading}</h2><Link href={block.href||'/contact'}>{block.buttonText||'Обсудить задачу'} <span>↗</span></Link></section>)
  }
  return <>{sections}</>
}

export async function PageView({ page, isPreview = false }: { page: ContentPage; isPreview?: boolean }) {
  const kind=field<string>(page,'kind','standard')
  const title=field(page,'title','I’MON')
  const intro=field(page,'intro','')
  const blocks=normalizedBlocks(page)
  if(kind==='home'){
    const fallback=originalPage('/')!
    const video=mediaPath(field(page,'heroVideo',null),field(page,'heroVideoPath',fallback.videos[0]||''))
    const heroImage=mediaPath(field(page,'heroImage',null),field(page,'heroImagePath',fallback.images[0]||''))
    const headline=field(page,'heroTitle',fallback.texts[0])
    const styledHeadline = headline === fallback.texts[0]
      ? <><span className="hero-title-line">Бренд, продукт</span><span className="hero-title-line">и digital — как</span><span className="hero-title-line">единая <span className="hero-mobile-line">система</span></span></>
      : headline
    return <SiteShell overlay isPreview={isPreview} footerHeading={blocks.find(b=>b.blockType==='cta')?.heading}><section className="hero-video" aria-label="I’MON — бренд, продукт и digital">
      {video ? <video className="hero-video__background" autoPlay muted playsInline loop preload="metadata" poster="/media/hero-poster.jpg" aria-hidden="true" key={video}>
        {video.endsWith('/hero-desktop.mp4') && <source src="/media/hero-mobile.mp4" type="video/mp4" media="(max-width: 700px)" />}
        <source src={video} type="video/mp4" />
      </video> : heroImage && <img className="hero-video__background" src={heroImage} alt="" />}
      <div className="hero-video__shade" /><h1>{styledHeadline}</h1><span className="hero-year">©{new Date().getFullYear()}</span><p className="hero-caption">{field(page,'intro',fallback.texts[2])||fallback.texts[2]}</p>
    </section><HomeSections blocks={blocks}/></SiteShell>
  }
  const sectionName=kind==='work'?'Work':kind==='news'?'News':kind==='contact'?'Contact':kind==='about'?'About':title
  const defaultIntro=kind==='work'?'Проекты, в которых стратегия, дизайн и digital работают как одна система.':kind==='news'?'Мысли об управлении брендом, продуктом и цифровыми коммуникациями.':kind==='contact'?'Обсудим контекст вашей задачи и найдём подходящий формат работы.':'Работаем в момент перехода бизнеса на следующий уровень.'
  const displayIntro = ['work','news','contact','about'].includes(kind) ? defaultIntro : intro
  const visibleIntro = 'id' in page ? (intro || defaultIntro) : displayIntro
  return <SiteShell isPreview={isPreview}><section className={'inside-hero inside-hero--'+kind}><div className="inside-hero__top"><p>{visibleIntro}</p></div><div className="inside-hero__bottom"><h1>{sectionName}</h1><span>({kind==='work'?'2016—2026':kind==='news'?'Журнал':kind==='contact'?'Напишите нам':'I’MON'})</span></div></section>
    {kind==='about' ? <AboutSections blocks={blocks}/> : kind==='news' ? <NewsSections/> : kind==='contact' ? <ContactSections blocks={blocks}/> : <Blocks blocks={blocks}/> }</SiteShell>
}

export async function ProjectView({ project, isPreview = false }: { project: ContentProject; isPreview?: boolean }) {
  const title=field(project,'title','Проект')
  const summary=defaultDescription(project)
  const cover=entityCover(project)
  const blocks=normalizedBlocks(project)
  const sourcePath=field<string>(project,'sourcePath',field<string>(project,'path',''))
  const isSourceCase=sourcePath.startsWith('/cases/')
  const caseClass=isSourceCase?'case-story '+(sourcePath==='/cases/page'?'case-story--gac':'case-story--askona'):''
  return <SiteShell isPreview={isPreview}><div className={caseClass}>
    <section className="case-hero">
      <div className="case-hero__caption"><span>Кейс / {field(project,'category','Digital')}</span><span>{field(project,'year','')}</span></div>
      <h1>{title}</h1><p>{summary}</p>
      <div className="case-meta">
        <div><span>Клиент</span><strong>{field(project,'client',title)}</strong></div>
        <div><span>Год</span><strong>{field(project,'year','')}</strong></div>
        <div><span>Работы</span><strong>{field(project,'category','Бренд, UX/UI, Digital')}</strong></div>
      </div>
    </section>
    {isSourceCase ? <CaseBlocks blocks={blocks}/> : <>
      {cover && <div className="case-lead-image"><Visual src={cover} alt={title} priority/></div>}
      <Blocks blocks={blocks}/>
    </>}
  </div></SiteShell>
}

export async function ArticleView({ article, isPreview = false }: { article: ContentArticle; isPreview?: boolean }) {
  const title=field(article,'title','Публикация')
  const source=originalPage('/news/'+field(article,'slug',''))
  const blocks=normalizedBlocks(article)
  const cover=entityCover(article)
  if(source) return <SiteShell isPreview={isPreview}><ArticleEditorial article={article} blocks={blocks}/></SiteShell>
  return <SiteShell isPreview={isPreview}><article className="article-page"><header className="article-header"><div><span>{field(article,'category','Журнал')}</span><span>{field(article,'date','')}</span></div><h1>{title}</h1><p>{field(article,'excerpt','')}</p></header>{cover && <div className="article-cover"><Visual src={cover} alt={title} priority /></div>}{'body' in article && article.body && <section className="section richtext-content"><RichText data={article.body} /></section>}<Blocks blocks={blocks}/></article></SiteShell>
}
