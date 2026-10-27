import fs from 'node:fs';
import {contentHash} from '../../scripts/editorial-catalog.mjs';
export function fixtureEdition(){
 const article=JSON.parse(fs.readFileSync(new URL('../../data/web_articles.json',import.meta.url))).articles[0];
 const articles=Array.from({length:14},(_,i)=>{
  const a={...structuredClone(article),id:`test-${i}`,title:`시스템 검증용 기사 ${i+1}`,subtitle:'조판·출고 연결 시험',weeklyTreatment:'시스템 시험용 데이터이며 실제 발행 원고가 아님',supportingVisuals:[]};
  const pages=[2,2,2,5,5,4,4,4,4,4,3,3,2,2][i];
  a.bodyParagraphs=Array.from({length:pages*6},(_,j)=>`시험 문단 ${j+1}. 이 문장은 실제 기사 내용이 아니라 시스템 검증을 위한 자료입니다. 한글 글꼴과 문단 배치, 출처 연결 및 페이지 넘김을 검사합니다. 출고할 때는 원방송을 확인한 기사로 교체해야 합니다.`);
  a.review.contentHash=contentHash(a);return a;
 });
 return {id:'integration-proof',title:'주간 스픽스 시스템 검증호',period:'2026.10.19–10.25',introduction:['이 문서는 주간지 제작 프로그램의 연결을 시험하기 위한 자료입니다. 실제 기사로 발행하거나 독자에게 배포하지 않습니다.'],articleSnapshots:articles};
}
