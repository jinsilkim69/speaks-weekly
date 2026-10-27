import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {validateArticleVisuals} from './visual-policy.mjs';

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
    validateEdition(issue, root);
    if (issue.articleSnapshots.every(a=>articles.some(web=>contentHash(web)===contentHash(a)))) throw new Error('주간지는 온라인 기사 합본과 구별되는 재편집이 필요합니다.');
  }
  const updatedAt=articles.map(a=>a.updatedAt||a.publishedAt).sort((a,b)=>Date.parse(b)-Date.parse(a))[0]||null;
  return { articles, updatedAt, editions:editions.issues.map(({id,title,status,period,pdfUrl,publishedAt})=>({id,title,status,period,pdfUrl:status==='published'?pdfUrl:null,publishedAt})) };
}

export function validateEdition(edition, root) {
  if (edition.status !== 'published') return;
  if (!edition.articleSnapshots?.length || edition.articleSnapshots.length !== 14) throw new Error('주간지 14개 꼭지의 출고 검토가 필요합니다.');
  edition.articleSnapshots.forEach(validateArticle);
  edition.articleSnapshots.forEach(a=>validateArticleVisuals(a,root));
  if (new Set(edition.articleSnapshots.map(a=>a.id)).size !== 14) throw new Error('주간지 꼭지 ID가 중복됩니다.');
  if (edition.articleSnapshots.some(a => !a.weeklyTreatment?.trim())) throw new Error('주간지 재편집 사유가 필요합니다.');
  if (edition.articleSnapshots.every(a=>a.visual.kind==='thumbnail')) throw new Error('주간호 전체를 방송 썸네일로만 편성할 수 없습니다.');
  if (!/^\/editions\/[a-zA-Z0-9._-]+\.pdf$/.test(edition.pdfUrl || '')) throw new Error('검증된 PDF 경로가 필요합니다.');
  const pdf = path.join(root,'public',edition.pdfUrl);
  if (!fs.existsSync(pdf)) throw new Error('주간지 PDF가 없습니다.');
  const hash = createHash('sha256').update(fs.readFileSync(pdf)).digest('hex');
  if (edition.pdfReview?.pages !== 50 || !edition.pdfReview?.visualCheck || edition.pdfReview.sha256 !== hash) throw new Error('현재 PDF의 50페이지·출력 검수가 필요합니다.');
}
