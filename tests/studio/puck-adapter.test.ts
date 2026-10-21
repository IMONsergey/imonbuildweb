import test from 'node:test'
import assert from 'node:assert/strict'
import { documentToPuck, puckToDocument } from '../../src/studio/puck/adapter'
import type { StudioDocument, RecordData } from '../../src/studio/model'

function doc(collection: StudioDocument['collection'], blocks: RecordData[]) {
  return {
    collection, id: 5, revision:'a', path:'/test',published:true,fields:[],
    data: {
      title:'Project', path:'/test',kind:'standard',sourcePath:'/work/test', slug:'test',
      studio:{version:1,nodes:{hero:{desktop:{fontSize:77}}}},
      seo:{title:'SEO title',noindex:false},heroTitle:'Headline',summary:'Summary',
      ...(collection==='pages'?{blocks}:{sections:blocks}),
    },
  } as StudioDocument
}
test('existing page blocks round-trip without losing image or style properties',()=>{
  const source=doc('pages', [
    {id:'a-1',blockType:'text',heading:'Heading',body:'Body',image:12,layout:'dark',blockName:'Custom'},
    {id:'b-1',blockType:'visual',src:'/media/x.webp',display:'overlapRight'},
    {id:'c-1',blockType:'aboutEditorial',team:[{id:'team-row',role:'Creative',portrait:19}],cultureItems:[{id:'c1',text:'Value'}]},
  ])
  const puck=documentToPuck(source)
  const result=puckToDocument(puck,source.data,'pages')
  assert.deepEqual(result,source.data)
})
test('reordering and inserting blocks updates only the CMS blocks array',()=>{
  const source=doc('projects',[{id:'a',blockType:'text',heading:'A'},{id:'b',blockType:'text',heading:'B'}])
  const puck=documentToPuck(source)
  puck.content.reverse()
  puck.content.push({type:'cta',props:{id:'new-id',heading:'New CTA',buttonText:'Contact',href:'/contact'}})
  const result=puckToDocument(puck,source.data,'projects')
  assert.deepEqual((result.sections as RecordData[]).map(x=>x.heading),['B','A','New CTA'])
  assert.deepEqual(result.studio,source.data.studio)
  assert.deepEqual(result.seo,source.data.seo)
})
test('Puck root edits preserve protected paths, media, SEO and other document fields',()=>{
  const source=doc('pages',[])
  const data=documentToPuck(source)
  data.root.props!.title='Updated'
  data.root.props!.heroTitle='Edited hero'
  const result=puckToDocument(data,source.data,'pages')
  assert.equal(result.title,'Updated')
  assert.equal(result.heroTitle,'Edited hero')
  assert.equal(result.path,'/test')
  assert.deepEqual(result.seo,source.data.seo)
})
test('articles retain Lexical contents not managed by the visual builder',()=>{
  const source=doc('articles',[{id:'x',blockType:'listing',kind:'articles',limit:3}])
  source.data.body={root:{children:[],type:'root',version:1}}
  const data=documentToPuck(source)
  const result=puckToDocument(data,source.data,'articles')
  assert.deepEqual(result.body,source.data.body)
})
test('new blocks without stable id acquire a valid Payload row id',()=>{
  const source=doc('pages',[])
  const data=documentToPuck(source)
  data.content.push({type:'text',props:{id:'',heading:'New',body:'hello'}})
  const result=puckToDocument(data,source.data,'pages')
  const first=(result.blocks as RecordData[])[0]
  assert.match(String(first.id),/^[a-zA-Z0-9_-]+$/)
  assert.equal(first.blockType,'text')
})
test('animation presets round-trip via StudioDesign without dirtying Payload blocks',()=>{
  const source=doc('pages',[{id:'layer-5',blockType:'text',heading:'Original'}])
  const data=documentToPuck(source)
  data.content[0].props.__motion='rise'
  data.content[0].props.__motionDuration=1.15
  data.content[0].props.__motionDelay=.2
  data.content[0].props.__motionDistance=42
  data.content[0].props.__motionPhone='none'
  const result=puckToDocument(data,source.data,'pages')
  const actual=result.studio as {nodes:Record<string,{desktop?:Record<string,unknown>;phone?:Record<string,unknown>}>}
  assert.deepEqual(actual.nodes['block-layer-5'].desktop,{motion:'rise',motionDuration:1.15,motionDelay:.2,motionDistance:42})
  assert.equal(actual.nodes['block-layer-5'].phone?.motion,'none')
  assert.deepEqual(result.blocks,[{id:'layer-5',blockType:'text',heading:'Original'}])
  const back=documentToPuck({...source,data:result})
  assert.equal(back.content[0].props.__motion,'rise')
  assert.equal(back.content[0].props.__motionPhone,'none')
})
test('original motion and unrelated layout properties survive no-op edits',()=>{
  const source=doc('projects',[{id:'layer-1',blockType:'visual',display:'portraitOffset',src:'/media/test.webp'}])
  ;(source.data.studio as {nodes:Record<string,unknown>}).nodes['block-layer-1']={desktop:{motion:'fade',paddingTop:50,backgroundColor:'#ffffff'},tablet:{fontSize:36}}
  const puck=documentToPuck(source)
  assert.equal(puck.content[0].props.__motion,'fade')
  assert.deepEqual(puckToDocument(puck,source.data,'projects'),source.data)
  puck.content[0].props.__motion='scale'
  const updated=puckToDocument(puck,source.data,'projects')
  const studio=updated.studio as {nodes:Record<string,{desktop?:Record<string,unknown>;tablet?:Record<string,unknown>}>}
  assert.equal(studio.nodes['block-layer-1'].desktop?.motion,'scale')
  assert.equal(studio.nodes['block-layer-1'].desktop?.paddingTop,50)
  assert.equal(studio.nodes['block-layer-1'].tablet?.fontSize,36)
})
test('duplicate IDs are regenerated without duplicating document row keys',()=>{
  const source=doc('pages',[{id:'layer-1',blockType:'text',heading:'Unique'}])
  const data=documentToPuck(source)
  data.content.push(structuredClone(data.content[0]))
  const result=puckToDocument(data,source.data,'pages')
  const blocks=result.blocks as RecordData[]
  assert.equal(blocks.length,2)
  assert.notEqual(blocks[0].id,blocks[1].id)
})
test('existing hero media selection can be changed without touching source asset fallback',()=>{
  const source=doc('pages',[])
  source.data.heroImagePath='/media/local-background.webp'
  const puck=documentToPuck(source)
  puck.root.props!.heroImage=42
  const updated=puckToDocument(puck,source.data,'pages')
  assert.equal(updated.heroImage,42)
  assert.equal(updated.heroImagePath,'/media/local-background.webp')
})
