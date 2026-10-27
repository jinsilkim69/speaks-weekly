# 편집 운영 절차

## 사진·이미지와 AI 분업

시각 편집은 `skills/speaks-weekly-writing/references/visual-desk.md`를 따른다. Gemini 구독 웹 앱의 방송·사진 리서치 → GPT의 이미지 기획·생성/확보 → Claude 구독 CLI의 원고·캡션 검토 → GPT의 실제 시각 확인 순서다. 2026-10-27 공천 기사에서 이 인계를 실제 실행했으며 요청·응답·출고 판단은 data/editorial에 기록했다. 이 시범 실행이 정기 무인 인계 완성을 뜻하지 않는다.

공천 기사의 대표 이미지는 신규 AI 삽화, 본문 보조 이미지는 자체 SVG 도표다. 다른 기사에서는 장르와 자료에 따라 보도 사진·방송 스틸·썸네일을 선택한다. 모든 이미지를 생성하거나 썸네일로 통일하지 않는다. 편집 화면에 이미지 종류·역할·원출처·사용 근거·크기·생성 기록을 입력하며, 변경은 재검토 대상이다.

## 수집

Node 22 이상, Python, yt-dlp[default], beautifulsoup4, faster-whisper가 필요합니다. 이 PC에서 medium 모델 로드를 확인했습니다. 기본적으로 캐시된 모델만 사용합니다.

```
npm run editorial:prepare -- daily
npm run editorial:prepare -- weekly 2026-10-26
npm run editorial:collect -- weekly-2026-10-19-2026-10-25 DZ2taddIV2M web-20698
npm run collect:broadcast -- "https://www.youtube.com/watch?v=DZ2taddIV2M"
```

prepare는 후보 발견, collect는 실제 게시일과 본문 확인입니다. 발견한 제목만으로 집필하지 않습니다. 주간 범위는 지정일이 속한 주의 직전 월요일~일요일, 일간은 전날입니다. 한국 시간으로 검사합니다. 신문은 사이트 머리글 날짜 대신 기사 입력일을 사용합니다.

작업은 data/jobs, 구조화 자료는 data/research에 저장됩니다. 같은 자료는 재사용하며 실패 3회 후에는 collect 명령에 --retry를 붙여 재시도합니다. prepare에 --refresh를 붙이면 발견 목록을 갱신하되 기존 수집 상태를 보존합니다. 중단 작업의 잠금 복구는 `node scripts/editorial-workflow.mjs recover-lock`입니다. 실행 중인 프로세스의 잠금은 해제하지 않습니다.

## 자막이 없는 방송

공식 채널 확인 → 한국어 자막 시도 → 없거나 실패하면 한국어 원음 다운로드 → 로컬 전사 → 근거 검토 → 집필 순서입니다. `--audio`는 음성 전사 지정, `--captions-only`는 자막만 사용합니다.

기본 모델은 medium, CPU int8입니다. SPEAKS_WHISPER_MODEL과 SPEAKS_WHISPER_DEVICE 환경변수로 변경할 수 있습니다. 모델이 없으면 오류로 안내하며 임의로 작은 모델로 바꾸지 않습니다. GPU 라이브러리 호환은 따로 확인해야 합니다.

전사 결과에는 시작·종료 시간과 unreviewed 표시가 붙습니다. 화자와 화면 도표를 자동 검증한 것으로 처리하지 않습니다. 인명·숫자·부정어와 직접 인용은 원음을 대조하고, 확인 못하면 간접화하거나 보류합니다. 진행 중 생방송, 길이 미확인·6시간 초과 방송은 별도 구간 처리가 필요합니다. 한국어 트랙이 없는 경우 잘못된 더빙을 쓰지 않고 오류를 냅니다.

원시 음성·자막은 성공·실패 모두 정리합니다. 시간 초과 시 다운로드 자식 프로세스도 종료합니다. `npm run check:transcription`은 실제 방송을 받아 1분 구간만 잘라 전사하는 통합 시험이며 FFmpeg가 필요합니다. 결과는 data/research/audio-smoke-check.json에 남깁니다.

근거: [faster-whisper 공식 문서](https://github.com/SYSTRAN/faster-whisper), [yt-dlp 런타임 안내](https://github.com/yt-dlp/yt-dlp/wiki/EJS).

## 집필·검토·출고

skills/speaks-weekly-writing/SKILL.md를 적용해 내장 에이전트가 실제 자료를 읽고 분석·집필합니다. 스크립트는 다른 AI 구독 계정을 실행하거나 원고를 자동 창작하지 않습니다.

`npm start` 후 `http://127.0.0.1:3000/editorial.html`에서 원고 저장 → 검토 기록 → 출고를 진행합니다. 공개 정적 사이트에서는 편집하지 않습니다. 홈페이지 데이터는 data/web_articles.json, 초고는 data/drafts, 이전 발행본은 data/history입니다.

CLI도 동일한 검증을 거칩니다.

```
node scripts/editorial-cli.mjs save 요청.json
node scripts/editorial-cli.mjs review 검토.json
node scripts/editorial-cli.mjs publish 출고.json
```

- 저장: article 객체와 expectedRevision(신규 0, 수정은 현재 revision).
- 검토: id, expectedRevision, review 객체. review에는 evidence, analysis, counterargument, language, visual, summary의 실제 검토 내용을 적습니다.
- 출고: id와 expectedRevision. 현재 원고 해시와 검토 해시가 같아야 합니다.

수정한 원고는 다시 검토해야 하며 같은 버전의 반복 출고는 새 버전을 만들지 않습니다. 검토 필드가 있다는 것만으로 글의 수준이 보증되지는 않습니다. 홈페이지와 주간지에 같은 근거·분석·반론 기준을 적용하고, 주간호에는 추가 취재와 비교를 반영합니다.

로컬 출고 후 npm test, npm run build, 브라우저 확인과 GitHub 푸시를 거쳐 공개 사이트를 확인합니다. 원시 근거·음성·비밀정보는 커밋하지 않습니다. 기존 publish:agent는 레거시 지면 미리보기용입니다.

주간호 출고는 release-edition 명령으로 별도 처리하며 14개 원고 스냅샷, 주간 재편집 기록, 실제 PDF와 일치하는 50페이지·시각 검수 기록이 필요합니다. 발행 후 수정은 새 정정판 ID를 사용합니다. 현재 PDF 조판 완성과 정기 실행 일정은 미구현이며 미완성호를 발행 완료로 표시하지 않습니다.
