import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import {createDeskEdition,saveDeskEdition,readDeskEdition,previewDeskEdition} from '../scripts/edition-desk.mjs';
import {inspectPdf,sha256} from '../scripts/pdf-proof.mjs';
const root=path.resolve(import.meta.dirname,'..');
const published=JSON.parse(fs.readFileSync(path.join(root,'data/editions.json'),'utf8')).issues.find(i=>i.id==='2026-10-26-r7');

test('whole-issue desk preserves release, detects concurrent edits, and invalidates stale proof and review',async t=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-desk-'));t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
 for(const url of new Set([published.pdfUrl,...published.articleSnapshots.flatMap(a=>[a.visual,...(a.supportingVisuals||[])].map(v=>v.url))])){const dest=path.join(tmp,'public',url);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,'public',url),dest);}
 fs.mkdirSync(path.join(tmp,'data'),{recursive:true});fs.writeFileSync(path.join(tmp,'data/editions.json'),JSON.stringify({issues:[published]}));
 const original=sha256(fs.readFileSync(path.join(tmp,'public',published.pdfUrl)));
 let e=await createDeskEdition(tmp,{sourceId:published.id,id:'desk-test'});assert.equal(e.articleSnapshots.length,14);
 e.articleSnapshots[0].title+=' 교정';e=await saveDeskEdition(tmp,{edition:e,expectedRevision:1});assert.equal(e.articleSnapshots[0].review.status,'pending');
 await assert.rejects(saveDeskEdition(tmp,{edition:e,expectedRevision:1}),/다른 창/);
 e=await previewDeskEdition(tmp,{id:e.id,expectedRevision:e.draftRevision});assert.equal(e.proof.unpublished,true);assert.equal(e.articleSnapshots[0].review.status,'pending');assert.equal(inspectPdf(path.join(tmp,'output/pdf',e.id,'proof.pdf')).testOnly,true);
 e.articleSnapshots[0].lead+=' 추가 교정';e=await saveDeskEdition(tmp,{edition:e,expectedRevision:e.draftRevision});assert.equal(e.proof,undefined);assert.equal(readDeskEdition(tmp,e.id).draftRevision,3);
 assert.equal(sha256(fs.readFileSync(path.join(tmp,'public',published.pdfUrl))),original);
});

test('editor copies full released text and saves edits to a separate draft; any further edit hides its proof',async()=>{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'public/weekly-editor.html'),'utf8'),{url:'http://localhost:3031/admin',runScripts:'outside-only'});
 try{
  dom.window.structuredClone=structuredClone;let copied='',saved=null;
  Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async t=>{copied=t;}}});
  dom.window.fetch=async(url,options)=>{let value;if(url==='/api/weekly-editor')value={drafts:[],editions:[{id:published.id,status:'published',title:published.title,period:published.period,publishedAt:published.publishedAt}]};else if(url.startsWith('/api/editions/'))value=structuredClone(published);else{const input=JSON.parse(options.body);if(url.endsWith('/create'))value={...structuredClone(published),id:'separate-draft',status:'draft',draftRevision:1};if(url.endsWith('/save')){saved=input;value={...input.edition,status:'draft',draftRevision:2};}if(url.endsWith('/preview'))value={...saved.edition,status:'draft',draftRevision:2,proof:{url:'/api/weekly-editor/proof/separate-draft',revision:2}};}return{ok:true,json:async()=>value};};
  dom.window.eval('(async()=>{'+fs.readFileSync(path.join(root,'public/js/weekly-editor.js'),'utf8')+'})()');await new Promise(r=>setTimeout(r,30));
  const doc=dom.window.document;doc.querySelector('#copy-all').click();await new Promise(r=>setTimeout(r,0));assert.ok(copied.includes(published.articleSnapshots.at(-1).bodyParagraphs.at(-1)));
  const input=doc.querySelector('#article-title');input.value='수정된 제목';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));doc.querySelector('#save').click();await new Promise(r=>setTimeout(r,20));
  assert.equal(saved.edition.id,'separate-draft');assert.equal(saved.edition.articleSnapshots[0].title,'수정된 제목');assert.equal(published.articleSnapshots[0].title.includes('수정된 제목'),false);
  doc.querySelector('#preview').click();await new Promise(r=>setTimeout(r,20));assert.equal(doc.querySelector('#proof-link').hidden,false);
  input.value='다시 수정한 제목';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.equal(doc.querySelector('#proof-link').hidden,true);
 }finally{dom.window.close();}
});
