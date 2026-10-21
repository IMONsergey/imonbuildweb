import {chromium} from '@playwright/test'
import {mkdir,writeFile} from 'node:fs/promises'
import path from 'node:path'
const urls={source:'https://fantastic-future-931954.framer.app',local:process.env.IMON_AUDIT_BASE||'http://127.0.0.1:3120'}
const routes=['/','/work','/about','/contact','/news','/cases/page','/cases/askona-life-group']
const out='audit/parity-20261021/motion-corrected'
await mkdir(out,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const all=[]
try {
  for (const width of [1440,390]) {
    const height=width===390?844:900
    for (const route of routes) {
      for (const [site,base] of Object.entries(urls)) {
        const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'})
        const page=await ctx.newPage()
        const rec={site,width,route}
        try {
          const resp=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000})
          await page.evaluate(()=>document.fonts.ready)
          await page.waitForTimeout(1400)
          // Trigger lazy loading and reveal-on-scroll for both React renderers.
          const startHeight=await page.evaluate(()=>document.documentElement.scrollHeight)
          await page.evaluate(()=>window.scrollTo(0,Math.max(0,document.documentElement.scrollHeight-900)))
          await page.waitForTimeout(650)
          await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
          await page.waitForTimeout(850)
          const slug=route==='/'?'home':route.slice(1).replace(/[^a-z0-9]+/gi,'-')
          await page.screenshot({path:path.join(out,slug+'-'+width+'-'+site+'-top.png'),timeout:20000})
          const metrics=await page.evaluate(()=>({height:document.documentElement.scrollHeight,viewport:innerWidth,visibleH1:[...document.querySelectorAll('h1')].map(el=>({txt:el.textContent?.slice(0,90),opacity:getComputedStyle(el).opacity,color:getComputedStyle(el).color,visibility:getComputedStyle(el).visibility})),images:[...document.images].length}))
          rec.status=resp.status();rec.metrics={startHeight,...metrics}
          await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight*.5,behavior:'instant'}))
          await page.waitForTimeout(950)
          await page.screenshot({path:path.join(out,slug+'-'+width+'-'+site+'-mid.png'),timeout:20000})
          console.log('SAMPLE',site,width,route,JSON.stringify(rec.metrics))
        }catch(error){rec.error=error.message;console.log('FAIL',site,width,route,error.message.slice(0,180))}
        finally{all.push(rec);await ctx.close()}
      }
    }
  }
}finally{await writeFile(path.join(out,'metrics.json'),JSON.stringify(all,null,2));await browser.close()}
