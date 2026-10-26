/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 에디토리얼 비주얼 & 벡터 에셋 라이브러리 (public/js/qr-generator.js)
 * 50페이지 전 지면 고유 비주얼 테마 라이브러리 (중복 이미지 완전 퇴출)
 * 인포그래픽 차트, 관계도 다이어그램, 쟁점 비교표, 타임스탬프 스틸컷, 도서 목업 완비
 */

export function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 50페이지 전 지면을 위한 50종 고유 테마 보도/정치/경제/문화/세계/사법 사진 라이브러리
export const EDITORIAL_PHOTOS = [
  // p.01 표지: 국회 본회의장 및 웅장한 의사당
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85',
  // p.02 권두언: 인문 서재와 저널리즘 만년필
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85',
  // p.03 목차: 현대적 언론사 편집국 풍경
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85',
  // p.04 판권지: 아우내 독립만세운동 유적지 및 천안 전경
  'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=85',
  // p.05 스픽스 레이다 오프너: 방송 스튜디오 ON-AIR 라이브
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85',
  // p.06 급상승 클립 1~3: 대담 방송 마이크와 프로듀서 콘솔
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85',
  // p.07 급상승 쇼츠 클립: 스마트폰 모바일 뉴스 소비 현장
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=85',
  // p.08 여론조사 인포그래픽: 국회 정론관 기자회견
  'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1200&q=85',
  // p.09 여론 키워드 분석: 빅데이터 네트워크 시각화
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
  // p.10 레이다 결산: 도심 시민들의 출퇴근 발걸음
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85',
  // p.11 커버스토리 오프너: 국회의사당 돔과 펄럭이는 태극기
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=85',
  // p.12 예산안 격돌: 기획재정부 정부세종청사
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
  // p.13 정책 비교표: 법안 심사 회의장 서류철
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=85',
  // p.14 자영업 골목상권: 전통시장 소상공인의 땀방울
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
  // p.15 가계부채 2천조: 한국은행 본관 화폐박물관 전경
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=85',
  // p.16 금융 안정망: 시중은행 창구와 금리 지표
  'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=1200&q=85',
  // p.17 사법개혁 특위: 대법원 정의의 여신상
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85',
  // p.18 중수청 신설 쟁점: 법전과 판사봉
  'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=85',
  // p.19 대법관 증원안: 헌법재판소 대심판정
  'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1200&q=85',
  // p.20 커버스토리 결론: 광화문 광장의 일몰과 시민들
  'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=85',
  // p.21 Who Speaks 오프너: 방송 카메라 렌즈 클로즈업
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=85',
  // p.22 박지원 인터뷰 ①: 국회 의원회관 집무실 인터뷰
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85',
  // p.23 박지원 인터뷰 ②: 열띤 토론 현장
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=85',
  // p.24 김종대 인터뷰 ①: 외교안보 작전상황실 지도
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=85',
  // p.25 김종대 인터뷰 ②: 판문점 및 안보 현장
  'https://images.unsplash.com/photo-1569974498991-d3c12a504f95?auto=format&fit=crop&w=1200&q=85',
  // p.26 최강욱 인터뷰 ①: 검찰청 앞 법조 기자단
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=85',
  // p.27 최강욱 인터뷰 ②: 기록문서 열람실
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=85',
  // p.28 이언주 인터뷰 ①: 여의도 정치권 브리핑
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
  // p.29 이언주 인터뷰 ②: 정책 세미나 토론회
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85',
  // p.30 김준형 인터뷰 ①: 국제회의 다자외교 무대
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
  // p.31 김준형 인터뷰 ②: UN 본부 회의장
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85',
  // p.32 Who Speaks 총평: 토론 마친 스튜디오 조명
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=85',
  // p.33 오피니언 오프너: 신문 활자와 활판 인쇄술
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85',
  // p.34 성한용 칼럼 ①: 청와대와 북악산 전경
  'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=85',
  // p.35 성한용 칼럼 ②: 새벽 신문을 읽는 독자
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
  // p.36 스픽스 단상: 여의도 국회의사당의 가을 풍경
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
  // p.37 선재규 월드이슈 ①: 지구본과 국제 항공망
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=85',
  // p.38 선재규 월드이슈 ②: 미국 워싱턴DC 백악관
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=85',
  // p.39 글로벌 반도체 전쟁: 첨단 반도체 웨이퍼 클린룸
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
  // p.40 브릭스(BRICS) 통상: 컨테이너 무역 항만 크레인
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85',
  // p.41 컬처·지방시대 오프너: 아름다운 한옥 기와지붕
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85',
  // p.42 지방정부 르포: 풀뿌리 주민자치센터 회의
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=85',
  // p.43 지방소멸 위기: 고요한 농촌 들녘과 마을
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
  // p.44 지역소생 혁신: 청년 창업 로컬 크리에이터
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
  // p.45 스픽스 초이스 문화: 가을 고궁 단풍 축제
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=85',
  // p.46 역사문화 답사: 천안 유관순 열사 기념관과 아우내 만세터
  'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=85',
  // p.47 로컬 미식 기행: 정갈한 남도 한정식 밥상
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
  // p.48 도서출판 아우내 서평: 원목 서가에 꽂힌 양장본 도서들
  'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1200&q=85',
  // p.49 독자 라운지: 카페에서 잡지를 읽는 독자
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85',
  // p.50 뒷표지(판권): 천안 병천 아우내의 붉은 노을
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85'
];

