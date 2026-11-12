/**
 * [정치인 발언 심층 분석기] analyzer.mjs
 * Gemini API가 있으면 AI 심층 분석을 수행하고,
 * 없거나 실패할 경우 내장 스마트 휴리스틱 분석기로 자동 폴백합니다.
 */

export async function analyzePoliticalPost(post, geminiApiKey = null) {
  // 1. Gemini API 키가 제공된 경우 LLM 호출
  if (geminiApiKey) {
    try {
      const prompt = `
당신은 대한민국 최고 수준의 정치 시사 평론가입니다.
아래 정치인의 최근 SNS 발언/보도를 분석하여 독자가 3초 만에 맥락을 파악할 수 있도록 3줄 핵심 요약과 정치적 쟁점을 작성해 주세요.

[정치인]: ${post.targetName} (${post.targetTitle})
[발언/헤드라인]: ${post.title}
[상세 내용]: ${post.desc}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summaryPoints": [
    "핵심 주장 1",
    "배경 및 타깃 비판 대상 2",
    "향후 정국 파장 전망 3"
  ],
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "impact": "발언의 결정적 의미를 한 문장으로 총평"
}
`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            ...post,
            analysis: parsed
          };
        }
      }
    } catch (err) {
      console.warn(`[AI 분석 폴백] Gemini 호출 실패, 내장 분석기로 전환: ${err.message}`);
    }
  }

  // 2. 내장 스마트 휴리스틱 분석기 (API 키가 없어도 100% 동작)
  const cleanTitle = post.title.replace(/\[.*?\]/g, '').replace(/ - .*$/, '').trim();
  const summaryPoints = [
    `📰 [검색 후보] ${cleanTitle}`,
    `🔎 발언 원문·작성일과 당시 직함 확인 필요`,
    `⚠️ 뉴스 제목만으로 실제 SNS 발언을 확정하지 않음`
  ];

  const keywords = [post.targetName, '정치속보', 'SNS발언'];
  if (post.title.includes('예산') || post.title.includes('추경')) keywords.push('민생예산');
  if (post.title.includes('특검') || post.title.includes('법사위') || post.title.includes('탄핵')) keywords.push('사법정국');
  if (post.title.includes('트럼프') || post.title.includes('미국')) keywords.push('외교통상');

  return {
    ...post,
    analysis: {
      summaryPoints,
      keywords,
      impact: '추가 출처 및 맥락 확인 필요'
    }
  };
}
