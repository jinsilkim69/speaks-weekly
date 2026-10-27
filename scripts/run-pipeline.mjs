/**
 * 『주간 스픽스 (SPEAKS WEEKLY)』 4단계 AI 통합 파이프라인 마스터 실행기 (scripts/run-pipeline.mjs)
 * ① 01-collect-speaks.mjs (자막/본문 추출 + 임시 파일 즉시 삭제 클린업)
 * ② 02-analyze-gemini.mjs (팩트·논점·타임스탬프 정리 -> 01_research_dossier.md)
 * ③ 03-plan-chatgpt.mjs (쟁점 비교표·여론조사 차트·관계도·QR 설계 -> 02_issue_blueprint.json)
 * ④ 04-write-claude.mjs (정통 시사주간지 문어체 기사·Q&A 인터뷰 및 50p 조판 컴파일 -> current_issue.json)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectSpeaksSources, cleanupYoutubeTempFiles } from './01-collect-speaks.mjs';
import { analyzeWithGemini } from './02-analyze-gemini.mjs';
import { planWithChatGPT } from './03-plan-chatgpt.mjs';
import { writeWithClaude } from './04-write-claude.mjs';
import { collectBroadcast } from './collect-broadcast.mjs';
import { checkReadiness } from './check-readiness.mjs';

const __filename = fileURLToPath(import.meta.url);

export async function runFullPipeline(customInput = {}) {
  if (customInput.mode !== 'demo') {
    if (customInput.url) {
      const source = await collectBroadcast(customInput.url);
      return { ok:true, mode:'awaiting-agent', message:'주간지 원자료 수집 완료. 원문 대조·집필·검수 후 발행호에 편성하세요. 스픽스 리뷰에는 공식 제목·원문 링크만 연결합니다. 음성 전사 및 자막은 검증 전 자료입니다.', source:{id:source.id,title:source.title} };
    }
    return {ok:true,mode:'awaiting-editorial',message:'제작 상태를 확인했습니다. 기사·주간지 발행 완료를 의미하지 않습니다.',readiness:checkReadiness(path.resolve(import.meta.dirname,'..'))};
  }
  const startTime = Date.now();
  const stepsLog = [];

  // 1단계: 자동 수집 & 임시 찌꺼기 파일 클린업
  const collected = await collectSpeaksSources(customInput);
  stepsLog.push({
    step: 1,
    name: '01-collect-speaks.mjs',
    role: 'YouTube (@SPEAKS_TV) & speaks.kr 자동 수집 + 임시파일 클린업',
    status: 'DEMO_COMPLETED',
    detail: `유튜브 클립 ${collected.youtubeTopClips.length}건, 웹 기사 ${collected.speaksWebArticles.length}건 추출 완료 (임시파일 클린업: ${collected.cleanupReport.status})`
  });

  // 2단계: Gemini 맥락 분석 및 팩트 매칭
  const analysis = await analyzeWithGemini(collected);
  stepsLog.push({
    step: 2,
    name: '02-analyze-gemini.mjs',
    role: 'Gemini 구어체 추임새 제거 · 발언 타임스탬프 · 법안/통계 팩트체크',
    status: 'DEMO_COMPLETED',
    detail: 'data/01_research_dossier.md 생성 완료'
  });

  // 3단계: ChatGPT 50p 지면 설계 및 인포그래픽 생성
  const plan = await planWithChatGPT(analysis);
  stepsLog.push({
    step: 3,
    name: '03-plan-chatgpt.mjs',
    role: 'ChatGPT 50p 편성표 · Chart.js 여론차트 · 쟁점 비교표 · Mermaid 관계도 · QR 배치',
    status: 'DEMO_COMPLETED',
    detail: 'data/02_issue_blueprint.json 생성 완료'
  });

  // 4단계: Claude 시사주간지 문어체 윤문 및 50p 조판 컴파일
  const written = await writeWithClaude(plan);
  stepsLog.push({
    step: 4,
    name: '04-write-claude.mjs',
    role: 'Claude 정통 시사주간지 문어체 기사 · 일문일답(Q&A) 윤문 및 50p PDF 조판 컴파일',
    status: 'DEMO_COMPLETED',
    detail: 'data/current_issue.json (총 50페이지, 14개 꼭지) 컴파일 완료'
  });

  // 최종 클린업 재확인 (YouTube Analysis Cleanup Directive)
  cleanupYoutubeTempFiles();

  const elapsedMs = Date.now() - startTime;
  return {
    ok: true,
    mode: 'demo',
    elapsedMs,
    stepsLog,
    issueData: written.issueData
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const argUrl = process.argv[2] || '';
  const argTitle = process.argv[3] || '';
  runFullPipeline(argUrl === '--demo' ? {mode:'demo'} : { url: argUrl, title: argTitle })
    .then((res) => {
      if (!res.issueData) { console.log(JSON.stringify(res,null,2)); return; }
      console.log(`\n========================================`);
      console.log(`『주간 스픽스 (SPEAKS WEEKLY)』 50p 자동 출판 파이프라인 완료 (${res.elapsedMs}ms)`);
      console.log(`총 페이지 수: ${res.issueData.pages.length}p / 꼭지 수: ${res.issueData.articles.length}개`);
      console.log(`========================================\n`);
    })
    .catch((err) => {
      console.error('파이프라인 실행 실패:', err);
      process.exit(1);
    });
}
