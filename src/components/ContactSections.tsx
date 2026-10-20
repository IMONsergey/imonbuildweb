import { LeadForm } from './Interactive'
import { originalPage, mediaPath } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'

type Item=Record<string,unknown>
function uploaded(item:Item, fallback:string) {
  const media=item.media
  const src=typeof item.src==='string'?item.src:fallback
  return mediaPath(media,src)||fallback
}

export function ContactSections({ blocks }: { blocks:DisplayBlock[] }) {
  const source=originalPage('/contact')
  const gallery=blocks.find(b=>b.blockType==='gallery')
  const items=Array.isArray(gallery?.items)?gallery.items as Item[]:[]
  const images=[0,1].map(i=>uploaded(items[i]||{},source?.images[i]||''))
  const contact=blocks.find(b=>b.blockType==='contact')
  return <section className="imon-contact-editorial">
    <div className="imon-contact-photos">
      {images.map((img,i)=><div className="imon-contact-photo" data-photo-in key={img||i}>
        {img&&<img src={img} alt={i===0?'Пространство для стратегических встреч':'Пространство для творческой работы'} loading="eager"/>}
      </div>)}
    </div>
    <div className="imon-contact-information">
      <div className="imon-contact-type"><span>Для бизнеса</span><a href="mailto:info@imon.agency">info@imon.agency ↗</a></div>
      <div className="imon-contact-type"><span>Telegram</span><a href="https://t.me/imonagency" rel="noreferrer noopener" target="_blank">@imonagency ↗</a></div>
    </div>
    <div className="imon-contact-form-access">
      <details className="imon-contact-form-details">
        <summary><span>{contact?.heading||'Расскажите о задаче'}</span><i aria-hidden="true">+</i></summary>
        <div className="imon-contact-form-inner">
          <p>{contact?.intro||'Опишите вашу ситуацию — обсудим, как можем помочь.'}</p>
          <LeadForm/>
        </div>
      </details>
    </div>
  </section>
}
