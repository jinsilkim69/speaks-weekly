import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {runCommand} from './run-command.mjs';
import {atomicJson} from './editorial-workflow.mjs';

export async function runClaudeDesk(root,request,{run=runCommand,binary}={}){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(request.id||'')||typeof request.prompt!=='string'||!request.prompt.trim())throw Error('집필 요청 ID와 프롬프트가 필요합니다.');
 const dir=path.join(root,'data/production',request.id),file=path.join(dir,'execution.json');
 fs.mkdirSync(dir,{recursive:true});
 const hash=createHash('sha256').update(request.prompt).digest('hex');
 const previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 if(previous?.state==='completed'&&previous.promptHash===hash)return JSON.parse(fs.readFileSync(path.join(dir,'result.json'),'utf8'));
 const cli=binary||process.env.SPEAKS_CLAUDE_BIN||path.join(process.env.APPDATA||'','npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe');
 if(!fs.existsSync(cli))throw Error('구독 로그인된 Claude CLI가 필요합니다. SPEAKS_CLAUDE_BIN으로 실행 파일을 지정하세요.');
 const env={...process.env};for(const key of ['ANTHROPIC_API_KEY','ANTHROPIC_AUTH_TOKEN','ANTHROPIC_BASE_URL'])delete env[key];
 const state={id:request.id,provider:'claude-subscription-cli',promptHash:hash,state:'running',startedAt:new Date().toISOString(),attempt:(previous?.attempt||0)+1};
 atomicJson(file,state);
 try{
  const auth=JSON.parse((await run(cli,['auth','status'],{env,timeout:30000})).stdout);
  if(!auth.loggedIn||auth.authMethod!=='claude.ai')throw Error('Claude 구독 로그인을 확인하지 못했습니다. API로 우회하지 않습니다.');
  const response=await run(cli,['-p','--tools','','--output-format','json'],{env,input:request.prompt,timeout:600000,maxBuffer:12*1024*1024,cwd:root});
  const raw=JSON.parse(response.stdout);if(raw.is_error||typeof raw.result!=='string')throw Error('Claude 집필 실패: '+String(raw.result||raw.subtype||'결과 없음').slice(0,1000));
  const text=raw.result.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  const result=JSON.parse(text);
  if(!Array.isArray(result.articles)||!result.articles.length)throw Error('기사 배열을 받지 못했습니다.');
  if(request.articleIds&&(result.articles.length!==request.articleIds.length||request.articleIds.some(id=>!result.articles.some(a=>a.id===id))))throw Error('요청한 기사 목록과 집필 결과가 다릅니다.');
  for(const a of result.articles)if(!a.title?.trim()||!a.lead?.trim()||!Array.isArray(a.bodyParagraphs)||!a.bodyParagraphs.length||a.bodyParagraphs.some(p=>typeof p!=='string'||!p.trim()))throw Error('불완전한 원고: '+a.id);
  atomicJson(path.join(dir,'result.json'),result);
  atomicJson(file,{...state,state:'completed',completedAt:new Date().toISOString(),articleIds:result.articles.map(a=>a.id),model:raw.model||null,reviewRequired:true});
  return result;
 }catch(error){atomicJson(file,{...state,state:'failed',finishedAt:new Date().toISOString(),error:error.message.slice(0,1500)});throw error;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(import.meta.dirname,'claude-desk.mjs')){
 try{const file=process.argv[2];if(!file)throw Error('claude-desk.mjs 요청.json');const result=await runClaudeDesk(path.resolve(import.meta.dirname,'..'),JSON.parse(fs.readFileSync(file,'utf8')));console.log(JSON.stringify({articles:result.articles.map(a=>({id:a.id,title:a.title,characters:a.lead.length+a.bodyParagraphs.filter(p=>!p.startsWith('## ')).join('').length}))}));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
