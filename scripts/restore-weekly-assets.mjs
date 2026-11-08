import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Previously published assets are hosted by the site, not duplicated in Git.
// The hash manifest prevents a changed remote asset from entering a build.
const root=path.resolve(import.meta.dirname,'..');
const publicDir=path.resolve(root,'public');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/weekly-asset-manifest-2026-11-09.json'),'utf8'));
if(manifest.baseUrl!=='https://speaks-magazine.okok5598.workers.dev')throw Error('주간지 자산 출처가 올바르지 않습니다.');
for(const asset of manifest.assets){
 if(!/^(?:images\/[A-Za-z0-9_./-]+\.(?:png|jpe?g)|editions\/[A-Za-z0-9_.-]+\.pdf)$/.test(asset.path)||asset.path.includes('..')||!/^[a-f0-9]{64}$/.test(asset.sha256))throw Error('주간지 자산 목록이 올바르지 않습니다.');
 const file=path.resolve(publicDir,asset.path),rel=path.relative(publicDir,file);
 if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('자산 경로가 공개 폴더 밖입니다.');
 const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
 if(fs.existsSync(file)){
  if(digest(fs.readFileSync(file))!==asset.sha256)throw Error('기존 자산이 승인된 파일과 달라 덮어쓰지 않았습니다: '+asset.path);
  continue;
 }
 const response=await fetch(manifest.baseUrl+'/'+asset.path,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error('공개 자산을 불러오지 못했습니다: '+asset.path+' HTTP '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length!==asset.bytes||digest(bytes)!==asset.sha256)throw Error('공개 자산의 크기 또는 지문이 다릅니다: '+asset.path);
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});
 console.log('복원:',asset.path);
}
