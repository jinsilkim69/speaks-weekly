import qrcode from './vendor/qrcode.mjs';
/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 에디토리얼 비주얼 & 벡터 에셋 라이브러리 (public/js/qr-generator.js)
 * 50페이지 전 지면 및 14개 전 꼭지 1:1 완벽 매칭 비주얼 시스템
 * 엉뚱한 해외 스톡 사진(오바마, 기타, 신발 등) 완전 퇴출!
 * 정통 시사·보도 그래픽 및 한국 정치·사법·문화 에디토리얼 비주얼 엔진
 */

import { TOPIC_VISUALS, getTopicVisual, getPageTopicVisual } from './topic-visuals.js';

export function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const EDITORIAL_VISUAL_MAP = TOPIC_VISUALS;
export const ARTICLE_REPRESENTATIVE_VISUALS = TOPIC_VISUALS;

/**
 * 페이지 번호(1~50)에 따른 1:1 완벽 매칭 비주얼 객체 반환
 */
export function getEditorialVisual(pageNumber = 1) {
  return getPageTopicVisual(pageNumber);
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
 * 14개 기사별(0~13) 대표 비주얼 매핑
 */
export function getArticleVisual(articleIndex = 0) {
  return getTopicVisual(articleIndex);
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
export function generateQrSvg(url = 'https://www.youtube.com/@SPEAKS_TV', size = 84) {
  const qr = qrcode(0, 'M');
  qr.addData(new URL(url).href);
  qr.make();
  return qr.createSvgTag({ cellSize: 2, margin: 8, scalable: true })
    .replace('<svg ', '<svg width="' + Number(size) + '" height="' + Number(size) + '" ');
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// 등록번호를 표시한다. 체크디지트 확인 없이 가짜 바코드를 생성하지 않는다.
export function generateBarcodeSvg(issn, isbn, width = 240, height = 66) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 66" width="' + Number(width) + '" height="' + Number(height) + '"><text x="8" y="24" font-size="14">' + escapeHtml(issn) + '</text><text x="8" y="48" font-size="14">' + escapeHtml(isbn) + '</text></svg>';
}

export function generatePollChartSvg(chart = {}) {
  const labels = chart.labels || [];
  const sets = chart.datasets || [];
  const max = Math.max(1, ...sets.flatMap(s => s.data).filter(Number.isFinite));
  const x = i => 60 + i * 490 / Math.max(1, labels.length - 1);
  const y = v => 270 - Number(v) * 210 / max;
  const colors = ['#D91E2A', '#0A1628', '#2563EB', '#947033'];
  let body = '<text x="20" y="24" font-size="14">샘플 통계 · 실제 여론조사 아님</text>';
  body += '<path d="M60 50V270H560" fill="none" stroke="#777"/>';
  labels.forEach((label, i) => { body += '<text x="' + x(i) + '" y="292" text-anchor="middle" font-size="12">' + escapeHtml(label) + '</text>'; });
  sets.forEach((set, j) => {
    const color = colors[j % colors.length];
    const points = set.data.map((v, i) => x(i) + ',' + y(v)).join(' ');
    body += '<polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="3"/>';
    body += '<text x="60" y="' + (320 + j * 24) + '" fill="' + color + '" font-size="13">' + escapeHtml(set.label) + '</text>';
    set.data.forEach((v, i) => { body += '<text x="' + x(i) + '" y="' + (y(v) - 6) + '" font-size="11">' + Number(v) + '</text>'; });
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 ' + (345 + sets.length * 24) + '" style="width:100%">' + body + '</svg>';
}

export function generateWorldDiagramSvg() {
  const names = ['미국 · 기술 공급망', '중국 · 원자재 교역', '유럽연합 · 규제 표준'];
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 280" style="width:100%"><text x="20" y="25" font-size="14">관계도 예시 · 검증 전</text>' + names.map((name, i) => '<rect x="20" y="' + (50 + i * 70) + '" width="230" height="45" fill="#eef1f5"/><text x="30" y="' + (79 + i * 70) + '" font-size="16">' + name + '</text><path d="M250 ' + (73 + i * 70) + ' L400 143" stroke="#687585"/>').join('') + '<rect x="400" y="118" width="190" height="50" fill="#0f1e36"/><text x="425" y="150" fill="white" font-size="18">대한민국 · 통상</text></svg>';
}
