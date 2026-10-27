import fs from 'node:fs';
import path from 'node:path';
import {readHomeCatalog} from './editorial-catalog.mjs';
const root=path.resolve(import.meta.dirname,'..');
try {
 const home=readHomeCatalog(root);
 const report={checkedAt:new Date().toISOString(),online:{publishedArticles:home.articles.length,latestArticleAt:home.updatedAt,sharedReviewGate:'enabled'},weekly:{publishedIssues:home.editions.filter(i=>i.status==='published').length,drafts:home.editions.filter(i=>i.status!=='published').length},remaining:['주간 방송 자동 선별 및 중복 수집 방지','웹 기사 수집기와 원고 출처 연결','API 없는 에이전트 집필의 정기 실행·실패 재시도','주간호 14개 꼭지 완성 및 지면 재편집','실제 50페이지 PDF 생성·시각 검수','두 매체의 정기 발행 실운영 검증']};
 console.log(JSON.stringify(report,null,2));
} catch(error){console.error(error.message);process.exitCode=1;}
