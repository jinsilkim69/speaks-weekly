import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {contentHash,validateArticle,validateEdition} from './editorial-catalog.mjs';
import {atomicJson,withLock} from './editorial-workflow.mjs';
import {validateArticleVisuals} from './visual-policy.mjs';
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
export function drafts(root){const dir=path.join(root,'data/drafts');return fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))):[];}
export async function saveDraft(root,input){
 if(!input?.article || !validId(input.article.id))throw Object.assign(Error('올바른 기사 ID가 필요합니다.'),{statusCode:400});
 return withLock(root,async()=>{
  const file=path.join(root,`data/drafts/${input.article.id}.json`);
  const old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
  if((old?.revision||0)!==input.expectedRevision)throw Object.assign(Error('다른 편집 내용이 저장됐습니다. 다시 불러오세요.'),{statusCode:409});
  const article={...input.article,status:'draft',revision:(old?.revision||0)+1,review:{status:'pending'},savedAt:new Date().toISOString()};
  atomicJson(file,article);return article;
 });
}
export async function approveDraft(root,input){
 if(!validId(input?.id))throw Object.assign(Error('기사 ID가 필요합니다.'),{statusCode:400});
 return withLock(root,async()=>{
  const file=path.join(root,`data/drafts/${input.id}.json`),article=JSON.parse(fs.readFileSync(file,'utf8'));
  if(article.revision!==input.expectedRevision)throw Object.assign(Error('검토한 원고의 버전이 달라졌습니다.'),{statusCode:409});
  article.review={...input.review,status:'approved',reviewedAt:new Date().toISOString(),contentHash:contentHash(article)};
  validateArticle({...article,publishedAt:article.publishedAt||new Date().toISOString()});
  atomicJson(file,article);return article;
 });
}
export async function publishDraft(root,input){
 if(!validId(input?.id))throw Object.assign(Error('기사 ID가 필요합니다.'),{statusCode:400});
 return withLock(root,async()=>{
  const article=JSON.parse(fs.readFileSync(path.join(root,`data/drafts/${input.id}.json`),'utf8'));
  if(article.revision!==input.expectedRevision)throw Object.assign(Error('출고할 원고 버전이 달라졌습니다.'),{statusCode:409});
  const file=path.join(root,'data/web_articles.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
  const old=catalog.articles.find(a=>a.id===article.id);
  if(old && old.revision===article.revision && contentHash(old)===contentHash(article))return old;
  const published={...article,status:'published',publishedAt:old?.publishedAt||new Date().toISOString(),updatedAt:new Date().toISOString(),version:(old?.version||0)+1};
  validateArticle(published);
  validateArticleVisuals(published,root);
  if(old)atomicJson(path.join(root,`data/history/${old.id}-v${old.version||1}.json`),old);
  catalog.articles=catalog.articles.filter(a=>a.id!==article.id).concat(published);atomicJson(file,catalog);
  return published;
 });
}
export async function releaseEdition(root,edition){
 if(!validId(edition?.id))throw Error('주간호 ID가 필요합니다.');
 return withLock(root,async()=>{
  const file=path.join(root,'data/editions.json'),catalog=JSON.parse(fs.readFileSync(file,'utf8'));
  if(catalog.issues.some(i=>i.id===edition.id&&i.status==='published'))throw Error('발행된 주간호는 변경할 수 없습니다. 정정판 ID를 사용하세요.');
  const ready={...edition,pdfReview:{...edition.pdfReview},status:'published',publishedAt:new Date().toISOString()};
  ready.pdfReview.structure=validateEdition(ready,root);
  const web=JSON.parse(fs.readFileSync(path.join(root,'data/web_articles.json'),'utf8')).articles;
  if(ready.articleSnapshots.every(a=>web.some(w=>contentHash(w)===contentHash(a))))throw Error('온라인 기사 그대로의 합본은 출고할 수 없습니다.');
  execFileSync(process.env.SPEAKS_PYTHON||'python',['-X','utf8',path.join(import.meta.dirname,'render-cover.py'),path.join(root,'public',ready.pdfUrl),path.join(root,'public/images/editions',ready.id+'-cover.jpg')],{encoding:'utf8',windowsHide:true,timeout:30000});
  catalog.issues=catalog.issues.filter(i=>i.id!==ready.id).concat(ready);atomicJson(file,catalog);return ready;
 });
}
