import {chromium} from '@playwright/test'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'

const base=process.env.STUDIO_TEST_URL || 'http://127.0.0.1:3120'
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)) throw new Error('Local QA only')
const credentials=await readFile('.initial-admin','utf8')
const email=credentials.match(/^Email: (.+)$/m)?.[1]
const password=credentials.match(/^Password: (.+)$/m)?.[1]
if (!email || !password) throw new Error('No fixture credentials')
await mkdir('audit/studio',{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const context=await browser.newContext({viewport:{width:1600,height:1000}})
const guest=await browser.newContext()
const page=await context.newPage()
const errors=[]
page.on('pageerror',error=>errors.push(error.message))
const results=[]
try {
  const redirect=await page.goto(base+'/admin',{waitUntil:'domcontentloaded'})
  assert.equal(redirect.status(),200)
  await page.waitForURL(url=>url.pathname==='/studio/login')
  await page.getByRole('heading',{name:'Вход в Studio'}).waitFor()
  assert.equal((await guest.request.get(base+'/api/studio/preferences')).status(),401)
  assert.equal((await guest.request.get(base+'/api/studio/leads')).status(),401)
  results.push('Default /admin opens first-party I’MON login and rejects guests')
  await page.screenshot({path:'audit/studio/imon-login-desktop.png'})
  await page.locator('#imon-login-email').fill(email)
  await page.locator('#imon-login-password').fill(password)
  await page.getByRole('button',{name:'Войти в Studio'}).click()
  await page.waitForURL(url=>url.pathname==='/studio',{timeout:30000})
  await page.locator('.st-shell').waitFor({timeout:30000})
  await page.locator('iframe.st-artboard').waitFor({timeout:30000})
  await page.locator('.st-canvas-loading').waitFor({state:'hidden',timeout:30000})
  await page.frameLocator('iframe.st-artboard').locator('h1').first().waitFor({state:'visible',timeout:30000})
  await page.screenshot({path:'audit/studio/imon-studio-first-party.png'})
  results.push('Branded login establishes session and opens original Next.js canvas')
  await page.getByTitle('Меню и настройки сайта').click()
  await page.getByRole('heading',{name:'Настройки I’MON'}).waitFor()
  await page.getByRole('heading',{name:'Пункты основного меню'}).waitFor()
  const navItems=await page.locator('.st-pref-link').count()
  assert.ok(navItems>0,'Navigation items missing')
  await page.getByRole('tab',{name:'Контакты и футер'}).click()
  await page.getByRole('heading',{name:'Контакты'}).waitFor()
  assert.ok((await page.locator('input[type=email]').count())>0)
  await page.screenshot({path:'audit/studio/imon-settings.png'})
  page.on('dialog', dialog=>dialog.accept())
  await page.getByRole('button',{name:'Сохранить изменения'}).click()
  await page.locator('.st-pref-success').waitFor({timeout:20000})
  assert.match(await page.locator('.st-pref-success').innerText(),/сохранены/i)
  results.push('Navigation, contact information, social links and footer render and save inside native Studio')
  await page.getByRole('button',{name:'Заявки',exact:true}).click()
  await page.getByRole('heading',{name:'Заявки'}).waitFor()
  await page.screenshot({path:'audit/studio/imon-leads.png'})
  results.push('Private leads panel opens inside custom Studio')
  // Cross-site admin mutations are rejected before touching data.
  const forbidden=await context.request.put(base+'/api/studio/preferences',{headers:{Origin:'https://cross-site.invalid','Content-Type':'application/json'},data:{slug:'navigation',revision:'a'.repeat(64),data:{}}})
  assert.equal(forbidden.status(),403)
  results.push('Cross-origin writes to site settings are blocked')
  await page.getByRole('button',{name:'Аккаунт и выход'}).click()
  await page.getByRole('button',{name:'Выйти из Studio'}).click()
  await page.waitForURL(url=>url.pathname==='/studio/login',{timeout:30000})
  await page.goto(base+'/studio')
  await page.waitForURL(url=>url.pathname==='/studio/login')
  results.push('Logout invalidates protected editor session')
  assert.deepEqual(errors,[])
} catch (error) {
  console.error('UI QA FAIL',error.stack)
  await page.screenshot({path:'audit/studio/imon-first-party-failure.png'}).catch(()=>{})
  console.error('Page errors',JSON.stringify(errors))
  process.exitCode=1
} finally {
  await writeFile('audit/studio/imon-first-party-qa.json',JSON.stringify(results,null,2))
  await browser.close()
}
console.log('FIRST PARTY STUDIO QA',JSON.stringify(results))
