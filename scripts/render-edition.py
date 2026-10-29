"""Editorial A4 compositor with embedded Korean type, live contents and verified sources."""
import argparse, io, json, os
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.utils import ImageReader
from PIL import Image as RasterImage
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Image, Flowable
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from svglib.svglib import svg2rlg
from pypdf import PdfReader, PdfWriter

parser=argparse.ArgumentParser()
parser.add_argument('input');parser.add_argument('output');parser.add_argument('--root',required=True)
parser.add_argument('--hash',required=True);parser.add_argument('--test-only',action='store_true');parser.add_argument('--plan-only',action='store_true')
args=parser.parse_args();issue=json.loads(Path(args.input).read_text(encoding='utf-8-sig'))
fontdir=Path(__file__).resolve().parent.parent/'assets/fonts/nanummyeongjo'
win=Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts'
sans=os.environ.get('SPEAKS_KOREAN_FONT',str(win/'malgun.ttf'))
for name,file in [('Sans',sans),('SansBold',str(win/'malgunbd.ttf')),('Serif',str(fontdir/'NanumMyeongjo-Regular.ttf')),('SerifBold',str(fontdir/'NanumMyeongjo-Bold.ttf')),('Malgun Gothic',sans)]:
    pdfmetrics.registerFont(TTFont(name,file))
W,H=A4;M=44;GAP=20;COL=(W-2*M-GAP)/2
INK=colors.HexColor('#202020');RED=colors.HexColor('#b51d28');GRAY=colors.HexColor('#606060');RULE=colors.HexColor('#ccccca')
body=ParagraphStyle('body',fontName='Serif',fontSize=10.8,leading=17.6,wordWrap='CJK',alignment=TA_JUSTIFY,spaceAfter=10,allowWidows=0,allowOrphans=0)
small=ParagraphStyle('small',fontName='Sans',fontSize=7.8,leading=12,wordWrap='CJK',textColor=GRAY,spaceAfter=5)
heading=ParagraphStyle('heading',fontName='SansBold',fontSize=25,leading=34,wordWrap='CJK',spaceAfter=12)
h2=ParagraphStyle('h2',fontName='SansBold',fontSize=11.5,leading=18,wordWrap='CJK',spaceBefore=8,spaceAfter=7)
sub=ParagraphStyle('sub',fontName='Sans',fontSize=10.5,leading=17,wordWrap='CJK',textColor=GRAY,spaceAfter=10)
leadstyle=ParagraphStyle('lead',parent=body,fontName='SerifBold',fontSize=11.2,leading=18.5,spaceAfter=12)
buffer=io.BytesIO();c=canvas.Canvas(buffer,pagesize=A4);page_no=0
counts=issue.get('pageCounts',[2,2,2,5,5,4,4,4,4,4,3,3,2,2])
if len(counts)!=14 or any(not isinstance(n,int) or n<1 for n in counts):raise ValueError('Article allocation must contain 14 positive page counts')
if len(issue.get('articleSnapshots',[]))!=14:raise ValueError('14 articles required')
if not issue.get('introduction'):raise ValueError('Publisher introduction required')

def para(text,style=body):return Paragraph(escape(str(text)).replace('\n','<br/>'),style)
def drawp(text,x,top,width,style=body):
    p=text if isinstance(text,Paragraph) else para(text,style)
    _,height=p.wrap(width,H);p.drawOn(c,x,top-height);return top-height-p.getSpaceAfter()
def text(s,x,y,size=8,font='Sans',color=INK):
    c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,str(s))
def line(y,x=M,right=W-M,color=RULE,weight=.5):
    c.setStrokeColor(color);c.setLineWidth(weight);c.line(x,y,right,y)
def begin(section,cover=False):
    global page_no
    page_no+=1;c.setFillColor(INK)
    if not cover:
        text('주간 스픽스',M,H-29,8,'SansBold');c.setFont('Sans',7.5);c.setFillColor(GRAY);c.drawRightString(W-M,H-29,section[:60]);line(H-39)
    text(issue['period'],M,25,7.3,'Sans',GRAY)
    c.setFillColor(INK);c.setFont('SansBold',9);c.drawRightString(W-M,25,f'{page_no:02d}')
    if args.test_only:text('시스템 검증용 · 배포 금지',W/2-65,12,7,'SansBold',RED)
