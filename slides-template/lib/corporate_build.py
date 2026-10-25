"""
Shared builder for the corporate templates (M08 build_doanhnghiep.py, M09 build_dichvu.py).

A builder module provides THEME, CODE, TITLE, DEFAULT_NAME, PHOTOS (key -> Open Images id or path), BRAND
{name, short, initial, tagline, colors?, logo?, pattern?}, LIGHT_PHOTO (photo printed faintly into the light
background), CREDIT_INTRO and build_content(). Content files (JSON) may override "photos", "brand" and
"credit_intro". brand.logo (PNG with transparency) replaces the drawn initial in the emblem and the corner mark;
brand.pattern = "circuit" adds faint circuit traces to the backgrounds; brand.watermark = false drops the faint
LIGHT_PHOTO from the light background.
Cut-out people (letter slide "portrait"): assets/images/cut/ld_<key>.png (shared with M05).
"""
import csv
import hashlib
import os

import pptkit as K
import corporate_assets as A
import content_io as CIO
import layouts_corporate as L
import maclenin_assets as MA

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT = os.path.join(ROOT, 'assets', 'images', 'cut')
# cut-out key -> Open Images id it was made from (for the credits slide)
CUT_SOURCE = {'businessman': 'b3326da0ca981d1a', 'businesswoman': '1012be5da4a238ab', 'nurse': '56fd536256dae19b',
              'worker': '05c6fc62d2980f50', 'carpenter': '7b04f5074a2fad76'}


def _p(*a):
    return os.path.join(ROOT, *a)


def _mtime(p):
    return os.path.getmtime(p) if os.path.exists(p) else 0


def cut_paths(out):
    res = {}
    for f in sorted(os.listdir(CUT)):
        if f.startswith('ld_') and f.endswith('.png'):
            src, dst = os.path.join(CUT, f), os.path.join(out, 'cut_' + f[3:])
            if not os.path.exists(dst) or _mtime(dst) < _mtime(src):
                MA.defringe(src, dst, choke=2)
            res[f[3:-4]] = dst
    return res


def prepare(mod, content):
    T = L.T
    tag = T['primary'] + T['dark']
    out = _p('assets', 'images', 'build', mod.THEME)
    os.makedirs(out, exist_ok=True)
    img = {k: CIO.photo_path(v) for k, v in mod.PHOTOS.items()}
    art = {}

    def make(key, fname, fn, src_mtime=0):
        p = os.path.join(out, fname)
        if not os.path.exists(p) or _mtime(p) < src_mtime:
            fn(p)
        art[key] = p

    b = mod.BRAND
    traces = b.get('pattern') == 'circuit'          # faint printed-circuit traces on the backgrounds
    tag += 'c' if traces else ''
    wm = img.get(getattr(mod, 'LIGHT_PHOTO', None)) if b.get('watermark', True) else None
    wtag = hashlib.md5(str(wm).encode()).hexdigest()[:6]
    make('light_bg', f'light_{tag}_{wtag}.jpg', lambda p: A.light_bg(p, base=T['bg'], tint=T['pale'],
                                                                       accent=T['primary'], photo=wm, photo_alpha=0.1,
                                                                       traces=traces), _mtime(wm or ''))
    logo = CIO.photo_path(b['logo']) if b.get('logo') else None
    if logo:                                         # the client's own logo replaces the drawn initial
        art['logo'] = logo
    if T['style'] == 'tech':
        make('dark_bg', f'dark_{tag}.jpg', lambda p: A.tech_bg(p, dark=T['dark'], mid=T['primary'], light=T['light'],
                                                              glow=(0.5, 0.52), traces=traces))
        make('cover_bg', f'cover_{tag}.jpg', lambda p: A.tech_bg(p, dark=T['dark'], mid=T['primary'],
                                                                light=T['light'], glow=(0.76, 0.48), seed=7,
                                                                traces=traces))
        ltag = hashlib.md5(str(logo).encode()).hexdigest()[:6] if logo else b.get('initial', 'A')
        make('emblem', f'emblem_{ltag}_{tag}{T.get("ring", "")}.png',
             lambda p: A.ring_emblem(p, letter=b.get('initial', b['name'][0]), c1=T['primary'], c2=T.get('ring', '9FDCFF'),
                                     glow=T['light'], font_path=_p('fonts', T['fonts']['title'][1]), logo=logo),
             _mtime(logo or ''))
        make('ring', f'ring_{tag}{T.get("ring", "")}.png', lambda p: A.ring_emblem(p, letter=None, c1=T['primary'], c2=T.get('ring', '9FDCFF'),
                                                               glow=T['light']))
    else:
        make('dark_bg', f'dark_{tag}.jpg', lambda p: A.chevron_bg(p, dark=T['dark'], mid=T['primary'],
                                                                 light=T['light']))
        make('cover_bg', f'cover_{tag}.jpg', lambda p: A.chevron_bg(p, dark=T['dark'], mid=T['primary'],
                                                                   light=T['light'], side='left', seed=4))
    for fn, c in content:
        if fn is L.section:
            src = img.get(c['photo'], CIO.photo_path(c['photo']))
            foc = tuple(c.get('focus', (0.5, 0.5)))
            stag = hashlib.md5(src.encode()).hexdigest()[:6]
            make('sec_' + c['photo'], f'sec_{c["photo"]}_{stag}_{tag}_{foc[0]:.2f}_{foc[1]:.2f}.jpg',
                 lambda p, src=src, foc=foc: A.photo_tint(src, p, color=T['dark'], light=T['primary'], focus=foc,
                                                          strength=0.82), _mtime(src))
    return dict(img=img, art=art, cut=cut_paths(out), brand=mod.BRAND)


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
    for fn, c in content:
        walk(c)
        if fn is L.letter and c.get('portrait') in CUT_SOURCE:
            used.add(CUT_SOURCE[c['portrait']])
    if mod.BRAND.get('watermark', True) and getattr(mod, 'LIGHT_PHOTO', None) in mod.PHOTOS:
        used.add(mod.PHOTOS[mod.LIGHT_PHOTO])
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(mod, out_dir, content=None, name=None):
    L.register(mod.THEME, mod.BRAND.get('colors'))
    content = content or mod.build_content()
    res = prepare(mod, content)
    prs = K.new_presentation()
    ctx = dict(n=0, **res)
    slides = []
    for fn, c in content:
        sl = fn(prs, ctx, c)
        if c.get('notes'):                      # speaker notes for any slide
            K.notes(sl, c['notes'])
        slides.append(sl)
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
                                brand=mod.BRAND, photos=mod.PHOTOS))
        raise SystemExit(0)
    content = None
    if a.content:
        meta, content = CIO.load(a.content, L)
        mod.PHOTOS.update(meta.get('photos', {}))
        mod.BRAND.update(meta.get('brand', {}))
        if meta.get('credit_intro'):
            mod.CREDIT_INTRO = meta['credit_intro']
    os.makedirs(a.out, exist_ok=True)
    build(mod, a.out, content, a.name)
