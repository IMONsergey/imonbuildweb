import { chromium } from '@playwright/test'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
const base=process.env.STUDIO_TEST_URL || 'http://127.0.0.1:3120'
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))throw new Error('Local audit only')
const source=JSON.parse(await readFile('src/content/source.json','utf8'))
const routes=source.map(item=>item.path)
const browser=await chromium.launch({channel:'chrome',headless:true})
await mkdir('audit/routes',{recursive:true})
const records=[]
try{
 for(const width of [1440,768,390]){
  const context=await browser.newContext({viewport:{width,height:900}})
  const page=await context.newPage()
  for(const route of routes){
   const errors=[];const external=[]
   const onError=e=>errors.push(e.message)
   const onRequest=r=>{const url=new URL(r.url());if(!['127.0.0.1','localhost'].includes(url.hostname)&&!r.url().startsWith('data:'))external.push(url.hostname)}
   page.on('pageerror',onError);page.on('request',onRequest)
   try{
    const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000})
    await page.evaluate(()=>document.fonts.ready)
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight))
    await page.waitForTimeout(300)
    await page.evaluate(()=>window.scrollTo(0,0))
    await page.waitForTimeout(300)
    const result=await page.evaluate(()=>{
      const clipping=[]
      for(const element of document.querySelectorAll('h1,h2,h3,p,button')){
        const style=getComputedStyle(element),rect=element.getBoundingClientRect()
        if(!rect.width||!rect.height||style.visibility==='hidden'||element.closest('[inert],.visually-hidden,.sr-only'))continue
        const range=document.createRange();range.selectNodeContents(element);const text=range.getBoundingClientRect()
        if(rect.left < -3 || rect.right > innerWidth+3 || text.right>innerWidth+5 || text.left < -5)clipping.push({tag:element.tagName,class:element.className,text:element.textContent.trim().slice(0,85),left:Math.round(text.left),right:Math.round(text.right),width:Math.round(rect.width)})
      }
      return {title:document.querySelector('h1')?.textContent,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,height:document.documentElement.scrollHeight,clipping:clipping.slice(0,25),brokenImages:[...document.images].filter(image=>image.currentSrc && image.complete && !image.naturalWidth).map(image=>image.currentSrc),mappedNodes:document.querySelectorAll('[data-studio-node]').length}
    })
    records.push({route,width,status:response.status(),...result,errors,external:[...new Set(external)]})
    console.log(response.status(),width,route,'clipping',result.clipping.length,'broken',result.brokenImages.length,'errors',errors.length)
    if([1440,390].includes(width)&&['/','/about','/work','/contact','/cases/askona-life-group'].includes(route)){
      const file=(route.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')||'home')+'-'+width
      await page.screenshot({path:'audit/routes/'+file+'.png'})
      if(route==='/'){await page.locator('.imon-home-services').scrollIntoViewIfNeeded();await page.waitForTimeout(850);await page.screenshot({path:'audit/routes/home-services-'+width+'.png'})}
    }
   }catch(error){records.push({route,width,error:error.message});console.error(route,width,error.message)}
   page.off('pageerror',onError);page.off('request',onRequest)
  }
  await context.close()
 }
}finally{
 await writeFile('audit/routes/report.json',JSON.stringify(records,null,2));await browser.close()
 console.log('TOTAL',records.length,'badHTTP',records.filter(record=>record.status!==200).length,'clipping',records.filter(record=>record.clipping?.length).length,'exceptions',records.filter(record=>record.errors?.length||record.error).length)
}
