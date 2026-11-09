/**
 * [주간지 지면 직결 아카이버] archiver.mjs
 * 텔레그램으로 발송된 실시간 발언 데이터를 일별(daily) 및 주간별(weekly)로 분류 저장하여,
 * 매주 월요일 50페이지 주간지 Part 1 '스픽스 레이다 / 정치인의 말말말' 지면에 즉시 투입할 수 있도록 만듭니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const ARCHIVE_ROOT = path.join(ROOT_DIR, 'data', 'political-voices');

// ISO 주차 계산 (예: 2026-W46)
function getIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export async function archivePoliticalPosts(posts) {
  if (!posts || posts.length === 0) return;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const monthStr = dateStr.substring(0, 7); // YYYY-MM
  const weekStr = getIsoWeek(now); // YYYY-Www

  const rawDir = path.join(ARCHIVE_ROOT, 'raw', monthStr);
  const dailyDir = path.join(ARCHIVE_ROOT, 'daily');
  const weeklyDir = path.join(ARCHIVE_ROOT, 'weekly');

  [rawDir, dailyDir, weeklyDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // 1. Raw JSON 일별 저장
  const rawFile = path.join(rawDir, `${dateStr}.json`);
  let rawList = [];
  if (fs.existsSync(rawFile)) {
    try { rawList = JSON.parse(fs.readFileSync(rawFile, 'utf8')); } catch (e) {}
  }
  rawList.push(...posts);
  fs.writeFileSync(rawFile, JSON.stringify(rawList, null, 2), 'utf8');

  // 2. Daily Briefing 마크다운 누적
  const dailyMdFile = path.join(dailyDir, `${dateStr}-briefing.md`);
  let dailyMd = fs.existsSync(dailyMdFile)
    ? fs.readFileSync(dailyMdFile, 'utf8')
    : `# [일일 정치인 SNS 브리핑] ${dateStr}\n\n`;

  for (const post of posts) {
    const analysis = post.analysis || {};
    const bullets = (analysis.summaryPoints || []).map(p => `  - ${p}`).join('\n');
    dailyMd += `### [${post.targetName} ${post.targetTitle}] ${post.title}\n`;
    dailyMd += `- **시각**: ${new Date().toLocaleTimeString('ko-KR')}\n`;
    dailyMd += `- **출처**: ${post.source || 'SNS / 속보'}\n`;
    dailyMd += `- **원문 링크**: [바로가기](${post.link})\n`;
    dailyMd += `- **AI 핵심 브리핑**:\n${bullets}\n\n`;
  }
  fs.writeFileSync(dailyMdFile, dailyMd, 'utf8');

  // 3. Weekly 지면 직결 원고 누적 (주간 스픽스 Part 1 지면 규격)
  const weeklyMdFile = path.join(weeklyDir, `${weekStr}-editorial-draft.md`);
  let weeklyMd = fs.existsSync(weeklyMdFile)
    ? fs.readFileSync(weeklyMdFile, 'utf8')
    : `# 『주간 스픽스』 Part 1. 스픽스 레이다 — 금주의 결정적 발언록 (${weekStr})\n` +
      `> 원천 데이터: 정치인 10인 실시간 SNS(페이스북·X·트루스소셜) 수집 및 AI 심층 분석 아카이브\n\n`;

  for (const post of posts) {
    const analysis = post.analysis || {};
    const impact = analysis.impact ? `*“${analysis.impact}”*` : '';
    weeklyMd += `## [정치인의 말] ${post.targetName} (${post.targetTitle})\n`;
    weeklyMd += `> **"${post.title}"**\n\n`;
    weeklyMd += `- **발언 일시**: ${dateStr}\n`;
    weeklyMd += `- **쟁점 맥락**: ${impact}\n`;
    if (analysis.summaryPoints && analysis.summaryPoints.length > 0) {
      weeklyMd += `- **심층 해설**:\n`;
      analysis.summaryPoints.forEach(p => {
        weeklyMd += `  1. ${p}\n`;
      });
    }
    weeklyMd += `- **팩트체크 출처**: [원문 기사/기록](${post.link})\n\n---\n\n`;
  }
  fs.writeFileSync(weeklyMdFile, weeklyMd, 'utf8');

  console.log(`📁 [아카이브 완료] Raw: ${rawFile} | Daily: ${dailyMdFile} | Weekly: ${weeklyMdFile}`);
}
