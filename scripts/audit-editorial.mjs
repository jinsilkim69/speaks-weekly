import fs from 'node:fs';
import path from 'node:path';
import {readHomeCatalog} from './editorial-catalog.mjs';
const root=path.resolve(import.meta.dirname,'..');
try {
 const home=readHomeCatalog(root);
 const jobsDir=path.join(root,'data/jobs');
 const jobs=fs.existsSync(jobsDir)?fs.readdirSync(jobsDir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(jobsDir,f),'utf8'))):[];
 const report={checkedAt:new Date().toISOString(),online:{publishedArticles:home.articles.length,latestArticleAt:home.updatedAt,sharedReviewGate:'enabled'},collection:{jobs:jobs.map(j=>({id:j.id,state:j.state,collected:j.candidates.filter(c=>c.state==='collected').length,failed:j.candidates.filter(c=>c.state==='failed').length})),localAudioFallback:'implemented; transcripts require review'},weekly:{publishedIssues:home.editions.filter(i=>i.status==='published').length,drafts:home.editions.filter(i=>i.status!=='published').length},remaining:['API 없는 에이전트 집필의 정기 실행 일정 등록 및 실운영 검증','주간호 14개 꼭지 완성 및 지면 재편집','실제 50페이지 PDF 생성·시각 검수']};
 console.log(JSON.stringify(report,null,2));
} catch(error){console.error(error.message);process.exitCode=1;}
