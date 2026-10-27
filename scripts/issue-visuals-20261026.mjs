import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'public/images/issue-20261026');fs.mkdirSync(dir,{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text=(x,y,s,size=28,color='#17333f')=>`<text x="${x}" y="${y}" font-family="Malgun Gothic" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const box=(x,y,w,h,color)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${color}"/>`;
const frame=(title,content,note)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">${box(0,0,1200,800,'#f4f0e7')}${text(70,80,'SPEAKS WEEKLY / 설명 도표',20,'#637276')}${text(70,150,title,40)}${content}<path d="M70 704H1130" stroke="#c7ccca"/>${text(70,748,note,19,'#526368')}</svg>`;
const cards=(labels,details)=>labels.map((s,i)=>`${box(70+i%2*550,215+Math.floor(i/2)*215,510,180,i%2?'#dde8e4':'#e4e8ed')}${text(100+i%2*550,275+Math.floor(i/2)*215,s,32)}${text(100+i%2*550,325+Math.floor(i/2)*215,details[i],23)}`).join('');
const definitions={
 'radar-survey':{title:'같은 응답자, 다섯 개의 선택지',svg:frame('공개된 세 응답 비율은 이렇게 다르다',`${box(75,245,15*10,90,'#b65c3d')}${box(225,245,52*10,90,'#aab8b7')}${box(745,245,32.6*10,90,'#285567')}${text(75,410,'긍정 15%',36)}${text(425,410,'보통 52%',36)}${text(800,410,'부정 32.6%',36)}${text(75,510,'캠퍼스 대면 모집 · 연구소 발표 결과',27)}${text(75,570,'선택지·표집이 다른 조사와 단순 비교 금지',27)}`,'출처: 청년오늘연구소 방송 설명. 합계 99.6%; 나머지 0.4%p 설명 미확인.'),caption:'연구소가 발표한 긍정·보통·부정 비율. 서로 다른 표집·문항의 조사와 직접 비교할 수 없다.'},
 'radar-grid':{svg:frame('113조 원과 25조 원은 다른 질문이다',cards(['113조 원','25조 원'],['2038년까지 전체 망 투자 추산','기업 전기요금 선납 제안'])+text(95,565,'총투자 추산 ≠ 자금 조달 방식',39),'출처: 스픽스 2026.10.23 이슈 기사. 두 금액을 더하거나 빼지 않는다.'),caption:'전체 망 투자 추산액과 전기요금 선납 제안은 범위와 성격이 달라 합산할 수 없다.'},
 'radar-rumour':{svg:frame('재인용이 늘어도 증거는 늘지 않는다',cards(['최초 게시물','여러 매체의 소개','독립된 증거','추가 검증'],['주장의 출발점','같은 자료를 인용할 수 있다','원본·시점·출처를 확인','사실 여부는 별도로 판단']),'특정 전파량을 계량한 그래프가 아닌, 재인용 구조를 설명하는 개념도.'),caption:'여러 매체의 보도가 같은 게시물을 인용하면 독립적인 확인이 늘어난 것은 아니다. 개념도.'},
 'cover-growth':{svg:frame('성장과 분배를 잇는 정책의 경로',cards(['산업에 투자','일할 기회','생활의 안전','지속 가능한 재원'],['설비·기술·기업의 역량','첫 경력·훈련·거래 확대','주거·돌봄·재기의 기반','경기 하강기에도 이어갈 조건']),'편집부가 제안한 정책 평가 틀. 확정 사업·성과를 표시한 도표가 아니다.'),caption:'산업 투자에서 고용과 생활 개선으로 이어지는 경로를 정책 안에 설계해야 한다는 편집부의 평가 틀.'},
 'desk-youth':{svg:frame('캠퍼스 대면 조사의 읽는 순서',cards(['누구에게 물었나','어떻게 물었나','무엇을 골랐나','어디까지 말할 수 있나'],['회원들이 캠퍼스에서 모집','설문지를 통한 대면 응답','다섯 단계 직무 평가','전국 청년 대표성은 별도 검토']),'자료: 스픽스 특집인터뷰의 자동 자막 및 10월25일 신문 기사.'),caption:'조사 결과를 해석하려면 모집·문항·응답·일반화의 범위를 차례로 구분해야 한다.'},
 'desk-wonsan':{svg:frame('관광은 호텔 한 채로 완성되지 않는다',cards(['방문과 이동','전기와 운영','교통과 연결','주민과 지역'],['관광객이 갈 수 있는 범위','시설을 계속 가동할 조건','목적지까지 도달하는 길','관광의 편익이 돌아갈 곳']),'방송 논점에서 재구성한 조건도. 실제 지리·설비 실태를 실측한 지도가 아니다.'),caption:'원산 관광 대담에서 검토할 조건을 정리했다. 실제 현장이나 시설을 촬영한 자료가 아니다.'},
 'desk-court':{svg:frame('사법개혁에서 나눠 볼 세 질문',cards(['사법의 독립','법관의 독립','수장의 권한','입법의 한계'],['외부의 부당한 개입 방지','내부의 부당한 영향도 경계','역할과 견제 장치의 설계','헌법과 개별 재판의 독립 존중']),'김해원 제안에 관한 신문 자료를 읽는 개념도. 확정된 개정 법률 도표가 아니다.'),caption:'사법부의 독립과 사법부 수장의 권한 집중은 구분해 검토해야 한다. 제안 분석용 개념도.'},
 'opinion-tax':{svg:frame('다른 자산에도 같은 설명 책임을',cards(['어떤 소득인가','손실은 어떻게 반영하나','지원의 목적은 무엇인가','예외는 언제 끝나나'],['과세 대상의 범위','순이익을 판단할 기준','혜택의 대상과 필요성','종료·재검토 조건']),'편집부의 조세 형평 평가 질문. 현행 세율·세무 처리 안내가 아니다.'),caption:'같은 세율을 강제하는 것과 다른 과세의 이유를 설명하라고 요구하는 것은 다르다.'},
 'world-armistice':{svg:frame('전투 중지 이후에도 남는 과제',cards(['전투를 멈추기','중단을 감시하기','안전을 보장하기','정치적으로 해결하기'],['휴전의 첫 목표','위반 여부와 대응 절차','당사자가 수용할 장치','장기 갈등과 권리의 문제']),'휴전 논의를 읽는 개념도. 실제 협상 합의나 일정이 아니다.'),caption:'휴전과 장기 평화는 같은 단계가 아니다. 감시·안보 보장·정치적 해결이 각각 필요하다는 분석 틀.'},
 'culture-memory':{svg:frame('추억을 남기는 방식도 선택이다',cards(['재현된 과거','그곳의 노동','현재의 주민','제작의 배경'],['방문객에게 보여 주는 장면','관광 장면 뒤에 있는 삶','관광 공간을 함께 사용하는 사람','지원·협찬 여부의 공개']),'스픽스 10월4일 장생포 소개를 계기로 한 문화 비평의 질문. 현장 기록이 아니다.'),caption:'지역의 과거를 관광 콘텐츠로 만들 때 추억과 함께 살펴야 할 노동·주민·제작 배경의 문제.'},
 'local-dialogue':{svg:frame('시민 대화의 결과는 어디로 가는가',cards(['참여자를 모집','관점의 범위를 확인','과정을 기록','정책으로 환류'],['공개된 초대와 진입 기회','누가 포함되고 빠졌는지','동의와 이견을 함께 남기기','반영 여부와 사유를 설명']),'편집부의 숙의 설계 제안. 10월23일 행사의 실제 결과를 표시한 도표가 아니다.'),caption:'시민 대화가 정책에 연결되려면 모집부터 결과의 활용까지 확인할 수 있어야 한다. 설계 제안.'},
 'reading-record':{svg:frame('공적 기록을 읽는 네 가지 질문',cards(['무엇을 약속했나','언제까지인가','무엇을 투입하나','무엇이 달라졌나'],['행동과 대상을 구체화','발언과 이행 시점을 구분','예산·담당 기관·제도','후속 조치와 공개된 결과']),'연설문집 소개를 계기로 제안하는 기록 읽기법. 책의 실제 목차가 아니다.'),caption:'공적 발언을 날짜·대상·재원·후속 조치와 함께 읽자는 편집부의 독서 제안.'}
};
const visuals={};
for(const [id,d] of Object.entries(definitions)){
 const file=id+'-v1.svg';fs.writeFileSync(path.join(dir,file),d.svg);
 visuals[id+'-20261026']={kind:'diagram',purpose:'기사의 구체적 질문과 해석 범위를 설명',url:'/images/issue-20261026/'+file,width:1200,height:800,alt:d.caption,caption:d.caption,credit:'주간 스픽스 편집부 · GPT 도표 제작',rights:{status:'cleared',basis:'original-work',note:'편집부가 공개 자료의 사실과 자체 분석 틀을 바탕으로 작성한 SVG 도표. 외부 사진·디자인을 복제하지 않음.'}};
}
const generated=[['cover-grid','/images/grid-costs-editorial-v1.png','AI 전력설비를 둘러싼 비용 분담의 문제를 표현한 개념 삽화. 실제 시설이나 현장이 아니다.'],['culture-neighbourhood','/images/neighbourhood-art-editorial-v1.png','문화 접근성과 주민의 공간 공유를 표현한 개념 삽화. 실제 암사동이나 행사 장면이 아니다.']];
for(const [id,url,caption] of generated)visuals[id+'-20261026']={kind:'generated-illustration',purpose:'기사의 중심 질문을 독립적인 개념 삽화로 전달',url,width:1536,height:1024,alt:caption,caption,credit:'주간 스픽스 · GPT 기획 및 AI 이미지 생성',disclosure:'AI 생성 삽화',generation:{tool:'OpenAI 내장 image_gen',prompt:id==='cover-grid'?'AI 전력망 비용을 함께 지는 손과 서버 시설·지역 마을의 종이 콜라주':'마을의 공유 공간에서 다양한 주민이 예술에 참여하는 종이 콜라주'},rights:{status:'cleared',basis:'original-work',note:'프로젝트용 신규 생성 삽화. 실제 인물·사건·현장 사진으로 사용하지 않음.'}};
fs.mkdirSync(path.join(root,'data/production'),{recursive:true});fs.writeFileSync(path.join(root,'data/production/visuals.json'),JSON.stringify(visuals,null,2));
console.log(JSON.stringify({visuals:Object.keys(visuals).length,diagrams:Object.keys(definitions).length,generated:generated.length}));
