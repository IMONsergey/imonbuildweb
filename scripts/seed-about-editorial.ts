import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'
import { originalPage } from '../src/lib/site'

const payload=await getPayload({config})
const page=originalPage('/about')
if(!page)throw new Error('Owned source About snapshot missing')
const {docs}=await payload.find({collection:'pages',limit:1,depth:0,draft:true,overrideAccess:true,where:{path:{equals:'/about'}}})
const about=docs[0]
if(!about)throw new Error('About page missing in CMS')
const blocks=about.blocks||[]
if(blocks.some(b=>b.blockType==='aboutEditorial')){
 console.log('Editable about layout already present; preserving content changes')
 process.exit(0)
}
const roles=['Стратегия','Арт-дирекшн','Дизайн','Разработка','Исследования','UX/UI','Контент','Motion']
const valueTexts=[
 'Начинаем с задачи бизнеса и контекста, а не с готовой визуальной идеи.',
 'Проверяем логику и последствия каждого решения для всей системы.',
 'Работаем на равных с командой клиента — обсуждаем, спорим, фиксируем решения.',
 'Передаём не только результат, но и понятную систему для дальнейшего развития.',
]
const block={
 blockType:'aboutEditorial',
 heroImagePath:page.images[0],
 statement:'I’MON помогает компаниям соединять бренд, продукт и digital в одну понятную и управляемую систему.',
 teamTitle:'Команда',
 teamIntro:'Объединяем стратегию, дизайн, разработку и коммуникацию. Экспертиза подключается к задаче, а не существует отдельно от неё.',
 team:page.images.slice(1,9).map((portraitPath,i)=>({portraitPath,role:roles[i]})),
 cultureTitle:'Culture',
 cultureItems:valueTexts.map(text=>({text})),
 symbolsTitle:'Контекст',
 symbols:page.images.slice(9,17).map((imagePath,i)=>({imagePath,alt:'Графический элемент '+(i+1)})),
 closingImagePath:page.images[17],
 closingHref:'/contact',
} as const
await payload.update({collection:'pages',id:about.id,overrideAccess:true,
 data:{blocks:[...blocks,block] as never,_status:'published'}})
console.log('About editorial fields migrated without modifying existing blocks')
process.exit(0)
