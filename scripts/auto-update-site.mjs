// Broadcast-only deployment. Never build the working tree or include draft issues.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dryRun=process.argv.includes('--dry-run');
const run=(cmd,args,cwd=root)=>execFileSync(cmd,args,{cwd,encoding:'utf8',shell:process.platform==='win32',timeout:900000,stdio:['ignore','pipe','pipe']});
const signature=entries=>JSON.stringify(entries.map(({verifiedAt,...rest})=>rest));
const base=path.join(root,'data/production/broadcast-base');
const versionFile=path.join(root,'data/production/broadcast-base-version.txt');
const deployedVersion=()=>{const d=JSON.parse(run('npx',['wrangler','deployments','list','--json']));const x=d.sort((a,b)=>a.created_on.localeCompare(b.created_on)).at(-1);if(!x||x.versions?.length!==1||x.versions[0].percentage!==100)throw Error('현재 공개 버전을 확정할 수 없습니다.');return x.versions[0].version_id;};
const response=await fetch('https://speaks-magazine.okok5598.workers.dev/api/home.json',{cache:'no-store',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('공개 목록 확인 실패: HTTP '+response.status);
const current=await response.json();if(!Array.isArray(current.officialDirectory?.entries))throw Error('공개 목록 형식 오류');
console.log(run('python',['-X','utf8','scripts/refresh-official-links.py']).trim().slice(-300));
const report=JSON.parse(fs.readFileSync(path.join(root,'data/production/official-links-refresh.json'),'utf8'));if(report.state==='failed'||report.state==='partial'||(report.errors||[]).length)throw Error('수집 실패 또는 부분 실패: 배포 중단');
const local=JSON.parse(fs.readFileSync(path.join(root,'data/official-links.json'),'utf8'));if(!local.entries?.length)throw Error('공식 목록이 비었습니다');
if(!dryRun&&signature(local.entries)===signature(current.officialDirectory.entries)){console.log('공개 목록과 일치');process.exit(0);}
if(!fs.existsSync(base)||!fs.existsSync(versionFile))throw Error('공개 기준본이 없습니다.');
const expected=fs.readFileSync(versionFile,'utf8').trim();if(deployedVersion()!==expected)throw Error('공개 사이트가 다른 배포로 바뀌어 안전하게 중단했습니다.');
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'speaks-broadcast-'));const assets=path.join(stage,'assets');fs.cpSync(base,assets,{recursive:true});
const home=JSON.parse(fs.readFileSync(path.join(assets,'api/home.json'),'utf8'));
if(JSON.stringify({...home,officialDirectory:null})!==JSON.stringify({...current,officialDirectory:null}))throw Error('공개 홈페이지와 기준본이 달라 배포를 중단했습니다.');
home.officialDirectory=local;
for(const e of local.entries){if(!e.image)continue;const u=e.image.url;if(!/^\/images\/broadcasts\/[A-Za-z0-9_-]+\.jpg$/.test(u))throw Error('유효하지 않은 방송 이미지 경로');const src=path.join(root,'public',u.slice(1));const data=fs.readFileSync(src);if(crypto.createHash('sha256').update(data).digest('hex')!==e.image.sha256)throw Error('방송 썸네일 해시 불일치: '+e.id);const dst=path.join(assets,u.slice(1));fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,data);}
for(const name of ['home','home.json'])fs.writeFileSync(path.join(assets,'api',name),JSON.stringify(home,null,2));
for(const e of home.editions||[])if(e.status==='published'&&e.pdfUrl&&!fs.existsSync(path.join(assets,e.pdfUrl.slice(1))))throw Error('공개 발행호 PDF 누락: '+e.id);
if(deployedVersion()!==expected)throw Error('배포 준비 중 공개 사이트가 변경됐습니다.');
if(dryRun){console.log('방송 전용 배포본 검증 완료: GitHub 푸시와 배포는 실행하지 않음');process.exit(0);}
// Update only the verified directory and its referenced thumbnails in an isolated GitHub checkout.
const repo=path.join(stage,'github');run('git',['clone','--depth','1','--branch','main','https://github.com/jinsilkim69/speaks-weekly.git',repo]);
fs.copyFileSync(path.join(root,'data/official-links.json'),path.join(repo,'data/official-links.json'));
for(const e of local.entries){if(!e.image)continue;const rel=e.image.url.slice(1);const dest=path.join(repo,'public',rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(assets,rel),dest);}
run('git',['add','--','data/official-links.json','public/images/broadcasts'],repo);
const staged=run('git',['diff','--cached','--name-only'],repo).trim();
if(staged){run('git',['commit','-m','Update verified official broadcast links'],repo);run('git',['push','origin','main'],repo);}
if(deployedVersion()!==expected)throw Error('GitHub 반영 중 공개 사이트가 변경됐습니다.');
const config=path.join(stage,'wrangler.toml');fs.writeFileSync(config,'name = "speaks-magazine"\ncompatibility_date = "2026-10-26"\n[assets]\ndirectory = "./assets"\n');
console.log(run('npx',['wrangler','deploy','--config',config]).trim().slice(-700));
const final=await (await fetch('https://speaks-magazine.okok5598.workers.dev/api/home.json',{cache:'no-store',signal:AbortSignal.timeout(20000)})).json();if(signature(final.officialDirectory.entries)!==signature(local.entries))throw Error('배포 후 공개 목록 불일치');
const newVersion=deployedVersion();const previous=base+'-previous-'+Date.now();fs.renameSync(base,previous);fs.cpSync(assets,base,{recursive:true});fs.writeFileSync(versionFile,newVersion+'\n');
console.log('방송 목록 GitHub 반영, 배포 및 공개 확인 완료.');



