import { chromium } from '@playwright/test'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
const base = process.env.STUDIO_TEST_URL || 'http://127.0.0.1:3120'
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Local test only')
await mkdir('audit/studio', { recursive: true })
const credentials = await readFile('.initial-admin','utf8')
const email=credentials.match(/^Email: (.+)$/m)?.[1], password=credentials.match(/^Password: (.+)$/m)?.[1]
if (!email || !password) throw new Error('Local fixture account is not configured')
const browser=await chromium.launch({channel:'chrome',headless:true})
const context=await browser.newContext({viewport:{width:1600,height:1000}})
const errors=[]; const httpErrors=[]
const page=await context.newPage()
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)httpErrors.push({status:r.status(),path:new URL(r.url()).pathname})})
try{
  const login=await context.request.post(base+'/api/users/login',{headers:{Origin:base},data:{email,password}})
  if(login.status()!==200)throw new Error('Login status '+login.status())
  console.log('Authenticated local Studio session')
  const r=await page.goto(base+'/studio',{waitUntil:'domcontentloaded',timeout:90000})
  console.log('Studio HTTP',r.status())
  await page.locator('.st-shell').waitFor({timeout:45000})
  await page.waitForFunction(()=>document.querySelectorAll('.st-page-item').length>0,{timeout:30000})
  await page.locator('iframe.st-artboard').waitFor({timeout:45000})
  const frame=page.frameLocator('iframe.st-artboard')
  await frame.locator('h1').waitFor({timeout:60000})
  await page.locator('.st-canvas-loading').waitFor({state:'hidden',timeout:45000})
  await page.screenshot({path:'audit/studio/studio-desktop.png'})
  const result={status:r.status(),pages:await page.locator('.st-page-item').count(),heading:await frame.locator('h1').innerText(),layers:await frame.locator('[data-studio-node]').count(),errors,httpErrors}
  console.log(JSON.stringify(result,null,2))
  await page.getByRole('button',{name:'Phone390',exact:true}).click().catch(async()=>page.locator('.st-breakpoints button').last().click())
  await page.screenshot({path:'audit/studio/studio-phone.png'})
  await writeFile('audit/studio/smoke.json',JSON.stringify(result,null,2))
} catch(e){
  await page.screenshot({path:'audit/studio/studio-failure.png'}).catch(()=>{})
  console.error(e.message);console.error(JSON.stringify({errors,httpErrors},null,2));process.exitCode=1
} finally{await browser.close()}