def press_raster(file):
    # Encode illustrations as high-quality JPEG inside the PDF only; preserve source assets.
    if Path(file).suffix.lower() in ['.jpg','.jpeg']:return str(file)
    with RasterImage.open(file) as original:
        stream=io.BytesIO();original.convert('RGB').save(stream,'JPEG',quality=94,subsampling=0,optimize=True)
    stream.seek(0);return stream

def image(v,x,top,width,maxheight,center=True):
    p=(Path(args.root)/'public'/v['url'].lstrip('/')).resolve();p.relative_to((Path(args.root)/'public').resolve())
    if v.get('printMaxWidthMm'):width=min(width,v['printMaxWidthMm']*72/25.4)
    ratio=v['height']/v['width'];height=min(width*ratio,maxheight);actual_width=height/ratio
    x+=(W-2*M-actual_width)/2 if x==M and center else 0
    if p.suffix.lower()=='.svg':
        d=svg2rlg(str(p))
        if d is None:raise ValueError('Unreadable SVG')
        scale=actual_width/d.width;d.scale(scale,scale);renderPDF.draw(d,c,x,top-height)
    else:c.drawImage(ImageReader(press_raster(p)),x,top-height,width=actual_width,height=height,mask='auto')
    return top-height

def flow_height(p):return p.wrap(COL,H)[1]+p.getSpaceBefore()+p.getSpaceAfter()
def partition(items,heights):
    """Balance the copy across actual frames; split paragraphs, never drop text."""
    total=sum(flow_height(p) for p in items);capacity=sum(heights)
    if total>capacity*1.03:raise ValueError(f'Article overflow: {total:.0f}pt for {capacity:.0f}pt')
    def attempt(ratio):
        pending=list(items);groups=[]
        for n,available in enumerate(heights):
            target=available if n==len(heights)-1 else available*ratio
            group=[];used=0
            while pending:
                p=pending[0];before=p.getSpaceBefore() if group else 0;after=p.getSpaceAfter();h=p.wrap(COL,H)[1]
                if p.style.name=='h2' and len(pending)>1:
                    following=pending[1]
                    follow_min=(following.style.leading*3+following.getSpaceAfter()) if isinstance(following,Paragraph) else flow_height(following)
                    if target-used<before+h+after+follow_min:break
                if used+before+h+after<=target+.1:
                    group.append((p,before,h,after));used+=before+h+after;pending.pop(0);continue
                remaining=target-used-before-after
                parts=p.split(COL,remaining) if remaining>p.style.leading*2 else []
                if len(parts)>=2 and p.style.name!='h2':
                    one=parts[0];hh=one.wrap(COL,H)[1];group.append((one,before,hh,after));pending=[*parts[1:],*pending[1:]]
                break
            groups.append(group)
        return None if pending or any(not g for g in groups) else groups
    lo=max(.25,total/capacity-.07)
    for i in range(90):
        ratio=min(1,lo+i*.01);groups=attempt(ratio)
        if groups:return groups
        if ratio>=1:break
    raise ValueError(f'Copy cannot fit: total={total:.0f}, capacity={capacity:.0f}, frames={heights}')
def paint(group,x,top):
    y=top
    for p,before,h,after in group:y-=before+h;p.drawOn(c,x,y);y-=after
    if y<44:raise ValueError(f'Page {page_no}: bottom overflow')

def source_layout(a):
    note=para(a['verificationNote'],small);width=W-2*M-110
    height=note.wrap(width,H)[1]+22
    links=[Paragraph(f'<link href="{escape(s["url"], {chr(34):"&quot;"})}" color="#202020">{escape(s["label"])}</link>',small) for s in a['sources']]
    height+=sum(p.wrap(width,H)[1]+5 for p in links)
    return max(138,height+32),note,links

