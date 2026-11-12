import test from 'node:test';
import assert from 'node:assert/strict';
import { collectAllNewPosts } from '../tools/sns-monitor/collector.mjs';
import { sendTelegramNotification } from '../tools/sns-monitor/notifier.mjs';

test('수집 후보는 발송 전 완료 처리되지 않고 링크별 고유 ID를 갖는다', async () => {
  const old = globalThis.fetch;
  const date = new Date().toUTCString();
  globalThis.fetch = async () => ({ ok: true, text: async () => `<rss><item><title>한동훈 후보 하나</title><link>https://example.com/a</link><pubDate>${date}</pubDate></item><item><title>한동훈 후보 둘</title><link>https://example.com/b</link><pubDate>${date}</pubDate></item></rss>` });
  try {
    const state = { seenPostIds: {} };
    const posts = await collectAllNewPosts({ targets: [{ id: 'han', name: '한동훈', active: true }] }, state);
    assert.equal(posts.length, 2);
    assert.notEqual(posts[0].id, posts[1].id);
    assert.deepEqual(state.seenPostIds, {});
  } finally { globalThis.fetch = old; }
});

test('텔레그램 API 실패는 성공으로 세지 않는다', async () => {
  const old = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ ok: false }) });
  try {
    const count = await sendTelegramNotification('test', [{ active: true, chatId: '1' }], { targetName: '가', title: '후보', link: 'https://example.com' });
    assert.equal(count, 0);
  } finally { globalThis.fetch = old; }
});
