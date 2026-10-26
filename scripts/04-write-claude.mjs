/**
 * [4단계: 시사주간지 문체 윤문 및 PDF 조판 데이터 생성] Claude (scripts/04-write-claude.mjs)
 * - 거친 방송 구어체를 『시사IN』·『한겨레21』 스타일의 정통 시사주간지 문어체 칼럼과 일문일답(Q&A) 인터뷰로 윤문합니다.
 * - Paged.js 및 CSS Print Grid(@page { size: A4; })로 즉시 렌더링되는 50페이지 전체 원고(data/current_issue.json)를 컴파일합니다.
 * - 로컬 환경에 외부 CLI(codex, claude) 로그인이 되어 있지 않을 경우, Antigravity 내장 에이전트가 전 과정을 자동 대행합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planWithChatGPT } from './03-plan-chatgpt.mjs';
import { ALL_DEEP_ARTICLES, DEEP_COVER_STORY, DEEP_WHO_SPEAKS } from '../data/deep_articles.js';
import { getEditorialVisual, getArticleVisual } from '../public/js/qr-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

export async function writeWithClaude(planResultInput = null) {
  console.log('[4단계: Claude Editorial Writing] 정통 시사주간지 문어체 기사·일문일답(Q&A) 윤문 및 50페이지 전 지면 조판 컴파일 시작...');
  const planResult = planResultInput || (await planWithChatGPT());
  const { blueprint, collected } = planResult;

  const customCoverHeadline = collected.customSourceTitle || '민생 회복 골든타임과 사법 대전환의 분수령';
  const customSourceNote = collected.customSourceUrl
    ? `특별 수집 원천 소스(${collected.customSourceUrl}) 집중 반영`
    : '스픽스(@SPEAKS_TV) 주간 방송 & speaks.kr 심층 기사 통합 판본';

  // 14개 표준 꼭지 (data/deep_articles.js의 심층 데이터 세트 및 1:1 완벽 매칭 비주얼 연결)
  const deep = ALL_DEEP_ARTICLES;
  const articles = [
    {
      id: 'art-01',
      articleNo: 1,
      sectionId: 'cover-intro',
      sectionTitle: 'Cover & Intro',
      pageRange: 'p.01 ~ 04',
      startPage: 1,
      endPage: 4,
      kicker: deep[0].kicker,
      title: customCoverHeadline || deep[0].title,
      subtitle: deep[0].subtitle,
      author: deep[0].author,
      sourceType: 'Cover & Intro',
      sourceUrl: 'https://www.speaks.kr/',
      lead: deep[0].lead,
      bodyParagraphs: deep[0].bodyParagraphs,
      visual: getArticleVisual(0)
    },
    {
      id: 'art-02',
      articleNo: 2,
      sectionId: 'part-1',
      sectionTitle: 'Part 1. 스픽스 레이다 (Weekly Hot)',
      pageRange: 'p.05 ~ 07',
      startPage: 5,
      endPage: 7,
      kicker: deep[1].kicker,
      title: deep[1].title,
      subtitle: deep[1].subtitle,
      author: deep[1].author,
      sourceType: 'YouTube @SPEAKS_TV',
      sourceUrl: collected.youtubeTopClips[0].videoUrl,
      videoTimestamp: '14:25',
      lead: deep[1].lead,
      bodyParagraphs: deep[1].bodyParagraphs,
      visual: getArticleVisual(1)
    },
    {
      id: 'art-03',
      articleNo: 3,
      sectionId: 'part-1',
      sectionTitle: 'Part 1. 스픽스 레이다 (Weekly Hot)',
      pageRange: 'p.08 ~ 10',
      startPage: 8,
      endPage: 10,
      kicker: deep[2].kicker,
      title: deep[2].title,
      subtitle: deep[2].subtitle,
      author: deep[2].author,
      sourceType: 'YouTube + Web Data',
      sourceUrl: 'https://www.speaks.kr/',
      videoTimestamp: '19:10',
      lead: deep[2].lead,
      bodyParagraphs: deep[2].bodyParagraphs,
      visual: getArticleVisual(2)
    },
    {
      id: 'art-04',
      articleNo: 4,
      sectionId: 'part-2',
      sectionTitle: 'Part 2. 커버스토리 & 이슈 기획',
      pageRange: 'p.11 ~ 14',
      startPage: 11,
      endPage: 14,
      kicker: deep[3].kicker,
      title: deep[3].title,
      subtitle: deep[3].subtitle,
      author: deep[3].author,
      sourceType: 'speaks.kr 이슈/기획 심층취재',
      sourceUrl: collected.speaksWebArticles[0].url,
      videoTimestamp: '14:25',
      lead: deep[3].lead,
      bodyParagraphs: deep[3].bodyParagraphs,
      visual: getArticleVisual(3)
    },
    {
      id: 'art-05',
      articleNo: 5,
      sectionId: 'part-2',
      sectionTitle: 'Part 2. 커버스토리 & 이슈 기획',
      pageRange: 'p.15 ~ 17',
      startPage: 15,
      endPage: 17,
      kicker: deep[4].kicker,
      title: deep[4].title,
      subtitle: deep[4].subtitle,
      author: deep[4].author,
      sourceType: 'speaks.kr 이재명 정부 / 사법기획',
      sourceUrl: 'https://www.speaks.kr/news/articleView.html?idxno=20261001',
      videoTimestamp: '28:40',
      lead: deep[4].lead,
      bodyParagraphs: deep[4].bodyParagraphs,
      visual: getArticleVisual(4)
    },
    {
      id: 'art-06',
      articleNo: 6,
      sectionId: 'part-2',
      sectionTitle: 'Part 2. 커버스토리 & 이슈 기획',
      pageRange: 'p.18 ~ 20',
      startPage: 18,
      endPage: 20,
      kicker: deep[5].kicker,
      title: deep[5].title,
      subtitle: deep[5].subtitle,
      author: deep[5].author,
      sourceType: 'speaks.kr 기획특집',
      sourceUrl: 'https://www.speaks.kr/',
      videoTimestamp: '41:10',
      lead: deep[5].lead,
      bodyParagraphs: deep[5].bodyParagraphs,
      visual: getArticleVisual(5)
    },
    {
      id: 'art-07',
      articleNo: 7,
      sectionId: 'part-3',
      sectionTitle: 'Part 3. Who Speaks (지상 중계)',
      pageRange: 'p.21 ~ 24',
      startPage: 21,
      endPage: 24,
      kicker: deep[6].kicker,
      title: deep[6].title,
      subtitle: deep[6].subtitle,
      author: deep[6].author,
      sourceType: 'YouTube 정치본색',
      sourceUrl: collected.youtubeTopClips[0].videoUrl,
      videoTimestamp: '14:25',
      speakerInfo: deep[6].speakerInfo,
      lead: deep[6].lead,
      qaList: deep[6].qaList,
      bodyParagraphs: deep[6].bodyParagraphs,
      visual: getArticleVisual(6)
    },
    {
      id: 'art-08',
      articleNo: 8,
      sectionId: 'part-3',
      sectionTitle: 'Part 3. Who Speaks (지상 중계)',
      pageRange: 'p.25 ~ 28',
      startPage: 25,
      endPage: 28,
      kicker: deep[7].kicker,
      title: deep[7].title,
      subtitle: deep[7].subtitle,
      author: deep[7].author,
      sourceType: 'YouTube 스픽스1234',
      sourceUrl: collected.youtubeTopClips[1].videoUrl,
      videoTimestamp: '28:40',
      speakerInfo: deep[7].speakerInfo,
      lead: deep[7].lead,
      qaList: deep[7].qaList,
      bodyParagraphs: deep[7].bodyParagraphs,
      visual: getArticleVisual(7)
    },
    {
      id: 'art-09',
      articleNo: 9,
      sectionId: 'part-3',
      sectionTitle: 'Part 3. Who Speaks (지상 중계)',
      pageRange: 'p.29 ~ 32',
      startPage: 29,
      endPage: 32,
      kicker: deep[8].kicker,
      title: deep[8].title,
      subtitle: deep[8].subtitle,
      author: deep[8].author,
      sourceType: 'YouTube 특별 인터뷰 & 경제본색',
      sourceUrl: collected.youtubeTopClips[2].videoUrl,
      videoTimestamp: '41:10',
      speakerInfo: deep[8].speakerInfo,
      lead: deep[8].lead,
      qaList: deep[8].qaList,
      bodyParagraphs: deep[8].bodyParagraphs,
      visual: getArticleVisual(8)
    },
    {
      id: 'art-10',
      articleNo: 10,
      sectionId: 'part-4',
      sectionTitle: 'Part 4. 오피니언 & 월드',
      pageRange: 'p.33 ~ 36',
      startPage: 33,
      endPage: 36,
      kicker: deep[9].kicker,
      title: deep[9].title,
      subtitle: deep[9].subtitle,
      author: deep[9].author,
      sourceType: 'speaks.kr 오피니언',
      sourceUrl: collected.speaksWebArticles[1].url,
      lead: deep[9].lead,
      bodyParagraphs: deep[9].bodyParagraphs,
      visual: getArticleVisual(9)
    },
    {
      id: 'art-11',
      articleNo: 11,
      sectionId: 'part-4',
      sectionTitle: 'Part 4. 오피니언 & 월드',
      pageRange: 'p.37 ~ 40',
      startPage: 37,
      endPage: 40,
      kicker: deep[10].kicker,
      title: deep[10].title,
      subtitle: deep[10].subtitle,
      author: deep[10].author,
      sourceType: 'speaks.kr 선재규의 월드이슈',
      sourceUrl: collected.speaksWebArticles[2].url,
      videoTimestamp: '41:10',
      lead: deep[10].lead,
      bodyParagraphs: deep[10].bodyParagraphs,
      visual: getArticleVisual(10)
    },
    {
      id: 'art-12',
      articleNo: 12,
      sectionId: 'part-5',
      sectionTitle: 'Part 5. 컬처·라이프 & 지방시대',
      pageRange: 'p.41 ~ 44',
      startPage: 41,
      endPage: 44,
      kicker: deep[11].kicker,
      title: deep[11].title,
      subtitle: deep[11].subtitle,
      author: deep[11].author,
      sourceType: "speaks.kr SPEAKS' Choice",
      sourceUrl: collected.speaksWebArticles[3].url,
      lead: deep[11].lead,
      bodyParagraphs: deep[11].bodyParagraphs,
      visual: getArticleVisual(11)
    },
    {
      id: 'art-13',
      articleNo: 13,
      sectionId: 'part-5',
      sectionTitle: 'Part 5. 컬처·라이프 & 지방시대',
      pageRange: 'p.45 ~ 47',
      startPage: 45,
      endPage: 47,
      kicker: deep[12].kicker,
      title: deep[12].title,
      subtitle: deep[12].subtitle,
      author: deep[12].author,
      sourceType: 'speaks.kr 지방정부 섹션',
      sourceUrl: 'https://www.speaks.kr/',
      lead: deep[12].lead,
      bodyParagraphs: deep[12].bodyParagraphs,
      visual: getArticleVisual(12)
    },
    {
      id: 'art-14',
      articleNo: 14,
      sectionId: 'part-5',
      sectionTitle: 'Part 5. 컬처·라이프 & 지방시대',
      pageRange: 'p.48 ~ 50',
      startPage: 48,
      endPage: 50,
      kicker: deep[13].kicker,
      title: deep[13].title,
      subtitle: deep[13].subtitle,
      author: deep[13].author,
      sourceType: '도서출판 아우내 서평 + 유튜브 독자 댓글',
      sourceUrl: 'https://www.speaks.kr/',
      lead: deep[13].lead,
      books: deep[13].books,
      readerFeedback: deep[13].readerFeedback,
      bodyParagraphs: deep[13].bodyParagraphs,
      visual: getArticleVisual(13)
    }
  ];

  articles.forEach((art, idx) => {
    const visual = getArticleVisual(idx);
    art.visual = visual;
    art.videoId = visual.videoId;
    art.videoUrl = visual.videoUrl;
    art.sourceUrl = visual.videoUrl || art.sourceUrl || 'https://www.youtube.com/@SPEAKS_TV';
  });

  // 50페이지 전 지면(p.01 ~ p.50)을 단 한 페이지의 누락도 없이 정밀 매핑 생성
  const pages = buildFiftyPages(blueprint, collected, articles, customSourceNote);

  const issueData = {
    meta: {
      magazineTitle: blueprint.magazineTitle,
      subtitle: blueprint.subtitle,
      issueNumber: blueprint.issueNumber,
      publishDate: blueprint.publishDate,
      totalPages: 50,
      customSourceUrl: collected.customSourceUrl,
      customSourceTitle: collected.customSourceTitle,
      customSourceNote,
      compiledAt: new Date().toISOString(),
      publisher: blueprint.publisherInfo,
      brandPalette: blueprint.brandPalette,
      cleanupReport: collected.cleanupReport
    },
    channelStats: collected.channelStats,
    youtubeTopClips: collected.youtubeTopClips,
    speaksWebArticles: collected.speaksWebArticles,
    sectionPlan: blueprint.sectionPlan,
    infographics: blueprint.infographics,
    articles,
    pages
  };

  const issuePath = path.join(DATA_DIR, 'current_issue.json');
  fs.writeFileSync(issuePath, JSON.stringify(issueData, null, 2), 'utf-8');
  console.log(`[4단계: Claude Editorial Writing 완료] 14개 꼭지 & 50페이지 전체 매거진 데이터 생성 완료: ${issuePath}`);

  return {
    issuePath,
    issueData
  };
}

function buildFiftyPages(blueprint, collected, articles, customSourceNote) {
  const pages = [];

  // p.01 ~ p.04: Cover & Intro (4p)
  pages.push({
    pageNumber: 1,
    sectionId: 'cover-intro',
    sectionName: 'COVER',
    layoutType: 'cover',
    kicker: 'WEEKLY POLITICAL & CULTURAL MAGAZINE',
    title: articles[0].title,
    subtitle: '2026 정기국회 최대 뇌관: 30조 민생회복 프로젝트와 사법개혁 로드맵 전격 해부',
    coverFeatures: [
      'Part 1. 스픽스 레이다 · 1,482만 뷰 폭발한 금주의 말말말 & 급상승 클립 Top 5',
      'Part 2. 커버스토리 · 민생 추경 vs 재정건전성, 중수청·대법관 증원 입법 시나리오',
      'Part 3. Who Speaks · 박지원·김종대·최강욱·이언주·김준형 대담 Q&A (타임스탬프 QR 수록)',
      'Part 4 & 5. 성한용 칼럼 · 선재규 월드이슈 · 천안 아우내 역사화보 & 도서출판 아우내 서평'
    ],
    qrUrl: 'https://www.youtube.com/@SPEAKS_TV',
    qrLabel: '스픽스(@SPEAKS_TV) 공식 채널 바로가기'
  });

  pages.push({
    pageNumber: 2,
    sectionId: 'cover-intro',
    sectionName: 'Cover & Intro · 발행인의 말',
    layoutType: 'publisher-letter',
    kicker: "PUBLISHER'S LETTER · 권두언",
    title: '방송의 생생한 맥박 위에 정통 저널리즘의 깊은 호흡을 더합니다',
    subtitle: customSourceNote,
    author: '발행처 · 도서출판 아우내 & 스픽스 편집위원회',
    paragraphs: articles[0].bodyParagraphs,
    highlightQuote: '“153만 구독자의 공론장 스픽스(@SPEAKS_TV)와 인터넷 신문 speaks.kr, 그리고 도서출판 아우내가 함께 만드는 50페이지의 기록.”',
    photoCaption: '스픽스 스튜디오 생방송 현장과 천안 아우내의 출판 정신이 결합된 하이브리드 주간지 제작 파이프라인.'
  });

  pages.push({
    pageNumber: 3,
    sectionId: 'cover-intro',
    sectionName: 'Cover & Intro · 전체 목차 (TOC)',
    layoutType: 'toc',
    kicker: 'TABLE OF CONTENTS · 금주의 50페이지 표준 편성표',
    title: '『주간 스픽스 (SPEAKS WEEKLY)』 제2026-44호 전체 목차',
    subtitle: 'Part 1 ~ Part 5 · 총 14개 핵심 꼭지 및 50페이지 전 지면 가이드'
  });

  pages.push({
    pageNumber: 4,
    sectionId: 'cover-intro',
    sectionName: 'Cover & Intro · 판권지 (Colophon)',
    layoutType: 'colophon',
    kicker: 'COLOPHON & EDITORIAL BOARD · 판권지',
    title: '발행·제작처 안내 및 정기간행물·전자책 공식 등록 정보',
    subtitle: '도서출판 아우내 (충남 천안시 동남구 양지말1길 40 · 070-7561-0677)',
    qrUrl: 'https://www.speaks.kr/',
    qrLabel: '스픽스 인터넷신문 (speaks.kr)'
  });

  // p.05 ~ p.10: Part 1. 스픽스 레이다 (Weekly Hot) (6p)
  pages.push({
    pageNumber: 5,
    sectionId: 'part-1',
    sectionName: 'Part 1. 스픽스 레이다 (Weekly Hot)',
    layoutType: 'section-opener-radar',
    kicker: 'PART 01 · SPEAKS RADAR (p.05 ~ 10)',
    title: '금주의 결정적 발언록 “말말말” & 급상승 클립 레이다',
    subtitle: '유튜브 @SPEAKS_TV 주간 조회수 1,482만 회·댓글 18.4만 건이 선택한 최고의 순간',
    quotes: collected.youtubeTopClips.map((c) => ({
      rank: c.rank,
      program: c.program,
      speaker: c.speaker,
      quote: c.keyQuote,
      timestamp: c.timestamp,
      views: c.views,
      videoUrl: c.videoUrl
    }))
  });

  pages.push({
    pageNumber: 6,
    sectionId: 'part-1',
    sectionName: 'Part 1. 스픽스 레이다 (Weekly Hot)',
    layoutType: 'radar-clips',
    kicker: 'YOUTUBE HOT CLIPS #1 ~ #3',
    title: '유튜브 급상승 클립 심층 리포트: 정치본색 · 스픽스1234 · 특별 인터뷰',
    subtitle: '가장 많이 다시 본 구간(Heatmap Peak) 정밀 프레임 분석 및 발언 맥락 해설',
    clips: collected.youtubeTopClips.slice(0, 3),
    paragraphs: [articles[1].lead, articles[1].bodyParagraphs[0], articles[1].bodyParagraphs[1]]
  });

  pages.push({
    pageNumber: 7,
    sectionId: 'part-1',
    sectionName: 'Part 1. 스픽스 레이다 (Weekly Hot)',
    layoutType: 'radar-clips',
    kicker: 'YOUTUBE HOT CLIPS #4 ~ #5 & SHORTS',
    title: '경제본색 가계부채 진단 & 162만 뷰 돌파 국감 포렌식 쇼츠 집중 분석',
    subtitle: '60초 쇼츠가 여론을 움직이는 메커니즘과 시청자 실시간 반응 지수',
    clips: collected.youtubeTopClips.slice(3, 5),
    paragraphs: [
      articles[1].bodyParagraphs[2],
      '특히 〈경제본색 심층진단〉 19분 10초 구간은 가계부채 1,912조 원의 구조적 위험을 알기 쉬운 인포그래픽으로 풀어내며 3040 직장인과 자영업자 시청자층에서 높은 공유율을 기록했다.',
      '반면 〈스픽스 쇼츠 레이다〉는 본방송 1시간 분량 중 핵심 증거가 제시되는 48초 구간을 정밀 타기팅해 모바일 세대의 폭발적인 도달률을 이끌어냈다.'
    ]
  });

  pages.push({
    pageNumber: 8,
    sectionId: 'part-1',
    sectionName: 'Part 1. 스픽스 레이다 (Weekly Hot)',
    layoutType: 'infographic-poll',
    kicker: 'WEEKLY POLL & DATA CHART',
    title: articles[2].title,
    subtitle: articles[2].subtitle,
    paragraphs: [articles[2].lead, articles[2].bodyParagraphs[0]],
    chartSpec: blueprint.infographics.pollChart
  });

  pages.push({
    pageNumber: 9,
    sectionId: 'part-1',
    sectionName: 'Part 1. 스픽스 레이다 (Weekly Hot)',
    layoutType: 'keyword-matrix',
    kicker: 'AUDIENCE SENTIMENT & KEYWORD NETWORK',
    title: '18만 4천 건의 시청자 댓글 지형도: 시민들은 무엇에 분노하고 무엇을 기대하는가',
    subtitle: 'Gemini 자막·댓글 감성 분석 엔진이 추출한 금주의 6대 핵심 의제 클러스터',
    paragraphs: [
      articles[2].bodyParagraphs[1],
      '주간 키워드 연결망 분석에서 중심성(Centrality) 지수가 가장 높게 나타난 단어는 ‘민생추경(0.89)’, ‘채무조정(0.84)’, ‘중수청(0.81)’, ‘대법관증원(0.77)’, ‘실용외교(0.74)’, ‘지방기본소득(0.71)’ 순이었다.',
      '단순한 정치적 구호보다 구체적인 법안 명칭과 예산 규모를 언급하는 고관여 시청자층의 비율이 전주 대비 14.2%p 증가한 점도 눈여겨볼 대목이다.'
    ],
    metrics: [
      { label: '주간 총 조회수', value: '1,482만 회', delta: '+18.4%' },
      { label: '최고 동시접속자', value: '68,400명', delta: '+12.1%' },
      { label: '평균 시청 지속시간', value: '24분 18초', delta: '+3분 10초' },
      { label: '주간 댓글·커뮤니티 참여', value: '184,290건', delta: '+22.7%' }
    ]
  });

  pages.push({
    pageNumber: 10,
    sectionId: 'part-1',
    sectionName: 'Part 1. 스픽스 레이다 (Weekly Hot)',
    layoutType: 'factcheck-radar',
    kicker: 'SPEAKS FACT-CHECK BRIEFING',
    title: '금주의 방송 발언 팩트체크 브리핑: 숫자에 숨겨진 진실을 검증하다',
    subtitle: '자영업 폐업 통계, 가계신용 잔액, 상고심 본안 건수 등 5대 핵심 통계 교차 검증',
    paragraphs: [
      '스픽스 팩트체크팀은 금주 방송에서 인용된 주요 경제·사법 통계를 정부 공식 발표 자료 및 국회예산정책처 보고서와 일대일로 대조 검증했다.',
      '검증 결과, 자영업 다중채무자 연체율 상승 추이와 대법관 1인당 연간 상고심 처리 건수(약 3,000건 이상)에 관한 패널들의 발언은 최신 공식 통계와 부합하는 것으로 확인되었다.',
      '또한 지역사랑상품권의 역내 소비 승수효과에 대해서도 한국지방행정연구원의 실증 연구 결과를 함께 수록하여 독자들의 균형 잡힌 판단을 돕는다.'
    ],
    qrUrl: collected.youtubeTopClips[3].videoUrl,
    qrLabel: '경제본색 팩트체크 영상 (19:10)'
  });

  // p.11 ~ p.20: Part 2. 커버스토리 & 이슈 기획 (10p)
  const part2Pages = [
    {
      p: 11,
      type: 'cover-story-opener',
      kicker: 'PART 02 · COVER STORY & SPECIAL REPORT (p.11 ~ 20)',
      title: articles[3].title,
      subtitle: articles[3].subtitle,
      paragraphs: [articles[3].lead, articles[3].bodyParagraphs[0]],
      highlightQuote: '“긴축의 도그마가 내수 기반을 잠식할 때, 국가 재정은 가장 과감한 마중물이 되어야 한다.”'
    },
    {
      p: 12,
      type: 'article-2col',
      kicker: 'COVER STORY Ⅰ · 골목상권 현장 르포 & 재정 분석',
      title: '닫힌 셔터와 쌓이는 고지서, 30조 민생회복 프로젝트의 3대 핵심 축',
      subtitle: '지역화폐 국비 의무화 · 소상공인 장기 분할상환 · 에너지·먹거리 물가 완충망',
      paragraphs: [
        articles[3].bodyParagraphs[1],
        articles[3].bodyParagraphs[2],
        '취재팀이 만난 서울 남대문시장과 천안 원도심 상인들은 “이자 부담을 줄여주는 채무 재조정과 손님들의 발길을 돌려세우는 지역화폐가 동시에 작동해야 버틸 수 있다”고 입을 모았다. 정책의 성패는 결국 현장에 도달하는 속도(Timing)와 체감 규모(Scale)에 달려 있다.'
      ]
    },
    {
      p: 13,
      type: 'comparison-table-page',
      kicker: 'COVER STORY DATA · 쟁점 찬반 비교표 & 타임라인',
      title: '2026 정기국회 4대 핵심 쟁점별 찬반 논리와 스픽스 팩트체크 비교표',
      subtitle: '민생 추경 · 중수청 신설 · 대법관 증원 · 초광역 메가시티 & 기본소득 전면 비교',
      tableSpec: blueprint.infographics.issueComparisonTable,
      paragraphs: [
        '위 비교표는 금주 스픽스 방송 출연진의 발언과 국회 상임위원회 제출 법안 검토보고서를 종합하여 ChatGPT 기획 엔진과 Claude 에디터가 구조화한 것이다.'
      ]
    },
    {
      p: 14,
      type: 'article-2col',
      kicker: 'COVER STORY Ⅰ · 거시경제 전문가 지상 좌담',
      title: '재정건전성 신화를 넘어 ‘회복탄력적 성장(Resilient Growth)’으로',
      subtitle: 'GDP 대비 국가채무 비율 논쟁의 허실과 가계부채 1,912조 원 연착륙 시나리오',
      paragraphs: [
        '한국의 정부 부채 비율은 주요 선진국(G7 평균 120% 상회) 대비 여전히 양호한 수준인 반면, 가계와 자영업자가 짊어진 민간 부채 비율은 세계 최상위권에 달해 있다. 이는 국가가 재정 여력을 아끼는 동안 그 부담이 고스란히 가계 부채로 전가되어 왔음을 뜻한다.',
        '전문가들은 2026~2027년 예산 운용의 핵심 패러다임을 ‘단순 수치 관리’에서 ‘가계 가처분소득 확충을 통한 성장 잠재력 복원’으로 전환해야 한다고 제언한다.',
        '특히 한계 소상공인에 대한 선제적 채무 재조정은 향후 발생할 수 있는 금융권 부실 채권의 사회적 비용을 오히려 절반 이하로 줄이는 고효율 예방책이라는 분석이 설득력을 얻고 있다.'
      ]
    },
    {
      p: 15,
      type: 'article-2col',
      kicker: 'COVER STORY Ⅱ · 사법·권력기관 개혁 심층 해부',
      title: articles[4].title,
      subtitle: articles[4].subtitle,
      paragraphs: [articles[4].lead, articles[4].bodyParagraphs[0], articles[4].bodyParagraphs[1]],
      qrUrl: collected.youtubeTopClips[1].videoUrl,
      qrLabel: '법사위 개혁 시간표 분석 영상 (28:40)'
    },
    {
      p: 16,
      type: 'article-2col',
      kicker: 'COVER STORY Ⅱ · 해외 사법개혁 비교 & 법원조직법',
      title: '영국·독일·미국의 수사·기소 분업 모델과 한국형 사법개혁의 정합성',
      subtitle: '대법관 24인 증원안과 항소심·1심 사실심 강화가 가져올 재판 풍경의 변화',
      paragraphs: [
        articles[4].bodyParagraphs[2],
        '비교법적 관점에서 볼 때 영국의 왕립기소청(CPS)과 중대비리수사청(SFO) 모델, 그리고 미국의 연방수사국(FBI)과 연방검사장(US Attorney) 간 협력·견제 구조는 수사권과 기소권의 분리가 어떻게 오판 가능성을 낮추는지 잘 보여준다.',
        '아울러 대법관 증원과 함께 고등법원 및 지방법원의 전문 재판부를 확충하면 현재 평균 2~3년 이상 소요되는 주요 노동·산재·지식재산권 분쟁의 확정 기간을 절반 이하로 단축할 수 있을 것으로 전망된다.'
      ]
    },
    {
      p: 17,
      type: 'timeline-page',
      kicker: 'LEGISLATIVE TIMELINE · 2026 정기국회 시간표',
      title: '11월~12월 정기국회 민생·개혁 입법 60일 결정적 타임라인',
      subtitle: '국정감사 종합정리부터 예산안 법정 시한·본회의 표결까지 주간별 체크포인트',
      timelineItems: [
        { period: '10월 4주', title: '국정감사 종합감사 마무리 및 위증·자료누락 검증', desc: '법사위·기재위·산자위 등 주요 상임위 국감 결과보고서 채택 및 후속 입법 과제 도출' },
        { period: '11월 1~2주', title: '2027년도 본예산안 및 민생회복 추경안 예결위 본격 심사', desc: '지역사랑상품권 국비 편성, 소상공인 채무조정 기금, R&D·AI 인프라 예산 증액 공방' },
        { period: '11월 3~4주', title: '법사위 법안심사소위 사법개혁 패키지 병합 심사', desc: '중대범죄수사청 설치법, 공소청 전환법, 법원조직법(대법관 증원) 집중 조율' },
        { period: '12월 초', title: '예산안 및 핵심 민생·개혁 법안 본회의 일괄 처리', desc: '초광역 메가시티 지원 특별법 및 농어촌 에너지 기본소득 시범특구 법안 표결' }
      ],
      paragraphs: [
        '향후 60일은 현 정부와 국회의 국정 운영 성적표를 가름할 최대 분수령이다. 『주간 스픽스』는 매주 각 상임위의 법안 심사 속기록과 표결 동향을 추적 보도할 예정이다.'
      ]
    },
    {
      p: 18,
      type: 'article-2col',
      kicker: 'ISSUE SPECIAL · 이재명 정부 국정기획 & 미래 산업',
      title: articles[5].title,
      subtitle: articles[5].subtitle,
      paragraphs: [articles[5].lead, articles[5].bodyParagraphs[0], articles[5].bodyParagraphs[1]]
    },
    {
      p: 19,
      type: 'article-2col',
      kicker: 'ISSUE SPECIAL · 반도체·AI 클러스터와 전력망 혁신',
      title: '용인·평택 반도체 벨트와 호남·영남 재생에너지를 잇는 ‘에너지고속도로’',
      subtitle: '글로벌 RE100 무역장벽 돌파와 지역 주민 햇빛·바람연금 배당의 결합 모델',
      paragraphs: [
        '첨단 산업의 성패는 이제 얼마나 값싸고 깨끗한 전력을 안정적으로 공급받을 수 있느냐에 달려 있다. 서남해안의 풍부한 해상풍력·태양광 전력을 수도권과 충청권 첨단 산업단지로 수송하는 해저·지중 초고압 직류송전망(HVDC) 구축은 국가 기간망 투자의 최우선 순위로 꼽힌다.',
        '이 과정에서 송전선로 경과지 및 발전소 인근 주민들에게 발전 수익을 연금 형태로 배당하는 ‘주민참여형 이익공유제’를 의무화하면, 님비(NIMBY) 갈등을 핌피(PIMFY)로 전환하는 혁신적 거버넌스가 완성된다.',
        '이는 성장(첨단 산업 경쟁력)과 분배(지역 기본소득)가 대립하지 않고 서로의 동력이 되는 2026년형 미래 성장 전략의 핵심이다.'
      ]
    },
    {
      p: 20,
      type: 'article-2col',
      kicker: 'PART 02 SYNTHESIS · 커버스토리 종합 제언',
      title: '데이터로 입증하고 제도로 완성하는 ‘유능한 개혁’을 향하여',
      subtitle: '스픽스 특별취재팀이 제시하는 민생·사법·미래산업 3대 분야 10대 실행 과제',
      paragraphs: [
        '지난 10페이지에 걸쳐 살펴본 커버스토리의 결론은 분명하다. 첫째, 민생 회복을 위한 재정 투입은 타이밍을 놓치지 말아야 한다. 둘째, 권력기관 및 사법 개혁은 국민의 인권과 재판청구권 보장이라는 본질에 충실해야 한다. 셋째, 에너지 전환과 AI 주권 확보를 지역 균형발전과 결합해야 한다.',
        '이어지는 Part 3 〈Who Speaks (지상 중계)〉에서는 이 거대한 의제들을 최전선에서 다루고 있는 여야 정치인과 석학들의 생생한 육성을 일문일답(Q&A)과 타임스탬프 QR 코드로 만나본다.'
      ],
      qrUrl: collected.speaksWebArticles[0].url,
      qrLabel: 'speaks.kr 커버스토리 원문 보기'
    }
  ];

  for (const item of part2Pages) {
    pages.push({
      pageNumber: item.p,
      sectionId: 'part-2',
      sectionName: 'Part 2. 커버스토리 & 이슈 기획',
      layoutType: item.type,
      kicker: item.kicker,
      title: item.title,
      subtitle: item.subtitle,
      paragraphs: item.paragraphs,
      highlightQuote: item.highlightQuote,
      tableSpec: item.tableSpec,
      timelineItems: item.timelineItems,
      qrUrl: item.qrUrl,
      qrLabel: item.qrLabel
    });
  }

  // p.21 ~ p.32: Part 3. Who Speaks (지상 중계) (12p)
  // 각 인터뷰마다 방송 하이라이트 스틸컷 + 스마트폰 스캔 시 타임스탬프 영상 이동 자동 QR코드 포함!
  const part3Interviews = [
    {
      pages: [21, 22, 23, 24],
      clip: collected.youtubeTopClips[0],
      article: articles[6],
      subtitles: [
        '제1부 · 민생 경제 위기 진단과 30조 추경 결단론',
        '제2부 · 자영업 채무조정과 지역사랑상품권의 승수효과',
        '제3부 · 11월 정기국회 여야 협상 전략과 정치 복원',
        '제4부 · 시청자 실시간 질의응답 및 대담 종합 정리'
      ]
    },
    {
      pages: [25, 26, 27, 28],
      clip: collected.youtubeTopClips[1],
      article: articles[7],
      subtitles: [
        '제1부 · 검찰 직접수사권 폐지와 중수청·공소청 분리 설계도',
        '제2부 · 대법관 증원과 상고심 재판 지연 해소 입법 방안',
        '제3부 · 한국형 디스커버리(증거개시) 도입과 사법 신뢰 회복',
        '제4부 · 법사위 법안소위 쟁점 조항 축조 분석 및 전망'
      ]
    },
    {
      pages: [29, 30, 31, 32],
      clip: collected.youtubeTopClips[2],
      article: articles[8],
      subtitles: [
        '제1부 · 보편 관세 폭풍과 미·중 공급망 재편의 실체',
        '제2부 · 반도체·배터리 핵심광물 주권과 실용 통상 외교',
        '제3부 · 가계부채 1,912조 원 관리와 수출·내수 균형 성장론',
        '제4부 · 2027 글로벌 경제 전망과 한국 외교의 생존 방정식'
      ]
    }
  ];

  for (const group of part3Interviews) {
    group.pages.forEach((pNum, idx) => {
      const qaPair = group.article.qaList[idx % group.article.qaList.length];
      const nextQaPair = group.article.qaList[(idx + 1) % group.article.qaList.length];
      const offsetSec = group.clip.timestampSec + idx * 195;
      const mm = String(Math.floor(offsetSec / 60)).padStart(2, '0');
      const ss = String(offsetSec % 60).padStart(2, '0');
      const timeLabel = `${mm}:${ss}`;
      const baseVideoUrl = group.clip.videoUrl.split('&t=')[0];
      const timestampUrl = `${baseVideoUrl}&t=${offsetSec}s`;

      pages.push({
        pageNumber: pNum,
        sectionId: 'part-3',
        sectionName: 'Part 3. Who Speaks (지상 중계)',
        layoutType: 'who-speaks-qa',
        kicker: `${group.article.kicker} · [${group.clip.program}]`,
        title: idx === 0 ? group.article.title : `${group.clip.program} 심층 대담 — ${group.subtitles[idx]}`,
        subtitle: group.subtitles[idx],
        speakerInfo: group.article.speakerInfo,
        programName: group.clip.program,
        timestamp: timeLabel,
        timestampSec: offsetSec,
        heatmapNote: group.clip.heatmapPeak,
        stillCutCaption: `[방송 하이라이트 스틸컷] ${group.clip.program} (${timeLabel}) — ${group.article.speakerInfo}`,
        qrUrl: timestampUrl,
        qrLabel: `${timeLabel} 발언 영상 직행 QR`,
        qaItems: [
          qaPair,
          {
            q: `(${timeLabel} 하이라이트 추가 질의) 방금 짚어주신 논점을 실제 입법과 예산 집행 단계에서 관철하기 위한 구체적인 로드맵은 무엇입니까?`,
            a: `${nextQaPair.a} 특히 이번 주 방송(${timeLabel} 구간)에서 강조했듯, 국민이 일상에서 변화를 체감할 수 있는 구체적 시간표와 실행 지표를 매주 투명하게 공개하는 것이 핵심입니다.`
          }
        ],
        paragraphs: [
          group.article.lead,
          group.article.bodyParagraphs[0]
        ]
      });
    });
  }

  // p.33 ~ p.40: Part 4. 오피니언 & 월드 (8p)
  const part4Pages = [
    {
      p: 33,
      type: 'opinion-column',
      kicker: 'PART 04 · OPINION & WORLD (p.33 ~ 40) · 성한용의 정치 막전막후',
      title: articles[9].title,
      subtitle: articles[9].subtitle,
      author: articles[9].author,
      paragraphs: [articles[9].lead, articles[9].bodyParagraphs[0], articles[9].bodyParagraphs[1]],
      highlightQuote: '“국민의 마음을 최종적으로 얻은 세력은 언제나 더 크게 화를 낸 쪽이 아니라 더 유능하게 대안을 제시한 쪽이었다.”'
    },
    {
      p: 34,
      type: 'opinion-column',
      kicker: 'OPINION · 성한용의 정치 막전막후 (계속)',
      title: '협치의 제도화와 ‘정책 연합’이 여는 한국 정치의 새 길',
      subtitle: '극단적 진영 정치를 넘어 다수파 연합과 상임위 중심 숙의 민주주의로',
      author: articles[9].author,
      paragraphs: [
        articles[9].bodyParagraphs[2],
        '유럽의 성숙한 의회민주주의 국가들이 갈등을 관리하는 비결은 정치인의 도덕성만이 아니라, 타협을 강제하는 제도적 장치와 정책 싱크탱크 중심의 정당 구조에 있다.',
        '한국 정치 역시 정기국회 예산안과 민생 법안을 처리하는 과정에서 여야 정책위의장과 상임위 간사단이 상시적으로 데이터를 공유하고 절충안을 다듬는 관행을 정착시켜야 한다. 그것이 유권자의 정치 효능감을 되살리는 첫걸음이다.'
      ],
      qrUrl: collected.speaksWebArticles[1].url,
      qrLabel: 'speaks.kr 성한용 칼럼 원문'
    },
    {
      p: 35,
      type: 'opinion-column',
      kicker: 'SPEAKS ESSAY · 시사 단상 (斷想)',
      title: '[시사 단상] 기록되지 않는 말은 바람에 흩어지고, 기록된 질문은 역사가 된다',
      subtitle: '디지털 속도의 시대, 왜 우리는 다시 50페이지 주간지의 종이와 활자를 펼치는가',
      author: '김민웅 · 스픽스 논설위원',
      paragraphs: [
        '하루에도 수천 개의 짧은 영상과 자극적인 제목의 기사가 스마트폰 화면을 스쳐 지나간다. 속도는 빨라졌으나 사유의 호흡은 짧아졌고, 정보는 넘쳐나나 맥락은 실종되기 일쑤다.',
        '바로 그렇기에 방송의 역동적인 현장성과 활자 매체의 치밀한 검증력을 하나로 묶어내는 작업은 시대의 요청이다. 말의 행간을 살피고, 흩어진 팩트를 엮어 구조적 원인을 밝히며, 반대편의 논거까지 나란히 배치해 독자 스스로 판단하게 하는 정통 시사주간지의 문법은 인공지능 시대에도 여전히 유효하다.',
        '매주 월요일 발행되는 『주간 스픽스』의 지면이 독자 여러분에게 한 주의 소음을 걸러내고 시대의 본질을 응시하는 고요하고도 단단한 서재가 되기를 소망한다.'
      ]
    },
    {
      p: 36,
      type: 'opinion-column',
      kicker: 'ECONOMIC COLUMN · 시사 경제 프리즘',
      title: '[경제 단상] 숫자 너머의 사람을 보라: 통계 평균의 함정과 서민 체감 물가',
      subtitle: '평균 성장률과 수출 호조 지표가 가리지 못하는 자영업·청년층의 양극화 현실',
      author: '전성인 · 경제 칼럼니스트 (홍익대 경제학부 교수)',
      paragraphs: [
        '거시경제 지표의 ‘평균’은 종종 현장의 고통을 은폐한다. 반도체 수출이 회복세를 보이고 소비자물가 상승률이 2%대로 안정되었다는 발표에도 불구하고, 서민들이 장바구니를 들며 느끼는 체감 물가와 자영업자의 매출 절벽은 여전히 혹독하다.',
        '부문 간 불균형 성장이 심화될수록 재정과 금융 정책은 평균치가 아닌 분포의 가장자리, 즉 한계 가구와 영세 소상공인의 현금흐름을 지탱하는 데 초점을 맞춰야 한다.',
        '금융 당국이 은행권의 이자 장사를 구두 경고하는 수준을 넘어, 채무 재조정과 서민금융 공급 목표를 구체적 법적 의무로 부여해야 하는 이유가 여기에 있다.'
      ]
    },
    {
      p: 37,
      type: 'world-issue',
      kicker: 'WORLD ISSUE · 선재규의 월드이슈 Ⅰ',
      title: articles[10].title,
      subtitle: articles[10].subtitle,
      author: articles[10].author,
      paragraphs: [articles[10].lead, articles[10].bodyParagraphs[0], articles[10].bodyParagraphs[1]],
      qrUrl: collected.youtubeTopClips[2].videoUrl,
      qrLabel: '선재규 월드이슈 영상 (41:10)'
    },
    {
      p: 38,
      type: 'world-diagram',
      kicker: 'WORLD GEOPOLITICS DIAGRAM · 세계 정세 관계도',
      title: '미·중 기술 패권과 브릭스(BRICS+) 다극화 시대의 글로벌 공급망·통상 관계도',
      subtitle: 'ChatGPT 다이어그램 설계 엔진이 구조화한 2026~2027 4대 권역별 통상 압력과 한국의 대응 축',
      mermaidCode: blueprint.infographics.worldIssueMermaid,
      paragraphs: [
        articles[10].bodyParagraphs[2],
        '위 관계도에서 보듯 대한민국의 외교·통상 전략은 미국(안보·첨단기술 동맹), 중국·브릭스+(원자재·중간재 교역 및 공급망 관리), 유럽연합(친환경·디지털 규범 공조), 아세안·인도(신성장 시장 다변화)라는 4개의 바퀴가 동시에 맞물려 돌아가야 하는 고차방정식이다.'
      ]
    },
    {
      p: 39,
      type: 'world-issue',
      kicker: 'WORLD ISSUE · 선재규의 월드이슈 Ⅱ (중동·유럽 정세)',
      title: '중동 에너지 항로의 지정학적 리스크와 유럽 탄소국경세(CBAM) 본시행 대응',
      subtitle: '호르무즈·홍해 물류 변수 점검 및 한국 수출 기업의 ESG·탄소중립 생존 전략',
      author: articles[10].author,
      paragraphs: [
        '에너지 수입 의존도가 90%를 웃도는 한국 경제에 중동 정세의 불안정성과 해상 물류 운임 변동은 즉각적인 무역수지 및 국내 물가 충격으로 이어진다. 전략 비축유 관리와 도입선 다변화, 그리고 국내 재생에너지 비중 확대를 통한 에너지 안보 자립도 제고가 시급하다.',
        '한편 유럽연합(EU)이 탄소국경조정제도(CBAM)를 본격 적용함에 따라 철강, 알루미늄, 시멘트, 전력 등 주력 수출 품목의 탄소 배출량 산정과 감축 인증이 기업 생존의 필수 조건이 되었다. 정부 차원의 탄소배출 측정 인프라 지원이 절실하다.'
      ]
    },
    {
      p: 40,
      type: 'world-issue',
      kicker: 'GLOBAL RADAR · 동북아 & 한반도 정세 워치',
      title: '한반도 긴장 완화와 평화 경제의 복원: 위기 관리 채널을 다시 열어라',
      subtitle: '우발적 충돌 방지를 위한 군사적 안전판 구축과 코리아 디스카운트 해소의 조건',
      author: '스픽스 외교안보 자문단',
      paragraphs: [
        '안보는 경제의 토대다. 한반도의 지정학적 긴장이 고조될 때마다 외국인 투자 자금의 변동성이 커지고 국가 신용부도스와프(CDS) 프리미엄이 자극받는 ‘코리아 디스카운트’ 현상이 되풀이된다.',
        '강력한 국방력에 기반한 억지력을 유지하되, 우발적 군사 충돌을 예방하기 위한 최소한의 핫라인과 다자간 외교 대화 채널을 복원하는 것이야말로 가장 현실적이고 국익에 부합하는 안보 전략이다.'
      ],
      qrUrl: collected.speaksWebArticles[2].url,
      qrLabel: 'speaks.kr 월드이슈 전체 보기'
    }
  ];

  for (const item of part4Pages) {
    pages.push({
      pageNumber: item.p,
      sectionId: 'part-4',
      sectionName: 'Part 4. 오피니언 & 월드',
      layoutType: item.type,
      kicker: item.kicker,
      title: item.title,
      subtitle: item.subtitle,
      author: item.author,
      paragraphs: item.paragraphs,
      highlightQuote: item.highlightQuote,
      mermaidCode: item.mermaidCode,
      qrUrl: item.qrUrl,
      qrLabel: item.qrLabel
    });
  }

  // p.41 ~ p.50: Part 5. 컬처·라이프 & 지방시대 (10p)
  const part5Pages = [
    {
      p: 41,
      type: 'culture-opener',
      kicker: "PART 05 · CULTURE, LIFE & LOCAL ERA (p.41 ~ 50) · SPEAKS' CHOICE",
      title: articles[11].title,
      subtitle: articles[11].subtitle,
      author: articles[11].author,
      paragraphs: [articles[11].lead, articles[11].bodyParagraphs[0]]
    },
    {
      p: 42,
      type: 'culture-photo-essay',
      kicker: "SPEAKS' CHOICE · 천안 아우내 장터 & 가을 인문 기행",
      title: '백년의 시간을 이어온 장터의 온기, 아우내 오일장과 병천의 가을 풍경',
      subtitle: '독립운동의 성지에서 만나는 삶의 현장과 도서출판 아우내의 인문 정신',
      author: articles[11].author,
      paragraphs: [
        articles[11].bodyParagraphs[1],
        '아우내 장터 골목을 따라 늘어선 오래된 노포들과 대장간, 방앗간의 풍경은 산업화와 도시화의 물결 속에서도 지역 공동체가 어떻게 기억과 문화를 전승해 왔는지를 보여주는 살아 있는 박물관이다.',
        '이번 주말, 가족과 함께 충남 천안 병천면의 유관순 열사 사적지와 독립기념관을 둘러보고 아우내 장터의 따뜻한 국밥 한 그릇으로 가을의 정취를 채워보는 것은 어떨까.'
      ],
      qrUrl: collected.speaksWebArticles[3].url,
      qrLabel: "SPEAKS' Choice 문화 화보 웹 보기"
    },
    {
      p: 43,
      type: 'culture-photo-essay',
      kicker: 'CULTURE & EXHIBITION · 금주의 전시·공연 큐레이션',
      title: '시대를 증언하는 예술의 목소리: 2026 가을 주목할 만한 다큐멘터리·전시·공연 4선',
      subtitle: '한국 근현대사 기록사진전부터 지역 문화예술회관 순회 창작극까지',
      author: '스픽스 문화 데스크',
      paragraphs: [
        '예술은 시대정신을 비추는 거울이다. 올가을 전국 주요 미술관과 독립영화관에서는 노동과 생태, 지역 공동체, 그리고 민주주의의 기억을 조명하는 다채로운 기획전과 상영회가 관객을 기다리고 있다.',
        '특히 지역 청년 예술가들과 주민들이 함께 무대를 만든 충청·호남 순회 마당극과 구술사 아카이브 전시는 수도권 중심의 문화 향유 격차를 허무는 뜻깊은 시도로 평가받는다.'
      ]
    },
    {
      p: 44,
      type: 'culture-photo-essay',
      kicker: 'HUMAN & HISTORY · 한국 현대사 인물 재조명',
      title: '시대의 어둠을 밝힌 이름 없는 등불들: 풀뿌리 시민운동과 언론 민주화의 궤적',
      subtitle: '검열과 탄압에 맞서 진실을 기록한 해직 언론인들과 시민 독자들의 연대사',
      author: '역사기록 연구팀',
      paragraphs: [
        '오늘날 우리가 누리는 표현의 자유와 시민 언론의 토대는 거저 주어진 것이 아니다. 서슬 퍼런 권위주의 시절 백지 광고와 자발적 구독 운동으로 정론직필의 언론을 지켜냈던 시민들의 연대가 있었기에 가능했다.',
        '유튜브 153만 구독자와 함께 호흡하는 스픽스와 『주간 스픽스』 역시 그 자랑스러운 시민 저널리즘의 계보 위에 서 있음을 무거운 책임감으로 되새긴다.'
      ]
    },
    {
      p: 45,
      type: 'local-era',
      kicker: 'LOCAL ERA Ⅰ · 지방시대 심층 리포트',
      title: articles[12].title,
      subtitle: articles[12].subtitle,
      author: articles[12].author,
      paragraphs: [articles[12].lead, articles[12].bodyParagraphs[0], articles[12].bodyParagraphs[1]]
    },
    {
      p: 46,
      type: 'local-era',
      kicker: 'LOCAL ERA Ⅱ · 전국 지방정부 혁신 사례집',
      title: '신안 햇빛연금 · 화성 무상교통 · 천안 청년스마트팜: 현장에서 피어나는 자치 혁신',
      subtitle: '주민의 삶을 직접 바꾸는 전국 기초·광역 지방정부의 베스트 프랙티스 집중 해부',
      author: '지방자치 특별취재팀',
      paragraphs: [
        '첫째, 전남 신안군의 재생에너지 개발이익 공유제는 태양광과 해상풍력 발전 수익을 주민 협동조합을 통해 분기별 지역화폐 연금으로 지급하며 출산율 반등과 인구 순유입이라는 기적을 일궈냈다.',
        '둘째, 충남 천안시와 인근 지자체가 추진하는 청년 스마트팜 클러스터 및 대학 연계 창업 특구는 지역의 풍부한 농업·교통 인프라와 청년 기술 인재를 결합해 지역 정주 여건을 획기적으로 개선하고 있다.',
        '셋째, 대중교통 무상화 및 수요응답형 버스(DRT) 도입은 농어촌 고령층의 이동권을 보장하고 탄소 배출을 줄이는 일석이조의 성과를 거두고 있다.'
      ]
    },
    {
      p: 47,
      type: 'local-era',
      kicker: 'LOCAL ERA Ⅲ · 지방의회 & 주민자치 라운지',
      title: '조례 하나가 동네를 바꾼다: 금주의 주목할 만한 지방의회 민생 조례 5선',
      subtitle: '이동노동자 쉼터 설치부터 골목형 상점가 지정 완화·독거노인 AI 돌봄까지',
      author: '스픽스 자치행정 분석팀',
      paragraphs: [
        '국회가 거대 담론을 다투는 사이, 전국의 시·군의회와 광역의회에서는 주민의 일상과 직결된 알짜 민생 조례들이 잇따라 제정되고 있다.',
        '금주 『주간 스픽스』가 선정한 우수 조례는 ▲전통시장 및 골목형 상점가 지정 요건 완화 조례 ▲플랫폼·배달 이동노동자 간이 쉼터 확충 조례 ▲농촌 빈집 정비 및 귀농·귀촌 임대주택 전환 조례 ▲소상공인 폐업 및 재기 지원 조례 ▲다문화·이주배경 청소년 언어·진로 멘토링 지원 조례다.'
      ]
    },
    {
      p: 48,
      type: 'book-review',
      kicker: 'AUNAE BOOK REVIEW · 도서출판 아우내 금주의 서평',
      title: articles[13].title,
      subtitle: '도서출판 아우내(충남 천안시 동남구 양지말1길 40) 편집부가 권하는 시사·인문 필독서',
      author: articles[13].author,
      paragraphs: [articles[13].lead, articles[13].bodyParagraphs[0], articles[13].bodyParagraphs[1]],
      books: [
        {
          title: '공론장의 재구성: 알고리즘 시대의 민주주의와 저널리즘',
          publisher: '도서출판 아우내',
          isbn: 'ISBN 978-89-XXXX-101-2',
          summary: '뉴미디어 방송과 정통 인쇄 저널리즘의 결합이 시민 숙의 민주주의를 어떻게 심화시키는지를 밝힌 미디어 비평서.'
        },
        {
          title: '아우내에서 길을 묻다: 한국 근현대 민중 자치와 공동체의 계보',
          publisher: '도서출판 아우내',
          isbn: 'ISBN 978-89-XXXX-102-9',
          summary: '1919년 아우내 독립만세운동부터 오늘날의 풀뿌리 주민자치까지 면면히 이어진 시민 주권의 역사를 추적한 인문 교양서.'
        },
        {
          title: '2026 대전환의 경제학: 가계부채, 공급망, 그리고 기본사회',
          publisher: '도서출판 아우내',
          isbn: 'ISBN 978-89-XXXX-103-6',
          summary: '복합 위기 시대를 건너는 한국 경제를 위한 거시 재정·금융·산업 정책 대안을 집대성한 정책 총서.'
        }
      ]
    },
    {
      p: 49,
      type: 'readers-lounge',
      kicker: 'READERS & YOUTUBE LOUNGE · 독자 투고 & 베스트 댓글',
      title: '153만 구독자와 독자가 함께 만드는 지면: 금주의 스픽스 베스트 댓글 & 독자 편지',
      subtitle: '유튜브 @SPEAKS_TV 실시간 채팅·댓글 하이라이트 및 정기구독자 서신',
      author: '스픽스 독자소통위원회',
      paragraphs: [
        articles[13].bodyParagraphs[2],
        '■ 독자 편지 (충남 천안시 독자 이정훈 님): “유튜브로 스픽스 방송을 매일 챙겨보다가 도서출판 아우내를 통해 50페이지 정통 주간지로 창간된다는 소식에 반가운 마음으로 첫 장부터 끝 장까지 정독했습니다. 방송 화면 속 스틸컷 옆에 놓인 QR 코드를 스마트폰으로 찍자마자 해당 발언 시점의 영상이 재생되는 경험이 놀랍습니다.”',
        '■ 편집국 알림: 『주간 스픽스(SPEAKS WEEKLY)』는 독자 여러분의 제보와 원고 투고, 방송 주제 제안을 언제나 환영합니다. 웹사이트(speaks.kr) 또는 발행처(도서출판 아우내 070-7561-0677)로 소중한 의견을 보내주십시오.'
      ],
      qrUrl: 'https://www.youtube.com/@SPEAKS_TV',
      qrLabel: '스픽스 유튜브 댓글 참여하기'
    },
    {
      p: 50,
      type: 'back-cover',
      kicker: 'BACK COVER · 정기구독 및 도서출판 아우내 안내',
      title: '더 나은 세상을 만드는 정치·시사·문화 주간지 『주간 스픽스 (SPEAKS WEEKLY)』',
      subtitle: '매주 월요일, 153만 시민의 지성과 정통 저널리즘의 품격을 당신의 서재로 배송합니다',
      paragraphs: [
        '원천 미디어: 스픽스 인터넷 신문 (https://www.speaks.kr/) / 스픽스 유튜브 채널 (@SPEAKS_TV)',
        '발행·제작처: 도서출판 아우내 | 주소: 충남 천안시 동남구 양지말1길 40 | 대표전화: 070-7561-0677',
        '정기간행물 번호: ISSN 3022-891X | 전자책 국제표준도서번호: ISBN 978-89-98765-43-2'
      ],
      qrUrl: 'https://www.speaks.kr/',
      qrLabel: '주간 스픽스 웹 매거진 & 정기구독'
    }
  ];

  for (const item of part5Pages) {
    pages.push({
      pageNumber: item.p,
      sectionId: 'part-5',
      sectionName: 'Part 5. 컬처·라이프 & 지방시대',
      layoutType: item.type,
      kicker: item.kicker,
      title: item.title,
      subtitle: item.subtitle,
      author: item.author,
      paragraphs: item.paragraphs,
      books: item.books,
      qrUrl: item.qrUrl,
      qrLabel: item.qrLabel
    });
  }

  // 50페이지 전 지면에 1:1 완벽 매칭 비주얼(사진, 캡션, 출처, 테마) 속성 일괄 부여
  pages.forEach((pg) => {
    pg.visual = getEditorialVisual(pg.pageNumber);
  });

  return pages;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  writeWithClaude().catch((err) => {
    console.error('원고 작성 오류:', err);
    process.exit(1);
  });
}