def sources(a,layout):
    height,note,links=layout;top=48+height;line(top,color=INK,weight=.8)
    text('함께 읽을 기사와 원방송' if issue.get('layout',{}).get('editorialScope') else '자료와 검증 범위',M,top-17,8,'SansBold')
    y=drawp(note,M,top-29,W-2*M-110,small)
    for p in links:y=drawp(p,M,y-3,W-2*M-110,small)
    widget=qr.QrCodeWidget(a['sources'][0]['url']);bounds=widget.getBounds();scale=90/(bounds[2]-bounds[0]);d=Drawing(90,90,transform=[scale,0,0,scale,0,0]);d.add(widget);renderPDF.draw(d,c,W-M-90,top-105)
    text('원문 바로가기',W-M-90,top-117,7,'Sans',GRAY)
    if y<45:raise ValueError('Source box overflow')

def visual_caption(v):
    label='AI 생성 삽화 · ' if v['kind']=='generated-illustration' else ''
    value=escape(label+v['caption']+' | '+v['credit'])
    for key,title in [('sourceUrl','원출처'),('licenseUrl','이용 조건')]:
        if v.get(key):value+=' · <link href="'+escape(v[key],{chr(34):'&quot;'})+'">'+title+'</link>'
    if v.get('licenseUrl'):value+=' · '+escape(v.get('transformation','크기 축소·JPEG 변환'))
    return Paragraph(value,small)

class EditorialFigure(Flowable):
    """Keep each picture and its caption together in the same column."""
    def __init__(self,graphic,caption,width):
        Flowable.__init__(self);self.graphic=graphic;self.caption=caption;self.width=width
        self.style=ParagraphStyle('graphic',parent=body,spaceBefore=8,spaceAfter=14)
    def wrap(self,availableWidth,availableHeight):
        _,self.picture_height=self.graphic.wrap(self.width,availableHeight)
        _,self.caption_height=self.caption.wrap(self.width,availableHeight)
        self.height=self.picture_height+8+self.caption_height
        return self.width,self.height
    def draw(self):
        self.graphic.drawOn(self.canv,0,self.caption_height+8);self.caption.drawOn(self.canv,0,0)

def prepare_story(a,count):
    # Measure opening material before allocating the actual copy to its frames.
    feature_size=(13,22) if sum(len(p) for p in a['bodyParagraphs'])<4400 else (12,20)
    storybody=ParagraphStyle('body',parent=body,fontSize=feature_size[0],leading=feature_size[1],spaceAfter=11) if count>=3 else body
    storylead=ParagraphStyle('lead',parent=leadstyle,fontSize=12.2,leading=20.5) if count>=3 else leadstyle
    storyhead=ParagraphStyle('story-head',parent=heading,fontName='SerifBold',fontSize=26,leading=35) if count>=3 else heading
    title=para(a['title'],storyhead);title_h=title.wrap(W-2*M,H)[1]
    subtitle=para(a.get('subtitle',''),sub);sub_h=subtitle.wrap(W-2*M,H)[1]
    firsttop=H-78-title_h-15-sub_h-30
    lead=para(a['lead'],storylead)
    lead_height=lead.wrap(W-2*M,H)[1]+lead.getSpaceAfter()
    firsttop-=lead_height+12
    vh=min(260 if a['visual']['kind']=='diagram' else 240,(W-2*M)*a['visual']['height']/a['visual']['width'])
    if a['visual'].get('printMaxWidthMm'):vh=min(vh,a['visual']['printMaxWidthMm']*72/25.4*a['visual']['height']/a['visual']['width'])
    caption=('AI 생성 삽화 · ' if a['visual']['kind']=='generated-illustration' else '')+a['visual']['caption']+' | '+a['visual']['credit']
    cap=visual_caption(a['visual']);cap_h=cap.wrap(COL if a['visual']['kind']=='photo' or count==1 else W-2*M,H)[1]
    column_hero=a['visual']['kind']=='photo' or count==1
    if column_hero:vh=min(220,COL*a['visual']['height']/a['visual']['width'])
    opening_top=firsttop-vh-cap_h-28
    endnotes=source_layout(a)
    heights=[]
    for i in range(count):
        top=opening_top if i==0 else H-62
        bottom=48+(endnotes[0]+18 if i==count-1 else 0)
        heights.extend([top-bottom,(firsttop if i==0 and column_hero else top)-bottom])
    if min(heights)<80:raise ValueError('Opening or source material too long')
    flow=[]
    for index,p in enumerate(a['bodyParagraphs']):
        flow.append(para(p[3:],h2) if p.startswith('## ') else para(p,storybody))
        for v in a.get('supportingVisuals',[]):
            if v['afterParagraph']!=index:continue
            file=(Path(args.root)/'public'/v['url'].lstrip('/')).resolve();file.relative_to((Path(args.root)/'public').resolve())
            ww=min(COL,v.get('printMaxWidthMm',1000)*72/25.4)
            if file.suffix.lower()=='.svg':
                drawing=svg2rlg(str(file));factor=ww/drawing.width;drawing.scale(factor,factor);drawing.width*=factor;drawing.height*=factor
            else:drawing=Image(press_raster(file),width=ww,height=ww*v['height']/v['width'])
            flow.append(EditorialFigure(drawing,visual_caption(v),ww))
    try:groups=partition(flow,heights)
    except ValueError as error:raise ValueError(a['id']+': '+str(error)) from error
    return dict(count=count,title=title,subtitle=subtitle,lead=lead,cap=cap,vh=vh,opening_top=opening_top,firsttop=firsttop,endnotes=endnotes,groups=groups,column_hero=column_hero)

