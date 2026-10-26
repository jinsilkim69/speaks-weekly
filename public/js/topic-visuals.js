/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 에디토리얼 비주얼 시스템 (public/js/topic-visuals.js)
 * 엉뚱한 해외 스톡 사진(오바마, 기타, 신발, 1달러 지폐 등) 완전 퇴출!
 * 14개 전 꼭지 및 50페이지 지면의 주제와 100% 일치하는 정통 시사·보도 그래픽 및 한국형 비주얼 생성기
 */

function encodeSvg(svgString) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString.trim());
}

/**
 * 14개 핵심 꼭지별 고유 테마 SVG 비주얼 생성
 */
export const TOPIC_VISUALS = {
  // art-01: 발행인의 말 & 주간 스픽스 창간사 (국회 본회의장 & 아우내 저널리즘)
  1: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0B132B"/>
            <stop offset="50%" stop-color="#1C2541"/>
            <stop offset="100%" stop-color="#3A1C28"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#D4AF37"/>
            <stop offset="100%" stop-color="#F3E5AB"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#bg1)"/>
        <!-- 국회의사당 돔 실루엣 -->
        <path d="M 350 420 Q 600 240 850 420 Z" fill="#1C2541" stroke="#48CAE4" stroke-width="2" opacity="0.3"/>
        <rect x="420" y="420" width="360" height="90" fill="#0B132B" stroke="#48CAE4" stroke-width="1.5" opacity="0.4"/>
        <circle cx="600" cy="300" r="16" fill="url(#gold)"/>
        <!-- 웅장한 그리드 라인 -->
        <g stroke="#ffffff" stroke-width="0.5" opacity="0.08">
          <line x1="0" y1="135" x2="1200" y2="135"/>
          <line x1="0" y1="270" x2="1200" y2="270"/>
          <line x1="0" y1="405" x2="1200" y2="405"/>
          <line x1="0" y1="540" x2="1200" y2="540"/>
          <line x1="300" y1="0" x2="300" y2="675"/>
          <line x1="600" y1="0" x2="600" y2="675"/>
          <line x1="900" y1="0" x2="900" y2="675"/>
        </g>
        <!-- 헤드라인 텍스트 및 배지 -->
        <rect x="80" y="80" width="220" height="34" rx="4" fill="#C8102E"/>
        <text x="95" y="103" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="14" font-weight="800" letter-spacing="1.5">COVER &amp; INTRO · 창간사</text>
        <text x="80" y="200" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="44" font-weight="900" letter-spacing="-1">153만 시민의 공론장 ‘스픽스’와</text>
        <text x="80" y="260" fill="url(#gold)" font-family="'Pretendard', sans-serif" font-size="44" font-weight="900" letter-spacing="-1">107년 아우내 독립정신의 만남</text>
        <text x="80" y="325" fill="#E2E8F0" font-family="'Pretendard', sans-serif" font-size="20" font-weight="400">유튜브의 속도와 휘발성을 넘어 역사의 사초(史草)를 남기는 정통 활자 주간지</text>
        
        <!-- 하단 인포 바 -->
        <rect x="80" y="520" width="1040" height="75" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)"/>
        <text x="110" y="565" fill="#A0AEC0" font-family="'Pretendard', sans-serif" font-size="15">발행·제작: <tspan fill="#ffffff" font-weight="700">도서출판 아우내 (충남 천안시 동남구 양지말1길 40)</tspan></text>
        <text x="750" y="565" fill="#A0AEC0" font-family="'Pretendard', sans-serif" font-size="15">정기간행물: <tspan fill="#48CAE4" font-weight="700">ISSN 3022-891X / ISBN 978-89-98765-43-2</tspan></text>
      </svg>
    `),
    topic: '대한민국 국회 본회의장 & 도서출판 아우내 창간 선언',
    caption: '153만 구독자의 공론장 스픽스와 천안 아우내의 출판정신이 결합된 정통 시사주간지 창간.',
    credit: '도서출판 아우내 편집국'
  },

  // art-02: 스픽스 레이다 / 주간 급상승 클립 & 쇼츠 Top 5 (스튜디오 ON-AIR)
  2: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1A0B1E"/>
            <stop offset="50%" stop-color="#111827"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
          <linearGradient id="accentRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#EF4444"/>
            <stop offset="100%" stop-color="#DC2626"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#bg2)"/>
        <!-- ON AIR 램프 박스 -->
        <rect x="80" y="80" width="130" height="42" rx="4" fill="url(#accentRed)"/>
        <text x="105" y="108" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="18" font-weight="900" letter-spacing="3">● ON AIR</text>
        <rect x="225" y="80" width="230" height="42" rx="4" fill="rgba(255,255,255,0.08)"/>
        <text x="245" y="107" fill="#E2E8F0" font-family="'Pretendard', sans-serif" font-size="15" font-weight="700">스픽스 디지털 데이터랩</text>

        <!-- 주간 1,482만 뷰 대형 통계 박스 -->
        <g transform="translate(80, 160)">
          <text x="0" y="55" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="44" font-weight="900">1,482만 뷰가 폭발한 금주의 결정적 발언록</text>
          <text x="0" y="105" fill="#94A3B8" font-family="'Pretendard', sans-serif" font-size="20">유튜브 @SPEAKS_TV 급상승 클립 Top 5 &amp; 쇼츠 하이라이트 심층 분석</text>

          <!-- 3단 통계 카드 -->
          <g transform="translate(0, 150)">
            <rect x="0" y="0" width="320" height="180" rx="8" fill="#1E293B" stroke="#334155"/>
            <text x="24" y="45" fill="#EF4444" font-size="13" font-weight="800">조회수 1위 · 정치본색 (14:25)</text>
            <text x="24" y="90" fill="#ffffff" font-size="32" font-weight="900">124만 회</text>
            <text x="24" y="130" fill="#94A3B8" font-size="14">박지원 의원 × 김종대 전 의원</text>
            <text x="24" y="152" fill="#E2E8F0" font-size="13">“민생 추경 30조 담판 지어야”</text>

            <rect x="350" y="0" width="320" height="180" rx="8" fill="#1E293B" stroke="#334155"/>
            <text x="374" y="45" fill="#3B82F6" font-size="13" font-weight="800">조회수 2위 · 스픽스 1234 (28:40)</text>
            <text x="374" y="90" fill="#ffffff" font-size="32" font-weight="900">98만 회</text>
            <text x="374" y="130" fill="#94A3B8" font-size="14">최강욱 전 의원 × 이언주 의원</text>
            <text x="374" y="152" fill="#E2E8F0" font-size="13">“수사·기소 분리는 시대적 상식”</text>

            <rect x="700" y="0" width="340" height="180" rx="8" fill="#1E293B" stroke="#334155"/>
            <text x="724" y="45" fill="#10B981" font-size="13" font-weight="800">쇼츠 1위 · 국감 60초 포렌식</text>
            <text x="724" y="90" fill="#ffffff" font-size="32" font-weight="900">162만 뷰</text>
            <text x="724" y="130" fill="#94A3B8" font-size="14">국회 법제사법위원회 종합감사</text>
            <text x="724" y="152" fill="#E2E8F0" font-size="13">증인석 침묵시킨 결정적 데이터</text>
          </g>
        </g>
      </svg>
    `),
    topic: '스픽스 생방송 스튜디오 ON-AIR & 주간 1,482만 뷰 분석',
    caption: '유튜브 @SPEAKS_TV 1,482만 조회수 기록한 5대 핵심 발언록 타임스탬프 분석.',
    credit: '스픽스 디지털 데이터랩'
  },

  // art-03: 여론조사 인포그래픽 & 키워드 네트워크 (실제 SVG 데이터 차트)
  3: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#0B132B"/>
        <!-- 타이틀 -->
        <rect x="80" y="60" width="280" height="34" rx="4" fill="#2563EB"/>
        <text x="95" y="83" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="14" font-weight="800">WEEKLY POLL &amp; DATA INFOGRAPHIC</text>
        <text x="80" y="145" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="40" font-weight="900">민심의 저울: ‘먹고사니즘’ 42.8% vs ‘사법개혁’ 24.6%</text>
        <text x="80" y="185" fill="#94A3B8" font-family="'Pretendard', sans-serif" font-size="18">10월 4주차 스픽스 주간 여론 지표 추이 및 18만 4천 건 댓글 빅데이터 분석</text>

        <!-- 데이터 바 차트 시각화 -->
        <g transform="translate(80, 230)">
          <!-- 항목 1: 민생 회복 및 내수 부양 -->
          <text x="0" y="32" fill="#ffffff" font-size="18" font-weight="700">1. 민생 회복 및 내수 부양 (30조 추경·채무조정)</text>
          <rect x="0" y="48" width="850" height="38" rx="6" fill="#1E293B"/>
          <rect x="0" y="48" width="600" height="38" rx="6" fill="#EF4444"/>
          <text x="615" y="74" fill="#EF4444" font-size="22" font-weight="900">42.8% (+6.6%p ▲)</text>

          <!-- 항목 2: 사법 권력기관 개혁 -->
          <text x="0" y="125" fill="#ffffff" font-size="18" font-weight="700">2. 사법 권력기관 개혁 (중수청 신설·대법관 증원)</text>
          <rect x="0" y="140" width="850" height="38" rx="6" fill="#1E293B"/>
          <rect x="0" y="140" width="345" height="38" rx="6" fill="#3B82F6"/>
          <text x="360" y="166" fill="#3B82F6" font-size="22" font-weight="900">24.6% (지속 2위)</text>

          <!-- 항목 3: 국익 중심 실용 외교통상 -->
          <text x="0" y="215" fill="#ffffff" font-size="18" font-weight="700">3. 국익 중심 실용 외교통상 (미국 관세·반도체 주권)</text>
          <rect x="0" y="230" width="850" height="38" rx="6" fill="#1E293B"/>
          <rect x="0" y="230" width="225" height="38" rx="6" fill="#10B981"/>
          <text x="240" y="256" fill="#10B981" font-size="22" font-weight="900">16.2%</text>

          <!-- 항목 4: 기후위기 & 지방소멸 대응 -->
          <text x="0" y="305" fill="#ffffff" font-size="18" font-weight="700">4. 기후위기 대응 &amp; 지방소멸 극복 (신안 햇빛연금 모델)</text>
          <rect x="0" y="320" width="850" height="38" rx="6" fill="#1E293B"/>
          <rect x="0" y="320" width="140" height="38" rx="6" fill="#F59E0B"/>
          <text x="155" y="346" fill="#F59E0B" font-size="22" font-weight="900">10.4%</text>
        </g>
      </svg>
    `),
    topic: '스픽스 주간 여론조사 꺾은선 & 바 인포그래픽',
    caption: '먹고사니즘(42.8%)과 사법개혁(24.6%)의 투트랙 동시 돌파를 요구하는 시민 여론 지표.',
    credit: '스픽스 여론분석팀'
  },

  // art-04: 커버스토리 Ⅰ / 30조 민생추경과 골목상권 르포 (대한민국 국회 & 가계부채)
  4: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <defs>
          <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#450A0A"/>
            <stop offset="50%" stop-color="#18181B"/>
            <stop offset="100%" stop-color="#09090B"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#bg4)"/>
        <!-- 대한민국 국회의사당 정면 실루엣 -->
        <g stroke="#ffffff" stroke-width="1.5" opacity="0.2" fill="none">
          <path d="M 450 350 Q 600 200 750 350 Z"/>
          <line x1="400" y1="350" x2="800" y2="350"/>
          <line x1="420" y1="350" x2="420" y2="480"/>
          <line x1="480" y1="350" x2="480" y2="480"/>
          <line x1="540" y1="350" x2="540" y2="480"/>
          <line x1="600" y1="350" x2="600" y2="480"/>
          <line x1="660" y1="350" x2="660" y2="480"/>
          <line x1="720" y1="350" x2="720" y2="480"/>
          <line x1="780" y1="350" x2="780" y2="480"/>
          <rect x="380" y="480" width="440" height="20"/>
        </g>
        <rect x="80" y="70" width="220" height="34" rx="4" fill="#C8102E"/>
        <text x="95" y="93" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="14" font-weight="800">COVER STORY Ⅰ · 심층해부</text>
        <text x="80" y="160" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="42" font-weight="900">2026 대전환의 분수령: 30조 민생회복 프로젝트</text>
        <text x="80" y="215" fill="#FCA5A5" font-family="'Pretendard', sans-serif" font-size="22" font-weight="700">가계부채 1,912조 원 돌파와 자영업 연체율 3.12%… 기재부 긴축 도그마를 깬다</text>

        <!-- 3대 정책 패키지 배너 -->
        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="320" height="230" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)"/>
          <circle cx="45" cy="45" r="20" fill="#C8102E"/>
          <text x="39" y="52" fill="#fff" font-weight="900" font-size="18">1</text>
          <text x="80" y="45" fill="#fff" font-size="20" font-weight="800">지역사랑상품권 3조</text>
          <text x="80" y="68" fill="#FCA5A5" font-size="14">국비 지원 의무화 (법률 제15조)</text>
          <text x="24" y="115" fill="#E2E8F0" font-size="15" line-height="1.5">골목상권 승수효과 1.8배 검증</text>
          <text x="24" y="145" fill="#94A3B8" font-size="14">전통시장·소상공인 전용 소비 마중물</text>
          <text x="24" y="175" fill="#CBD5E1" font-size="13">지자체 매칭 국비 3조 원 전격 복원</text>

          <rect x="350" y="0" width="320" height="230" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)"/>
          <circle cx="395" cy="45" r="20" fill="#2563EB"/>
          <text x="389" y="52" fill="#fff" font-weight="900" font-size="18">2</text>
          <text x="430" y="45" fill="#fff" font-size="20" font-weight="800">소상공인 채무조정 15조</text>
          <text x="430" y="68" fill="#93C5FD" font-size="14">한국형 배드뱅크 10년 분할상환</text>
          <text x="374" y="115" fill="#E2E8F0" font-size="15">코로나 정책대출 10년 만기 연장</text>
          <text x="374" y="145" fill="#94A3B8" font-size="14">이자율 2%대 경감 및 원금 탕감</text>
          <text x="374" y="175" fill="#CBD5E1" font-size="13">한계 다중채무자 3.12% 연쇄부도 방어</text>

          <rect x="700" y="0" width="340" height="230" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)"/>
          <circle cx="745" cy="45" r="20" fill="#059669"/>
          <text x="739" y="52" fill="#fff" font-weight="900" font-size="18">3</text>
          <text x="780" y="45" fill="#fff" font-size="20" font-weight="800">서민 생활비 바우처 12조</text>
          <text x="780" y="68" fill="#6EE7B7" font-size="14">에너지·장바구니 긴급 완충망</text>
          <text x="724" y="115" fill="#E2E8F0" font-size="15">전기·가스 요금 급등 폭발 방어</text>
          <text x="724" y="145" fill="#94A3B8" font-size="14">청년·취약계층 긴급 생계비 직할</text>
          <text x="724" y="175" fill="#CBD5E1" font-size="13">실질소득 감소 대차대조표 불황 타개</text>
        </g>
      </svg>
    `),
    topic: '2026 국회 예결위 & 30조 민생회복 프로젝트 해부',
    caption: '가계신용 1,912조 원과 자영업 연체율 3.12%를 방어할 3대 재정 패키지 로드맵.',
    credit: '스픽스 특별취재팀'
  },

  // art-05: 사법개혁 3법 & 대법관 24인 증원 (대법원 정의의 여신상)
  5: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <defs>
          <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#022C22"/>
            <stop offset="50%" stop-color="#064E3B"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#bg5)"/>
        <!-- 저울 & 판사봉 벡터 실루엣 -->
        <g stroke="#34D399" stroke-width="2" fill="none" opacity="0.3" transform="translate(600, 260)">
          <line x1="0" y1="-80" x2="0" y2="120"/>
          <line x1="-120" y1="-50" x2="120" y2="-50"/>
          <path d="M -160 30 Q -120 70 -80 30 Z"/>
          <path d="M 80 30 Q 120 70 160 30 Z"/>
          <line x1="-120" y1="-50" x2="-160" y2="30"/>
          <line x1="-120" y1="-50" x2="-80" y2="30"/>
          <line x1="120" y1="-50" x2="80" y2="30"/>
          <line x1="120" y1="-50" x2="160" y2="30"/>
        </g>
        <rect x="80" y="70" width="220" height="34" rx="4" fill="#059669"/>
        <text x="95" y="93" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="14" font-weight="800">COVER STORY Ⅱ · 사법개혁</text>
        <text x="80" y="160" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="42" font-weight="900">수사·기소 완전 분리와 대법관 증원 로드맵</text>
        <text x="80" y="215" fill="#A7F3D0" font-family="'Pretendard', sans-serif" font-size="22" font-weight="700">중대범죄수사청(중수청) 신설과 상고심 적체 4만 건을 깰 법원조직법 제4조 개정안</text>

        <!-- 2대 핵심 개혁 축 -->
        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="490" height="230" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(52,211,153,0.3)"/>
          <text x="30" y="50" fill="#34D399" font-size="22" font-weight="900">축 1. 검찰청 폐지 ➔ 중수청·공소청 분리</text>
          <text x="30" y="90" fill="#ffffff" font-size="16" font-weight="700">직접수사권 완전 이관 및 기소권과의 상호 견제</text>
          <text x="30" y="125" fill="#D1FAE5" font-size="15">• 수사 개시 주체의 기소 독점으로 인한 별건·표적 수사 차단</text>
          <text x="30" y="155" fill="#D1FAE5" font-size="15">• 영국 중대비리수사청(SFO) &amp; 미국 FBI 모델 비교법적 도입</text>
          <text x="30" y="185" fill="#D1FAE5" font-size="15">• 국가수사위원회를 통한 민주적 통제 및 시민기소심의위 신설</text>

          <rect x="530" y="0" width="510" height="230" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(52,211,153,0.3)"/>
          <text x="560" y="50" fill="#34D399" font-size="22" font-weight="900">축 2. 법원조직법 개정 ➔ 대법관 14인 ➔ 24인</text>
          <text x="560" y="90" fill="#ffffff" font-size="16" font-weight="700">상고심 심리불속행 기각률 76% 타개 및 신속 재판권 보장</text>
          <text x="560" y="125" fill="#D1FAE5" font-size="15">• 대법관 1인당 연간 3,500건 폭증… 재판 지연 손실 연 13조 원</text>
          <text x="560" y="155" fill="#D1FAE5" font-size="15">• 4인 1조 6개 소부 편성… 노동·환경·특허 전문재판부 가동</text>
          <text x="560" y="185" fill="#D1FAE5" font-size="15">• 독일 연방대법원(130명) 수준 사실심·법률심 연계 개편</text>
        </g>
      </svg>
    `),
    topic: '대한민국 대법원 정의의 여신상 & 사법 대전환 3법',
    caption: '수사·기소 분리와 대법관 24인 증원을 통한 국민의 신속한 재판청구권 실질 보장.',
    credit: '스픽스 법조전문기자단'
  },

  // art-06: AI 주권과 에너지고속도로 (용인 반도체 & 신안 해상풍력)
  6: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <defs>
          <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0C4A6E"/>
            <stop offset="50%" stop-color="#082F49"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#bg6)"/>
        <!-- 반도체 웨이퍼 회로망 & 풍력발전기 실루엣 -->
        <g stroke="#38BDF8" stroke-width="1.5" opacity="0.25" fill="none">
          <circle cx="950" cy="300" r="160"/>
          <circle cx="950" cy="300" r="120"/>
          <line x1="950" y1="140" x2="950" y2="460"/>
          <line x1="790" y1="300" x2="1110" y2="300"/>
          <path d="M 300 480 L 300 280 L 330 320 M 300 280 L 270 320"/>
          <path d="M 220 480 L 220 330 L 240 360 M 220 330 L 200 360"/>
        </g>
        <rect x="80" y="70" width="220" height="34" rx="4" fill="#0284C7"/>
        <text x="95" y="93" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="14" font-weight="800">ISSUE SPECIAL · 미래산업</text>
        <text x="80" y="160" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="42" font-weight="900">AI 주권 국가와 에너지 고속도로</text>
        <text x="80" y="215" fill="#BAE6FD" font-family="'Pretendard', sans-serif" font-size="22" font-weight="700">용인 반도체 메가클러스터 전력 수요 10GW와 서남해안 RE100 직류송전망(HVDC)</text>

        <!-- 핵심 시너지 설명 카드 -->
        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="1040" height="230" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(56,189,248,0.3)"/>
          <text x="40" y="55" fill="#38BDF8" font-size="24" font-weight="900">성장(첨단 반도체 클러스터)과 분배(신안형 햇빛·바람연금)의 선순환</text>
          <text x="40" y="105" fill="#ffffff" font-size="16" line-height="1.6">
            1. 글로벌 빅테크 기업들의 RE100 의무화 규제 ➔ 서남해안 해상풍력·태양광 발전망 연결 없이는 반도체 수출 불가
          </text>
          <text x="40" y="145" fill="#ffffff" font-size="16">
            2. 초고압 직류송전망(HVDC) 국가 기간망 구축 ➔ 송전선로 경과지 80개 지자체 주민과 이익 공유제 제도화
          </text>
          <text x="40" y="185" fill="#ffffff" font-size="16">
            3. 전남 신안군 조례 제14조 실증 모델 전국 확산 ➔ 재생에너지 공유부 배당으로 인구소멸 위험지역 회생
          </text>
        </g>
      </svg>
    `),
    topic: '용인 반도체 메가클러스터 & 서남해안 에너지고속도로',
    caption: 'RE100 무역장벽 돌파와 지역 주민 햇빛연금 배당이 결합된 미래 성장 청사진.',
    credit: '스픽스 산업정책팀'
  },

  // art-07: Who Speaks 1 / 박지원 × 김종대 특별대담 (스튜디오 현장)
  7: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#0B132B"/>
        <rect x="80" y="70" width="260" height="36" rx="4" fill="#C8102E"/>
        <text x="95" y="94" fill="#ffffff" font-size="14" font-weight="900">WHO SPEAKS Ⅰ · 정치본색 Q&amp;A</text>
        <text x="80" y="160" fill="#ffffff" font-size="38" font-weight="900">“민생 앞에서는 여야가 없다, 11월에 30조 추경 담판 지어야”</text>
        <text x="80" y="210" fill="#F87171" font-size="22" font-weight="700">박지원 국회의원 × 김종대 전 국회의원 60분 집중 인터뷰 전문</text>

        <!-- 대담자 2인 카드 -->
        <g transform="translate(80, 260)">
          <rect x="0" y="0" width="500" height="240" rx="8" fill="#1E293B" stroke="#C8102E" stroke-width="2"/>
          <text x="30" y="45" fill="#EF4444" font-size="16" font-weight="900">박지원 국회의원 (전 국정원장)</text>
          <text x="30" y="80" fill="#ffffff" font-size="18" font-weight="700">“곳간을 쥐고 국민이 굶어 죽는 것을 방치하는 관료주의는 직무유기”</text>
          <text x="30" y="125" fill="#94A3B8" font-size="14">주말마다 전통시장을 돌며 상인들의 거친 손을 잡아보면 IMF 때보다 더 어렵다고 절규합니다.</text>
          <text x="30" y="155" fill="#94A3B8" font-size="14">표를 얻으려 돈을 푸는 게 포퓰리즘이지, 물가와 고금리에 목 졸린 소상공인 인공호흡이 포퓰리즘입니까.</text>
          <text x="30" y="200" fill="#CBD5E1" font-size="13">스픽스 정치본색 14:25 발언 구간 (시청자 집중도 98.4%)</text>

          <rect x="540" y="0" width="500" height="240" rx="8" fill="#1E293B" stroke="#2563EB" stroke-width="2"/>
          <text x="570" y="45" fill="#60A5FA" font-size="16" font-weight="900">김종대 전 국회의원 (군사안보전문가)</text>
          <text x="570" y="80" fill="#ffffff" font-size="18" font-weight="700">“가계부채 1,912조… 정부가 방파제 역할을 해야 내수 붕괴 막는다”</text>
          <text x="570" y="125" fill="#94A3B8" font-size="14">국가 재정은 가계가 위기에 처했을 때 지갑을 열어 경기 급락을 막아주라고 세금을 걷는 것입니다.</text>
          <text x="570" y="155" fill="#94A3B8" font-size="14">이념의 안경을 벗고 국익의 계산기를 두드려야만 반도체 공급망과 수출길을 지킬 수 있습니다.</text>
          <text x="570" y="200" fill="#CBD5E1" font-size="13">스픽스 정치본색 19:40 발언 구간</text>
        </g>
      </svg>
    `),
    topic: '스픽스 정치본색 박지원 의원 × 김종대 전 의원 특별대담',
    caption: '11월 정기국회 예산안 심사를 앞둔 여의도 정치권의 막전막후와 30조 추경 담판론.',
    credit: '스픽스 방송제작국'
  },

  // art-08: Who Speaks 2 / 최강욱 × 이언주 특별대담 (법사위 쟁점)
  8: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#0F172A"/>
        <rect x="80" y="70" width="260" height="36" rx="4" fill="#059669"/>
        <text x="95" y="94" fill="#ffffff" font-size="14" font-weight="900">WHO SPEAKS Ⅱ · 스픽스 1234 Q&amp;A</text>
        <text x="80" y="160" fill="#ffffff" font-size="38" font-weight="900">“수사·기소 분리는 시대적 상식, 사법 불신을 깰 제도 개혁에 명운 걸어야”</text>
        <text x="80" y="210" fill="#6EE7B7" font-size="22" font-weight="700">최강욱 전 국회의원 × 이언주 국회의원 법사위 집중토론 지상중계</text>

        <!-- 대담자 2인 카드 -->
        <g transform="translate(80, 260)">
          <rect x="0" y="0" width="500" height="240" rx="8" fill="#1E293B" stroke="#059669" stroke-width="2"/>
          <text x="30" y="45" fill="#34D399" font-size="16" font-weight="900">최강욱 전 의원 (전 법제사법위원)</text>
          <text x="30" y="80" fill="#ffffff" font-size="18" font-weight="700">“선진 민주국가 어디에도 수사·기소 독점 기관은 없다”</text>
          <text x="30" y="125" fill="#94A3B8" font-size="14">수사를 개시한 자가 기소권까지 쥐고 있으면 확증편향과 표적·별건 수사가 발생합니다.</text>
          <text x="30" y="155" fill="#94A3B8" font-size="14">중수청을 만들어 전문 수사를 하되, 공소청이 객관적 법리로 스크린해야 억울한 국민이 안 나옵니다.</text>
          <text x="30" y="200" fill="#CBD5E1" font-size="13">스픽스 1234 28:40 발언 구간 (법사위 입법 시간표)</text>

          <rect x="540" y="0" width="500" height="240" rx="8" fill="#1E293B" stroke="#3B82F6" stroke-width="2"/>
          <text x="570" y="45" fill="#60A5FA" font-size="16" font-weight="900">이언주 국회의원 (더불어민주당 최고위원)</text>
          <text x="570" y="80" fill="#ffffff" font-size="18" font-weight="700">“대법관 24인 증원… 재판 지연으로 기업과 시민 도산 막아야”</text>
          <text x="570" y="125" fill="#94A3B8" font-size="14">재판 하나가 5년씩 걸리면 이기더라도 이미 기업은 망하고 삶은 피폐해진 뒤입니다.</text>
          <text x="570" y="155" fill="#94A3B8" font-size="14">대법관을 24명으로 늘려 심리불속행 기각 남발을 막고 신속한 권리 구제를 보장해야 합니다.</text>
          <text x="570" y="200" fill="#CBD5E1" font-size="13">스픽스 1234 35:20 발언 구간</text>
        </g>
      </svg>
    `),
    topic: '스픽스 1234 최강욱 전 의원 × 이언주 의원 법사위 토론',
    caption: '중수청 설치법과 대법관 24인 증원안의 법리적 쟁점을 다룬 지상중계 Q&A.',
    credit: '스픽스 방송제작국'
  },

  // art-09: Who Speaks 3 / 선재규 × 김준형 × 최배근 특별대담 (외교·경제)
  9: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#0F172A"/>
        <rect x="80" y="70" width="280" height="36" rx="4" fill="#3B82F6"/>
        <text x="95" y="94" fill="#ffffff" font-size="14" font-weight="900">WHO SPEAKS Ⅲ · 통상외교 특별대담</text>
        <text x="80" y="160" fill="#ffffff" font-size="36" font-weight="900">“이념의 안경을 벗고 국익의 계산기를 두드려라: 격변하는 글로벌 통상”</text>
        <text x="80" y="210" fill="#93C5FD" font-size="22" font-weight="700">선재규 연합뉴스 선임기자 × 김준형 국회의원 · 최배근 교수 3인 합동 좌담</text>

        <!-- 3인 발언 요약 그리드 -->
        <g transform="translate(80, 260)">
          <rect x="0" y="0" width="320" height="240" rx="8" fill="#1E293B" stroke="#475569"/>
          <text x="24" y="45" fill="#38BDF8" font-size="16" font-weight="900">선재규 선임기자</text>
          <text x="24" y="80" fill="#ffffff" font-size="16" font-weight="700">“미국의 보편 관세 장벽과 동맹 압박의 이면을 직시하라”</text>
          <text x="24" y="120" fill="#94A3B8" font-size="13">칩스법과 IRA 보조금 조건 뒤에 숨겨진 자국 우선주의 사다리 걷어차기를 꿰뚫어보아야 합니다.</text>
          <text x="24" y="195" fill="#64748B" font-size="12">스픽스 특별인터뷰 41:10</text>

          <rect x="350" y="0" width="320" height="240" rx="8" fill="#1E293B" stroke="#475569"/>
          <text x="374" y="45" fill="#818CF8" font-size="16" font-weight="900">김준형 국회의원</text>
          <text x="374" y="80" fill="#ffffff" font-size="16" font-weight="700">“외교에서 가장 위험한 태도는 스스로 선택지를 지우는 것”</text>
          <text x="374" y="120" fill="#94A3B8" font-size="13">한미동맹을 기축으로 삼되 중국·글로벌 사우스와의 통상 협력 채널을 능동적으로 관리하는 실용외교가 절실합니다.</text>
          <text x="374" y="195" fill="#64748B" font-size="12">전 국립외교원장</text>

          <rect x="700" y="0" width="340" height="240" rx="8" fill="#1E293B" stroke="#475569"/>
          <text x="724" y="45" fill="#34D399" font-size="16" font-weight="900">최배근 건국대 교수</text>
          <text x="724" y="80" fill="#ffffff" font-size="16" font-weight="700">“낙수효과는 끝났다, 내수와 수출의 쌍발 엔진 가동해야”</text>
          <text x="724" y="120" fill="#94A3B8" font-size="13">가계부채 1,912조 원을 연착륙시키고 친환경·AI R&amp;D를 지원하는 정책 금융 체계를 대대적으로 확충해야 합니다.</text>
          <text x="724" y="195" fill="#64748B" font-size="12">스픽스 경제본색</text>
        </g>
      </svg>
    `),
    topic: '스픽스 외교·경제 석학 3인 특별합동대담',
    caption: '보편 관세 폭풍과 미·중 공급망 블록화 속 한국 외교의 전략적 자율성 확보 방안.',
    credit: '스픽스 국제통상팀'
  },

  // art-10: 성한용 정치 칼럼 & 스픽스 단상
  10: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#1C1917"/>
        <rect x="80" y="70" width="220" height="34" rx="4" fill="#B45309"/>
        <text x="95" y="93" fill="#ffffff" font-size="14" font-weight="800">OPINION · 성한용 칼럼</text>
        <text x="80" y="160" fill="#ffffff" font-size="42" font-weight="900">‘분노의 정치’를 넘어 ‘책임의 정치’와 실용으로</text>
        <text x="80" y="215" fill="#FDE68A" font-size="22" font-weight="700">벼랑 끝에 선 한국 정치, 양극화의 증오를 멈추고 주권자의 삶을 응시하라</text>

        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="1040" height="230" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(245,158,11,0.3)"/>
          <text x="40" y="50" fill="#F59E0B" font-size="20" font-weight="800">성한용 (한겨레 정치부 선임기자) 특별기고</text>
          <text x="40" y="95" fill="#ffffff" font-size="17" line-height="1.6">
            “국민의 마음을 최종적으로 얻은 세력은 언제나 ‘더 크게 화를 낸 쪽’이 아니라 ‘더 유능하게 대안을 제시하고 책임을 진 쪽’이었다.”
          </text>
          <text x="40" y="140" fill="#D6D3D1" font-size="15">
            상대 진영을 악마화하면 당장 박수갈채와 후원금은 쏟아질지 모른다. 그러나 그 소음 속에서 정작 자영업자의 한숨은 묻힌다.
          </text>
          <text x="40" y="175" fill="#D6D3D1" font-size="15">
            지금 여의도에 필요한 것은 천수답 정치가 아니라, 자영업자 임대료와 이자 부담을 1%포인트라도 낮추는 치열한 정책 경쟁이다.
          </text>
        </g>
      </svg>
    `),
    topic: '성한용 정치 전문기자 특별기고 & 저널리즘 단상',
    caption: '40년 의회정치 취재 수첩으로 풀어낸 한국 민주주의와 책임정치 복원의 길.',
    credit: '한겨레 / 스픽스 논설위원실'
  },

  // art-11: 선재규의 월드이슈 / 브릭스(BRICS+)와 공급망
  11: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#0B132B"/>
        <rect x="80" y="70" width="220" height="34" rx="4" fill="#4338CA"/>
        <text x="95" y="93" fill="#ffffff" font-size="14" font-weight="800">WORLD ISSUE · 선재규 대기자</text>
        <text x="80" y="160" fill="#ffffff" font-size="40" font-weight="900">브릭스(BRICS+) 확장과 글로벌 공급망 블록화</text>
        <text x="80" y="215" fill="#C7D2FE" font-size="22" font-weight="700">달러 패권의 균열과 EU 탄소국경세(CBAM), 그리고 한국 수출의 활로</text>

        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="1040" height="230" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(99,102,241,0.3)"/>
          <text x="40" y="50" fill="#818CF8" font-size="22" font-weight="800">글로벌 4대 권역 통상 압력과 한국의 대응 공간</text>
          <text x="40" y="95" fill="#ffffff" font-size="16">1. 미국: 첨단 반도체·AI 수출 통제 및 보편 관세 10~20% 부과 위협 대응</text>
          <text x="40" y="135" fill="#ffffff" font-size="16">2. 브릭스(BRICS+): 위안화·루피화 결제 비중 25% 돌파… 탈달러화 및 원자재 공급망 분산</text>
          <text x="40" y="175" fill="#ffffff" font-size="16">3. 유럽연합(EU): 탄소국경조정제도(CBAM) 본격 시행에 맞춘 RE100 청정에너지 생산 체제 전환</text>
        </g>
      </svg>
    `),
    topic: '선재규의 월드이슈: 브릭스 다극화와 글로벌 공급망 지도',
    caption: '달러 패권 균열과 무역 블록화 속 한국 제조업의 다자간 외교통상 생존법.',
    credit: '스픽스 국제통상팀'
  },

  // art-12: 천안 아우내 장터 역사문화 답사기
  12: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#292524"/>
        <rect x="80" y="70" width="240" height="34" rx="4" fill="#B91C1C"/>
        <text x="95" y="93" fill="#ffffff" font-size="14" font-weight="800">CULTURE &amp; HERITAGE · 역사기행</text>
        <text x="80" y="160" fill="#ffffff" font-size="38" font-weight="900">1919년 아우내의 함성에서 오늘의 민주공화국까지</text>
        <text x="80" y="215" fill="#FCA5A5" font-size="22" font-weight="700">충남 천안시 동남구 병천면 아우내 만세터와 도서출판 아우내의 뿌리</text>

        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="1040" height="230" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(239,68,68,0.3)"/>
          <text x="40" y="50" fill="#EF4444" font-size="22" font-weight="800">도서출판 아우내(충남 천안시 동남구 양지말1길 40)의 출판 철학</text>
          <text x="40" y="95" fill="#ffffff" font-size="16" line-height="1.6">
            1919년 4월 1일 열일곱 소녀 유관순 열사와 3천여 군중이 일제의 총칼에 맞서 독립선언서를 낭독했던 그 장터.
          </text>
          <text x="40" y="135" fill="#E7E5E4" font-size="15">
            ‘두 줄기 내가 하나로 어우러진다’는 아우내(並川)의 뜻처럼, 진영을 넘어 시민의 지혜를 모으는 공론장을 활자로 엮습니다.
          </text>
          <text x="40" y="175" fill="#A8A29E" font-size="14">
            정기간행물 ISSN 3022-891X · 전자책 ISBN 978-89-98765-43-2 공식 등록
          </text>
        </g>
      </svg>
    `),
    topic: '천안 병천 아우내 만세터 & 유관순 열사 사적지 답사기',
    caption: '1919년 4월 1일 자주독립의 성지에서 피어난 도서출판 아우내의 출판 정신.',
    credit: '도서출판 아우내 문화재팀'
  },

  // art-13: 지방시대 / 신안 햇빛연금과 청년의 귀환
  13: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#064E3B"/>
        <rect x="80" y="70" width="240" height="34" rx="4" fill="#047857"/>
        <text x="95" y="93" fill="#ffffff" font-size="14" font-weight="800">LOCAL ERA · 지방시대 현장르포</text>
        <text x="80" y="160" fill="#ffffff" font-size="40" font-weight="900">바람과 햇빛이 연금이 되는 섬: 전남 신안군 르포</text>
        <text x="80" y="215" fill="#A7F3D0" font-size="22" font-weight="700">전국 89개 인구소멸 위험지역의 대안… 안좌도 주민 3,200명의 햇빛연금 수령 현장</text>

        <g transform="translate(80, 270)">
          <rect x="0" y="0" width="1040" height="230" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(52,211,153,0.3)"/>
          <text x="40" y="50" fill="#34D399" font-size="22" font-weight="800">신안군 『신재생에너지 개발이익 공유 조례』 제14조 실증 모델</text>
          <text x="40" y="95" fill="#ffffff" font-size="16">1. 주민협동조합 지분 30% 참여 ➔ 분기별 1인당 20만~60만 원 지역화폐 지급</text>
          <text x="40" y="135" fill="#ffffff" font-size="16">2. 청년·신혼부부 가구 유입 인센티브 ➔ 7년 만에 인구 순유입 반전 및 초등학교 폐교 위기 극복</text>
          <text x="40" y="175" fill="#ffffff" font-size="16">3. 자연 공유부(Commons)를 시민 권리로 전환하는 한국형 ‘기본사회’ 롤모델 제시</text>
        </g>
      </svg>
    `),
    topic: '전남 신안군 햇빛연금 배당 현장 & 인구소멸 극복 르포',
    caption: '신안 안좌도 주민 3,200명의 분기별 햇빛연금 수령 현장과 청년 귀환 드라마.',
    credit: '신안군청 / 스픽스 로컬혁신팀'
  },

  // art-14: 도서출판 아우내 신간 총서 3종 & 독자 라운지
  14: {
    url: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#1E1B4B"/>
        <rect x="80" y="70" width="260" height="34" rx="4" fill="#4338CA"/>
        <text x="95" y="93" fill="#ffffff" font-size="14" font-weight="800">AUNAE BOOKS &amp; READERS · 신간 서평</text>
        <text x="80" y="160" fill="#ffffff" font-size="40" font-weight="900">시대를 읽는 지성의 나침반 — 도서출판 아우내 신간 3종</text>
        <text x="80" y="215" fill="#C7D2FE" font-size="22" font-weight="700">『대한민국 사법의 미래』 · 『에너지 기본사회』 · 『아우내의 함성』 심층 해제</text>

        <!-- 3권 책 카드 -->
        <g transform="translate(80, 260)">
          <rect x="0" y="0" width="320" height="240" rx="8" fill="#312E81" stroke="#6366F1"/>
          <text x="24" y="45" fill="#F43F5E" font-size="13" font-weight="900">신간 1 · 사법개혁 총서</text>
          <text x="24" y="80" fill="#ffffff" font-size="18" font-weight="800">『대한민국 사법의 미래』</text>
          <text x="24" y="110" fill="#A5B4FC" font-size="13">수사와 기소의 분리 | 360쪽 | 22,000원</text>
          <text x="24" y="145" fill="#E0E7FF" font-size="13">해방 후 70년 검찰 제도의 명암과 영국 CPS, 미국 연방검찰 비교법적 결정판.</text>

          <rect x="350" y="0" width="320" height="240" rx="8" fill="#312E81" stroke="#6366F1"/>
          <text x="374" y="45" fill="#10B981" font-size="13" font-weight="900">신간 2 · 미래산업 정책서</text>
          <text x="374" y="80" fill="#ffffff" font-size="18" font-weight="800">『에너지 기본사회』</text>
          <text x="374" y="110" fill="#A5B4FC" font-size="13">지방소멸을 넘어서 | 312쪽 | 20,000원</text>
          <text x="374" y="145" fill="#E0E7FF" font-size="13">최배근·김종대 공저. 재생에너지와 지역 기본소득 결합 거시경제학 모델.</text>

          <rect x="700" y="0" width="340" height="240" rx="8" fill="#312E81" stroke="#6366F1"/>
          <text x="724" y="45" fill="#F59E0B" font-size="13" font-weight="900">신간 3 · 역사 인문 논픽션</text>
          <text x="724" y="80" fill="#ffffff" font-size="18" font-weight="800">『아우내의 함성』</text>
          <text x="724" y="110" fill="#A5B4FC" font-size="13">끝나지 않은 독립의 길 | 280쪽 | 18,000원</text>
          <text x="724" y="145" fill="#E0E7FF" font-size="13">1919년 천안 병천 아우내 만세운동의 미공개 일제 수형기록 발굴 역작.</text>
        </g>
      </svg>
    `),
    topic: '도서출판 아우내 신간 총서 3종 & 애독자 라운지',
    caption: '도서출판 아우내 인문·시사 총서 3종 및 153만 시청자 독자 편지.',
    credit: '도서출판 아우내'
  }
};

