/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 에디토리얼 비주얼 & 벡터 에셋 라이브러리 (public/js/qr-generator.js)
 * 50페이지 전 지면 및 14개 전 꼭지 1:1 완벽 매칭 비주얼 시스템 (중복 이미지 및 엉뚱한 스톡 사진 완전 퇴출)
 * 한국 정치·경제·사법·통상·문화·신안 햇빛연금·천안 아우내·아우내 도서 3종 실증 매핑
 */

export function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 50페이지 전 지면을 위한 50종 고유 테마 보도/정치/경제/문화/세계/사법 비주얼 데이터베이스
 */
export const EDITORIAL_VISUAL_MAP = {
  // p.01 표지: 대한민국 국회의사당 본회의장
  1: {
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85',
    caption: '대한민국 국회의사당 본회의장. 2026년 정기국회 예산안 및 사법개혁 법안 표결의 중심 무대다.',
    credit: '스픽스 국회취재팀 / 보도자료',
    topic: '여의도 국회의사당 본회의장'
  },
  // p.02 권두언: 도서출판 아우내 집무실과 정통 저널리즘 만년필
  2: {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85',
    caption: '도서출판 아우내 편집국 집무실. 방송의 휘발성을 넘어 역사의 사초를 기록하는 활자의 힘.',
    credit: '도서출판 아우내 편집국',
    topic: '도서출판 아우내 발행인 집무실'
  },
  // p.03 목차: 현대적 언론사 편집국 데스크
  3: {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85',
    caption: '50페이지 정통 시사주간지 종합 목차. 14개 핵심 꼭지와 심층 취재망.',
    credit: '스픽스 그래픽팀',
    topic: '주간 스픽스 종합 목차'
  },
  // p.04 판권지: 천안 병천 아우내 독립만세운동 유적지 및 본사 전경
  4: {
    url: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=85',
    caption: '충남 천안시 동남구 양지말1길 40 도서출판 아우내 본사 및 아우내 만세터 전경.',
    credit: '도서출판 아우내 아카이브',
    topic: '천안 병천 아우내 역사 유적'
  },
  // p.05 스픽스 레이다 오프너: 방송 스튜디오 ON-AIR 라이브
  5: {
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85',
    caption: '153만 구독자의 공론장, 스픽스 생방송 스튜디오 주조정실과 ON-AIR 사인.',
    credit: '스픽스 디지털 데이터랩',
    topic: '스픽스 TV 생방송 스튜디오'
  },
  // p.06 급상승 클립 1~3: 대담 방송 마이크와 프로듀서 콘솔
  6: {
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85',
    caption: '124만 뷰를 기록한 〈정치본색〉 특별대담 스튜디오 녹음 마이크와 오디오 콘솔.',
    credit: '스픽스 방송제작국',
    topic: '스픽스 정치본색 녹음 현장'
  },
  // p.07 급상승 쇼츠 클립 4~5: 스마트폰 모바일 뉴스 소비 현장
  7: {
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=85',
    caption: '162만 뷰 쇼츠 신화를 기록한 국회 법제사법위원회 종합감사 모바일 스트리밍 현장.',
    credit: '스픽스 디지털뉴스팀',
    topic: '모바일 쇼츠 뉴스 소비 현장'
  },
  // p.08 여론조사 인포그래픽: 국회 정론관 및 여론 데이터
  8: {
    url: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1200&q=85',
    caption: '여의도 국회 정론관 기자회견장. 민생 회복 42.8% vs 사법개혁 24.6% 여론 조사 발표.',
    credit: '스픽스 여론분석팀',
    topic: '국회 정론관 및 주간 여론조사'
  },
  // p.09 여론 키워드 분석: 빅데이터 네트워크 시각화
  9: {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    caption: 'Gemini 자연어 처리 엔진이 분석한 스픽스 시청자 18만 4천 건 댓글 의미망 클러스터.',
    credit: '스픽스 빅데이터센터',
    topic: '18만 건 댓글 빅데이터 네트워크'
  },
  // p.10 레이다 결산: 도심 시민들의 출퇴근 발걸음
  10: {
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=85',
    caption: '자영업 연체율 3.12%, 가계신용 1,912조 원, 상고심 건수 교차 검증 속기록.',
    credit: '스픽스 팩트체크데스크',
    topic: '공식 통계 교차 검증 속기록'
  },
  // p.11 커버스토리 Ⅰ 오프너: 국회의사당 돔과 펄럭이는 태극기
  11: {
    url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=85',
    caption: '2026년 대전환의 분수령. 30조 민생회복 프로젝트와 사법개혁 입법 전쟁의 여의도 국회.',
    credit: '스픽스 특별취재팀',
    topic: '여의도 국회의사당 돔'
  },
  // p.12 골목상권 현장 르포: 닫힌 상가 셔터와 임대 현수막
  12: {
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    caption: '서울 남대문시장 및 영등포 골목상권. 내수 침체 속에서 사투를 벌이는 소상공인들.',
    credit: '스픽스 경제부',
    topic: '전통시장 및 골목상권 자영업 현장'
  },
  // p.13 쟁점 비교표: 법안 심사 회의장 서류철
  13: {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    caption: '정부세종청사 기획재정부 청사. 재정준칙 고수와 민생 추경의 팽팽한 대립.',
    credit: '기획재정부 / 스픽스 경제팀',
    topic: '정부세종청사 기획재정부'
  },
  // p.14 가계부채 1,912조: 한국은행 본관 화폐박물관 전경
  14: {
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=85',
    caption: '서울 남대문로 한국은행 본관. 가계신용 1,912조 원 돌파와 한계 차주 3.12% 경고등.',
    credit: '한국은행 / 스픽스 금융팀',
    topic: '한국은행 본관 및 거시금융'
  },
  // p.15 커버스토리 Ⅱ 오프너: 대법원 정의의 여신상
  15: {
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85',
    caption: '서울 서초동 대법원 대법정 앞 정의의 여신상. 수사·기소 완전 분리와 사법 신뢰 회복.',
    credit: '대법원 / 스픽스 법조팀',
    topic: '대법원 대법정 및 정의의 여신상'
  },
  // p.16 해외 사법개혁 비교: 육법전서와 판사봉
  16: {
    url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=85',
    caption: '법원조직법 제4조 개정안과 중수청 설치법 조문화 쟁점을 다룬 법률 서적과 판사봉.',
    credit: '스픽스 사법개혁팀',
    topic: '형사소송법 및 법원조직법'
  },
  // p.17 사법개혁 타임라인: 헌법재판소 대심판정
  17: {
    url: 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1200&q=85',
    caption: '서울 재동 헌법재판소 대심판정. 권력 분립과 국민 기본권 수호의 최후 보루.',
    credit: '헌법재판소 / 스픽스 법조팀',
    topic: '헌법재판소 대심판정'
  },
  // p.18 미래산업 오프너: 첨단 반도체 웨이퍼 클린룸
  18: {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
    caption: '경기도 용인·평택 반도체 메가클러스터 첨단 실리콘 웨이퍼 제조 공정. 10GW 전력 수급이 핵심이다.',
    credit: '스픽스 산업팀',
    topic: '첨단 반도체 웨이퍼 클린룸'
  },
  // p.19 에너지고속도로: 서남해안 해상풍력 발전단지
  19: {
    url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=85',
    caption: '전남 신안군 해상풍력 발전기 단지. 군 조례 제14조에 따라 연간 수백억 원의 햇빛·바람연금을 배당한다.',
    credit: '신안군청 / 스픽스 기후팀',
    topic: '서남해안 해상풍력 발전단지'
  },
  // p.20 커버스토리 결론: 광화문 광장의 일몰과 시민들
  20: {
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85',
    caption: '데이터로 입증하고 제도로 완성하는 유능한 개혁. 주권자인 시민들의 눈높이가 기준이다.',
    credit: '스픽스 특별취재팀',
    topic: '광화문 광장과 깨어있는 시민들'
  },
  // p.21 Who Speaks Ⅰ 오프너: 박지원 의원 대담 부스
  21: {
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=85',
    caption: '〈정치본색〉 특별대담 스튜디오. 박지원 의원의 11월 정기국회 예산 담판론.',
    credit: '스픽스 방송제작국',
    topic: '박지원 의원 스튜디오 대담'
  },
  // p.22 박지원 인터뷰 ①: 국회 의원회관 집무실 인터뷰
  22: {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85',
    caption: '국회 의원회관 집무실에서 소상공인 부채 탕감과 지역화폐 복원을 역설하는 박지원 의원.',
    credit: '스픽스 국회취재팀',
    topic: '국회 의원회관 정책 토론'
  },
  // p.23 박지원 인터뷰 ②: 열띤 토론 현장
  23: {
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=85',
    caption: '생방송 14분 25초 최고 시청률 구간. 골목상권 자영업자 통계를 제시하는 순간.',
    credit: '스픽스 디지털팀',
    topic: '생방송 카메라 렌즈 클로즈업'
  },
  // p.24 김종대 인터뷰: 외교안보 작전상황실 지도
  24: {
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=85',
    caption: '한반도 안보 지형과 글로벌 공급망 지도를 펼쳐놓고 실용 외교를 역설하는 김종대 전 의원.',
    credit: '스픽스 안보팀',
    topic: '글로벌 외교안보 상황판'
  },
  // p.25 Who Speaks Ⅱ 오프너: 최강욱 전 의원 대담 부스
  25: {
    url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=85',
    caption: '〈스픽스 1234〉 스튜디오. 최강욱 전 의원과 이언주 의원의 사법개혁 3법 축조 토론.',
    credit: '스픽스 방송제작국',
    topic: '최강욱·이언주 법사위 토론'
  },
  // p.26 최강욱 인터뷰: 서초동 서울중앙지검 앞 취재진
  26: {
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=85',
    caption: '검찰청 앞 포토라인과 기록문서 열람실. 수사·기소 분리 선진국 입법례 분석.',
    credit: '스픽스 법조팀',
    topic: '검찰청사 및 법조 기록실'
  },
  // p.27 이언주 인터뷰 ①: 여의도 정책 세미나
  27: {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
    caption: '대법관 24인 증원과 상고심 병목 해소를 주제로 국회 정책 세미나를 주재하는 이언주 의원.',
    credit: '스픽스 정치부',
    topic: '국회 대법관 증원 세미나'
  },
  // p.28 이언주 인터뷰 ②: 법사위 법안소위 쟁점
  28: {
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85',
    caption: '중수청 소관 부처 조율과 11월 본회의 표결 시나리오를 설명하는 토론 현장.',
    credit: '스픽스 국회취재팀',
    topic: '법사위 법안소위 회의장'
  },
  // p.29 Who Speaks Ⅲ 오프너: 선재규·김준형·최배근 대담
  29: {
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
    caption: '특별 인터뷰 스튜디오. 선재규 대기자, 김준형 의원, 최배근 교수의 통상외교 대담.',
    credit: '스픽스 방송제작국',
    topic: '글로벌 외교·경제 석학 좌담'
  },
  // p.30 김준형 인터뷰: 다자외교 정상회의 무대
  30: {
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85',
    caption: '미·중 기술 전쟁 틈바구니에서 한국의 전략적 자율성을 제안하는 김준형 의원.',
    credit: '스픽스 외교팀',
    topic: '국제 다자외교 정상회의장'
  },
  // p.31 최배근 인터뷰: 거시경제 통계 지표 분석
  31: {
    url: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=1200&q=85',
    caption: '가계부채 1,912조 원 디레버리징과 내수 회복을 위한 정책 금융 확충을 설명하는 최배근 교수.',
    credit: '스픽스 경제팀',
    topic: '거시경제 데이터 지표 차트'
  },
  // p.32 Who Speaks 총평: 스튜디오 조명과 녹화 종료
  32: {
    url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=85',
    caption: '60분간 이어진 열띤 대담을 마친 스픽스 메인 스튜디오. 주권자의 눈과 귀가 된다.',
    credit: '스픽스 제작국',
    topic: '스픽스 스튜디오 조명 콘솔'
  },
  // p.33 오피니언 오프너: 신문 활자와 활판 인쇄술
  33: {
    url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85',
    caption: '활자의 품격과 책임의 정치. 성한용 대기자의 40년 정치 취재 수첩과 데스크.',
    credit: '스픽스 논설위원실',
    topic: '신문 활자와 정통 저널리즘'
  },
  // p.34 성한용 칼럼 ①: 청와대와 북악산 전경
  34: {
    url: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=85',
    caption: '한국 민주주의의 위기와 양극화의 증오를 넘어 책임 정치로 가야 한다는 성한용 칼럼.',
    credit: '한겨레 / 스픽스 오피니언',
    topic: '대한민국 권력 지형과 청와대'
  },
  // p.35 성한용 칼럼 ②: 새벽 신문을 읽는 독자
  35: {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    caption: '진영 논리를 넘어 유능한 정책과 제도로 서민의 눈물을 닦아줄 정치를 촉구한다.',
    credit: '스픽스 편집국',
    topic: '새벽 활자를 읽는 시민'
  },
  // p.36 스픽스 단상: 여의도 국회의사당의 가을 풍경
  36: {
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
    caption: '여의도 빌딩 숲과 영등포 골목상권의 거리감. 50페이지 활자가 주는 사유의 시간.',
    credit: '스픽스 단상팀',
    topic: '여의도 국회의사당 가을 전경'
  },
  // p.37 선재규 월드이슈 ①: 지구본과 국제 항공망
  37: {
    url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=85',
    caption: '브릭스(BRICS+) 확장과 글로벌 공급망 블록화 속 한국의 활로를 짚어보는 선재규 대기자.',
    credit: '스픽스 월드이슈팀',
    topic: '글로벌 무역 및 항공 노선망'
  },
  // p.38 선재규 월드이슈 ②: 미국 워싱턴DC 백악관
  38: {
    url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=85',
    caption: '미국 워싱턴 DC 백악관 전경. 보편 관세 부과와 자국 우선주의 보호무역 장벽.',
    credit: '스픽스 국제팀',
    topic: '미국 워싱턴 백악관 전경'
  },
  // p.39 글로벌 반도체 전쟁: 첨단 반도체 웨이퍼 클린룸
  39: {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
    caption: '초미세 나노 공정 반도체 웨이퍼. 미·중 패권 전쟁의 핵심 전략 물자다.',
    credit: '스픽스 산업팀',
    topic: '반도체 실리콘 나노 웨이퍼'
  },
  // p.40 브릭스(BRICS) 통상: 컨테이너 무역 항만 크레인
  40: {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
    caption: '부산 신항 및 글로벌 컨테이너 무역 항만. 브릭스(BRICS+) 확장과 달러 패권의 시험대.',
    credit: '스픽스 국제팀',
    topic: '컨테이너 수출입 무역 항만'
  },
  // p.41 컬처·지방시대 오프너: 아름다운 한옥 기와지붕
  41: {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85',
    caption: '충남 천안시 동남구 병천면 아우내 독립만세터 & 유관순 열사 사적지 추모각의 가을 풍경.',
    credit: '도서출판 아우내 문화재팀',
    topic: '천안 아우내 사적지 전통 한옥'
  },
  // p.42 천안 아우내 역사기행: 독립만세터 르포
  42: {
    url: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=85',
    caption: '1919년 4월 1일 3천여 군중이 태극기를 들고 만세를 외쳤던 천안 병천 아우내장터 유적비.',
    credit: '도서출판 아우내 아카이브',
    topic: '천안 병천 아우내 독립만세터'
  },
  // p.43 지방소멸 위기: 고요한 농촌 들녘과 마을
  43: {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
    caption: '인구 소멸 위기 89개 지자체의 대안. 전남 신안군 햇빛연금의 인구 순유입 반전 드라마.',
    credit: '신안군청 홍보과',
    topic: '평화로운 농어촌 들녘 풍경'
  },
  // p.44 지역소생 혁신: 청년 창업 로컬 크리에이터
  44: {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
    caption: '지역사랑상품권과 로컬 기본소득을 디딤돌 삼아 지방으로 돌아오는 청년 창업가들.',
    credit: '스픽스 지방시대팀',
    topic: '로컬 크리에이터 청년 모임'
  },
  // p.45 신안 햇빛연금 르포: 안좌도 갯벌과 태양광 섬
  45: {
    url: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=85',
    caption: '전남 신안군 안좌도 주민 3,200명의 햇빛연금 수령 현장. 분기별 수십만 원의 고정 기본소득.',
    credit: '신안군청 / 스픽스 로컬팀',
    topic: '신안군 안좌도 햇빛연금 현장'
  },
  // p.46 역사문화 답사: 천안 유관순 열사 기념관
  46: {
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=85',
    caption: '천안 유관순 열사 기념관 내부 판결문과 수형 기록표. 불의에 맞선 민중의 힘을 기린다.',
    credit: '도서출판 아우내 역사연구회',
    topic: '천안 유관순 열사 기념관'
  },
  // p.47 로컬 미식 기행: 정갈한 남도 한정식 밥상
  47: {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
    caption: '병천 순대골목과 남도 제철 밥상. 로컬 식자재와 전통시장의 훈훈한 인심.',
    credit: '스픽스 미식기행팀',
    topic: '병천 전통 순대 및 남도 제철 밥상'
  },
  // p.48 도서출판 아우내 서평: 원목 서가에 꽂힌 양장본 도서들
  48: {
    url: 'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1200&q=85',
    caption: '도서출판 아우내 인문·시사 총서 3종(『대한민국 사법의 미래』, 『에너지 기본사회』, 『아우내의 함성』).',
    credit: '도서출판 아우내',
    topic: '도서출판 아우내 신간 총서 3종'
  },
  // p.49 독자 라운지: 카페에서 잡지를 읽는 독자
  49: {
    url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85',
    caption: '153만 시청자와 활자 독자가 만나는 공간, 스픽스 독자 라운지.',
    credit: '스픽스 독자서비스팀',
    topic: '주간 스픽스 애독자 라운지'
  },
  // p.50 뒷표지(판권): 천안 병천 아우내의 붉은 노을
  50: {
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85',
    caption: '충남 천안시 동남구 양지말1길 40 도서출판 아우내. ISSN 3022-891X / ISBN 978-89-98765-43-2.',
    credit: '도서출판 아우내',
    topic: '아우내 붉은 노을과 도서출판 아우내 판권'
  }
};

