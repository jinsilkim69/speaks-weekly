/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 통합 웹 매거진 · 50p PDF 조판 뷰어 · 편집국 관리자 서버 (server.mjs)
 * - 메인 웹 매거진 (데일리 실시간 피드 + 위클리 50p 결합): http://localhost:3000/
 * - 50p A4 인쇄/PDF 뷰어: http://localhost:3000/magazine
 * - 편집국 관리자 대시보드: http://localhost:3000/admin
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFullPipeline } from './scripts/run-pipeline.mjs';
import { cleanupYoutubeTempFiles } from './scripts/01-collect-speaks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

async function ensureIssueDataExists() {
  const issuePath = path.join(DATA_DIR, 'current_issue.json');
  if (!fs.existsSync(issuePath)) {
    await runFullPipeline();
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// 주중 실시간 스픽스 라이브 & 최신 영상 피드 데이터 생성
function getDailyLiveFeed() {
  const now = new Date();
  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  return {
    updatedAt: `${timeStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    channel: '@SPEAKS_TV',
    channelUrl: 'https://www.youtube.com/@SPEAKS_TV',
    liveStreamUrl: 'https://www.youtube.com/@SPEAKS_TV/live',
    subscribers: '153만 명',
    items: [
      {
        id: 'live-01',
        isLive: true,
        program: '정치본색 라이브 속보',
        title: '[생방송] 2026 예산안 격돌과 사법 대전환: 여야 막전막후 긴급 해설',
        speaker: '전계완 대표 × 김완 기자',
        views: '실시간 2.4만 명 시청 중',
        timeAgo: 'LIVE 진행 중',
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
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // API: 주중 실시간 스픽스 라이브 & 핫클립 피드
    if (pathname === '/api/live-feed' && req.method === 'GET') {
      const feed = getDailyLiveFeed();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(feed));
      return;
    }

    // API: Get Current 50p Issue Data
    if (pathname === '/api/issue' && req.method === 'GET') {
      await ensureIssueDataExists();
      const raw = fs.readFileSync(path.join(DATA_DIR, 'current_issue.json'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(raw);
      return;
    }

    // API: Get Pipeline Artifacts
    if (pathname === '/api/artifacts' && req.method === 'GET') {
      await ensureIssueDataExists();
      const dossierPath = path.join(DATA_DIR, '01_research_dossier.md');
      const blueprintPath = path.join(DATA_DIR, '02_issue_blueprint.json');
      const dossier = fs.existsSync(dossierPath) ? fs.readFileSync(dossierPath, 'utf-8') : '';
      const blueprint = fs.existsSync(blueprintPath)
        ? JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'))
        : {};
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, dossier, blueprint }));
      return;
    }

    // API: Run 4-Step AI Pipeline
    if (pathname === '/api/pipeline/run' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = await runFullPipeline({
        url: body.url || '',
        title: body.title || ''
      });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return;
    }

    // API: Save Current Issue
    if (pathname === '/api/issue/save' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.issue) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Missing issue payload' }));
        return;
      }
      fs.writeFileSync(
        path.join(DATA_DIR, 'current_issue.json'),
        JSON.stringify(body.issue, null, 2),
        'utf-8'
      );
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, message: 'Current issue updated' }));
      return;
    }

    // Static Files
    let filePath;
    if (pathname === '/' || pathname === '/index.html') {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    } else if (pathname === '/magazine') {
      filePath = path.join(PUBLIC_DIR, 'magazine.html');
    } else if (pathname === '/admin') {
      filePath = path.join(PUBLIC_DIR, 'admin.html');
    } else {
      const safeRel = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
      filePath = path.join(PUBLIC_DIR, safeRel);
    }

    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found - 주간 스픽스 (SPEAKS WEEKLY)');
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: err.message }));
  }
});

ensureIssueDataExists().then(() => {
  server.listen(PORT, () => {
    console.log(`\n==================================================================`);
    console.log(`📘 『주간 스픽스 (SPEAKS WEEKLY)』 자동 출판 서버 가동 완료!`);
    console.log(`   - 발행·제작처: 도서출판 아우내 (충남 천안시 동남구 양지말1길 40)`);
    console.log(`   - 반응형 웹 매거진 메인: http://localhost:${PORT}/`);
    console.log(`   - 50페이지 A4 인쇄/PDF 뷰어: http://localhost:${PORT}/magazine`);
    console.log(`   - 편집국 관리자 대시보드: http://localhost:${PORT}/admin`);
    console.log(`==================================================================\n`);
  });
});
