import fs from 'node:fs';
import path from 'node:path';
import {atomicJson,withLock} from './editorial-workflow.mjs';
import {readHomeCatalog} from './editorial-catalog.mjs';

export function cycleSlot(kind,now=new Date()){
 if(!['daily','weekly'].includes(kind))throw Error('daily 또는 weekly가 필요합니다.');
 const parts=Object.fromEntries(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 const day=`${parts.year}-${parts.month}-${parts.day}`,hour=Number(parts.hour);
 return {id:`${kind}-${day}-${String(kind==='weekly'?hour:hour>=18?18:hour>=15?15:9).padStart(2,'0')}`,day,hour,kind,timezone:'Asia/Seoul'};
}
const read=(file,fallback)=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):fallback;
export async function beginCycle(root,kind,{now=new Date()}={}){
 const slot=cycleSlot(kind,now);
 return withLock(root,()=>{
  const dir=path.join(root,'data/operations'),file=path.join(dir,'cycles',slot.id+'.json');
  const previous=read(file,null);
  if(previous?.state==='completed')return {...previous,skip:true};
  const active=read(path.join(dir,'active.json'),null);
  if(active?.state==='running'&&Date.parse(active.startedAt)>now.getTime()-2*60*60*1000)return {...active,skip:true,reason:'다른 제작 사이클이 실행 중입니다.'};
  if(active?.state==='running')throw Error('중단된 제작 사이클이 있습니다. inspect로 결과를 확인하고 fail로 종료한 뒤 재시도하세요.');
  const home=readHomeCatalog(root);
  const backlog=JSON.parse(fs.readFileSync(path.join(root,'data/editions.json'),'utf8')).issues.filter(i=>i.status!=='published');
  const state={...slot,state:'running',startedAt:now.toISOString(),attempt:(previous?.attempt||0)+1,before:{articles:home.articles.length,officialLinks:home.officialDirectory?.entries.length||0,directoryUpdatedAt:home.officialDirectory?.updatedAt||null,editions:home.editions.filter(i=>i.status==='published').length},backlog:backlog.map(i=>({id:i.id,title:i.title,articles:i.articleSnapshots?.length||0})),steps:[]};
  atomicJson(file,state);atomicJson(path.join(dir,'active.json'),state);return state;
 });
}
export async function finishCycle(root,input,{now=new Date()}={}){
 if(!/^(daily|weekly)-\d{4}-\d{2}-\d{2}-\d{2}$/.test(input?.id||'')||!['completed','failed'].includes(input?.state)||!input.summary?.trim())throw Error('사이클 ID·완료/실패 상태·실제 작업 요약이 필요합니다.');
 return withLock(root,()=>{
  const dir=path.join(root,'data/operations'),file=path.join(dir,'cycles',input.id+'.json'),state=read(file,null),active=read(path.join(dir,'active.json'),null);
  if(!state||active?.id!==input.id||active.state!=='running')throw Error('현재 실행 중인 제작 사이클이 아닙니다.');
  if(input.state==='completed'&&(!Array.isArray(input.steps)||!input.steps.length||input.steps.some(s=>!s.action?.trim()||!s.result?.trim())))throw Error('실제 단계별 결과가 필요합니다.');
  const home=readHomeCatalog(root),result={...state,state:input.state,finishedAt:now.toISOString(),summary:input.summary,steps:input.steps||[],after:{articles:home.articles.length,officialLinks:home.officialDirectory?.entries.length||0,directoryUpdatedAt:home.officialDirectory?.updatedAt||null,editions:home.editions.filter(i=>i.status==='published').length}};
  atomicJson(file,result);atomicJson(path.join(dir,'active.json'),result);return result;
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(import.meta.dirname,'production-cycle.mjs')){
 try{
  const root=path.resolve(import.meta.dirname,'..'),[command,arg]=process.argv.slice(2);
  const result=command==='begin'?await beginCycle(root,arg):command==='finish'?await finishCycle(root,JSON.parse(fs.readFileSync(arg,'utf8'))):command==='inspect'?read(path.join(root,'data/operations/active.json'),{state:'idle'}):null;
  if(!result)throw Error('production-cycle.mjs begin daily|weekly / inspect / finish 결과.json');
  console.log(JSON.stringify(result,null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
