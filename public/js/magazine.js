/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』
 * 모바일 퍼스트 50페이지 정식 주간지 책장 넘김 E-Book 뷰어 (public/js/magazine.js)
 * 50페이지 전 지면 고유 비주얼 & 심층 탐사 저널리즘 템플릿 엔진
 */

import {
  generateQrSvg,
  generateBarcodeSvg,
  generateBroadcastStillHtml,
  generatePollChartSvg,
  generateWorldDiagramSvg,
  getEditorialPhoto,
  getEditorialVisual
} from './qr-generator.js';

let issueData = null;
let currentPageIndex = 0; // 0 ~ 49
const totalPages = 50;

let fontScale = Number(localStorage.getItem('speaks-mag-font-scale') || 1.0);
let zoomLevel = 1.0;
let isSpreadMode = false;

let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let currentPanX = 0;
let currentPanY = 0;
let lastTapTime = 0;

async function initMagazineViewer() {
  try {
    const res = await fetch('/api/issue');
    issueData = await res.json();

    const meta = issueData.meta;
    const headerMetaEl = document.getElementById('header-issue-meta');
    if (headerMetaEl) {
      headerMetaEl.textContent = `${meta.issueNumber} · ${meta.publishDate} · 50p 완본`;
    }

    applyFontScale(fontScale);
    renderAllPages();
    renderTocList();
    setupInteractions();
    checkOrientation();

    const params = new URLSearchParams(window.location.search);
    const pParam = Number(params.get('p'));
    if (pParam >= 1 && pParam <= totalPages) {
      goToPage(pParam - 1);
    } else {
      goToPage(0);
    }

    if (params.get('print') === '1') {
      setTimeout(() => window.print(), 600);
    }

    setTimeout(() => {
      document.getElementById('swipe-hint')?.classList.add('hidden');
    }, 3500);
  } catch (err) {
    console.error('전자책 데이터를 불러오는 중 오류 발생:', err);
  }
}

function applyFontScale(scaleVal) {
  fontScale = Math.min(1.55, Math.max(0.85, Number(scaleVal.toFixed(2))));
  document.documentElement.style.setProperty('--font-scale-factor', String(fontScale));

  const indicator = document.getElementById('font-scale-indicator');
  if (indicator) {
    indicator.textContent = `${Math.round(fontScale * 100)}%`;
  }
  try {
    localStorage.setItem('speaks-mag-font-scale', String(fontScale));
  } catch {}
}

function applyZoom(newZoom, panX = 0, panY = 0) {
  zoomLevel = Math.min(2.5, Math.max(0.85, Number(newZoom.toFixed(2))));
  if (zoomLevel === 1.0) {
    currentPanX = 0;
    currentPanY = 0;
  } else {
    currentPanX = panX;
    currentPanY = panY;
  }

  document.documentElement.style.setProperty('--zoom-level', String(zoomLevel));
  document.documentElement.style.setProperty('--pan-x', `${currentPanX}px`);
  document.documentElement.style.setProperty('--pan-y', `${currentPanY}px`);

  const resetBtn = document.getElementById('zoom-reset-btn');
  if (resetBtn) {
    resetBtn.textContent = `${Math.round(zoomLevel * 100)}%`;
  }
}

function renderAllPages() {
  if (!issueData || !issueData.pages) return;
  const container = document.getElementById('flipbook-pages');
  if (!container) return;

  container.innerHTML = issueData.pages
    .map((page, idx) => renderPageHtml(page, idx, issueData))
    .join('');
}

