/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 에디토리얼 비주얼 시스템 (public/js/topic-visuals.js)
 * - 파워포인트 슬라이드 형식(도형, 텍스트 상자, 다이어그램) 전면 퇴출!
 * - 유튜브 공식 채널(@SPEAKS_TV)의 실제 고화질 방송 썸네일 & 영상 링크를 1:1로 직접 연결합니다.
 * - 사용자가 썸네일이나 링크를 클릭하면 즉시 유튜브 원본 영상(watch?v=...)으로 이동하거나 모달에서 인라인 재생됩니다.
 */

export const TOPIC_VISUALS = {
  // art-01: 발행인의 말 & 주간 스픽스 창간사
  1: {
    videoId: '-fkjQt4-l4A',
    url: 'https://img.youtube.com/vi/-fkjQt4-l4A/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=-fkjQt4-l4A',
    topic: '이재명을 울린 전계완의 질문! 대선후보 특별 인터뷰',
    caption: '153만 시민의 공론장 스픽스와 천안 도서출판 아우내의 출판정신이 결합된 창간 대담.',
    credit: '스픽스(@SPEAKS_TV) 특별대담'
  },
  // art-02: 스픽스 레이다 핫클립 Top 5
  2: {
    videoId: 'EGM-TWO0gio',
    url: 'https://img.youtube.com/vi/EGM-TWO0gio/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=EGM-TWO0gio',
    topic: '스픽스 레이다 핫클립: 안진걸 폭로 국감 긴급 속보',
    caption: '금주 누적 조회수 1,482만 회를 돌파한 스픽스 주간 급상승 클립 & 60초 쇼츠 현장.',
    credit: '스픽스 레이다 취재팀'
  },
  // art-03: 민심 여론조사 (먹고사니즘 vs 사법개혁)
  3: {
    videoId: 'LEjQ-SRnloQ',
    url: 'https://img.youtube.com/vi/LEjQ-SRnloQ/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=LEjQ-SRnloQ',
    topic: '스픽스 정례 여론조사: 먹고사니즘 vs 사법개혁 민심의 저울',
    caption: '‘먹고사니즘’ 42.8% vs ‘사법개혁’ 24.6% 지지율 변동과 민심의 향방 심층 분석.',
    credit: '스픽스 여론조사 데이터랩'
  },
  // art-04: 커버스토리 민생 예산안 30조 추경
  4: {
    videoId: 'itVoUz9w9hw',
    url: 'https://img.youtube.com/vi/itVoUz9w9hw/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=itVoUz9w9hw',
    topic: '민생 경제 긴급 점검: “착공 안 하면 땅 당장 뺏어라” 30조 추경 결단',
    caption: '가계신용 1,912조 원 시대, 지역화폐와 민생 지원금 쟁점 및 정부 재정 기조 집중 해부.',
    credit: '스픽스 경제본색 취재팀'
  },
  // art-05: 사법개혁 대전환과 대법관 증원
  5: {
    videoId: 'N0A7avU9zzs',
    url: 'https://img.youtube.com/vi/N0A7avU9zzs/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=N0A7avU9zzs',
    topic: '사법개혁 대전환: [단독] 조희대 꼼짝 못 할 김해원의 역대급 묘수',
    caption: '수사·기소 분리 중수청 설치와 대법관 24인 증원 로드맵 사법개혁 심층 인터뷰.',
    credit: '스픽스 사법정의팀'
  },
  // art-06: 반도체 메가클러스터와 미래산업
  6: {
    videoId: 'TN0VKlk9QQk',
    url: 'https://img.youtube.com/vi/TN0VKlk9QQk/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=TN0VKlk9QQk',
    topic: '산업·에너지 대전환: 반도체 메가클러스터와 서남해안 에너지 고속도로',
    caption: '글로벌 AI 반도체 패권과 재생에너지 송전망 혁신, 미래 성장동력 생존 전략.',
    credit: '스픽스 산업팀'
  },
  // art-07: 지상중계 박지원 특별대담
  7: {
    videoId: 'v6awNopN5n4',
    url: 'https://img.youtube.com/vi/v6awNopN5n4/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=v6awNopN5n4',
    topic: '정치본색 특별대담: [역전의용사들] 전계완 × 김완 “권력 물밑 비밀 카드”',
    caption: '정치본색 스튜디오 현장 지상중계: 여야 예산안 격돌과 정국 주도권 쟁탈전.',
    credit: '스픽스 정치본색 제작팀'
  },
  // art-08: 지상중계 김종대 전 의원
  8: {
    videoId: 'MmiBmuv0DQk',
    url: 'https://img.youtube.com/vi/MmiBmuv0DQk/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=MmiBmuv0DQk',
    topic: '스픽스1234 긴급진단: 김경호 변호사 분노 폭발 “대법원 기각 안 한 이유”',
    caption: '군사안보와 통상 리스크, 국익을 지키는 현실주의 외교 노선 심층 대담.',
    credit: '스픽스1234 제작팀'
  },
  // art-09: 지상중계 최강욱·이언주
  9: {
    videoId: 'YOD1Y2kBnfc',
    url: 'https://img.youtube.com/vi/YOD1Y2kBnfc/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=YOD1Y2kBnfc',
    topic: '특별기획 직설: 법원 ‘생중계 결정’ 기자가 캔 단서와 사법 쟁점',
    caption: '최강욱 × 이언주 특별 대담: 검찰 개혁과 사법 지연 해소를 위한 정면 돌파.',
    credit: '스픽스 특별기획팀'
  },
  // art-10: 오피니언 성한용 칼럼
  10: {
    videoId: 'lAU64alQdMI',
    url: 'https://img.youtube.com/vi/lAU64alQdMI/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=lAU64alQdMI',
    topic: '오피니언 성한용 칼럼: 국감 폭발 “담당자 나오세요” 정국 진단',
    caption: '성한용 논설위원의 정치 단상: 협치 실종의 시대, 권력의 절제와 의회민주주의의 본령.',
    credit: '스픽스 오피니언데스크'
  },
  // art-11: 오피니언 선재규의 월드이슈
  11: {
    videoId: 'v6awNopN5n4',
    url: 'https://img.youtube.com/vi/v6awNopN5n4/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=v6awNopN5n4',
    topic: '선재규의 월드이슈: 미·중 반도체 패권과 브릭스 통상 파고의 역습',
    caption: '카잔 브릭스 정상회의 이후 가속화된 탈달러 통화 블록화와 한국 통상 전략.',
    credit: '선재규 선임기자'
  },
  // art-12: 컬처 천안 아우내 문화기행
  12: {
    videoId: '-fkjQt4-l4A',
    url: 'https://img.youtube.com/vi/-fkjQt4-l4A/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=-fkjQt4-l4A',
    topic: '컬처·문화기행: 천안 아우내 장터 107년의 숨결과 민중의 독립혼',
    caption: '충남 천안시 동남구 병천면 아우내 독립만세 유적지와 도서출판 아우내의 발자취.',
    credit: '도서출판 아우내 문화사업부'
  },
  // art-13: 지방시대 신안 햇빛연금
  13: {
    videoId: 'itVoUz9w9hw',
    url: 'https://img.youtube.com/vi/itVoUz9w9hw/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=itVoUz9w9hw',
    topic: '지방시대 자치분권: 전남 신안군 ‘햇빛연금’과 기본소득 실험',
    caption: '신재생에너지 발전 이익을 주민과 나누는 신안군 조례 제14조 풀뿌리 혁신 모델.',
    credit: '스픽스 지방자치팀'
  },
  // art-14: 도서출판 아우내 서평
  14: {
    videoId: 'N0A7avU9zzs',
    url: 'https://img.youtube.com/vi/N0A7avU9zzs/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=N0A7avU9zzs',
    topic: '도서출판 아우내 서평: 『역사의 사초』, 『지역화폐 경제학』, 『헌법의 길』',
    caption: '더 나은 세상을 만드는 지성의 서재: 도서출판 아우내 3대 신간 심층 북리뷰.',
    credit: '도서출판 아우내 출판기획부'
  }
};

