"""Render every PDF page and check that no manuscript paragraph disappeared."""
import argparse
import json
import re
from pathlib import Path
import fitz
from PIL import Image, ImageDraw

parser=argparse.ArgumentParser()
parser.add_argument('edition');parser.add_argument('pdf');parser.add_argument('--output',required=True)
args=parser.parse_args();out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
issue=json.loads(Path(args.edition).read_text(encoding='utf-8-sig'));doc=fitz.open(args.pdf)
normalize=lambda s:re.sub(r'\s+','',s)
text=normalize(''.join(p.get_text() for p in doc));missing=[];outside=[]
for a in issue['articleSnapshots']:
    for p in [a['lead']]+a['bodyParagraphs']:
        if normalize(p.removeprefix('## ')) not in text:missing.append({'article':a['id'],'paragraph':p[:80]})
for i,p in enumerate(doc):
    for block in p.get_text('dict')['blocks']:
        for line in block.get('lines',[]):
            for span in line['spans']:
                x0,y0,x1,y1=span['bbox']
                if x0<35 or x1>p.rect.width-35 or y0<10 or y1>p.rect.height-10:outside.append({'page':i+1,'text':span['text'][:60]})
    p.get_pixmap(matrix=fitz.Matrix(1.25,1.25)).save(out/f'page-{i+1:02d}.png')
for batch in range((len(doc)+24)//25):
    sheet=Image.new('RGB',(1800,2600),'#c6c9c7')
    for j in range(25):
        i=batch*25+j
        if i>=len(doc):break
        pix=doc[i].get_pixmap(matrix=fitz.Matrix(.54,.54))
        image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
        x=j%5*360;y=j//5*520;sheet.paste(image,(x,y+22));ImageDraw.Draw(sheet).text((x+8,y+5),str(i+1),fill='black')
    sheet.save(out/f'contact-{batch+1}.png')
report={'pages':len(doc),'missingParagraphs':missing,'outOfBoundsText':outside,'renderedPages':len(doc)}
(out/'render-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
if len(doc)!=50 or missing or outside:raise SystemExit(1)
