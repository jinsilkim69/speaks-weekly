import argparse
import hashlib
import json
from pathlib import Path
import cv2
import fitz
import numpy as np

parser=argparse.ArgumentParser();parser.add_argument('edition');parser.add_argument('pdf');parser.add_argument('--output',required=True);args=parser.parse_args()
issue=json.loads(Path(args.edition).read_text(encoding='utf-8-sig'));doc=fitz.open(args.pdf)
counts=issue.get('pageCounts',[2,2,2,5,5,4,4,4,4,4,3,3,2,2]);page=4;results=[]
for article,count in zip(issue['articleSnapshots'],counts):
    page+=count
    pix=doc[page-1].get_pixmap(matrix=fitz.Matrix(3,3))
    image=np.frombuffer(pix.samples,np.uint8).reshape(pix.height,pix.width,3)
    value,_,_=cv2.QRCodeDetector().detectAndDecode(image)
    results.append({'article':article['id'],'page':page,'url':value,'matchesSource':value==article['sources'][0]['url']})
report={'sha256':hashlib.sha256(Path(args.pdf).read_bytes()).hexdigest(),'checked':len(results),'passed':sum(x['matchesSource'] for x in results),'results':results}
Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
if len(results)!=14 or not all(x['matchesSource'] for x in results):raise SystemExit(1)
