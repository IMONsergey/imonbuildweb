import 'dotenv/config'
import { basename } from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import source from '../src/content/source.json'

const localPublish = process.argv.includes('--publish-local-preview')
if (localPublish && basename(process.cwd()) !== 'imonbuildweb-studio') throw new Error('Preview publishing is restricted to the isolated Studio worktree')
const payload = await getPayload({ config })
const result = await payload.find({ collection:'pages', where:{path:{equals:'/about'}}, limit:1, depth:0, draft:true, overrideAccess:true })
const page = result.docs[0], original = source.find(page => page.path === '/about')
if (!page || !original) throw new Error('About content is missing')
if (page.blocks?.some(block => block.blockType === 'aboutEditorial')) { console.log('About content already migrated; keeping all edits'); process.exit(0) }
const existing = page.blocks || []
if (existing.some(block => !['text','cards','cta'].includes(block.blockType))) throw new Error('About contains custom sections. Automatic migration refused; use Studio to arrange them.')
const values = existing.find(block => block.blockType === 'cards')
const textBlock = existing.find(block => block.blockType === 'text')
const roles = ['Стратегия','Арт-дирекшн','Дизайн','Разработка','Исследования','UX/UI','Контент','Motion']
const editorial = {
  blockType:'aboutEditorial',blockName:'О студии — редакционная композиция',
  heroImagePath:original.images[0],
  statement:textBlock?.body || 'I’MON помогает компаниям соединять бренд, продукт и digital в одну понятную и управляемую систему.',
  values:values?.items?.map(item => ({heading:item.heading,body:item.body})) || [],
  teamTitle:'Команда',teamIntro:'Объединяем стратегию, дизайн, разработку и коммуникацию. Экспертиза подключается к задаче, а не существует отдельно от неё.',
  team:original.images.slice(1,9).map((portraitPath,index) => ({portraitPath,role:roles[index]})),
  cultureTitle:'Culture',cultureItems:[
    {text:'Начинаем с задачи бизнеса и контекста, а не с готовой визуальной идеи.'},
    {text:'Проверяем логику и последствия каждого решения для всей системы.'},
    {text:'Работаем на равных с командой клиента — обсуждаем, спорим, фиксируем решения.'},
    {text:'Передаём не только результат, но и понятную систему для дальнейшего развития.'},
  ],symbolsTitle:'Контекст',symbols:original.images.slice(9,17).map((imagePath,index) => ({imagePath,alt:'Графический элемент '+(index+1)})),
  closingImagePath:original.images[17],closingHref:'/contact',
}
await payload.update({collection:'pages',id:page.id,overrideAccess:true,draft:!localPublish,data:{blocks:[editorial,...existing.filter(block => block.blockType==='cta')] as never,_status:localPublish?'published':'draft'}})
console.log('About migrated to one editable composite plus existing CTA. Previous layout remains in document versions. Mode:',localPublish?'isolated preview publication':'draft')
process.exit(0)
