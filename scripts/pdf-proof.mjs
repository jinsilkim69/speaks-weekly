import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function editionFingerprint(edition, root) {
  const assets = edition.articleSnapshots.flatMap(a => [a.visual,...(a.supportingVisuals||[])]).map(v => {
    if (!v.url.startsWith('/')) throw Error('PDF 이미지는 사용 근거를 확인한 로컬 파일로 준비하세요.');
    const base=path.resolve(root,'public'),file=path.resolve(base,'.'+v.url),rel=path.relative(base,file);
    if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('이미지 경로가 공개 폴더 밖입니다.');
    return {url:v.url,sha256:sha256(fs.readFileSync(file))};
  });
  return sha256(JSON.stringify({id:edition.id,title:edition.title,period:edition.period,coverArticleId:edition.coverArticleId,introduction:edition.introduction,articleSnapshots:edition.articleSnapshots,assets}));
}
export function inspectPdf(file) {
  try {
    return JSON.parse(execFileSync(process.env.SPEAKS_PYTHON||'python',['-X','utf8',path.join(import.meta.dirname,'inspect-pdf.py'),file],{encoding:'utf8',stdio:['ignore','pipe','pipe'],windowsHide:true,timeout:30000,maxBuffer:1024*1024}));
  } catch(error) {throw Error('실제 PDF 검사 실패: '+(error.stderr?.toString().trim()||error.message));}
}