function renderPageHtml(page, idx, issue) {
  const pNum = idx + 1;
  const pStr = String(pNum).padStart(2, '0');
  const pub = issue.meta.publisher;
  const visual = page.visual || getEditorialVisual(pNum);
  const photo = visual.url;

  // =========================================================================
  // p.01: 표지 (Front Cover)
  // =========================================================================
  if (pNum === 1) {
    return `
      <section class="mag-page cover-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span style="letter-spacing:0.15em;text-transform:uppercase;">THE SPEAKS WEEKLY REVIEW</span>
          <span>${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content" style="justify-content:center;">
          <div style="font-size:calc(10px * var(--font-scale-factor, 1));color:#EF4444;letter-spacing:0.18em;font-weight:700;margin-bottom:3px;">
            WEEKLY POLITICAL &amp; CULTURAL REVIEW
          </div>
          <h1 class="mag-title" style="margin-bottom:4px;">
            주간 <span style="color:#EF4444;">스픽스</span>
          </h1>
          <div class="mag-subtitle" style="margin-bottom:10px;">
            더 나은 세상을 만드는 정치·시사·문화 주간지
          </div>

          <div style="position:relative;border-radius:4px;overflow:hidden;margin-bottom:10px;background:#000;">
            <img src="${photo}" alt="커버스토리" style="width:100%;aspect-ratio:16/10;object-fit:cover;opacity:0.9;" />
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.92));padding:8px 12px;">
              <span style="background:#C8102E;color:#fff;font-size:9.5px;font-weight:800;padding:2px 6px;border-radius:2px;">금주의 커버스토리</span>
              <div style="font-size:calc(13.5px * var(--font-scale-factor, 1));font-weight:800;color:#fff;margin-top:3px;line-height:1.35;">
                “2026 대전환의 분수령: 30조 민생회복과 사법개혁 입법 로드맵”
              </div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.06);border-left:3px solid #EF4444;padding:8px 10px;border-radius:0 4px 4px 0;">
            <div style="font-size:calc(10.5px * var(--font-scale-factor, 1));font-weight:700;color:#EF4444;margin-bottom:4px;">금주의 5대 핵심 지면</div>
            <ul style="margin:0;padding-left:14px;font-size:calc(11px * var(--font-scale-factor, 1));line-height:1.55;color:#E5E7EB;">
              <li><strong>p.05 스픽스 레이다</strong>: 1,482만 뷰 폭발한 결정적 발언록 말말말 &amp; 여론 꺾은선 차트</li>
              <li><strong>p.11 커버스토리</strong>: 민생 추경 vs 재정준칙, 중수청 설치법 제12조 전격 해부</li>
              <li><strong>p.21 Who Speaks</strong>: 박지원·김종대·최강욱·이언주 지상중계 인터뷰 (타임스탬프 QR)</li>
              <li><strong>p.33 오피니언 &amp; 월드</strong>: 성한용 칼럼 &amp; 선재규의 반도체 통상 글로벌 정세도</li>
              <li><strong>p.41 컬처 &amp; 지방시대</strong>: 충남 천안 아우내 독립만세운동 역사기행 &amp; 신간 서평</li>
            </ul>
          </div>
        </div>

        <div class="mag-running-footer">
          <span>발행처: ${pub.name} (${pub.phone})</span>
          <span class="mag-page-number">p.01</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.02: 발행인의 말 (Publisher's Letter)
  // =========================================================================
  if (pNum === 2) {
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">PUBLISHER'S LETTER · 권두언</span>
          <span>${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">방송의 생생한 맥박 위에 정통 저널리즘의 깊은 호흡을 더합니다</h2>
          <div class="mag-subtitle">도서출판 아우내 &amp; 스픽스 미디어가 독자 여러분께 드리는 창간 선언문</div>

          <div style="position:relative;border-radius:4px;overflow:hidden;margin:6px 0 10px;">
            <img src="${photo}" alt="권두언 서재" style="width:100%;aspect-ratio:16/9;object-fit:cover;" />
            <div style="font-size:calc(9.5px * var(--font-scale-factor, 1));color:#6b7280;margin-top:3px;display:flex;justify-content:space-between;align-items:center;">
              <span><strong style="color:#C8102E;">[포커스]</strong> ${visual.caption}</span>
              <span style="font-size:9px;color:#9ca3af;">${visual.credit}</span>
            </div>
          </div>

          <div style="background:#FAF2ED;border-left:3px solid #C8102E;padding:6px 10px;margin-bottom:8px;font-size:calc(11.5px * var(--font-scale-factor, 1));font-weight:700;color:#111;">
            “화면 속의 뜨거운 설전이 활자의 깊이와 만날 때, 시대를 읽는 가장 단단한 나침반이 태어납니다.”
          </div>

          <div class="mag-columns-2">
            <p>유튜브 채널 구독자 153만 명, 누적 동영상 4만 2천여 편의 ‘스픽스(@SPEAKS_TV)’는 대한민국 정치 공론장의 가장 역동적인 최전선입니다. 그러나 빠르게 소비되고 흘러가는 디지털 영상만으로는 복잡한 국정 현안의 구조적 본질을 온전히 기록하기 어려웠습니다.</p>
            <p>이에 충남 천안 병천 아우내 장터의 독립·민주 정신을 계승한 ‘도서출판 아우내’의 출판 장인정신과 인터넷 신문 ‘speaks.kr’의 탐사 취재 역량을 결합하여, 매주 월요일 50페이지 정통 시사주간지 『주간 스픽스』를 발행합니다.</p>
          </div>
        </div>

        <div class="mag-running-footer">
          <span>도서출판 아우내 편집국</span>
          <span class="mag-page-number">p.02</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.03: 전체 목차 (TOC)
  // =========================================================================
  if (pNum === 3) {
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">TABLE OF CONTENTS · 전체 목차</span>
          <span>${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">『주간 스픽스』 제2026-44호 50페이지 전 지면 편성표</h2>
          <div class="mag-subtitle">총 14개 핵심 꼭지 및 입체 지면 가이드</div>

          <div style="display:flex;flex-direction:column;gap:7px;margin-top:6px;">
            <div style="border-bottom:1px solid #EBEBEB;padding-bottom:5px;">
              <span style="font-size:10px;font-weight:800;color:#C8102E;">COVER &amp; INTRO (p.01 ~ 04)</span>
              <div style="font-size:calc(12px * var(--font-scale-factor, 1));font-weight:700;color:#111;">표지 · 발행인의 말 · 전체 목차 · 도서출판 아우내 판권지</div>
            </div>
            <div style="border-bottom:1px solid #EBEBEB;padding-bottom:5px;">
              <span style="font-size:10px;font-weight:800;color:#C8102E;">PART 1. 스픽스 레이다 (p.05 ~ 10)</span>
              <div style="font-size:calc(12px * var(--font-scale-factor, 1));font-weight:700;color:#111;">금주의 결정적 발언록 말말말 · 급상승 클립 Top 5 · 여론지표 차트(p.08)</div>
            </div>
            <div style="border-bottom:1px solid #EBEBEB;padding-bottom:5px;">
              <span style="font-size:10px;font-weight:800;color:#C8102E;">PART 2. 커버스토리 &amp; 이슈기획 (p.11 ~ 20)</span>
              <div style="font-size:calc(12px * var(--font-scale-factor, 1));font-weight:700;color:#111;">2026 대전환의 분수령: 30조 민생추경 vs 재정준칙 · 4대 쟁점 비교표(p.13) · 중수청 설치법</div>
            </div>
            <div style="border-bottom:1px solid #EBEBEB;padding-bottom:5px;">
              <span style="font-size:10px;font-weight:800;color:#C8102E;">PART 3. Who Speaks 지상중계 (p.21 ~ 32)</span>
              <div style="font-size:calc(12px * var(--font-scale-factor, 1));font-weight:700;color:#111;">박지원·김종대·최강욱·이언주·김준형 심층 Q&amp;A 인터뷰 (타임스탬프 QR 수록)</div>
            </div>
            <div style="border-bottom:1px solid #EBEBEB;padding-bottom:5px;">
              <span style="font-size:10px;font-weight:800;color:#C8102E;">PART 4. 오피니언 &amp; 월드 (p.33 ~ 40)</span>
              <div style="font-size:calc(12px * var(--font-scale-factor, 1));font-weight:700;color:#111;">성한용 정치 칼럼 · 선재규의 반도체 통상 월드이슈 · 글로벌 정세도(p.39)</div>
            </div>
            <div style="border-bottom:1px solid #EBEBEB;padding-bottom:5px;">
              <span style="font-size:10px;font-weight:800;color:#C8102E;">PART 5. 컬처·라이프 &amp; 지방시대 (p.41 ~ 50)</span>
              <div style="font-size:calc(12px * var(--font-scale-factor, 1));font-weight:700;color:#111;">풀뿌리 지방자치 현장 · 천안 아우내 역사기행 · 아우내 신간 서평(p.48) · 공식 바코드</div>
            </div>
          </div>
        </div>

        <div class="mag-running-footer">
          <span>주간 스픽스 (SPEAKS WEEKLY)</span>
          <span class="mag-page-number">p.03</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.04: 판권지 (Colophon) & 아우내 공식 등록 정보
  // =========================================================================
  if (pNum === 4) {
    const barcodeSvg = generateBarcodeSvg('ISSN 3022-891X', 'ISBN 978-89-98765-43-2', 240, 64);
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">COLOPHON · 공식 판권지</span>
          <span>${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">발행·제작처 안내 및 정기간행물 등록 정보</h2>
          <div class="mag-subtitle">도서출판 아우내의 장인정신과 독립·민주 정신의 계보</div>

          <div style="position:relative;border-radius:4px;overflow:hidden;margin:6px 0 10px;">
            <img src="${photo}" alt="천안 아우내" style="width:100%;aspect-ratio:16/9;object-fit:cover;" />
          </div>

          <div style="background:#F9F9F9;border:1px solid #EBEBEB;border-radius:4px;padding:12px;font-size:calc(11px * var(--font-scale-factor, 1));line-height:1.75;color:#333;">
            <strong>제호</strong>: 『주간 스픽스 (SPEAKS WEEKLY)』<br/>
            <strong>부제</strong>: 더 나은 세상을 만드는 정치·시사·문화 주간지<br/>
            <strong>발행·제작처 상호</strong>: 도서출판 아우내<br/>
            <strong>소재지 주소</strong>: 충남 천안시 동남구 양지말1길 40 (병천면)<br/>
            <strong>대표전화</strong>: 070-7561-0677 | 팩스: 041-561-0678<br/>
            <strong>원천 미디어</strong>: 스픽스 인터넷신문(speaks.kr) · 유튜브 채널(@SPEAKS_TV)<br/>
            <strong>간행물 번호</strong>: <strong>ISSN 3022-891X</strong> (정기간행물)<br/>
            <strong>전자책 번호</strong>: <strong>ISBN 978-89-98765-43-2</strong> (전자책)
          </div>

          <div style="margin-top:auto;text-align:center;padding:10px 0;">
            ${barcodeSvg}
          </div>
        </div>

        <div class="mag-running-footer">
          <span>도서출판 아우내 등록필</span>
          <span class="mag-page-number">p.04</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.08: 전면 여론조사 꺾은선 인포그래픽 차트 지면 (중복 이미지 탈출!)
  // =========================================================================
  if (pNum === 8) {
    const chartSvg = generatePollChartSvg(issue.infographics?.pollChart);
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">GRAPHIC DETAIL · 여론조사 인포그래픽</span>
          <span>p.08 · ${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">민심의 저울은 어디로 기울었나: 민생 42.8% vs 사법개혁 24.6%</h2>
          <div class="mag-subtitle">스픽스 여론분석팀 · 주간 5개 의제 시급성 지표 5주간 추이 정밀 분석</div>

          ${chartSvg}

          <div class="mag-columns-2" style="margin-top:8px;">
            <p>10월 4주차 스픽스 주간 여론조사 결과, 국민이 가장 시급하게 요구하는 국정 과제는 ‘민생물가 안정 및 내수 회복(42.8%)’으로 5주 연속 상승세를 기록했다. 반면 ‘검찰·사법제도 개혁 완수(24.6%)’ 역시 견고한 2위 지지층을 형성하고 있다.</p>
            <p>전문가들은 “민생 경제와 사법 개혁은 대립되는 과제가 아니라, 공정한 법 집행이 뒷받침되어야 시장 경제의 활력이 살아난다는 시민사회의 복합적 인식이 데이터로 입증된 것”이라고 분석했다.</p>
          </div>
        </div>

        <div class="mag-running-footer">
          <span>스픽스 여론분석팀 데이터랩</span>
          <span class="mag-page-number">p.08</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.13: 전면 2026 정기국회 4대 핵심 쟁점 찬반 비교표 지면 (중복 이미지 탈출!)
  // =========================================================================
  if (pNum === 13) {
    const compRows = issue.infographics?.issueComparison?.rows || [];
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">POLICY COMPARISON · 4대 쟁점 비교</span>
          <span>p.13 · ${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">2026 정기국회 4대 핵심 쟁점별 찬반 비교 &amp; 팩트체크</h2>
          <div class="mag-subtitle">정부·여당 vs 야당·시민사회 쟁점별 충돌 지점과 법조문 정밀 대비</div>

          <div style="overflow-x:auto;margin:6px 0 10px;">
            <table style="width:100%;border-collapse:collapse;font-size:calc(10.5px * var(--font-scale-factor, 1));line-height:1.45;">
              <thead>
                <tr style="background:#0F1E36;color:#ffffff;">
                  <th style="padding:6px;border:1px solid #ccc;width:22%;">핵심 분야</th>
                  <th style="padding:6px;border:1px solid #ccc;width:39%;">추진 측 (개혁·민생 확장)</th>
                  <th style="padding:6px;border:1px solid #ccc;width:39%;">신중·반대 측 (건전성·신중론)</th>
                </tr>
              </thead>
              <tbody>
                ${compRows
                  .slice(0, 3)
                  .map(
                    (r) => `
                  <tr>
                    <td style="padding:6px;border:1px solid #E5E0D8;font-weight:700;background:#F9F9F9;color:#C8102E;">${r.field}</td>
                    <td style="padding:6px;border:1px solid #E5E0D8;background:#ffffff;">${r.proArgument}</td>
                    <td style="padding:6px;border:1px solid #E5E0D8;background:#FAF8F5;">${r.conArgument}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div style="background:#FAF2ED;border-left:3px solid #C8102E;padding:6px 8px;font-size:calc(10.5px * var(--font-scale-factor, 1));color:#333;">
            <strong>스픽스 팩트체크 총평</strong>: 11월 본회의 표결을 앞두고 예산안 연계 협상 여부가 최대 분수령이며, 중수청 설치법의 소관 부처 조율이 막판 타결의 핵심 열쇠가 될 전망이다.
          </div>
        </div>

        <div class="mag-running-footer">
          <span>스픽스 정책기획팀 입법 분석</span>
          <span class="mag-page-number">p.13</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.21 ~ p.32: Who Speaks 지상중계 인터뷰 (1문 1답 Q&A + 방송 타임스탬프 QR)
  // =========================================================================
  if (pNum >= 21 && pNum <= 32) {
    const clipIdx = (pNum - 21) % (issue.youtubeTopClips?.length || 1);
    const clip = issue.youtubeTopClips?.[clipIdx] || issue.youtubeTopClips?.[0];
    const qrSvg = clip ? generateQrSvg(clip.videoUrl, 72) : '';

    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">WHO SPEAKS · 지상중계 인터뷰 (Q&amp;A)</span>
          <span>p.${pStr} · ${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">${page.title}</h2>
          <div class="mag-subtitle">${page.subtitle || '스픽스 대담 방송을 정통 시사주간지 문어체 일문일답으로 재구성'}</div>

          <div style="position:relative;border-radius:4px;overflow:hidden;margin:4px 0 8px;background:#000;">
            <img src="${photo}" alt="${page.title}" style="width:100%;aspect-ratio:16/9;object-fit:cover;" />
            <div style="font-size:calc(9px * var(--font-scale-factor, 1));color:#6b7280;margin-top:3px;display:flex;justify-content:space-between;align-items:center;">
              <span><strong style="color:#C8102E;">[포커스]</strong> ${visual.caption}</span>
              <span style="font-size:8.5px;color:#9ca3af;">${visual.credit}</span>
            </div>
          </div>

          <div style="background:#F9F9F9;border-left:3px solid #C8102E;padding:6px 10px;margin-bottom:8px;font-size:calc(11px * var(--font-scale-factor, 1));line-height:1.5;">
            <strong style="color:#C8102E;">질문:</strong> “국회 예결위의 30조 민생추경 격돌, 과연 정기국회 내 처리가 가능한가?”<br/>
            <strong style="color:#111111;">답변:</strong> “골목상권의 체감 경기는 이미 한계 상황입니다. 여야가 정쟁을 멈추고 초당적으로 통과시켜야 합니다.”
          </div>

          <div class="mag-columns-2">
            <p>${page.paragraphs?.[0] || '스픽스 대담 현장에서 오간 날선 공방의 핵심은 실효성 있는 민생 대책이었습니다.'}</p>
            <p>${page.paragraphs?.[1] || '법안 통과를 위한 여야 원내대표단의 물밑 협상이 급물살을 타고 있습니다.'}</p>
          </div>

          ${
            clip
              ? `
            <div style="margin-top:auto;display:flex;align-items:center;gap:10px;background:#FAF8F5;border:1px solid #E5E0D8;border-radius:4px;padding:6px 8px;">
              <div style="flex-shrink:0;">${qrSvg}</div>
              <div style="font-size:calc(9.5px * var(--font-scale-factor, 1));line-height:1.4;color:#333;">
                <strong style="color:#C8102E;display:block;">스마트폰으로 스캔하면 해당 방송 지점으로 바로 이동합니다</strong>
                프로그램: <strong>${clip.program}</strong> (${clip.speaker})<br/>
                타임스탬프: <strong>${clip.timestamp}</strong> (${clip.heatmapPeak || '시청자 집중도 1위'})
              </div>
            </div>
          `
              : ''
          }
        </div>

        <div class="mag-running-footer">
          <span>스픽스 취재팀 · 특별 대담</span>
          <span class="mag-page-number">p.${pStr}</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.39: 선재규 월드이슈 전면 세계 정세도 다이어그램 지면 (중복 이미지 탈출!)
  // =========================================================================
  if (pNum === 39) {
    const worldSvg = generateWorldDiagramSvg();
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">GEOPOLITICAL BRIEFING · 글로벌 정세도</span>
          <span>p.39 · ${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">미·중 반도체 패권과 브릭스 통상 파고: 2026 한국의 생존 방정식</h2>
          <div class="mag-subtitle">선재규 선임기자 · 다극화 통상 전쟁 속 핵심 광물 및 수출 다변화 전략 지도</div>

          ${worldSvg}

          <div class="mag-columns-2" style="margin-top:8px;">
            <p>미국의 보편 관세 압박과 중국-브릭스(BRICS+)의 핵심 광물 통제 조치가 동시에 몰아치는 가운데, 한국 경제는 어느 한쪽에 경도되지 않는 정교한 ‘국익 실용 통상’을 펼쳐야 한다.</p>
            <p>선재규 선임기자는 “반도체와 이차전지의 기술 초격차를 유지하면서도, 아세안과 인도 등 제3의 공급망을 서둘러 확보하는 것이 2026년 무역 흑자 반등의 전제조건”이라고 강조했다.</p>
          </div>
        </div>

        <div class="mag-running-footer">
          <span>선재규의 월드이슈 브리핑</span>
          <span class="mag-page-number">p.39</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // p.48: 도서출판 아우내 신간 서평 지면 (신간 3종 해제)
  // =========================================================================
  if (pNum === 48) {
    return `
      <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
        <div class="mag-running-header">
          <span class="running-section-tag">AUNAE BOOK REVIEW · 아우내 서평</span>
          <span>p.48 · ${issue.meta.issueNumber}</span>
        </div>

        <div class="mag-page-content">
          <h2 class="mag-title">도서출판 아우내 신간 총서: 시대를 읽는 지성의 나침반 3종</h2>
          <div class="mag-subtitle">도서출판 아우내(충남 천안시 동남구 양지말1길 40) 편집부 엄선 이달의 필독서</div>

          <div style="position:relative;border-radius:4px;overflow:hidden;margin:4px 0 8px;">
            <img src="${photo}" alt="${visual.topic}" style="width:100%;aspect-ratio:16/8;object-fit:cover;" />
            <div style="font-size:calc(9px * var(--font-scale-factor, 1));color:#6b7280;margin-top:3px;display:flex;justify-content:space-between;">
              <span><strong style="color:#C8102E;">[포커스]</strong> ${visual.caption}</span>
              <span style="color:#9ca3af;">${visual.credit}</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px;">
            <div style="background:#FAF8F5;border-left:3px solid #C8102E;padding:6px 8px;border-radius:0 4px 4px 0;">
              <strong style="color:#C8102E;font-size:calc(11px * var(--font-scale-factor, 1));">1. 『대한민국 사법의 미래: 수사와 기소의 분리』</strong>
              <div style="font-size:calc(9.5px * var(--font-scale-factor, 1));color:#4b5563;">스픽스 사법개혁 기획팀 편저 | 360쪽 | 22,000원 — 선진국 수사·기소 분리 비교법적 분석과 중수청 설치법 해제.</div>
            </div>
            <div style="background:#FAF8F5;border-left:3px solid #0F1E36;padding:6px 8px;border-radius:0 4px 4px 0;">
              <strong style="color:#0F1E36;font-size:calc(11px * var(--font-scale-factor, 1));">2. 『에너지 기본사회: 지방소멸을 넘어서』</strong>
              <div style="font-size:calc(9.5px * var(--font-scale-factor, 1));color:#4b5563;">최배근·김종대 공저 | 312쪽 | 20,000원 — 신안 햇빛연금과 에너지고속도로의 거시경제적 선순환 모델.</div>
            </div>
            <div style="background:#FAF8F5;border-left:3px solid #059669;padding:6px 8px;border-radius:0 4px 4px 0;">
              <strong style="color:#059669;font-size:calc(11px * var(--font-scale-factor, 1));">3. 『아우내의 함성: 끝나지 않은 독립의 길』</strong>
              <div style="font-size:calc(9.5px * var(--font-scale-factor, 1));color:#4b5563;">도서출판 아우내 역사연구회 저 | 280쪽 | 18,000원 — 1919년 천안 병천 아우내 만세운동의 미공개 사료 발굴 논픽션.</div>
            </div>
          </div>

          <div class="mag-columns-2" style="font-size:calc(10.5px * var(--font-scale-factor, 1));line-height:1.55;">
            <p>도서출판 아우내는 107년 전 천안 병천의 독립정신을 활자의 힘으로 계승하여, 자극적인 뉴스의 소음을 걷어내고 시민의 지적 근육을 단련하는 시사·인문 총서를 꾸준히 펴냅니다.</p>
            <p>본 총서 3종은 전국 주요 온·오프라인 서점 및 도서출판 아우내 본사(070-7561-0677)를 통해 만나보실 수 있습니다.</p>
          </div>
        </div>

        <div class="mag-running-footer">
          <span>도서출판 아우내 출판기획부</span>
          <span class="mag-page-number">p.48</span>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // 기본 표준 심층 지면 (p.05 ~ p.50 일반 페이지)
  // =========================================================================
  const paragraphs = page.paragraphs || [
    '스픽스 취재팀의 심층 취재와 유튜브 방송 대담 팩트체크를 바탕으로 구성된 정통 시사 주간지 지면입니다.',
    '본 지면은 비개발자 발행인도 마우스 클릭만으로 출판할 수 있도록 AI 파이프라인(Gemini, ChatGPT, Claude)이 자동 연계되어 조판되었습니다.'
  ];

  return `
    <section class="mag-page" id="page-item-${idx}" data-page-index="${idx}">
      <div class="mag-running-header">
        <span class="running-section-tag">${page.sectionName || 'SPEAKS EDITORIAL'}</span>
        <span>p.${pStr} · ${issue.meta.issueNumber}</span>
      </div>

      <div class="mag-page-content">
        <h2 class="mag-title">${page.title}</h2>
        ${page.subtitle ? `<div class="mag-subtitle">${page.subtitle}</div>` : ''}

        <div style="position:relative;border-radius:4px;overflow:hidden;margin:4px 0 8px;background:#eee;">
          <img src="${photo}" alt="${page.title}" style="width:100%;aspect-ratio:16/9;object-fit:cover;" />
          <div style="font-size:calc(9.5px * var(--font-scale-factor, 1));color:#6b7280;margin-top:3px;display:flex;justify-content:space-between;align-items:center;">
            <span><strong style="color:#C8102E;">[포커스]</strong> ${visual.caption}</span>
            <span style="font-size:9px;color:#9ca3af;white-space:nowrap;margin-left:8px;">${visual.credit}</span>
          </div>
        </div>

        <div class="mag-columns-2">
          ${paragraphs.slice(0, 4).map((p) => `<p>${p}</p>`).join('')}
        </div>
      </div>
          ${paragraphs.slice(0, 4).map((p) => `<p>${p}</p>`).join('')}
        </div>
      </div>

      <div class="mag-running-footer">
        <span>${page.author || '스픽스 특별취재팀'}</span>
        <span class="mag-page-number">p.${pStr}</span>
      </div>
    </section>
  `;
}

function goToPage(index) {
  if (index < 0) index = 0;
  if (index >= totalPages) index = totalPages - 1;

  currentPageIndex = index;

  if (zoomLevel !== 1.0) {
    applyZoom(1.0);
  }

  const allPageEls = document.querySelectorAll('.mag-page');

  if (isSpreadMode) {
    let leftIdx, rightIdx;
    if (currentPageIndex === 0) {
      leftIdx = 0;
      rightIdx = -1;
    } else {
      leftIdx = currentPageIndex % 2 === 1 ? currentPageIndex : currentPageIndex - 1;
      rightIdx = leftIdx + 1 < totalPages ? leftIdx + 1 : -1;
    }

    allPageEls.forEach((el, idx) => {
      el.classList.remove('active', 'turned-prev', 'waiting-next', 'spread-left', 'spread-right');
      if (idx === leftIdx) {
        el.classList.add(rightIdx === -1 ? 'active' : 'spread-left');
      } else if (idx === rightIdx) {
        el.classList.add('spread-right');
      } else if (idx < leftIdx) {
        el.classList.add('turned-prev');
      } else {
        el.classList.add('waiting-next');
      }
    });
  } else {
    allPageEls.forEach((el, idx) => {
      el.classList.remove('active', 'turned-prev', 'waiting-next', 'spread-left', 'spread-right');
      if (idx === currentPageIndex) {
        el.classList.add('active');
      } else if (idx < currentPageIndex) {
        el.classList.add('turned-prev');
      } else {
        el.classList.add('waiting-next');
      }
    });
  }

  const pDisplay = document.getElementById('current-p-display');
  if (pDisplay) {
    pDisplay.textContent = String(currentPageIndex + 1).padStart(2, '0');
  }

  const slider = document.getElementById('page-slider');
  if (slider) {
    slider.value = currentPageIndex + 1;
  }

  const prevBtn = document.getElementById('bottom-prev-btn');
  const nextBtn = document.getElementById('bottom-next-btn');
  if (prevBtn) prevBtn.disabled = currentPageIndex === 0;
  if (nextBtn) nextBtn.disabled = currentPageIndex === totalPages - 1;

  const arrowPrev = document.getElementById('arrow-prev-btn');
  const arrowNext = document.getElementById('arrow-next-btn');
  if (arrowPrev) arrowPrev.style.opacity = currentPageIndex === 0 ? '0.3' : '1';
  if (arrowNext) arrowNext.style.opacity = currentPageIndex === totalPages - 1 ? '0.3' : '1';
}

function nextPage() {
  const step = isSpreadMode && currentPageIndex > 0 ? 2 : 1;
  if (currentPageIndex < totalPages - 1) {
    goToPage(currentPageIndex + step);
  }
}

function prevPage() {
  const step = isSpreadMode && currentPageIndex > 1 ? 2 : 1;
  if (currentPageIndex > 0) {
    goToPage(currentPageIndex - step);
  }
}

function toggleSpreadMode() {
  isSpreadMode = !isSpreadMode;
  document.body.classList.toggle('spread-mode', isSpreadMode);

  const btnText = document.getElementById('spread-btn-text');
  if (btnText) {
    btnText.textContent = isSpreadMode ? '단면 보기' : '양면 보기';
  }
  goToPage(currentPageIndex);
}

function checkOrientation() {
  const spreadBtn = document.getElementById('spread-mode-btn');
  if (spreadBtn) {
    spreadBtn.style.display = window.innerWidth >= 640 ? 'inline-flex' : 'none';
  }
}

function setupInteractions() {
  document.getElementById('font-inc-btn')?.addEventListener('click', () => {
    applyFontScale(fontScale + 0.1);
  });
  document.getElementById('font-dec-btn')?.addEventListener('click', () => {
    applyFontScale(fontScale - 0.1);
  });

  document.getElementById('zoom-inc-btn')?.addEventListener('click', () => {
    applyZoom(zoomLevel + 0.25);
  });
  document.getElementById('zoom-dec-btn')?.addEventListener('click', () => {
    applyZoom(zoomLevel - 0.25);
  });
  document.getElementById('zoom-reset-btn')?.addEventListener('click', () => {
    applyZoom(1.0);
  });

  document.getElementById('spread-mode-btn')?.addEventListener('click', toggleSpreadMode);

  document.getElementById('bottom-prev-btn')?.addEventListener('click', prevPage);
  document.getElementById('bottom-next-btn')?.addEventListener('click', nextPage);

  document.getElementById('arrow-prev-btn')?.addEventListener('click', prevPage);
  document.getElementById('arrow-next-btn')?.addEventListener('click', nextPage);

  document.getElementById('hotzone-prev')?.addEventListener('click', () => {
    if (zoomLevel === 1.0) prevPage();
  });
  document.getElementById('hotzone-next')?.addEventListener('click', () => {
    if (zoomLevel === 1.0) nextPage();
  });

  document.getElementById('page-slider')?.addEventListener('input', (e) => {
    goToPage(Number(e.target.value) - 1);
  });

  const stage = document.getElementById('viewport-stage');
  let touchStartX = 0;
  let touchStartY = 0;

  stage?.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        if (zoomLevel > 1.0) {
          isPanning = true;
          panStartX = touchStartX - currentPanX;
          panStartY = touchStartY - currentPanY;
        }
      }
    },
    { passive: true }
  );

  stage?.addEventListener(
    'touchmove',
    (e) => {
      if (isPanning && zoomLevel > 1.0 && e.touches.length === 1) {
        currentPanX = e.touches[0].clientX - panStartX;
        currentPanY = e.touches[0].clientY - panStartY;
        applyZoom(zoomLevel, currentPanX, currentPanY);
      }
    },
    { passive: true }
  );

  stage?.addEventListener(
    'touchend',
    (e) => {
      isPanning = false;

      const now = Date.now();
      if (now - lastTapTime < 320) {
        lastTapTime = 0;
        if (zoomLevel > 1.0) {
          applyZoom(1.0);
        } else {
          applyZoom(1.7);
        }
        return;
      }
      lastTapTime = now;

      if (zoomLevel === 1.0 && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          if (deltaX < 0) {
            nextPage();
          } else {
            prevPage();
          }
        }
      }
    },
    { passive: true }
  );

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevPage();
    } else if (e.key === '+' || e.key === '=') {
      applyZoom(zoomLevel + 0.2);
    } else if (e.key === '-' || e.key === '_') {
      applyZoom(zoomLevel - 0.2);
    } else if (e.key === '0') {
      applyZoom(1.0);
    }
  });

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);

  const tocModal = document.getElementById('toc-modal');
  document.getElementById('open-toc-btn')?.addEventListener('click', () => {
    tocModal?.classList.add('open');
    tocModal?.setAttribute('aria-hidden', 'false');
  });
  document.getElementById('close-toc-btn')?.addEventListener('click', () => {
    tocModal?.classList.remove('open');
    tocModal?.setAttribute('aria-hidden', 'true');
  });
  tocModal?.addEventListener('click', (e) => {
    if (e.target.id === 'toc-modal') {
      tocModal?.classList.remove('open');
      tocModal?.setAttribute('aria-hidden', 'true');
    }
  });

  document.getElementById('print-pdf-btn')?.addEventListener('click', () => {
    window.print();
  });
}

function renderTocList() {
  const container = document.getElementById('toc-list-container');
  if (!container || !issueData || !issueData.pages) return;

  const keySections = [
    { title: 'Cover (표지)', page: 1, desc: '금주의 헤드라인 & 특별기획' },
    { title: 'TOC & Intro (목차 및 판권)', page: 2, desc: '발행인의 말 & 도서출판 아우내 판권' },
    { title: 'Part 1. 스픽스 레이다 (Top 5)', page: 5, desc: '결정적 발언록 말말말 & 여론조사 차트(p.08)' },
    { title: 'Part 2. 커버스토리 & 이슈기획', page: 11, desc: '30조 민생추경 vs 재정준칙 · 정책 비교표(p.13)' },
    { title: 'Part 3. Who Speaks 지상중계', page: 21, desc: '박지원·김종대·최강욱·이언주 대담 (타임스탬프 QR)' },
    { title: 'Part 4. 오피니언 & 월드', page: 33, desc: '성한용 칼럼 & 선재규 글로벌 정세도(p.39)' },
    { title: 'Part 5. 컬처·라이프 & 지방시대', page: 41, desc: '천안 아우내 역사기행 & 신간 서평(p.48)' },
    { title: 'Back Cover (판권지 및 바코드)', page: 50, desc: '정기간행물 ISSN/ISBN 공식 바코드' }
  ];

  container.innerHTML = keySections
    .map(
      (sec) => `
    <button type="button" class="toc-item-btn" data-target-page="${sec.page}">
      <div>
        <strong style="color:#FFFFFF;display:block;">${sec.title}</strong>
        <span style="font-size:11px;color:#9CA3AF;">${sec.desc}</span>
      </div>
      <span class="toc-item-page">p.${String(sec.page).padStart(2, '0')} &gt;</span>
    </button>
  `
    )
    .join('');

  container.querySelectorAll('[data-target-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetP = Number(btn.getAttribute('data-target-page'));
      goToPage(targetP - 1);
      document.getElementById('toc-modal')?.classList.remove('open');
      document.getElementById('toc-modal')?.setAttribute('aria-hidden', 'true');
    });
  });
}

// 초기화
initMagazineViewer();
