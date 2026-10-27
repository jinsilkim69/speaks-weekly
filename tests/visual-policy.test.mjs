import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateVisual,validateArticleVisuals} from '../scripts/visual-policy.mjs';
import {contentHash,validateArticle} from '../scripts/editorial-catalog.mjs';
const article=JSON.parse(fs.readFileSync(new URL('../data/web_articles.json',import.meta.url))).articles[0];
test('generated images require disclosure and provenance; third-party photos require context and usage evidence',()=>{
 validateVisual(article.visual);
 assert.throws(()=>validateVisual({...article.visual,disclosure:''}),/AI 생성/);
 assert.throws(()=>validateVisual({...article.visual,rights:{status:'pending'}}),/사용 근거/);
 const photo={...article.visual,kind:'photo'};
 assert.throws(()=>validateVisual(photo),/원출처/);
 assert.throws(()=>validateVisual({...photo,sourceUrl:'https://example.com',context:'취재 현장',rights:{status:'cleared',basis:'permission',note:'허락'}}),/근거 주소/);
});
test('supporting images participate in review hash and must have valid placement',()=>{
 const edit=structuredClone(article);edit.supportingVisuals[0].caption+=' 변경';assert.notEqual(contentHash(edit),contentHash(article));assert.throws(()=>validateArticle(edit),/편집 검토/);
 const bad=structuredClone(article);bad.supportingVisuals[0].afterParagraph=999;assert.throws(()=>validateArticleVisuals(bad),/배치/);
});
