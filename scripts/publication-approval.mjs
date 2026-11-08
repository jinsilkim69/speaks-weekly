import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {editionFingerprint,editionFingerprintV2} from './pdf-proof.mjs';

// Pagination is decided after manuscript approval. Text, order, images and
// layout settings remain bound to the exact version the user completed.
export const approvalFingerprint=(edition,root)=>edition.releasePreparation?.fingerprintVersion===2?editionFingerprintV2(edition,root):editionFingerprint({...edition,pageCounts:undefined},root);

export function assertPublicationApproval(root,edition){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(edition?.id||''))throw Error('주간호 ID가 필요합니다.');
 const file=path.join(root,'data/edition-drafts',edition.id+'.json');
 if(!fs.existsSync(file))throw Error('관리자에서 사용자 검수 완료를 눌러야 발행할 수 있습니다.');
 const draft=JSON.parse(fs.readFileSync(file,'utf8')),approval=draft.publicationApproval;
 if(approval?.method!=='admin-complete'||!approval.confirmedAt||!approval.summary?.trim()||approval.revision!==draft.draftRevision||draft.publicationRequest?.state!=='queued')throw Error('관리자에서 현재 원고의 검수 완료·발행 승인이 필요합니다.');
 if(approval.fingerprint!==approvalFingerprint(draft,root)||approval.fingerprint!==approvalFingerprint(edition,root))throw Error('사용자 검수 완료 뒤 원고·사진·편성이 변경됐습니다. 다시 검수 완료를 눌러 주세요.');
 if(approval.proofSha256){
  const proof=path.join(root,'output/pdf',edition.id,'proof.pdf');
  if(!fs.existsSync(proof)||sha256File(proof)!==approval.proofSha256)throw Error('발행인 승인 뒤 교정쇄가 변경됐습니다. 다시 검수해 주세요.');
  const output=path.join(root,'public',String(edition.pdfUrl||''));
  if(!fs.existsSync(output)||sha256File(output)!==approval.proofSha256)throw Error('승인받은 교정쇄와 발행 PDF가 다릅니다.');
 }
 return approval;
}
function sha256File(file){return createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