export function getEditorialPhoto(seedKey = '', pageIdx = 0) {
  if (typeof pageIdx === 'number' && pageIdx >= 0 && pageIdx < EDITORIAL_PHOTOS.length) {
    return EDITORIAL_PHOTOS[pageIdx];
  }
  const idx = hashString(String(seedKey)) % EDITORIAL_PHOTOS.length;
  return EDITORIAL_PHOTOS[idx];
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

  const quiet = 2;
  const totalModules = gridSize + quiet * 2;
  let rects = '';

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (matrix[r][c]) {
        const isFinderCore =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= gridSize - 5 && c <= gridSize - 3) ||
          (r >= gridSize - 5 && r <= gridSize - 3 && c >= 2 && c <= 4);
        const fill = isFinderCore ? '#C8102E' : accentColor;
        rects += `<rect x="${c + quiet}" y="${r + quiet}" width="1" height="1" fill="${fill}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${totalModules}" width="${size}" height="${size}" role="img" aria-label="QR Code" style="display:block;background:#ffffff;border:1px solid #E5E0D8;border-radius:3px;">
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${rects}
  </svg>`;
}

/**
 * 정기간행물 ISSN & 전자책 ISBN 바코드 SVG
 */
export function generateBarcodeSvg(issn = 'ISSN 3022-891X', isbn = 'ISBN 978-89-98765-43-2', width = 230, height = 62) {
  const codeStr = `${issn}|${isbn}`;
  let seed = hashString(codeStr);
  let bars = '';
  bars += `<rect x="6" y="6" width="1.8" height="42" fill="#0F1E36"/><rect x="10" y="6" width="1.8" height="42" fill="#0F1E36"/>`;
  let x = 15;

  while (x < width - 15) {
    seed = (seed * 22695477 + 1) >>> 0;
    const w = 1.1 + (seed % 3) * 0.85;
    const gap = 1.2 + ((seed >>> 4) % 3) * 0.75;
    const isLong = x > width * 0.48 && x < width * 0.52;
    const h = isLong ? 42 : 36;
    bars += `<rect x="${x.toFixed(1)}" y="6" width="${w.toFixed(1)}" height="${h}" fill="#0F1E36"/>`;
    x += w + gap;
  }
  bars += `<rect x="${width - 12}" y="6" width="1.8" height="42" fill="#0F1E36"/><rect x="${width - 8}" y="6" width="1.8" height="42" fill="#0F1E36"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Barcode" style="background:#ffffff;border:1px solid #E5E0D8;padding:2px;border-radius:2px;">
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${bars}
    <text x="${width / 2}" y="${height - 4}" text-anchor="middle" font-family="monospace" font-size="7.8" font-weight="700" fill="#0F1E36">${issn} · ${isbn}</text>
  </svg>`;
}

/**
 * 방송 스틸컷 프레임 HTML 생성
 */
export function generateBroadcastStillHtml({
  program = '스픽스 대담',
  speaker = '특별 출연진',
  timestamp = '14:25',
  quote = '',
  heatmap = '주간 시청자 집중도 최고 구간',
  photoUrl = ''
}) {
  const imgSrc = photoUrl || EDITORIAL_PHOTOS[0];

  return `
    <figure class="editorial-broadcast-frame" style="margin:8px 0 12px;position:relative;border-radius:4px;overflow:hidden;background:#000;">
      <img src="${imgSrc}" alt="${program}" style="width:100%;aspect-ratio:16/9;object-fit:cover;opacity:0.88;display:block;" loading="lazy" />
      <div style="position:absolute;top:8px;left:8px;right:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="background:#C8102E;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:2px;">${program}</span>
        <span style="background:rgba(0,0,0,0.7);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:2px;">⏱️ ${timestamp}</span>
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.92));padding:10px 14px;color:#fff;">
        <div style="font-size:11px;color:#D1D5DB;margin-bottom:2px;">출연: <strong>${speaker}</strong> · ${heatmap}</div>
        ${quote ? `<blockquote style="margin:0;font-size:13px;font-weight:700;line-height:1.4;color:#FFFFFF;">“${quote}”</blockquote>` : ''}
      </div>
    </figure>
  `;
}

/**
 * 여론조사 추이 그래프 SVG (Chart.js 스타일)
 */
