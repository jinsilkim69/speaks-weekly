import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {readHomeCatalog,contentHash} from './editorial-catalog.mjs';

const base=new URL(process.argv[2]||'https://speaks-magazine.okok5598.workers.dev');
if(!['http:','https:'].includes(base.protocol))throw Error('HTTP 주소가 필요합니다.');
const root=path.resolve(import.meta.dirname,'..');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function get(url){const response=await fetch(new URL(url,base),{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`${url}: HTTP ${response.status}`);return response;}
const home=await (await get('/api/home')).json();
const expected=readHomeCatalog(root);
if(home.articles.length!==expected.articles.length||expected.articles.some(a=>!home.articles.some(b=>b.id===a.id&&contentHash(b)===contentHash(a)))||JSON.stringify(home.programs)!==JSON.stringify(expected.programs)||home.featuredEpisodeId!==expected.featuredEpisodeId||JSON.stringify(home.reviewPeriod)!==JSON.stringify(expected.reviewPeriod))throw Error('홈페이지 원고·코너·회차 배포본이 현재 검수본과 일치하지 않습니다.');
const assets=new Set(),issues=[];
function checkArticles(items){for(const a of items){if(!a.title?.trim()||!a.lead?.trim()||!a.bodyParagraphs?.length||!a.sources?.length||!a.visual?.credit)throw Error(`${a.id}: 기사 전문·출처·이미지 정보 부족`);for(const s of a.sources)if(!/^https?:\/\//.test(s.url))throw Error(`${a.id}: 잘못된 출처 URL`);for(const v of [a.visual,...(a.supportingVisuals||[])]){if(!v.url.startsWith('/'))throw Error(`${a.id}: 로컬 이미지 주소가 필요합니다.`);assets.add(v.url);}}}
checkArticles(home.articles);
for(const issue of home.editions.filter(i=>i.status==='published')){
 const edition=await (await get('/api/editions/'+encodeURIComponent(issue.id)+'.json')).json();
 if(edition.articleSnapshots.length!==14)throw Error(`${issue.id}: 기사 14개 필요`);
 checkArticles(edition.articleSnapshots);
 const pdf=await get(edition.pdfUrl);if(!pdf.headers.get('content-type')?.includes('application/pdf'))throw Error('PDF MIME 오류');
 const bytes=Buffer.from(await pdf.arrayBuffer()),sha=digest(bytes);
 if(sha!==edition.pdfReview.sha256||sha!==digest(fs.readFileSync(path.join(root,'public',edition.pdfUrl))))throw Error(`${issue.id}: PDF 검수본 불일치`);
 assets.add('/images/editions/'+encodeURIComponent(issue.id)+'-cover.jpg');
 issues.push({id:issue.id,articles:edition.articleSnapshots.length,pdfBytes:bytes.length,pdfSha256:sha});
}
for(const asset of assets){const response=await get(asset);if(!(await response.arrayBuffer()).byteLength)throw Error(`${asset}: 빈 이미지`);}
for(const asset of ['/index.html','/css/home.css','/js/home.js']){
 const response=await get(asset),bytes=Buffer.from(await response.arrayBuffer());
 // Git normalizes Windows CRLF to LF in the deployment checkout.
 if(bytes.toString('utf8').replace(/\r\n/g,'\n')!==fs.readFileSync(path.join(root,'public',asset),'utf8').replace(/\r\n/g,'\n'))throw Error(`${asset}: 새 UI 배포가 아직 반영되지 않았습니다.`);
}
const html=await (await get('/')).text();
const ogImage=/<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
if(!ogImage||new URL(ogImage).origin!==base.origin&&base.hostname!=='127.0.0.1')throw Error('공유 대표 이미지의 절대 주소가 필요합니다.');
const sharePath=new URL(ogImage).pathname,shareResponse=await get(sharePath),shareBytes=Buffer.from(await shareResponse.arrayBuffer());
if(!shareResponse.headers.get('content-type')?.includes('image/png')||shareBytes.readUInt32BE(16)!==1200||shareBytes.readUInt32BE(20)!==600)throw Error('공유 카드가 올바른 2:1 PNG가 아닙니다.');
console.log(JSON.stringify({checkedAt:new Date().toISOString(),base:base.origin,homepageArticles:home.articles.length,programs:home.programs?.length||0,episodes:home.articles.filter(a=>a.episode).length,issues,images:assets.size,uiMatchesLocal:true,shareCard:{url:ogImage,width:1200,height:600,bytes:shareBytes.length}},null,2));
