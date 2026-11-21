import test from 'node:test';
import assert from 'node:assert/strict';
import { collectAllNewPosts } from '../tools/sns-monitor/collector.mjs';
import { sendTelegramNotification } from '../tools/sns-monitor/notifier.mjs';

test('한 피드의 오류를 기록하고 뒤의 정상 피드를 처리한다', async t => {
  const errors = [];
  const xml = '<rss><item><title>을의 발언</title><link>https://example.com/b</link><pubDate>' + new Date().toUTCString() + '</pubDate></item></rss>';
  t.mock.method(globalThis, 'fetch', async url => decodeURIComponent(url).includes('갑')
    ? { ok: false, status: 403 }
    : { ok: true, text: async () => xml });
  const targets = ['갑','을'].map(name => ({id:name, name, active:true}));
  const posts = await collectAllNewPosts({targets}, {}, error => errors.push(error.message));
  assert.deepEqual(posts.map(p => p.targetName), ['을']);
  assert.match(errors[0], /갑.*403/);
});

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
