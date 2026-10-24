"""
Make a static, PowerPoint-friendly font file from a variable Google Font.

    python tools/static_font.py SRC.ttf OUT_DIR --family "Oswald" --weights 400:Regular 600:SemiBold 700:Bold \
        [--axis wdth=100 --axis opsz=12]

Naming follows what Office expects: Regular and Bold keep the family name (style Regular / Bold) so the B button
links them; every other weight becomes its own family "<Family> <Style>" (style Regular) with the typographic family
(name IDs 16/17) set, so it shows up as e.g. "Oswald SemiBold" in the font list. The STAT table is dropped.
"""
import argparse
import os

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer


def make(src, out_dir, family, weight, style, axes=None):
    f = TTFont(src)
    loc = {'wght': weight}
    loc.update(axes or {})
    if 'fvar' in f:
        known = {a.axisTag for a in f['fvar'].axes}
        loc = {k: v for k, v in loc.items() if k in known}
        f = instancer.instantiateVariableFont(f, loc)
    nm = f['name']
    for rec in list(nm.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 25):
            nm.removeNames(nameID=rec.nameID)
    ps = f'{family.replace(" ", "")}-{style}'
    linked = style in ('Regular', 'Bold')
    fam = family if linked else f'{family} {style}'
    sub = style if linked else 'Regular'
    full = family if style == 'Regular' else f'{family} {style}'
    vals = [(1, fam), (2, sub), (3, ps + ';static'), (4, full), (6, ps)]
    if not linked:
        vals += [(16, family), (17, style)]
    for nid, val in vals:
        nm.setName(val, nid, 3, 1, 0x409)
        nm.setName(val, nid, 1, 0, 0)
    os2 = f['OS/2']
    os2.usWeightClass = weight
    if style == 'Bold':
        os2.fsSelection = (os2.fsSelection & ~0b1000001) | 0b100000
        f['head'].macStyle = 1
    else:
        os2.fsSelection = (os2.fsSelection & ~0b1100001) | 0b1000000
        f['head'].macStyle = 0
    for t in ('STAT', 'MVAR', 'HVAR', 'VVAR'):
        if t in f:
            del f[t]
    out = os.path.join(out_dir, ps + '.ttf')
    f.save(out)
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out_dir')
    ap.add_argument('--family', required=True)
    ap.add_argument('--weights', nargs='+', required=True, help='e.g. 400:Regular 700:Bold')
    ap.add_argument('--axis', action='append', default=[], help='extra axis pin, e.g. wdth=100')
    a = ap.parse_args()
    axes = {k: float(v) for k, v in (x.split('=') for x in a.axis)}
    os.makedirs(a.out_dir, exist_ok=True)
    for w in a.weights:
        wt, st = w.split(':')
        print(make(a.src, a.out_dir, a.family, int(wt), st, axes))
