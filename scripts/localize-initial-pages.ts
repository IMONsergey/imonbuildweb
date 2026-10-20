import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const translations: Record<string,string> = {
  '/work':'Проекты, в которых стратегия, дизайн и digital работают как одна система.',
  '/about':'Работаем в момент перехода — когда бизнесу нужна новая ясность, архитектура и целостная коммуникация.',
  '/news':'Мысли о бренде, продукте, коммуникации и цифровой среде.',
  '/contact':'Обсудим вашу задачу и найдём подходящий формат работы.',
}
const payload=await getPayload({config})
for(const [path,intro] of Object.entries(translations)){
  const {docs}=await payload.find({collection:'pages',where:{path:{equals:path}},limit:1,overrideAccess:true,depth:0,draft:true})
  const doc=docs[0]
  if(!doc)continue
  if(doc.intro===intro)continue
  if(doc.intro && !/^(A collection|Learn more|Craft|Let)/i.test(doc.intro))continue
  await payload.update({collection:'pages',id:doc.id,overrideAccess:true,data:{intro,_status:'published'}})
  console.log('Localized:',path)
}
process.exit(0)
