/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 정적 배포 파일 내보내기 (scripts/export-static.mjs)
 * Cloudflare Pages / Vercel / GitHub Pages 무료 호스팅 배포를 위해
 * dist/ 디렉토리에 정적 웹 매거진과 50p E-Book 전체를 완벽 패키징합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

export async function exportStaticSite() {
  console.log('📦 [정적 배포] Cloudflare Pages / Vercel 무료 배포 패키징 시작...');

  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 1. public/ 폴더의 모든 파일 및 서브폴더 복사
  copyRecursiveSync(PUBLIC_DIR, DIST_DIR);

  // 2. data/current_issue.json 을 dist/api/issue 로 복사 (서버 없는 무료 호스팅 대응)
  const apiDir = path.join(DIST_DIR, 'api');
  fs.mkdirSync(apiDir, { recursive: true });

  const currentIssuePath = path.join(DATA_DIR, 'current_issue.json');
  if (fs.existsSync(currentIssuePath)) {
    fs.copyFileSync(currentIssuePath, path.join(apiDir, 'issue'));
    fs.copyFileSync(currentIssuePath, path.join(apiDir, 'issue.json'));
  }

  function encodeSvg(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  }

  const LIVE_THUMBNAILS = {
    live1: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
        <defs>
          <linearGradient id="bg_live1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0B132B"/><stop offset="100%" stop-color="#1C2541"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#bg_live1)"/>
        <path d="M 200 280 Q 400 140 600 280 Z" fill="#152238" stroke="#00B4D8" stroke-width="2" opacity="0.4"/>
        <rect x="250" y="280" width="300" height="70" fill="#0B132B" stroke="#00B4D8" stroke-width="1.5" opacity="0.4"/>
        <rect x="40" y="40" width="110" height="32" rx="4" fill="#C8102E"/>
        <text x="55" y="62" fill="#fff" font-family="'Pretendard',sans-serif" font-size="14" font-weight="900">● LIVE 속보</text>
        <text x="40" y="160" fill="#fff" font-family="'Pretendard',sans-serif" font-size="28" font-weight="900">2026 정기국회 예산안 격돌과 사법 대전환</text>
        <text x="40" y="200" fill="#FFD166" font-family="'Pretendard',sans-serif" font-size="20" font-weight="700">김성완 평론가 × 박진영 교수 긴급 해설</text>
        <rect x="40" y="370" width="720" height="40" rx="4" fill="rgba(255,255,255,0.08)"/>
        <text x="60" y="395" fill="#E2E8F0" font-family="'Pretendard',sans-serif" font-size="14">스픽스 정치본색 특별 생방송 · 실시간 2.4만 명 시청 중</text>
      </svg>
    `),
    live2: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
        <defs>
          <linearGradient id="bg_live2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0A192F"/><stop offset="100%" stop-color="#1E3A8A"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#bg_live2)"/>
        <polyline points="100,320 250,280 400,240 550,180 700,120" fill="none" stroke="#EF4444" stroke-width="4"/>
        <circle cx="700" cy="120" r="8" fill="#EF4444"/>
        <rect x="40" y="40" width="130" height="32" rx="4" fill="#0284C7"/>
        <text x="55" y="62" fill="#fff" font-family="'Pretendard',sans-serif" font-size="14" font-weight="800">스픽스1234 경제</text>
        <text x="40" y="160" fill="#fff" font-family="'Pretendard',sans-serif" font-size="28" font-weight="900">가계부채 2천조 시대, 금리와 부동산 출구전략</text>
        <text x="40" y="200" fill="#38BDF8" font-family="'Pretendard',sans-serif" font-size="20" font-weight="700">정세현 전 통일부 장관 특별 대담</text>
        <rect x="40" y="370" width="720" height="40" rx="4" fill="rgba(255,255,255,0.08)"/>
        <text x="60" y="395" fill="#E2E8F0" font-family="'Pretendard',sans-serif" font-size="14">한국은행 가계신용 통계 1,912조 정밀 분석 · 조회수 28만 회</text>
      </svg>
    `),
    live3: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
        <defs>
          <linearGradient id="bg_live3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#111827"/><stop offset="100%" stop-color="#1F2937"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#bg_live3)"/>
        <circle cx="550" cy="225" r="140" fill="none" stroke="#3B82F6" stroke-width="1.5" opacity="0.3"/>
        <ellipse cx="550" cy="225" rx="140" ry="50" fill="none" stroke="#3B82F6" stroke-width="1" opacity="0.3"/>
        <rect x="40" y="40" width="130" height="32" rx="4" fill="#0D9488"/>
        <text x="55" y="62" fill="#fff" font-family="'Pretendard',sans-serif" font-size="14" font-weight="800">월드이슈 심층분석</text>
        <text x="40" y="160" fill="#fff" font-family="'Pretendard',sans-serif" font-size="28" font-weight="900">미·중 반도체 패권과 브릭스 통상 파고의 역습</text>
        <text x="40" y="200" fill="#2DD4BF" font-family="'Pretendard',sans-serif" font-size="20" font-weight="700">선재규 연합뉴스 선임기자 심층 해설</text>
        <rect x="40" y="370" width="720" height="40" rx="40" fill="rgba(255,255,255,0.08)"/>
        <text x="60" y="395" fill="#E2E8F0" font-family="'Pretendard',sans-serif" font-size="14">신흥국 탈달러 블록화와 한국 수출 제조업 생존 전략 · 조회수 19만 회</text>
      </svg>
    `),
    live4: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
        <defs>
          <linearGradient id="bg_live4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2E0854"/><stop offset="100%" stop-color="#4C1D95"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#bg_live4)"/>
        <rect x="40" y="40" width="140" height="32" rx="4" fill="#F59E0B"/>
        <text x="55" y="62" fill="#000" font-family="'Pretendard',sans-serif" font-size="14" font-weight="900">⚡ SHORTS 60초</text>
        <text x="40" y="160" fill="#fff" font-family="'Pretendard',sans-serif" font-size="28" font-weight="900">“이 한마디로 국회 정회됐다”</text>
        <text x="40" y="200" fill="#FDE047" font-family="'Pretendard',sans-serif" font-size="22" font-weight="800">법사위 탄핵 청문회 여야 원내대표 설전 요약</text>
        <rect x="40" y="370" width="720" height="40" rx="4" fill="rgba(255,255,255,0.08)"/>
        <text x="60" y="395" fill="#E2E8F0" font-family="'Pretendard',sans-serif" font-size="14">스픽스 국회 취재팀 현장 긴급 포렌식 · 조회수 45만 회 돌파</text>
      </svg>
    `)
  };

  // 3. live-feed 데이터도 정적 생성
  const now = new Date();
  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const liveFeed = {
    updatedAt: `${timeStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    channel: '@SPEAKS_TV',
    subscribers: '153만 명',
    items: [
      {
        id: 'live-01',
        isLive: true,
        program: '정치본색 라이브 속보',
        title: '[생방송] 2026 정기국회 예산안 격돌과 사법 대전환: 여야 막전막후 긴급 해설',
        speaker: '김성완 평론가 × 박진영 교수',
        views: '실시간 2.4만 명 시청 중',
        timeAgo: 'LIVE 진행 중',
        videoUrl: 'https://www.youtube.com/@SPEAKS_TV',
        thumbnail: LIVE_THUMBNAILS.live1,
        summary: '오늘 국회 예산결산위에서 터져 나온 30조 민생지원금 격돌의 본질과 향후 본회의 표결 전망'
      },
      {
        id: 'live-02',
        isLive: false,
        program: '스픽스1234',
        title: '“가계부채 2천조 시대, 금리와 부동산 출구전략은 어디로 가는가”',
        speaker: '정세현 전 통일부 장관 특별 대담',
        views: '조회수 28만 회',
        timeAgo: '3시간 전',
        videoUrl: 'https://www.youtube.com/@SPEAKS_TV',
        thumbnail: LIVE_THUMBNAILS.live2,
        summary: '시중은행 가계대출 억제책과 실비 실수요자 보호 사이의 정책 딜레마 집중 분석'
      },
      {
        id: 'live-03',
        isLive: false,
        program: '선재규의 월드이슈',
        title: '미·중 반도체 기술 패권 전쟁과 브릭스(BRICS) 통상 파고의 역습',
        speaker: '선재규 선임기자',
        views: '조회수 19만 회',
        timeAgo: '6시간 전',
        videoUrl: 'https://www.youtube.com/@SPEAKS_TV',
        thumbnail: LIVE_THUMBNAILS.live3,
        summary: '달러 패권 흔들리는 신흥국 통화 블록화 흐름 속 한국 수출 제조업의 생존 전략'
      },
      {
        id: 'live-04',
        isLive: false,
        program: '스픽스 쇼츠 핫클립',
        title: '“이 한마디로 국회 정회됐다” 여야 원내대표 설전 60초 요약',
        speaker: '스픽스 국회팀',
        views: '조회수 45만 회',
        timeAgo: '오늘 오전',
        videoUrl: 'https://www.youtube.com/@SPEAKS_TV',
        thumbnail: LIVE_THUMBNAILS.live4,
        summary: '법사위 탄핵 청문회장 돌발 격돌 순간과 여야 고성 현장'
      }
    ]
  };
  fs.writeFileSync(path.join(apiDir, 'live-feed'), JSON.stringify(liveFeed, null, 2), 'utf-8');
  fs.writeFileSync(path.join(apiDir, 'live-feed.json'), JSON.stringify(liveFeed, null, 2), 'utf-8');

  console.log(`✅ [정적 배포 완료] dist/ 폴더에 무료 호스팅 배포 준비 완료!`);
  console.log(`   - 대상 폴더: ${DIST_DIR}`);
  console.log(`   - 이제 이 dist 폴더를 Cloudflare Pages 또는 Vercel에 드래그&드롭하거나 Git 푸시하면 즉시 배포됩니다.`);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  exportStaticSite().catch((err) => {
    console.error('정적 배포 오류:', err);
    process.exit(1);
  });
}
