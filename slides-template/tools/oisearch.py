"""Search Open Images by label and build contact sheets to pick photos.

Data (download once into .cache/oi/ from https://storage.googleapis.com/openimages/):
  v7/oidv7-class-descriptions.csv
  v7/oidv7-val-annotations-human-imagelabels.csv, v7/oidv7-test-annotations-human-imagelabels.csv
  2018_04/validation/validation-images-with-rotation.csv, 2018_04/test/test-images-with-rotation.csv
Optional (larger pool): train_labels_filtered.csv / train_machine_filtered.csv = "ImageID,LabelName" rows
filtered from the v7 train label files.

Usage: python tools/oisearch.py <name> "Label A+Label B" ["avoid1,avoid2"] [limit] [seed]
"""
import sys, os, csv, json, random, concurrent.futures as cf, urllib.request, pickle
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
S = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.cache')
OI = os.path.join(S, 'oi'); CACHE = os.path.join(S, 'img', 'cache')
os.makedirs(CACHE, exist_ok=True)
IDX = os.path.join(OI, 'index.pkl')

def load():
    if os.path.exists(IDX):
        return pickle.load(open(IDX, 'rb'))
    cls = pd.read_csv(os.path.join(OI, 'oidv7-class-descriptions.csv'))
    name2mid = {n.strip().lower(): m for m, n in zip(cls.LabelName, cls.DisplayName)}
    labs = []
    for f, sub in [('oidv7-val-annotations-human-imagelabels.csv', 'validation'), ('oidv7-test-annotations-human-imagelabels.csv', 'test')]:
        d = pd.read_csv(os.path.join(OI, f), usecols=['ImageID', 'LabelName', 'Confidence'])
        d = d[d.Confidence == 1][['ImageID', 'LabelName']]
        d['sub'] = sub
        labs.append(d)
    for fn in ('train_labels_filtered.csv', 'train_machine_filtered.csv'):
        if not os.path.exists(os.path.join(OI, fn)):
            continue
        t = pd.read_csv(os.path.join(OI, fn), header=None, names=['ImageID', 'LabelName'], dtype={'ImageID': 'category', 'LabelName': 'category'})
        t = t.astype(str)
        t['sub'] = 'train'
        labs.append(t)
    labs = pd.concat(labs)
    by_label = labs.groupby('LabelName').ImageID.apply(set).to_dict()
    sub = dict(zip(labs.ImageID, labs['sub']))
    meta = {}
    for f in ['validation-images-with-rotation.csv', 'test-images-with-rotation.csv']:
        m = pd.read_csv(os.path.join(OI, f), usecols=['ImageID', 'OriginalLandingURL', 'License', 'Author', 'Title', 'Rotation'])
        for r in m.itertuples():
            meta[r.ImageID] = dict(url=r.OriginalLandingURL, lic=r.License, author=r.Author, title=r.Title, rot=r.Rotation)
    data = dict(name2mid=name2mid, by_label=by_label, sub=sub, meta=meta)
    pickle.dump(data, open(IDX, 'wb'))
    return data

def search(D, need, avoid=(), limit=40, seed=0):
    sets = []
    for n in need:
        mid = D['name2mid'].get(n.lower())
        if not mid: raise SystemExit(f'unknown label {n}')
        sets.append(D['by_label'].get(mid, set()))
    ids = set.intersection(*sets) if sets else set()
    for n in avoid:
        mid = D['name2mid'].get(n.lower())
        if mid: ids -= D['by_label'].get(mid, set())
    ids = sorted(ids)
    random.Random(seed).shuffle(ids)
    return ids[:limit], len(ids)

def fetch(D, iid):
    p = os.path.join(CACHE, iid + '.jpg')
    if not os.path.exists(p):
        url = f"https://open-images-dataset.s3.amazonaws.com/{D['sub'][iid]}/{iid}.jpg"
        try:
            urllib.request.urlretrieve(url, p)
        except Exception as e:
            return None
    return p

def sheet(paths, out, w=300, cols=6):
    ims = []
    for iid, p in paths:
        try:
            im = Image.open(p).convert('RGB'); im.thumbnail((w, w)); ims.append((iid, im))
        except Exception: pass
    rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (cols * w, rows * (w + 16)), 'white'); dr = ImageDraw.Draw(sh)
    for k, (iid, im) in enumerate(ims):
        x, y = (k % cols) * w, (k // cols) * (w + 16)
        sh.paste(im, (x + (w - im.width) // 2, y + 16 + (w - im.height) // 2))
        dr.text((x + 4, y + 2), f'{k}:{iid}', fill='black')
    sh.save(out, quality=82)

if __name__ == '__main__':
    # usage: oisearch.py out_name "Label A+Label B" ["avoid1,avoid2"] [limit] [seed]
    D = load()
    name = sys.argv[1]; need = [x for x in sys.argv[2].split('+') if x]
    avoid = [x for x in sys.argv[3].split(',') if x] if len(sys.argv) > 3 else []
    limit = int(sys.argv[4]) if len(sys.argv) > 4 else 30
    seed = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    ids, total = search(D, need, avoid, limit, seed)
    with cf.ThreadPoolExecutor(16) as ex:
        paths = list(ex.map(lambda i: (i, fetch(D, i)), ids))
    paths = [(i, p) for i, p in paths if p]
    out = os.path.join(S, 'img', f'sheet_{name}.jpg')
    if not paths: print("no results", total); raise SystemExit(0)
    sheet(paths, out)
    json.dump([i for i, _ in paths], open(os.path.join(S, 'img', f'sheet_{name}.json'), 'w'))
    print(out, 'total matches', total, 'shown', len(paths))
