# 공천 기사 시각 편집 출고 기록

- Gemini 구독 웹 앱에서 실제 방송 링크와 이미지 기획을 전달해 검토했다. 답변 원문은 같은 폴더의 gemini-visual-review.md. Gemini는 자막·메타데이터만 접근했다고 보고했으며 원화면·음성 미확인을 명시했다. 따라서 제안한 스틸은 미확인 후보로 남겼다.
- Claude 구독 CLI에 Gemini 검토 요약, 기사 논지, GPT의 이미지 관찰을 전달했다. 실제 이미지를 전달하지 않았다는 점을 명시했다. 요청과 답변을 각각 claude-visual-request.md / claude-visual-review.md에 보존했다.
- GPT가 내장 이미지 생성 도구로 실제 공천 개념 삽화를 만들고 출력 이미지를 보았다. 계단·경사로·서로 다른 높이·열린 문·익명 인물이 보인다. 정당 로고·인용문·실존 정치인·실제 사건 재현은 없다. 한 인물을 특정 정당이나 사회집단으로 대응시키지 않았다.
- Claude가 지적한 정보·책임 축의 누락을 보완하기 위해 기존 세 조건 SVG를 본문 마지막 논증 뒤에 배치한다. 캡션에는 경쟁 기회의 차이라는 범위를 밝히고 AI 생성 종류를 별도 표시한다. 결과 보장이나 당선 확정으로 설명하지 않는다.
- 기존 승인 기사 본문은 유지한다. 홈페이지 이미지와 본문 보조 도표를 포함한 새 버전으로 저장·재검토·출고했다. 발행 전 버전은 data/history에 보존한다.

## 실제 생성 프롬프트

Create a sophisticated ORIGINAL editorial illustration for a Korean serious current-affairs weekly, for an analysis about fair political candidate nomination: opening participation is insufficient unless candidates have equal opportunities. Landscape 3:2 composition, wide enough for article lead image. A sculptural paper-cut collage: several unidentifiable small human silhouettes approach the same large open doorway, but their paths start on different stepped elevations; one accessible gently sloping path connects a lower starting point toward the doorway. Clear compelling single visual metaphor, thoughtful and restrained, no villain, no real politician, no party logos, no flags, no ballots with text. Deep ink navy, muted teal, off-white paper, one restrained vermilion accent at the open doorway; tactile cut-paper edges and subtle printed grain, beautifully composed shadows, editorial print quality, spacious uncluttered framing, NO text, NO typography, NO watermark. Obviously an illustration rather than a photograph or a depiction of an actual event. Do not imitate any specific magazine cover or artist. The artwork will be captioned as AI-generated conceptual illustration outside the image.

도구: built-in image_gen. 출력: public/images/nomination-editorial-v1.png (1536×1024). 웹용 대표 이미지로 사용한다. A4 전면 인쇄 해상도 검수를 완료한 것으로 간주하지 않는다.