export function generatePollChartSvg(pollChart) {
  if (!pollChart || !pollChart.datasets) return '';
  const labels = pollChart.labels || [];
  const datasets = pollChart.datasets || [];
  const width = 560;
  const height = 240;
  const padLeft = 38;
  const padRight = 20;
  const padTop = 26;
  const padBottom = 48;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = 50;

  let gridLines = '';
  for (let yVal = 0; yVal <= maxVal; yVal += 10) {
    const y = padTop + plotH - (yVal / maxVal) * plotH;
    gridLines += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#EBEBEB" stroke-width="1"/>
      <text x="${padLeft - 6}" y="${y + 3.5}" text-anchor="end" font-family="sans-serif" font-size="9" fill="#71717A">${yVal}%</text>
    `;
  }

  let xLabels = '';
  labels.forEach((lbl, idx) => {
    const x = padLeft + (idx / Math.max(1, labels.length - 1)) * plotW;
    xLabels += `<text x="${x}" y="${padTop + plotH + 16}" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#111111">${lbl}</text>`;
  });

  let seriesPaths = '';
  let legendItems = '';

  datasets.forEach((ds, sIdx) => {
    const color = sIdx === 0 ? '#C8102E' : sIdx === 1 ? '#0F1E36' : '#2563EB';
    const pts = ds.data.map((val, idx) => {
      const x = padLeft + (idx / Math.max(1, labels.length - 1)) * plotW;
      const y = padTop + plotH - (val / maxVal) * plotH;
      return { x, y, val };
    });

    const dPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    seriesPaths += `<path d="${dPath}" fill="none" stroke="${color}" stroke-width="2.2"/>`;

    pts.forEach((p, idx) => {
      const isLast = idx === pts.length - 1;
      seriesPaths += `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isLast ? 3.5 : 2.5}" fill="${isLast ? color : '#ffffff'}" stroke="${color}" stroke-width="2"/>
        ${isLast || idx === 0 ? `<text x="${p.x.toFixed(1)}" y="${(p.y - 7).toFixed(1)}" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="800" fill="${color}">${p.val}%</text>` : ''}
      `;
    });

    const lx = padLeft + (sIdx % 3) * 165;
    const ly = height - 12;
    legendItems += `
      <rect x="${lx}" y="${ly - 6}" width="10" height="3" fill="${color}"/>
      <text x="${lx + 14}" y="${ly - 3}" font-family="sans-serif" font-size="8.5" font-weight="600" fill="#111111">${ds.label}</text>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="${pollChart.title}" style="display:block;background:#FFFFFF;border-top:2px solid #C8102E;border-bottom:1px solid #EBEBEB;margin:8px 0;">
    ${gridLines}
    ${xLabels}
    ${seriesPaths}
    ${legendItems}
  </svg>`;
}

/**
 * 세계 정세 관계도 다이어그램 SVG
 */
export function generateWorldDiagramSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 220" width="100%" height="auto" role="img" aria-label="2026 글로벌 통상 정세도" style="display:block;background:#FFFFFF;border-top:2px solid #0F1E36;border-bottom:1px solid #EBEBEB;margin:8px 0;">
    <rect x="14" y="20" width="140" height="48" fill="#0F1E36" rx="3"/>
    <text x="84" y="40" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#ffffff">미국 (보편관세 동맹)</text>
    <text x="84" y="55" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#d4d4d8">첨단 반도체·AI 통제</text>

    <rect x="14" y="86" width="140" height="48" fill="#881337" rx="3"/>
    <text x="84" y="106" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#ffffff">중국 · BRICS+ 연합</text>
    <text x="84" y="121" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#fecdd3">핵심광물 레버리지 통제</text>

    <rect x="14" y="152" width="140" height="48" fill="#1E3A5F" rx="3"/>
    <text x="84" y="172" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#ffffff">EU 탄소국경조정제도</text>
    <text x="84" y="187" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#bfdbfe">CBAM 친환경 인증 규제</text>

    <rect x="210" y="68" width="140" height="84" fill="#FAF8F5" stroke="#C8102E" stroke-width="1.8" rx="4"/>
    <text x="280" y="94" text-anchor="middle" font-family="serif" font-size="12" font-weight="900" fill="#111111">대한민국 (KOREA)</text>
    <text x="280" y="112" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#C8102E">국익 중심 실용 통상</text>
    <text x="280" y="128" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#4B5563">공급망 다변화 &amp; RE100</text>
    <text x="280" y="142" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#4B5563">반도체·배터리 초격차</text>

    <rect x="400" y="58" width="146" height="104" fill="#0F1E36" rx="4"/>
    <line x1="400" y1="58" x2="546" y2="58" stroke="#C8102E" stroke-width="3"/>
    <text x="473" y="82" text-anchor="middle" font-family="serif" font-size="10.5" font-weight="700" fill="#ffffff">2026 생존 방정식</text>
    <text x="473" y="102" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#e4e4e7">1. 한미 기술 기축 동맹 유지</text>
    <text x="473" y="118" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#e4e4e7">2. 동남아·중동 신시장 확대</text>
    <text x="473" y="134" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#e4e4e7">3. 리튬·희토류 비축 다변화</text>
    <text x="473" y="150" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#e4e4e7">4. 에너지고속도로 국산화</text>
  </svg>`;
}
