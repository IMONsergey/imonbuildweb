import Link from 'next/link'
import type { ReactNode } from 'react'
import { SiteHeader } from './Interactive'
import { Blocks, Visual } from './Blocks'
import { nodeProps, fieldProps, type RecordData } from '@/studio/model'
import { designCSS } from '@/studio/styles'
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

export async function SiteShell({ children, overlay = false, isPreview = false, footerHeading, design, designData, footerBlock }: { children: ReactNode; overlay?: boolean; isPreview?: boolean; footerHeading?: string; design?: unknown; designData?: RecordData; footerBlock?: { block: DisplayBlock; index: number } }) {
  const { settings, links, cta } = await siteSettings()
  return <div className="site-shell">
    <SiteHeader overlay={overlay} links={links} ctaText={cta.text} ctaHref={cta.href} />
    <style id="studio-design-overrides">{designCSS(design, designData)}</style><main id="main-content" data-studio-node="root" data-studio-path="">{children}</main><SiteMotion/><PreviewIndicator forceVisible={isPreview} />
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
      <div className="footer-main" {...(footerBlock ? nodeProps(footerBlock.block, footerBlock.index) : {})}><p {...(footerBlock ? fieldProps(`blocks.${footerBlock.index}.heading`) : {})}>{footerHeading || settings.footerMessage || 'Обсудим следующий уровень вашего бизнеса'}</p><Link href={footerBlock?.block.href || '/contact'}><span {...(footerBlock ? fieldProps(`blocks.${footerBlock.index}.buttonText`) : {})}>{footerBlock?.block.buttonText || 'Обсудить задачу'}</span><span>↗</span></Link></div>
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
      : <span className="hero-title-line" style={{ whiteSpace: 'pre-line' }}>{headline}</span>
    const footerIndex = blocks.length - 1
    const footerBlock = blocks[footerIndex]?.blockType === 'cta' ? { block: blocks[footerIndex], index: footerIndex } : undefined
    return <SiteShell overlay isPreview={isPreview} design={(page as unknown as RecordData).studio} designData={page as unknown as RecordData} footerHeading={footerBlock?.block.heading} footerBlock={footerBlock}><section data-studio-node="hero" data-studio-path="hero" className="hero-video" aria-label="I’MON — бренд, продукт и digital">
      {video ? <video className="hero-video__background" autoPlay muted playsInline loop preload="metadata" poster="/media/hero-poster.jpg" aria-hidden="true" key={video}>
        {video.endsWith('/hero-desktop.mp4') && <source src="/media/hero-mobile.mp4" type="video/mp4" media="(max-width: 700px)" />}
        <source src={video} type="video/mp4" />
      </video> : heroImage && <img className="hero-video__background" src={heroImage} alt="" />}
      <div className="hero-video__shade" /><h1 {...fieldProps('heroTitle')}>{styledHeadline}</h1><span className="hero-year">©{new Date().getFullYear()}</span><p className="hero-caption" {...fieldProps('intro')}>{field(page,'intro',fallback.texts[2])||fallback.texts[2]}</p>
    </section><HomeSections blocks={blocks} footerIndex={footerBlock?.index}/></SiteShell>
  }
  const defaultSectionName=kind==='work'?'Work':kind==='news'?'News':kind==='contact'?'Contact':kind==='about'?'About':title
  const sectionName = field<string>(page, 'heroTitle', '') || defaultSectionName
  const defaultIntro=kind==='work'?'Проекты, в которых стратегия, дизайн и digital работают как одна система.':kind==='news'?'Мысли об управлении брендом, продуктом и цифровыми коммуникациями.':kind==='contact'?'Обсудим контекст вашей задачи и найдём подходящий формат работы.':'Работаем в момент перехода бизнеса на следующий уровень.'
  const displayIntro = ['work','news','contact','about'].includes(kind) ? defaultIntro : intro
  const visibleIntro = 'id' in page ? (intro || defaultIntro) : displayIntro
  const innerMedia = mediaPath(field(page,'heroVideo',null),field(page,'heroVideoPath','')) || mediaPath(field(page,'heroImage',null),field(page,'heroImagePath',''))
  return <SiteShell isPreview={isPreview} design={(page as unknown as RecordData).studio} designData={page as unknown as RecordData}><section data-studio-node="hero" data-studio-path="hero" className={'inside-hero inside-hero--'+kind}><div className="inside-hero__top"><p {...fieldProps('intro')}>{visibleIntro}</p></div><div className="inside-hero__bottom"><h1 {...fieldProps('heroTitle')}>{sectionName}</h1><span>({kind==='work'?'2016—2026':kind==='news'?'Журнал':kind==='contact'?'Напишите нам':'I’MON'})</span></div></section>
    {innerMedia && <div className="inside-hero-media" {...fieldProps(field(page,'heroVideo',null) || field(page,'heroVideoPath','') ? 'heroVideo' : 'heroImage')}><Visual src={innerMedia} alt={title} priority/></div>}
    {kind==='about' ? <AboutSections blocks={blocks}/> : kind==='news' ? <NewsSections blocks={blocks}/> : kind==='contact' ? <ContactSections blocks={blocks}/> : <Blocks blocks={blocks}/> }</SiteShell>
}