plans=[]
for index,(article,allocation) in enumerate(zip(issue['articleSnapshots'],counts)):
    while True:
        try:plan=prepare_story(article,allocation);break
        except ValueError:
            if not issue.get('layout',{}).get('autoExpand') or allocation>=40:raise
            allocation+=1
    counts[index]=allocation;plans.append(plan)
if args.plan_only:
    print(json.dumps({'pageCounts':counts,'pages':4+sum(counts)}));raise SystemExit(0)

cover=next((a for a in issue['articleSnapshots'] if a['id']==issue.get('coverArticleId')),issue['articleSnapshots'][0])
begin('표지',True)
text('주간',M,H-88,46,'SansBold');text('스픽스',M+pdfmetrics.stringWidth('주간','SansBold',46),H-88,46,'SansBold',RED)
text('S P E A K S   W E E K L Y',M,H-112,9,'SansBold');line(H-125,color=INK,weight=1)
text('정치 · 시사 · 문화',M,H-143,8,'Sans',GRAY);c.setFillColor(GRAY);c.setFont('Sans',8);c.drawRightString(W-M,H-143,issue['period']+(' · 개정판' if issue.get('revisionOf') else ''))
coverstyle=ParagraphStyle('cover-title',fontName='SerifBold',fontSize=32,leading=43,wordWrap='CJK')
if issue.get('layout',{}).get('coverStyle')=='portrait-feature':
    cv=next(v for v in [cover['visual']]+cover.get('supportingVisuals',[]) if v['url']==issue['layout']['coverImageUrl'])
    drawp(issue['title'],M,H-180,175,coverstyle)
    drawp(issue.get('layout',{}).get('coverDeck',''),M,H-360,165,sub)
    y=image(cv,M+200,H-163,W-2*M-200,430,center=False)
    label='AI 생성 삽화 · ' if cv['kind']=='generated-illustration' else ''
    drawp(label+cv['caption']+' | '+cv['credit'],M+200,y-9,W-2*M-200,small)
else:
    y=drawp(issue['title'],M,H-165,W-2*M,coverstyle)
    y=image(cover['visual'],M,y-18,W-2*M,min(310,y-210))
    label='AI 생성 삽화 · ' if cover['visual']['kind']=='generated-illustration' else ''
    y=drawp(label+cover['visual']['caption']+' | '+cover['visual']['credit'],M,y-8,W-2*M,small)
