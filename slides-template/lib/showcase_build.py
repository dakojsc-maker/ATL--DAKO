"""
Shared builder for the product-showcase templates (M06 build_thiennhien.py, M07 build_nongsan.py).

A builder module provides THEME, PHOTOS (key -> Open Images id or path), PRODUCTS (key -> PNG path of a real
cut-out product photo, or a mock-up spec dict {'type': 'sack' | 'jug' | 'pouch', ...product_assets kwargs}),
BRAND {name, icon, menu}, DECOR (art keys for flying decorations) and build_content().
Content files (JSON) may override "photos", "products" and "brand"; products given as paths are used as-is.
"""
import csv
import json
import os

import pptkit as K
import product_assets as A
import content_io as CIO
import layouts_showcase as L

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _p(*a):
    return os.path.join(ROOT, *a)


def _mtime(p):
    return os.path.getmtime(p) if os.path.exists(p) else 0


def blurred_png(src, dst, radius=7, alpha=0.85):
    from PIL import Image, ImageFilter
    im = Image.open(src).convert('RGBA')
    pad = radius * 3
    big = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    big.paste(im, (pad, pad))
    big = big.filter(ImageFilter.GaussianBlur(radius))
    if alpha < 1:
        a = big.split()[3].point(lambda v: int(v * alpha))
        big.putalpha(a)
    big.save(dst, optimize=True)
    return dst


def font(theme, role):
    return _p('fonts', L.THEMES[theme]['fonts'][role][1])


def make_product(theme, key, spec, out_dir, photos):
    """Mock-up spec -> PNG (regenerated when the spec changes)."""
    if isinstance(spec, str):
        return CIO.photo_path(spec)
    spec = dict(spec)
    kind = spec.pop('type')
    stamp = json.dumps([kind, spec], sort_keys=True, ensure_ascii=False)
    out = os.path.join(out_dir, f'prod_{key}.png')
    sfile = out + '.spec'
    if os.path.exists(out) and os.path.exists(sfile) and open(sfile, encoding='utf-8').read() == stamp:
        return out
    if 'photo' in spec and spec['photo']:
        spec['photo'] = CIO.photo_path(photos.get(spec['photo'], spec['photo']))
    fonts = dict(title_font=font(theme, 'title'), body_font=font(theme, 'semi'))
    if kind == 'agri_pack':                    # condensed title face suits the agri labels best
        fonts['title_font'] = _p('fonts', 'thiennhien', 'Oswald-Bold.ttf')
    if kind == 'pouch':
        fonts['script_font'] = font(theme, 'script')
    getattr(A, kind)(out, **fonts, **spec)
    open(sfile, 'w', encoding='utf-8').write(stamp)
    return out


def concept_variants(content):
    """(product key, scheme) pairs needed by concept-comparison slides."""
    out = []
    for fn, c in content:
        if fn is L.concepts:
            for it in c['items']:
                if it.get('scheme'):
                    out += [(k, it['scheme']) for k in it.get('products', [])]
    return out


def sepia_keys(content):
    keys = set()
    for fn, c in content:
        if fn is L.story_cards:
            keys |= {cd['photo'] for cd in c['cards']}
    return keys