/**
 * 기사 인덱스(0 ~ 13)에 따른 대표 비주얼 반환
 */
export function getTopicVisual(index = 0) {
  const artNo = (Number(index) % 14) + 1;
  return TOPIC_VISUALS[artNo] || TOPIC_VISUALS[1];
}

/**
 * 50페이지 페이지 번호(1 ~ 50)에 따른 비주얼 반환
 */
export function getPageTopicVisual(pageNumber = 1) {
  const p = Math.max(1, Math.min(50, Number(pageNumber) || 1));
  if (p <= 4) return TOPIC_VISUALS[1];
  if (p <= 7) return TOPIC_VISUALS[2];
  if (p <= 10) return TOPIC_VISUALS[3];
  if (p <= 14) return TOPIC_VISUALS[4];
  if (p <= 17) return TOPIC_VISUALS[5];
  if (p <= 20) return TOPIC_VISUALS[6];
  if (p <= 24) return TOPIC_VISUALS[7];
  if (p <= 28) return TOPIC_VISUALS[8];
  if (p <= 32) return TOPIC_VISUALS[9];
  if (p <= 36) return TOPIC_VISUALS[10];
  if (p <= 40) return TOPIC_VISUALS[11];
  if (p <= 44) return TOPIC_VISUALS[12];
  if (p <= 47) return TOPIC_VISUALS[13];
  return TOPIC_VISUALS[14];
}
