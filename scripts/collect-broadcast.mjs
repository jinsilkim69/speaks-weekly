import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
export function parseCaptions(raw) {
  const segments = [];
  for (const event of raw.events || []) {
    const text = (event.segs || []).map(s => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
    if (!text || segments.at(-1)?.text === text) continue;
    segments.push({ start: Math.floor(event.tStartMs / 1000), text });
  }
  return segments;
}

export async function collectBroadcast(url) {
  const parsed = new URL(url);
  if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(parsed.hostname)) throw new Error('YouTube URL이 필요합니다.');
  const dir = fs.mkdtempSync(path.join(root, 'data/.youtube-temp-'));
  try {
    const { stdout } = await exec('yt-dlp', ['--skip-download', '--no-simulate', '--no-playlist', '--dump-single-json', '--write-auto-subs', '--write-subs', '--sub-langs', 'ko-orig,ko', '--sub-format', 'json3', '-o', path.join(dir, '%(id)s.%(ext)s'), url], { maxBuffer: 32 * 1024 * 1024, timeout: 180000, windowsHide: true });
    const meta = JSON.parse(stdout);
    if (meta.channel_id !== 'UCgeOlLcX6PReHdWImEnUVTg') throw new Error('스픽스 공식 채널 방송이 아닙니다.');
    const files = fs.readdirSync(dir);
    const caption = files.find(f => f.endsWith('.ko-orig.json3')) || files.find(f => f.endsWith('.ko.json3'));
    if (!caption) throw new Error('한국어 자막이 없습니다. 원본 영상 청취/전사가 필요합니다.');
    const segments = parseCaptions(JSON.parse(fs.readFileSync(path.join(dir, caption), 'utf8')));
    if (!segments.length) throw new Error('비어 있는 자막입니다.');
    const source = { id: meta.id, title: meta.title, url: meta.webpage_url, channel: meta.channel, channelId: meta.channel_id, uploadDate: meta.upload_date, duration: meta.duration, views: meta.view_count, thumbnail: `https://i.ytimg.com/vi/${meta.id}/hqdefault.jpg`, collectedAt: new Date().toISOString(), captionType: 'youtube-korean-captions-unreviewed', segments };
    const output = path.join(root, 'data/research');
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, `${source.id}.json`), JSON.stringify(source, null, 2));
    console.log(JSON.stringify({ id: source.id, title: source.title, segments: segments.length, path: `data/research/${source.id}.json` }));
    return source;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  collectBroadcast(process.argv[2]).catch(err => { console.error(err.message); process.exitCode = 1; });
}
