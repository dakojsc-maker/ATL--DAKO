"""
Render the stylised location map used by the Heritage (Hội An) template.

    python tools/make_map.py                                  # Đà Nẵng – Hội An (default)
    python tools/make_map.py --name hue_map --center 107.58,16.46 --span 1.6 \
        --place hue:107.5909,16.4637 --place danang:108.2022,16.0544

Data: Natural Earth 1:10m admin-1 provinces (public domain), downloaded once into .cache/.
Output: assets/maps/hoian_map.png (16:9, sea on the right) + hoian_map.json with the slide-relative
positions of the marked places, so the PowerPoint tags / route can be placed exactly.
"""
import json
import math
import os
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'lib'))
import heritage_assets as A  # noqa: E402

CACHE = os.path.join(ROOT, '.cache', 'geo')
OUTDIR = os.path.join(ROOT, 'assets', 'maps')
NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
FILES = ['ne_10m_admin_1_states_provinces.geojson', 'ne_10m_rivers_lake_centerlines.geojson']

PLACES = {'danang': (108.2022, 16.0544), 'hoian': (108.3380, 15.8801)}


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for f in FILES:
        p = os.path.join(CACHE, f)
        if not os.path.exists(p):
            urllib.request.urlretrieve(NE + f, p)
    return [os.path.join(CACHE, f) for f in FILES]


