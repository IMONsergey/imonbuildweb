import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import source from '../src/content/source.json'
import { defaultBlocks } from '../src/lib/defaultBlocks'
import type { OriginalPage } from '../src/lib/site'

type SeedPage = OriginalPage
const pages = source as SeedPage[]
const payload = await getPayload({ config })

async function exists(collection: 'pages' | 'projects' | 'articles', field: string, value: string) {
  const found = await payload.find({ collection, where: { [field]: { equals: value } }, limit: 1, overrideAccess: true, draft: true })
  return found.totalDocs > 0
}

let inserted = 0
for (const page of pages) {
  const blocks = defaultBlocks(page)
  if (['home','about','work','news','contact','legal'].includes(page.kind)) {
    if(await exists('pages','path',page.path)) { console.log('Keep existing page:', page.path); continue }
    await payload.create({
      collection:'pages', overrideAccess:true,
      data: {
        path:page.path, title:page.title, kind:page.kind as 'home'|'about'|'work'|'news'|'contact'|'legal',
        intro:page.kind==='home' ? page.texts[2]
          : page.kind==='work' ? 'Проекты, в которых стратегия, дизайн и digital работают как одна система.'
          : page.kind==='about' ? 'Работаем в момент перехода — когда бизнесу нужна новая ясность, архитектура и целостная коммуникация.'
          : page.kind==='news' ? 'Мысли о бренде, продукте, коммуникации и цифровой среде.'
          : page.kind==='contact' ? 'Обсудим вашу задачу и найдём подходящий формат работы.'
          : page.intro,
        heroTitle:page.kind==='home' ? page.texts[0] : undefined,
        heroVideoPath:page.kind==='home' ? '/media/hero-desktop.mp4' : undefined,
        blocks:blocks as never,
        seo: {
          title:page.kind==='home'?'Бренд, продукт и digital — как единая система':page.title,
          description:page.kind==='home'?page.texts[2]:page.intro,
          noindex:page.kind==='legal',
        },
        _status:'published',
      },
    })
    inserted++
    continue
  }
  if (page.kind==='case') {
    const slug=page.path.split('/').pop()!
    const portfolio = ['/cases/askona-life-group', '/cases/page'].includes(page.path)
    if(await exists('projects','sourcePath',page.path)) { console.log('Keep existing case:', page.path); continue }
    await payload.create({
      collection:'projects', overrideAccess:true,
      data: {
        slug, sourcePath:page.path, title:page.title, summary:page.intro,
        client: page.path.startsWith('/cases/askona')?'Askona Life Group':page.path==='/cases/page'?'GAC M8':undefined,
        year:page.year || '',
        category:page.category || 'Brand, Digital',
        portfolioStatus: portfolio ? 'portfolio' : 'archive',
        order:page.path==='/cases/askona-life-group' ? 0 : page.path==='/cases/page' ? 1 : 100+inserted,
        coverPath:page.cover || page.images[0] || '',
        sections:blocks as never,
        seoDescription:page.intro,
        _status:portfolio ? 'published' : 'draft',
      },
    })
    inserted++
    continue
  }
  if (page.kind==='article') {
    const slug=page.path.split('/').pop()!
    if(await exists('articles','slug',slug)) { console.log('Keep existing article:',slug); continue }
    await payload.create({
      collection:'articles', overrideAccess:true,
      data:{
        slug, title:page.title, excerpt:page.intro, category:page.category||'Журнал',
        publishedAt:page.date?new Date(page.date).toISOString():undefined,
        coverPath:page.cover||page.images[0]||'',
        sections:blocks as never,
        seoDescription:page.intro,
        editorialReviewed: false,
        // Imported material remains searchable only after editorial approval.
        _status:'published',
      },
    })
    inserted++
  }
}
const navigation=await payload.findGlobal({ slug:'navigation', overrideAccess:true })
if (!navigation.links?.length) await payload.updateGlobal({
  slug:'navigation', overrideAccess:true,
  data:{ ctaText:'Связаться',ctaHref:'/contact',links:[
    {label:'О нас',href:'/about'},
    {label:'Проекты',href:'/work'},
    {label:'Журнал',href:'/news'},
  ]},
})
const settings=await payload.findGlobal({slug:'site-settings',overrideAccess:true})
if (!settings.email) await payload.updateGlobal({
  slug:'site-settings',overrideAccess:true,
  data:{brand:'I’MON',email:'info@imon.agency',telegram:'https://t.me/imonagency',footerMessage:'Обсудим следующий уровень вашего бизнеса'},
})
console.log('Seed done. New docs:', inserted)
process.exit(0)
