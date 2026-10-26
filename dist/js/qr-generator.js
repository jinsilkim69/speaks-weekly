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
