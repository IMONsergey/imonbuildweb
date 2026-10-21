import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const base='http://127.0.0.1:3120'
const target='audit/parity-20261021/recheck'
await mkdir(target,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const results=[]
try {
 for (const width of [390,768,1440]) {
   const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'no-preference'})
   const page=await context.newPage()
   const errors=[]
   page.on('pageerror', error=>errors.push(error.message))
   for(const route of ['/news','/work','/cases/page','/cases/askona-life-group','/about']){
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000})
      await page.evaluate(()=>document.fonts.ready)
      await page.waitForTimeout(750)
      const metrics=await page.evaluate(()=>{
        const grid=document.querySelector('.imon-news-grid')
        const meta=document.querySelector('.case-story--gac .case-meta')
        const intro=document.querySelector('.case-story--gac .case-hero>p')
        const links=[...document.querySelectorAll('.card-grid a')].map(a=>a.getAttribute('href')).filter(Boolean)
        return {
          documentHeight:document.documentElement.scrollHeight,
          scrollWidth:document.documentElement.scrollWidth,
          viewport:innerWidth,
          h1:getComputedStyle(document.querySelector('h1')).fontSize,
          cards:document.querySelectorAll('.imon-news-card').length,
          gridColumns:grid?getComputedStyle(grid).gridTemplateColumns:null,
          cardLinks:links,
          imageNatural:document.querySelectorAll('img').length,
          caseMetaColumns:meta?getComputedStyle(meta).gridTemplateColumns:null,
          caseIntroSize:intro?getComputedStyle(intro).fontSize:null,
          caseIntroTop:intro?Math.round(intro.getBoundingClientRect().y+scrollY):null,
          caseIntroBottom:intro?Math.round(intro.getBoundingClientRect().bottom+scrollY):null,
          caseMetaTop:meta?Math.round(meta.getBoundingClientRect().top+scrollY):null,
          caseMediaTop:document.querySelector('.case-story-content')?Math.round(document.querySelector('.case-story-content').getBoundingClientRect().top+scrollY):null,
        }
      })
      const slug=route.slice(1).replace(/[^a-z0-9]/gi,'-')
      if(width===390||width===1440){await page.screenshot({path:target+'/'+slug+'-'+width+'-top.png'})}
      const record={route,width,status:response.status(),...metrics,errors:[...errors]}
      results.push(record)
      assert.equal(response.status(),200)
      assert.deepEqual(errors,[])
      if(route==='/work'){assert.ok(linksFromWork(record).length<=6,'Work grid contains foreign case cards')}
      if(route==='/news'){assert.equal(metrics.cards,8)}
      if(route==='/cases/page'){
        if(width===390){assert.ok(parseFloat(metrics.caseIntroSize)>=30)}
        assert.ok(metrics.caseMetaTop >= metrics.caseIntroBottom+10,'Case metadata overlaps the introductory statement')
        if(width===390) assert.ok(Math.abs(metrics.caseMediaTop-674)<35,'First case media should begin near the source geometry')
      }
      console.log('Fidelity',JSON.stringify(record))
   }
   await context.close()
 }
}finally{await writeFile(target+'/result.json',JSON.stringify(results,null,2));await browser.close()}
function linksFromWork(record){return record.cardLinks}
