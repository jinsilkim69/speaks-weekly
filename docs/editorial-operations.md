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

수정한 원고는 다시 검토해야 하며 같은 버전의 반복 출고는 새 버전을 만들지 않습니다. 검토 필드가 있다는 것만으로 글의 수준이 보증되지는 않습니다. 홈페이지와 주간지에 같은 원문 충실도·정확성·설명 기준을 적용하고, 주간호에는 주제별 재편집과 배경 설명을 반영합니다. 모든 방송 기사에 자체 반론과 비평을 요구하지 않습니다.

로컬 출고 후 npm test, npm run build, 브라우저 확인과 GitHub 푸시를 거쳐 공개 사이트를 확인합니다. 원시 근거·음성·비밀정보는 커밋하지 않습니다. 기존 publish:agent는 레거시 지면 미리보기용입니다.

주간호 출고는 release-edition 명령으로 별도 처리하며 14개 원고 스냅샷, 주간 재편집 기록, 실제 PDF와 일치하는 50페이지·시각 검수 기록이 필요합니다. 발행 후 수정은 새 정정판 ID를 사용합니다. PDF 조판과 구조 검사는 구현했습니다. 정기 제작은 이 채팅의 일정으로 등록했으며 docs/recurring-production.md를 따릅니다. 첫 실제 14개 꼭지·50면호를 집필·검수·출고했고, 미완성호를 발행 완료로 표시하지 않습니다.


## 실제 PDF 조판과 출고

`python -m pip install -r requirements-publishing.txt`로 조판 의존성을 준비합니다. Node 22+, Python, 한국어 TTF 글꼴이 필요합니다. 기본 글꼴은 Windows 맑은 고딕이며 다른 환경에서는 SPEAKS_KOREAN_FONT에 TTF 경로를 지정합니다. SPEAKS_PYTHON으로 Python 실행 파일을 지정할 수 있습니다.

1. 주간호 JSON에 id, title, period, introduction(발행인의 말 문단 배열), 검토 완료한 articleSnapshots 14개를 준비합니다. 각 원고에는 weeklyTreatment가 필요합니다. 이미지는 권리 확인 후 public 아래 로컬 파일로 준비합니다.
2. `npm run edition:build -- 주간호.json`을 실행합니다. output/pdf/호ID/proof.pdf와 edition.json을 생성합니다. 현재 조판 엔진은 ReportLab이며 기존 브라우저 인쇄/Paged.js 미리보기와 별도입니다. 편성은 도입 4면, 레이다 6면, 커버 10면, 인터뷰 12면, 오피니언 8면, 문화 10면입니다. 글이 넘치면 실패하며 원문을 자르거나 글꼴을 축소하지 않습니다. 분량 부족·장르 구성·여백은 실제 지면 검수에서 판단합니다.
3. PDF 전 면을 렌더링해 읽고 이미지·글꼴·여백·단 나눔·인용·QR을 검수합니다. edition.json의 pdfReview에 visualCheck=true, summary=실제 검수 내용, reviewedAt=검수 시각을 기록합니다. sha256과 pages는 생성 값을 유지합니다.
4. 검수한 PDF를 public/editions/호ID.pdf로 복사합니다. `npm run editorial -- release-edition output/pdf/호ID/edition.json`으로 출고합니다. 실제 PDF 파서가 A4 50페이지·내용 있는 면·원고 및 이미지 지문 일치·검수 파일 해시를 확인합니다. 검수 뒤 수정했다면 다시 조판합니다.
5. `npm run build` 후 배포합니다. 공개 웹 주간지는 `/?edition=호ID`, 데이터는 `/api/editions/호ID.json`입니다. 홈페이지 기사 수정 후에도 발행호의 원고 스냅샷을 읽습니다. 미발행 PDF는 정적 배포에 포함하지 않습니다.

발행 시 PDF 구조 검사 결과를 해당 파일의 SHA-256과 함께 저장합니다. 이후 홈페이지·정적 빌드는 파일 해시 및 원고·이미지 지문을 대조하므로 배포 환경에 Python을 설치할 필요가 없습니다. 조판·발행 작업을 수행하는 PC에는 Python 의존성이 필요합니다. 발행에 사용한 이미지 파일은 덮어쓰지 말고 새 이름으로 저장합니다.