line(145,color=INK,weight=1)
teasers=[issue['articleSnapshots'][0],issue['articleSnapshots'][4],issue['articleSnapshots'][11]]
for i,a in enumerate(teasers):
    x=M+i*(W-2*M)/3;tw=(W-2*M)/3-15
    text(a['category'],x,128,8,'SansBold',RED);drawp(a['title'],x,113,tw,ParagraphStyle('teaser',parent=sub,fontName='SerifBold',fontSize=10.2,leading=15,textColor=INK))
text('도서출판 아우내',M,43,8,'SansBold');c.showPage()

begin('편집실에서');text('편집실에서',M,H-75,10,'SansBold',RED)
y=drawp('방송을 읽는 시간',M,H-95,W-2*M,heading)-15
intro=[para(p,body) for p in issue['introduction']]
if sum(len(p) for p in issue['introduction'])<800:
    yy=y
    for p in intro:yy=drawp(p,M,yy,min(365,W-2*M))
else:
    groups=partition(intro,[y-65,y-65])
    paint(groups[0],M,y);paint(groups[1],M+COL+GAP,y)
text('주간 스픽스 편집부',M,55,9,'SansBold');c.showPage()

begin('목차');text('CONTENTS',M,H-78,10,'SansBold',RED)
y=drawp('이번 호',M,H-95,W-2*M,heading);text(issue['period'],M,y-5,9,'Sans',GRAY)
start=5;rows=[]
for a,count in zip(issue['articleSnapshots'],counts):rows.append((a,start,count));start+=count
for col,subset in enumerate([rows[:7],rows[7:]]):
    x=M+col*(COL+GAP);top=H-180
    for a,start,count in subset:
        text(f'{start:02d}',x,top-14,14,'SansBold',RED)
        style=ParagraphStyle('toc',parent=sub,fontSize=10.2,leading=15,textColor=INK)
        before=top;top=drawp(a['title'],x+32,top,COL-32,style)-6
        c.linkRect('',a['id'],(x,before-55,x+COL,before),relative=0,thickness=0)
        text(a['category'],x+32,top,7,'Sans',GRAY);top-=22;line(top,x,x+COL);top-=15
        if top<50:raise ValueError('TOC overflow')
c.showPage()

begin('판권과 읽기 안내');text('발행·제작',M,H-75,10,'SansBold',RED)
y=drawp('주간 스픽스',M,H-95,W-2*M,heading)
revision_note=issue.get('revisionSummary','원고 퇴고·도표 재제작·지면 재조판') if issue.get('layout',{}).get('editorialScope') else '원고 퇴고·도표 재제작·지면 재조판'
colophon=['도서출판 아우내','충남 천안시 동남구 양지말1길 40','전화 070-7561-0677','ISSN 3022-891X / ISBN 978-89-98765-43-2','원천 미디어: 스픽스 인터넷 신문 및 유튜브 @SPEAKS_TV','대상 기간 '+issue['period'],'개정판: '+revision_note if issue.get('revisionOf') else '주간 웹·PDF 발행 · '+str(4+sum(counts))+'면']
for p in colophon:y=drawp(p,M,y,W-2*M,sub)
line(y-10,color=INK);y-=45
notes=[('방송의 핵심을 글로 전합니다','영상을 보기 어려운 분도 출연자의 핵심 주장과 그 이유를 따라 읽을 수 있도록 대화를 재구성합니다. 발언의 맥락과 사례를 살리고 낯선 개념은 쉽게 풀어 설명합니다.'),('표와 사진을 함께 읽습니다','숫자에는 단위와 기준 시점을 붙였습니다. 사진에는 촬영 시점과 출처를 표시하고 생성 삽화는 실제 현장 사진과 구별합니다. 표는 본문에서 설명한 내용을 다시 찾아보는 길잡이입니다.'),('원방송과 기사를 만날 수 있습니다','기사 끝의 QR은 해당 기사의 첫 원출처로 이어집니다. PDF 목차의 제목을 누르면 해당 기사로 이동합니다. 발언을 더 듣고 싶은 독자는 원방송에서 대화의 흐름을 이어갈 수 있습니다.'),('제작과 개정','원고 작성·윤문에는 AI를 활용했습니다. 원자료와 대조해 발언 취지와 사실 관계, 문장을 검토합니다. 개정판은 이전 발행본을 보존하고 별도 발행호로 제공합니다.')]
if issue.get('layout',{}).get('editorialScope'):
    notes[1]=('사진과 삽화를 함께 읽습니다','사진에는 촬영 시점과 출처를 표시했습니다. 오래된 자료 사진은 현재의 현장 기록과 구별하고, 생성 삽화는 특정 인물이나 사건을 재현한 사진으로 사용하지 않습니다.')
    notes[3]=('제작과 확인 범위',issue['layout']['editorialScope'])
