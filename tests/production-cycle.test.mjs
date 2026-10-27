import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {atomicJson} from '../scripts/editorial-workflow.mjs';
import {beginCycle,finishCycle,cycleSlot} from '../scripts/production-cycle.mjs';
import {runClaudeDesk} from '../scripts/claude-desk.mjs';
import {runCommand} from '../scripts/run-command.mjs';

function workspace(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-production-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));atomicJson(path.join(root,'data/web_articles.json'),{articles:[]});atomicJson(path.join(root,'data/editions.json'),{issues:[]});return root;}
test('KST slots, overlap prevention, failed-run recovery and completed-run idempotency',async t=>{
 const root=workspace(t),now=new Date('2026-10-27T06:05:00Z');assert.equal(cycleSlot('daily',now).id,'daily-2026-10-27-15');
 const first=await beginCycle(root,'daily',{now});assert.equal(first.state,'running');assert.equal((await beginCycle(root,'weekly',{now})).skip,true);
 await assert.rejects(finishCycle(root,{id:first.id,state:'completed',summary:'done'},{now}),/단계별/);
 await finishCycle(root,{id:first.id,state:'failed',summary:'서비스 한도; 미출고'},{now});
 assert.equal((await beginCycle(root,'daily',{now})).attempt,2);
 await finishCycle(root,{id:first.id,state:'completed',summary:'새 원문 없음; 발행하지 않음',steps:[{action:'원문 비교',result:'새 후보 없음'}]},{now});
 assert.equal((await beginCycle(root,'daily',{now})).skip,true);
});
test('a stale cycle requires inspection, never silently steals the running job',async t=>{
 const root=workspace(t);await beginCycle(root,'weekly',{now:new Date('2026-10-26T09:00:00Z')});
 await assert.rejects(beginCycle(root,'weekly',{now:new Date('2026-10-26T12:00:01Z')}),/중단된 제작/);
});
test('subscription desk validates auth, records failure and reuses only completed output',async t=>{
 const root=workspace(t),binary=path.join(root,'mock-claude.exe');fs.writeFileSync(binary,'mock');let calls=0,fail=true;
 const request={id:'desk-test',articleIds:['one'],prompt:'실제 자료를 읽고 집필'};
 const run=async (cmd,args,options)=>{
  calls++;assert.equal(options.env.ANTHROPIC_API_KEY,undefined);assert.equal(options.env.ANTHROPIC_AUTH_TOKEN,undefined);
  if(args[0]==='auth')return {stdout:JSON.stringify({loggedIn:true,authMethod:'claude.ai'})};
  assert.equal(options.input,request.prompt);if(fail)return {stdout:JSON.stringify({is_error:true,result:'subscription limit'})};
  return {stdout:JSON.stringify({result:JSON.stringify({articles:[{id:'one',title:'제목',lead:'리드',bodyParagraphs:['본문']} ]})})};
 };
 await assert.rejects(runClaudeDesk(root,request,{run,binary}),/subscription limit/);
 const file=path.join(root,'data/production/desk-test/execution.json');assert.equal(JSON.parse(fs.readFileSync(file)).state,'failed');
 fail=false;assert.equal((await runClaudeDesk(root,request,{run,binary})).articles[0].id,'one');
 const count=calls;await runClaudeDesk(root,request,{run,binary});assert.equal(calls,count);
 assert.equal(JSON.parse(fs.readFileSync(file)).attempt,2);
});
test('command input preserves multibyte Korean output across small chunks',async()=>{
 const result=await runCommand(process.execPath,['-e','process.stdin.on("data",b=>{for(const x of b)process.stdout.write(Buffer.from([x]));});'],{input:'자막과 원고를 정확하게 전달합니다.',timeout:10000});
 assert.equal(result.stdout,'자막과 원고를 정확하게 전달합니다.');
});