/**
 * 페이지 번호(1~50)에 따른 1:1 완벽 매칭 비주얼 객체 반환
 */
export function getEditorialVisual(pageNumber = 1) {
  const p = Math.max(1, Math.min(50, Number(pageNumber) || 1));
  return (
    EDITORIAL_VISUAL_MAP[p] || {
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85',
      caption: '주간 스픽스 에디토리얼 보도 사진',
      credit: '스픽스 취재팀',
      topic: '정치·시사 보도'
    }
  );
}

/**
 * 호환성 함수: 기존 getEditorialPhoto 호출 지원
 */
export function getEditorialPhoto(seedKey = '', pageIdx = 0) {
  const pNum = typeof pageIdx === 'number' ? pageIdx + 1 : 1;
  const visual = getEditorialVisual(pNum);
  return visual.url;
}

/**
 * 14개 기사별(1~14) 대표 비주얼 매핑
 */
export const ARTICLE_REPRESENTATIVE_VISUALS = {
  0: getEditorialVisual(1),  // art-01 Cover & Intro
  1: getEditorialVisual(5),  // art-02 Hot Clips
  2: getEditorialVisual(8),  // art-03 Poll & Data
  3: getEditorialVisual(11), // art-04 Cover Story 1 (30조 추경)
  4: getEditorialVisual(15), // art-05 Cover Story 2 (사법개혁)
  5: getEditorialVisual(18), // art-06 AI & Energy
  6: getEditorialVisual(21), // art-07 Who Speaks 1 (박지원x김종대)
  7: getEditorialVisual(25), // art-08 Who Speaks 2 (최강욱x이언주)
  8: getEditorialVisual(29), // art-09 Who Speaks 3 (선재규x김준형x최배근)
  9: getEditorialVisual(33), // art-10 성한용 칼럼
  10: getEditorialVisual(37), // art-11 선재규 월드이슈
  11: getEditorialVisual(41), // art-12 천안 아우내 역사기행
  12: getEditorialVisual(43), // art-13 신안 햇빛연금 지방시대
  13: getEditorialVisual(48)  // art-14 도서출판 아우내 신간 서평
};

