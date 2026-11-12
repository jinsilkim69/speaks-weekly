import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { collectAllNewPosts } from './collector.mjs';
import { analyzePoliticalPost } from './analyzer.mjs';
import { sendTelegramNotification } from './notifier.mjs';
import { archivePoliticalPosts } from './archiver.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.join(dir, 'state.json');
const config = JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8'));
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
state.seenPostIds ||= {};
state.pending ||= [];
const token = process.env.TELEGRAM_BOT_TOKEN;
const subs = (config.subscribers || []).filter(s => s.active && s.chatId);
if (process.env.TELEGRAM_CHAT_ID && !subs.some(s => String(s.chatId) === process.env.TELEGRAM_CHAT_ID)) {
  subs.push({ name: '환경변수 수신자', chatId: process.env.TELEGRAM_CHAT_ID, active: true });
}
if (!token || !subs.length) throw new Error('TELEGRAM_BOT_TOKEN과 활성 수신자 설정이 필요합니다.');
const save = () => {
  const temp = statePath + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(temp, statePath);
};
const recipientKey = s => createHash('sha256').update(String(s.chatId)).digest('hex');

async function main() {
  let posts = [];
  let failed = false;
  try { posts = await collectAllNewPosts(config, state); }
  catch (err) { failed = true; console.error(err.message); }
  const queued = new Set(state.pending.map(item => item.post.id));
  for (const post of posts) {
    if (!queued.has(post.id)) {
      state.pending.push({ post, delivered: [], archived: false });
      queued.add(post.id);
    }
  }
  save();
  for (const item of state.pending.slice(0, 3)) {
    const analyzed = await analyzePoliticalPost(item.post, process.env.GEMINI_API_KEY || null);
    for (const sub of subs) {
      const key = recipientKey(sub);
      if (item.delivered.includes(key)) continue;
      const sent = await sendTelegramNotification(token, [sub], analyzed);
      if (sent === 1) { item.delivered.push(key); save(); }
      else { failed = true; console.error('발송 실패: 다음 실행에서 재시도합니다.'); }
    }
    if (subs.every(sub => item.delivered.includes(recipientKey(sub)))) {
      if (!item.archived) { await archivePoliticalPosts([analyzed]); item.archived = true; }
      state.seenPostIds[item.post.id] = { seenAt: new Date().toISOString(), title: item.post.title, targetName: item.post.targetName };
      state.pending = state.pending.filter(entry => entry.post.id !== item.post.id);
      save();
    }
  }
  console.log(`처리 후 대기 후보 ${state.pending.length}건`);
  if (failed) process.exitCode = 1;
}
main().catch(err => { console.error(err.message); process.exitCode = 1; });
