import fs from 'node:fs';import path from 'node:path';
const folder='public/images/issue-20261026-r4';fs.mkdirSync(folder,{recursive:true});
const INK='#20252a',RED='#b51d28',GRAY='#656a70',LINE='#d4d7da';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const t=(x,y,s,size=27,color=INK,bold=false)=>`<text x="${x}" y="${y}" font-family="Malgun Gothic,sans-serif" font-size="${size}" font-weight="${bold?700:400}" fill="${color}">${esc(s)}</text>`;
const l=(x,y,xx,yy,color=LINE,w=2)=>`<path d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const rect=(x,y,w,h,fill=INK)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const circle=(x,y,r,fill='white',stroke=INK)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const arrow=(x,y,xx,yy,color=INK,dash=false)=>{const r=Math.atan2(yy-y,xx-x),bx=xx-15*Math.cos(r),by=yy-15*Math.sin(r);return `<path d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="${color}" stroke-width="3"${dash?' stroke-dasharray="8 7"':''}/><path d="M${xx} ${yy}L${bx-6*Math.sin(r)} ${by+6*Math.cos(r)}L${bx+6*Math.sin(r)} ${by-6*Math.cos(r)}Z" fill="${color}"/>`;};
function frame(title,kicker,content,source){return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="650" viewBox="0 0 1200 650"><defs><marker id="arr-k" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="${INK}"/></marker><marker id="arr-r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="${RED}"/></marker></defs><rect width="1200" height="650" fill="white"/>${rect(42,35,38,5,RED)}${t(96,47,kicker,19,GRAY)}${t(42,105,title,38,INK,true)}${content}${l(42,588,1158,588)}${t(42,625,source,19,GRAY)}</svg>`;}
const defs={};
function add(id,title,kicker,content,source,caption){defs[id]={svg:frame(title,kicker,content,source),title,caption};}

let s='';
for(const [i,name,value] of [[0,'긍정',15],[1,'보통',52],[2,'부정',32.6]]){const y=225+i*113;s+=t(42,y,name,32,INK,true)+rect(205,y-33,value/60*745,42,i===1?RED:'#6e757c')+t(1010,y+2,value+'%',40,i===1?RED:INK,true);}
s+=l(205,510,950,510);for(const n of [0,20,40,60])s+=t(197+n/60*745,547,String(n),20,GRAY);
s+=t(42,160,'청년 965명 대면 설문 · 대통령 직무 평가',25,GRAY);
add('radar-survey','‘보통’이라는 응답을 따로 들었다','청년오늘연구소 · 10월 12~17일',s,'자료: 스픽스 10월 25일 인터뷰. 발표 비율 합계 99.6%. 전국 청년 대표 조사로 환산하지 않음.','청년오늘연구소가 발표한 대통령 직무 평가. 보통 선택지를 포함한 다섯 단계 문항의 결과다.');

s=t(42,180,'망 확충에 필요한 총투자 추산',27,GRAY)+t(42,286,'113조 원',76,INK,true)+t(42,345,'2038년까지 송·배전망 전체',28)+t(42,389,'여러 이용자가 함께 쓰는 설비 포함',25,GRAY)+l(594,158,594,448)+t(648,180,'기업에 제안했다는 자금 조달 방식',27,GRAY)+t(648,286,'25조 원',76,RED,true)+t(648,345,'약 5년 치 전기요금 선납 구상',28)+t(648,389,'미리 받고 이후 요금에서 차감',25,GRAY)+l(42,462,1158,462)+t(42,515,'투자에 얼마가 필요한가',29,INK,true)+t(648,515,'투자금을 언제·어떻게 마련하나',29,RED,true);
add('radar-grid','113조 원과 25조 원, 서로 다른 질문','전력망 투자와 요금 선납',s,'자료: 고재학 에디터의 스픽스 10월 23일 칼럼. 선납은 칼럼이 소개한 보도의 내용.','총투자 규모와 자금 조달 방식을 구분했다. 25조 원은 113조 원에서 뺄 확정 기업 분담금이 아니다.');

s=l(95,170,95,542,INK,3);
for(const [y,label,detail]of [[190,'해외 SNS','셰완쥔 게시물에서 사망설 유통'],[295,'외신 소개','더선·뉴욕포스트·이코노믹타임스 등'],[400,'북한 관영매체','10월 19일 전시회 참관 사진과 활동 보도'],[505,'한국 정부 당국자','금시초문·황당하다는 반응 보도']])s+=circle(95,y-10,9,RED,RED)+t(142,y,label,28,INK,true)+t(405,y,detail,27);
add('radar-rumour','사망설과 공개 활동 보도가 엇갈린 하루','10월 20일 보도 흐름',s,'자료: 선재규의 스픽스 10월 21일 기사. 게시물의 소문과 매체의 확인 보도는 구별.','스픽스가 전한 사망설 유통과 관영매체·정부의 반응을 순서대로 정리했다.');

