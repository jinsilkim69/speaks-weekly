import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateIssue, writeIssueAtomic } from './issue-storage.mjs';

const root = path.resolve(import.meta.dirname, '..');
export function publishAgentIssue() {
  const draft = JSON.parse(fs.readFileSync(path.join(root, 'data/agent_articles.json'), 'utf8'));
  const previous = JSON.parse(fs.readFileSync(path.join(root, 'data/current_issue.json'), 'utf8'));
  const sources = new Map();
  const articles = previous.articles.map((old, slot) => {
    const item = draft.articles.find(a => a.slot === slot);
    const base = Object.fromEntries(['id', 'articleNo', 'sectionId', 'sectionTitle', 'pageRange', 'startPage', 'endPage'].map(k => [k, old[k]]));
    if (!item) return { ...base, status: 'pending', title: '취재·편집 대기', subtitle: '', lead: '', bodyParagraphs: [], author: '', sourceUrl: '' };
    const source = JSON.parse(fs.readFileSync(path.join(root, `data/research/${item.sourceId}.json`), 'utf8'));
    if (source.channelId !== 'UCgeOlLcX6PReHdWImEnUVTg' || !source.segments?.length) throw new Error('실제 스픽스 자막 자료가 필요합니다.');
    if (!item.evidence?.length || !item.bodyParagraphs?.length || !item.verificationNote) throw new Error('본문·근거 구간·검증 범위가 필요합니다.');
    for (const range of item.evidence) {
      if (!(range.start >= 0 && range.end > range.start && range.end <= source.duration) || !source.segments.some(s => s.start >= range.start && s.start <= range.end)) throw new Error('근거 시간 범위가 자막과 일치하지 않습니다.');
    }
    const { segments, ...metadata } = source;
    sources.set(source.id, metadata);
    const start = item.evidence[0].start;
    const sourceUrl = `https://www.youtube.com/watch?v=${source.id}&t=${start}s`;
    const visual = { url: source.thumbnail, topic: item.title, caption: '원본 방송 썸네일 · 스픽스', credit: source.channel, videoId: source.id, videoUrl: sourceUrl };
    return { ...base, ...item, status: 'ready', author: '주간 스픽스 · AI 편집', sourceType: 'YouTube 한국어 자막 분석', sourceUrl, videoUrl: sourceUrl, sourceTitle: source.title, visual, videoTimestamp: `${Math.floor(start / 60)}:${String(start % 60).padStart(2, '0')}` };
  });
  const ready = articles.filter(a => a.status === 'ready');
  if (!ready.length) throw new Error('발행할 실제 방송 기사가 없습니다.');
  const notice = `실제 방송 ${sources.size}편에서 작성한 기사 ${ready.length}건 · 50페이지 편집 중. 자동 자막 기반이며 각 기사의 검증 범위를 확인하세요.`;
  const pages = Array.from({ length: 50 }, (_, index) => {
    const number = index + 1;
    const article = articles.find(a => number >= a.startPage && number <= a.endPage);
    if (number <= 4) {
      const content = [
        ['주간 스픽스', [draft.issueNumber, notice, ...ready.map(a => a.title)]],
        ['편집자의 말', ['스픽스 실제 방송의 한국어 자막을 수집하고 내장 에이전트가 논점을 분석해 원고를 작성했습니다.', '분석하지 않은 지면은 편집 대기로 표시합니다. 출연자의 주장은 사실 확인이 끝난 보도와 구분하며, 자동 자막의 한계와 추가 검증 사항을 기사마다 표시합니다.']],
        ['이번 편집본 목차', ready.map(a => `${a.pageRange} · ${a.title}`)],
        ['판권 및 출처', [previous.meta.publisher.name, previous.meta.publisher.address, previous.meta.publisher.phone, previous.meta.publisher.issn, previous.meta.publisher.isbn, '원천 미디어: 스픽스 유튜브 @SPEAKS_TV · speaks.kr', notice]]
      ][index];
      return { pageNumber:number, layoutType:'agent-page', sectionName:'Cover & Intro', title:content[0], paragraphs:content[1] };
    }
    if (article?.status !== 'ready') return { pageNumber:number, layoutType:'agent-page', sectionName:article?.sectionTitle || '', title:'취재·편집 대기', paragraphs:['이 지면은 실제 방송·기사 분석을 마친 뒤 채웁니다. 검증되지 않은 샘플 원고는 게재하지 않습니다.'] };
    const pageOffset = number - article.startPage;
    const count = article.endPage - article.startPage + 1;
    const paragraphs = article.bodyParagraphs.filter((_, i) => Math.floor(i * count / article.bodyParagraphs.length) === pageOffset);
    if (pageOffset === 0) paragraphs.unshift(article.lead);
    return { pageNumber:number, layoutType:'agent-page', sectionName:article.sectionTitle, title:article.title, subtitle:article.subtitle, paragraphs, sourceUrl:article.sourceUrl, evidence:article.evidence, verificationNote:article.verificationNote, visual:pageOffset === 0 ? article.visual : null };
  });
  const issue = { meta: { ...previous.meta, mode:'agent-edited', notice, issueNumber:draft.issueNumber, publishDate:draft.publishDate, compiledAt:new Date().toISOString(), readyArticles:ready.length, sourceCount:sources.size }, articles, pages, sectionPlan:previous.sectionPlan, channelStats:{name:'스픽스',url:'https://www.youtube.com/@SPEAKS_TV'}, youtubeTopClips:[], speaksWebArticles:[], infographics:{}, sources:[...sources.values()] };
  validateIssue(issue);
  writeIssueAtomic(path.join(root, 'data/current_issue.json'), issue);
  fs.writeFileSync(path.join(root, 'data/01_research_dossier.md'), '# 실제 방송 분석 기록\n\n' + ready.map(a => `## ${a.title}\n\n원본: ${a.sourceUrl}\n\n${a.evidence.map(e => `- ${e.start}~${e.end}초: ${e.label}`).join('\n')}\n\n${a.verificationNote}`).join('\n\n'));
  fs.writeFileSync(path.join(root, 'data/02_issue_blueprint.json'), JSON.stringify({ mode:'agent-edited', totalPages:50, readyArticles:ready.length, sectionPlan:issue.sectionPlan, pages:pages.map(p => ({pageNumber:p.pageNumber,title:p.title})) }, null, 2));
  return { ok:true, mode:'agent-edited', issueData:issue, stepsLog:[{step:4,status:'PARTIAL',detail:notice}] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(publishAgentIssue().issueData.meta.notice); } catch(err) { console.error(err.message); process.exitCode=1; }
}
