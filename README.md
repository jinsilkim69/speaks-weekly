# 주간 스픽스

스픽스 방송과 신문 자료를 근거로 분석 기사를 만드는 프로젝트입니다. 공개 홈페이지와 주간지(PDF·웹)는 같은 편집 검토 기준을 사용하며 주간호는 추가 취재·재편집을 거칩니다. UI 개편은 보류하고 제작·검수·발행 기능을 우선합니다.

## 실행

```sh
npm ci
npm start
```

홈페이지는 http://127.0.0.1:3000/ , 편집 데스크는 /editorial.html 입니다. 정적 공개 사이트에서는 편집·저장을 실행하지 않습니다. 원격 편집 서버로 공개하려면 별도의 인증이 필요합니다.

## 제작 흐름

1. `npm run editorial:prepare -- weekly`로 후보를 발견하고 `npm run editorial:collect -- JOB SOURCE...`로 선택한 원문을 수집합니다. 일간 작업에는 daily를 사용합니다.
2. 원문에 접근한 범위를 기록하며 Gemini가 분석 자료를 정리하고, Claude가 집필·교열하며 GPT가 시각 자료와 편집 검수를 담당합니다. 구독 서비스의 정기 무인 인계는 아직 미완성입니다. API 키를 요구하지 않습니다.
3. 프로젝트 집필 스킬 `skills/speaks-weekly-writing/SKILL.md`를 적용합니다. 홈페이지 원고는 editorial save → review → publish로 출고합니다. 검토 뒤 변경한 원고와 이미지에는 재검토가 필요합니다.
4. 주간호는 검토된 14개 꼭지와 발행인의 말을 준비하고 `npm run edition:build -- 주간호.json`으로 A4 50페이지를 조판합니다. `python -m pip install -r requirements-publishing.txt`와 한국어 글꼴이 필요합니다.
5. 실제 PDF 시각 검수 후 `npm run editorial -- release-edition 검수완료.json`으로 출고합니다. 웹 주간지는 `/?edition=호ID`에서 발행 당시 원고를 보여줍니다.
6. `npm test`, `npm run build`, 공개 사이트 확인을 거쳐 배포합니다.

자막이 없으면 한국어 원음을 로컬 음성 인식으로 전사합니다. 전사 결과는 미검증 자료이며 인명·수치·인용은 원음 대조가 필요합니다. 임시 원시 파일은 성공·실패 모두 정리합니다. 자세한 요구사항과 명령은 [편집 운영 절차](docs/editorial-operations.md)를 따릅니다.

## 검증 및 현재 한계

- `npm test`: 원고 검토·동시 저장·수집 실패 정리·독자 열람·실제 PDF 생성·변조 및 시험 PDF 출고 차단·정적 배포 검증.
- `npm run check:edition`: 배포 금지 표식이 있는 50페이지 시스템 시험 PDF. 실제 주간호가 아닙니다.
- `npm run check:readiness`: 실제 발행 수와 미완료 작업. 인자 없는 pipeline도 동일한 상태 점검을 하며 발행을 실행하지 않습니다.
- `npm run check:transcription`: 실제 방송 1분 구간의 음성 인식 통합 시험.

현재 실제 공개 기사는 1건, 완성 주간호는 0개입니다. PDF 생성과 발행 검증 기능이 있어도 실제 14개 기사 집필·지면 검수를 마친 것은 아닙니다. 정기 AI 인계·예약 실행, 방송 자동 선별, 스틸/Heatmap 추출도 남아 있습니다. 프로그램 테스트와 실제 편집 품질 검수는 별개입니다.

기존 `/magazine`, `/admin`, `publish:agent`, `pipeline --demo`는 레거시 미리보기·테스트용입니다. 새 홈페이지·주간호 출고 절차를 대신하지 않습니다. 공개 홈페이지는 Cloudflare에서 제공되므로 제작 PC를 꺼도 이미 게시된 콘텐츠는 열립니다.
