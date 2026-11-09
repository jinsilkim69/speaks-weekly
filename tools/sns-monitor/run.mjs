/**
 * [정치인 SNS 레이더 메인 실행기] run.mjs
 * 1회 실행 시 전체 10인 정치인 피드 검사 -> AI 분석 -> 텔레그램 발송 -> 캐시 저장을 수행합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectAllNewPosts } from './collector.mjs';
import { analyzePoliticalPost } from './analyzer.mjs';
import { sendTelegramNotification } from './notifier.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 [정치인 SNS 레이더] 모니터링 사이클 가동...');

  const configPath = path.join(__dirname, 'config.json');
  const statePath = path.join(__dirname, 'state.json');

  if (!fs.existsSync(configPath)) {
    console.error('❌ config.json 파일이 없습니다.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const state = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
    : { lastCheckedAt: null, seenPostIds: {} };

  // 환경변수가 지정된 경우 우선 덮어쓰기 (GitHub Actions 지원)
  const botToken = process.env.TELEGRAM_BOT_TOKEN || config.bot.token;
  const geminiApiKey = process.env.GEMINI_API_KEY || null;

  if (process.env.TELEGRAM_CHAT_ID) {
    const exists = config.subscribers.some(s => s.chatId === process.env.TELEGRAM_CHAT_ID);
    if (!exists) {
      config.subscribers.push({
        name: 'GitHub Secret 수신자',
        chatId: process.env.TELEGRAM_CHAT_ID,
        active: true
      });
    }
  }

  // 1. 신규 발언 수집
  const newPosts = await collectAllNewPosts(config, state);

  if (newPosts.length === 0) {
    console.log('💤 새로운 미확인 발언이 없습니다. 다음 주기에 다시 확인합니다.');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
    return;
  }

  // 2. 발언별 AI 분석 및 텔레그램 발송 (너무 많은 알림 폭주 방지: 1회당 최대 3건)
  const targetPosts = newPosts.slice(0, 3);
  console.log(`⚡ 발송 대상 발언 ${targetPosts.length}건 분석 및 텔레그램 전송 중...`);

  for (const post of targetPosts) {
    console.log(`[분석 중] ${post.targetName}: ${post.title}`);
    const analyzed = await analyzePoliticalPost(post, geminiApiKey);
    const sentCount = await sendTelegramNotification(botToken, config.subscribers, analyzed);
    console.log(`📨 텔레그램 발송 완료 (${sentCount}명 수신)`);
    // API 연속 호출 간격 1초
    await new Promise(r => setTimeout(r, 1000));
  }

  // 3. 상태 저장
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  console.log('🎉 [사이클 완료] 모든 처리가 정상 종료되었습니다.');
}

main().catch(err => {
  console.error('❌ 실행 중 치명적 오류 발생:', err);
  process.exit(1);
});
