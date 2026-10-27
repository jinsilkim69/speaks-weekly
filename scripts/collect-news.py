"""Collect structured SPEAKS articles; never use the site's header date as publication date."""
import argparse, json, re, sys, urllib.request, urllib.parse
from datetime import datetime
from bs4 import BeautifulSoup

def fetch(url):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname != 'www.speaks.kr':
        raise ValueError('스픽스 HTTPS 기사만 수집할 수 있습니다.')
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=25) as response:
        if urllib.parse.urlparse(response.url).hostname != 'www.speaks.kr':
            raise ValueError('다른 도메인으로 이동했습니다.')
        return BeautifulSoup(response.read(4_000_000), 'html.parser')

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
    for tag in body.select('script,style,iframe'): tag.decompose()
    paragraphs=[p.get_text(' ',strip=True) for p in body.select('p') if p.get_text(' ',strip=True)]
    if not paragraphs: paragraphs=[body.get_text(' ',strip=True)]
    links=[{'label':a.get_text(' ',strip=True),'url':urllib.parse.urljoin(url,a['href'])} for a in body.select('a[href]') if urllib.parse.urljoin(url,a['href']).startswith('https://')]
    ident=urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get('idxno',[''])[0]
    if not ident.isdigit(): raise ValueError('기사 번호가 없습니다.')
    return {'id':'web-'+ident,'kind':'web','title':meta('og:title'),'url':url,'publishedAt':published,'thumbnail':meta('og:image'),'paragraphs':paragraphs,'text':'\n'.join(paragraphs),'links':links,'needsOriginal':len(''.join(paragraphs))<350,'collectedAt':datetime.now().astimezone().isoformat()}

def discover(pages):
    seen=set()
    for page in range(1,pages+1):
        soup=fetch(f'https://www.speaks.kr/news/articleList.html?view_type=sm&page={page}')
        for a in soup.select('a[href*="articleView.html?idxno="]'):
            url=urllib.parse.urljoin('https://www.speaks.kr/',a['href'])
            if url not in seen:
                seen.add(url)
                yield {'url':url,'title':a.get_text(' ',strip=True)}

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--url');parser.add_argument('--pages',type=int,default=2)
    args=parser.parse_args()
    try:
        result=article(args.url) if args.url else list(discover(min(max(args.pages,1),10)))
        print(json.dumps(result,ensure_ascii=True))
    except Exception as error:
        print(str(error),file=sys.stderr);sys.exit(1)
