"""
Procedural artwork for the corporate templates (M08 "Hồ sơ Doanh nghiệp", M09 "Giới thiệu Dịch vụ").

Every function writes a PNG/JPG and returns its path.
    tech_bg()      deep blue cover / section background: radial glow, diagonal light streaks, fine grid, bokeh
    light_bg()     near-white content background with a soft tint, diagonal light planes, an optional faint
                   architectural photo watermark on one side and optional circuit traces
    circuit()      printed-circuit trace mask (used by tech_bg / light_bg with traces=True)
    ring_emblem()  glowing 3D ring with an orbit and the brand initial or the client's logo in the centre
    chevron_bg()   green gradient with large translucent chevrons (service template cover / sections)
    photo_tint()   photo with a colour gradient overlay baked in (section slides)
"""
import math
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


def _hex(c):
    c = c.lstrip('#')
    return np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def _noise(h, w, cell, seed):
    rng = np.random.default_rng(seed)
    small = rng.random((max(2, h // cell + 2), max(2, w // cell + 2))).astype(np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)


def _save(arr, out, quality=90):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    if out.lower().endswith('.png'):
        im.save(out, optimize=True)
    else:
        im.convert('RGB').save(out, quality=quality)
    return out


# ------------------------------------------------------------------ backgrounds
def circuit(h, w, seed=11, n=34, width=2, avoid=None):
    """Faint printed-circuit traces (float mask 0..1): horizontal runs with 45° bends ending in round pads.
    avoid = (x0, y0, x1, y1) fractions kept free of traces (e.g. the title area)."""
    rng = np.random.default_rng(seed)
    m = np.zeros((h, w), np.float32)
    for _ in range(n):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        if avoid and avoid[0] * w < x < avoid[2] * w and avoid[1] * h < y < avoid[3] * h:
            continue
        pts = [(x, y)]
        dx = rng.choice((-1, 1))
        for k in range(rng.integers(2, 4)):
            run = rng.uniform(0.04, 0.16) * w
            x += dx * run
            pts.append((x, y))
            if k < 2:
                d = rng.uniform(0.02, 0.07) * w
                x += dx * d
                y += rng.choice((-1, 1)) * d
                pts.append((x, y))
        p = np.array(pts, np.int32)
        cv2.polylines(m, [p], False, 1.0, width, lineType=cv2.LINE_AA)
        for (px, py) in (pts[0], pts[-1]):
            cv2.circle(m, (int(px), int(py)), width * 3, 1.0, width, lineType=cv2.LINE_AA)
    return m


def tech_bg(out, w=1920, h=1080, dark='04145A', mid='0B3BD1', light='3FA9FF', glow=(0.68, 0.5), seed=3,
            streaks=True, grid=True, traces=False):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    gx, gy = glow
    r = np.sqrt(((xx / w - gx) / 0.75) ** 2 + ((yy / h - gy) / 0.95) ** 2)
    t = np.clip(1 - r, 0, 1)[..., None]
    img = _hex(dark) * (1 - t) + _hex(mid) * t
    core = np.exp(-(((xx / w - gx) / 0.12) ** 2 + ((yy / h - gy) / 0.2) ** 2))[..., None]
    img = img * (1 - core * 0.7) + _hex(light) * core * 0.7
    if streaks:   # diagonal light streaks crossing the glow
        for k in range(9):
            ang = math.radians(rng.uniform(-35, -20) if k % 2 else rng.uniform(20, 35))
            off = rng.uniform(-0.4, 0.4) * w
            d = (xx - gx * w - off) * math.sin(ang) - (yy - gy * h) * math.cos(ang)
            width = rng.uniform(2, 9)
            a = np.exp(-(d / width) ** 2) * rng.uniform(0.08, 0.28)
            a *= np.clip(1 - r * 1.2, 0, 1)
            img = img + (_hex('FFFFFF') - img) * a[..., None]
    if grid:
        g = np.zeros((h, w), np.float32)
        step = 64
        g[(yy.astype(int) % step) == 0] = 1
        g[(xx.astype(int) % step) == 0] = 1
        g = cv2.GaussianBlur(g, (0, 0), 0.6) * 0.05 * np.clip(1.1 - r, 0, 1)
        img = img + (_hex(light) - img) * g[..., None]
    if traces:
        tr = circuit(h, w, seed + 20, n=40)
        img = img + (_hex(light) - img) * (tr * 0.16)[..., None]
    # bokeh
    bok = np.zeros((h, w), np.float32)
    for _ in range(26):
        cx, cy = rng.uniform(0, w), rng.uniform(0, h)
        rad = rng.uniform(6, 26)
        bok += np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / rad ** 2) ** 2) * rng.uniform(0.05, 0.25)
    img = img + (_hex(light) - img) * np.clip(bok, 0, 1)[..., None]
    img += rng.normal(0, 1.2, (h, w, 1))
    return _save(img, out)


def light_bg(out, w=1920, h=1080, base='F4F7FB', tint='DCE7F7', accent='1F4FD8', photo=None, photo_side='right',
             photo_alpha=0.12, seed=5, planes=True, traces=False):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.clip(xx / w * 0.6 + yy / h * 0.4, 0, 1)[..., None]
    img = _hex(base) * (1 - t) + _hex(tint) * t
    if planes:   # big soft diagonal light planes
        for k, (x0, slope, a) in enumerate(((0.62, 1.6, 0.35), (0.78, 1.6, 0.25), (0.9, 1.6, 0.18))):
            d = (xx / w - x0) - (yy / h - 0.5) / slope
            m = (d > 0).astype(np.float32)
            m = cv2.GaussianBlur(m, (0, 0), 3) * a
            img = img + (_hex('FFFFFF') - img) * m[..., None] * 0.6
    if photo:
        ph = Image.open(photo).convert('L')
        pw = int(w * 0.55)
        ph = ph.resize((pw, int(ph.height * pw / ph.width)), Image.LANCZOS)
        if ph.height < h:
            ph = ph.resize((int(ph.width * h / ph.height), h), Image.LANCZOS)
        ph = np.asarray(ph.crop((0, 0, pw, h))).astype(np.float32) / 255
        fade = np.linspace(0, 1, pw)[None, :] if photo_side == 'right' else np.linspace(1, 0, pw)[None, :]
        a = (1 - ph) * photo_alpha * fade ** 1.5
        x0 = w - pw if photo_side == 'right' else 0
        reg = img[:, x0:x0 + pw]
        img[:, x0:x0 + pw] = reg * (1 - a[..., None]) + _hex(accent) * 0.6 * a[..., None]
    if traces:   # faint circuit traces, kept off the title band
        tr = circuit(h, w, seed + 7, n=30, avoid=(0, 0, 0.75, 0.22))
        img = img + (_hex(accent) - img) * (tr * 0.07)[..., None]
    img += np.random.default_rng(seed).normal(0, 0.8, (h, w, 1))
    return _save(img, out)


def chevron_bg(out, w=1920, h=1080, dark='0A5C36', mid='00A758', light='7FD6A3', seed=2, side='right'):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.clip(xx / w * 0.7 + (1 - yy / h) * 0.3, 0, 1)[..., None]
    img = _hex(dark) * (1 - t) + _hex(mid) * t
    for k, (cx, wdt, a) in enumerate(((0.78, 0.22, 0.16), (0.9, 0.16, 0.12), (0.62, 0.12, 0.08))):
        if side == 'left':
            cx = 1 - cx
        # chevron pointing right: |x - cx - 0.35*|y-0.5|| < wdt/2
        d = np.abs((xx / w - cx) - 0.55 * np.abs(yy / h - 0.5) * (h / w) * 1.8)
        m = np.clip((wdt / 2 - d) / 0.004, 0, 1)
        img = img + (_hex(light) - img) * m[..., None] * a
    n = _noise(h, w, 120, seed)
    img *= (0.96 + 0.08 * n)[..., None]
    return _save(img, out)


def photo_tint(src, out, color='0A5C36', w=1920, h=1080, focus=(0.5, 0.5), strength=0.75, direction='right',
               light='00A758'):
    im = Image.open(src).convert('RGB')
    r = w / h
    iw, ih = im.size
    if iw / ih > r:
        nw = int(ih * r)
        x0 = int(min(max(focus[0] * iw - nw / 2, 0), iw - nw))
        im = im.crop((x0, 0, x0 + nw, ih))
    else:
        nh = int(iw / r)
        y0 = int(min(max(focus[1] * ih - nh / 2, 0), ih - nh))
        im = im.crop((0, y0, iw, y0 + nh))
    arr = np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32)
    xx = np.linspace(0, 1, w)[None, :, None]
    a = (xx if direction == 'right' else 1 - xx) * strength + (1 - strength) * 0.35
    g = arr.mean(2, keepdims=True)
    duo = _hex(color) * (1 - g / 255) + _hex(light) * (g / 255)
    arr = arr * (1 - a) + duo * a
    return _save(arr, out)


