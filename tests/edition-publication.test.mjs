import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildEdition} from '../scripts/build-edition.mjs';
import {contentHash,validateEdition,readPublishedEdition} from '../scripts/editorial-catalog.mjs';
import {releaseEdition} from '../scripts/editorial-service.mjs';
import {atomicJson} from '../scripts/editorial-workflow.mjs';
import {sha256,inspectPdf} from '../scripts/pdf-proof.mjs';
import {execFileSync} from 'node:child_process';

import {fixtureEdition} from './fixtures/edition.mjs';

test('real 50-page PDF, content binding, proof rejection and immutable release',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-edition-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(new URL('../public/images',import.meta.url),path.join(root,'public/images'),{recursive:true});
 atomicJson(path.join(root,'data/editions.json'),{issues:[]});atomicJson(path.join(root,'data/web_articles.json'),{articles:[]});
 const edition=fixtureEdition();
 let result=await buildEdition(root,edition,{testOnly:true});
 assert.equal(result.proof.pages,50);assert.deepEqual(result.proof.emptyPages,[]);assert.equal(result.proof.a4,true);
 const releaseInput=()=>{
  const e=JSON.parse(fs.readFileSync(result.input,'utf8'));e.status='published';
  e.pdfReview={...e.pdfReview,visualCheck:true,summary:'Isolated automated publication test, never a real release',reviewedAt:new Date().toISOString()};
  fs.mkdirSync(path.join(root,'public/editions'),{recursive:true});fs.copyFileSync(result.output,path.join(root,'public',e.pdfUrl));return e;
 };
 assert.throws(()=>validateEdition(releaseInput(),root),/시험 PDF/);
 result=await buildEdition(root,edition);const ready=releaseInput();
 validateEdition(ready,root);
 const changed=structuredClone(ready);changed.articleSnapshots[0].title='검수 후 바뀐 제목';changed.articleSnapshots[0].review.contentHash=contentHash(changed.articleSnapshots[0]);
 assert.throws(()=>validateEdition(changed,root),/일치하지/);
 const fake=path.join(root,'public',ready.pdfUrl);fs.writeFileSync(fake,'not a PDF');ready.pdfReview.sha256=sha256(fs.readFileSync(fake));
 assert.throws(()=>validateEdition(ready,root),/검사 실패/);
 fs.copyFileSync(result.output,fake);ready.pdfReview.sha256=sha256(fs.readFileSync(fake));
 await releaseEdition(root,ready);assert.equal(readPublishedEdition(root,ready.id).articleSnapshots.length,14);
 const cover=fs.readFileSync(path.join(root,'public/images/editions',ready.id+'-cover.jpg'));
 assert.equal(cover.readUInt16BE(0),0xffd8);assert.ok(cover.length>1000);
 // Static deployment must use the released snapshot and exclude an unpublished proof.
 // Images were copied before rendering; re-copying that open directory can fail on Windows.
 for(const folder of ['public','scripts'])fs.cpSync(new URL('../'+folder,import.meta.url),path.join(root,folder),{recursive:true,filter:source=>folder!=='public'||path.basename(source)!=='images'});
 fs.copyFileSync(new URL('../package.json',import.meta.url),path.join(root,'package.json'));
 fs.copyFileSync(new URL('../data/current_issue.json',import.meta.url),path.join(root,'data/current_issue.json'));
 fs.writeFileSync(path.join(root,'public/editions/private-draft.pdf'),'unpublished');
 execFileSync(process.execPath,['scripts/export-static.mjs'],{cwd:root,stdio:'pipe'});
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'dist/api/editions/integration-proof.json'))).articleSnapshots.length,14);
 assert.equal(fs.existsSync(path.join(root,'dist/editions/private-draft.pdf')),false);
 assert.equal(fs.existsSync(path.join(root,'dist/editions/integration-proof.pdf')),true);
 assert.throws(()=>readPublishedEdition(root,'missing'),/없습니다/);
 await assert.rejects(releaseEdition(root,ready),/변경할 수 없습니다/);
 await assert.rejects(buildEdition(root,edition),/덮어쓸/);
 assert.equal(inspectPdf(fake).pages,50);
});

test('incomplete issue and overflowing article fail instead of padding or truncating',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-overflow-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(new URL('../public/images',import.meta.url),path.join(root,'public/images'),{recursive:true});
 const edition=fixtureEdition();
 await assert.rejects(buildEdition(root,{...edition,articleSnapshots:edition.articleSnapshots.slice(0,1)}),/14개/);
 const a=edition.articleSnapshots[0];a.bodyParagraphs=Array(80).fill(a.bodyParagraphs[0]);a.review.contentHash=contentHash(a);
 await assert.rejects(buildEdition(root,edition,{testOnly:true}),/overflow/);
 assert.equal(fs.existsSync(path.join(root,'output/pdf',edition.id,'proof.tmp.pdf')),false);
});

test('variable page editions grow to preserve copy and bind actual pages to the release',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-variable-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(new URL('../public/images',import.meta.url),path.join(root,'public/images'),{recursive:true});
 const edition=fixtureEdition();edition.id='variable-proof';edition.layout={autoExpand:true};edition.pageCounts=[3,2,2,5,5,4,4,4,4,4,3,3,2,2];
 const a=edition.articleSnapshots[0];a.bodyParagraphs=Array.from({length:24},(_,n)=>`가변 지면 시험 ${n+1}. `+a.bodyParagraphs[0]);a.review.contentHash=contentHash(a);
 const result=await buildEdition(root,edition);const ready=JSON.parse(fs.readFileSync(result.input,'utf8'));
 assert.ok(result.proof.pages>50);assert.equal(result.proof.pages,4+ready.pageCounts.reduce((n,x)=>n+x,0));
 ready.status='published';ready.pdfReview={...ready.pdfReview,visualCheck:true,summary:'Variable layout test only',reviewedAt:new Date().toISOString()};fs.mkdirSync(path.join(root,'public/editions'),{recursive:true});fs.copyFileSync(result.output,path.join(root,'public',ready.pdfUrl));validateEdition(ready,root);
 const wrong=structuredClone(ready);wrong.pdfReview.pages=50;assert.throws(()=>validateEdition(wrong,root),/편성과/);
});
