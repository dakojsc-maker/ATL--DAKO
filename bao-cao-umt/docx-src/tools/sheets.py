import sys, glob, subprocess, os, shutil
from PIL import Image, ImageDraw
pdf, outprefix, dpi = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else '50'
tmp = outprefix + '_pages'
shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
subprocess.run(['pdftoppm', '-jpeg', '-r', dpi, pdf, tmp + '/p'], check=True)
fs = sorted(glob.glob(tmp + '/p-*.jpg'))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size; cols = 7; per = 21
for s in range(0, len(ims), per):
    grp = ims[s:s + per]; rows = (len(grp) + cols - 1) // cols
    c = Image.new('RGB', (cols * (w + 8), rows * (h + 8)), '#888')
    for i, im in enumerate(grp):
        c.paste(im, ((i % cols) * (w + 8), (i // cols) * (h + 8)))
        ImageDraw.Draw(c).text(((i % cols) * (w + 8) + 3, (i // cols) * (h + 8) + 3), str(s + i + 1), fill='red')
    c.save(f'{outprefix}_{s // per}.jpg', quality=85)
print(len(fs), 'pages')
