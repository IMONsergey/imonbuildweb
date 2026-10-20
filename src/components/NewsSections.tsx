import Link from 'next/link'
import { siteArticles, field, entityCover } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { nodeProps, fieldProps } from '@/studio/model'
import { Blocks } from './Blocks'

export async function NewsSections({ blocks }: { blocks: DisplayBlock[] }) {
  const articles = await siteArticles()
  return <>{blocks.map((block, index) => block.blockType === 'listing' && block.kind === 'articles'
    ? <section className="imon-news-index" key={block.id || index} {...nodeProps(block, index)}>
      {block.heading && <h2 className="imon-news-section-heading" {...fieldProps(`blocks.${index}.heading`)}>{block.heading}</h2>}
      <div className="imon-news-grid">{articles.slice(0, block.limit ?? 100).map((article, i) => {
        const slug = field<string>(article, 'slug', '').replace(/^news\//, ''), title = field<string>(article, 'title', 'Журнал'), image = entityCover(article)
        return <Link className="imon-news-card" data-photo-in href={'/news/' + slug} key={slug || String(i)}>
          <span className="imon-news-category">{field<string>(article, 'category', 'Журнал')}</span>
          <div className="imon-news-image">{image && <img src={image} alt={title} loading={i < 4 ? 'eager' : 'lazy'}/>}</div>
          <div className="imon-news-caption"><h2>{title}</h2><span aria-hidden="true">↗</span></div>
        </Link>
      })}</div>
    </section>
    : <Blocks key={block.id || index} blocks={[block]} offset={index}/>)}</>
}
