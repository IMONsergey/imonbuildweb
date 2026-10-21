import { ArrowIcon } from './ArrowIcon'
import { LeadForm } from './Interactive'
import { mediaPath, siteSettings } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { nodeProps, fieldProps, type RecordData } from '@/studio/model'
import { Blocks } from './Blocks'

export async function ContactSections({ blocks }: { blocks: DisplayBlock[] }) {
  const { settings } = await siteSettings()
  const sections = []
  let contactPrinted = false
  for (const [index, block] of blocks.entries()) {
    const path = `blocks.${index}`
    if (block.blockType === 'gallery') {
      sections.push(<section className="imon-contact-photos" key={block.id || index} {...nodeProps(block, index)}>
        {(block.items || []).map((item: RecordData, imageIndex) => {
          const image = mediaPath(item.media, typeof item.src === 'string' ? item.src : '')
          return image && <div className="imon-contact-photo" data-photo-in key={String(item.id || imageIndex)} {...fieldProps(`${path}.items.${imageIndex}.media`)}><img src={image} alt={typeof item.caption === 'string' ? item.caption : 'Иллюстрация пространства студии'} loading={index === 0 ? 'eager' : 'lazy'}/></div>
        })}
      </section>)
    } else if (block.blockType === 'contact') {
      if (!contactPrinted) sections.push(<section className="imon-contact-information" key="contact-information">
        {settings.email && <div className="imon-contact-type"><span>Для бизнеса</span><a href={'mailto:' + settings.email}>{settings.email} <ArrowIcon/></a></div>}
        {settings.telegram && <div className="imon-contact-type"><span>Telegram</span><a href={settings.telegram} rel="noreferrer noopener" target="_blank">{settings.telegram.replace(/^https:\/\/t.me\//, '@')} <ArrowIcon/></a></div>}
      </section>)
      contactPrinted = true
      sections.push(<section className="imon-contact-form-access" key={block.id || index} {...nodeProps(block, index)}>
        {block.showForm !== false ? <details className="imon-contact-form-details"><summary><span {...fieldProps(path + '.heading')}>{block.heading || 'Расскажите о задаче'}</span><i aria-hidden="true">+</i></summary><div className="imon-contact-form-inner"><p {...fieldProps(path + '.intro')}>{block.intro}</p><LeadForm/></div></details> : <div className="imon-contact-form-inner"><h2 {...fieldProps(path + '.heading')}>{block.heading}</h2><p {...fieldProps(path + '.intro')}>{block.intro}</p></div>}
      </section>)
    } else sections.push(<Blocks key={block.id || index} blocks={[block]} offset={index}/>)
  }
  return <div className="imon-contact-editorial">{sections}</div>
}
