import Link from 'next/link'
import { field, entityCover, siteArticles, originalArticles, mediaPath, type ContentArticle } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { RichText } from '@payloadcms/richtext-lexical/react'

export async function ArticleEditorial({ article, blocks }: { article:ContentArticle; blocks: DisplayBlock[] }) {
  const other=(await siteArticles()).filter(item=>field<string>(item,'slug','')!==field<string>(article,'slug',''))
  const order=new Map(originalArticles.map((value,index)=>[value.slug.replace(/^news\//,''),index]))
  other.sort((a,b)=>(order.get(field<string>(a,'slug',''))??999)-(order.get(field<string>(b,'slug',''))??999))
  const sections=blocks.filter(b=>b.blockType==='text')
  const heading=field<string>(article,'title','Журнал')
  const cover=entityCover(article)
  const body='body' in article ? article.body : undefined
  return <>
    <section className="imon-article-primary">
      <header className="imon-article-heading">
        <div className="imon-article-meta"><span>{field<string>(article,'category','Журнал')}</span><span>{field<string>(article,'date','16 июля 2025')}</span></div>
        <h1>{heading}</h1>
      </header>
      <div className="imon-article-flow">
        <aside className="imon-article-side">
          {cover&&<div className="imon-article-cover" data-photo-in><img src={cover} alt={heading} loading="eager"/></div>}
        </aside>
        <div className="imon-article-copy">
          {body ? <div className="imon-article-richtext"><RichText data={body}/></div>
            : sections.map((section,i)=><div key={i} className="imon-article-paragraph" data-animate={i>0?'reveal':undefined}>
              {section.heading&&<h2>{section.heading}</h2>}
              {section.body&&<p>{section.body}</p>}
            </div>)}
        </div>
      </div>
    </section>
    <section className="imon-article-related">
      <div className="imon-article-related-heading"><h2>Другие публикации</h2><span>(Читайте также)</span></div>
      <div className="imon-news-grid">{other.slice(0,4).map((item,i)=>{
        const title=field<string>(item,'title','Журнал')
        const image=entityCover(item)
        const slug=field<string>(item,'slug','').replace(/^news\//,'')
        return <Link key={slug||i} className="imon-news-card" href={'/news/'+slug} data-photo-in>
          <span className="imon-news-category">{field<string>(item,'category','Журнал')}</span>
          <div className="imon-news-image">{image&&<img src={image} loading="lazy" alt={title}/>}</div>
          <div className="imon-news-caption"><h3>{title}</h3><span aria-hidden="true">↗</span></div>
        </Link>
      })}</div>
    </section>
  </>
}
