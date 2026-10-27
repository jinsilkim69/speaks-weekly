"""Deterministic typographic share card matching the site's coded masthead."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
out=Path('public/images/social');out.mkdir(parents=True,exist_ok=True)
im=Image.new('RGB',(1200,600),'white');d=ImageDraw.Draw(im);ink='#202020';red='#b51d28';gray='#626262'
font=lambda size,bold=False:ImageFont.truetype('C:/Windows/Fonts/'+('malgunbd.ttf' if bold else 'malgun.ttf'),size)
d.rectangle((72,68,1128,73),fill=ink)
d.text((76,101),'S P E A K S   W E E K L Y',font=font(23,True),fill=gray)
f=font(112,True);x=76;y=178
d.text((x,y),'주간',font=f,fill=ink);x+=d.textlength('주간',font=f)+25;d.text((x,y),'스픽스',font=f,fill=red)
d.text((80,335),'방송을 글로, 생각을 기록으로',font=font(35),fill=ink)
d.rectangle((76,425,166,431),fill=red)
d.text((80,463),'스픽스 리뷰  ·  주간지 기사 보기',font=font(25,True),fill=gray)
d.text((80,517),'speaks-magazine.okok5598.workers.dev',font=font(20),fill=gray)
im.save(out/'speaks-weekly-share-v1.png',optimize=True)
print(out/'speaks-weekly-share-v1.png')
