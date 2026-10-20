import test from 'node:test'
import assert from 'node:assert/strict'
import { readPath, writePath, fieldNodeID, cloneLayer, nodeID, newFields, schemaAtPath } from '../../src/studio/model'
import { changeNodeStyle, changeGuides, currentGuides, designCSS, normalizeDesign } from '../../src/studio/styles'
import { sanitizeDocument, safeRoute, schema } from '../../src/studio/schema'

const page={title:'Page',path:'/page',kind:'standard',blocks:[{id:'a-1',blockType:'text',heading:'First',body:'One'},{id:'b-2',blockType:'text',heading:'Second',body:'Two'}]}
test('nested edits are immutable',()=>{const next=writePath(page,'blocks.0.heading','Updated');assert.equal(readPath(next,'blocks.0.heading'),'Updated');assert.equal(page.blocks[0].heading,'First')})
test('prototype mutation is rejected',()=>{const next=writePath(page,'__proto__.polluted',true);assert.strictEqual(next,page);assert.equal(readPath(page,'constructor'),undefined);assert.equal(({} as {polluted?:boolean}).polluted,undefined)})
test('layer keys persist across reordering',()=>{assert.equal(nodeID(page.blocks[0],0),nodeID(page.blocks[0],1))})
test('field style IDs persist across reordering',()=>{const id=fieldNodeID(page,'blocks.0.heading');const reordered={...page,blocks:[page.blocks[1],page.blocks[0]]};assert.equal(id,fieldNodeID(reordered,'blocks.1.heading'))})
test('field styles map to the current DOM selector',()=>{const id=fieldNodeID(page,'blocks.0.heading');const style={nodes:{[id]:{desktop:{fontSize:60},phone:{fontSize:28}}}};const css=designCSS(style,{...page,blocks:[page.blocks[1],page.blocks[0]]});assert.ok(css.includes('data-studio-field="blocks.1.heading"'));assert.ok(css.includes('font-size:28px'))})
test('hide overrides can be explicitly disabled without resetting grid',()=>{const css=designCSS({nodes:{'block-a-1':{desktop:{hidden:true},phone:{hidden:false}}}});const phone=css.split('@media(max-width:700px)')[1];assert.ok(!phone.includes('display:'));assert.ok(!css.includes('display:revert'))})
test('style injection is discarded',()=>{const result=normalizeDesign({nodes:{'hero"]{body{':{desktop:{color:'#000'}},hero:{desktop:{color:'red;position:fixed',fontSize:Infinity,paddingTop:-10,backgroundColor:'#123456'}}}});assert.deepEqual(result.nodes,{hero:{desktop:{paddingTop:0,backgroundColor:'#123456'}}})})
test('CSS values use explicit safe units',()=>{const value=changeNodeStyle(undefined,'hero','phone','fontSize',40);assert.ok(designCSS(value).includes('font-size:40px'))})
test('duplicate layers have independent row IDs',()=>{const clone=cloneLayer({id:'old',blockType:'cards',items:[{id:'row',heading:'A'}]}) as {id:string;items:{id:string}[]};assert.notEqual(clone.id,'old');assert.notEqual(clone.items[0].id,'row')})
test('reserved paths are rejected',()=>{for(const path of ['/admin','/api/test','/studio','//evil.test','javascript:alert(1)'])assert.throws(()=>safeRoute(path));assert.equal(safeRoute('/work/sample-case'),'/work/sample-case')})
test('sanitizer excludes IDs and injected publishing status',()=>{const value=sanitizeDocument('pages',{...page,id:999,_status:'published',unknownField:'bad'});assert.ok(!('id' in value));assert.ok(!('_status' in value));assert.ok(!('unknownField' in value));assert.equal(value.path,'/page')})
test('sanitizer rejects active links',()=>{assert.throws(()=>sanitizeDocument('pages',{...page,blocks:[{blockType:'cta',heading:'Test',href:'javascript:alert(1)'}]}))})
test('sanitizer rejects unknown block types',()=>{assert.throws(()=>sanitizeDocument('pages',{...page,blocks:[{blockType:'execute-code',body:'x'}]}))})
test('inspector resolves a nested array item schema',()=>{const fields=schema('pages');const data={...page,blocks:[{blockType:'cards',items:[{heading:'A',body:'B'}]}]};const selected=schemaAtPath(fields,data,'blocks.0.items.0.heading');assert.equal(selected.length,1);assert.equal(selected[0].name,'heading')})
test('new block values respect defaults',()=>{assert.deepEqual(newFields([{name:'flag',label:'Flag',type:'checkbox'},{name:'limit',label:'Limit',type:'number',defaultValue:4}]),{flag:false,limit:4})})

test('preserves the original allowlisted video embed',()=>{const doc=sanitizeDocument('projects',{slug:'case',sourcePath:'/cases/case',title:'Test',sections:[{blockType:'visual',src:'https://kinescope.io/embed/abc123?autoplay=1'}]});assert.ok(doc.sections)})
test('rejects arbitrary iframe destinations',()=>{assert.throws(()=>sanitizeDocument('projects',{slug:'case',sourcePath:'/cases/case',title:'Test',sections:[{blockType:'visual',src:'https://evil.example/embed/abc'}]}))})

test('flex and grid rules are sanitized and scoped',()=>{
 const design=changeNodeStyle(undefined,'block-a-1','tablet','display','grid')
 const next=changeNodeStyle(design,'block-a-1','tablet','gridColumns',3)
 assert.ok(designCSS(next).includes('grid-template-columns:repeat(3,minmax(0,1fr))'))
 assert.ok(!designCSS(next).split('@media(max-width:700px)')[1].includes('position:fixed'))
})
test('invalid layout enum cannot become CSS',()=>{
 const next=normalizeDesign({nodes:{'block-a-1':{desktop:{display:'grid;position:fixed',shadow:'none;color:red',widthPercent:10000}}}})
 assert.deepEqual(next.nodes['block-a-1']?.desktop,{widthPercent:100})
})
test('custom animation uses scoped variables and validated numbers',()=>{
 const design=normalizeDesign({nodes:{'block-a-1':{desktop:{motion:'rise',motionDistance:45,motionDuration:1.25,motionDelay:0.3}}}})
 const css=designCSS(design)
 assert.ok(css.includes('--imon-motion-scope:block-a-1'))
 assert.ok(css.includes('--imon-motion-type:rise'))
 assert.ok(css.includes('--imon-motion-duration:1.25'))
})
test('layout guides stay within allowed ranges and are breakpoint-specific',()=>{
 const next=changeGuides(undefined,'phone',{columns:8,gap:13,margin:17})
 assert.deepEqual(currentGuides(next,'phone'),{columns:8,gap:13,margin:17})
 assert.deepEqual(currentGuides(next,'desktop'),{columns:12,gap:16,margin:16})
 assert.equal(changeGuides(next,'phone',{columns:1000}).guides?.phone?.columns,24)
})
test('motion names cannot escape CSS rules',()=>{
 const next=normalizeDesign({nodes:{hero:{desktop:{motion:'rise}body{color:red',motionDelay:-1,motionDuration:999}}}})
 const css=designCSS(next)
 assert.ok(!css.includes('body{color:red'))
 assert.ok(css.includes('--imon-motion-duration:6'))
 assert.ok(css.includes('--imon-motion-delay:0'))
})
