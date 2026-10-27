"""A4 proof compositor. Never truncates overflow or pads an unfinished issue."""
import argparse
import io
import json
import os
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from svglib.svglib import svg2rlg
from pypdf import PdfReader, PdfWriter

parser=argparse.ArgumentParser()
parser.add_argument('input'); parser.add_argument('output'); parser.add_argument('--root',required=True)
parser.add_argument('--hash',required=True); parser.add_argument('--test-only',action='store_true')
args=parser.parse_args()
issue=json.loads(Path(args.input).read_text(encoding='utf-8-sig'))
font=os.environ.get('SPEAKS_KOREAN_FONT',str(Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('Korean',font))
W,H=A4
body=ParagraphStyle('body',fontName='Korean',fontSize=10.5,leading=17,wordWrap='CJK',spaceAfter=9)
small=ParagraphStyle('small',parent=body,fontSize=8,leading=12)
heading=ParagraphStyle('heading',parent=body,fontSize=23,leading=32,spaceAfter=16)
sub=ParagraphStyle('sub',parent=body,fontSize=13,leading=20,spaceAfter=12)
buffer=io.BytesIO(); c=canvas.Canvas(buffer,pagesize=A4)
page_no=0

def paragraph(text,style=body):
    return Paragraph(escape(str(text)).replace('\n','<br/>'),style)

def begin(label):
    global page_no
    page_no+=1
    c.setFillColor(colors.HexColor('#17333f')); c.setFont('Korean',8)
    c.drawString(42,H-28,'SPEAKS WEEKLY | '+label[:65])
    c.setStrokeColor(colors.HexColor('#bcc6c9')); c.line(42,H-36,W-42,H-36)
    c.drawString(42,24,str(issue['period'])); c.drawRightString(W-42,24,str(page_no))
    if args.test_only:
        c.setFillColor(colors.HexColor('#b3261e')); c.drawCentredString(W/2,11,'시스템 검증용 · 배포 금지')

def frame(items,x,y,width,height):
    pending=list(items)
    Frame(x,y,width,height,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0).addFromList(pending,c)
    return pending

def full(items,label):
    begin(label)
    if frame(items,42,48,W-84,H-102):
        raise ValueError(f'Page {page_no}: content overflow; edit the copy, never shrink or truncate it')
    c.showPage()

def local_image(v,x,y,width,height):
    p=(Path(args.root)/'public'/v['url'].lstrip('/')).resolve()
    p.relative_to((Path(args.root)/'public').resolve())
    if p.suffix.lower()=='.svg':
        d=svg2rlg(str(p))
        if d is None: raise ValueError('Unreadable SVG: '+str(p))
        scale=min(width/d.width,height/d.height); d.scale(scale,scale)
        renderPDF.draw(d,c,x,y+height-d.height*scale)
    else:
        c.drawImage(str(p),x,y,width=width,height=height,preserveAspectRatio=True,anchor='c',mask='auto')

def chunks(paragraphs,n):
    # Contiguous, roughly equal text per page. No invented copy to fill the grid.
    if len(paragraphs)<n: raise ValueError('Not enough paragraphs for assigned pages')
    out=[]; start=0
    for i in range(n):
        remain=n-i; target=sum(len(p) for p in paragraphs[start:])/remain
        end=start; weight=0
        while end<len(paragraphs)-(remain-1) and (weight<target or end==start):
            weight+=len(paragraphs[end]); end+=1
        out.append(paragraphs[start:end]); start=end
    return out

# The master plan reserves 4 opening pages and 46 article pages.
counts=[2,2,2,5,5,4,4,4,4,4,3,3,2,2]
if len(issue['articleSnapshots'])!=14: raise ValueError('14 articles required')
if not issue.get('introduction'): raise ValueError('Publisher introduction required')
full([paragraph('주간 스픽스',heading),paragraph(issue['title'],heading),paragraph('더 나은 세상을 만드는 정치·시사·문화 주간지',sub),Spacer(1,25),paragraph(issue['articleSnapshots'][0]['title'],heading),paragraph(issue['articleSnapshots'][0]['lead']),Spacer(1,35),paragraph('도서출판 아우내',sub)],'표지')
full([paragraph('발행인의 말',heading)]+[paragraph(p) for p in issue['introduction']],'발행인의 말')
start=5; toc=[paragraph('목차',heading)]
for a,count in zip(issue['articleSnapshots'],counts):
    toc.append(paragraph(f"{start:02d}–{start+count-1:02d}  {a['title']}",sub)); start+=count
full(toc,'목차')
full([paragraph('판권 및 읽기 안내',heading),paragraph('발행·제작: 도서출판 아우내'),paragraph('주소: 충남 천안시 동남구 양지말1길 40'),paragraph('전화: 070-7561-0677'),paragraph('ISSN 3022-891X / ISBN 978-89-98765-43-2'),paragraph('원천 미디어: 스픽스 인터넷 신문 및 유튜브 @SPEAKS_TV'),paragraph('기사별 원방송·보도 출처와 검증 범위를 함께 제공합니다. 직접 발언과 편집부의 분석은 구분해 읽어 주십시오. AI 생성 삽화는 기사에 해당 표시를 붙입니다.')],'판권')

for a,count in zip(issue['articleSnapshots'],counts):
    groups=chunks(a['bodyParagraphs'],count-1)
    begin(a['title'])
    top=[paragraph(a['title'],heading),paragraph(a.get('subtitle',''),sub),paragraph(a.get('author','주간 스픽스 편집부'),small)]
    if frame(top,42,H-230,W-84,180): raise ValueError('Article title overflow')
    local_image(a['visual'],42,H-500,W-84,255)
    caption=('AI 생성 삽화 · ' if a['visual']['kind']=='generated-illustration' else '')+a['visual']['caption']+' · '+a['visual']['credit']
    if frame([paragraph(caption,small),Spacer(1,12),paragraph(a['lead'],sub)],42,48,W-84,H-560): raise ValueError('Lead or caption overflow')
    c.showPage()
    offset=0
    for index,group in enumerate(groups):
        begin(a['title'])
        flow=[]
        for p in group:
            flow.append(paragraph(p[3:],sub) if p.startswith('## ') else paragraph(p))
            for v in a.get('supportingVisuals',[]):
                if v['afterParagraph']==offset:
                    # Keep full-sized supplementary art on its own space in a column.
                    from reportlab.platypus import Image
                    img=Path(args.root)/'public'/v['url'].lstrip('/')
                    if img.suffix.lower()=='.svg':
                        drawing=svg2rlg(str(img)); factor=(W-102)/2/drawing.width
                        drawing.scale(factor,factor); drawing.width*=factor; drawing.height*=factor
                        flow.append(drawing)
                    else:
                        flow.append(Image(str(img),width=(W-102)/2,height=(W-102)/2*v['height']/v['width']))
                    flow.append(paragraph(v['caption']+' · '+v['credit'],small))
            offset+=1
        if index==len(groups)-1:
            flow += [paragraph('출처와 검증 범위',sub),paragraph(a.get('verificationNote',''),small)]
            for source in a['sources']:
                flow.append(Paragraph(f'<link href="{escape(source["url"], {chr(34): "&quot;"})}" color="#17333f">{escape(source["label"])}</link>',small))
            widget=qr.QrCodeWidget(a['sources'][0]['url']); bounds=widget.getBounds(); scale=65/(bounds[2]-bounds[0])
            drawing=Drawing(65,65,transform=[scale,0,0,scale,0,0]); drawing.add(widget); flow.append(drawing)
        col=(W-102)/2
        pending=frame(flow,42,48,col,H-102)
        pending=frame(pending,60+col,48,col,H-102)
        if pending: raise ValueError(f'Article {a["id"]}, page {page_no}: overflow; revise copy or paragraph distribution')
        c.showPage()

c.save()
reader=PdfReader(buffer); writer=PdfWriter(); writer.clone_document_from_reader(reader)
if len(reader.pages)!=50: raise ValueError('Expected exactly 50 pages')
writer.add_metadata({'/Title':issue['title'],'/Author':'도서출판 아우내','/SpeaksEditionHash':args.hash,'/SpeaksTestOnly':str(args.test_only).lower()})
Path(args.output).parent.mkdir(parents=True,exist_ok=True)
with open(args.output,'wb') as output: writer.write(output)
print(json.dumps({'pages':50,'output':args.output}))
