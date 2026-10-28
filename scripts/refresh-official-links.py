"""Refresh the SPEAKS link directory. Never generate or republish review copy."""
import argparse, concurrent.futures, importlib.util, json, re, sys, urllib.parse, urllib.request, hashlib, io, contextlib
from pathlib import Path
from datetime import datetime, timedelta, timezone
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('speaks_news',ROOT/'scripts/collect-news.py')
news=importlib.util.module_from_spec(spec);spec.loader.exec_module(news)
KST=timezone(timedelta(hours=9))
ALIASES=[('conservative-strategy',['보수의전략','보수의 전략']),('jongdae-radar',['김종대의레이더','김종대의 레이더']),('veterans',['역전의용사들','역전의 용사들']),('special-interview',['특집인터뷰','특집 인터뷰']),('beijing-direct',['북경발']),('machiavelli',['마키아벨리']),('telephone-report',['전화인터뷰','전화 인터뷰'])]
def extract(soup,url):
    def meta(key):
        tag=soup.find('meta',property=key)
        return tag.get('content','').strip() if tag else ''
    heading=soup.select_one('h1.heading')
    title=heading.get_text(' ',strip=True) if heading else ''
    published=meta('article:published_time')
    if not title or not published: raise ValueError('공식 제목 또는 입력일 없음')
    published_date=datetime.fromisoformat(published).astimezone(KST).date().isoformat()
    program=next((ident for ident,words in ALIASES if any(w in title for w in words)),None)
    if not program: return None
    body=soup.select_one('#article-view-content-div')
    text=body.get_text(' ',strip=True) if body else ''
    broadcast=None;basis='published'
    match=re.search(r'방송\s*[:：]\s*(20\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일',text)
    if not match: match=re.search(r'방송\s*[:：]\s*(20\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})',text)
    if match:
        broadcast=f'{int(match[1]):04d}-{int(match[2]):02d}-{int(match[3]):02d}';basis='article-broadcast-date'
    video=None
    for iframe in soup.select('#article-view-content-div iframe[src]'):
        m=re.search(r'(?:youtube(?:-nocookie)?\.com/embed/|youtu\.be/)([-_a-zA-Z0-9]{11})(?:[?/#]|$)',iframe.get('src',''))
        if m: video='https://www.youtube.com/watch?v='+m[1];break
    return {'id':'official-'+urllib.parse.parse_qs(urllib.parse.urlparse(url).query)['idxno'][0],'programId':program,'title':title,'verifiedTitle':title,'url':url,'publishedAt':published,'broadcastDate':broadcast,'dateBasis':basis,'displayDate':broadcast or published_date,'videoUrl':video,'verifiedAt':datetime.now(KST).isoformat(),'verification':'공식 h1 제목·입력일·본문 방송일·실제 iframe 주소 확인; 본문 재게재 안 함'}
def attach_image(entry):
    if not entry.get('videoUrl'): return entry
    video=urllib.parse.parse_qs(urllib.parse.urlparse(entry['videoUrl']).query)['v'][0]
    asset=ROOT/'public/images/broadcasts'/f'{video}.jpg'
    asset.parent.mkdir(parents=True,exist_ok=True)
    source=f'https://i.ytimg.com/vi/{video}/hqdefault.jpg'
    if not asset.exists():
        with urllib.request.urlopen(urllib.request.Request(source,headers={'User-Agent':'Mozilla/5.0'}),timeout=20) as response:
            raw=response.read(2_000_000)
            if not response.headers.get('Content-Type','').startswith('image/'): raise ValueError('방송 썸네일 이미지가 아님')
        from PIL import Image
        with Image.open(io.BytesIO(raw)) as image:
            if image.width<300 or image.height<160: raise ValueError('방송 썸네일 크기 확인 필요')
        temp=asset.with_suffix('.jpg.tmp');temp.write_bytes(raw);temp.replace(asset)
    from PIL import Image
    raw=asset.read_bytes()
    with Image.open(asset) as image: width,height=image.size
    entry['image']={'url':'/images/broadcasts/'+asset.name,'kind':'thumbnail','width':width,'height':height,'alt':'스픽스 원본 방송 썸네일','credit':'스픽스 @SPEAKS_TV','sourceUrl':entry['videoUrl'],'assetSourceUrl':source,'sha256':hashlib.sha256(raw).hexdigest()}
    return entry

