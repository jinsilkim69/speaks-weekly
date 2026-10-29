import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {writerProfiles,reporterBrief,assignReporter,reporterLength,validateReporter} from '../scripts/writer-profiles.mjs';
import {runClaudeDesk} from '../scripts/claude-desk.mjs';
import {contentHash} from '../scripts/editorial-catalog.mjs';
const root=path.resolve(import.meta.dirname,'..');

test('named AI reporters share values but retain different beats; disclosure and length are enforced',()=>{
 const config=writerProfiles(root);assert.equal(new Set(config.profiles.map(p=>p.name)).size,7);
 assert.match(config.common.identity,/자발적 이타주의/);
 const base={id:'politics-copy',lead:'핵심',bodyParagraphs:['## 분량에서 제외할 소제목','가'.repeat(5100)]};
 const article=assignReporter(base,config.profiles[0]);assert.equal(reporterLength(article),5104);validateReporter(article,root);
 assert.throws(()=>validateReporter({...article,writer:{...article.writer,disclosure:''}},root),/표시/);
 assert.throws(()=>validateReporter({...article,bodyParagraphs:['짧은 원고']},root),/5,000|5000/);
 assert.notEqual(contentHash(article),contentHash({...article,writer:{...article.writer,name:'다른 필명'}}));
 const html=fs.readFileSync(path.join(root,'public/reporters.html'),'utf8');for(const p of config.profiles)assert.ok(html.includes(p.name));
});

test('actual subscription prompt includes assigned voice and common philosophy; profile changes invalidate cached writing',async t=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-writer-'));t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
 for(const file of ['data/editorial/writer-profiles.json','skills/speaks-weekly-writing/SKILL.md']){fs.mkdirSync(path.dirname(path.join(tmp,file)),{recursive:true});fs.copyFileSync(path.join(root,file),path.join(tmp,file));}
 const request={id:'named-writer',articleIds:['a'],articleProfiles:{a:'economy'},prompt:'실제 원문에 근거해 집필'};
 const prompts=[];const run=async(cli,args,options)=>{if(args[0]==='auth')return{stdout:JSON.stringify({loggedIn:true,authMethod:'claude.ai'})};prompts.push(options.input);return{stdout:JSON.stringify({result:JSON.stringify({articles:[{id:'a',title:'제목',lead:'도입',bodyParagraphs:['나'.repeat(5100)]}]})})};};
 let result=await runClaudeDesk(tmp,request,{run,binary:process.execPath});assert.equal(result.articles[0].author,'윤해림 기자');assert.equal(result.articles[0].writer.disclosure,'AI 기자');
 assert.match(prompts[0],/자발적 이타주의/);assert.match(prompts[0],/이재명 대통령/);assert.match(prompts[0],/5000|5,000/);assert.match(prompts[0],/윤해림/);
 await runClaudeDesk(tmp,request,{run,binary:process.execPath});assert.equal(prompts.length,1);
 const file=path.join(tmp,'data/editorial/writer-profiles.json'),config=JSON.parse(fs.readFileSync(file));config.profiles.find(p=>p.id==='economy').voice+=' 바뀐 집필 기준';fs.writeFileSync(file,JSON.stringify(config));
 await runClaudeDesk(tmp,request,{run,binary:process.execPath});assert.equal(prompts.length,2);assert.match(prompts[1],/바뀐 집필 기준/);assert.ok(fs.existsSync(path.join(tmp,'data/production/named-writer/history/attempt-1/execution.json')));
 assert.throws(()=>reporterBrief(tmp,{...request,articleProfiles:{a:'missing'}}),/알 수 없는/);assert.throws(()=>reporterBrief(tmp,{id:'no-reporter',prompt:'집필'}),/기자 프로필/);
});
