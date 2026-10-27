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