def refresh(pages=3):
    target=ROOT/'data/official-links.json'
    previous=json.loads(target.read_text(encoding='utf-8')) if target.exists() else {'entries':[]}
    discovery_log=io.StringIO()
    try:
        with contextlib.redirect_stderr(discovery_log): found=list(news.discover(pages,section='S1N8'))
    except Exception as error:
        write_log({'state':'failed','checkedAt':datetime.now(KST).isoformat(),'error':str(error),'requests':news.request_events,'preserved':len(previous['entries'])})
        raise
    urls={x['url'] for x in found}
    catalog=json.loads((ROOT/'data/web_articles.json').read_text(encoding='utf-8'))
    for a in catalog['articles']:
        if a.get('episode'):
            urls.update(s['url'] for s in a.get('sources',[]) if s['url'].startswith('https://www.speaks.kr/news/articleView.html?idxno='))
    # Recheck previously discovered official URLs; discovery pagination can repeat page one.
    known={}
    for jobfile in (ROOT/'data/jobs').glob('*.json'):
        try:
            for item in json.loads(jobfile.read_text(encoding='utf-8')).get('candidates',[]):
                if item.get('kind')=='web' and any(word in item.get('title','') for _,words in ALIASES for word in words): known[item['url']]=item
        except (ValueError,KeyError): pass
    urls.update(sorted(known,key=lambda u:int(urllib.parse.parse_qs(urllib.parse.urlparse(u).query).get('idxno',['0'])[0]),reverse=True)[:120])
    urls.update(x['url'] for x in previous['entries'])
    errors=[];verified=[];excluded=set()
    def collect(url):
        entry=extract(news.fetch(url),url)
        return attach_image(entry) if entry else None
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        pending={pool.submit(collect,u):u for u in sorted(urls)}
        for task in concurrent.futures.as_completed(pending):
            try:
                item=task.result()
                if item: verified.append(item)
                else: excluded.add(pending[task])
            except Exception as e: errors.append({'url':pending[task],'error':str(e)})
    merged={x['id']:x for x in previous['entries'] if x['url'] not in excluded};merged.update({x['id']:x for x in verified})
    entries=sorted(merged.values(),key=lambda x:(x['displayDate'],x['publishedAt']),reverse=True)
    if not verified:
        write_log({'state':'failed','checkedAt':datetime.now(KST).isoformat(),'errors':errors,'requests':news.request_events,'preserved':len(previous['entries'])})
        raise ValueError('새 공식 목록을 확인하지 못해 기존 파일을 보존합니다.')
    newest=datetime.fromisoformat(entries[0]['displayDate']).date();monday=newest-timedelta(days=newest.weekday())
    result={'mode':'official-links','updatedAt':datetime.now(KST).isoformat(),'reviewPeriod':{'start':monday.isoformat(),'end':(monday+timedelta(days=6)).isoformat()},'entries':entries}
    signature=lambda rows:[{k:v for k,v in row.items() if k!='verifiedAt'} for row in rows]
    if signature(entries)==signature(previous['entries']) and result['reviewPeriod']==previous.get('reviewPeriod'):
        report={'state':'partial' if errors else 'unchanged','changed':False,'entries':len(entries),'checkedAt':result['updatedAt'],'errors':errors,'requests':news.request_events,'warnings':discovery_log.getvalue().strip()}
        write_log(report);print(json.dumps({k:v for k,v in report.items() if k!='requests'},ensure_ascii=False));return
    temp=target.with_suffix('.json.tmp');temp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(target)
    write_log({'state':'partial' if errors else 'updated','checkedAt':result['updatedAt'],'verified':len(verified),'preserved':len(entries)-len(verified),'errors':errors,'requests':news.request_events,'warnings':discovery_log.getvalue().strip()})
    print(json.dumps({'entries':len(entries),'verified':len(verified),'period':result['reviewPeriod'],'errors':errors},ensure_ascii=False))
def write_log(report):
    log=ROOT/'data/production/official-links-refresh.json';log.parent.mkdir(parents=True,exist_ok=True)
    log.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--pages',type=int,default=3);args=parser.parse_args()
    try: refresh(min(10,max(1,args.pages)))
    except Exception as error:
        print(json.dumps({'state':'failed','error':str(error),'preserved':True},ensure_ascii=False));sys.exit(1)