def render(admin_path, rivers_path, out_png, out_json, lon0=107.35, lon1=109.05, lat_c=15.98, w=2400, h=1350,
           borders_on=False, places=None):
    places = places or PLACES
    lon_span = lon1 - lon0
    lat_span = lon_span * math.cos(math.radians(lat_c)) * h / w
    lat0, lat1 = lat_c - lat_span / 2, lat_c + lat_span / 2

    def proj(lon, lat):
        return ((lon - lon0) / lon_span * w, (lat1 - lat) / lat_span * h)

    def near(coords):
        xs = [p[0] for p in coords]
        ys = [p[1] for p in coords]
        return max(xs) >= lon0 - 0.5 and min(xs) <= lon1 + 0.5 and max(ys) >= lat0 - 0.5 and min(ys) <= lat1 + 0.5

    def polys(g):
        return [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates'] if g['type'] == 'MultiPolygon' else []

    admin = json.load(open(admin_path, encoding='utf-8'))
    land = Image.new('L', (w, h), 0)
    dl = ImageDraw.Draw(land)
    borders = []
    for f in admin['features']:
        for poly in polys(f['geometry']):
            outer = poly[0]
            if not near(outer):
                continue
            pts = [proj(p[0], p[1]) for p in outer]
            dl.polygon(pts, fill=255)
            borders.append(pts)
    # close slivers between provinces, then round the 1:10m coastline a little
    land = land.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    land = land.filter(ImageFilter.GaussianBlur(5)).point(lambda v: 255 if v > 127 else 0)
    land = land.filter(ImageFilter.GaussianBlur(1.2))
    rng = np.random.default_rng(5)
    L = np.asarray(land).astype(np.float32) / 255
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # sea
    sea_top = np.array([19, 55, 85], np.float32)
    sea_bot = np.array([12, 32, 54], np.float32)
    t = (yy / h)[..., None]
    sea = sea_top * (1 - t) + sea_bot * t
    sea *= (0.96 + 0.08 * A._fbm(h, w, rng)[..., None])
    # shallow water band hugging the coast
    band = land.filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(28))
    B = np.asarray(band).astype(np.float32) / 255
    shallow = np.array([62, 128, 146], np.float32)
    sea = sea * (1 - B[..., None] * 0.75) + shallow * (B[..., None] * 0.75)
    # land
    land_c = np.array([238, 228, 204], np.float32)
    inland = np.array([214, 200, 168], np.float32)
    g = np.clip(1 - xx / (w * 0.75), 0, 1)[..., None] ** 1.5
    landrgb = land_c * (1 - g * 0.55) + inland * (g * 0.55)
    landrgb *= (0.95 + 0.1 * A._fbm(h, w, rng)[..., None])
    img = sea * (1 - L[..., None]) + landrgb * L[..., None]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    do = ImageDraw.Draw(ov)
    # province borders (dotted look: short segments)
    for pts in (borders if borders_on else []):
        for i in range(0, len(pts) - 1, 2):
            do.line([pts[i], pts[i + 1]], fill=(160, 130, 90, 110), width=2)
    # relief hint: soft darker mottling that grows toward the western highlands
    relief = A._fbm(h, w, rng, cells=(20, 60, 180), weights=(0.3, 0.4, 0.3))
    west = np.clip(1 - xx / (w * 0.6), 0, 1) ** 1.3
    ra = (np.clip(relief - 0.45, 0, 1) * 2.2 * west * L * 90).astype(np.uint8)
    rel = np.dstack([np.full((h, w), 150), np.full((h, w), 122), np.full((h, w), 82), ra]).astype(np.uint8)
    ov = Image.alpha_composite(ov, Image.fromarray(rel, 'RGBA'))
    do = ImageDraw.Draw(ov)
    # rivers if the dataset covers the area
    if rivers_path and os.path.exists(rivers_path):
        rv = json.load(open(rivers_path, encoding='utf-8'))
        for f in rv['features']:
            gm = f['geometry']
            lines = [gm['coordinates']] if gm['type'] == 'LineString' else gm['coordinates'] if gm['type'] == 'MultiLineString' else []
            for ln in lines:
                if near(ln):
                    do.line([proj(p[0], p[1]) for p in ln], fill=(120, 160, 180, 170), width=4)
    # coastline highlight
    edge = land.filter(ImageFilter.MaxFilter(5))
    E = (np.asarray(edge).astype(np.int16) - np.asarray(land).astype(np.int16)).clip(0, 255).astype(np.uint8)
    coast = Image.new('RGBA', (w, h), (190, 226, 232, 0))
    coast.putalpha(Image.fromarray(E).filter(ImageFilter.GaussianBlur(1.2)))
    im = Image.alpha_composite(im, ov)
    im = Image.alpha_composite(im, coast)
    # right-hand shade so text on the sea stays legible
    shade = np.clip((xx / w - 0.55) / 0.45, 0, 1) ** 1.2 * 0.35
    sh = np.dstack([np.full((h, w), 10), np.full((h, w), 26), np.full((h, w), 44), shade * 255]).astype(np.uint8)
    im = Image.alpha_composite(im, Image.fromarray(sh, 'RGBA'))
    im.convert('RGB').resize((1920, 1080), Image.LANCZOS).save(out_png, optimize=True)
    pts = {k: (proj(*v)[0] / w, proj(*v)[1] / h) for k, v in places.items()}
    json.dump({'points': pts, 'bbox': [lon0, lat0, lon1, lat1]}, open(out_json, 'w'), indent=1)
    return out_png, pts


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--name', default='hoian_map', help='output base name in assets/maps/')
    ap.add_argument('--center', help='lon,lat of the map centre (default: Đà Nẵng – Hội An)')
    ap.add_argument('--span', type=float, default=1.7, help='longitude span in degrees')
    ap.add_argument('--place', action='append', default=[], help='key:lon,lat (repeatable)')
    a = ap.parse_args()
    kw = {}
    if a.center:
        lon, lat = map(float, a.center.split(','))
        kw = dict(lon0=lon - a.span / 2, lon1=lon + a.span / 2, lat_c=lat)
    places = {p.split(':')[0]: tuple(map(float, p.split(':')[1].split(','))) for p in a.place} or None
    os.makedirs(OUTDIR, exist_ok=True)
    admin, rivers = fetch()
    png, pts = render(admin, rivers, os.path.join(OUTDIR, a.name + '.png'), os.path.join(OUTDIR, a.name + '.json'),
                      places=places, **kw)
    print(png, pts)
