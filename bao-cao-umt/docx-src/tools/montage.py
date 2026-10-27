import sys, json
from PIL import Image, ImageDraw, ImageFont
# usage: montage.py out.png top_crop f1 f2 ...   (frames from vpng)
out=sys.argv[1]; top=int(sys.argv[2]); frames=sys.argv[3:]
SC=2; G=14*SC; LBL=34*SC
font=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 15*SC)
ims=[]
for f in frames:
    im=Image.open(f).convert('RGB')
    im=im.crop((0,top,im.width,im.height))
    im=im.resize((im.width*SC,im.height*SC),Image.LANCZOS)
    ims.append(im)
W=sum(i.width for i in ims)+G*(len(ims)-1)+2*SC*2
H=max(i.height for i in ims)+LBL+2*SC*2
c=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(c)
x=2*SC
for k,im in enumerate(ims):
    c.paste(im,(x,2*SC))
    d.rectangle([x-1,2*SC-1,x+im.width,2*SC+im.height],outline=(183,193,208),width=SC)
    lab='('+'abcdefgh'[k]+')'
    tw=d.textlength(lab,font=font)
    d.text((x+(im.width-tw)/2,2*SC+im.height+8*SC),lab,fill=(13,27,46),font=font)
    x+=im.width+G
c.save(out,optimize=True)
print(out,c.size)
