import { ArrowUpRight } from './ArrowUpRight'
import Link from 'next/link'
import { mediaPath } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'
import { nodeProps, fieldProps, isRecord, type RecordData } from '@/studio/model'

const text = (value: unknown) => typeof value === 'string' ? value : ''
const rows = (value: unknown): RecordData[] => Array.isArray(value) ? value.filter(isRecord) : []
export function AboutEditorial({ block, index, base = 'blocks' }: { block: DisplayBlock; index: number; base?: string }) {
  const data = block as unknown as RecordData, path = `${base}.${index}`
  const hero = mediaPath(data.heroImage, text(data.heroImagePath)), closing = mediaPath(data.closingImage, text(data.closingImagePath))
  const team = rows(data.team), values = rows(data.values), culture = rows(data.cultureItems), symbols = rows(data.symbols)
  return <div className="imon-about-editorial" {...nodeProps(block, index, base)}>
    <section className="imon-about-intro">
      {hero && <div className="imon-about-image" data-parallax-media {...fieldProps(path + '.heroImage')}><img src={hero} alt="Редакционная фотография пространства студии"/></div>}
      {!!data.statement && <div className="imon-about-statement"><span className="imon-about-icon" aria-hidden="true"><ArrowUpRight/></span><p data-animate="reveal" {...fieldProps(path + '.statement')}>{text(data.statement)}</p></div>}
      {!!values.length && <div className="imon-about-values"><span className="imon-about-kicker">(Наш подход)</span><div className="imon-about-values-list">{values.map((value, i) => <div key={String(value.id || i)} className="imon-about-value" data-animate="reveal"><span>{String(i + 1).padStart(2, '0')}</span><h3 {...fieldProps(`${path}.values.${i}.heading`)}>{text(value.heading)}</h3><p {...fieldProps(`${path}.values.${i}.body`)}>{text(value.body)}</p></div>)}</div></div>}
    </section>
    {!!team.length && <section className="imon-about-team"><div className="imon-about-team-title"><h2 data-tone-title {...fieldProps(path + '.teamTitle')}>{text(data.teamTitle)}</h2><span>(Люди и дисциплины)</span></div><p className="imon-about-team-intro" {...fieldProps(path + '.teamIntro')}>{text(data.teamIntro)}</p><div className="imon-about-portraits">{team.map((member, i) => {
      const image = mediaPath(member.portrait, text(member.portraitPath)), role = text(member.role)
      return <div key={String(member.id || i)} className="imon-about-portrait" data-photo-in><div className="imon-about-portrait-image" {...fieldProps(`${path}.team.${i}.portrait`)}>{image && <img src={image} loading="lazy" alt={'Иллюстративный портрет — ' + role}/>}</div><div className="imon-about-portrait-label"><span {...fieldProps(`${path}.team.${i}.${member.name ? 'name' : 'role'}`)}>{text(member.name) || role}</span><small>{String(i + 1).padStart(2, '0')}</small></div></div>
    })}</div></section>}
    {!!culture.length && <section className="imon-about-culture"><div className="imon-about-culture-title"><span>(Принципы команды)</span><h2 data-tone-title {...fieldProps(path + '.cultureTitle')}>{text(data.cultureTitle)}</h2></div><div className="imon-about-culture-content"><span>Что для нас важно</span><div className="imon-about-beliefs">{culture.map((item, i) => <div key={String(item.id || i)} className="imon-about-belief" data-animate="reveal"><small>({String(i + 1).padStart(2, '0')})</small><p {...fieldProps(`${path}.cultureItems.${i}.text`)}>{text(item.text)}</p></div>)}</div></div></section>}
    {!!symbols.length && <section className="imon-about-patterns"><div className="imon-about-patterns-title"><h2 data-tone-title {...fieldProps(path + '.symbolsTitle')}>{text(data.symbolsTitle)}</h2><span>(Графический язык)</span></div><div className="imon-about-patterns-grid">{symbols.map((item, i) => {
      const image = mediaPath(item.image, text(item.imagePath))
      return <div key={String(item.id || i)} className="imon-about-symbol" data-animate="reveal" {...fieldProps(`${path}.symbols.${i}.image`)}>{image && <img src={image} alt={text(item.alt)} loading="lazy"/>}</div>
    })}</div></section>}
    {closing && <section className="imon-about-endphoto" data-parallax-media {...fieldProps(path + '.closingImage')}><img src={closing} alt="Редакционная фотография студии" loading="lazy"/>{text(data.closingHref) && <Link href={text(data.closingHref)} className="imon-about-endphoto-cta">Обсудить проект <span><ArrowUpRight/></span></Link>}</section>}
  </div>
}
