import fs from 'node:fs';
import path from 'node:path';
import {editionFingerprint} from './pdf-proof.mjs';

// Pagination is decided after manuscript approval. Text, order, images and
// layout settings remain bound to the exact version the user completed.
export const approvalFingerprint=(edition,root)=>editionFingerprint({...edition,pageCounts:undefined},root);

export function assertPublicationApproval(root,edition){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(edition?.id||''))throw Error('주간호 ID가 필요합니다.');
 const file=path.join(root,'data/edition-drafts',edition.id+'.json');
 if(!fs.existsSync(file))throw Error('관리자에서 사용자 검수 완료를 눌러야 발행할 수 있습니다.');
 const draft=JSON.parse(fs.readFileSync(file,'utf8')),approval=draft.publicationApproval;
 if(approval?.method!=='admin-complete'||!approval.confirmedAt||!approval.summary?.trim()||approval.revision!==draft.draftRevision||draft.publicationRequest?.state!=='queued')throw Error('관리자에서 현재 원고의 검수 완료·발행 승인이 필요합니다.');
 if(approval.fingerprint!==approvalFingerprint(draft,root)||approval.fingerprint!==approvalFingerprint(edition,root))throw Error('사용자 검수 완료 뒤 원고·사진·편성이 변경됐습니다. 다시 검수 완료를 눌러 주세요.');
 return approval;
}
