import fs from 'node:fs';import path from 'node:path';
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
export function validateEpisode(article){
 const e=article.episode;if(!e)return;
 if(!validId(e.programId)||!/^[-_a-zA-Z0-9]{11}$/.test(e.videoId||''))throw Error('코너 ID와 원방송 ID가 필요합니다.');
 const expected='https://www.youtube.com/watch?v='+e.videoId;
 if(e.url!==expected||!article.sources?.some(s=>{try{return new URL(s.url).hostname==='www.youtube.com'&&new URL(s.url).searchParams.get('v')===e.videoId;}catch{return false;}}))throw Error('회차와 원방송 출처가 일치해야 합니다.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(e.broadcastDate||'')||!Number.isFinite(Date.parse(e.broadcastDate))||new Date(e.broadcastDate).toISOString().slice(0,10)!==e.broadcastDate)throw Error('실제 방송일이 필요합니다.');
 for(const key of ['hosts','guests'])if(!Array.isArray(e[key])||e[key].some(x=>typeof x!=='string'||!x.trim()))throw Error('진행자·출연자 목록이 필요합니다.');
 if(!e.guests.length||!Number.isFinite(e.durationSeconds)||e.durationSeconds<=0)throw Error('출연자와 원방송 길이가 필요합니다.');
}
export function readPrograms(root,articles){
 const file=path.join(root,'data/programs.json');if(!fs.existsSync(file))return {programs:[],featuredEpisodeId:null};
 const config=JSON.parse(fs.readFileSync(file,'utf8')),programs=config.programs;
 if(!Array.isArray(programs)||new Set(programs.map(p=>p.id)).size!==programs.length)throw Error('중복 없는 코너 목록이 필요합니다.');
 for(const p of programs){
  if(!validId(p.id)||!p.name?.trim()||!p.description?.trim()||!/^https:\/\//.test(p.sourceUrl||''))throw Error('코너 이름·소개·공식 출처가 필요합니다.');
  if(p.schedule&&(!Array.isArray(p.schedule.days)||!p.schedule.days.length||p.schedule.days.some(n=>!Number.isInteger(n)||n<0||n>6)||!/^https:\/\//.test(p.schedule.sourceUrl||'')||!Number.isFinite(Date.parse(p.schedule.verifiedAt))))throw Error('고정 편성에는 요일과 확인 근거가 필요합니다.');
 }
 const videos=new Set();for(const a of articles.filter(a=>a.episode)){validateEpisode(a);if(!programs.some(p=>p.id===a.episode.programId))throw Error('회차가 등록되지 않은 코너를 가리킵니다.');if(videos.has(a.episode.videoId))throw Error('같은 방송 회차가 중복 게시됐습니다.');videos.add(a.episode.videoId);}
 return {programs,featuredEpisodeId:config.featuredEpisodeId||null};
}
