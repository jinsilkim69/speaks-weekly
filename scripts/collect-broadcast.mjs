import fs from 'node:fs';
import path from 'node:path';
import {runCommand as exec} from './run-command.mjs';
import { fileURLToPath } from 'node:url';

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

export async function collectBroadcast(url,{forceAudio=false,allowAudio=true,run=exec,workRoot=root}={}) {
  const parsed = new URL(url);
  if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(parsed.hostname)) throw new Error('YouTube URL이 필요합니다.');
  fs.mkdirSync(path.join(workRoot,'data'),{recursive:true});
  const dir = fs.mkdtempSync(path.join(workRoot, 'data/.youtube-temp-'));
  try {
    // Fetch metadata before downloading any media and validate the channel first.
    const { stdout } = await run('yt-dlp', ['--js-runtimes','node','--skip-download', '--no-playlist', '--dump-single-json', url], { maxBuffer: 32 * 1024 * 1024, timeout: 180000, windowsHide: true });
    const meta = JSON.parse(stdout);
    if (meta.channel_id !== 'UCgeOlLcX6PReHdWImEnUVTg') throw new Error('스픽스 공식 채널 방송이 아닙니다.');
    if(meta.is_live)throw new Error('진행 중인 생방송은 종료 후 수집합니다.');
    let captionError;
    if(!forceAudio)try{await run('yt-dlp',['--skip-download','--no-playlist','--write-auto-subs','--write-subs','--sub-langs','ko-orig,ko','--sub-format','json3','-o',path.join(dir,'%(id)s.%(ext)s'),url],{maxBuffer:4*1024*1024,timeout:180000,windowsHide:true});}catch(error){captionError=error.message;}
    const files = fs.readdirSync(dir);
    const caption = files.find(f => f.endsWith('.ko-orig.json3')) || files.find(f => f.endsWith('.ko.json3'));
    let segments=caption?parseCaptions(JSON.parse(fs.readFileSync(path.join(dir,caption),'utf8'))):[];
    let transcription=null;
    if(!segments.length){
      if(!allowAudio)throw new Error('한국어 자막이 없습니다. 원본 영상 청취/전사가 필요합니다.');
      if(!meta.duration||meta.duration>6*60*60)throw new Error('6시간 초과 또는 길이 미확인 방송은 구간을 지정해 전사해야 합니다.');
      await run('yt-dlp',['--js-runtimes','node','--no-playlist','-f','bestaudio[language^=ko]','--max-filesize','1G','-o',path.join(dir,'audio.%(ext)s'),url],{maxBuffer:4*1024*1024,timeout:20*60*1000,windowsHide:true});
      const audio=fs.readdirSync(dir).find(f=>/^audio\.(m4a|webm|mp4|ogg|opus|mp3)$/.test(f));
      if(!audio)throw new Error('방송 음성을 확보하지 못했습니다.');
      const output=path.join(dir,'transcription.json');
      await run('python',['-X','utf8',path.join(root,'scripts/transcribe-audio.py'),path.join(dir,audio),'--output',output],{maxBuffer:4*1024*1024,timeout:4*60*60*1000,windowsHide:true});
      const result=JSON.parse(fs.readFileSync(output,'utf8'));segments=result.segments;transcription={...result.transcription,captionFailure:captionError?.slice(0,300)||null};
    }
    if (!segments.length) throw new Error('비어 있는 자막입니다.');
    const publishedAt = meta.release_timestamp || meta.timestamp;
    const source = { id: meta.id, kind:'youtube', title: meta.title, url: meta.webpage_url, channel: meta.channel, channelId: meta.channel_id, uploadDate: meta.upload_date, publishedAt:publishedAt ? new Date(publishedAt*1000).toISOString() : null, duration: meta.duration, views: meta.view_count, thumbnail: `https://i.ytimg.com/vi/${meta.id}/hqdefault.jpg`, collectedAt: new Date().toISOString(), captionType: 'youtube-korean-captions-unreviewed', segments };
    if(transcription){source.captionType='local-audio-transcription-unreviewed';source.transcription=transcription;}
    const output = path.join(workRoot, 'data/research');
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, `${source.id}.json`), JSON.stringify(source, null, 2));
    console.log(JSON.stringify({ id: source.id, title: source.title, segments: segments.length, path: `data/research/${source.id}.json` }));
    return source;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  collectBroadcast(process.argv[2],{forceAudio:process.argv.includes('--audio'),allowAudio:!process.argv.includes('--captions-only')}).catch(err => { console.error(err.message); process.exitCode = 1; });
}
