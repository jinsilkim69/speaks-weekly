import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runCommand} from '../scripts/run-command.mjs';
test('news collection distinguishes publisher AI summaries, link-only pages and repeated pagination',async()=>{
 const code=`import importlib.util,sys,io,contextlib
from bs4 import BeautifulSoup
s=importlib.util.spec_from_file_location('news',sys.argv[1]);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
html='<meta property="article:published_time" content="2026-10-23T05:00:00+09:00"><meta property="og:title" content="기사"><div id="article-view-content-div"><p>※ AI로 요약한 이 영상의 주요 내용입니다.</p><p>'+('설명 문단 '*100)+'</p><iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe><a href="http://example.org/original">원문</a></div>'
m.fetch=lambda u:BeautifulSoup(html,'html.parser');d=m.article('https://www.speaks.kr/news/articleView.html?idxno=1')
assert d['sourceType']=='publisher-ai-summary' and len(d['embeddedVideos'])==1 and d['links'][0]['url'].startswith('http://')
html=html.replace('설명 문단 ','기사 전문을 보시려면 ');assert m.article('https://www.speaks.kr/news/articleView.html?idxno=1')['needsOriginal']
calls=[]
def repeated(u):
 calls.append(u);return BeautifulSoup('<a href="/news/articleView.html?idxno=1">기사</a>','html.parser')
m.fetch=repeated;log=io.StringIO()
with contextlib.redirect_stderr(log): items=list(m.discover(8))
assert len(items)==1 and len(calls)==2 and 'DISCOVERY_WARNING' in log.getvalue()
print('ok')`;
 const result=await runCommand(process.env.SPEAKS_PYTHON||'python',['-X','utf8','-c',code,fileURLToPath(new URL('../scripts/collect-news.py',import.meta.url))]);
 assert.equal(result.stdout.trim(),'ok');
});

test('news fetch retries transient 403, rejects foreign redirects and uses official homepage discovery fallback',async()=>{
 const code=`import importlib.util,sys,urllib.error,io,contextlib
from bs4 import BeautifulSoup
s=importlib.util.spec_from_file_location('news',sys.argv[1]);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
m.time.sleep=lambda _:None;m.REQUEST_INTERVAL=0
class Reply:
 status=200;url='https://www.speaks.kr/';headers={}
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self,n):return b'<h1>ok</h1>'
calls=[]
def flaky(req,timeout):
 calls.append(req.full_url)
 if len(calls)==1:raise urllib.error.HTTPError(req.full_url,403,'Forbidden',{},None)
 return Reply()
m.urllib.request.urlopen=flaky
assert m.fetch('https://www.speaks.kr/').h1.text=='ok' and len(calls)==2
assert [x['status'] for x in m.request_events]==[403,200]
Reply.url='https://example.com/'
try:m.fetch('https://www.speaks.kr/');raise AssertionError('redirect accepted')
except ValueError:pass
seen=[]
def discover(u):
 seen.append(u)
 if 'articleList' in u:raise urllib.error.HTTPError(u,403,'Forbidden',{},None)
 return BeautifulSoup('<a href="/news/articleView.html?idxno=1">Official</a>','html.parser')
m.fetch=discover
with contextlib.redirect_stderr(io.StringIO()):items=list(m.discover(1))
assert len(items)==1 and seen[-1]=='https://www.speaks.kr/'
print('ok')`;
 const result=await runCommand(process.env.SPEAKS_PYTHON||'python',['-X','utf8','-c',code,fileURLToPath(new URL('../scripts/collect-news.py',import.meta.url))]);assert.equal(result.stdout.trim(),'ok');
});
test('failed official discovery keeps the published directory intact and records failure',async()=>{
 const code=`import importlib.util,sys,tempfile,json,urllib.error,pathlib
s=importlib.util.spec_from_file_location('refresh',sys.argv[1]);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
with tempfile.TemporaryDirectory() as tmp:
 m.ROOT=pathlib.Path(tmp);(m.ROOT/'data').mkdir();file=m.ROOT/'data/official-links.json';before='{"entries":[{"id":"preserved"}]}'
 file.write_text(before,encoding='utf-8')
 def blocked(pages,**kwargs):raise urllib.error.HTTPError('https://www.speaks.kr/',403,'Forbidden',{},None)
 m.news.discover=blocked
 try:m.refresh();raise AssertionError('failure hidden')
 except urllib.error.HTTPError:pass
 assert file.read_text(encoding='utf-8')==before
 assert json.loads((m.ROOT/'data/production/official-links-refresh.json').read_text(encoding='utf-8'))['state']=='failed'
print('ok')`;
 const result=await runCommand(process.env.SPEAKS_PYTHON||'python',['-X','utf8','-c',code,fileURLToPath(new URL('../scripts/refresh-official-links.py',import.meta.url))]);assert.equal(result.stdout.trim(),'ok');
});
