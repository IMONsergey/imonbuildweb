import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import stories from '../src/content/caseStories.json'

type Story = { blocks: Array<Record<string,unknown>>; length: number; mediaCount: number }
const payload=await getPayload({config})
for(const [route,story] of Object.entries(stories as Record<string,Story>)){
  const {docs}=await payload.find({
    collection:'projects',where:{sourcePath:{equals:route}},depth:0,limit:1,overrideAccess:true,draft:true,
  })
  const original=docs[0]
  if(!original)throw new Error('Case missing from CMS: '+route)
  // Only reorder the visual narrative. Client/name, metadata, SEO and drafts remain unchanged.
  const blocks=[...story.blocks]
  if(route==='/cases/askona-life-group') {
    const duplicate=blocks.findIndex(b=>b.blockType==='visual' && typeof b.src==='string' && b.src.includes('FFN0jZcyJMA4Z1LOoQu3bTkaXuM.jpg'))
    if(duplicate!==-1)blocks.splice(duplicate,1)
  }
  blocks.push({blockType:'listing',kind:'projects',heading:'Другие проекты',limit:2})
  await payload.update({
    collection:'projects',id:original.id,overrideAccess:true,
    data:{sections:blocks as never,_status:'published'},
  })
  console.log('SAVED',route,'media',story.mediaCount,'blocks',blocks.length)
}
process.exit(0)