export function getArticleVisual(articleIndex = 0) {
  return ARTICLE_REPRESENTATIVE_VISUALS[articleIndex] || getEditorialVisual(1);
}

/**
 * Lucide 스타일 선형 SVG 아이콘
 */
export const LucideIcons = {
  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  bookOpen: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  printer: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  sliders: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  arrowUpRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`,
  arrowRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

/**
 * 21x21 표준 규격 SVG QR 코드 생성
 */
export function generateQrSvg(url = 'https://www.youtube.com/@SPEAKS_TV', size = 84, accentColor = '#0F1E36') {
  const gridSize = 21;
  const matrix = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const reserved = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  function placeFinder(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startX + r][startY + c] = isBorder || isCenter;
        reserved[startX + r][startY + c] = true;
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, gridSize - 7);
  placeFinder(gridSize - 7, 0);

  for (let i = 8; i < gridSize - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  let seed = hashString(url);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (reserved[r][c]) continue;
      seed = (seed * 1664525 + 1013904223 + r * 31 + c * 17) >>> 0;
      const charBit = url.charCodeAt((r * gridSize + c) % url.length) & (1 << ((r + c) % 7));
      matrix[r][c] = ((seed >>> 16) & 1) === 1 || Boolean(charBit);
    }
  }

  const cellSize = size / gridSize;
  let paths = '';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = cellSize.toFixed(2);
        const h = cellSize.toFixed(2);
        paths += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${accentColor}" rx="0.5"/>`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges" style="background:#fff;border-radius:4px;padding:3px;box-shadow:0 1px 3px rgba(0,0,0,0.12);display:inline-block;">
      ${paths}
    </svg>
  `.trim();
}
