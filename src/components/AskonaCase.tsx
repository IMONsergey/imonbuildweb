import Link from 'next/link'
import { fieldProps } from '@/studio/model'
import { field, type ContentProject } from '@/lib/site'
import { askonaPresentation as story } from '@/lib/askonaPresentation'

// Art direction uses the original, unretouched project media. Screen lettering
// remains part of those assets; the case narrative is accessible document text.
const { phones, history, hand } = story

export function AskonaCase({ project }: { project: ContentProject }) {
  return <article className="askona-editorial" aria-labelledby="askona-title">
    <figure className="askona-opening" aria-label="Мобильная версия Askona Life Group">
      <img className="askona-opening__image" src={phones} width={1408} height={1774}
        alt="Два экрана Askona Life Group: миссия группы и направления бизнеса" fetchPriority="high" />
    </figure>
    <div className="askona-editorial__body">
      <header className="askona-heading" data-studio-node="hero" data-studio-path="hero">
        <h1 id="askona-title" {...fieldProps('title')}>{field(project, 'title', 'Askona Life Group')}</h1>
        <p><span>{story.type}</span><span aria-hidden="true"> · </span><span {...fieldProps('year')}>{field(project, 'year', '') || story.year}</span></p>
      </header>
      <section className="askona-pause" aria-labelledby="askona-task">
        <h2 id="askona-task">Задача</h2>
        <p>{story.task}</p>
      </section>
      <div className="askona-diptych">
        <figure className="askona-detail askona-detail--mission">
          <img src={phones} width={1408} height={1774} loading="lazy" alt="Миссия группы — сделать жизнь людей лучше" />
        </figure>
        <figure className="askona-detail askona-detail--business">
          <img src={phones} width={1408} height={1774} loading="lazy" alt="Единая мобильная навигация по направлениям бизнеса" />
        </figure>
      </div>
      <section className="askona-pause askona-pause--small" aria-labelledby="askona-system">
        <h2 id="askona-system">Система</h2>
        <p>{story.system}</p>
      </section>
      <figure className="askona-timeline">
        <img src={history} width={1920} height={1293} loading="lazy" alt="История компании на большом экране: хронология от 1990 года" />
      </figure>
      <figure className="askona-history-detail">
        <img className="askona-history-detail__desktop" src={history} width={1920} height={1293} loading="lazy" alt="" aria-hidden="true" />
        <img className="askona-history-detail__hand" src={hand} width={1553} height={1525} loading="lazy" alt="Та же история на телефоне: ключевые даты читаются по вертикали" />
      </figure>
      <footer className="askona-end">
        <p>{story.roles.join(' · ')}</p>
        <Link href="/cases/page">Следующий проект <span aria-hidden="true">→</span></Link>
      </footer>
    </div>
  </article>
}
