import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {validateEditionContent} from './editorial-catalog.mjs';
import {editionFingerprint,inspectPdf,sha256} from './pdf-proof.mjs';
import {atomicJson,withLock} from './editorial-workflow.mjs';

export async function buildEdition(root,edition,{testOnly=false,previewOnly=false}={}) {
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(edition.id||''))throw Error('주간호 ID가 필요합니다.');
  validateEditionContent(edition,root,{allowUnreviewed:previewOnly});
  if(!edition.title?.trim()||!edition.period?.trim()||!Array.isArray(edition.introduction)||!edition.introduction.length||edition.introduction.some(p=>typeof p!=='string'||!p.trim()))throw Error('제호·대상 기간·발행인의 말이 필요합니다.');
  return withLock(root,()=>{
    const catalog=path.join(root,'data/editions.json');
    if(fs.existsSync(catalog)&&JSON.parse(fs.readFileSync(catalog,'utf8')).issues.some(i=>i.id===edition.id&&i.status==='published'))throw Error('발행된 주간호의 PDF를 덮어쓸 수 없습니다.');
    const dir=path.join(root,'output/pdf',edition.id);fs.mkdirSync(dir,{recursive:true});
    const input=path.join(dir,'edition.json'),temp=path.join(dir,'proof.tmp.pdf'),output=path.join(dir,'proof.pdf');
    const ready={...edition,status:'draft',pdfUrl:`/editions/${edition.id}.pdf`};delete ready.pdfReview;
    atomicJson(input,ready);
    if(ready.layout?.autoExpand){
      const planned=JSON.parse(execFileSync(process.env.SPEAKS_PYTHON||'python',['-X','utf8',path.join(import.meta.dirname,'render-edition.py'),input,temp,'--root',root,'--hash','planning','--plan-only'],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:1024*1024}));
      ready.pageCounts=planned.pageCounts;atomicJson(input,ready);
    }
    try {
      execFileSync(process.env.SPEAKS_PYTHON||'python',['-X','utf8',path.join(import.meta.dirname,'render-edition.py'),input,temp,'--root',root,'--hash',editionFingerprint(ready,root),...(testOnly?['--test-only']:[]),...(previewOnly?['--preview-only']:[])],{encoding:'utf8',stdio:['ignore','pipe','pipe'],windowsHide:true,timeout:120000,maxBuffer:1024*1024});
      const proof=inspectPdf(temp);
      if(proof.pages!==3+Math.ceil(ready.articleSnapshots.length/14)+(ready.pageCounts||[2,2,2,5,5,4,4,4,4,4,3,3,2,2]).reduce((n,x)=>n+x,0)||!proof.a4||proof.emptyPages.length)throw Error('PDF 구조 검사 실패');
      fs.renameSync(temp,output);
      ready.pdfReview={pages:proof.pages,sha256:sha256(fs.readFileSync(output)),visualCheck:false,summary:'',reviewedAt:null};
      atomicJson(input,ready);
      return {input,output,proof,message:'시각 검수 후 PDF를 public/editions에 복사하고 release-edition으로 출고하세요. 시험 PDF는 출고할 수 없습니다.'};
    } finally {fs.rmSync(temp,{force:true});}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(import.meta.dirname,'build-edition.mjs')) {
  try {const file=process.argv[2];if(!file)throw Error('build-edition.mjs 주간호.json [--test-only]');console.log(JSON.stringify(await buildEdition(path.resolve(import.meta.dirname,'..'),JSON.parse(fs.readFileSync(file,'utf8')),{testOnly:process.argv.includes('--test-only')}),null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
