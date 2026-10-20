import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
const payload=await getPayload({config})
const {docs}=await payload.find({collection:'pages',where:{path:{equals:'/'}},limit:1,draft:true,depth:0,overrideAccess:true})
const doc=docs[0]
if(doc) {
  const expected=['/media/s73H06yUtYsHPUy8b7PFODE9SdE.mp4','/media/hero-desktop.mp4']
  if (!doc.heroVideo && (!doc.heroVideoPath || expected.includes(doc.heroVideoPath))) {
    await payload.update({collection:'pages',id:doc.id,overrideAccess:true,
      data:{heroVideoPath:'/media/hero-desktop.mp4', heroImagePath:'/media/hero-poster.jpg',_status:'published'}})
    console.log('Updated home video sources for mobile and desktop')
  } else {console.log('Keeping edited hero assets')}
}
process.exit(0)
