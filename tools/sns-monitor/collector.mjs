/**
 * [정치인 SNS 실시간 수집기] collector.mjs
 * 외부 패키지 설치 없이 Node.js 18+ 내장 fetch 및 XML 파서로 동작합니다.
 * 주요 정치인 10인의 SNS(페이스북, X, 트루스소셜) 실시간 발언을 24시간 감지합니다.
 * ★ 중요: 과거 기사나 회고성 기사는 완전 배제하고, 최근 24시간 이내의 최신 발언만 정밀 수집합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// XML 엔티티 디코더
function decodeEntities(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
}

/**
 * 특정 타깃의 실시간 SNS 발언 피드 수집
 */
export async function collectTargetPosts(target) {
  const posts = [];

  // 구글 뉴스 실시간 시간 필터 연산자 when:1d (최근 24시간 이내 최신 글만 조회)
  const query = target.id === 'donald_trump'
    ? 'Donald Trump (Truth Social OR post OR tweet) when:1d'
    : target.id === 'lee_jaemyung'
      ? '이재명 대통령 (페이스북 OR SNS OR "페이스북을 통해" OR X) when:1d'
      : `${target.name} (페이스북 OR 트위터 OR SNS OR "페이스북을 통해") when:1d`;

  const langParam = target.id === 'donald_trump' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=ko&gl=KR&ceid=KR:ko';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${langParam}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      console.warn(`[수집 경고] ${target.name} 응답 코드: ${res.status}`);
      return posts;
    }

    const xml = await res.text();
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const items = [...xml.matchAll(itemRegex)].map(m => m[1]);

    const now = new Date().getTime();
    // 24시간 이내 생성된 기사만 철저히 선별 (과거 기사 완전 차단)
    const MAX_AGE_MS = 24 * 60 * 60 * 1000;

    for (const itemXml of items.slice(0, 8)) {
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      const descMatch = itemXml.match(/<description>(.*?)<\/description>/);
      const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/);

      const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : '';
      const desc = descMatch ? decodeEntities(descMatch[1].replace(/<[^>]+>/g, '').trim()) : '';
      const source = sourceMatch ? decodeEntities(sourceMatch[1].trim()) : '속보 언론';

      if (!title || !link || !pubDateStr) continue;

      const pubDate = new Date(pubDateStr);
      const ageMs = now - pubDate.getTime();

      // ★ 핵심 수정: 과거 기사는 엄격히 탈락!
      if (isNaN(ageMs) || ageMs > MAX_AGE_MS || ageMs < -60000) {
        continue;
      }

      // 회고성 옛날 기사 배제 키워드
      const isPastMemoir = title.includes('그때 그 시절') || title.includes('되돌아본') || title.includes('10년 전');
      if (isPastMemoir) continue;

      // 발언 관련 키워드 검증
      const isPoliticalStatement =
        title.includes(target.name) ||
        title.includes('트럼프') ||
        title.includes('Trump') ||
        desc.includes(target.name);

      if (isPoliticalStatement) {
        posts.push({
          id: Buffer.from(title).toString('base64').substring(0, 32),
          targetId: target.id,
          targetName: target.name,
          targetTitle: target.title,
          title,
          desc,
          link,
          pubDate: pubDateStr,
          source,
          ageHours: Math.round(ageMs / (60 * 60 * 1000) * 10) / 10
        });
      }
    }
  } catch (err) {
    console.error(`[수집 에러] ${target.name}:`, err.message);
  }

  return posts;
}

/**
 * 전체 10인 정치인 피드 일괄 수집 & 캐시 대조
 */
export async function collectAllNewPosts(config, state) {
  const newPosts = [];
  const seenMap = state.seenPostIds || {};

  console.log(`📡 [수집 시작] ${config.targets.length}명 정치인 SNS 실시간 발언 스캔 중 (최근 24시간 최신 발언)...`);

  for (const target of config.targets) {
    if (!target.active) continue;
    const posts = await collectTargetPosts(target);

    for (const post of posts) {
      if (!seenMap[post.id]) {
        newPosts.push(post);
        seenMap[post.id] = {
          seenAt: new Date().toISOString(),
          title: post.title,
          targetName: post.targetName
        };
      }
    }
  }

  // 상태 업데이트 (최근 500개만 유지하여 용량 최적화)
  const keys = Object.keys(seenMap);
  if (keys.length > 500) {
    const keepKeys = keys.slice(keys.length - 500);
    const trimmed = {};
    for (const k of keepKeys) trimmed[k] = seenMap[k];
    state.seenPostIds = trimmed;
  } else {
    state.seenPostIds = seenMap;
  }
  state.lastCheckedAt = new Date().toISOString();

  console.log(`✅ [수집 완료] 신규 감지된 24시간 내 최신 발언: ${newPosts.length}건`);
  return newPosts;
}
