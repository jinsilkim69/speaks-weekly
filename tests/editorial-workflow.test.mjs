import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {periodFor,inPeriod,withLock,recoverLock,collectJob,atomicJson} from '../scripts/editorial-workflow.mjs';
import {saveDraft,approveDraft,publishDraft} from '../scripts/editorial-service.mjs';
import {collectBroadcast} from '../scripts/collect-broadcast.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('../data/web_articles.json',import.meta.url))).articles[0];
function workspace(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-editorial-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));atomicJson(path.join(root,'data/web_articles.json'),{articles:[]});return root;}
test('Korean weekly periods and boundary timestamps are deterministic',()=>{
 const p=periodFor('weekly','2026-10-26');assert.equal(p.start,'2026-10-19');assert.equal(p.end,'2026-10-25');
 assert.deepEqual(periodFor('weekly','2026-10-27'),p);
 assert.equal(inPeriod({publishedAt:'2026-10-25T14:59:59Z'},p),true);
 assert.equal(inPeriod({publishedAt:'2026-10-25T15:00:00Z'},p),false);
 assert.throws(()=>periodFor('daily','2026-02-30'));
});
test('review follows the saved revision, edits invalidate it, publication is idempotent',async t=>{
 const root=workspace(t),a=structuredClone(fixture);a.id='test-story';
 const draft=await saveDraft(root,{article:a,expectedRevision:0});assert.equal(draft.review.status,'pending');
 await assert.rejects(publishDraft(root,{id:a.id,expectedRevision:1}),/편집 검토/);
 await assert.rejects(saveDraft(root,{article:a,expectedRevision:0}),/다른 편집/);
 await approveDraft(root,{id:a.id,expectedRevision:1,review:a.review});
 const published=await publishDraft(root,{id:a.id,expectedRevision:1});
 assert.equal(published.version,1);assert.deepEqual(await publishDraft(root,{id:a.id,expectedRevision:1}),published);
 const edit=await saveDraft(root,{article:{...draft,title:'수정된 제목'},expectedRevision:1});assert.equal(edit.revision,2);
 await assert.rejects(approveDraft(root,{id:a.id,expectedRevision:1,review:a.review}),/버전/);
 await assert.rejects(publishDraft(root,{id:a.id,expectedRevision:2}),/편집 검토/);
 await approveDraft(root,{id:a.id,expectedRevision:2,review:a.review});
 assert.equal((await publishDraft(root,{id:a.id,expectedRevision:2})).version,2);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'data/history/test-story-v1.json'))).title,a.title);
});
test('lock blocks concurrent writers and releases even after failure',async t=>{
 const root=workspace(t);
 await assert.rejects(withLock(root,async()=>{assert.throws(()=>withLock(root,()=>{}),/다른 편집/);assert.throws(()=>recoverLock(root),/실행 중/);throw Error('test failure');}),/test failure/);
 assert.equal(fs.existsSync(path.join(root,'data/.editorial.lock')),false);
 await withLock(root,()=>{});
});
test('collection reuses structured sources and rejects out-of-period content',async t=>{
 const root=workspace(t),id='weekly-2026-10-19-2026-10-25';
 atomicJson(path.join(root,`data/jobs/${id}.json`),{id,period:periodFor('weekly','2026-10-26'),candidates:[{id:'web-1',kind:'web',state:'discovered',attempts:0},{id:'web-2',kind:'web',state:'discovered',attempts:0}]});
 atomicJson(path.join(root,'data/research/web-1.json'),{publishedAt:'2026-10-23T05:00:00+09:00'});
 atomicJson(path.join(root,'data/research/web-2.json'),{publishedAt:'2026-10-26T05:00:00+09:00'});
 const job=await collectJob(id,['web-1','web-2'],{root});assert.equal(job.candidates[0].state,'collected');assert.equal(job.candidates[1].state,'outside-period');
 assert.equal((await collectJob(id,['web-1'],{root})).candidates[0].attempts,1);
});
test('missing captions fall back to local audio; success and failure clean raw media',async t=>{
 const root=workspace(t);let fail=false;
 const run=async(cmd,args)=>{
  if(args.includes('--dump-single-json'))return {stdout:JSON.stringify({id:'DZ2taddIV2M',channel_id:'UCgeOlLcX6PReHdWImEnUVTg',duration:60,upload_date:'20261025'})};
  if(args.includes('--write-auto-subs'))return {stdout:''};
  if(cmd==='yt-dlp'){fs.writeFileSync(args[args.indexOf('-o')+1].replace('%(ext)s','webm'),'test audio');return {stdout:''};}
  if(fail)throw Error('모델 실행 실패');
  fs.writeFileSync(args[args.indexOf('--output')+1],JSON.stringify({segments:[{start:1,end:3,text:'전사 검토 대상'}],transcription:{reviewStatus:'unreviewed'}}));return {stdout:''};
 };
 const result=await collectBroadcast('https://www.youtube.com/watch?v=DZ2taddIV2M',{run,workRoot:root});
 assert.equal(result.captionType,'local-audio-transcription-unreviewed');assert.equal(result.segments[0].end,3);
 assert.ok(!fs.readdirSync(path.join(root,'data')).some(f=>f.startsWith('.youtube-temp-')));
 fail=true;await assert.rejects(collectBroadcast('https://www.youtube.com/watch?v=DZ2taddIV2M',{run,workRoot:root}),/모델 실행 실패/);
 assert.ok(!fs.readdirSync(path.join(root,'data')).some(f=>f.startsWith('.youtube-temp-')));
});
