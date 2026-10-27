// Bounded integration check using one minute of a known SPEAKS broadcast.
import fs from 'node:fs';
import path from 'node:path';
import {runCommand as exec} from './run-command.mjs';
const root=path.resolve(import.meta.dirname,'..');
const temp=fs.mkdtempSync(path.join(root,'data/.youtube-temp-'));
try{
 await exec('yt-dlp',['--js-runtimes','node','--no-playlist','-f','worstaudio[language^=ko][protocol=https]','--no-progress','-o',path.join(temp,'check.%(ext)s'),'https://www.youtube.com/watch?v=DZ2taddIV2M'],{windowsHide:true,timeout:180000,maxBuffer:4*1024*1024});
 const media=fs.readdirSync(temp).find(f=>/^check\.(webm|m4a|mp4|opus|ogg)$/.test(f));if(!media)throw Error('시험 음성을 확보하지 못했습니다.');
 await exec('ffmpeg',['-y','-ss','230','-i',path.join(temp,media),'-t','60','-ar','16000','-ac','1',path.join(temp,'excerpt.wav')],{timeout:30000});
 await exec('python',['-X','utf8',path.join(root,'scripts/transcribe-audio.py'),path.join(temp,'excerpt.wav'),'--output',path.join(temp,'result.json')],{windowsHide:true,timeout:900000,maxBuffer:4*1024*1024});
 const result=JSON.parse(fs.readFileSync(path.join(temp,'result.json'),'utf8'));
 result.sourceUrl='https://www.youtube.com/watch?v=DZ2taddIV2M&t=230s';result.range={start:230,end:290};result.checkedAt=new Date().toISOString();
 fs.mkdirSync(path.join(root,'data/research'),{recursive:true});fs.writeFileSync(path.join(root,'data/research/audio-smoke-check.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({segments:result.segments.length,transcription:result.transcription,firstSegments:result.segments.slice(0,4)}));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