s=t(42,163,'전년 대비 증가율(%)',25,GRAY);
for(const [i,name,value]of [[0,'산업·중소기업·에너지',29.7],[1,'총지출',12.8],[2,'보건·복지·고용',9.3]]){const y=243+i*106;s+=t(42,y,name,25,INK,true)+rect(370,y-30,value/30*615,37,i===0?RED:'#71787e')+t(1020,y,value+'%',34,INK,true);}
s+=l(370,511,985,511);for(const n of [0,10,20,30])s+=t(363+n/30*615,547,String(n),20,GRAY);
add('cover-growth','2027년 예산안, 어디를 더 늘렸나','정부안의 분야별 증가율',s,'자료: 정부 정책주간지 K-공감 예산안 도표. 증가율 비교이며 각 분야의 예산 총액 비교가 아님.','산업 분야 증가율은 총지출 증가율보다 높고 보건·복지·고용은 낮다. 분야별 기준액이 달라 증가액의 크기를 뜻하지는 않는다.');

s=t(42,200,'청년하다 회원',34,INK,true)+arrow(270,190,398,190)+t(435,200,'대학 캠퍼스',34,INK,true)+arrow(680,190,813,190)+t(850,200,'직접 질문',34,INK,true)+t(42,251,'한 사람당 설문 30~50부',25,GRAY)+t(435,251,'전화 대신 얼굴을 맞대고',25,GRAY)+t(850,251,'응답에 약 8분',25,GRAY)+l(42,307,1158,307)+t(42,410,'965',88,RED,true)+t(260,409,'명',36)+t(435,360,'숫자와 함께 물은 것',28,INK,true)+t(435,416,'대통령 평가의 이유 · 일자리 · 지방',30)+t(435,469,'긍정과 부정 사이에 ‘보통’ 선택지',30)+t(42,525,'10월 12~17일 모은 응답',24,GRAY);
add('desk-youth','길에서 묻고, 답한 이유까지 들었다','청년오늘연구소의 조사 방식',s,'자료: 박태훈·김예은의 10월 25일 스픽스 인터뷰. 응답 비율은 연구소 발표.','회원들이 캠퍼스에서 직접 질문해 모은 965부다. 전화 응답을 피하는 청년을 만나 평가 이유까지 듣겠다는 방식이었다.');

s=t(42,179,'원산갈마의 호텔·해변',34,INK,true)+l(42,210,1158,210,INK,2);
for(const [x,num,title,detail]of [[42,'관광객','외부에서 들어올 수 있는가','방문과 이동의 제약'],[425,'교통','목적지까지 이어지는가','도로·철도·항공 연결'],[808,'전력','시설을 계속 가동할 수 있는가','운영에 필요한 안정적 공급']]){s+=t(x,269,num,31,RED,true)+t(x,326,title,25,INK,true)+t(x,370,detail,24,GRAY);}
s+=arrow(600,405,600,465,RED)+t(192,520,'김종대의 제안: 북미·남북 관계 개선과 관광 개방을 함께',29,INK,true);
add('desk-wonsan','호텔을 지은 다음에 남는 세 가지','김종대가 설명한 원산갈마의 운영 여건',s,'자료: 10월 25일 김종대의 레이더. 관광 개방은 출연자의 구상과 전망.','호텔과 해변만으로 관광지가 움직이지 않는다는 진단이다. 김종대는 방문객·교통·전력 문제를 대외관계 개선과 연결했다.');

s=t(42,177,'현재 역할',28,GRAY)+t(655,177,'김해원의 개정 제안',28,RED,true)+t(42,238,'대법원장',40,INK,true)+t(655,238,'대법원장',40,INK,true)+l(594,158,594,540);
for(const [y,left,right]of [[329,'전원합의체 재판장','대법관이 재판 담당'],[410,'대법관회의 의장','회의의 의장 지위 조정'],[491,'사법행정의 수장','행정 집행에 전념']]){s+=t(42,y,left,30)+arrow(425,y-10,546,y-10,RED)+t(655,y,right,30,INK,true);}
add('desk-court','재판과 사법행정의 역할을 나누자는 구상','김해원의 법원조직법 개정 제안',s,'자료: 김해원 교수의 10월 24일 스픽스 인터뷰. 오른쪽은 시행 법률이 아닌 개정 제안.','김해원은 대법원장의 재판장·대법관회의 의장 지위를 손보고 사법행정 집행을 맡기는 방향을 제시했다.');

s=t(42,190,'고재학이 묻는 공통 기준',28,GRAY)+t(42,254,'어디서 번 소득인가보다, 어떤 이익인가',43,INK,true)+l(42,297,1158,297,INK,2);
for(const [x,name,a,b]of [[42,'근로소득','월급에는 과세','형평을 이야기할 때의 기준'],[425,'부동산 양도차익','정부가 조세 정의를 강조','대통령 발언의 출발점'],[808,'주식 양도차익','예외의 범위와 이유는?','칼럼이 정부에 던진 질문']])s+=t(x,363,name,32,RED,true)+t(x,427,a,27,INK,true)+t(x,478,b,23,GRAY);
add('opinion-tax','조세 정의라는 기준, 주식 앞에서도 같은가','고재학 칼럼의 핵심 질문',s,'자료: 스픽스 10월 21일 칼럼. 과세 형평에 관한 논지 정리이며 세율·납세 안내가 아님.','고재학은 부동산 과세의 명분으로 제시된 형평 원칙을 주식 양도차익에도 적용하자고 주장했다.');

