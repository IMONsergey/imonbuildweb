import { chromium } from '@playwright/test'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const base='http://127.0.0.1:3120',suffix=Date.now().toString(36),path='/qa-puck-'+suffix
const creds=await readFile('.initial-admin','utf8')
const email=creds.match(/^Email: (.+)$/m)?.[1],password=creds.match(/^Password: (.+)$/m)?.[1]
await mkdir('audit/puck',{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const user=await browser.newContext({viewport:{width:1540,height:970}})
const guest=await browser.newContext()
const headers={Origin:base,'Content-Type':'application/json'}
let id,createdId,createdAssetId,output=[],page
async function post(action,data){return user.request.post(base+'/api/studio/'+action,{headers,data})}
async function getDoc(){const r=await user.request.get(base+'/api/studio/document?collection=pages&id='+id,{headers:{Origin:base}});assert.equal(r.status(),200);return r.json()}
try{
  const login=await user.request.post(base+'/api/users/login',{headers,data:{email,password}})
  assert.equal(login.status(),200)
  const created=await post('document',{collection:'pages',data:{path,title:'QA Puck '+suffix,kind:'standard',heroTitle:'Initial hero',intro:'Existing introduction',blocks:[{id:'qa-first-'+suffix,blockType:'text',heading:'Original block',body:'The original content must remain after editing.',layout:'split'},{id:'qa-cta-'+suffix,blockType:'cta',heading:'CTA message',buttonText:'Contact',href:'/contact'}]}})
  assert.equal(created.status(),201,await created.text());id=(await created.json()).id
  assert.equal((await guest.request.get(base+path)).status(),404)
  output.push('Private QA draft created')
  page=await user.newPage()
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  const resp=await page.goto(base+'/studio/builder?collection=pages&id='+id,{waitUntil:'domcontentloaded',timeout:60000})
  assert.equal(resp.status(),200)
  await page.waitForTimeout(2200)
  const info=await page.evaluate(()=>({
    title:document.title,
    inputs:[...document.querySelectorAll('input,textarea')].map(el=>({tag:el.tagName,value:el.value,outer:el.outerHTML.slice(0,200)})).slice(0,20),
    draggables:[...document.querySelectorAll('[draggable=true],[data-rfd-draggable-id]')].slice(0,12).map(el=>({text:el.textContent.slice(0,80),html:el.outerHTML.slice(0,150)})),
    iframes:[...document.querySelectorAll('iframe')].map(el=>({title:el.title,src:el.src})),
  }))
  console.log('INSPECT',JSON.stringify(info))
  await page.screenshot({path:'audit/puck/flow-before.png'})
  const titleInput=page.locator('input[name="title"]:visible').first()
  await titleInput.fill('QA Puck Updated '+suffix)
  const changed=true
  assert.ok(changed,'Puck editable root title input not found')
  await page.waitForTimeout(2600)
  const updated=await getDoc()
  console.log('SAVED',updated.data.title,updated.data.blocks.map(x=>x.heading))
  assert.equal(updated.data.title,'QA Puck Updated '+suffix)
  assert.equal(updated.data.blocks.length,2)
  assert.equal(updated.data.blocks[0].body,'The original content must remain after editing.')
  assert.equal((await guest.request.get(base+path)).status(),404)

  output.push('Inline Puck field edit auto-saved as private draft without losing blocks')
  await page.getByRole('button',{name:'Точный вид сайта'}).click()
  const exact=page.locator('.imon-puck-exact-view iframe')
  await exact.waitFor({state:'visible',timeout:15000})
  await page.frameLocator('.imon-puck-exact-view iframe').getByRole('heading',{name:'Initial hero'}).waitFor({timeout:30000})
  assert.ok((await page.frameLocator('.imon-puck-exact-view iframe').locator('body').innerText()).includes('The original content must remain after editing.'))
  assert.equal((await guest.request.get(base+path)).status(),404,'Exact draft preview must stay private')
  await page.getByRole('button',{name:'Вернуться к редактированию ×'}).click()
  await exact.waitFor({state:'detached',timeout:15000})
  output.push('Exact embedded site preview renders the private draft and returns to the block editor')
  const frame=page.frameLocator('iframe').first()
  const source=page.getByText('Текстовый раздел',{exact:true}).first().locator('xpath=..')
  console.log('BLOCK TO DRAG',await source.count(),await frame.locator('.puck-section').count())
  const target=frame.locator('[data-puck-dropzone="root:default-zone"]')
  await target.locator('[data-puck-component]').first().scrollIntoViewIfNeeded()
  const src=await source.boundingBox(),dest=await target.locator('[data-puck-component]').first().boundingBox()
  assert.ok(src && dest)
  const x1=src.x+src.width-20,y1=src.y+src.height/2,x2=dest.x+Math.min(70,dest.width/3),y2=dest.y+24
  console.log('MOUSE',x1,y1,'to',x2,y2)
  await page.mouse.move(x1,y1)
  await page.mouse.down()
  for(let step=1;step<=26;step++){
    await page.mouse.move(x1+(x2-x1)*step/26,y1+(y2-y1)*step/26)
    await page.waitForTimeout(18)
  }
  await page.mouse.up()
  await page.waitForTimeout(2200)
  const afterDrag=await getDoc()
  console.log('BLOCKS AFTER DND',afterDrag.data.blocks.map(item=>({id:item.id,type:item.blockType,heading:item.heading})))
  assert.equal(afterDrag.data.blocks.length,3,'New block should be appended via Puck drag and drop')
  output.push('Drag and drop inserts a CMS block with stable identity')
  const addedId=afterDrag.data.blocks[0].id
  await frame.locator('[data-puck-component]').first().click()
  const preset=page.locator('select[title="Анимация — Desktop"]:visible').first()
  await preset.waitFor({state:'visible',timeout:12000})
  console.log('MOTION OPTIONS',await preset.evaluate(el=>[...el.options].map(option=>({value:option.value,text:option.textContent}))))
  const opts=await preset.evaluate(el=>[...el.options].map(option=>option.value))
  if(!opts.includes(JSON.stringify({value:'rise'}))) throw new Error('Rise option missing: '+JSON.stringify(opts))
  await preset.selectOption(JSON.stringify({value:'rise'}))
  await page.waitForTimeout(2000)
  const afterMotion=await getDoc()
  assert.equal(afterMotion.data.studio.nodes['block-'+addedId].desktop.motion,'rise')
  assert.ok(!('__motion' in afterMotion.data.blocks[0]),'Editor-only properties must never leak into CMS blocks')
  output.push('GSAP animation preset is saved to the real Studio node')

  const beforePublish=await guest.request.get(base+path)
  assert.equal(beforePublish.status(),404)
  page.on('dialog',dialog=>dialog.accept())
  const publish=page.getByRole('button',{name:'Опубликовать',exact:true}).first()
  await publish.waitFor({state:'visible',timeout:10000})
  const publication=page.waitForResponse(response=>response.url().endsWith('/api/studio/document') && response.request().method()==='PUT' && response.request().postData()?.includes('\"publish\"'),{timeout:30000})
  await publish.click()
  assert.equal((await publication).status(),200)
  const publicPage=await guest.request.get(base+path)
  assert.equal(publicPage.status(),200)
  const html=await publicPage.text()
  assert.ok(html.includes('QA Puck Updated '+suffix))
  assert.ok(html.includes('The original content must remain after editing.'))
  output.push('Explicit publish makes the exact Next.js page public while preserving content')
  assert.ok(html.includes('--imon-motion-type:rise'),'Published Next.js renderer must include the selected animation')
  output.push('Published page contains actual GSAP motion settings')
  await page.getByRole('button',{name:'+ Страница',exact:true}).click()
  await page.getByLabel('Название нового документа').fill('QA New Puck '+suffix)
  await page.getByLabel('Адрес нового документа').fill('/qa-puck-new-'+suffix)
  await page.getByRole('button',{name:'Создать черновик'}).click()
  await page.waitForURL(url=>url.pathname==='/studio/builder' && url.searchParams.get('collection')==='pages' && url.searchParams.get('id')!==String(id),{timeout:35000})
  createdId=Number(new URL(page.url()).searchParams.get('id'))
  assert.ok(createdId>0 && createdId!==id)
  const newRecord=await user.request.get(base+'/api/studio/document?collection=pages&id='+createdId,{headers:{Origin:base}})
  assert.equal(newRecord.status(),200)
  assert.equal((await newRecord.json()).data.path,'/qa-puck-new-'+suffix)
  assert.equal((await guest.request.get(base+'/qa-puck-new-'+suffix)).status(),404)
  output.push('New page created in Puck as unpublished CMS draft')
  const fileBuffer=await readFile('public/media/jyArCXURn9Svez9LQJiv5mZSY.png')
  const uploadResponse=page.waitForResponse(response=>response.url().endsWith('/api/studio/media')&&response.request().method()==='POST',{timeout:35000})
  await page.locator('[data-puck-media-kind="image"] input[type=file]').first().setInputFiles({name:'qa-puck-'+suffix+'.png',mimeType:'image/png',buffer:fileBuffer})
  const uploaded=await uploadResponse
  assert.equal(uploaded.status(),201,await uploaded.text())
  const asset=await uploaded.json();createdAssetId=asset.id
  await page.waitForTimeout(2100)
  const withMedia=await user.request.get(base+'/api/studio/document?collection=pages&id='+createdId,{headers:{Origin:base}})
  assert.equal(withMedia.status(),200)
  assert.equal((await withMedia.json()).data.heroImage,createdAssetId)
  output.push('Puck media upload is stored and bound to the new page without publication')




  assert.deepEqual(errors,[])
  await page.screenshot({path:'audit/puck/flow-after.png'})
} catch(error){console.error(error.stack);process.exitCode=1}
finally{
  for (const item of [...new Set([id,createdId])]) if(item){const cleanup=await user.request.delete(base+'/api/pages/'+item,{headers:{Origin:base}});console.log('CLEANUP',item,cleanup.status())}
  if(createdAssetId){const cleanup=await user.request.delete(base+'/api/media/'+createdAssetId,{headers:{Origin:base}});console.log('MEDIA CLEANUP',createdAssetId,cleanup.status())}
  await writeFile('audit/puck/flow.json',JSON.stringify(output,null,2))
  await browser.close()
}