`npm run check:edition`은 **시스템 시험용 50페이지 PDF**를 생성합니다. 테스트 문단과 반복 이미지를 사용하므로 완성 주간지가 아니며, PDF 내부 표식으로 출고를 차단합니다. 파일은 output 아래에만 두며 Git/정적 배포에서 제외합니다.

`npm run check:readiness` 또는 인자 없는 `npm run pipeline`은 실제 기사 수·발행호 수·수집 상태·남은 작업을 표시합니다. 제작 대기를 발행 완료로 보고하지 않습니다. 기존 `publish:agent`, `/magazine`, `/admin`은 레거시 미리보기 경로이며 새 출고 절차를 대신하지 않습니다.


## 구독 AI 집필 실행

`node scripts/claude-desk.mjs 요청.json`을 사용합니다. 요청에는 id, articleIds, 실제 원문과 집필 스킬을 포함한 prompt가 필요합니다. Claude 구독 로그인만 허용하며 API 인증 환경변수는 자식 프로세스에서 제외합니다. 작업 기록과 원고는 data/production에 보존하고 Git에서는 제외합니다. 성공한 동일 요청은 재사용하며 실패는 원인과 시도를 기록합니다. 반환 원고는 검토 전 초고이며 자동 출고하지 않습니다. Gemini 구독 웹 앱은 에이전트가 CUA로 사용하고 지연·한도 발생 시 실제 실패와 대행자를 기록합니다.

## 모델 간 실제 제작 인계 규칙 (2026-10-27)

1. Gemini 구독 웹 앱에 구조화 원문을 전달해 핵심 주장·화자·시간·이견·미확인 날짜·시각자료 후보를 받는다. 영상 링크 전달과 실제 영상 청취를 동일하게 기록하지 않는다. 원문 텍스트만 읽었으면 그 범위로 남긴다. 응답이 중단되면 partial로 기록하고 완료 처리하지 않는다.
2. GPT는 조사 메모를 원문과 대조하고 누락·오독을 보완하며 사진의 날짜·이용 조건, 삽화의 역할을 결정한다. 서비스 제한으로 대행한 원문과 이유를 기록한다. Gemini의 사실 단정이나 도표 제안을 그대로 채택하지 않는다.
3. Claude 구독 CLI에 원문과 조사 인계·GPT 교정 사항·이미지 기획을 전달한다. 먼저 초고를 병행 집필했어도 조사 도착 후 최종 집필·캡션 교정을 다시 수행한다. 결과는 초고/최종 데스크로 구분한다.
4. GPT가 최종 원고와 실제 이미지를 보고 검수한다. 출고 원고의 productionHandoff에 인계 JSON 경로를 기록한다. scripts/production-handoff.mjs의 assertProductionHandoff로 원문 SHA, 조사 완료/대행 범위, Claude 실제 완료 기록, 최종 원고·이미지 검토 해시를 검증한 뒤 save/review/publish한다. 인계 경로가 있는 원고는 publishDraft에서도 다시 검증한다.
5. 이번 표본은 Gemini 자막 조사 부분 완료·사용량 한도 → GPT 보완·이미지 제작 → Claude 최종 6편 교정 → GPT 출고 검수로 수행했다. 이것은 실제 서비스 구독 화면/CLI를 사용하는 에이전트 인계이며, 세 서비스의 완전 무인 자동 연결이 검증됐다는 뜻은 아니다.

요일별 목록에는 표시 주간을 명시한다. 이번 검수 표본은 2026.10.19~25이며 26일 회차를 섞지 않는다. 제목 날짜·공개일이 다른 회차는 방송 제목 기준 또는 공개일 기준임을 표시한다. 과거 방송의 전망은 당시 발언으로 남기고 뒤의 결과를 소급해 고치지 않는다. 빈칸을 채우려고 다른 요일 영상을 이동하거나 실제 방송 스케줄을 만들지 않는다.
