import fs from 'node:fs';
import path from 'node:path';
const day=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export function validateOfficialDirectory(data,programs){
 if(data?.mode!=='official-links'||!Array.isArray(data.entries)||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('공식 기사 목록 형식이 필요합니다.');
 const p=data.reviewPeriod;
 if(!day(p?.start)||!day(p?.end)||new Date(p.start).getUTCDay()!==1||Date.parse(p.end)-Date.parse(p.start)!==6*86400000)throw Error('공식 목록 기간은 월요일부터 일요일까지입니다.');
 const urls=new Set();
 for(const e of data.entries){
  if(!/^official-\d+$/.test(e.id||'')||!e.title?.trim()||e.title!==e.verifiedTitle)throw Error('공식 원문 제목을 그대로 유지해야 합니다.');
  if(e.url!==`https://www.speaks.kr/news/articleView.html?idxno=${e.id.slice(9)}`||urls.has(e.url))throw Error('중복 없는 공식 기사 주소가 필요합니다.');urls.add(e.url);
  if(!programs.some(p=>p.id===e.programId))throw Error('등록된 코너가 필요합니다.');
  if(!Number.isFinite(Date.parse(e.publishedAt))||!Number.isFinite(Date.parse(e.verifiedAt))||!e.verification?.trim()||!day(e.displayDate))throw Error('공식 입력일·확인 기록이 필요합니다.');
  if(e.broadcastDate){if(!day(e.broadcastDate)||e.dateBasis!=='article-broadcast-date'||e.displayDate!==e.broadcastDate)throw Error('확인된 방송일 기준이 필요합니다.');}
  else if(e.dateBasis!=='published'||e.displayDate!==new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(e.publishedAt)))throw Error('방송일 미확인 기사는 게시일로 구분해야 합니다.');
  if(e.videoUrl&&!/^https:\/\/www\.youtube\.com\/watch\?v=[-_a-zA-Z0-9]{11}$/.test(e.videoUrl))throw Error('확인된 원본 영상 주소만 표시합니다.');
 }
 return data;
}
export function readOfficialDirectory(root,programs){const file=path.join(root,'data/official-links.json');if(fs.existsSync(file))return validateOfficialDirectory(JSON.parse(fs.readFileSync(file,'utf8')),programs);const config=path.join(root,'data/operations-config.json');if(fs.existsSync(config)&&JSON.parse(fs.readFileSync(config,'utf8')).homepagePolicy==='official-title-and-source-links')throw Error('공식 안내 목록이 없습니다. 이전 자체 리뷰로 대체하지 않습니다.');return null;}
