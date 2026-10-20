import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const cms=await getPayload({config})
for(const name of ['users','pages','projects','articles','media','leads'] as const) {
  const result=await cms.count({collection:name,overrideAccess:true})
  console.log(name.padEnd(10),result.totalDocs)
}
const home=await cms.find({collection:'pages',where:{path:{equals:'/'}},overrideAccess:true,limit:1})
console.log('HOME:',home.docs[0]?.heroTitle)
const drafts=await cms.find({collection:'articles',where:{_status:{equals:'draft'}},overrideAccess:true,limit:100,draft:true})
console.log('ARTICLE DRAFTS:',drafts.docs.length)
process.exit(0)
