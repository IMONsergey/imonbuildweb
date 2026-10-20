import { chromium } from '@playwright/test'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
const base=process.env.STUDIO_TEST_URL || 'http://127.0.0.1:3120'
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Local Studio fixture only')
await mkdir('audit/studio',{recursive:true})
const text=await readFile('.initial-admin','utf8')
const email=text.match(/^Email: (.+)$/m)?.[1],password=text.match(/^Password: (.+)$/m)?.[1]
const browser=await chromium.launch({channel:'chrome',headless:true})
const admin=await browser.newContext({viewport:{width:1600,height:1000},extraHTTPHeaders:{Origin:base,'Sec-Fetch-Site':'same-origin'}}),guest=await browser.newContext()
const request=admin.request;const results=[];let qaId
const suffix=Date.now().toString(36), route='/qa-studio-'+suffix
const headers={Origin:base,'Content-Type':'application/json'}
const result=(name,details='')=>{results.push({name,pass:true,details});console.log('PASS',name,details)}
async function api(method,action,data){return request[method](base+'/api/studio/'+action,{headers,data})}
async function document(){const r=await request.get(base+'/api/studio/document?collection=pages&id='+qaId);assert.equal(r.status(),200);return r.json()}
async function save(doc,mode='draft'){return api('put','document',{collection:'pages',id:qaId,data:doc.data,revision:doc.revision,mode})}
try{
  assert.equal((await guest.request.get(base+'/api/studio/bootstrap')).status(),401)
  result('Anonymous Studio API rejected')
  const login=await request.post(base+'/api/users/login',{headers,data:{email,password}});assert.equal(login.status(),200)
  result('Existing admin authentication')
  const index=await request.get(base+'/api/studio/bootstrap');assert.equal(index.status(),200)
  const manifest=await index.json();assert.ok(manifest.documents.length>=23)
  result('CMS manifest includes all source documents',String(manifest.documents.length))
  const media=await request.get(base+'/api/studio/media');assert.equal(media.status(),200);assert.ok((await media.json()).totalDocs>=137)
  result('Media library is populated')
  const create=await api('post','document',{collection:'pages',data:{path:route,title:'QA Studio '+suffix,kind:'standard',heroTitle:'First title',intro:'Private test copy',blocks:[{id:'qa-first',blockType:'text',heading:'First block',body:'Visible content one'},{id:'qa-second',blockType:'text',heading:'Second block',body:'Visible content two'}]}})
  assert.equal(create.status(),201,await create.text());let doc=await create.json();qaId=doc.id
  assert.equal((await guest.request.get(base+route)).status(),404)
  result('New pages remain unpublished')
  const spoof=await request.put(base+'/api/studio/document',{headers:{...headers,Origin:'https://other.example'},data:{}});assert.equal(spoof.status(),403)
  result('Cross-origin mutation blocked')
  const firstRevision=doc.revision
  doc.data.heroTitle='Draft title';let saved=await save(doc);assert.equal(saved.status(),200,await saved.text());doc=await saved.json()
  assert.equal((await guest.request.get(base+route)).status(),404)
  result('Draft save persists without publishing')
  const stale=await api('put','document',{collection:'pages',id:qaId,data:doc.data,revision:firstRevision,mode:'draft'});assert.equal(stale.status(),409)
  result('Stale concurrent edits receive 409')
  const malicious={...doc,data:{...doc.data,blocks:[{id:'evil',blockType:'cta',heading:'Bad',href:'javascript:alert(1)'}]}}
  assert.equal((await save(malicious)).status(),422)
  result('Unsafe CMS link rejected')
  doc.data._status='published';saved=await save(doc,'draft');assert.equal(saved.status(),200,await saved.text());doc=await saved.json()
  assert.equal((await guest.request.get(base+route)).status(),404)
  result('Injected published flag cannot bypass draft mode')
  saved=await save(doc,'publish');assert.equal(saved.status(),200,await saved.text());doc=await saved.json()
  let publicResponse=await guest.request.get(base+route);assert.equal(publicResponse.status(),200);assert.ok((await publicResponse.text()).includes('Draft title'))
  result('Explicit publish updates public document')
  doc.data.heroTitle='Private after publish';saved=await save(doc);assert.equal(saved.status(),200,await saved.text());doc=await saved.json()
  const publicHTML=await (await guest.request.get(base+route)).text();assert.ok(publicHTML.includes('Draft title'));assert.ok(!publicHTML.includes('Private after publish'))
  result('Further edits do not change published content')
  const leaked=await guest.request.get(base+'/api/pages/'+qaId+'?draft=true');
  if(leaked.status()===200)assert.ok(!(await leaked.text()).includes('Private after publish'),'Draft leaked through standard Payload API')
  result('Standard Payload API does not leak draft content')
  const versionResponse=await request.get(base+'/api/studio/versions?collection=pages&id='+qaId);assert.equal(versionResponse.status(),200)
  const versions=(await versionResponse.json()).versions;assert.ok(versions.length>=3)
  const version=versions.at(-1);const restored=await api('put','restore',{collection:'pages',id:qaId,revision:doc.revision,version:version.id});assert.equal(restored.status(),200,await restored.text());doc=await restored.json()
  assert.ok((await (await guest.request.get(base+route)).text()).includes('Draft title'))
  result('History restoration creates draft, leaving publication intact')
  // A real browser exercises the inspector, autosave and iframe synchronization.
  const page=await admin.newPage();const browserErrors=[];page.on('pageerror',e=>{browserErrors.push(e.message);console.error('BROWSER',e.message)})
  await page.goto(base+'/studio?collection=pages&id='+qaId,{waitUntil:'domcontentloaded',timeout:60000})
  await page.locator('.st-shell').waitFor({timeout:90000}); await page.locator('iframe.st-artboard').waitFor({timeout:90000})
  let frame=page.frameLocator('iframe.st-artboard');await frame.locator('h1').waitFor({timeout:45000})
  await page.locator('.st-canvas-loading').waitFor({state:'hidden',timeout:45000})
  const field=page.locator('.st-inspector').getByLabel('Крупный заголовок',{exact:true})
  const savedFromInspector=page.waitForResponse(response=>response.url().endsWith('/api/studio/document')&&response.request().method()==='PUT',{timeout:30000})
  await field.fill('Edited in Studio');assert.equal((await savedFromInspector).status(),200)
  await page.waitForFunction(()=>[...document.querySelectorAll('.st-canvas-status button')].some(e=>e.textContent.includes('Все изменения сохранены')),{timeout:30000})
  await page.frameLocator('iframe.st-artboard').getByRole('heading',{name:'Edited in Studio',exact:true}).waitFor({timeout:45000})
  assert.equal((await document()).data.heroTitle,'Edited in Studio')
  assert.ok(!(await (await guest.request.get(base+route)).text()).includes('Edited in Studio'))
  result('Inspector edits, autosave and real canvas agree')
  await page.locator('.st-breakpoints button').last().click()
  await page.waitForFunction(()=>document.querySelector('iframe.st-artboard')?.contentWindow?.innerWidth===390,{timeout:10000})
  result('Phone breakpoint renders at 390px')
  await page.locator('.st-tabs button').filter({hasText:'Слои'}).first().click()
  await page.locator('[data-testid=studio-layer]').first().click()
  const savedReorder=page.waitForResponse(response=>response.url().endsWith('/api/studio/document')&&response.request().method()==='PUT',{timeout:30000})
  await page.getByTitle('Сдвинуть вниз').click();assert.equal((await savedReorder).status(),200)
  await page.waitForFunction(()=>[...document.querySelectorAll('.st-canvas-status button')].some(e=>e.textContent.includes('Все изменения сохранены')),{timeout:30000})
  doc=await document();assert.equal(doc.data.blocks[0].id,'qa-second')
  result('Layer reorder persists to CMS')
  await page.screenshot({path:'audit/studio/workflow-phone.png'})
  await page.locator('.st-breakpoints button').first().click()
  await page.getByRole('button',{name:'Макет',exact:true}).click()
  const top=page.getByLabel('Отступ сверху',{exact:true});const savedLayout=page.waitForResponse(response=>response.url().endsWith('/api/studio/document')&&response.request().method()==='PUT',{timeout:30000});await top.fill('88');assert.equal((await savedLayout).status(),200)
  await page.waitForFunction(()=>[...document.querySelectorAll('.st-canvas-status button')].some(e=>e.textContent.includes('Все изменения сохранены')),{timeout:30000})
  doc=await document();assert.ok(Object.values(doc.data.studio.nodes).some(n=>n.desktop?.paddingTop===88))
  result('Layout changes persist in document design data')
  assert.deepEqual(browserErrors,[])
  result('No browser JavaScript exceptions in editor workflow')
  await page.screenshot({path:'audit/studio/workflow-desktop.png'})
} catch(error){console.error(error.stack);results.push({pass:false,message:error.message});process.exitCode=1}
finally{
  if(qaId){const response=await request.delete(base+'/api/pages/'+qaId,{headers:{Origin:base}});console.log('QA fixture cleanup HTTP',response.status())}
  await writeFile('audit/studio/workflow.json',JSON.stringify(results,null,2));await browser.close()
}
