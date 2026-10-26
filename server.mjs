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
    subscribers: '153만 명',
    items: [
      {
        id: 'live-01',
        isLive: true,
        program: '정치본색 속보',
        title: '[생방송] 2026 예산안 격돌과 사법 대전환: 여야 막전막후 긴급 해설',
        speaker: '김성완 평론가 × 박진영 교수',
        views: '실시간 2.4만 명 시청 중',
        timeAgo: 'LIVE 진행 중',
        videoUrl: 'https://www.youtube.com/@SPEAKS_TV',
        thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        summary: '오늘 국회 예산결산위에서 터져 나온 30조 민생지원금 격돌의 본질과 향후 본회의 표결 전망'
      },
      {
        id: 'live-02',
        isLive: false,
        program: '스픽스1234',
        title: '“가계부채 2천조 시대, 금리와 부동산 출구전략은 어디로 가는가”',
        speaker: '정세현 전 장관 특별 대담',
        views: '조회수 28만 회',
        timeAgo: '3시간 전',
        videoUrl: 'https://www.youtube.com/@SPEAKS_TV',
        thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
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
        thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
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
        thumbnail: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
        summary: '법사위 탄핵 청문회장 돌발 격돌 순간과 여야 고성 현장'
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