/**
 * 페이지 번호(1~50)에 해당하는 유튜브 방송 썸네일 & 영상 정보 매핑
 */
export function getPageTopicVisual(pageNumber) {
  let topicId = 1;

  if (pageNumber >= 1 && pageNumber <= 4) {
    topicId = 1;
  } else if (pageNumber >= 5 && pageNumber <= 7) {
    topicId = 2;
  } else if (pageNumber >= 8 && pageNumber <= 10) {
    topicId = 3;
  } else if (pageNumber >= 11 && pageNumber <= 14) {
    topicId = 4;
  } else if (pageNumber >= 15 && pageNumber <= 17) {
    topicId = 5;
  } else if (pageNumber >= 18 && pageNumber <= 20) {
    topicId = 6;
  } else if (pageNumber >= 21 && pageNumber <= 24) {
    topicId = 7;
  } else if (pageNumber >= 25 && pageNumber <= 28) {
    topicId = 8;
  } else if (pageNumber >= 29 && pageNumber <= 32) {
    topicId = 9;
  } else if (pageNumber >= 33 && pageNumber <= 36) {
    topicId = 10;
  } else if (pageNumber >= 37 && pageNumber <= 40) {
    topicId = 11;
  } else if (pageNumber >= 41 && pageNumber <= 43) {
    topicId = 12;
  } else if (pageNumber >= 44 && pageNumber <= 47) {
    topicId = 13;
  } else if (pageNumber >= 48 && pageNumber <= 50) {
    topicId = 14;
  }

  return TOPIC_VISUALS[topicId] || TOPIC_VISUALS[1];
}

/**
 * 기사 인덱스(0~13) 기반 썸네일 및 영상 정보 반환
 */
export function getTopicVisual(articleIndex) {
  const topicId = (articleIndex % 14) + 1;
  return TOPIC_VISUALS[topicId] || TOPIC_VISUALS[1];
}
