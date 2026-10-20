import { isVideoEmbed } from '@/lib/mediaPolicy'
import { CaseMedia } from './CaseMedia'
import { AboutEditorial } from './AboutEditorial'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { FilteredGrid, LeadForm } from './Interactive'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { field, mediaPath, entityCover, siteArticles, siteProjects, type ContentProject, type ContentArticle } from '@/lib/site'
import { nodeProps, fieldProps } from '@/studio/model'
function textField(object: unknown, key: string, fallback = ''): string {
  if (!object || typeof object !== 'object') return fallback
  const value = (object as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : fallback
}
function mediaField(object: unknown, uploadKey = 'media', sourceKey = 'src'): string {
  const source = textField(object, sourceKey)
  return mediaPath(object && typeof object === 'object' ? (object as Record<string, unknown>)[uploadKey] : null, source) || (isVideoEmbed(source) ? source : '')
}
function eyebrow(value?: string) {
  return value ? <span className="eyebrow">{value}</span> : null
}
export function Visual({ src, alt = '', className = '', priority = false }: { src: string; alt?: string; className?: string; priority?: boolean }) {
  if (!src) return null
  if (isVideoEmbed(src)) return <CaseMedia src={src} alt={alt} className={className}/>
  if (/\.pdf(?:$|\?)/i.test(src)) return <a className="document-media-link" href={src} target="_blank" rel="noopener noreferrer">{alt || 'Открыть документ'} ↗</a>
  if (/\.(mp4|webm)(?:$|\?)/i.test(src)) return <video className={className} src={src} controls playsInline preload="metadata" aria-label={alt || 'Видео проекта'} />
  return <img src={src} className={className} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" />
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

export async function Blocks({ blocks, base = 'blocks', offset = 0 }: { blocks: DisplayBlock[]; base?: string; offset?: number }) {
  const sections: ReactNode[]=[]
  for(let i=0;i<blocks.length;i++) {
    const block=blocks[i]
    if(block.blockType==='aboutEditorial') sections.push(<AboutEditorial key={block.id || i} block={block} index={i + offset} base={base}/>)
    else if(block.blockType==='text') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className={'section section-text layout-'+(block.layout||'split')}>
      <div className="text-eyebrow">{eyebrow(block.eyebrow)}</div>
      <div className="section-text-content">{block.heading && <h2 {...fieldProps(`${base}.${i + offset}.heading`)}>{block.heading}</h2>}{block.body && <p {...fieldProps(`${base}.${i + offset}.body`)}>{block.body}</p>}</div>
    </section>)
    else if(block.blockType==='cards') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section cards-section">
      {block.heading && <div className="section-heading">{eyebrow(block.eyebrow)}<h2 {...fieldProps(`${base}.${i + offset}.heading`)}>{block.heading}</h2></div>}
      <div className="editorial-grid">{(block.items||[]).map((item,j)=><div className="editorial-card" key={j}><div {...fieldProps(`${base}.${i + offset}.items.${j}.image`)}><Visual src={mediaField(item,'image','imagePath')} alt={textField(item,'heading')}/></div><span className="editorial-card__number">{String(j+1).padStart(2,'0')}</span><h3 {...fieldProps(`${base}.${i + offset}.items.${j}.heading`)}>{textField(item,'heading')}</h3><p {...fieldProps(`${base}.${i + offset}.items.${j}.body`)}>{textField(item,'body')}</p>{textField(item,'href') && <Link href={textField(item,'href')}>Подробнее ↗</Link>}</div>)}</div>
    </section>)
    else if(block.blockType==='visual') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className={'section visual-section visual-section--'+(block.display||'wide')}><Visual src={mediaField(block)} alt={block.caption||''}/>{block.caption && <span className="media-caption">{block.caption}</span>}</section>)
    else if(block.blockType==='gallery') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section gallery-section">{block.heading && <h2 {...fieldProps(`${base}.${i + offset}.heading`)}>{block.heading}</h2>}<div className="image-gallery">{(block.items||[]).map((item,j)=>{
      const src=mediaField(item)
      return <figure key={j} className={'gallery-item gallery-item--'+(j%5===0?'full':'half')}><Visual src={src} alt={textField(item,'caption')||'Изображение проекта '+(j+1)} /><figcaption>{textField(item,'caption')}</figcaption></figure>
    })}</div></section>)
    else if(block.blockType==='services') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section services-section">
      <div className="section-heading">{eyebrow(block.eyebrow)}<h2>{block.heading||'Направления'}</h2></div>
      <div className="services-list">{(block.items||[]).map((item,j)=><details className="service" key={j}><summary><span className="service-num">{textField(item,'number')||String(j+1).padStart(2,'0')}</span><span>{textField(item,'title')}</span><span className="service-plus">+</span></summary><div className="service-open"><div><p>{textField(item,'description')}</p><ul>{textField(item,'details').split('•').map(x=>x.trim()).filter(Boolean).map((x,k)=><li key={k}>{x}</li>)}</ul></div><Visual src={mediaField(item,'image','imagePath')} alt={textField(item,'title')} /></div></details>)}</div>
    </section>)
    else if(block.blockType==='faq') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section faq-section"><div className="section-heading">{eyebrow('(Вопросы о работе)')}<h2>{block.heading||'FAQ'}</h2><p>Остались вопросы? <Link href="/contact">Обсудим задачу ↗</Link></p></div><div className="faq-list">{(block.items||[]).map((item,j)=><details key={j} className="faq-item"><summary><span>{String(j+1).padStart(2,'0')}</span><strong>{textField(item,'question')}</strong><i>+</i></summary><div className="faq-answer">{textField(item,'answer')}</div></details>)}</div></section>)
    else if(block.blockType==='quote') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section quote-section">
      <div className="quote-media"><Visual src={mediaField(block,'image','imagePath')} alt="Принцип работы"/></div><div className="quote-text">{eyebrow(block.eyebrow)}<blockquote>“{block.quote}”</blockquote><p>{block.attribution}</p></div>
    </section>)
    else if(block.blockType==='listing') {
      const kind=block.kind==='articles'?'articles':'projects'
      const all=kind==='articles'?await siteArticles():await siteProjects()
      sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section listing-section"><div className="section-heading">{eyebrow(block.eyebrow)}{block.heading && <h2 {...fieldProps(`${base}.${i + offset}.heading`)}>{block.heading}</h2>}</div><CardList type={kind} items={all.slice(0,block.limit||all.length)} showAll={all.length <= (block.limit||all.length)}/></section>)
    } else if(block.blockType==='contact') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section contact-section"><div className="section-heading"><h2>{block.heading||'Обсудим задачу'}</h2>{block.intro && <p>{block.intro}</p>}</div>{block.showForm!==false && <LeadForm />}</section>)
    else if(block.blockType==='cta') sections.push(<section key={i} {...nodeProps(block, i + offset, base)} className="section cta-section"><h2 {...fieldProps(`${base}.${i + offset}.heading`)}>{block.heading}</h2><Link href={block.href||'/contact'}>{block.buttonText||'Обсудить задачу'} <span>↗</span></Link></section>)
  }
  return <>{sections}</>
}

