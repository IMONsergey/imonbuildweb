import Link from 'next/link'
import { CaseMedia } from './CaseMedia'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { siteProjects, field, entityCover, mediaPath } from '@/lib/site'

type Row = Record<string, unknown>
const text=(r:Row|undefined,key:string)=>typeof r?.[key]==='string'?r[key] as string:''
const src=(r:Row|undefined)=>{
  if(!r)return ''
  return mediaPath(r.media,text(r,'src'))||text(r,'src')
}

export async function CaseBlocks({ blocks }: { blocks: DisplayBlock[] }) {
  const nodes = []
  for (const [index, block] of blocks.entries()){
    const row=block as unknown as Row
    if(block.blockType==='text')nodes.push(<section key={index} className="case-story-copy" data-animate="reveal">
      {block.heading && <h2>{block.heading}</h2>}
      {block.body && <p>{block.body}</p>}
    </section>)
    else if(block.blockType==='visual') {
      const path=src(row)
      nodes.push(<section key={index} className={'case-story-visual case-story-visual--'+(block.display||'full')}>
        <CaseMedia src={path} alt={block.caption || 'Визуальный материал проекта'} />
      </section>)
    } else if(block.blockType==='gallery') {
      const items=(Array.isArray(block.items)?block.items:[]) as Row[]
      nodes.push(<section key={index} className="case-story-gallery" data-count={items.length}>
        {items.map((item,i)=><CaseMedia key={i} src={src(item)} alt={text(item,'caption')||'Деталь проекта '+(i+1)} />)}
      </section>)
    } else if (block.blockType==='cards') {
      nodes.push(<section key={index} className={'case-story-cards '+((block.items||[]).length>3?'case-story-cards--palette':'')}>
        {(block.items||[]).map((it,i)=><div key={i} className="case-story-card">
          <span>{text(it,'heading')||String(i+1).padStart(2,'0')}</span>
          <p>{text(it,'body')}</p></div>)}
      </section>)
    } else if(block.blockType==='listing') {
      const projects=(await siteProjects()).slice(1,3)
      nodes.push(<section className="case-related" key={index}>
        <div className="case-related-title"><h2>{block.heading||'Другие проекты'}</h2><span>(Смотреть дальше)</span></div>
        <div className="case-related-items">{projects.map(p=>{
          const href=field(p,'sourcePath',field(p,'path','/work'))
          return <Link key={href} href={href} className="case-related-link">
            <div className="case-related-label"><strong>{field(p,'title','Проект')}</strong><span>{field(p,'category','')}</span></div>
            {entityCover(p) && <div className="case-related-image"><img src={entityCover(p)} alt={field(p,'title','Проект')}/></div>}
          </Link>
        })}</div>
      </section>)
    }
  }
  return <div className="case-story-content">{nodes}</div>
}
