import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {collectBroadcast} from './collect-broadcast.mjs';
const exec=promisify(execFile);
const ROOT=path.resolve(import.meta.dirname,'..');
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
export function atomicJson(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.tmp';try{fs.writeFileSync(temp,JSON.stringify(data,null,2));fs.renameSync(temp,file);}finally{fs.rmSync(temp,{force:true});}}
export function periodFor(mode,asOf){
 const raw=asOf || new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||!Number.isFinite(Date.parse(raw)))throw Error('날짜는 YYYY-MM-DD입니다.');
 const day=new Date(raw+'T00:00:00Z');if(day.toISOString().slice(0,10)!==raw)throw Error('잘못된 날짜입니다.');
 if(!['daily','weekly'].includes(mode))throw Error('daily 또는 weekly가 필요합니다.');
 const end=new Date(day);end.setUTCDate(end.getUTCDate()-(mode==='weekly'?((day.getUTCDay()+6)%7)+1:1));
 const start=new Date(end);if(mode==='weekly')start.setUTCDate(start.getUTCDate()-6);
 return {mode,start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10),timezone:'Asia/Seoul'};
}
export function inPeriod(source,period){const date=source.publishedAt?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date(source.publishedAt)):source.uploadDate?.replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3');return !!date&&date>=period.start&&date<=period.end;}
export function withLock(root,fn){
 const file=path.join(root,'data/.editorial.lock');fs.mkdirSync(path.dirname(file),{recursive:true});
 let fd;try{fd=fs.openSync(file,'wx');}catch(error){if(error.code==='EEXIST')throw Error('다른 편집 작업이 실행 중입니다. 중단된 작업이면 상태를 확인한 뒤 잠금을 복구하세요.');throw error;}
 fs.writeFileSync(fd,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));
 return Promise.resolve().then(fn).finally(()=>{fs.closeSync(fd);fs.rmSync(file,{force:true});});
}
export function recoverLock(root=ROOT){
 const file=path.join(root,'data/.editorial.lock');if(!fs.existsSync(file))return {recovered:false};
 const lock=JSON.parse(fs.readFileSync(file,'utf8'));if(!Number.isInteger(lock.pid)||lock.pid<1)throw Error('잠금 PID를 확인할 수 없습니다.');
 try{process.kill(lock.pid,0);}catch(error){if(error.code==='ESRCH'){fs.rmSync(file);return {recovered:true};}throw error;}
 throw Error('편집 프로세스가 실행 중이므로 잠금을 해제하지 않았습니다.');
}
export async function prepare({mode='daily',asOf,root=ROOT,refresh=false}={}){
 const period=periodFor(mode,asOf),id=`${mode}-${period.start}-${period.end}`;
 return withLock(root,async()=>{
  const file=path.join(root,`data/jobs/${id}.json`);
  const previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
  if(previous&&!refresh&&!previous.errors?.length)return previous;
  const results=await Promise.allSettled([
   exec('yt-dlp',['--flat-playlist','--playlist-end','300','--dump-single-json','https://www.youtube.com/@SPEAKS_TV/videos'],{windowsHide:true,timeout:120000,maxBuffer:12*1024*1024}),
   exec('python',['-X','utf8',path.join(ROOT,'scripts/collect-news.py'),'--pages','3'],{windowsHide:true,timeout:120000,maxBuffer:4*1024*1024})
  ]);
  const candidates=[],errors=[];
  if(results[0].status==='fulfilled')for(const x of JSON.parse(results[0].value.stdout).entries || []){
   if(/^[\w-]{11}$/.test(x.id))candidates.push({id:x.id,kind:'youtube',title:x.title,url:`https://www.youtube.com/watch?v=${x.id}`,views:x.view_count||0,state:'discovered',attempts:0});
  }else errors.push({stage:'youtube-discovery',message:results[0].reason.message});
  if(results[1].status==='fulfilled')for(const x of JSON.parse(results[1].value.stdout)){
   const id=new URL(x.url).searchParams.get('idxno');if(/^\d+$/.test(id))candidates.push({id:`web-${id}`,kind:'web',title:x.title,url:x.url,state:'discovered',attempts:0});
  }else errors.push({stage:'news-discovery',message:results[1].reason.message});
  const merged=new Map(candidates.map(x=>[x.id,x]));for(const item of previous?.candidates||[]){const fresh=merged.get(item.id);merged.set(item.id,fresh?{...item,...fresh,state:item.state,attempts:item.attempts,error:item.error}:item);}
  const warnings=results[1].status==='fulfilled'&&results[1].value.stderr?.includes('DISCOVERY_WARNING:')?[{stage:'news-pagination',message:results[1].value.stderr.trim().slice(0,1000)}]:[];
  const job={id,period,state:errors.length?'discovery-partial':previous?.state||'awaiting-selection',createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),errors,warnings,candidates:[...merged.values()],articleIds:previous?.articleIds||[],steps:previous?.steps||[]};atomicJson(file,job);return job;
 });
}
export async function collectJob(id,selected,{root=ROOT,retry=false}={}){
 if(!validId(id)||!selected.length||selected.some(x=>!validId(x)))throw Error('작업 ID와 수집할 출처 ID가 필요합니다.');
 return withLock(root,async()=>{
  const file=path.join(root,`data/jobs/${id}.json`),job=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const sourceId of selected)if(!job.candidates.some(x=>x.id===sourceId))throw Error('발견 목록에 없는 출처입니다: '+sourceId);
  for(const sourceId of selected){
   const item=job.candidates.find(x=>x.id===sourceId);if(!item)throw Error('발견 목록에 없는 출처입니다: '+sourceId);
   if(item.state==='collected'||item.state==='outside-period')continue;
   if(item.attempts>=3&&!retry)continue;
   item.state='collecting';item.attempts++;atomicJson(file,job);
   try{
    const target=path.join(root,`data/research/${sourceId}.json`);
    let source=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):null;
    if(!source || (item.kind==='web'&&!source.publishedAt)){
     source=item.kind==='youtube'?await collectBroadcast(item.url,{workRoot:root}):JSON.parse((await exec('python',['-X','utf8',path.join(ROOT,'scripts/collect-news.py'),'--url',item.url],{windowsHide:true,timeout:45000,maxBuffer:4*1024*1024})).stdout);
     atomicJson(target,source);
    }
    item.publishedAt=source.publishedAt||source.uploadDate;item.state=inPeriod(source,job.period)?(source.needsOriginal?'needs-original':'collected'):'outside-period';item.error=null;
   }catch(error){item.state='failed';item.error=error.message.slice(0,1000);}
   atomicJson(file,job);
  }
  job.state=job.candidates.some(x=>x.state==='collected')?'awaiting-writing':'collection-blocked';atomicJson(file,job);return job;
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [command,...args]=process.argv.slice(2);
 try{
  const result=command==='recover-lock'?recoverLock():command==='prepare'?await prepare({mode:args[0]||'daily',asOf:args[1]?.startsWith('--')?undefined:args[1],refresh:args.includes('--refresh')}):command==='collect'?await collectJob(args[0],args.slice(1).filter(x=>x!=='--retry'),{retry:args.includes('--retry')}):null;
  if(!result)throw Error('prepare daily|weekly [YYYY-MM-DD] 또는 collect JOB SOURCE... [--retry]');
  console.log(JSON.stringify(result,null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
