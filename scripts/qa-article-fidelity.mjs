import { chromium } from '@playwright/test'
import {mkdir,writeFile} from 'node:fs/promises'
const routes=['/news/designing-with-intention-how-clarity-shapes-digital-experiences']
const targets={source:'https://fantastic-future-931954.framer.app',local:'http://127.0.0.1:3120'}
const browser=await chromium.launch({channel:'chrome',headless:true})
const out='audit/parity-20261021/article'
await mkdir(out,{recursive:true})
const rows=[]
try {
 for(const width of [390,1440]){
   for (const [name,base] of Object.entries(targets)){
     const p=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'no-preference'})
     const route=routes[0], url=base+route
     await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000})
     await p.evaluate(()=>document.fonts.ready)
     await p.waitForTimeout(600)
     const result=await p.evaluate(()=>{
       const metrics=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {t:(e.textContent||'').slice(0,100),x:+r.x.toFixed(1),y:+(r.y+scrollY).toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,color:s.color}}
       return {height:document.documentElement.scrollHeight,h1:[...document.querySelectorAll('h1')].map(metrics),h2:[...document.querySelectorAll('h2')].slice(0,10).map(metrics),images:[...document.querySelectorAll('img')].slice(0,10).map(metrics),sections:[...document.querySelectorAll('section')].slice(0,8).map(metrics)}
     })
     rows.push({name,width,...result})
     await p.screenshot({path:out+'/'+width+'-'+name+'-top.png'})
     await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight*.5,behavior:'instant'}))
     await p.waitForTimeout(900)
     await p.screenshot({path:out+'/'+width+'-'+name+'-middle.png'})
     console.log('ARTICLE',name,width,JSON.stringify(result).slice(0,2200))
     await p.close()
   }
 }
}finally{await writeFile(out+'/metrics.json',JSON.stringify(rows,null,2));await browser.close()}
