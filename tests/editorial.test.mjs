import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {contentHash,validateArticle,validateEdition,readHomeCatalog} from '../scripts/editorial-catalog.mjs';
const root=new URL('../',import.meta.url).pathname.replace(/^\/([A-Z]:)/i,'$1');
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
  assert.equal(dom.window.document.querySelectorAll('#editions a').length,0);
  assert.equal(dom.window.document.querySelectorAll('.lead-story').length,1);
  dom.window.document.querySelector('#close-reader').click();
  assert.equal(dom.window.document.querySelector('#reader').open,false);
 }finally{dom.window.close();}
});