export async function ProjectView({ project, isPreview = false }: { project: ContentProject; isPreview?: boolean }) {
  const title=field(project,'title','Проект')
  const summary=defaultDescription(project)
  const cover=entityCover(project)
  const blocks=normalizedBlocks(project)
  const sourcePath=field<string>(project,'sourcePath',field<string>(project,'path',''))
  const isSourceCase=sourcePath.startsWith('/cases/')
  const caseClass=isSourceCase?'case-story '+(sourcePath==='/cases/page'?'case-story--gac':'case-story--askona'):''
  return <SiteShell isPreview={isPreview} design={(project as unknown as RecordData).studio} designData={project as unknown as RecordData}><div className={caseClass}>
    <section className="case-hero" data-studio-node="hero" data-studio-path="hero">
      <div className="case-hero__caption"><span>Кейс / {field(project,'category','Digital')}</span><span>{field(project,'year','')}</span></div>
      <h1 {...fieldProps('title')}>{title}</h1><p {...fieldProps('summary')}>{summary}</p>
      <div className="case-meta">
        <div><span>Клиент</span><strong>{field(project,'client',title)}</strong></div>
        <div><span>Год</span><strong>{field(project,'year','')}</strong></div>
        <div><span>Работы</span><strong>{field(project,'category','Бренд, UX/UI, Digital')}</strong></div>
      </div>
    </section>
    {isSourceCase ? <CaseBlocks blocks={blocks} currentPath={sourcePath}/> : <>
      {cover && <div className="case-lead-image"><Visual src={cover} alt={title} priority/></div>}
      <Blocks blocks={blocks} base="sections"/>
    </>}
  </div></SiteShell>
}

export async function ArticleView({ article, isPreview = false }: { article: ContentArticle; isPreview?: boolean }) {
  const title=field(article,'title','Публикация')
  const source=originalPage('/news/'+field(article,'slug',''))
  const blocks=normalizedBlocks(article)
  const cover=entityCover(article)
  if(source) return <SiteShell isPreview={isPreview} design={(article as unknown as RecordData).studio} designData={article as unknown as RecordData}><ArticleEditorial article={article} blocks={blocks}/></SiteShell>
  return <SiteShell isPreview={isPreview} design={(article as unknown as RecordData).studio} designData={article as unknown as RecordData}><article className="article-page"><header className="article-header" data-studio-node="hero" data-studio-path="hero"><div><span>{field(article,'category','Журнал')}</span><span>{field(article,'date','')}</span></div><h1 {...fieldProps('title')}>{title}</h1><p>{field(article,'excerpt','')}</p></header>{cover && <div className="article-cover"><Visual src={cover} alt={title} priority /></div>}{'body' in article && article.body && <section className="section richtext-content"><RichText data={article.body} /></section>}<Blocks blocks={blocks} base="sections"/></article></SiteShell>
}
