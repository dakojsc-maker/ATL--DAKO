"""
Build a keynote deck (dark stage + 3D platform renders, lib/layouts_keynote.py) from a content file.

    python build_keynote.py --content decks/vien-stp/keynote.json --out decks/vien-stp --name Vien-STP-Keynote

Content JSON: {"art": {key: png}, "photos": {key: path | Open Images id}, "brand": {"logo": png},
               "credit_intro": "...", "slides": [{"slide": "<layout>", ..., "notes": "..."}]}
"art" must provide the five persistent pieces (core, research, training, trace, iot) rendered with
tools/render3d/stp_scenes.py (same camera), plus any extra renders used by detail / device slides.
A map_offices slide may give "lonlat": [lon, lat] per office; the dark Vietnam map is generated.
"""
import argparse
import csv
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import pptkit as K  # noqa: E402
import content_io as CIO  # noqa: E402
import keynote_assets as A  # noqa: E402
import layouts_keynote as L  # noqa: E402

OUT = os.path.join(HERE, 'assets', 'images', 'build', 'keynote')


def _mt(p):
    return os.path.getmtime(p) if os.path.exists(p) else 0


def prepare(meta, content):
    os.makedirs(OUT, exist_ok=True)
    art = {}
    for key, at in (('bg_right', (0.74, 0.5)), ('bg_center', (0.5, 0.42)), ('bg_left', (0.26, 0.55))):
        p = os.path.join(OUT, f'{key}.jpg')
        if not os.path.exists(p) or _mt(p) < _mt(A.__file__):
            A.stage_bg(p, at=at)
        art[key] = p
    for k, v in meta.get('art', {}).items():
        art[k] = CIO.photo_path(v)
    art['logo'] = CIO.photo_path(meta['brand']['logo'])
    img = {k: CIO.photo_path(v) for k, v in meta.get('photos', {}).items()}
    for fn, c in content:
        if fn is L.numbers:                               # photo bleeding into the stage from the right
            src = img.get(c['photo'], CIO.photo_path(c['photo']))
            p = os.path.join(OUT, f'soft_{c["photo"]}.png')
            if not os.path.exists(p) or _mt(p) < max(_mt(src), _mt(A.__file__)):
                A.soft_photo(src, p, fade='left', strength=0.5, darken=0.18)
            art['soft_' + c['photo']] = p
        if fn is L.map_offices:
            p = os.path.join(OUT, 'vn_dark.png')
            if not os.path.exists(p) or _mt(p) < _mt(A.__file__):
                A.dark_map(p, os.path.join(HERE, 'fonts', 'keynote', 'BeVietnamPro-SemiBold.ttf'))
            art['map_dark'] = p
            lon0, lon1, lat0, lat1 = 101.9, 117.6, 7.6, 23.6       # projection of laodong_assets.vn_regions
            for o in c['offices']:
                if 'lonlat' in o:
                    lon, lat = o['lonlat']
                    o['pin'] = [(lon - lon0) / (lon1 - lon0), (lat1 - lat) / (lat1 - lat0)]
            c.setdefault('map', 'map_dark')
    return dict(art=art, img=img, brand=meta['brand'])


def credit_lines(meta, content):
    rows = {r['image_id']: r for r in csv.DictReader(open(os.path.join(HERE, 'assets', 'images', 'credits.csv'),
                                                          encoding='utf-8'))}
    photos = meta.get('photos', {})
    used = set()

    def walk(v):
        if isinstance(v, str):
            if v in photos and photos[v] in rows:
                used.add(photos[v])
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, (list, tuple)):
            for x in v:
                walk(x)
    for _, c in content:
        walk(c)
    return [f"• {rows[i]['title'][:50]} — {rows[i]['author']} (Flickr, CC BY 2.0)" for i in sorted(used)]


def build(meta, content, out_dir, name):
    L.register()
    res = prepare(meta, content)
    prs = K.new_presentation()
    ctx = dict(n=0, **res)
    slides = []
    for fn, c in content:
        sl = fn(prs, ctx, c)
        if c.get('notes'):
            K.notes(sl, c['notes'])
        slides.append(sl)
    slides.append(L.credits(prs, ctx, dict(intro=meta.get('credit_intro', ''), lines=credit_lines(meta, content))))
    for s in slides:
        K.finalize(s)
    out = os.path.join(out_dir, name + ('' if name.endswith('.pptx') else '.pptx'))
    prs.save(out)
    print('saved', out, len(prs.slides._sldIdLst), 'slides')
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--content', required=True)
    ap.add_argument('--out', default=os.path.join(HERE, 'output'))
    ap.add_argument('--name', default='Keynote')
    a = ap.parse_args()
    meta, content = CIO.load(a.content, L)
    os.makedirs(a.out, exist_ok=True)
    build(meta, content, a.out, a.name)
