/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 정적 배포 파일 내보내기 (scripts/export-static.mjs)
 * Cloudflare Pages / Vercel / GitHub Pages 무료 호스팅 배포를 위해
 * 검증된 홈페이지 기사와 출고된 주간호만 정적 배포에 포함합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feedFromIssue } from './live-feed.mjs';
import { readHomeCatalog,readPublishedEdition } from './editorial-catalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

export async function exportStaticSite() {
  console.log('📦 [정적 배포] Cloudflare Pages / Vercel 무료 배포 패키징 시작...');
  const currentIssuePath = path.join(DATA_DIR, 'current_issue.json');
  if(fs.existsSync(currentIssuePath))JSON.parse(fs.readFileSync(currentIssuePath, 'utf8'));
  const home = readHomeCatalog(ROOT_DIR);

  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 1. public/ 폴더의 모든 파일 및 서브폴더 복사
  copyRecursiveSync(PUBLIC_DIR, DIST_DIR);
  // Only released editions enter the public artifact; proofs stay in output/.
  const editionsDir=path.join(DIST_DIR,'editions');fs.mkdirSync(editionsDir,{recursive:true});

  // 2. data/current_issue.json 을 dist/api/issue 로 복사 (서버 없는 무료 호스팅 대응)
  const apiDir = path.join(DIST_DIR, 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.mkdirSync(path.join(apiDir,'editions'),{recursive:true});
  for(const item of home.editions.filter(i=>i.status==='published')){
    const edition=readPublishedEdition(ROOT_DIR,item.id);
    fs.writeFileSync(path.join(apiDir,'editions',item.id+'.json'),JSON.stringify(edition,null,2));
    fs.copyFileSync(path.join(PUBLIC_DIR,edition.pdfUrl),path.join(DIST_DIR,edition.pdfUrl));
  }
  fs.writeFileSync(path.join(apiDir, 'home'), JSON.stringify(home, null, 2));
  fs.writeFileSync(path.join(apiDir, 'home.json'), JSON.stringify(home, null, 2));

  if (fs.existsSync(currentIssuePath)) {
    fs.copyFileSync(currentIssuePath, path.join(apiDir, 'issue'));
    fs.copyFileSync(currentIssuePath, path.join(apiDir, 'issue.json'));
  }
  const dossierPath = path.join(DATA_DIR, '01_research_dossier.md');
  const blueprintPath = path.join(DATA_DIR, '02_issue_blueprint.json');
  fs.writeFileSync(path.join(apiDir, 'artifacts'), JSON.stringify({
    ok: true,
    dossier: fs.existsSync(dossierPath) ? fs.readFileSync(dossierPath, 'utf8') : '',
    blueprint: fs.existsSync(blueprintPath) ? JSON.parse(fs.readFileSync(blueprintPath, 'utf8')) : {}
  }));
  const adminPath = path.join(DIST_DIR, 'admin.html');
  fs.writeFileSync(adminPath, fs.readFileSync(adminPath, 'utf8')
    .replace('id="run-pipeline-btn"', 'id="run-pipeline-btn" disabled title="로컬 서버에서 실행하세요"')
    .replace('id="save-issue-btn"', 'id="save-issue-btn" disabled title="로컬 서버에서 저장하세요"')
    .replace('<body', '<body data-static="true"'));

  // 3. live-feed 데이터도 정적 생성 (유튜브 고화질 실제 방송 썸네일 & 영상 링크 연결)
  const now = new Date();
  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const liveFeed = {
    mode: 'demo',
    updatedAt: `${timeStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    channel: '@SPEAKS_TV',
    channelUrl: 'https://www.youtube.com/@SPEAKS_TV',
    liveStreamUrl: 'https://www.youtube.com/@SPEAKS_TV/live',
    subscribers: '153만 명',
    items: [
      {
        id: 'live-01',
        isLive: false,
        program: '정치본색 라이브 속보',
        title: '[생방송] 2026 예산안 격돌과 사법 대전환: 여야 막전막후 긴급 해설',
        speaker: '전계완 대표 × 김완 기자',
        views: '실시간 2.4만 명 시청 중',
        timeAgo: '샘플 · 실시간 상태 미확인',
        videoId: 'v6awNopN5n4',
        videoUrl: 'https://www.youtube.com/watch?v=v6awNopN5n4',
        liveUrl: 'https://www.youtube.com/@SPEAKS_TV/live',
        thumbnail: 'https://img.youtube.com/vi/v6awNopN5n4/hqdefault.jpg',
        summary: '오늘 국회 예산결산위에서 터져 나온 30조 민생지원금 격돌의 본질과 향후 본회의 표결 전망'
      },
      {
        id: 'live-02',
        isLive: false,
        program: '스픽스 경제본색',
        title: '“착공 안 하면 땅 당장 뺏어라” 30조 추경과 건설사 꼼수 차단',
        speaker: '스픽스 경제 취재팀',
        views: '조회수 28만 회',
        timeAgo: '3시간 전',
        videoId: 'itVoUz9w9hw',
        videoUrl: 'https://www.youtube.com/watch?v=itVoUz9w9hw',
        liveUrl: 'https://www.youtube.com/@SPEAKS_TV/live',
        thumbnail: 'https://img.youtube.com/vi/itVoUz9w9hw/hqdefault.jpg',
        summary: '가계신용 1,912조 시대, 시중은행 대출 억제와 서민 실수요자 보호 사이의 정책 긴급 진단'
      },
      {
        id: 'live-03',
        isLive: false,
        program: '스픽스 사법정의',
        title: '[단독] “탄핵 매달릴 이유 없다” 조희대 꼼짝 못 할 김해원의 역대급 묘수',
        speaker: '김해원 헌법학자 × 전계완',
        views: '조회수 34만 회',
        timeAgo: '5시간 전',
        videoId: 'N0A7avU9zzs',
        videoUrl: 'https://www.youtube.com/watch?v=N0A7avU9zzs',
        liveUrl: 'https://www.youtube.com/@SPEAKS_TV/live',
        thumbnail: 'https://img.youtube.com/vi/N0A7avU9zzs/hqdefault.jpg',
        summary: '수사·기소 완전 분리와 대법관 24인 증원 개정안, 헌재 눈치 안 보고 국회가 제압하는 법'
      },
      {
        id: 'live-04',
        isLive: false,
        program: '스픽스 쇼츠 핫클립',
        title: '[속보] “가짜 봉사 발각돼 취소!” 공문 떴다 안진걸 폭로 현장',
        speaker: '안진걸 민생경제연구소장',
        views: '조회수 45만 회',
        timeAgo: '오늘 오전',
        videoId: 'EGM-TWO0gio',
        videoUrl: 'https://www.youtube.com/watch?v=EGM-TWO0gio',
        liveUrl: 'https://www.youtube.com/@SPEAKS_TV/live',
        thumbnail: 'https://img.youtube.com/vi/EGM-TWO0gio/hqdefault.jpg',
        summary: '국회 정회 이끈 60초 핵심 증거 폭로와 여론 폭발 쇼츠'
      }
    ]
  };
  const issue = fs.existsSync(currentIssuePath)?JSON.parse(fs.readFileSync(currentIssuePath, 'utf8')):null;
  const exportedFeed = issue?.meta?.mode === 'agent-edited' ? feedFromIssue(issue) : {...liveFeed,items:[]};
  fs.writeFileSync(path.join(apiDir, 'live-feed'), JSON.stringify(exportedFeed, null, 2), 'utf-8');
  fs.writeFileSync(path.join(apiDir, 'live-feed.json'), JSON.stringify(exportedFeed, null, 2), 'utf-8');

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
      if(src===PUBLIC_DIR&&childItemName==='editions')return;
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
