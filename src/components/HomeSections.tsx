import Link from 'next/link'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { field, entityCover, mediaPath, siteArticles, siteProjects } from '@/lib/site'
import { nodeProps, fieldProps, type RecordData } from '@/studio/model'
import { HomeFaq, ServiceAccordion, type FaqEntry, type ServiceEntry } from './SiteMotion'
import { Blocks } from './Blocks'

const str = (item: unknown, key: string, fallback = '') => item && typeof item === 'object' && typeof (item as RecordData)[key] === 'string' ? (item as RecordData)[key] as string : fallback
const entries = (block?: DisplayBlock) => Array.isArray(block?.items) ? block.items as RecordData[] : []

export async function HomeSections({ blocks, footerIndex }: { blocks: DisplayBlock[]; footerIndex?: number }) {
  const [projects, articles] = await Promise.all([siteProjects(), siteArticles()])
  const sections = []
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]
    if (index === footerIndex) continue
    const path = `blocks.${index}`
    const next = blocks[index + 1]
    const cards = next?.blockType === 'cards' ? next : undefined
    if (block.blockType === 'text' && cards) {
      const cardIndex = index + 1, items = entries(cards)
      if (block.layout === 'dark') {
        const record = block as unknown as RecordData
        const image = mediaPath(record.image, str(record, 'imagePath', '/media/DDl0EjwOEkxHuZ85FQpANj3vooE.png'))
        sections.push(<section key={block.id || index} className="imon-home-approach" {...nodeProps(block, index)}>
          <h2 className="visually-hidden" {...fieldProps(path + '.heading')}>{block.heading}</h2>
          {image && <div className="imon-approach-photo" data-parallax-media><img src={image} alt="Иллюстрация системного подхода" {...fieldProps(path + '.image')}/></div>}
          <div className="imon-approach-statistics" {...nodeProps(cards, cardIndex)}><span className="imon-approach-overline" {...fieldProps(path + '.eyebrow')}>{block.eyebrow}</span>
            {items.map((item, itemIndex) => <div className="imon-stat" key={String(item.id || itemIndex)}><span>{String(itemIndex + 1).padStart(2, '0')}</span><p {...fieldProps(`blocks.${cardIndex}.items.${itemIndex}.heading`)}>{str(item, 'heading')}</p><div className="imon-stat-mark" aria-hidden="true"><i/><i/><i/></div></div>)}
          </div>
        </section>)
      } else {
        const intro = block.layout !== 'full'
        sections.push(<section key={block.id || index} className={'imon-editorial-statement ' + (intro ? 'imon-home-intro' : 'imon-home-when')} {...nodeProps(block, index)}>
          <h2 data-tone-title {...fieldProps(path + '.heading')}>{block.heading}</h2>
          <div className="imon-statement-details"><span className="imon-statement-eyebrow" {...fieldProps(path + '.eyebrow')}>{block.eyebrow}</span>
            <div className="imon-statement-items" {...nodeProps(cards, cardIndex)}>{items.map((item, itemIndex) => <div key={String(item.id || itemIndex)} data-animate="reveal" className="imon-statement-item"><h3 {...fieldProps(`blocks.${cardIndex}.items.${itemIndex}.heading`)}>{str(item, 'heading')}</h3><p {...fieldProps(`blocks.${cardIndex}.items.${itemIndex}.body`)}>{str(item, 'body')}</p></div>)}</div>
            <Link className="imon-statement-action" href={intro ? '/about' : '/contact'}>{intro ? 'Больше о I’MON' : 'Обсудить задачу'} <span>↗</span></Link>
          </div>
        </section>)
      }
      index++
    } else if (block.blockType === 'listing' && block.kind === 'projects') {
      const selected = projects.slice(0, block.limit ?? 4)
      sections.push(<section key={block.id || index} className="imon-home-featured" {...nodeProps(block, index)}>
        <div className="imon-section-title"><h2 data-tone-title {...fieldProps(path + '.heading')}>{block.heading || 'Проекты'}</h2><span {...fieldProps(path + '.eyebrow')}>{block.eyebrow}</span></div>
        <div className="imon-home-work-grid">{selected.map((project, itemIndex) => {
          const title = field(project, 'title', 'Проект'), href = field(project, 'sourcePath', field(project, 'path', '/work')), image = entityCover(project)
          return <Link href={href} key={href} className="imon-featured-card" data-photo-in><div className="imon-featured-caption"><strong>{title}</strong><span>{field(project, 'category', '')}</span></div><div className="imon-featured-image">{image && <img alt={title} src={image} loading={itemIndex < 2 ? 'eager' : 'lazy'}/>}<div className="imon-featured-arrow">↗</div></div></Link>
        })}</div><div className="imon-featured-bottom"><Link href="/work">Все проекты <span>↗</span></Link></div>
      </section>)
    } else if (block.blockType === 'services') {
      const items: ServiceEntry[] = entries(block).map((item, i) => ({ number: str(item, 'number', String(i + 1).padStart(2, '0')), title: str(item, 'title'), description: str(item, 'description'), details: str(item, 'details'), imagePath: mediaPath(item.image, str(item, 'imagePath')) }))
      sections.push(<section key={block.id || index} className="imon-home-services" {...nodeProps(block, index)}><div className="imon-section-title"><h2 data-tone-title {...fieldProps(path + '.heading')}>{block.heading || 'Направления'}</h2><span {...fieldProps(path + '.eyebrow')}>{block.eyebrow}</span></div><ServiceAccordion items={items} fieldBase={path + '.items'}/></section>)
    } else if (block.blockType === 'quote') {
      sections.push(<section key={block.id || index} className="imon-home-principle" {...nodeProps(block, index)}><div className="imon-section-title"><h2 data-tone-title {...fieldProps(path + '.heading')}>{block.heading || 'Принцип'}</h2><span {...fieldProps(path + '.eyebrow')}>{block.eyebrow}</span></div><div className="imon-principle-lower"><div className="imon-principle-decor">{mediaPath((block as unknown as RecordData).image,str(block,'imagePath')) ? <img {...fieldProps(path + '.image')} src={mediaPath((block as unknown as RecordData).image,str(block,'imagePath'))} alt="Иллюстрация принципа"/> : <><span>↗</span><span>I’MON</span></>}</div><div className="imon-principle-quote" data-animate="reveal"><blockquote {...fieldProps(path + '.quote')}>{block.quote?.replace(/^[“"]|[”"]$/g, '')}</blockquote><p {...fieldProps(path + '.attribution')}>{block.attribution}</p></div></div></section>)
    } else if (block.blockType === 'faq') {
      const items: FaqEntry[] = entries(block).map(item => ({ question: str(item, 'question'), answer: str(item, 'answer') }))
      sections.push(<section key={block.id || index} className="imon-home-faq" {...nodeProps(block, index)}><div className="imon-section-title"><span>(Вопросы о работе)</span><h2 data-tone-title {...fieldProps(path + '.heading')}>{block.heading || 'FAQ'}</h2></div><div className="imon-faq-content"><div className="imon-faq-contact"><p>Остались вопросы? Обсудим задачу</p><Link href="/contact">Связаться ↗</Link></div><HomeFaq items={items} fieldBase={path + '.items'}/></div></section>)
    } else if (block.blockType === 'listing' && block.kind === 'articles') {
      sections.push(<section key={block.id || index} className="imon-home-magazine" {...nodeProps(block, index)}><div className="imon-section-title"><h2 data-tone-title {...fieldProps(path + '.heading')}>{block.heading || 'Журнал'}</h2><span {...fieldProps(path + '.eyebrow')}>{block.eyebrow}</span></div><div className="imon-magazine-grid">{articles.slice(0, block.limit ?? 4).map(article => {
        const title = field(article, 'title', 'Журнал'), image = entityCover(article), slug = field(article, 'slug', '')
        return <Link href={'/news/' + slug.replace(/^news\//, '')} key={slug} className="imon-magazine-card" data-photo-in><span className="imon-magazine-category">{field(article, 'category', '')}</span><div className="imon-magazine-image">{image && <img src={image} alt={title} loading="lazy"/>}</div><h3>{title}</h3><span className="imon-magazine-arrow">↗</span></Link>
      })}</div><Link className="imon-all-articles" href="/news">Все публикации <span>↗</span></Link></section>)
    } else sections.push(<Blocks key={block.id || index} blocks={[block]} offset={index}/>)
  }
  return <>{sections}</>
}