s=t(42,173,'중동 전쟁 확산',29,INK,true)+arrow(303,163,400,163)+t(442,173,'국제 유가 상승',29,INK,true)+arrow(700,163,797,163)+t(837,173,'미국 물가 부담',29,INK,true)+t(42,226,'김종대는 유가를 미국의 외교적 선택에 영향을 주는 변수로 봤다.',25,GRAY)+l(42,270,1158,270);
for(const [x,label]of [[200,'러시아'],[600,'미국'],[1000,'북한']])s+=circle(x,395,59)+t(x-43,404,label,29,INK,true);
s+=arrow(282,365,518,365,RED,true)+t(287,331,'제재·우크라이나 협상',22,RED)+arrow(682,395,918,395,RED,true)+t(721,355,'북미 대화 가능성',22,RED)+`<path d="M200 464L200 527L1000 527L1000 464" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="8 7"/><path d="M1000 464L994 479L1006 479Z" fill="${RED}"/>`+t(300,565,'북러 협력을 바탕으로 푸틴이 김정은을 설득할 가능성',25,RED);
add('world-armistice','유가에서 북미 대화로, 김종대가 연결한 외교','11월 선전 APEC을 앞둔 방송 전망 · 점선은 가능성',s,'자료: 10월 24일 김종대의 레이더 관련 스픽스 보도. 선은 발언의 논리 관계를 표시.','김종대는 유가가 미국의 부담을 키우고, 러시아와의 협상이 북미 대화의 변수로 연결될 수 있다고 전망했다.');

s=t(42,198,'2026년 10월',31,GRAY)+t(42,395,'23',180,INK,true)+t(325,400,'일',44)+l(450,160,450,539)+t(505,213,'북한에 대한 인식',40,INK,true)+t(505,291,'오후 2시–6시 · 서울YWCA',31)+t(505,356,'시민사회 활동가 50명 대상',30)+t(505,427,'통일부 후원',28,RED,true)+t(42,522,'사회적 대화 사전 안내',25,GRAY)+t(505,507,'주최: 국민주권 평화·통일 사회적대화',23,GRAY)+t(505,542,'및 시민사회협력회의',23,GRAY);
add('local-dialogue','활동가들이 함께 논의할 의제는 북한 인식','공식 일정 안내',s,'자료: 통일부 사회적 대화 플랫폼 10월 13일 안내. 실제 참석·논의 결과와 구별.','10월 23일 서울YWCA에서 네 시간 동안 진행하는 것으로 안내된 사회적 대화의 주요 정보다.');

s=t(42,203,'2025. 06',43,INK,true)+arrow(342,188,705,188)+t(765,203,'2026. 05',43,INK,true)+t(42,261,'취임 첫해 연설과 SNS 메시지',30,GRAY)+l(42,309,1158,309)+t(42,432,'386',112,RED,true)+t(309,433,'쪽',38)+t(505,376,'전자책 무료 배포',32,INK,true)+t(505,431,'연설별 생중계 영상 연결',28)+t(505,481,'음성 변환용 코드 수록',28)+t(42,546,'제1권',27,GRAY)+t(505,546,'종이책은 국가기관·공공도서관 등에 배포',23,GRAY);
add('reading-record','취임 첫해의 말과 글을 한 권에','이재명 대통령 연설문집 발간 안내',s,'자료: 청와대 보도자료를 전한 스픽스 10월 26일 기사. 발간 소개의 수록 범위·구성.','연설문집 제1권은 2025년 6월부터 2026년 5월까지의 연설·메시지를 담은 386쪽 책으로 소개됐다.');

const latest=JSON.parse(fs.readFileSync('data/editions.json','utf8')).issues.filter(i=>i.status==='published').sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))[0];const visuals={};
for(const [key,d]of Object.entries(defs)){
 const id=key+'-20261026',name=key+'-v3.svg';fs.writeFileSync(path.join(folder,name),d.svg);
 const old=latest.articleSnapshots.find(a=>a.id===id).visual;
 visuals[id]={...old,url:'/images/issue-20261026-r4/'+name,width:1200,height:650,alt:d.title,caption:d.caption,credit:'주간 스픽스 · 자료 구성',purpose:d.caption,rights:{status:'cleared',basis:'original-work',note:'원기사의 수치·발언·관계를 바탕으로 이 기사에 맞게 제작한 자체 SVG 자료. 외부 도표나 사진을 복제하지 않음.'}};
}
fs.mkdirSync('data/production/conclusion-first',{recursive:true});fs.writeFileSync('data/production/conclusion-first/visuals.json',JSON.stringify(visuals,null,2));console.log({graphics:Object.keys(visuals).length});
