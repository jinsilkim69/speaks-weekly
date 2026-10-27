import fs from 'node:fs';
import path from 'node:path';
import {saveDraft,approveDraft,publishDraft} from './editorial-service.mjs';
const root=path.resolve(import.meta.dirname,'..');
const article=JSON.parse(fs.readFileSync(path.join(root,'data/web_articles.json'),'utf8')).articles.find(a=>a.id==='nomination-20261026');
if(article.visual.url==='/images/nomination-editorial-v1.png'){console.log('이미 반영된 시각 편집본입니다.');process.exit(0);}
const diagram={...article.visual,kind:'diagram',purpose:'공천 개혁의 정보·기회·책임이라는 세 조건을 설명',width:1000,height:680,rights:{status:'cleared',basis:'original-work',note:'편집부가 직접 작성한 SVG 개념도. 수치·통계 자료가 아님.'},afterParagraph:article.bodyParagraphs.findIndex(p=>p.startsWith('## 개방'))-1};
article.supportingVisuals=[diagram];
article.visual={kind:'generated-illustration',url:'/images/nomination-editorial-v1.png',width:1536,height:1024,purpose:'형식적 참여의 개방과 실질적인 경쟁 기회의 차이를 시각화',alt:'서로 다른 높이의 계단과 경사로에서 같은 열린 문으로 향하는 익명의 인물들을 표현한 종이 콜라주. 실제 인물이나 현장이 아니다.',caption:'같은 문을 향해도 출발선은 다를 수 있다. 공천 경쟁 기회의 차이를 표현한 개념 삽화.',credit:'주간 스픽스 · GPT 시각 기획 및 AI 이미지 생성',disclosure:'AI 생성 개념 삽화',rights:{status:'cleared',basis:'original-work',note:'내장 이미지 생성 도구로 신규 제작. 제3자 사진·로고·실존 인물 재현을 사용하지 않음.'},generation:{tool:'built-in image_gen',createdAt:new Date().toISOString(),prompt:'Original editorial paper-cut collage, anonymous people approach the same open doorway from different starting elevations, stairs and a gentle slope. Navy, teal, off-white, restrained vermilion. No text, real politicians, party logos or documentary-photo appearance. Landscape 3:2.'}};
const draftFile=path.join(root,'data/drafts/'+article.id+'.json');
const expectedRevision=fs.existsSync(draftFile)?JSON.parse(fs.readFileSync(draftFile,'utf8')).revision:0;
const review={...article.review,summary:'사용자 승인 본문 유지. Gemini 실제 자막·시각 기획 검토와 Claude 구독 캡션 검토를 받은 뒤 GPT가 실제 생성 이미지를 확인.',visual:'실제 생성 결과에서 실존 인물·로고·문자 없음 확인. 기회 차이를 설명하는 개념 삽화로 한정. Claude 지적에 따라 정보·책임은 기존 설명 도표를 본문에 함께 배치. AI 표시·사용 근거 기록.'};
const draft=await saveDraft(root,{article,expectedRevision});
await approveDraft(root,{id:article.id,expectedRevision:draft.revision,review});
const published=await publishDraft(root,{id:article.id,expectedRevision:draft.revision});
console.log(JSON.stringify({id:published.id,version:published.version,visual:published.visual.url}));
