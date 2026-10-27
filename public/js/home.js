const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => /^https:\/\//.test(value || '') || /^\/(?!\/)/.test(value || '') ? esc(value) : '#';
const inline = value => esc(value).replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
const date = value => new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
let articles = [], trigger, fontSize=18;
const reader=document.getElementById('reader');
function figure(a){return `<figure><img src="${safeUrl(a.visual.url)}" alt="${esc(a.visual.alt)}" width="1000" height="680"><figcaption>${esc(a.visual.caption)} · ${esc(a.visual.credit)}</figcaption></figure>`;}
function watchImages(){document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.classList.add('image-failed');},{once:true}));}
function openArticle(id){
 const a=articles.find(x=>x.id===id);if(!a)return;
 trigger=document.activeElement;
 document.getElementById('article-content').innerHTML=`<span class="eyebrow">${esc(a.category)} / ${esc(a.genre)}</span><h1 id="article-title">${esc(a.title)}</h1><p class="subtitle">${esc(a.subtitle)}</p><p class="byline">${esc(a.author)} · ${date(a.publishedAt)}</p>${figure(a)}<div class="article-prose"><p class="article-lead">${inline(a.lead)}</p>${a.bodyParagraphs.map(p=>p.startsWith('## ')?`<h2>${esc(p.slice(3))}</h2>`:`<p>${inline(p)}</p>`).join('')}</div><aside class="source-box"><strong>출처와 검증 범위</strong><p>${esc(a.verificationNote)}</p>${a.sources.map(s=>`<a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</aside>`;
 if(!reader.open)reader.showModal();reader.scrollTop=0;document.body.style.overflow='hidden';
 document.getElementById('copy-status').textContent='';document.getElementById('close-reader').focus();watchImages();
}
function closeArticle(){reader.close();history.replaceState(null,'',location.pathname+location.search);}
document.getElementById('close-reader').onclick=closeArticle;
reader.addEventListener('close',()=>{document.body.style.overflow='';trigger?.focus();});
reader.addEventListener('cancel',()=>history.replaceState(null,'',location.pathname+location.search));
document.getElementById('font-up').onclick=()=>{fontSize=Math.min(24,fontSize+1);reader.style.setProperty('--reading-size',`${fontSize}px`);};
document.getElementById('font-down').onclick=()=>{fontSize=Math.max(16,fontSize-1);reader.style.setProperty('--reading-size',`${fontSize}px`);};
document.getElementById('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);document.getElementById('copy-status').textContent='복사했습니다.';}catch{document.getElementById('copy-status').textContent='주소창의 기사 주소를 복사해 주세요.';}};
function route(){if(location.hash.startsWith('#article/')){try{openArticle(decodeURIComponent(location.hash.slice(9)));}catch{}}else if(reader.open)reader.close();}
window.addEventListener('hashchange',route);
async function load(){try{
 const res=await fetch('/api/home');if(!res.ok)throw Error('HTTP');const data=await res.json();articles=data.articles;
 document.getElementById('updated').textContent=data.updatedAt?`최근 기사 게시 ${date(data.updatedAt)}`:'새 기사를 준비하고 있습니다.';
 const a=articles[0];document.getElementById('lead').innerHTML=a?`<div class="lead-story">${figure(a)}<div><span class="eyebrow">${esc(a.category)} / ${esc(a.genre)}</span><h1><a href="#article/${encodeURIComponent(a.id)}">${esc(a.title)}</a></h1><p class="subtitle">${esc(a.subtitle)}</p><p class="byline">${esc(a.author)} · ${date(a.publishedAt)}</p><a class="read-link" href="#article/${encodeURIComponent(a.id)}">분석 전문 읽기 →</a></div></div>`:'<p class="error">출고 검토를 마친 기사를 준비하고 있습니다.</p>';
 document.getElementById('more').className='more-grid';document.getElementById('more').innerHTML=articles.slice(1).map(a=>`<article class="story-card"><span class="eyebrow">${esc(a.category)}</span><h2><a href="#article/${encodeURIComponent(a.id)}">${esc(a.title)}</a></h2><p>${esc(a.subtitle)}</p></article>`).join('');
 document.getElementById('editions').innerHTML=data.editions.length?data.editions.map(i=>`<article class="issue-card"><span class="status">${i.status==='published'?'발행 완료':'편집 중'}</span><h3>${esc(i.title)}</h3><p>대상 기간 ${esc(i.period)}</p>${i.status==='published'?`<a class="read-link" href="${safeUrl(i.pdfUrl)}">주간지 PDF 읽기 →</a>`:'<p>기사와 지면 검토를 마친 뒤 완성호를 공개합니다.</p>'}</article>`).join(''):'<p>첫 주간지를 준비하고 있습니다.</p>';
 watchImages();route();
 }catch(err){document.getElementById('lead').innerHTML='<div class="error" role="alert">기사를 불러오지 못했습니다. <button id="retry">다시 불러오기</button></div>';document.getElementById('updated').textContent='기사 연결 확인 필요';document.getElementById('retry').onclick=load;}}
load();
