import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(here,'manifest.json'),'utf8'));
const stage=path.resolve(process.argv[2]||'');
const assets=path.join(stage,'assets');
for(const [name,want] of Object.entries(manifest.files)) {
 const file=path.join(assets,...name.split('/'));
 if(!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==want) throw Error('배포 파일 불일치: '+name);
}
const npx=process.platform==='win32'?'npx.cmd':'npx';
const config=path.join(stage,'wrangler-release.toml');
fs.writeFileSync(config,'name = "speaks-magazine"\ncompatibility_date = "2026-10-26"\n[assets]\ndirectory = "./assets"\n');
const opt={encoding:'utf8',shell:process.platform==='win32',stdio:['ignore','pipe','pipe']};
const deployments=JSON.parse(execFileSync(npx,['--yes','wrangler','deployments','list','--json','--config',config],opt));
const latest=deployments.sort((a,b)=>a.created_on.localeCompare(b.created_on)).at(-1);
if(latest?.versions?.length!==1||latest.versions[0].percentage!==100||latest.versions[0].version_id!==manifest.baseVersion) throw Error('운영 사이트가 변경되어 배포를 중단했습니다.');
execFileSync(npx,['--yes','wrangler','deploy','--config',config],{...opt,stdio:'inherit'});
