import fs from 'node:fs';
import path from 'node:path';
import {atomicJson,withLock} from './editorial-workflow.mjs';
import {contentHash,readPublishedEdition,validateEditionContent} from './editorial-catalog.mjs';
import {buildEdition} from './build-edition.mjs';
import {approvalFingerprint} from './publication-approval.mjs';
const valid=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
const file=(root,id)=>{if(!valid(id))throw Error('주간호 ID를 확인하세요.');return path.join(root,'data/edition-drafts',id+'.json');};
export function readDeskEdition(root,id){const p=file(root,id);if(!fs.existsSync(p))throw Object.assign(Error('저장된 편집본이 없습니다.'),{statusCode:404});return JSON.parse(fs.readFileSync(p,'utf8'));}
export function deskEditions(root){const dir=path.join(root,'data/edition-drafts');return fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))).map(({id,title,period,draftRevision,savedAt,articleSnapshots,proof})=>({id,title,period,draftRevision,savedAt,articles:articleSnapshots.length,proof})):[];}
export async function createDeskEdition(root,input){
 const published=readPublishedEdition(root,input.sourceId),id=input.id||published.id+'-edit-'+Date.now();
 return withLock(root,()=>{const p=file(root,id);if(fs.existsSync(p))throw Error('같은 편집본이 있습니다.');
 const edition={...structuredClone(published),id,status:'draft',revisionOf:published.revisionOf||published.id,draftRevision:1,savedAt:new Date().toISOString(),layout:{...published.layout,publicationName:'위클리 스픽스',autoExpand:true,compactFlow:true}};
 const config=path.join(root,'data/editorial/writer-profiles.json');
 if(fs.existsSync(config)){const leaders=JSON.parse(fs.readFileSync(config,'utf8')).leadership;if(leaders)edition.staff={publisher:leaders.publisher.name,editorInChief:leaders.editorInChief.name,editorCredentials:leaders.editorInChief.credential,production:leaders.production};}
 delete edition.pdfReview;delete edition.proof;delete edition.publicationApproval;delete edition.publicationRequest;delete edition.supersededBy;delete edition.publishedAt;edition.pageCounts=edition.articleSnapshots.map(()=>1);atomicJson(p,edition);return edition;});
}
export async function saveDeskEdition(root,input){return withLock(root,()=>{
 const e=structuredClone(input.edition),p=file(root,e?.id),old=readDeskEdition(root,e.id);
 if(input.expectedRevision!==old.draftRevision)throw Object.assign(Error('다른 창에서 저장한 편집본이 있습니다. 다시 불러오세요.'),{statusCode:409});
 if(!e.title?.trim()||!Array.isArray(e.introduction)||!e.introduction.length||!Array.isArray(e.articleSnapshots)||!e.articleSnapshots.length||e.articleSnapshots.length>80)throw Error('주간호 제목·발행인의 말·1~80개 원고가 필요합니다.');
 if(new Set(e.articleSnapshots.map(a=>a.id)).size!==e.articleSnapshots.length||e.articleSnapshots.some(a=>!valid(a.id)))throw Error('기사 ID는 중복되지 않아야 합니다.');
 for(const a of e.articleSnapshots){const before=old.articleSnapshots.find(x=>x.id===a.id);a.review=before&&contentHash(a)===contentHash(before)&&a.author===before.author&&a.category===before.category?before.review:{...before?.review,status:'pending'};}
 Object.assign(e,{status:'draft',draftRevision:old.draftRevision+1,savedAt:new Date().toISOString(),layout:{...e.layout,publicationName:'위클리 스픽스',compactFlow:true,autoExpand:true},pageCounts:e.articleSnapshots.map(()=>1)});
 delete e.pdfReview;delete e.proof;delete e.publicationApproval;delete e.publicationRequest;delete e.publishedAt;delete e.supersededBy;
 atomicJson(path.join(root,'data/edition-history',e.id+'-r'+old.draftRevision+'.json'),old);atomicJson(p,e);return e;
});}
export async function reviewDeskEdition(root,input){return withLock(root,()=>{
 const e=readDeskEdition(root,input.id);if(e.draftRevision!==input.expectedRevision)throw Object.assign(Error('원고 버전이 달라졌습니다.'),{statusCode:409});
 if(input.confirmed!==true||!input.summary?.trim())throw Error('현재 편집본의 원문·문체·이미지를 확인한 뒤 검토 내용을 남겨 주세요.');
 for(const a of e.articleSnapshots)a.review={status:'approved',reviewedAt:new Date().toISOString(),contentHash:contentHash(a),summary:input.summary,evidence:input.evidence||'편집자가 이 버전의 출처·화자·수치를 대조했다고 확인함',analysis:input.analysis||'편집자가 핵심 내용과 설명의 충실성을 확인함',counterargument:input.counterargument||'편집자가 주장·반론·전망의 귀속을 확인함',language:input.language||'편집자가 현재 문장과 문단을 확인함',visual:input.visual||'편집자가 사진·삽화의 내용과 출처를 확인함'};
 validateEditionContent(e,root);e.draftRevision++;e.savedAt=new Date().toISOString();delete e.proof;delete e.pdfReview;delete e.publicationApproval;delete e.publicationRequest;atomicJson(file(root,e.id),e);return e;
});}
export async function completeDeskEdition(root,input){
 if(input.confirmed!==true||input.publishConfirmed!==true||!input.summary?.trim())throw Error('사용자가 원고 검수와 PDF 발행 승인을 확인해야 합니다.');
 // The ordinary review button never grants release permission.
 const reviewed=await reviewDeskEdition(root,input);
 return withLock(root,()=>{
  const e=readDeskEdition(root,input.id);
  if(e.draftRevision!==reviewed.draftRevision)throw Object.assign(Error('검수 중 원고가 수정됐습니다. 다시 확인하세요.'),{statusCode:409});
  const now=new Date().toISOString();
  e.publicationApproval={method:'admin-complete',revision:e.draftRevision,fingerprint:approvalFingerprint(e,root),confirmedAt:now,summary:input.summary.trim()};
  e.publicationRequest={state:'queued',requestedAt:now,message:'사용자 검수 완료. PDF 조판·최종 검사 후 발행 대기.'};
  atomicJson(file(root,e.id),e);return e;
 });
}
export async function previewDeskEdition(root,input){
 const e=readDeskEdition(root,input.id);if(e.draftRevision!==input.expectedRevision)throw Object.assign(Error('저장된 버전이 달라졌습니다.'),{statusCode:409});
 const result=await buildEdition(root,e,{previewOnly:true});
 return withLock(root,()=>{const latest=readDeskEdition(root,e.id);if(latest.draftRevision!==e.draftRevision)throw Object.assign(Error('조판 중 원고가 수정됐습니다. 다시 시안을 만드세요.'),{statusCode:409});
 latest.proof={pages:result.proof.pages,revision:e.draftRevision,createdAt:new Date().toISOString(),url:'/api/weekly-editor/proof/'+encodeURIComponent(e.id),unpublished:true};atomicJson(file(root,e.id),latest);return latest;});
}
