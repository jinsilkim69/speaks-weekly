import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {contentHash,validateArticle} from './editorial-catalog.mjs';
import {validateArticleVisuals} from './visual-policy.mjs';

export const fileHash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function localFile(root,relative){
 const base=path.resolve(root),file=path.resolve(base,relative),rel=path.relative(base,file);
 if(rel.startsWith('..')||path.isAbsolute(rel)||!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('인계 근거 파일이 없습니다: '+relative);
 return file;
}
// This gate binds real saved work to publication; it does not claim that a model read a video.
export function assertProductionHandoff(root,record,articles){
 if(!record?.id||!record.sources?.length||!articles.length)throw Error('제작 인계와 원문이 필요합니다.');
 for(const s of record.sources)if(fileHash(localFile(root,s.file))!==s.sha256)throw Error('조사 뒤 원문이 변경됐습니다: '+s.id);
 const research=record.research||[];
 for(const r of research){
  if(!['Gemini','GPT'].includes(r.provider)||!['completed','partial','failed'].includes(r.status)||!r.scope?.trim())throw Error('조사 수행자·실제 접근 범위가 필요합니다.');
  localFile(root,r.report);
  if(r.provider==='GPT'&&!r.fallbackReason?.trim())throw Error('조사 대행 이유가 필요합니다.');
 }
 if(!research.some(r=>r.provider==='Gemini'))throw Error('Gemini 실행 또는 실패 기록이 필요합니다.');
 for(const s of record.sources)if(!research.some(r=>r.status==='completed'&&r.sourceIds?.includes(s.id)))throw Error('미완료 원문 조사가 있습니다: '+s.id);
 const writing=JSON.parse(fs.readFileSync(localFile(root,record.writing?.executionFile),'utf8'));
 if(record.writing?.provider!=='Claude'||writing.provider!=='claude-subscription-cli'||writing.state!=='completed')throw Error('Claude 구독 집필 완료 근거가 필요합니다.');
 const drafts=JSON.parse(fs.readFileSync(localFile(root,record.writing.resultFile),'utf8')).articles;
 if(articles.some(a=>!drafts.some(d=>d.id===a.id)))throw Error('Claude 집필 결과와 출고 목록이 다릅니다.');
 if(record.review?.provider!=='GPT'||!record.review.summary?.trim())throw Error('GPT 최종 검수 기록이 필요합니다.');
 for(const a of articles){
  validateArticle(a);validateArticleVisuals(a,root);
  if(record.review.articleHashes?.[a.id]!==contentHash(a))throw Error('최종 인계 뒤 원고·이미지가 변경됐습니다: '+a.id);
  if(!record.sources.some(s=>s.id===a.episode?.videoId))throw Error('원고에 대응하는 원문 인계가 없습니다.');
 }
 return {status:'ready-to-publish',articles:articles.length,researchProviders:[...new Set(research.map(r=>r.provider))],writer:'Claude',reviewer:'GPT'};
}
