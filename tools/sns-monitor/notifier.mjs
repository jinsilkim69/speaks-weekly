/**
 * [텔레그램 다중 발송기] notifier.mjs
 * 등록된 관리자 및 추가 구독자(개인 or 단체 그룹방) 모두에게
 * 모바일 시인성이 극대화된 카드 형태로 실시간 푸시합니다.
 */

export async function sendTelegramNotification(botToken, subscribers, post) {
  const analysis = post.analysis || {
    summaryPoints: [`📌 ${post.title}`],
    keywords: [post.targetName],
    impact: '정치적 입장 표명'
  };

  const bullets = analysis.summaryPoints.map(p => `• ${p}`).join('\n');
  const tags = analysis.keywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ');

  const messageText = `
🚨 <b>[정치인 SNS 레이더 속보]</b>

👤 <b>인물:</b> ${post.targetName} (${post.targetTitle})
📅 <b>시각:</b> ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
📰 <b>출처:</b> ${post.source || 'SNS / 속보'}

━━━━━━━━━━━━━━━━━━━━
📢 <b>핵심 발언 / 쟁점</b>
<b>${escapeHtml(post.title)}</b>

━━━━━━━━━━━━━━━━━━━━
💡 <b>AI 3줄 심층 브리핑</b>
${escapeHtml(bullets)}

⚖️ <b>정국 파장 분석</b>
<i>"${escapeHtml(analysis.impact)}"</i>

🏷️ <b>키워드:</b> ${escapeHtml(tags)}
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${post.link}">[원문 보도 및 SNS 발언 확인하기 ↗]</a>
`.trim();

  let sentCount = 0;

  for (const sub of subscribers) {
    if (!sub.active || !sub.chatId) continue;

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: sub.chatId,
          text: messageText,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });

      const data = await res.json();
      if (data.ok) {
        sentCount++;
      } else {
        console.warn(`[발송 실패] ${sub.name}(${sub.chatId}): ${data.description}`);
      }
    } catch (err) {
      console.error(`[네트워크 에러] ${sub.name}:`, err.message);
    }
  }

  return sentCount;
}

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
