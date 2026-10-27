import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {readHomeCatalog} from './editorial-catalog.mjs';

export function checkReadiness(root){
 const home=readHomeCatalog(root);
 const dir=path.join(root,'data/jobs');
 const jobs=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))):[];
 const editions=JSON.parse(fs.readFileSync(path.join(root,'data/editions.json'),'utf8')).issues;
 const published=editions.filter(i=>i.status==='published');
 const configFile=path.join(root,'data/operations-config.json');
 const config=fs.existsSync(configFile)?JSON.parse(fs.readFileSync(configFile,'utf8')):null;
 const schedules=(config?.automations||[]).map(a=>{
  const safe=/^[a-zA-Z0-9_-]+$/.test(a.id);
  const file=safe?path.join(process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),'automations',a.id,'automation.toml'):null;
  const raw=file&&fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
  const active=/^status\s*=\s*"ACTIVE"/m.test(raw)&&raw.includes(a.rrule);
  return {id:a.id,name:a.name,registeredHere:!!raw,active};
 });
 const blockers=[];
 if(!published.length)blockers.push('실제 기사 14개를 갖춘 주간호의 집필·조판·시각 검수·발행이 아직 완료되지 않았습니다.');
 if(schedules.length!==3||schedules.some(a=>!a.active))blockers.push('이 PC의 활성 정기 제작 일정 3개를 확인하지 못했습니다.');
 return {state:blockers.length?'needs-attention':'operational-with-fallback',homepageMode:home.homepageMode||'legacy-reviews',officialLinks:home.officialDirectory?.entries.length||0,preservedArticles:home.articles.length,publishedArticles:home.articles.length,publishedEditions:published.length,schedules,
  draftEditions:editions.filter(i=>i.status!=='published').map(i=>({id:i.id,articles:i.articleSnapshots?.length||0,required:14})),
  jobs:jobs.map(j=>({id:j.id,state:j.state,collected:j.candidates.filter(c=>c.state==='collected').length,failed:j.candidates.filter(c=>c.state==='failed').length})),
  blockers,observations:['서비스 접속·사용량 한도에 따라 Gemini/Claude가 실패하면 확보 원문을 내장 GPT가 대행하고 실제 작업자를 기록합니다.',config?.firstScheduledRunVerified?'예약 실행의 첫 결과를 확인했습니다.':'일정 등록은 확인했으며 첫 예약 시각의 실제 실행 결과는 아직 확인 전입니다.'],nextAction:'공식 기사 안내 목록을 갱신하고 실제 원문 조사·집필·이미지 검수를 주간지 제작에 집중합니다.',
  commands:{refreshOfficialLinks:'npm run links:refresh',prepare:'npm run editorial:prepare -- weekly',collect:'npm run editorial:collect -- JOB SOURCE...',buildEdition:'npm run edition:build -- 주간호.json',release:'npm run editorial -- release-edition 검수완료.json'}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(import.meta.dirname,'check-readiness.mjs')){
 try{console.log(JSON.stringify(checkReadiness(path.resolve(import.meta.dirname,'..')),null,2));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
