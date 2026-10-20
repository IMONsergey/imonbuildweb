import Link from 'next/link'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { field, entityCover, siteArticles, siteProjects } from '@/lib/site'
import { HomeFaq, ServiceAccordion, type FaqEntry, type ServiceEntry } from './SiteMotion'

type Item = Record<string, unknown>
function str(item: Item|undefined, key: string, fallback=''): string {
  const value=item?.[key];return typeof value==='string'?value:fallback
}
function entries(block?: DisplayBlock): Item[] {
  return block?.items as Item[] || []
}

function EditorialStatement({heading,eyebrow,items,link,linkLabel,className=''}:{
  heading:string;eyebrow?:string;items:Item[];link?:string;linkLabel?:string;className?:string;
}) {
  return <section className={'imon-editorial-statement '+className}>
    <h2 data-tone-title>{heading}</h2>
    <div className="imon-statement-details">
      <span className="imon-statement-eyebrow">{eyebrow}</span>
      <div className="imon-statement-items">{items.map((item,i)=><div key={i} data-animate="reveal" className="imon-statement-item">
        <h3>{str(item,'heading')}</h3><p>{str(item,'body')}</p></div>)}</div>
      {link && <Link className="imon-statement-action" href={link}>{linkLabel} <span>↗</span></Link>}
    </div>
  </section>
}

export async function HomeSections({blocks}: {blocks:DisplayBlock[]}) {
  const texts=blocks.filter(b=>b.blockType==='text')
  const cards=blocks.filter(b=>b.blockType==='cards')
  const listings=blocks.filter(b=>b.blockType==='listing')
  const serviceBlock=blocks.find(b=>b.blockType==='services')
  const faqBlock=blocks.find(b=>b.blockType==='faq')
  const quote=blocks.find(b=>b.blockType==='quote')
  const projects=(await siteProjects()).filter(x=>field(x,'sourcePath',field(x,'path','')).startsWith('/work/')).slice(0,4)
  const articles=(await siteArticles()).slice(0,4)
  const features:ServiceEntry[]=entries(serviceBlock).map((item,i)=>({
    number:str(item,'number',String(i+1).padStart(2,'0')),
    title:str(item,'title'),
    description:str(item,'description'),
    details:str(item,'details'),
    imagePath:str(item,'imagePath'),
  }))
  const faqs:FaqEntry[]=entries(faqBlock).map(item=>({question:str(item,'question'),answer:str(item,'answer')}))
  return <>
    <EditorialStatement className="imon-home-intro" heading={texts[0]?.heading||'Развиваем бизнес через бренд'}
      eyebrow={texts[0]?.eyebrow||'(Стратегический партнёр)'} items={entries(cards[0])} link="/about" linkLabel="Больше о I’MON"/>

    <section className="imon-home-featured">
      <div className="imon-section-title"><h2 data-tone-title>{listings[0]?.heading||'Проекты'}</h2><span>{listings[0]?.eyebrow||'(Избранные работы)'}</span></div>
      <div className="imon-home-work-grid">
        {projects.map((project,i)=> {
          const title=field(project,'title','Проект')
          const href=field(project,'sourcePath',field(project,'path','/work'))
          const image=entityCover(project)
          return <Link href={href} key={href} className="imon-featured-card" data-photo-in>
            <div className="imon-featured-caption"><strong>{title}</strong><span>{field(project,'category','Branding, Digital')}</span></div>
            <div className="imon-featured-image">{image&&<img alt={title} src={image} loading={i<2?'eager':'lazy'} />}<div className="imon-featured-arrow">↗</div></div>
          </Link>
        })}
      </div>
      <div className="imon-featured-bottom"><Link href="/work">Все проекты <span>↗</span></Link></div>
    </section>

    {serviceBlock && <section className="imon-home-services">
      <div className="imon-section-title"><h2 data-tone-title>{serviceBlock.heading||'Направления'}</h2><span>{serviceBlock.eyebrow||'(Что мы делаем)'}</span></div>
      <ServiceAccordion items={features}/>
    </section>}

    {texts[1] && <EditorialStatement className="imon-home-when" heading={texts[1].heading||''}
      eyebrow={texts[1].eyebrow||'(Когда мы нужны)'} items={entries(cards[1])} link="/contact" linkLabel="Обсудить задачу"/>}

    <section className="imon-home-approach">
      <h2 className="visually-hidden">{texts[2]?.heading||'Бренд, продукт и digital должны расти как одна система'}</h2>
      <div className="imon-approach-photo" data-parallax-media><img src="/media/DDl0EjwOEkxHuZ85FQpANj3vooE.png" alt="Визуальная метафора целостного подхода к бренду и digital"/></div>
      <div className="imon-approach-statistics"><span className="imon-approach-overline">{texts[2]?.eyebrow||'(Основа подхода)'}</span>
        {entries(cards[2]).slice(0,3).map((item,i)=><div className="imon-stat" key={i}>
          <span>{String(i+1).padStart(2,'0')}</span><p>{str(item,'heading')}</p>
          <div className="imon-stat-mark" aria-hidden="true"><i/><i/><i/></div>
        </div>)}
      </div>
    </section>

    {quote && <section className="imon-home-principle">
      <div className="imon-section-title"><h2 data-tone-title>Принцип</h2><span>{quote.eyebrow||'(Как мы работаем)'}</span></div>
      <div className="imon-principle-lower"><div className="imon-principle-decor"><span>↗</span><span>I’MON</span></div>
        <div className="imon-principle-quote" data-animate="reveal"><blockquote>{quote.quote?.replace(/^[“"]|[”"]$/g,'')}</blockquote><p>{quote.attribution||'I’MON · Стратегический партнёр'}</p></div>
      </div>
    </section>}

    <section className="imon-home-faq">
      <div className="imon-section-title"><span>{'(Вопросы о работе)'}</span><h2 data-tone-title>{faqBlock?.heading||'FAQ'}</h2></div>
      <div className="imon-faq-content"><div className="imon-faq-contact"><p>Остались вопросы? Обсудим задачу</p><Link href="/contact">Связаться ↗</Link></div><HomeFaq items={faqs} /></div>
    </section>

    <section className="imon-home-magazine">
      <div className="imon-section-title"><h2 data-tone-title>{listings[1]?.heading||'I’MON Magazine'}</h2><span>{listings[1]?.eyebrow||'(Мы говорим)'}</span></div>
      <div className="imon-magazine-grid">
        {articles.map((article,i)=>{const title=field(article,'title','Журнал');const image=entityCover(article);const slug=field(article,'slug','')
          return <Link href={'/news/'+slug.replace(/^news\//,'')} key={slug} className="imon-magazine-card" data-photo-in>
            <span className="imon-magazine-category">{field(article,'category','Журнал')}</span>
            <div className="imon-magazine-image">{image&&<img src={image} alt={title} loading="lazy"/>}</div>
            <h3>{title}</h3><span className="imon-magazine-arrow">↗</span>
          </Link>})}
      </div>
      <Link className="imon-all-articles" href="/news">Все публикации <span>↗</span></Link>
    </section>
  </>
}
