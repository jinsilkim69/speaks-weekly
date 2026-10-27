# 프로젝트 연결과 원본

## 기획 원본

- 저장소 루트 `AGENTS.md`, `ASTRA_HANDOVER.md`를 먼저 읽는다.
- 안티그래비티 총괄 스킬: `H:/그래비티/kit/.agent/skills/speaks_magazine_and_clip_automation/SKILL.md`.
- 총괄 스킬의 명령 목록은 설계이므로 실제 스크립트를 읽어 구현 상태를 확인한다. `04-write-claude.mjs`의 고정 예문 조립을 실제 AI 집필로 취급하지 않는다.

## 현재 원고 반영 경로

1. `data/research/`의 실제 구조화 자료를 읽고, 집필·퇴고한다. 원시 임시 파일은 추출 후 정리하되 다른 작업의 원본은 삭제하지 않는다.
2. 검토용 초고와 편집 기록은 `data/editorial/`에 둔다. 사용자에게 보여줄 원고와 편집 기록을 분리한다.
3. 발행 요청 시 `scripts/publish-agent-issue.mjs`의 최신 스키마를 확인한다. 현재 입력은 `data/agent_articles.json`의 articles 배열이며 slot, sourceId, title, subtitle, lead, bodyParagraphs, evidence(start/end/label), verificationNote를 사용한다.
4. 현재 importer는 YouTube 자막 자료만 받는다. 웹 기사를 가짜 영상 ID로 통과시키지 않는다. 웹 지원을 구현하지 않았다면 초고로 전달하고 제약을 밝힌다.
5. 원고 작성·검토 요청만으로 공개 사이트를 바꾸지 않는다. 이미 발행이 승인된 작업은 그 범위에 따라 진행한다. 스킬 검증용 원고는 공개 발행과 분리한다.

## 설계 참고 출처

2026-10-27에 아래 공개 SKILL.md를 직접 검토했다. 이 스킬은 스픽스의 요구에 맞춰 새로 작성했으며 외부 패키지 전체를 설치하거나 원문을 복제하지 않았다.

- https://github.com/ur-grue/autopunk-media-skills/blob/main/skills/magazine-journalism/writing/reportage-structure/SKILL.md — 자료에 맞는 기사 구성과 섹션별 근거 배치 참고.
- https://github.com/jamditis/claude-skills-journalism/blob/master/journalism-core/skills/story-pitch/SKILL.md — 시의성·독자 관련성·취재 근거를 분리해 판단하는 기획 방식 참고.

두 저장소는 확인 당시 MIT로 표시되었다. 외부 코드를 추후 복사·배포할 경우 해당 버전의 라이선스와 저작권 고지를 함께 보존한다. 인기도나 자체 평가 점수를 이 스킬의 품질 검증으로 대신하지 않는다.
