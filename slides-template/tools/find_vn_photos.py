"""
Find Creative-Commons photos taken in Vietnam (Hội An, Huế, Hà Nội, Sài Gòn…) inside Open Images.

Streams the Open Images image-metadata CSVs (titles / Flickr URLs / licences, ~2.7 GB for train) and keeps rows
whose title mentions a Vietnamese place. Nothing big is stored: only the matches go to .cache/oi/vn_photos.csv.
Then builds contact sheets per keyword so photos can be picked by eye.

    python tools/find_vn_photos.py            # scan + sheets
    python tools/find_vn_photos.py sheets     # sheets only (after a scan)
"""
import concurrent.futures as cf
import csv
import io
import os
import re
import sys
import urllib.request

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(ROOT, '.cache')
OI = os.path.join(CACHE, 'oi')
IMG = os.path.join(CACHE, 'img', 'cache')
SHEETS = os.path.join(CACHE, 'sheets')
BASE = 'https://storage.googleapis.com/openimages/'
SOURCES = [
    ('validation', BASE + '2018_04/validation/validation-images-with-rotation.csv'),
    ('test', BASE + '2018_04/test/test-images-with-rotation.csv'),
    ('train', BASE + 'v6/oidv6-train-images-with-labels-with-rotation.csv'),
]
PAT = re.compile(r'h[oộ]i[\s_-]?an|vietnam|viet[\s_-]?nam|việt|saigon|sai[\s_-]?gon|ha[\s_-]?noi|hanoi|hà nội|'
                 r'\bhue\b|huế|da[\s_-]?nang|danang|đà nẵng|mekong|ha[\s_-]?long|halong|nha[\s_-]?trang|'
                 r'quang[\s_-]?nam|my[\s_-]?son|hoian|ho chi minh', re.I)
OUT = os.path.join(OI, 'vn_photos.csv')


def scan():
    os.makedirs(OI, exist_ok=True)
    n = 0
    with open(OUT, 'w', newline='', encoding='utf-8') as fo:
        w = csv.writer(fo)
        w.writerow(['ImageID', 'Subset', 'OriginalLandingURL', 'License', 'Author', 'Title'])
        for subset, url in SOURCES:
            resp = urllib.request.urlopen(url, timeout=120)
            rd = csv.DictReader(io.TextIOWrapper(resp, encoding='utf-8', errors='replace', newline=''))
            for r in rd:
                txt = f"{r.get('Title', '')} {r.get('OriginalLandingURL', '')}"
                if PAT.search(txt):
                    w.writerow([r['ImageID'], r.get('Subset', subset), r['OriginalLandingURL'], r['License'],
                                r['Author'], r['Title']])
                    n += 1
            print(subset, 'done, matches so far', n, flush=True)
    return n


def fetch(row):
    iid, sub = row['ImageID'], row['Subset']
    p = os.path.join(IMG, iid + '.jpg')
    if not os.path.exists(p):
        try:
            urllib.request.urlretrieve(f'https://open-images-dataset.s3.amazonaws.com/{sub}/{iid}.jpg', p)
        except Exception:
            return None
    return p


def sheet(rows, out, w=300, cols=6):
    with cf.ThreadPoolExecutor(24) as ex:
        paths = list(ex.map(fetch, rows))
    items = []
    for r, p in zip(rows, paths):
        if not p:
            continue
        try:
            im = Image.open(p).convert('RGB')
        except Exception:
            continue
        im.thumbnail((w, w))
        items.append((r, im))
    if not items:
        return None
    rws = (len(items) + cols - 1) // cols
    sh = Image.new('RGB', (cols * w, rws * (w + 30)), 'white')
    dr = ImageDraw.Draw(sh)
    for k, (r, im) in enumerate(items):
        x, y = (k % cols) * w, (k // cols) * (w + 30)
        sh.paste(im, (x + (w - im.width) // 2, y + 30 + (w - im.height) // 2))
        dr.text((x + 3, y + 2), f"{k}:{r['ImageID']}", fill='black')
        dr.text((x + 3, y + 15), r['Title'][:40], fill=(90, 90, 90))
    sh.save(out, quality=82)
    return out


def sheets(filter_re=None, per=48):
    os.makedirs(IMG, exist_ok=True)
    os.makedirs(SHEETS, exist_ok=True)
    rows = list(csv.DictReader(open(OUT, encoding='utf-8')))
    if filter_re:
        rx = re.compile(filter_re, re.I)
        rows = [r for r in rows if rx.search(r['Title'] + ' ' + r['OriginalLandingURL'])]
    outs = []
    for i in range(0, len(rows), per):
        o = sheet(rows[i:i + per], os.path.join(SHEETS, f'vn_{(filter_re or "all")[:12].replace("|", "_")}_{i // per:02d}.jpg'))
        if o:
            outs.append(o)
    print(len(rows), 'rows ->', outs)
    return outs


if __name__ == '__main__':
    if len(sys.argv) == 1:
        print('matches:', scan())
        sheets(r'h[oộ]i[\s_-]?an|hoian')
    elif sys.argv[1] == 'sheets':
        sheets(sys.argv[2] if len(sys.argv) > 2 else None)
