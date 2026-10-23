"""
Procedural artwork for the M05 "Lao động – Việc làm" template (warm orange report style).

Every function writes a PNG/JPG and returns its path. Only vn_regions() needs the Natural Earth file
(.cache/geo/ne_10m_admin_1_states_provinces.geojson, downloaded by tools/make_map.py on first use).
    peach_bg()     light peach background with soft light waves and an optional faint figure watermark
    swoosh()       orange / red ribbon sweeping in from the bottom-right corner
    vn_regions()   map of Việt Nam's six socio-economic regions coloured by value (+ Hoàng Sa, Trường Sa),
                   returns label anchors so the numbers can be editable text boxes on the slide
"""
import json
import math
import os
import urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import maclenin_assets as MA   # band / curve helpers

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO = os.path.join(ROOT, '.cache', 'geo', 'ne_10m_admin_1_states_provinces.geojson')
NE_URL = ('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
          'ne_10m_admin_1_states_provinces.geojson')


def _hex(c):
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


# ------------------------------------------------------------------ background
def peach_bg(out, w=1920, h=1080, top='FFF8F1', bottom='FFE3CC', seed=2, watermark=None, wm_alpha=0.08,
             wm_box=(0.0, 0.48, 0.5)):
    """Warm paper background. watermark = cut-out PNG drawn as a faint orange-brown silhouette (x, y, height)."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.clip((xx / w) * 0.45 + (yy / h) * 0.75, 0, 1)[..., None]
    a, b = np.array(_hex(top), np.float32), np.array(_hex(bottom), np.float32)
    img = a * (1 - t) + b * t
    # soft light waves (wide bands of lighter colour)
    for k in range(4):
        ph = rng.uniform(0, 6)
        amp = rng.uniform(60, 140)
        base = rng.uniform(0.15, 0.95) * h
        curve = base + amp * np.sin(xx / w * math.pi * rng.uniform(1.0, 2.2) + ph) - xx * rng.uniform(0.1, 0.35)
        d = np.abs(yy - curve)
        band = np.exp(-(d / rng.uniform(40, 90)) ** 2) * rng.uniform(0.25, 0.45)
        img = img * (1 - band[..., None]) + 255 * band[..., None]
    # warm glow bottom-right
    r = np.sqrt(((xx - w) / (w * 0.7)) ** 2 + ((yy - h) / (h * 0.9)) ** 2)
    glow = np.clip(1 - r, 0, 1) ** 2 * 0.22
    img = img * (1 - glow[..., None]) + np.array([255, 196, 150], np.float32) * glow[..., None]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB')
    if watermark:
        x0, y0, hh = wm_box
        wm = Image.open(watermark).convert('RGBA')
        th = int(h * hh)
        wm = wm.resize((max(1, int(wm.width * th / wm.height)), th), Image.LANCZOS)
        al = np.asarray(wm.split()[3]).astype(np.float32) / 255 * wm_alpha
        lum = np.asarray(wm.convert('L')).astype(np.float32) / 255
        tone = np.array([196, 120, 70], np.float32)
        arr = np.asarray(im).astype(np.float32)
        px, py = int(x0 * w), int(y0 * h)
        x1, y1 = min(w, px + wm.width), min(h, py + wm.height)
        reg = arr[py:y1, px:x1]
        a_ = al[: y1 - py, : x1 - px, None]
        col = tone * (0.75 + lum[: y1 - py, : x1 - px, None] * 0.4)
        arr[py:y1, px:x1] = reg * (1 - a_) + col * a_
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')
    im.save(out, quality=90)
    return out


# ------------------------------------------------------------------ swoosh
def swoosh(out, w=1600, h=700, colors=('D9381E', 'F26B1F', 'FFB04A'), ss=2):
    """Layered ribbon from the bottom-left of the canvas rising to the right (place at a slide's bottom-right)."""
    im = Image.new('RGBA', (w * ss, h * ss), (0, 0, 0, 0))
    layers = [   # each band rises out of the bottom edge on the left and leaves through the right edge
        (colors[2], [(-60, h + 120), (420, h - 110), (1000, h - 180), (w + 100, h - 470)], 70, (0.2, 0.6)),
        (colors[1], [(-60, h + 170), (420, h - 60), (1000, h - 100), (w + 100, h - 370)], 110, (0.1, 0.5)),
        (colors[0], [(-60, h + 230), (460, h + 10), (1050, h - 10), (w + 100, h - 270)], 150, (0.0, 0.4)),
    ]
    for col, pts, width, tw in layers:
        rgb = _hex(col)
        band = MA._band((w * ss, h * ss), [(x * ss, y * ss) for x, y in pts], width * ss, [(1, rgb)], twist=tw,
                        light=0.15, profile=lambda s: 0.9 + 0.18 * math.cos(s * 1.4))
        im.alpha_composite(band)
    im = im.resize((w, h), Image.LANCZOS)
    MA._with_shadow(im, dx=0, dy=-10, blur=14, alpha=0.3).save(out, optimize=True)
    return out


# ------------------------------------------------------------------ Việt Nam regions map
REGIONS = {
    'TDMNBB': ('Trung du và miền núi Bắc Bộ', ['Hà Giang', 'Cao Bằng', 'Đông Bắc', 'Tuyên Quang', 'Lào Cai', 'Yên Bái',
                                               'Thái Nguyên', 'Lạng Sơn', 'Bắc Giang', 'Phú Thọ', 'Điện Biên',
                                               'Lai Chau', 'Son La', 'Hòa Bình']),
    'DBSH': ('Đồng bằng sông Hồng', ['Ha Noi', 'Vĩnh Phúc', 'Bắc Ninh', 'Quảng Ninh', 'Hải Dương', 'Hải Phòng',
                                     'Đồng Bằng Sông Hồng', 'Thái Bình', 'Hà Nam', 'Nam Định', 'Ninh Bình']),
    'BTB_DHMT': ('Bắc Trung Bộ và Duyên hải miền Trung', ['Thanh Hóa', 'Nghệ An', 'Ha Tinh', 'Quảng Bình', 'Quảng Trị',
                                                          'Thừa Thiên - Huế', 'Đà Nẵng', 'Quàng Nam', 'Quảng Ngãi',
                                                          'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận',
                                                          'Bình Thuận']),
    'TN': ('Tây Nguyên', ['Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng']),
    'DNB': ('Đông Nam Bộ', ['Bình Phước', 'Tây Ninh', 'Bình Dương', 'Đông Nam Bộ', 'Bà Rịa - Vũng Tàu',
                            'Hồ Chí Minh city']),
    'DBSCL': ('Đồng bằng sông Cửu Long', ['Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Ðong Tháp',
                                         'An Giang', 'Kiên Giang', 'Can Tho', 'Hau Giang', 'Sóc Trăng', 'Bạc Liêu',
                                         'Cà Mau']),
}
# label anchors (lon, lat) inside each region
ANCHORS = {'TDMNBB': (104.25, 21.75), 'DBSH': (106.35, 20.75), 'BTB_DHMT': (106.45, 17.75), 'TN': (108.05, 13.4),
           'DNB': (106.75, 11.35), 'DBSCL': (105.55, 9.85)}
# island groups (lon, lat) — drawn as dot clusters
PARACEL = [(111.6, 16.5), (111.75, 16.45), (112.0, 16.95), (112.35, 16.6), (111.2, 15.8), (112.7, 16.05),
           (111.9, 16.3), (112.25, 16.85)]
SPRATLY = [(114.3, 11.4), (114.6, 10.4), (114.35, 10.2), (115.8, 10.8), (113.9, 9.0), (112.9, 8.65),
           (114.9, 8.85), (116.1, 9.9), (114.1, 9.6), (115.3, 9.4), (113.3, 8.2), (116.4, 10.6)]


def _load_geo():
    if not os.path.exists(GEO):
        os.makedirs(os.path.dirname(GEO), exist_ok=True)
        urllib.request.urlretrieve(NE_URL, GEO)
    return json.load(open(GEO, encoding='utf-8'))


def vn_regions(out, values, highlight=None, w=1100, base='FBDCC4', low='FDBA86', high='D9381E',
               font_path=None, island_labels=('QĐ. Hoàng Sa', 'QĐ. Trường Sa'), label_color=(150, 90, 60)):
    """values = {region code: number}. Regions in `highlight` (default: all with values) get a colour from
    low -> high by value; others stay pale. Writes out (PNG) and returns dict(path, anchors{code: (fx, fy)})."""
    lon0, lon1, lat0, lat1 = 101.9, 117.6, 7.6, 23.6
    sx = w / (lon1 - lon0)
    sy = sx / math.cos(math.radians(15.6))           # equirectangular, true shape at the centre latitude
    h = int(round((lat1 - lat0) * sy))

    def proj(lon, lat):
        return ((lon - lon0) * sx, (lat1 - lat) * sy)

    geo = _load_geo()
    feats = [f for f in geo['features'] if f['properties'].get('adm0_a3') == 'VNM']
    name2reg = {p: code for code, (_, provs) in REGIONS.items() for p in provs}
    highlight = set(highlight if highlight is not None else values.keys())
    vals = [values[k] for k in highlight if k in values]
    vmin, vmax = (min(vals), max(vals)) if vals else (0, 1)
    lo, hi, bs = np.array(_hex(low), float), np.array(_hex(high), float), _hex(base)
    ss = 2
    W, H = w * ss, h * ss
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    regmask = {code: Image.new('L', (W, H), 0) for code in REGIONS}
    for f in feats:
        code = name2reg.get(f['properties']['name'])
        g = f['geometry']
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for poly in polys:
            pts = [(x * ss, y * ss) for x, y in (proj(*p) for p in poly[0])]
            if code:
                ImageDraw.Draw(regmask[code]).polygon(pts, fill=255)
    for code, m in regmask.items():
        m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
        if code in highlight and code in values:
            t = (values[code] - vmin) / (vmax - vmin) if vmax > vmin else 1.0
            col = tuple(int(v) for v in lo * (1 - t) + hi * t)
        else:
            col = bs
        layer = Image.new('RGBA', (W, H), col + (255,))
        im.paste(layer, (0, 0), m)
    # province borders, thin white
    for f in feats:
        g = f['geometry']
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for poly in polys:
            pts = [(x * ss, y * ss) for x, y in (proj(*p) for p in poly[0])]
            dr.line(pts + [pts[0]], fill=(255, 250, 245, 150), width=2 * ss // 2)
    # region outlines, thicker white
    for code, m in regmask.items():
        edge = m.filter(ImageFilter.MaxFilter(7))
        e = np.asarray(edge).astype(np.int16) - np.asarray(m.filter(ImageFilter.MinFilter(3))).astype(np.int16)
        e = Image.fromarray(np.clip(e, 0, 255).astype(np.uint8))
        im.paste(Image.new('RGBA', (W, H), (255, 255, 255, 230)), (0, 0), e.point(lambda v: int(v * 0.5)))
    # islands
    rng = np.random.default_rng(3)
    for group in (PARACEL, SPRATLY):
        for lon, lat in group:
            x, y = proj(lon, lat)
            for _ in range(3):
                dx, dy = rng.normal(0, 6, 2)
                r = rng.uniform(2.0, 4.5) * ss
                cx, cy = (x + dx) * ss, (y + dy) * ss
                dr.ellipse((cx - r, cy - r, cx + r, cy + r), fill=_hex(low) + (255,))
    if font_path:
        f = ImageFont.truetype(font_path, 22 * ss)
        for (lon, lat), txt in zip(((111.1, 17.55), (112.6, 12.2)), island_labels):
            x, y = proj(lon, lat)
            dr.text((x * ss, y * ss), txt, font=f, fill=label_color + (255,))
    im = im.resize((w, h), Image.LANCZOS)
    # soft shadow under the land
    a = im.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.25))
    sh = Image.new('RGBA', (w, h), (150, 70, 20, 0))
    sh.putalpha(a)
    sh = sh.transform((w, h), Image.AFFINE, (1, 0, -6, 0, 1, -10))
    canvas = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    canvas.alpha_composite(sh)
    canvas.alpha_composite(im)
    canvas.save(out, optimize=True)
    anchors = {code: (proj(*ll)[0] / w, proj(*ll)[1] / h) for code, ll in ANCHORS.items()}
    return dict(path=out, anchors=anchors, names={k: v[0] for k, v in REGIONS.items()})
