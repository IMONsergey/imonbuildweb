import Link from 'next/link'
import { siteArticles, originalArticles, field, entityCover } from '@/lib/site'

export async function NewsSections() {
  const documents = await siteArticles()
  const order = new Map(originalArticles.map((item, index) => [item.slug.replace(/^news\//, ''), index]))
  const articles = [...documents].sort((a,b)=>{
    const first=order.get(field<string>(a,'slug','')) ?? 999
    const second=order.get(field<string>(b,'slug','')) ?? 999
    return first-second
  })
  return <section className="imon-news-index">
    <div className="imon-news-grid">
      {articles.map((article,i)=>{
        const slug=field<string>(article,'slug','').replace(/^news\//,'')
        const href='/news/'+slug
        const title=field<string>(article,'title','Журнал')
        const img=entityCover(article)
        return <Link className="imon-news-card" data-photo-in href={href} key={slug||String(i)}>
          <span className="imon-news-category">{field<string>(article,'category','Журнал')}</span>
          <div className="imon-news-image">{img&&<img src={img} alt={title} loading={i<4?'eager':'lazy'} />}</div>
          <div className="imon-news-caption"><h2>{title}</h2><span aria-hidden="true">↗</span></div>
        </Link>
      })}
    </div>
  </section>
}