def prepare(mod, content):
    theme = mod.THEME
    out = _p('assets', 'images', 'build', theme)
    os.makedirs(out, exist_ok=True)
    img = {k: CIO.photo_path(v) for k, v in mod.PHOTOS.items()}
    art = {}

    def make(key, fname, fn, src_mtime=0):
        p = os.path.join(out, fname)
        if not os.path.exists(p) or _mtime(p) < src_mtime:
            fn(p)
        art[key] = p

    T = dict(L.THEMES[theme])
    T.update(mod.BRAND.get('colors', {}))
    make('white', 'white.jpg', lambda p: _white(p))
    make('paper', f'paper_{T["bg"]}.jpg', lambda p: A.paper(p, base=T['bg']))
    make('mist', 'mist.png', lambda p: A.mist(p))
    grass_src = img.get(getattr(mod, 'GRASS', ''), None)
    if grass_src:
        make('grass', 'grass.png', lambda p: A.grass_strip(grass_src, p), _mtime(grass_src))
    for key, (fn, kw) in mod.DECOR_ART.items():
        make(key, f'{key}.png', lambda p, fn=fn, kw=kw: getattr(A, fn)(p, **kw))
        make(key + '_blur', f'{key}_blur.png', lambda p, key=key: blurred_png(art[key], p, radius=9, alpha=0.8),
             _mtime(art[key]))
    for k in sepia_keys(content):
        src = img.get(k, CIO.photo_path(k))
        make('sepia_' + k, f'sepia_{k}.jpg', lambda p, src=src: A.sepia(src, p), _mtime(src))
    prod = {}
    for key, spec in mod.PRODUCTS.items():
        path = make_product(theme, key, spec, out, mod.PHOTOS)
        bl = os.path.join(out, f'prod_{key}_blur.png')
        if not os.path.exists(bl) or _mtime(bl) < _mtime(path):
            blurred_png(path, bl, radius=6, alpha=0.9)
        prod[key] = dict(path=path, blur=bl)
    for key, scheme in concept_variants(content):
        spec = mod.PRODUCTS[key]
        if not isinstance(spec, dict):
            continue
        spec = dict(spec, scheme=scheme)
        vk = f'{key}@{scheme}'
        prod[vk] = dict(path=make_product(theme, vk, spec, out, mod.PHOTOS), blur=None)
    return dict(img=img, art=art, prod=prod, brand=mod.BRAND, decor=list(mod.DECOR_ART.keys()))


def _white(p):
    """Near-white background with a faint sky tint at the top (M06)."""
    import numpy as np
    from PIL import Image
    h, w = 1080, 1920
    yy = np.linspace(0, 1, h)[:, None, None]
    top = np.array([236, 243, 246], np.float32)
    bot = np.array([255, 255, 255], np.float32)
    arr = top * (1 - yy) + bot * yy
    arr = np.repeat(arr, w, 1)
    Image.fromarray(arr.astype(np.uint8)).save(p, quality=92)
    return p


def credit_lines(mod, content):
    rows = list(csv.DictReader(open(_p('assets', 'images', 'credits.csv'), encoding='utf-8')))
    used = set()

    def walk(v):
        if isinstance(v, str):
            if v in mod.PHOTOS:
                used.add(mod.PHOTOS[v])
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, (list, tuple)):
            for x in v:
                walk(x)
    for _, c in content:
        walk(c)
    for spec in mod.PRODUCTS.values():
        if isinstance(spec, dict) and spec.get('photo') in mod.PHOTOS:
            used.add(mod.PHOTOS[spec['photo']])
    if getattr(mod, 'GRASS', None) in mod.PHOTOS:
        used.add(mod.PHOTOS[mod.GRASS])
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(mod, out_dir, content=None, name=None):
    L.register(mod.THEME, mod.BRAND.get('colors'))
    content = content or mod.build_content()
    res = prepare(mod, content)
    prs = K.new_presentation()
    ctx = dict(n=0, **res)
    slides = []
    for fn, c in content:
        r = fn(prs, ctx, c)
        slides += r if isinstance(r, list) else [r]
    slides.append(L.credits(prs, ctx, dict(intro=mod.CREDIT_INTRO, lines=credit_lines(mod, content))))
    for s in slides:
        K.finalize(s)
    name = (name + ('' if name.endswith('.pptx') else '.pptx')) if name else mod.DEFAULT_NAME
    out = os.path.join(out_dir, name)
    prs.save(out)
    print('saved', out, len(prs.slides._sldIdLst), 'slides')
    return out


def main(mod, here):
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(here, 'output'))
    ap.add_argument('--content', help='JSON content file (see lib/content_io.py)')
    ap.add_argument('--name', help='output file name (without .pptx)')
    ap.add_argument('--dump-sample', metavar='PATH', help='write the demo content as a JSON content file and exit')
    a = ap.parse_args()
    if a.dump_sample:
        print('wrote', CIO.save(a.dump_sample, mod.build_content(), template=mod.CODE, title=mod.TITLE,
                                brand=mod.BRAND, photos=mod.PHOTOS, products=mod.PRODUCTS))
        raise SystemExit(0)
    content = None
    if a.content:
        meta, content = CIO.load(a.content, L)
        mod.PHOTOS.update(meta.get('photos', {}))
        mod.PRODUCTS.update(meta.get('products', {}))
        mod.BRAND.update(meta.get('brand', {}))
    os.makedirs(a.out, exist_ok=True)
    build(mod, a.out, content, a.name)

