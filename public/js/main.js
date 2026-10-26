/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』
 * Modern Korean Newsweekly Layout (주간경향 스타일)
 * Main Controller (public/js/main.js)
 */

import { generateQrSvg, getEditorialPhoto } from './qr-generator.js';

let currentIssue = null;
let currentFontSize = 17;

async function loadIssueData() {
  try {
    const res = await fetch('/api/issue');
    currentIssue = await res.json();
    renderMainMagazine();
  } catch (err) {
    console.error('기사 데이터를 불러오는 중 오류 발생:', err);
  }
}

function renderMainMagazine() {
  if (!currentIssue) return;
  const { meta, youtubeTopClips, articles } = currentIssue;

  // 헤더 날짜 업데이트
  const dateEl = document.getElementById('header-today-date');
  if (dateEl && meta.publishDate) {
    dateEl.textContent = `${meta.publishDate} 월요일`;
  }

  // 1. 최상단 Hero Main 기사 (커버스토리)
  const coverStoryIdx = articles.findIndex((a) => a.sectionId === 'part-2');
  const heroIdx = coverStoryIdx >= 0 ? coverStoryIdx : 0;
  const heroArticle = articles[heroIdx];
  const heroPhoto = getEditorialPhoto(heroArticle.sectionId, 0);

  const heroContainer = document.getElementById('hero-main-container');
  if (heroContainer && heroArticle) {
    heroContainer.innerHTML = `
      <div class="hero-visual" data-open-idx="${heroIdx}">
        <img src="${heroPhoto}" alt="${heroArticle.title}" loading="eager" />
        <span class="hero-visual-badge">커버스토리</span>
      </div>
      <div class="hero-content">
        <div class="hero-kicker">COVER STORY · ${heroArticle.sectionTitle}</div>
        <h1 class="hero-headline" data-open-idx="${heroIdx}">
          ${heroArticle.title}
        </h1>
        <p class="hero-lead">${heroArticle.lead || heroArticle.subtitle || ''}</p>
        <div class="hero-byline">
          <span>${heroArticle.author || '스픽스 특별취재팀'}</span>
          <span>·</span>
          <span>${meta.publishDate || '2026. 10. 26'}</span>
          <span>·</span>
          <span>${heroArticle.pageRange || 'p.11 ~ p.20'}</span>
        </div>
      </div>
    `;
  }

  // 2. 서브 4단 카드 그리드 (Hero 바로 밑 4열)
  // 레이다 기사 또는 주요 유튜브 대담 4개
  const quadContainer = document.getElementById('sub-quad-container');
  if (quadContainer) {
    const quadArticles = articles.filter((a, idx) => idx !== heroIdx).slice(0, 4);
    quadContainer.innerHTML = quadArticles
      .map((art, i) => {
        const globalIdx = articles.indexOf(art);
        const photo = getEditorialPhoto(art.sectionId, i + 1);
        return `
          <article class="quad-card" data-open-idx="${globalIdx}">
            <div class="quad-thumb">
              <img src="${photo}" alt="${art.title}" loading="lazy" />
            </div>
            <div class="quad-tag">${art.sectionTitle}</div>
            <h3 class="quad-title">${art.title}</h3>
          </article>
        `;
      })
      .join('');
  }

  // 3. 중단 섹션: 좌측 가로형 뉴스 3개
  const horizContainer = document.getElementById('horizontal-news-container');
  if (horizContainer) {
    // Who Speaks, 기획 기사 등 3개
    const horizArticles = articles
      .filter((a) => a.sectionId === 'part-3' || a.sectionId === 'part-1')
      .slice(0, 3);

    horizContainer.innerHTML = horizArticles
      .map((art, i) => {
        const globalIdx = articles.indexOf(art);
        const photo = getEditorialPhoto(art.sectionId, i + 2);
        return `
          <article class="news-row-card" data-open-idx="${globalIdx}">
            <div class="news-row-thumb">
              <img src="${photo}" alt="${art.title}" loading="lazy" />
            </div>
            <div>
              <div class="news-row-tag">${art.sectionTitle}</div>
              <h3 class="news-row-title">${art.title}</h3>
              <p class="news-row-desc">${art.lead || art.subtitle || ''}</p>
            </div>
          </article>
        `;
      })
      .join('');
  }

  // 4. 중단 섹션: 우측 세로형 오피니언 & 주요 뉴스 리스트
  const textContainer = document.getElementById('text-news-container');
  if (textContainer) {
    const textArticles = articles
      .filter((a) => a.sectionId === 'part-4' || a.sectionId === 'part-5')
      .slice(0, 5);

    textContainer.innerHTML = textArticles
      .map((art) => {
        const globalIdx = articles.indexOf(art);
        return `
          <div class="text-news-item" data-open-idx="${globalIdx}">
            <div class="text-news-category">${art.sectionTitle}</div>
            <h4 class="text-news-title">${art.title}</h4>
            <div class="text-news-author">${art.author || '스픽스 논설위원실'}</div>
          </div>
        `;
      })
      .join('');
  }

  // 5. 하단 잡지 호수 박스 (주간경향 1700호 박스 스타일)
  const issueBox = document.getElementById('issue-showcase-container');
  if (issueBox && heroArticle) {
    const leftLinks = articles.slice(1, 4);
    const rightLinks = articles.slice(4, 7);

    issueBox.innerHTML = `
      <div class="issue-showcase-header">
        <div class="issue-number-badge">${meta.issueNumber} (${meta.publishDate})</div>
        <div class="issue-actions">
          <a href="/magazine" class="btn-pill btn-pill-red">50p e-Book 보기</a>
          <a href="/magazine?print=1" class="btn-pill btn-pill-primary">PDF 다운로드</a>
          <a href="/magazine" class="btn-pill">호수별 보기</a>
        </div>
      </div>
      <div class="issue-showcase-body">
        <div class="issue-cover-col">
          <img
            src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80"
            alt="${meta.issueNumber} 표지"
            class="magazine-cover-img"
          />
          <div class="issue-cover-caption">50페이지 정규 인쇄판 A4 규격</div>
        </div>
        <div class="issue-articles-col">
          <div class="cover-story-feature" data-open-idx="${heroIdx}">
            <div class="cover-story-tag">[표지 이야기] ${heroArticle.sectionTitle}</div>
            <h3 class="cover-story-headline">${heroArticle.title}</h3>
            <p class="cover-story-excerpt">${heroArticle.lead || heroArticle.subtitle || ''}</p>
          </div>
          <div class="issue-sub-columns">
            <div>
              <div class="column-block-title">스픽스 레이다 &amp; 지상중계</div>
              <ul class="column-link-list">
                ${leftLinks
                  .map((art) => {
                    const idx = articles.indexOf(art);
                    return `<li class="column-link-item" data-open-idx="${idx}">· ${art.title}</li>`;
                  })
                  .join('')}
              </ul>
            </div>
            <div>
              <div class="column-block-title">오피니언 &amp; 컬처·지방시대</div>
              <ul class="column-link-list">
                ${rightLinks
                  .map((art) => {
                    const idx = articles.indexOf(art);
                    return `<li class="column-link-item" data-open-idx="${idx}">· ${art.title}</li>`;
                  })
                  .join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 기사 클릭 이벤트 바인딩
  attachArticleClickEvents();
}

function attachArticleClickEvents() {
  document.querySelectorAll('[data-open-idx]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = Number(el.getAttribute('data-open-idx'));
      openArticleModal(idx);
    });
  });
}

function openArticleModal(articleIndex) {
  if (!currentIssue || !currentIssue.articles[articleIndex]) return;
  const article = currentIssue.articles[articleIndex];
  const { meta, youtubeTopClips } = currentIssue;

  const modal = document.getElementById('reader-modal');
  const kickerEl = document.getElementById('reader-modal-kicker');
  const contentEl = document.getElementById('reader-modal-content');

  if (kickerEl) {
    kickerEl.textContent = `${article.sectionTitle} (${article.pageRange || ''})`;
  }

  // 유튜브 영상 연계 정보 및 QR
  const clip = youtubeTopClips?.[articleIndex % (youtubeTopClips.length || 1)];
  const qrSvg = clip ? generateQrSvg(clip.videoUrl || 'https://www.youtube.com/@SPEAKS_TV', 120) : '';

  if (contentEl) {
    contentEl.style.fontSize = `${currentFontSize}px`;
    contentEl.innerHTML = `
      <div class="reader-kicker">${article.sectionTitle}</div>
      <h1 class="reader-title">${article.title}</h1>
      ${article.subtitle ? `<div class="reader-subtitle">${article.subtitle}</div>` : ''}
      <div class="reader-author-bar">
        <span><strong>${article.author || '스픽스 특별취재팀'}</strong> · ${meta.publishDate || '2026. 10. 26'}</span>
        <span>지면: <strong>${article.pageRange || 'p.01 ~ p.50'}</strong></span>
      </div>

      ${
        clip
          ? `
        <div class="reader-broadcast-box">
          <div class="reader-broadcast-quote">“${clip.keyQuote}”</div>
          <div class="reader-broadcast-info">
            📺 스픽스 방송: <strong>${clip.program}</strong> (${clip.speaker} 출연 · ${clip.timestamp})
          </div>
        </div>
      `
          : ''
      }

      <div class="reader-body-text">
        ${article.lead ? `<p class="reader-text-paragraph" style="font-weight:600;color:var(--ink-title);">${article.lead}</p>` : ''}
        ${
          article.bodyParagraphs && article.bodyParagraphs.length > 0
            ? article.bodyParagraphs
                .map((p) => `<p class="reader-text-paragraph">${p}</p>`)
                .join('')
            : '<p class="reader-text-paragraph">본문 내용이 준비 중입니다.</p>'
        }
      </div>

      ${
        clip
          ? `
        <div style="display:flex;align-items:center;gap:20px;padding:20px;background:var(--bg-subtle);border-radius:6px;margin-top:32px;">
          <div>${qrSvg}</div>
          <div style="font-size:13px;line-height:1.6;color:var(--ink-body);">
            <strong style="color:var(--point-red);display:block;margin-bottom:4px;">스마트폰으로 스캔 시 해당 방송 구간으로 바로 이동합니다</strong>
            스픽스 유튜브 방송 타임스탬프: <strong>${clip.timestamp}</strong> (${clip.heatmapPeak})<br/>
            <a href="${clip.videoUrl}" target="_blank" rel="noopener" style="color:var(--point-blue);text-decoration:underline;">영상 바로 보기 &gt;</a>
          </div>
        </div>
      `
          : ''
      }
    `;
  }

  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('reader-modal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// 모달 컨트롤 이벤트
document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
document.getElementById('reader-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'reader-modal') {
    closeModal();
  }
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// 폰트 크기 조절
document.getElementById('modal-font-inc')?.addEventListener('click', () => {
  if (currentFontSize < 24) {
    currentFontSize += 1.5;
    const content = document.getElementById('reader-modal-content');
    if (content) content.style.fontSize = `${currentFontSize}px`;
  }
});
document.getElementById('modal-font-dec')?.addEventListener('click', () => {
  if (currentFontSize > 13) {
    currentFontSize -= 1.5;
    const content = document.getElementById('reader-modal-content');
    if (content) content.style.fontSize = `${currentFontSize}px`;
  }
});

// 플로팅 탑 버튼
document.getElementById('top-scroll-btn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 카테고리 필터 클릭 이벤트
document.querySelectorAll('.nav-link[data-filter]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');

    const filter = link.getAttribute('data-filter');
    if (!currentIssue) return;

    if (filter === 'all') {
      renderMainMagazine();
      return;
    }

    const filtered = currentIssue.articles.filter((a) => a.sectionId === filter);
    if (filtered.length > 0) {
      const idx = currentIssue.articles.indexOf(filtered[0]);
      openArticleModal(idx);
    }
  });
});

// 주중 실시간 스픽스 라이브 & 최신 핫클립 피드 로드
async function loadLiveFeed() {
  try {
    const res = await fetch('/api/live-feed');
    const feed = await res.json();
    renderLiveFeed(feed);
  } catch (err) {
    console.error('실시간 라이브 피드 로드 오류:', err);
  }
}

function renderLiveFeed(feed) {
  if (!feed || !feed.items) return;

  const timeEl = document.getElementById('live-feed-updated-at');
  if (timeEl && feed.updatedAt) {
    timeEl.textContent = `실시간 동기화: ${feed.updatedAt}`;
  }

  const container = document.getElementById('daily-live-cards-container');
  if (!container) return;

  container.innerHTML = feed.items
    .map((item) => {
      return `
        <article class="live-card" onclick="window.open('${item.videoUrl}', '_blank')">
          <div class="live-card-thumb-wrap">
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
            <span class="live-time-tag ${item.isLive ? 'is-live' : ''}">${item.timeAgo}</span>
          </div>
          <div class="live-card-body">
            <div class="live-card-program">${item.program}</div>
            <h4 class="live-card-title">${item.title}</h4>
            <div class="live-card-speaker">출연: ${item.speaker}</div>
            <p class="live-card-summary">${item.summary}</p>
            <div class="live-card-footer">
              <span>${item.views}</span>
              <span style="color:var(--point-red);font-weight:700;">영상 시청 &gt;</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

// 초기화
loadIssueData();
loadLiveFeed();
