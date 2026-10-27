import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {validateArticleVisuals} from './visual-policy.mjs';
import {editionFingerprint,inspectPdf} from './pdf-proof.mjs';

export const contentHash = article => createHash('sha256').update(JSON.stringify({title:article.title,subtitle:article.subtitle,lead:article.lead,bodyParagraphs:article.bodyParagraphs,sources:article.sources,visual:article.visual,supportingVisuals:article.supportingVisuals,verificationNote:article.verificationNote})).digest('hex');

// Mechanical checks support a recorded editorial decision; they do not score prose quality.
export function validateArticle(article) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(article?.id||'') || typeof article.title!=='string' || !article.title.trim() || typeof article.lead!=='string' || !article.lead.trim() || !Array.isArray(article.bodyParagraphs) || !article.bodyParagraphs.length || article.bodyParagraphs.some(p=>typeof p!=='string'||!p.trim())) throw new Error('기사 본문이 필요합니다.');
  if (!article.sources?.length || article.sources.some(s => !/^https:\/\//.test(s.url) || !s.label)) throw new Error('기사 출처가 필요합니다.');
  const review = article.review;
  if (review?.status !== 'approved' || review.contentHash !== contentHash(article) || !review.summary || !review.reviewedAt) throw new Error('현재 원고에 대한 편집 검토가 필요합니다.');
  for (const field of ['evidence','analysis','counterargument','language','visual']) {
    if (!review[field]?.trim()) throw new Error(`편집 검토 누락: ${field}`);
  }
  if (!article.visual?.alt || !article.visual?.caption || !article.visual?.credit || !/^(https:\/\/|\/(?!\/))/.test(article.visual?.url||'')) throw new Error('이미지 설명과 출처가 필요합니다.');
  if (!Number.isFinite(Date.parse(article.publishedAt))) throw new Error('실제 기사 게시 시각이 필요합니다.');
  validateArticleVisuals(article);
  return article;
}

export function readHomeCatalog(root) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root,'data/web_articles.json'),'utf8'));
  const articles = catalog.articles.filter(a => a.status === 'published').map(validateArticle);
  articles.forEach(a=>validateArticleVisuals(a,root));
  if (new Set(articles.map(a=>a.id)).size !== articles.length) throw new Error('온라인 기사 ID가 중복됩니다.');
  articles.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
  const editions = JSON.parse(fs.readFileSync(path.join(root,'data/editions.json'),'utf8'));
  for (const issue of editions.issues.filter(i=>i.status === 'published')) {
    validateEdition(issue, root, {parsePdf:false});
    if (issue.articleSnapshots.every(a=>articles.some(web=>contentHash(web)===contentHash(a)))) throw new Error('주간지는 온라인 기사 합본과 구별되는 재편집이 필요합니다.');
  }
  const updatedAt=articles.map(a=>a.updatedAt||a.publishedAt).sort((a,b)=>Date.parse(b)-Date.parse(a))[0]||null;
  return { articles, updatedAt, editions:editions.issues.map(({id,title,status,period,pdfUrl,publishedAt,revisionOf,revisionSummary})=>({id,title,status,period,pdfUrl:status==='published'?pdfUrl:null,publishedAt,revisionOf,revisionSummary})) };
}

export function validateEditionContent(edition, root) {
  if(edition.pageCounts&&(!Array.isArray(edition.pageCounts)||edition.pageCounts.length!==14||edition.pageCounts.some(n=>!Number.isInteger(n)||n<1)||edition.pageCounts.reduce((n,x)=>n+x,0)!==46))throw Error('주간호 기사 편성은 14개 꼭지·46면이어야 합니다.');
  if (!edition.articleSnapshots?.length || edition.articleSnapshots.length !== 14) throw new Error('주간지 14개 꼭지의 출고 검토가 필요합니다.');
  edition.articleSnapshots.forEach(validateArticle);
  edition.articleSnapshots.forEach(a=>validateArticleVisuals(a,root));
  if (new Set(edition.articleSnapshots.map(a=>a.id)).size !== 14) throw new Error('주간지 꼭지 ID가 중복됩니다.');
  if (edition.articleSnapshots.some(a => !a.weeklyTreatment?.trim())) throw new Error('주간지 재편집 사유가 필요합니다.');
  if (edition.articleSnapshots.every(a=>a.visual.kind==='thumbnail')) throw new Error('주간호 전체를 방송 썸네일로만 편성할 수 없습니다.');
}

export function validateEdition(edition, root, {parsePdf=true}={}) {
  if (edition.status !== 'published') return;
  validateEditionContent(edition,root);
  if (!/^\/editions\/[a-zA-Z0-9._-]+\.pdf$/.test(edition.pdfUrl || '')) throw new Error('검증된 PDF 경로가 필요합니다.');
  const pdf = path.join(root,'public',edition.pdfUrl);
  if (!fs.existsSync(pdf)) throw new Error('주간지 PDF가 없습니다.');
  const hash = createHash('sha256').update(fs.readFileSync(pdf)).digest('hex');
  if (edition.pdfReview?.pages !== 50 || !edition.pdfReview?.visualCheck || edition.pdfReview.sha256 !== hash) throw new Error('현재 PDF의 50페이지·출력 검수가 필요합니다.');
  if(!edition.pdfReview.summary?.trim()||!Number.isFinite(Date.parse(edition.pdfReview.reviewedAt)))throw Error('PDF 시각 검수 내용과 시각이 필요합니다.');
  // Parse on release. Readers/builds reuse that recorded result only while the bytes match.
  const proof=parsePdf?{...inspectPdf(pdf),sha256:hash}:edition.pdfReview.structure;
  if(!proof||proof.sha256!==hash)throw Error('출고 시 생성한 PDF 구조 검사 기록이 필요합니다.');
  if(proof.pages!==50||!proof.a4||!Array.isArray(proof.emptyPages)||proof.emptyPages.length)throw Error('실제 PDF는 빈 면 없는 A4 50페이지여야 합니다.');
  if(proof.testOnly)throw Error('시스템 시험 PDF는 발행할 수 없습니다.');
  if(proof.editionHash!==editionFingerprint(edition,root))throw Error('PDF와 현재 주간호 원고·이미지가 일치하지 않습니다. 다시 조판하세요.');
  return proof;
}

export function readPublishedEdition(root,id) {
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id||''))throw Object.assign(Error('잘못된 주간호 ID'),{statusCode:400});
  const edition=JSON.parse(fs.readFileSync(path.join(root,'data/editions.json'),'utf8')).issues.find(i=>i.id===id&&i.status==='published');
  if(!edition)throw Object.assign(Error('발행된 주간호가 없습니다.'),{statusCode:404});
  validateEdition(edition,root,{parsePdf:false});return edition;
}
