import fs from 'node:fs';
import path from 'node:path';
export const visualKinds=['photo','video-still','thumbnail','generated-illustration','diagram'];
export function validateVisual(v){
 if(!v||!visualKinds.includes(v.kind)||!v.purpose?.trim())throw Error('이미지 종류와 기사에서의 역할이 필요합니다.');
 if(!v.alt?.trim()||!v.caption?.trim()||!v.credit?.trim()||!/^(https:\/\/|\/(?!\/))/.test(v.url||''))throw Error('이미지 설명과 출처가 필요합니다.');
 if(v.rights?.status!=='cleared'||!['original-work','permission','license'].includes(v.rights?.basis)||!v.rights?.note?.trim())throw Error('이미지 사용 근거 확인이 필요합니다.');
 if(v.rights.basis!=='original-work'&&!/^https:\/\//.test(v.rights.referenceUrl||''))throw Error('사용 허락·라이선스 근거 주소가 필요합니다.');
 if(['photo','video-still','thumbnail'].includes(v.kind)&&(!/^https:\/\//.test(v.sourceUrl||'')||!v.context?.trim()))throw Error('사진 원출처와 촬영·방송 맥락이 필요합니다.');
 if(v.kind==='video-still'&&(!Number.isFinite(v.timestamp)||v.timestamp<0))throw Error('방송 스틸의 시간표시가 필요합니다.');
 if(v.kind==='generated-illustration'&&(!v.disclosure?.includes('AI')||!v.generation?.prompt||!v.generation?.tool))throw Error('AI 생성 표시와 제작 기록이 필요합니다.');
 if(!Number.isInteger(v.width)||!Number.isInteger(v.height)||v.width<1||v.height<1)throw Error('이미지 크기가 필요합니다.');
 return v;
}
export function validateArticleVisuals(article,root){
 const secondary=article.supportingVisuals||[];
 for(const v of [article.visual,...secondary]){
  validateVisual(v);
  if(root&&v.url.startsWith('/')){
   const base=path.resolve(root,'public'),file=path.resolve(base,'.'+v.url),relative=path.relative(base,file);
   if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('이미지 파일이 없거나 공개 폴더 밖입니다: '+v.url);
  }
 }
 for(const v of secondary)if(!Number.isInteger(v.afterParagraph)||v.afterParagraph<0||v.afterParagraph>=article.bodyParagraphs.length)throw Error('본문 이미지 배치 위치가 잘못됐습니다.');
}
