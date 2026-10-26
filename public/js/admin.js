/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 편집국 관리자 대시보드 제어 스크립트 (public/js/admin.js)
 * - Swiss Grid & Modern Editorial Style
 * - 이모지 100% 제거 및 Lucide 선형 SVG 아이콘 적용
 */

import { generateQrSvg, generateBarcodeSvg, LucideIcons } from './qr-generator.js';

let adminIssueData = null;

async function initAdminDashboard() {
  const res = await fetch('/api/issue');
  adminIssueData = await res.json();
  renderAdminView();
  loadPipelineArtifacts();
}

async function loadPipelineArtifacts() {
  try {
    const res = await fetch('/api/artifacts');
    const data = await res.json();
    const dossierPre = document.getElementById('dossier-pre');
    const blueprintPre = document.getElementById('blueprint-pre');
    if (dossierPre) dossierPre.textContent = data.dossier || '';
    if (blueprintPre) blueprintPre.textContent = JSON.stringify(data.blueprint || {}, null, 2);
  } catch {}
}

function renderAdminView() {
  if (!adminIssueData) return;
  const { meta, articles, youtubeTopClips } = adminIssueData;

  const issueNumInput = document.getElementById('edit-issue-number');
  const pubDateInput = document.getElementById('edit-publish-date');
  if (issueNumInput) issueNumInput.value = meta.issueNumber;
  if (pubDateInput) pubDateInput.value = meta.publishDate;

  const barcodeBox = document.getElementById('admin-barcode-preview');
  if (barcodeBox) {
    barcodeBox.innerHTML = generateBarcodeSvg(meta.publisher.issn, meta.publisher.isbn, 240, 66);
  }

  // Render 14 Articles Editor (Swiss Grid Style)
  const editorList = document.getElementById('admin-articles-editor-list');
  if (editorList) {
    editorList.innerHTML = articles
      .map(
        (art, idx) => `
        <div style="border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);padding:1.35rem 0;margin-bottom:1rem;background-color:var(--bg-card);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <span class="rubric-kicker" style="margin:0;">꼭지 NO. ${String(art.articleNo).padStart(2, '0')} · ${art.sectionTitle} (${art.pageRange})</span>
              <strong style="font-size:0.8rem;color:var(--ink-muted);margin-left:0.6rem;">담당: ${art.author}</strong>
            </div>
            <a href="/magazine?p=${art.startPage}" target="_blank" class="btn btn-outline" style="padding:0.32rem 0.75rem;font-size:0.76rem;">
              <span>지면 p.${String(art.startPage).padStart(2, '0')} 미리보기</span>
              ${LucideIcons.arrowUpRight}
            </a>
          </div>
          <div style="display:grid;grid-template-columns:1fr 230px;gap:1.25rem;align-items:start;">
            <div>
              <div class="form-group">
                <label>기사 헤드라인 제목</label>
                <input type="text" data-art-idx="${idx}" data-field="title" value="${escapeAttr(art.title)}" />
              </div>
              <div class="form-group">
                <label>부제 (Subtitle)</label>
                <input type="text" data-art-idx="${idx}" data-field="subtitle" value="${escapeAttr(art.subtitle)}" />
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label>리드문 요약 (Lead)</label>
                <textarea rows="2" data-art-idx="${idx}" data-field="lead">${escapeAttr(art.lead)}</textarea>
              </div>
            </div>
            <div style="background-color:var(--bg-subtle);border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);padding:0.85rem;text-align:center;">
              <div style="display:flex;justify-content:center;margin-bottom:0.5rem;">
                ${generateQrSvg(art.sourceUrl || 'https://www.youtube.com/@SPEAKS_TV', 64)}
              </div>
              <div class="form-group" style="margin-bottom:0.4rem;text-align:left;">
                <label style="font-size:0.72rem;">타임스탬프 연결 URL</label>
                <input type="text" style="font-size:0.75rem;padding:0.4rem;" data-art-idx="${idx}" data-field="sourceUrl" value="${escapeAttr(art.sourceUrl || '')}" />
              </div>
              <div style="font-size:0.72rem;color:var(--crimson);font-weight:700;">
                ${art.videoTimestamp ? `발언 시각: ${art.videoTimestamp}` : '원문 기사 QR'}
              </div>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  // Render Clips List
  const clipsList = document.getElementById('admin-clips-list');
  if (clipsList) {
    clipsList.innerHTML = youtubeTopClips
      .map(
        (c) => `
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);padding:1.25rem 0;margin-bottom:0.85rem;gap:1.5rem;">
          <div>
            <span style="font-family:var(--font-serif-en);color:var(--crimson);font-size:0.8rem;font-weight:800;">RANK 0${c.rank} · ${c.program}</span>
            <span style="font-size:0.76rem;color:var(--ink-muted);margin-left:0.5rem;">발언 시각 ${c.timestamp} (${c.timestampSec}s)</span>
            <h4 style="margin:0.35rem 0;color:var(--ink-primary);font-family:var(--font-serif-kr);font-size:1.1rem;font-weight:700;">${c.title}</h4>
            <p style="margin:0;font-size:0.85rem;color:var(--ink-deck);">${c.keyQuote}</p>
            <div style="font-size:0.76rem;color:var(--ink-muted);margin-top:0.35rem;">
              출연: ${c.speaker} | 조회수: ${c.views} | 집중 구간: ${c.heatmapPeak}
            </div>
          </div>
          <a href="${c.videoUrl}" target="_blank" rel="noopener" style="text-align:center;flex-shrink:0;">
            ${generateQrSvg(c.videoUrl, 68)}
            <div style="font-size:0.72rem;font-weight:700;color:var(--deep-navy);margin-top:0.3rem;">테스트 재생</div>
          </a>
        </div>
      `
      )
      .join('');
  }
}

function escapeAttr(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('click', (e) => {
  const tabBtn = e.target.closest('.tab-btn[data-tab]');
  if (tabBtn) {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    tabBtn.classList.add('active');
    const targetId = tabBtn.dataset.tab;
    document.querySelectorAll('.admin-tab-panel').forEach((p) => {
      p.style.display = p.id === targetId ? 'block' : 'none';
    });
  }
});

document.getElementById('admin-pipeline-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('admin-source-url')?.value.trim() || '';
  const title = document.getElementById('admin-custom-title')?.value.trim() || '';
  const btn = document.getElementById('run-pipeline-btn');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '1~4단계 AI 파이프라인 가동 중...';
  }

  try {
    const res = await fetch('/api/pipeline/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || '실행 실패');
    if (data.ok) {
      adminIssueData = data.issueData;
      renderAdminView();
      await loadPipelineArtifacts();
      alert('샘플 데이터로 50페이지 미리보기를 생성했습니다. 실제 수집·AI 검증·PDF 파일 생성은 수행하지 않았습니다.');
    }
  } catch (err) {
    alert('오류 발생: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '1~4단계 AI 자동 출판 파이프라인 가동';
    }
  }
});

document.getElementById('save-issue-btn')?.addEventListener('click', async () => {
  if (!adminIssueData) return;

  adminIssueData.meta.issueNumber = document.getElementById('edit-issue-number')?.value.trim() || adminIssueData.meta.issueNumber;
  adminIssueData.meta.publishDate = document.getElementById('edit-publish-date')?.value.trim() || adminIssueData.meta.publishDate;

  document.querySelectorAll('[data-art-idx]').forEach((input) => {
    const idx = Number(input.dataset.artIdx);
    const field = input.dataset.field;
    if (adminIssueData.articles[idx] && field) {
      adminIssueData.articles[idx][field] = input.value;
    }
  });

  if (adminIssueData.pages?.[0] && adminIssueData.articles?.[0]) {
    adminIssueData.pages[0].title = adminIssueData.articles[0].title;
  }

  try {
  const res = await fetch('/api/issue/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issue: adminIssueData })
  });
  const result = await res.json();
  if (!res.ok || !result.ok) throw new Error(result.error || '저장 실패');
  if (result.ok) {
    adminIssueData = result.issueData;
    renderAdminView();
    alert('편집 내용이 50페이지 주간지 및 웹 매거진에 즉시 반영되었습니다.');
  }
  } catch (err) { alert('저장 오류: ' + err.message); }
});

initAdminDashboard().catch(err => alert('편집국 데이터 로드 실패: ' + err.message));
