import { chromium } from '@playwright/test'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
const root='http://127.0.0.1:3120'
const secret=await readFile('.initial-admin','utf8')
const email=secret.match(/^Email: (.+)$/m)?.[1],password=secret.match(/^Password: (.+)$/m)?.[1]
if(!email||!password)throw Error('Missing local test credentials')
await mkdir('audit/puck',{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const context=await browser.newContext({viewport:{width:1600,height:1000}})
const login=await context.request.post(root+'/api/users/login',{headers:{Origin:root},data:{email,password}})
if(login.status()!==200)throw Error('Login failed '+login.status())
const page=await context.newPage()
const errors=[],bad=[],failed=[]
page.on('pageerror',e=>errors.push(e.message))
page.on('requestfailed',r=>failed.push({url:r.url(),why:r.failure()?.errorText}))
page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(root))bad.push([r.status(),new URL(r.url()).pathname])})
const response=await page.goto(root+'/studio/builder',{waitUntil:'domcontentloaded',timeout:70000})
console.log('RESPONSE',response?.status())
await page.waitForTimeout(3500)
const state=await page.evaluate(()=>({
  title:document.title,body:document.body.innerText.slice(0,900),
  iframes:document.querySelectorAll('iframe').length,
  stylesheetCount:document.styleSheets.length,
  preview:document.querySelectorAll('.puck-imon-site').length,
  buttons:document.querySelectorAll('button').length,
  docs:document.querySelectorAll('.imon-puck-builder').length,
  editorHTML:document.querySelector('[class*=Puck]')?.outerHTML.slice(0,250),
}))
console.log('STATE',JSON.stringify(state))
console.log('PAGE ERRORS',JSON.stringify(errors),'BAD RESPONSES',JSON.stringify(bad),'FAILED',JSON.stringify(failed.slice(0,10)))
await page.screenshot({path:'audit/puck/puck-desktop.png',fullPage:false})
await writeFile('audit/puck/smoke.json',JSON.stringify({response:response?.status(),state,errors,bad,failed},null,2))
await browser.close()
if(response?.status()!==200||errors.length||bad.length)process.exit(1)
