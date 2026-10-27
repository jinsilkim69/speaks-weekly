import fs from 'node:fs';
import path from 'node:path';
import {readHomeCatalog} from './editorial-catalog.mjs';

export function checkReadiness(root){
 const home=readHomeCatalog(root);
 const dir=path.join(root,'data/jobs');
 const jobs=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))):[];
 const editions=JSON.parse(fs.readFileSync(path.join(root,'data/editions.json'),'utf8')).issues;
 const published=editions.filter(i=>i.status==='published');
 const blockers=[];
 if(!published.length)blockers.push('실제 기사 14개를 갖춘 주간호의 집필·조판·시각 검수·발행이 아직 완료되지 않았습니다.');
 blockers.push('Gemini·Claude·GPT의 정기 무인 인계 및 예약 실행은 아직 연결되지 않았습니다.');
 return {state:'needs-editorial-work',publishedArticles:home.articles.length,publishedEditions:published.length,
  draftEditions:editions.filter(i=>i.status!=='published').map(i=>({id:i.id,articles:i.articleSnapshots?.length||0,required:14})),
  jobs:jobs.map(j=>({id:j.id,state:j.state,collected:j.candidates.filter(c=>c.state==='collected').length,failed:j.candidates.filter(c=>c.state==='failed').length})),
  blockers,nextAction:'수집한 자료의 근거 검토 → 원고 집필 → 편집 검토 → 홈페이지 출고 또는 주간호 재편집·PDF 조판',
  commands:{prepare:'npm run editorial:prepare -- weekly',collect:'npm run editorial:collect -- JOB SOURCE...',buildEdition:'npm run edition:build -- 주간호.json',release:'npm run editorial -- release-edition 검수완료.json'}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(import.meta.dirname,'check-readiness.mjs')){
 try{console.log(JSON.stringify(checkReadiness(path.resolve(import.meta.dirname,'..')),null,2));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
