import 'dotenv/config'
import { basename } from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import stories from '../src/content/caseStories.json'
import source from '../src/content/source.json'

type Story = { blocks: Array<Record<string,unknown>>; length: number; mediaCount: number }
const publish = process.argv.includes('--publish-local-preview')
if (publish && basename(process.cwd()) !== 'imonbuildweb-studio') throw new Error('Direct preview publishing is restricted to the isolated Studio worktree')
const payload = await getPayload({config})
for (const [route,story] of Object.entries(stories as Record<string,Story>)) {
  const {docs} = await payload.find({collection:'projects',where:{sourcePath:{equals:route}},depth:0,limit:1,overrideAccess:true,draft:true})
  const original = docs[0]
  if (!original) throw new Error('Case missing from CMS: '+route)
  const current = original.sections || []
  const customDesign = original.studio as {nodes?:Record<string,unknown>} | null
  if (customDesign?.nodes && Object.keys(customDesign.nodes).length) throw new Error('Case has Studio overrides; automatic narrative replacement refused: '+route)
  const raw = source.find(page => page.path === route)
  const texts = raw?.texts || []
  const next = (label:string) => texts[texts.indexOf(label)+1]
  const year = /^\d{4}$/.test(next('Год')||'') ? next('Год') : original.year
  const category = raw?.category || original.category
  const blocks = [...story.blocks]
  if (route === '/cases/askona-life-group') {
    const duplicate = blocks.findIndex(block => block.blockType==='visual' && typeof block.src==='string' && block.src.includes('FFN0jZcyJMA4Z1LOoQu3bTkaXuM.jpg'))
    if (duplicate !== -1) blocks.splice(duplicate,1)
  }
  if (!blocks.some(block => block.blockType === 'listing')) blocks.push({blockType:'listing',kind:'projects',heading:'Другие проекты',limit:2})
  const withoutIDs = (value:unknown):unknown => Array.isArray(value) ? value.map(withoutIDs) : value && typeof value==='object' ? Object.fromEntries(Object.entries(value).filter(([key,value])=>key!=='id'&&key!=='blockName'&&value!==null&&value!==undefined).map(([key,value])=>[key,withoutIDs(value)])) : value
  if (JSON.stringify(withoutIDs(current)) === JSON.stringify(withoutIDs(blocks)) && original.year === year && original.category === category) {
    console.log('Keeping migrated case:',route); continue
  }
  await payload.update({collection:'projects',id:original.id,overrideAccess:true,draft:!publish,data:{
    sections:blocks as never,
    year:original.year || year,
    category:!original.category || original.category === 'Brand, Digital' ? category : original.category,
    _status:publish?'published':'draft',
  }})
  console.log('Source narrative restored:',route,'blocks:',blocks.length,'mode:',publish?'isolated preview':'draft')
}
process.exit(0)
