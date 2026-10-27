import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import { JSDOM } from 'jsdom';
import {contentHash,validateArticle,validateEdition,readHomeCatalog,readPublishedEdition} from '../scripts/editorial-catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const article=JSON.parse(fs.readFileSync(new URL('../data/web_articles.json',import.meta.url))).articles[0];
test('edited copy invalidates review on both publication channels',()=>{
 validateArticle(article);
 const edited=structuredClone(article);edited.bodyParagraphs.push('검토 후 추가된 주장');
 assert.throws(()=>validateArticle(edited),/편집 검토/);
 assert.throws(()=>validateEdition({status:'published',articleSnapshots:Array(14).fill(edited)},root),/편집 검토/);
 const missing=structuredClone(article);delete missing.review.counterargument;
 assert.throws(()=>validateArticle(missing),/counterargument/);
});
test('weekly release requires edition treatment and a verified PDF',()=>{
 assert.throws(()=>validateEdition({status:'published',articleSnapshots:[article]},root),/14개/);
 const items=Array.from({length:14},(_,i)=>({...structuredClone(article),id:`article-${i}`}));
 assert.throws(()=>validateEdition({status:'published',articleSnapshots:items},root),/재편집/);
 const weekly={...structuredClone(article),weeklyTreatment:'주간의 다른 자료와 비교하여 재구성'};
 assert.throws(()=>validateEdition({status:'published',articleSnapshots:items.map(a=>({...a,weeklyTreatment:weekly.weeklyTreatment}))},root),/PDF/);
});
test('homepage opens independent full article and does not offer a draft PDF',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),{url:'https://example.com/#article/'+article.id,runScripts:'outside-only'});
 try{
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new dom.window.Event('close'));};
  dom.window.fetch=async()=>({ok:true,json:async()=>({articles:[article],updatedAt:article.publishedAt,editions:[{title:'준비호',status:'draft',period:'2026.10.19–25'}]})});
  dom.window.eval(fs.readFileSync(new URL('../public/js/home.js',import.meta.url),'utf8'));
  await new Promise(r=>setTimeout(r,30));
  assert.ok(dom.window.document.querySelector('#reader').open);
  assert.ok(dom.window.document.querySelector('.article-prose').textContent.length>2500);
  assert.equal(dom.window.document.querySelectorAll('#article-content figure').length,1+(article.supportingVisuals?.length||0));
  assert.match(dom.window.document.querySelector('#article-content figcaption').textContent,/AI 생성 삽화/);
  assert.equal(dom.window.document.querySelectorAll('#editions a').length,0);
  assert.equal(dom.window.document.querySelectorAll('.lead-story').length,1);
  dom.window.document.querySelector('#close-reader').click();
  assert.equal(dom.window.document.querySelector('#reader').open,false);
 }finally{dom.window.close();}
});

test('weekly web reader uses the released snapshot, not the current homepage copy',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),{url:'https://example.com/?edition=test-issue#article/'+article.id,runScripts:'outside-only'});
 try{
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new dom.window.Event('close'));};
  let requested;
  const snapshot={...structuredClone(article),title:'주간호에 보존된 제목'};
  dom.window.fetch=async url=>{requested=url;return {ok:true,json:async()=>({id:'test-issue',title:'발행 주간호',status:'published',publishedAt:article.publishedAt,period:'시험 기간',pdfUrl:'/editions/test-issue.pdf',articleSnapshots:[snapshot]})};};
  dom.window.eval(fs.readFileSync(new URL('../public/js/home.js',import.meta.url),'utf8'));
  await new Promise(r=>setTimeout(r,30));
  assert.equal(requested,'/api/editions/test-issue.json');
  assert.equal(dom.window.document.querySelector('#article-title').textContent,snapshot.title);
  assert.equal(dom.window.document.querySelectorAll('#editions a').length,2);
  assert.match(dom.window.document.title,/주간호에 보존된 제목/);
  dom.window.document.querySelector('#close-reader').click();
  assert.match(dom.window.document.title,/발행 주간호/);
 }finally{dom.window.close();}
});

for(const issue of JSON.parse(fs.readFileSync(new URL('../data/editions.json',import.meta.url),'utf8')).issues.filter(i=>i.status==='published'))test('released issue '+issue.id+' opens all fourteen articles with complete copy and credits',async()=>{
 assert.equal(issue.articleSnapshots.length,14);
 const dom=new JSDOM(fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),{url:'https://example.com/?edition='+issue.id,runScripts:'outside-only'});
 try{
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new dom.window.Event('close'));};
  dom.window.fetch=async()=>({ok:true,json:async()=>issue});dom.window.eval(fs.readFileSync(new URL('../public/js/home.js',import.meta.url),'utf8'));
  await new Promise(r=>setTimeout(r,30));
  for(const a of issue.articleSnapshots){
   dom.window.location.hash='#article/'+a.id;dom.window.dispatchEvent(new dom.window.Event('hashchange'));
   assert.equal(dom.window.document.querySelector('#article-title').textContent,a.title);
   const copy=dom.window.document.querySelector('.article-prose').textContent;
   for(const paragraph of [a.lead,...a.bodyParagraphs])assert.ok(copy.includes(paragraph.replace(/^## /,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')),a.id);
   assert.ok([...dom.window.document.querySelectorAll('#article-content figcaption')].some(n=>n.textContent.includes(a.visual.credit)));
   assert.equal(dom.window.document.querySelectorAll('.source-box a').length,a.sources.length);
   dom.window.document.querySelector('#close-reader').click();
  }
 }finally{dom.window.close();}
});

