import fs from 'node:fs';
const config = JSON.parse(fs.readFileSync(new URL('config.json', import.meta.url)));
const admin = config.subscribers.find(s => s.active && s.name.startsWith('관리자('));
if (!admin?.chatId) throw new Error('활성 관리자 수신처가 없습니다.');
async function api(method, body) {
  const res = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/' + method, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
    signal:AbortSignal.timeout(20000)
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(method + ' HTTP ' + res.status + ' ' + (data.description || ''));
  return data.result;
}
async function verify() {
const bot = await api('getMe', {});
if (bot.username !== 'speaks_radar_bot') throw new Error('기존 봇 계정 불일치: @' + bot.username);
const sent = await api('sendMessage', {chat_id:admin.chatId, text:'[수신 확인] 위클리 스픽스 SNS 레이더의 기존 봇 연결을 점검했습니다.'});
if (!sent.message_id || String(sent.chat.id) !== String(admin.chatId) || sent.from.id !== bot.id) throw new Error('발송 결과 불일치');
console.log('기존 봇의 관리자 대화방 발송 확인');

}
verify().catch(error => {console.error('::error::' + error.message); process.exitCode = 1;});
