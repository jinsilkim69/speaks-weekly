/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』
 * Modern Korean Newsweekly Layout (주간경향 스타일)
 * Main Controller (public/js/main.js)
 */

import { generateQrSvg, getEditorialPhoto, getEditorialVisual, getArticleVisual } from './qr-generator.js';

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
  const heroVisual = getArticleVisual(heroIdx);

  const heroContainer = document.getElementById('hero-main-container');
  if (heroContainer && heroArticle) {
    const heroVideoUrl = heroArticle.videoUrl || heroVisual.videoUrl || 'https://www.youtube.com/@SPEAKS_TV';
    heroContainer.innerHTML = `
      <div class="hero-visual" onclick="window.open('${heroVideoUrl}', '_blank')" style="cursor:pointer;" title="클릭 시 유튜브 원본 방송 시청">
        <img src="${heroVisual.url}" alt="${heroVisual.topic}" loading="eager" />
        <span class="hero-visual-badge">커버스토리</span>
        <div class="yt-play-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          <span>유튜브 원본 방송 시청 ↗</span>
        </div>
        <div style="font-size:11.5px;color:#6b7280;margin-top:6px;line-height:1.4;">
          <strong>[포커스]</strong> ${heroVisual.caption}
        </div>
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
        <div class="hero-actions-bar" style="margin-top:16px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <button class="btn-pill btn-pill-red" data-open-idx="${heroIdx}">50p 심층 기사 읽기</button>
          <a href="${heroVideoUrl}" target="_blank" rel="noopener noreferrer" class="btn-pill" style="background:#cc0000; color:#ffffff; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            유튜브 원본 방송 시청 ↗
          </a>
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
      .map((art) => {
        const globalIdx = articles.indexOf(art);
        const visual = getArticleVisual(globalIdx);
        const videoUrl = art.videoUrl || visual.videoUrl || 'https://www.youtube.com/@SPEAKS_TV';
        return `
          <article class="quad-card">
            <div class="quad-thumb" onclick="window.open('${videoUrl}', '_blank')" title="클릭 시 유튜브 원본 영상 시청">
              <img src="${visual.url}" alt="${visual.topic}" loading="lazy" />
              <div class="yt-play-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                <span>원본 영상</span>
              </div>
            </div>
            <div class="quad-tag">${art.sectionTitle}</div>
            <h3 class="quad-title" data-open-idx="${globalIdx}">${art.title}</h3>
            <div class="card-action-bar" style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
              <button class="btn-card-read" data-open-idx="${globalIdx}">심층 기사</button>
              <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="link-card-yt">▶ 영상 보기 ↗</a>
            </div>
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
      .map((art) => {
        const globalIdx = articles.indexOf(art);
        const visual = getArticleVisual(globalIdx);
        const videoUrl = art.videoUrl || visual.videoUrl || 'https://www.youtube.com/@SPEAKS_TV';
        return `
          <article class="news-row-card">
            <div class="news-row-thumb" onclick="window.open('${videoUrl}', '_blank')" title="클릭 시 유튜브 원본 영상 시청">
              <img src="${visual.url}" alt="${visual.topic}" loading="lazy" />
              <div class="yt-play-badge yt-play-badge-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              </div>
            </div>
            <div>
              <div class="news-row-tag">${art.sectionTitle}</div>
              <h3 class="news-row-title" data-open-idx="${globalIdx}">${art.title}</h3>
              <p class="news-row-desc" data-open-idx="${globalIdx}">${art.lead || art.subtitle || ''}</p>
              <div class="card-action-bar" style="margin-top:6px; display:flex; gap:12px; align-items:center;">
                <button class="btn-card-read btn-card-read-sm" data-open-idx="${globalIdx}">심층 기사 읽기</button>
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="link-card-yt">▶ 원본 방송 ↗</a>
              </div>
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
    const heroVisual = getArticleVisual(heroIdx);
    const leftLinks = articles.slice(1, 4)
      .map(
        (a) =>
          `<li><a href="javascript:void(0)" data-open-idx="${articles.indexOf(a)}"><strong>[${a.sectionTitle.split('·')[0]}]</strong> ${a.title}</a></li>`
      )
      .join('');
    const rightLinks = articles.slice(4, 7)
      .map(
        (a) =>
          `<li><a href="javascript:void(0)" data-open-idx="${articles.indexOf(a)}"><strong>[${a.sectionTitle.split('·')[0]}]</strong> ${a.title}</a></li>`
      )
      .join('');

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
            src="${heroVisual.url}"
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

  // 기사와 1:1 정확히 일치하는 유튜브 방송 클립 매핑 (엉뚱한 외교 발언 매칭 원천 차단!)
  let clip = null;
  if (articleIndex === 1) clip = youtubeTopClips?.[0]; // 스픽스 레이다 핫클립 (박지원x김종대)
  else if (articleIndex === 6) clip = youtubeTopClips?.[0]; // Who Speaks 1 (박지원x김종대)
  else if (articleIndex === 7) clip = youtubeTopClips?.[1]; // Who Speaks 2 (최강욱x이언주)
  else if (articleIndex === 8) clip = youtubeTopClips?.[2]; // Who Speaks 3 (선재규x김준형)
  else if (article.videoTimestamp && article.sourceType?.includes('YouTube')) {
    clip = youtubeTopClips?.find((c) => c.timestamp === article.videoTimestamp) || null;
  }

  const qrSvg = clip ? generateQrSvg(clip.videoUrl || 'https://www.youtube.com/@SPEAKS_TV', 120) : '';
  const visual = article.visual || getArticleVisual(articleIndex);

  if (contentEl) {
    contentEl.style.fontSize = `${currentFontSize}px`;
    contentEl.innerHTML = `
      <div class="reader-kicker">${article.kicker || article.sectionTitle}</div>
      <h1 class="reader-title">${article.title}</h1>
      ${article.subtitle ? `<div class="reader-subtitle">${article.subtitle}</div>` : ''}
      <div class="reader-author-bar">
        <span><strong>${article.author || '스픽스 특별취재팀'}</strong> · ${meta.publishDate || '2026. 10. 26'}</span>
        <span>지면: <strong>${article.pageRange || 'p.01 ~ p.50'}</strong></span>
      </div>

      <!-- 유튜브 공식 채널 원본 영상 바로보기 바 -->
      <div class="reader-yt-hero-bar" style="margin:16px 0 20px; padding:12px 16px; background:#18181b; border-radius:8px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="background:#cc0000; color:#fff; font-size:11px; font-weight:800; padding:3px 8px; border-radius:4px;">● YOUTUBE 방송</span>
          <span style="color:#f4f4f5; font-size:13.5px; font-weight:700;">${visual.topic || article.title}</span>
        </div>
        <div style="display:flex; gap:8px;">
          ${visual.videoId ? `<button class="btn-embed-player" onclick="window.toggleModalVideoPlayer('${visual.videoId}')" style="background:#27272a; color:#fff; border:1px solid #3f3f46; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">📺 본문 영상 재생</button>` : ''}
          <a href="${visual.videoUrl || 'https://www.youtube.com/@SPEAKS_TV'}" target="_blank" rel="noopener noreferrer" style="background:#cc0000; color:#fff; text-decoration:none; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            유튜브 원본 영상 시청 ↗
          </a>
        </div>
      </div>
      <div id="modal-video-embed-box" style="display:none; margin:16px 0 24px; border-radius:8px; overflow:hidden; aspect-ratio:16/9; background:#000;"></div>

      <!-- 기사 내용과 1:1 매칭되는 정통 보도 비주얼 및 캡션 -->
      <div class="reader-lead-visual" style="margin:20px 0 24px;border-radius:8px;overflow:hidden;background:#000;box-shadow:0 4px 14px rgba(0,0,0,0.08);">
        <img src="${visual.url}" alt="${visual.topic}" style="width:100%;max-height:420px;object-fit:cover;display:block;" />
        <div style="padding:10px 14px;background:#f8f9fa;border-top:1px solid #e9ecef;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;font-size:12.5px;color:#495057;">
          <span><strong style="color:#C8102E;">[포커스]</strong> ${visual.caption}</span>
          <span style="font-size:11px;color:#868e96;margin-left:8px;">출처: ${visual.credit}</span>
        </div>
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
        ${article.lead ? `<div class="reader-text-lead" style="font-weight:700;color:#1A202C;font-size:1.06em;line-height:1.8;background:#F8FAFC;padding:16px 20px;border-left:4px solid #C8102E;border-radius:0 6px 6px 0;margin-bottom:24px;">${article.lead}</div>` : ''}
        ${
          article.bodyParagraphs && article.bodyParagraphs.length > 0
            ? article.bodyParagraphs
                .map((p) => {
                  if (p.startsWith('## ')) {
                    const lines = p.split('\n');
                    const heading = lines[0].replace('## ', '');
                    const content = lines.slice(1).join('<br/><br/>');
                    return `
                      <div class="reader-subchapter" style="margin:28px 0 16px;">
                        <h3 style="font-size:18px;font-weight:900;color:#0F1E36;margin-bottom:12px;border-left:4px solid #2563EB;padding-left:12px;letter-spacing:-0.5px;">${heading}</h3>
                        ${content ? `<p class="reader-text-paragraph" style="line-height:1.9;margin-bottom:16px;color:#334155;font-size:1.02em;">${content}</p>` : ''}
                      </div>
                    `;
                  }
                  return `<p class="reader-text-paragraph" style="line-height:1.9;margin-bottom:16px;color:#334155;font-size:1.02em;">${p}</p>`;
                })
                .join('')
            : '<p class="reader-text-paragraph">본문 내용이 준비 중입니다.</p>'
        }
      </div>

      ${
        article.qaList && article.qaList.length > 0
          ? `
        <div class="reader-qa-section" style="margin-top:28px;border-top:2px solid #E5E7EB;padding-top:24px;">
          <h3 style="font-size:16px;font-weight:800;color:#0F1E36;margin-bottom:16px;">
            [지상 중계] 정통 시사주간지 문어체 일문일답 (Q&amp;A) 전문
          </h3>
          ${article.qaList
            .map(
              (item) => `
            <div style="margin-bottom:20px;background:#f8fafc;border-left:4px solid #0F1E36;padding:14px 18px;border-radius:0 6px 6px 0;">
              <div style="font-weight:800;color:#0F1E36;margin-bottom:8px;font-size:1.03em;line-height:1.45;">■ ${item.q}</div>
              <div style="color:#334155;line-height:1.75;font-size:0.98em;">${item.a}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      ${
        article.books && article.books.length > 0
          ? `
        <div class="reader-books-section" style="margin-top:32px;border-top:2px solid #E5E7EB;padding-top:24px;">
          <h3 style="font-size:16px;font-weight:800;color:#0F1E36;margin-bottom:14px;border-bottom:2px solid #C8102E;padding-bottom:6px;">
            도서출판 아우내 신간 인문·시사 총서 3종
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:14px;">
            ${article.books
              .map(
                (b) => `
              <div style="border:1px solid #e5e7eb;padding:14px;border-radius:6px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:800;color:#C8102E;font-size:14px;margin-bottom:4px;">${b.title}</div>
                <div style="font-size:11.5px;color:#6b7280;margin-bottom:8px;">${b.author}</div>
                <p style="font-size:12.5px;color:#374151;line-height:1.55;margin:0;">${b.desc}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      ${
        article.readerFeedback && article.readerFeedback.length > 0
          ? `
        <div class="reader-feedback-section" style="margin-top:28px;background:#f8fafc;padding:16px 20px;border-radius:6px;border:1px solid #e2e8f0;">
          <h4 style="font-size:14px;font-weight:800;color:#0F1E36;margin-bottom:10px;">153만 시청자 독자 리뷰 라운지</h4>
          ${article.readerFeedback
            .map(
              (fb) => `
            <div style="font-size:12.5px;color:#334155;margin-bottom:8px;line-height:1.5;">
              <strong>${fb.name}</strong>: “${fb.comment}”
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      ${
        clip
          ? `
        <div style="display:flex;align-items:center;gap:20px;padding:20px;background:var(--bg-subtle);border-radius:6px;margin-top:32px;border:1px solid #e2e8f0;">
          <div>${qrSvg}</div>
          <div style="font-size:13px;line-height:1.6;color:var(--ink-body);">
            <strong style="color:var(--point-red);display:block;margin-bottom:4px;">스마트폰으로 스캔 시 해당 방송 구간으로 바로 이동합니다</strong>
            스픽스 유튜브 방송 타임스탬프: <strong>${clip.timestamp}</strong> (${clip.heatmapPeak})<br/>
            <a href="${clip.videoUrl}" target="_blank" rel="noopener" style="color:var(--point-blue);text-decoration:underline;font-weight:700;">영상 바로 보기 &gt;</a>
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
      const vidId = item.videoId || 'v6awNopN5n4';
      const vUrl = item.videoUrl || 'https://www.youtube.com/@SPEAKS_TV';
      const safeTitle = (item.title || '').replace(/'/g, "\\'");
      return `
        <article class="live-card">
          <div class="live-card-thumb-wrap" onclick="window.openLivePlayerModal('${vidId}', '${safeTitle}', '${vUrl}')" style="cursor:pointer;" title="클릭 시 실시간 방송 영상 재생">
            <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
            <div class="live-play-btn-overlay">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
            <span class="live-time-tag ${item.isLive ? 'is-live' : ''}">${item.timeAgo}</span>
          </div>
          <div class="live-card-body">
            <div class="live-card-program">${item.program}</div>
            <h4 class="live-card-title" onclick="window.openLivePlayerModal('${vidId}', '${safeTitle}', '${vUrl}')" style="cursor:pointer;">${item.title}</h4>
            <div class="live-card-speaker">출연: ${item.speaker}</div>
            <p class="live-card-summary">${item.summary}</p>
            <div class="live-card-footer">
              <span>${item.views}</span>
              <a href="${vUrl}" target="_blank" rel="noopener noreferrer" class="live-card-yt-link" style="color:var(--point-red); font-weight:700; text-decoration:none;">
                유튜브 시청 ↗
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

window.toggleModalVideoPlayer = function(videoId) {
  const box = document.getElementById('modal-video-embed-box');
  if (!box) return;
  if (box.style.display === 'none' || !box.innerHTML) {
    box.style.display = 'block';
    box.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" style="width:100%;height:100%;border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    box.style.display = 'none';
    box.innerHTML = '';
  }
};

window.openLivePlayerModal = function(videoId = 'v6awNopN5n4', title = '스픽스 실시간 생방송 ON-AIR', videoUrl = 'https://www.youtube.com/@SPEAKS_TV/live') {
  let liveModal = document.getElementById('live-player-modal');
  if (!liveModal) {
    liveModal = document.createElement('div');
    liveModal.id = 'live-player-modal';
    liveModal.className = 'live-player-modal-backdrop';
    document.body.appendChild(liveModal);
  }

  const embedSrc = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : `https://www.youtube.com/embed/live_stream?channel=UCgeOlLcX6PReHdWImEnUVTg&autoplay=1`;

  liveModal.innerHTML = `
    <div class="live-player-modal-window">
      <div class="live-player-modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="background:#cc0000; color:#fff; font-size:11px; font-weight:900; padding:3px 8px; border-radius:4px; display:inline-flex; align-items:center; gap:4px;">
            <span style="width:7px; height:7px; border-radius:50%; background:#fff; display:inline-block; animation:pulse 1.5s infinite;"></span>
            LIVE ON-AIR
          </span>
          <h3 style="margin:0; font-size:16px; color:#111827; font-weight:700;">${title}</h3>
        </div>
        <button onclick="window.closeLivePlayerModal()" style="border:none; background:transparent; font-size:24px; cursor:pointer; color:#6b7280; line-height:1;">&times;</button>
      </div>
      <div style="width:100%; aspect-ratio:16/9; background:#000;">
        <iframe
          src="${embedSrc}"
          title="${title}"
          style="width:100%; height:100%; border:none;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>
      <div style="padding:14px 18px; background:#f9fafb; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="font-size:13px; color:#4b5563;">구독자 153만 명 · 스픽스(@SPEAKS_TV) 공식 방송</span>
        <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="background:#cc0000; color:#fff; text-decoration:none; padding:8px 16px; border-radius:6px; font-size:13px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          유튜브 앱/새 창에서 시청하기 ↗
        </a>
      </div>
    </div>
  `;
  liveModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeLivePlayerModal = function() {
  const liveModal = document.getElementById('live-player-modal');
  if (liveModal) {
    liveModal.innerHTML = '';
    liveModal.style.display = 'none';
  }
  document.body.style.overflow = '';
};

// 상단 GNB '실시간 라이브 & 속보' 클릭 시 즉시 라이브 모달 플레이어 오픈
const navLiveLinks = document.querySelectorAll('a[href="#live-radar-anchor"]');
navLiveLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.openLivePlayerModal('v6awNopN5n4', '스픽스 실시간 생방송 ON-AIR', 'https://www.youtube.com/@SPEAKS_TV/live');
    const anchor = document.getElementById('live-radar-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
  });
});

// 초기화
loadIssueData();
loadLiveFeed();