test('all live homepage articles preserve complete copy, controls and return navigation',async()=>{
 const catalog=readHomeCatalog(root);
 const latest=catalog.editions.filter(i=>i.status==='published').sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))[0];
 catalog.editions.unshift({...latest,id:'older-issue',revisionOf:undefined,title:'이전 호',publishedAt:'2026-10-19T00:00:00.000Z'});
 const dom=new JSDOM(fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),{url:'https://example.com/',runScripts:'outside-only'});
 try{
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new dom.window.Event('close'));};
  const requests=[];
  dom.window.fetch=async url=>{requests.push(url);return {ok:true,json:async()=>url==='/api/home'?catalog:JSON.parse(fs.readFileSync(new URL('../data/editions.json',import.meta.url),'utf8')).issues.find(i=>url==='/api/editions/'+i.id+'.json')};};
  dom.window.eval(fs.readFileSync(new URL('../public/js/home.js',import.meta.url),'utf8'));
  await new Promise(r=>setTimeout(r,30));
  const doc=dom.window.document;
  assert.equal(doc.querySelector('#weekly').hidden,true);
  assert.equal(doc.querySelectorAll('.weekday-section').length,7);
  assert.equal(doc.querySelector('.issue-title').textContent,latest.title);
  assert.deepEqual(requests,['/api/home']);
  assert.match(doc.querySelector('.issue-archive').textContent,/이전 호/);
  for(const a of catalog.articles){
   if(catalog.homepageMode!=='official-links')assert.ok(doc.querySelector(`main a[href="#article/${a.id}"]`),a.id);
   dom.window.location.hash='#article/'+a.id;dom.window.dispatchEvent(new dom.window.Event('hashchange'));
   const copy=doc.querySelector('.article-prose').textContent;
   for(const paragraph of [a.lead,...a.bodyParagraphs])assert.ok(copy.includes(paragraph.replace(/^## /,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')),a.id);
   assert.equal(doc.querySelectorAll('.source-box a').length,a.sources.length);
   assert.match(doc.querySelector('#article-content .byline').textContent,/편집부/);
   doc.querySelector('#font-up').click();assert.ok(parseInt(doc.querySelector('#reader').style.getPropertyValue('--reading-size'))>=20);
   doc.querySelector('#bottom-close').click();assert.equal(doc.querySelector('#reader').open,false);assert.equal(doc.body.style.overflow,'');
  }
  dom.window.location.hash='#article/missing';dom.window.dispatchEvent(new dom.window.Event('hashchange'));
  assert.match(doc.querySelector('#article-content').textContent,/기사를 찾을 수 없습니다/);
  doc.querySelector('#close-reader').click();assert.equal(dom.window.location.hash,'');
 }finally{dom.window.close();}
});

test('network retry and missing images leave a readable recovery path',async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),{url:'https://example.com/',runScripts:'outside-only'});
 try{
  let failed=true;
  dom.window.fetch=async()=>({ok:!failed,json:async()=>({articles:[article],updatedAt:article.publishedAt,editions:[]})});
  dom.window.eval(fs.readFileSync(new URL('../public/js/home.js',import.meta.url),'utf8'));
  await new Promise(r=>setTimeout(r,30));
  assert.ok(dom.window.document.querySelector('#retry'));
  failed=false;dom.window.document.querySelector('#retry').click();await new Promise(r=>setTimeout(r,30));
  assert.equal(dom.window.document.querySelector('#retry'),null);
  const img=dom.window.document.querySelector('#lead img');img.dispatchEvent(new dom.window.Event('error'));
  assert.match(dom.window.document.querySelector('.image-unavailable').textContent,/본문은 계속/);
  assert.ok(dom.window.document.querySelector('#lead h1 a'));
 }finally{dom.window.close();}
});


test('superseded edition API points to newest family member without changing archived copy',()=>{
 const issues=JSON.parse(fs.readFileSync(new URL('../data/editions.json',import.meta.url),'utf8')).issues.filter(i=>i.status==='published');
 const original=issues.find(i=>i.id==='2026-10-26');
 const latest=issues.filter(i=>i.id===original.id||i.revisionOf===original.id).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))[0];
 const served=readPublishedEdition(root,original.id);
 assert.equal(served.supersededBy,latest.id);
 assert.deepEqual(served.articleSnapshots,original.articleSnapshots);
});

for(const archive of [false,true])test('old article links '+(archive?'explicitly preserve labelled archive':'resolve to corrected edition'),async()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'),{url:'https://example.com/?edition=old'+(archive?'&archive=1':'')+'#article/'+article.id,runScripts:'outside-only'});
 try{
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
  const original={id:'old',title:'이전 판',status:'published',period:'기간',publishedAt:article.publishedAt,pdfUrl:'/editions/old.pdf',supersededBy:'corrected',articleSnapshots:[{...structuredClone(article),title:'이전 원고'}]};
  const latest={...original,id:'corrected',title:'교정판',supersededBy:null,articleSnapshots:[{...structuredClone(article),title:'교정한 원고'}]};
  const requests=[];dom.window.fetch=async url=>{requests.push(url);return {ok:true,json:async()=>url.includes('/old.json')?original:latest};};
  dom.window.eval(fs.readFileSync(new URL('../public/js/home.js',import.meta.url),'utf8'));
  await new Promise(r=>setTimeout(r,30));
  const doc=dom.window.document;
  assert.equal(doc.querySelector('#article-title').textContent,archive?'이전 원고':'교정한 원고');
  assert.equal(doc.querySelector('.article-prose').firstElementChild.textContent,article.lead);
  assert.equal(new URL(dom.window.location.href).searchParams.get('edition'),archive?'old':'corrected');
  if(archive){assert.equal(requests.length,1);assert.match(doc.querySelector('#article-content .archive-notice').textContent,/최신판/);}
  else assert.deepEqual(requests,['/api/editions/old.json','/api/editions/corrected.json']);
 }finally{dom.window.close();}
});
