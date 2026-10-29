import fs from 'node:fs';
import path from 'node:path';

export function writerProfiles(root){return JSON.parse(fs.readFileSync(path.join(root,'data/editorial/writer-profiles.json'),'utf8'));}
export function reporterLength(article){return [...[article.lead,...(article.bodyParagraphs||[]).filter(p=>!p.startsWith('## '))].join('\n\n')].length;}
export function reporterBrief(root,request){
 const bindings=request.articleProfiles||(request.writerProfileId?Object.fromEntries((request.articleIds||[]).map(id=>[id,request.writerProfileId])):null);
 if(!bindings)throw Error('원고별 기자 프로필(articleProfiles)을 지정하세요.');
 const config=writerProfiles(root),selected={};
 for(const [id,profileId]of Object.entries(bindings)){
  const profile=config.profiles.find(p=>p.id===profileId);if(!profile)throw Error('알 수 없는 기자 프로필: '+profileId);selected[id]=profile;
 }
 if(!Object.keys(selected).length||request.articleIds?.some(id=>!selected[id]))throw Error('모든 집필 기사에 기자 프로필을 지정하세요.');
 const skill=fs.readFileSync(path.join(root,'skills/speaks-weekly-writing/SKILL.md'),'utf8');
 const prompt=request.prompt+'\n\n[위클리 스픽스 공통 편집 기준과 배정 기자 — 앞선 상충하는 과거 분량·문체 지시를 대체]\n'+skill+'\n'+JSON.stringify({common:config.common,articleProfiles:selected},null,2)+'\n각 기사는 도입·본문 5,000~7,000자(공백 포함)로 완성하라. 제목·부제·소제목·캡션·출처 목록은 분량에서 제외한다. 길이를 위해 사실·장면·취재를 꾸미지 말라. 근거가 부족하면 그 부족을 알리고 원고를 완성본으로 처리하지 말라. 출력은 요청한 JSON 기사 배열이며 기자 메타데이터는 편집 시스템에서 배정한다.';
 return {prompt,bindings,configVersion:config.version,selected};
}
export function assignReporter(article,profile){
 return {...article,author:profile.name+' 기자',writer:{id:profile.id,name:profile.name,kind:'ai-journalist',disclosure:'AI 기자'}};
}
export function validateReporter(article,root){
 if(!article.writer)return;
 const config=writerProfiles(root),profile=config.profiles.find(p=>p.id===article.writer.id);
 if(!profile||profile.name!==article.writer.name||article.writer.kind!=='ai-journalist'||article.writer.disclosure!=='AI 기자'||article.author!==profile.name+' 기자')throw Error('AI 기자의 필명·담당·표시를 확인하세요.');
 const length=reporterLength(article),{min,max}=config.common.length;
 if(length<min||length>max)throw Error(article.id+': 도입·본문 '+length+'자 — '+min+'~'+max+'자 기준을 다시 검토하세요.');
}