# ------------------------------------------------------------------ emblem
def ring_emblem(out, letter='C', size=900, c1='0B3BD1', c2='7FD4FF', glow='3FA9FF', font_path=None, ss=2, logo=None,
                logo_scale=0.44):
    """Glowing ring; the centre holds the brand initial (letter + font_path) or the brand's own logo (PNG path)."""
    S = size * ss
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    cx = cy = S / 2
    rgb = np.zeros((S, S, 3), np.float32)
    a = np.zeros((S, S), np.float32)
    # outer glow
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (S / 2)
    gl = np.exp(-((r - 0.62) / 0.22) ** 2) * 0.55
    rgb += _hex(glow) * gl[..., None]
    a = np.maximum(a, gl * 255)
    # torus ring (shaded by angle around the tube)
    R, tube = S * 0.3, S * 0.075
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    v = (d - R) / tube
    ring = np.abs(v) < 1
    nz = np.sqrt(np.clip(1 - v ** 2, 0, 1))
    ang = np.arctan2(yy - cy, xx - cx)
    lit = 0.35 + 0.65 * np.clip(nz * 0.7 - v * 0.5 * np.cos(ang + 2.4) + 0.2, 0, 1.2)
    col = _hex(c1) * (1 - lit[..., None] * 0.6) + _hex(c2) * lit[..., None] * 0.6
    spec = np.exp(-((v + 0.35) / 0.18) ** 2) * np.clip(np.cos(ang + 2.4), 0, 1) ** 3
    col = col + spec[..., None] * 255 * 0.8
    gap = (np.abs(((ang + math.pi) % (2 * math.pi)) - 0.35) < 0.33)       # opening of the "C"
    ring &= ~gap
    rgb = np.where(ring[..., None], col, rgb)
    a = np.where(ring, 255, a)
    # orbit ellipse
    orb = Image.new('L', (S, S), 0)
    od = ImageDraw.Draw(orb)
    od.ellipse((cx - S * 0.46, cy - S * 0.16, cx + S * 0.46, cy + S * 0.16), outline=255, width=int(S * 0.012))
    orb = orb.rotate(-28, resample=Image.BICUBIC, center=(cx, cy))
    om = np.asarray(orb.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    rgb = rgb * (1 - om[..., None]) + _hex('E9F6FF') * om[..., None]
    a = np.maximum(a, om * 255)
    # letter
    if font_path and letter:
        lt = Image.new('L', (S, S), 0)
        ld = ImageDraw.Draw(lt)
        f = ImageFont.truetype(font_path, int(S * 0.28))
        bb = ld.textbbox((0, 0), letter, font=f)
        ld.text((cx - (bb[2] + bb[0]) / 2, cy - (bb[3] + bb[1]) / 2), letter, font=f, fill=255)
        lm = np.asarray(lt).astype(np.float32) / 255
        rgb = rgb * (1 - lm[..., None]) + _hex('FFFFFF') * lm[..., None]
        a = np.maximum(a, lm * 255)
    big = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(a, 0, 255)]).astype(np.uint8), 'RGBA')
    big = big.resize((size, size), Image.LANCZOS)
    if logo:
        lg = Image.open(logo).convert('RGBA')
        lg = lg.crop(lg.getbbox())
        k = size * logo_scale / max(lg.size)
        lg = lg.resize((int(lg.width * k), int(lg.height * k)), Image.LANCZOS)
        sh = Image.new('RGBA', lg.size, (0, 0, 0, 0))
        sh.putalpha(lg.split()[3].filter(ImageFilter.GaussianBlur(size * 0.012)).point(lambda v: int(v * 0.45)))
        x, y = (size - lg.width) // 2, (size - lg.height) // 2
        big.alpha_composite(sh, (x, y + int(size * 0.012)))
        big.alpha_composite(lg, (x, y))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    big.save(out, optimize=True)
    return out
