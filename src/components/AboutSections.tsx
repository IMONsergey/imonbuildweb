import Link from 'next/link'
import { originalPage, mediaPath } from '@/lib/site'
import type { DisplayBlock } from '@/lib/defaultBlocks'

type Row = Record<string, unknown>
const roles=['Стратегия','Арт-дирекшн','Дизайн','Разработка','Исследования','UX/UI','Контент','Motion']
const culture=[
  'Начинаем с задачи бизнеса и контекста, а не с готовой визуальной идеи.',
  'Проверяем логику и последствия каждого решения для всей системы.',
  'Работаем на равных с командой клиента — обсуждаем, спорим, фиксируем решения.',
  'Передаём не только результат, но и понятную систему для дальнейшего развития.',
]
const str=(value:unknown,fallback='')=>typeof value==='string'?value:fallback
const array=(value:unknown):Row[]=>Array.isArray(value)?value as Row[]:[]
const upload=(asset:unknown,source:string)=>mediaPath(asset,source)||source

export function AboutSections({blocks}:{blocks:DisplayBlock[]}) {
  const source=originalPage('/about')
  const assets=source?.images||[]
  const editable=blocks.find(item=>item.blockType==='aboutEditorial') as unknown as Row | undefined
  const statement=str(editable?.statement,'I’MON помогает компаниям соединять бренд, продукт и digital в одну понятную и управляемую систему.')
  const heroImage=upload(editable?.heroImage,str(editable?.heroImagePath,assets[0]||''))
  const closingImage=upload(editable?.closingImage,str(editable?.closingImagePath,assets[17]||''))
  const teamFallback:Row[]=assets.slice(1,9).map((src,i)=>({portraitPath:src,role:roles[i]}))
  const team=array(editable?.team).length?array(editable?.team):teamFallback
  const symbolFallback:Row[]=assets.slice(9,17).map((src,i)=>({imagePath:src,alt:'Графический элемент '+(i+1)}))
  const symbols=array(editable?.symbols).length?array(editable?.symbols):symbolFallback
  const cultureItems=array(editable?.cultureItems).length?array(editable?.cultureItems).map(item=>str(item.text)).filter(Boolean):culture
  const cards=blocks.find(block=>block.blockType==='cards')
  const valueCards=Array.isArray(cards?.items)?cards.items as Row[]:[]
  const names=valueCards.length?valueCards:[
    {heading:'Ясность',body:'У каждого решения есть цель и критерий результата.'},
    {heading:'Человеческий контакт',body:'Совместное обсуждение приводит к работающим решениям.'},
    {heading:'Системность',body:'Каждый элемент поддерживает общую архитектуру.'},
  ]
  return <>
    <section className="imon-about-intro">
      <div className="imon-about-image" data-parallax-media>{heroImage&&<img src={heroImage} alt="Редакционная фотография команды в работе"/>}</div>
      <div className="imon-about-statement">
        <span className="imon-about-icon" aria-hidden="true">↗</span>
        <p data-animate="reveal">{statement}</p>
      </div>
      <div className="imon-about-values">
        <span className="imon-about-kicker">(Наш подход)</span>
        <div className="imon-about-values-list">{names.slice(0,4).map((item,i)=><div key={i} className="imon-about-value" data-animate="reveal">
          <span>{String(i+1).padStart(2,'0')}</span><h3>{str(item.heading,'Принцип')}</h3><p>{str(item.body)}</p>
        </div>)}</div>
      </div>
    </section>
    <section className="imon-about-team">
      <div className="imon-about-team-title"><h2 data-tone-title>{str(editable?.teamTitle,'Команда')}</h2><span>(Люди и дисциплины)</span></div>
      <p className="imon-about-team-intro">{str(editable?.teamIntro,'Объединяем стратегию, дизайн, разработку и коммуникацию. Экспертиза подключается к задаче, а не существует отдельно от неё.')}</p>
      <div className="imon-about-portraits">
        {team.map((item,i)=>{
          const role=str(item.role,roles[i%roles.length])
          const picture=upload(item.portrait,str(item.portraitPath,assets[i+1]||''))
          return <div className="imon-about-portrait" key={picture+'-'+i} data-photo-in>
            <div className="imon-about-portrait-image">{picture&&<img src={picture} loading="lazy" alt={'Иллюстративный портрет / '+role}/>}</div>
            <div className="imon-about-portrait-label"><span>{str(item.name,role)}</span><small>{String(i+1).padStart(2,'0')}</small></div>
          </div>
        })}
      </div>
    </section>
    <section className="imon-about-culture">
      <div className="imon-about-culture-title"><span>(Принципы команды)</span><h2 data-tone-title>{str(editable?.cultureTitle,'Culture')}</h2></div>
      <div className="imon-about-culture-content"><span>Что для нас важно</span><div className="imon-about-beliefs">
        {cultureItems.map((value,i)=><div key={i} className="imon-about-belief" data-animate="reveal"><small>({String(i+1).padStart(2,'0')})</small><p>{value}</p></div>)}
      </div></div>
    </section>
    <section className="imon-about-patterns">
      <div className="imon-about-patterns-title"><h2 data-tone-title>{str(editable?.symbolsTitle,'Контекст')}</h2><span>(Графический язык)</span></div>
      <div className="imon-about-patterns-grid">{symbols.map((item,i)=>{
        const picture=upload(item.image,str(item.imagePath,assets[i+9]||''))
        return <div key={picture+'-'+i} className="imon-about-symbol" data-animate="reveal">
          {picture&&<img src={picture} alt={str(item.alt,'Графический элемент '+(i+1))} loading="lazy"/>}
        </div>
      })}</div>
    </section>
    <section className="imon-about-endphoto" data-parallax-media>
      {closingImage&&<img src={closingImage} alt="Заключительная фотография раздела о студии" loading="lazy"/>}
      <Link href={str(editable?.closingHref,'/contact')} className="imon-about-endphoto-cta">Обсудить проект <span>↗</span></Link>
    </section>
  </>
}
