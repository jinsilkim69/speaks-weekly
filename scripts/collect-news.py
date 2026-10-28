"""Collect structured SPEAKS articles; never use the site's header date as publication date."""
import argparse, json, re, sys, urllib.request, urllib.parse, urllib.error, time, threading
from datetime import datetime
from bs4 import BeautifulSoup

REQUEST_INTERVAL=0.8
_request_lock=threading.Lock()
_last_request=0.0
request_events=[]
def fetch(url):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!='https' or parsed.hostname!='www.speaks.kr':
        raise ValueError('스픽스 HTTPS 기사만 수집할 수 있습니다.')
    global _last_request
    for attempt in range(3):
        try:
            # Serialize requests across discovery and article workers to avoid bursts.
            with _request_lock:
                time.sleep(max(0,REQUEST_INTERVAL-(time.monotonic()-_last_request)))
                _last_request=time.monotonic()
                req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'text/html,application/xhtml+xml','Accept-Language':'ko-KR,ko;q=0.9'})
                with urllib.request.urlopen(req,timeout=25) as response:
                    if urllib.parse.urlparse(response.url).hostname!='www.speaks.kr':
                        raise ValueError('다른 도메인으로 이동했습니다.')
                    raw=response.read(4_000_000)
                    request_events.append({'url':url,'status':response.status,'attempt':attempt+1})
            return BeautifulSoup(raw,'html.parser')
        except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as error:
            status=getattr(error,'code',None)
            request_events.append({'url':url,'status':status,'attempt':attempt+1,'error':str(error)})
            if attempt==2 or (status is not None and status not in [403,408,429,500,502,503,504]): raise
            retry=getattr(error,'headers',{}).get('Retry-After','')
            delay=min(30,max(3 if attempt==0 else 8,int(retry) if str(retry).isdigit() else 0))
            time.sleep(delay)

def article(url):
    soup=fetch(url)
    def meta(key):
        tag=soup.find('meta',property=key)
        return tag.get('content','').strip() if tag else ''
    published=meta('article:published_time')
    if not published: raise ValueError('기사 입력일 메타데이터가 없습니다.')
    datetime.fromisoformat(published)
    body=soup.select_one('#article-view-content-div')
    if not body: raise ValueError('기사 본문이 없습니다.')
    embedded=[urllib.parse.urljoin(url,t.get('src','')) for t in body.select('iframe[src]') if urllib.parse.urljoin(url,t.get('src','')).startswith('https://')]
    for tag in body.select('script,style,iframe'): tag.decompose()
    paragraphs=[p.get_text(' ',strip=True) for p in body.select('p') if p.get_text(' ',strip=True)]
    if not paragraphs: paragraphs=[body.get_text(' ',strip=True)]
    links=[{'label':a.get_text(' ',strip=True),'url':urllib.parse.urljoin(url,a['href'])} for a in body.select('a[href]') if urllib.parse.urljoin(url,a['href']).startswith(('https://','http://'))]
    ident=urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get('idxno',[''])[0]
    if not ident.isdigit(): raise ValueError('기사 번호가 없습니다.')
    text='\n'.join(paragraphs)
    summary='AI로 요약한' in text
    return {'id':'web-'+ident,'kind':'web','title':meta('og:title'),'url':url,'publishedAt':published,'thumbnail':meta('og:image'),'paragraphs':paragraphs,'text':text,'links':links,'embeddedVideos':embedded,'sourceType':'publisher-ai-summary' if summary else 'publisher-web-article','accessScope':'신문 본문만 확인; 원방송 음성·화면 접근을 뜻하지 않음','needsOriginal':len(''.join(paragraphs))<350 or '기사 전문을 보시려면' in text,'collectedAt':datetime.now().astimezone().isoformat()}

def discover(pages, section=None):
    seen=set()
    for page in range(1,pages+1):
        try:
            soup=fetch(f'https://www.speaks.kr/news/articleList.html?'+urllib.parse.urlencode({'sc_section_code':section,'view_type':'sm','page':page} if section else {'view_type':'sm','page':page}))
        except Exception as error:
            if page!=1: raise
            print(f'DISCOVERY_WARNING: list unavailable ({error}); checking official homepage.',file=sys.stderr)
            soup=fetch('https://www.speaks.kr/')
        added=0
        for a in soup.select('a[href*="articleView.html?idxno="]'):
            url=urllib.parse.urljoin('https://www.speaks.kr/',a['href'])
            if url not in seen:
                seen.add(url)
                added+=1
                yield {'url':url,'title':a.get_text(' ',strip=True)}
        if page>1 and added==0:
            print(f'DISCOVERY_WARNING: page {page} returned no new article links; pagination may be ignored.',file=sys.stderr)
            break

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--url');parser.add_argument('--pages',type=int,default=2)
    args=parser.parse_args()
    try:
        result=article(args.url) if args.url else list(discover(min(max(args.pages,1),10)))
        print(json.dumps(result,ensure_ascii=True))
    except Exception as error:
        print(str(error),file=sys.stderr);sys.exit(1)