for j,(title,copy) in enumerate(notes):
    x=M+(j%2)*(COL+GAP);top=y-(j//2)*172
    top=drawp(title,x,top,COL,ParagraphStyle('guide-title',parent=h2,spaceBefore=0));drawp(copy,x,top-3,COL,ParagraphStyle('guide',parent=body,fontSize=10.2,leading=17))
c.showPage()

for a,plan in zip(issue['articleSnapshots'],plans):
    count,title,subtitle,lead,cap,vh,opening_top,firsttop,endnotes,groups,column_hero=[plan[k] for k in ['count','title','subtitle','lead','cap','vh','opening_top','firsttop','endnotes','groups','column_hero']]
    for i in range(count):
        begin(a['category'])
        if i==0:
            c.bookmarkPage(a['id']);c.addOutlineEntry(a['title'],a['id'],level=0)
            text(a['category'],M,H-64,9,'SansBold',RED)
            y=drawp(title,M,H-78,W-2*M)-3
            y=drawp(subtitle,M,y,W-2*M)-3
            text(a.get('author','주간 스픽스 편집부'),M,y-7,7.5,'Sans',GRAY);y-=27
            y=drawp(lead,M,y,W-2*M)-12
            y=image(a['visual'],M,y,COL if column_hero else W-2*M,vh,center=not column_hero)
            drawp(cap,M,y-7,COL if column_hero else W-2*M,small)
            top=opening_top
        else:
            top=H-62
            if i==1:text('계속',W-M-18,H-52,6.5,'Sans',GRAY)
        paint(groups[i*2],M,top);paint(groups[i*2+1],M+COL+GAP,firsttop if i==0 and column_hero else top)
        if i==count-1:sources(a,endnotes)
        if i==1 and count>=3:
            quote=a.get('printPullquote')
            if quote:
                if not any(quote in p for p in a['bodyParagraphs']):raise ValueError('Pull quote is not in the actual copy')
                used=[sum(b+h+aft for _,b,h,aft in g) for g in groups[i*2:i*2+2]]
                bottom=min(top-u for u in used)
                if bottom>195:
                    line(157,M,M+34,color=RED,weight=2)
                    drawp(quote,M,140,W-2*M,ParagraphStyle('pullquote',fontName='SerifBold',fontSize=17,leading=25,wordWrap='CJK'))
        c.showPage()

c.save();reader=PdfReader(buffer);writer=PdfWriter();writer.clone_document_from_reader(reader)
if len(reader.pages)!=4+sum(counts):raise ValueError('PDF page count differs from its contents plan')
writer.add_metadata({'/Title':issue['title'],'/Author':'도서출판 아우내','/SpeaksEditionHash':args.hash,'/SpeaksTestOnly':str(args.test_only).lower(),'/SpeaksDesign':'Editorial 2026.10 v2'})
Path(args.output).parent.mkdir(parents=True,exist_ok=True)
with open(args.output,'wb') as output:writer.write(output)
print(json.dumps({'pages':len(reader.pages),'pageCounts':counts,'output':args.output}))
