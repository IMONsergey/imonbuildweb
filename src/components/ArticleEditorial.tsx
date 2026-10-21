import { ArrowUpRight } from './ArrowUpRight'
import Link from 'next/link'
import { field, entityCover, siteArticles, type ContentArticle } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { nodeProps, fieldProps } from '@/studio/model'
import { Blocks } from './Blocks'

export async function ArticleEditorial({ article, blocks }: { article: ContentArticle; blocks: DisplayBlock[] }) {
  const other = (await siteArticles()).filter(item => field<string>(item,'slug','') !== field<string>(article,'slug',''))
  const heading = field<string>(article,'title','Журнал'), cover = entityCover(article)
  const rawDate = field<string>(article,'publishedAt',field<string>(article,'date',''))
  const date = rawDate && Number.isFinite(Date.parse(rawDate)) ? new Date(rawDate).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}) : ''
  const body = 'body' in article ? article.body : undefined
  const last = blocks.length - 1, related = blocks[last]?.blockType === 'listing' && blocks[last].kind === 'articles' ? blocks[last] : undefined
  return <>
    <section className="imon-article-primary">
      <header className="imon-article-heading" data-studio-node="hero" data-studio-path="hero">
        <div className="imon-article-meta"><span {...fieldProps('category')}>{field<string>(article,'category','Журнал')}</span><span {...fieldProps('publishedAt')} data-studio-editable="false">{date}</span></div>
        <h1 {...fieldProps('title')}>{heading}</h1>
      </header>
      <div className="imon-article-flow">
        <aside className="imon-article-side">{cover && <div className="imon-article-cover" data-photo-in {...fieldProps('cover')}><img src={cover} alt={heading} loading="eager"/></div>}</aside>
        <div className="imon-article-copy">
          {body && <div className="imon-article-richtext" {...fieldProps('body')} data-studio-editable="false"><RichText data={body}/></div>}
          {blocks.map((block,index) => index === last && related ? null : block.blockType === 'text'
            ? <div className="imon-article-paragraph" data-animate={index > 0 ? 'reveal' : undefined} key={block.id || index} {...nodeProps(block,index,'sections')}>
                {block.heading && <h2 {...fieldProps(`sections.${index}.heading`)}>{block.heading}</h2>}
                {block.body && <p {...fieldProps(`sections.${index}.body`)}>{block.body}</p>}
              </div>
            : <Blocks key={block.id || index} blocks={[block]} base="sections" offset={index}/>)}
        </div>
      </div>
    </section>
    {related && <section className="imon-article-related" {...nodeProps(related,last,'sections')}>
      <div className="imon-article-related-heading"><h2 {...fieldProps(`sections.${last}.heading`)}>{related.heading || 'Другие публикации'}</h2><span>(Читайте также)</span></div>
      <div className="imon-news-grid">{other.slice(0,related.limit ?? 4).map((item,i) => {
        const title = field<string>(item,'title','Журнал'), image = entityCover(item), slug = field<string>(item,'slug','').replace(/^news\//,'')
        return <Link key={slug || i} className="imon-news-card" href={'/news/' + slug} data-photo-in><span className="imon-news-category">{field<string>(item,'category','Журнал')}</span><div className="imon-news-image">{image && <img src={image} loading="lazy" alt={title}/>}</div><div className="imon-news-caption"><h3>{title}</h3><span aria-hidden="true"><ArrowUpRight/></span></div></Link>
      })}</div>
    </section>}
  </>
}
