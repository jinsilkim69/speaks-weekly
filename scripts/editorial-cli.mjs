import fs from 'node:fs';
import path from 'node:path';
import {saveDraft,approveDraft,publishDraft,releaseEdition} from './editorial-service.mjs';
const root=path.resolve(import.meta.dirname,'..');
const [command,file]=process.argv.slice(2);
try{
 const actions={save:saveDraft,review:approveDraft,publish:publishDraft,'release-edition':releaseEdition};
 if(!actions[command]||!file)throw Error('save|review|publish|release-edition 요청.json');
 const result=await actions[command](root,JSON.parse(fs.readFileSync(file,'utf8')));
 console.log(JSON.stringify({id:result.id,revision:result.revision,status:result.status,review:result.review?.status}));
}catch(error){console.error(error.message);process.exitCode=1;}
