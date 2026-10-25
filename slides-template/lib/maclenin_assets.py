"""
Procedural artwork for the M04 "Chính luận Mác – Lênin" template (red silk, gold emblems).

Every function writes a PNG/JPG and returns its path. Nothing here needs the network.
    silk()           crimson silk background with soft folds, optional faint crowd texture (propaganda-poster feel)
    hammer_sickle()  bevelled gold hammer & sickle
    star_medal()     order-style medal: gold sunburst, faceted red enamel star, ring, hammer & sickle
    star()           small faceted star (gold or red) for badges and bullets
    ribbon()         twisted gold-and-red ribbon curl along a Bézier curve (corner decoration)
    drape()          wide red silk sash with a gold edge (corner decoration)
    defringe()       clean the light halo around a cut-out (alpha choke + colour bleed from the inside)
    quote_mark()     bevelled gold quotation mark
    duotone()        photo -> red/gold duotone (for faint background figures or stylised pictures)
"""
import math
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RED_RAMP = [(0.0, (70, 2, 8)), (0.35, (150, 8, 20)), (0.62, (205, 20, 32)), (0.82, (232, 44, 48)),
            (0.94, (248, 92, 80)), (1.0, (255, 150, 120))]
GOLD_RAMP = [(0.0, (74, 42, 8)), (0.3, (150, 98, 26)), (0.55, (210, 156, 58)), (0.75, (240, 196, 98)),
             (0.9, (252, 228, 156)), (1.0, (255, 248, 214))]
ENAMEL_RAMP = [(0.0, (90, 2, 10)), (0.4, (170, 10, 24)), (0.7, (222, 28, 40)), (0.9, (250, 86, 78)),
               (1.0, (255, 170, 150))]


def ramp(v, stops):
    v = np.clip(v, 0, 1)
    out = np.zeros(v.shape + (3,), np.float32)
    xs = [s[0] for s in stops]
    for ch in range(3):
        out[..., ch] = np.interp(v, xs, [s[1][ch] for s in stops])
    return out


def _save(arr_rgb, alpha, out, scale=1):
    rgba = np.dstack([np.clip(arr_rgb, 0, 255), np.clip(alpha, 0, 255)]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    if scale != 1:
        im = im.resize((im.width // scale, im.height // scale), Image.LANCZOS)
    bb = im.getbbox()
    if bb:
        pad = 4
        im = im.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad)))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out, optimize=True)
    return out


# ------------------------------------------------------------------ metal shading
def bevel_shade(mask, width, ramp_stops=GOLD_RAMP, light=(-0.55, -0.75, 0.75), relief=4.0, sheen=0.14,
                spec=0.6, shininess=22, base=0.35):
    """mask: float 0..1 (H, W). Returns RGB float array of a bevelled metal / enamel surface."""
    m = (mask > 0.5).astype(np.uint8)
    d = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    h = np.clip(d / max(width, 1), 0, 1)
    h = np.sin(h * math.pi / 2)
    h = cv2.GaussianBlur(h, (0, 0), max(1.0, width * 0.12))
    gy, gx = np.gradient(h * width * relief / 10.0)
    nz = np.ones_like(h)
    n = np.dstack([-gx, -gy, nz])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    diff = np.clip((n * L).sum(2), 0, 1)
    # Blinn-Phong highlight (viewer straight on)
    H = L + np.array([0, 0, 1], np.float32)
    H /= np.linalg.norm(H)
    sp = np.clip((n * H).sum(2), 0, 1) ** shininess
    hh, ww = mask.shape
    yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
    sweep = np.sin((xx / ww * 1.3 + yy / hh * 0.9) * math.pi * 1.4) * sheen      # brushed-metal sweep
    v = base * 0.4 + diff * 0.85 + sweep
    edge = np.clip(d / 1.6, 0, 1)                       # thin dark contour
    v = v * (0.45 + 0.55 * edge)
    col = ramp(v, ramp_stops)
    col += sp[..., None] * 255 * spec
    return col


def _poly(draw, pts, fill=255):
    draw.polygon([(float(x), float(y)) for x, y in pts], fill=fill)


def _mask(size, fn):
    im = Image.new('L', size, 0)
    fn(ImageDraw.Draw(im))
    return np.asarray(im).astype(np.float32) / 255.0


# ------------------------------------------------------------------ hammer & sickle geometry
def _hs_shapes(S):
    """Polygons for a hammer & sickle in an S x S box. -> (sickle polys, hammer polys)."""
    k = S / 1000.0
    cx, cy, R = 505 * k, 455 * k, 335 * k
    t0, t1 = math.radians(116), math.radians(362)
    outer, inner = [], []
    N = 160
    for i in range(N + 1):
        u = i / N
        th = t0 + (t1 - t0) * u
        grow = 0.6 + 0.4 * math.sin(min(u / 0.22, 1) * math.pi / 2)     # slimmer at the handle, widest early on
        thick = (92 * grow * (1 - max(0.0, u - 0.22) / 0.78) ** 0.8 + 2) * k
        outer.append((cx + R * math.cos(th), cy + R * math.sin(th)))
        rin = R - thick
        inner.append((cx + rin * math.cos(th), cy + rin * math.sin(th)))
    blade = outer + inner[::-1]
    # handle: continues from the blade start towards the bottom-left
    # ferrule block covers the blade end, the handle leaves it towards the bottom-left
    te = 92 * 0.6 * k                                     # blade thickness at the handle end
    bx, by = cx + (R - te / 2) * math.cos(t0), cy + (R - te / 2) * math.sin(t0)
    ang = math.radians(128)
    L, Wd = 190 * k, 30 * k
    sx, sy = bx, by

    def bar(x, y, a, length, half):
        dx, dy = math.cos(a), math.sin(a)
        nx, ny = -dy, dx
        return [(x + nx * half, y + ny * half), (x + dx * length + nx * half, y + dy * length + ny * half),
                (x + dx * length - nx * half, y + dy * length - ny * half), (x - nx * half, y - ny * half)]

    handle = bar(sx, sy, ang, L, Wd)
    collar = bar(bx - math.cos(ang) * te * 0.55, by - math.sin(ang) * te * 0.55, ang, te * 1.25, te * 0.62)
    # hammer: handle from bottom-right up to the head at upper-left
    hx0, hy0 = 800 * k, 810 * k
    hx1, hy1 = 385 * k, 395 * k
    a = math.atan2(hy1 - hy0, hx1 - hx0)
    hl = math.hypot(hx1 - hx0, hy1 - hy0)
    hhandle = bar(hx0, hy0, a, hl, 27 * k)
    # head perpendicular to the handle
    pa = a + math.pi / 2
    head_len, head_half = 255 * k, 50 * k
    hcx, hcy = hx1 + math.cos(a) * 30 * k, hy1 + math.sin(a) * 30 * k
    head = bar(hcx - math.cos(pa) * head_len * 0.42, hcy - math.sin(pa) * head_len * 0.42, pa, head_len, head_half)
    return [blade, handle, collar], [hhandle, head]


def hammer_sickle(out, size=900, ramp_stops=GOLD_RAMP, ss=2, shadow=True):
    S = size * ss
    sick, ham = _hs_shapes(S)
    m_s = _mask((S, S), lambda d: [_poly(d, p) for p in sick])
    m_h = _mask((S, S), lambda d: [_poly(d, p) for p in ham])
    bw = S * 0.022
    col_s = bevel_shade(m_s, bw, ramp_stops)
    col_h = bevel_shade(m_h, bw, ramp_stops)
    # dark gap where hammer crosses the sickle
    gap = cv2.dilate((m_h > 0.5).astype(np.uint8), np.ones((int(S * 0.012) | 1,) * 2, np.uint8)).astype(np.float32)
    col = col_s * (1 - gap[..., None] * 0.65)
    col = np.where(m_h[..., None] > 0.5, col_h, col)
    a = np.maximum(m_s, m_h) * 255
    if shadow:
        sh = cv2.GaussianBlur(np.maximum(m_s, m_h), (0, 0), S * 0.012)
        sh = np.roll(np.roll(sh, int(S * 0.012), 0), int(S * 0.006), 1)
        a2 = np.maximum(a, sh * 150)
        col = np.where(a[..., None] > 0, col, np.array([40, 0, 4], np.float32))
        a = a2
    return _save(col, a, out, ss)


# ------------------------------------------------------------------ stars
def _star_pts(cx, cy, R, r, rot=-90):
    pts = []
    for i in range(10):
        rad = R if i % 2 == 0 else r
        a = math.radians(rot + i * 36)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return pts


def _faceted_star(S, cx, cy, R, r, stops, light=(-0.5, -0.8, 0.7), height=0.35):
    """Classic two-tone faceted star (each arm = two triangles shaded by their 3D normal)."""
    col = np.zeros((S, S, 3), np.float32)
    msk = np.zeros((S, S), np.float32)
    pts = _star_pts(cx, cy, R, r)
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    C3 = np.array([cx, cy, -R * height])
    for i in range(10):
        a, b = pts[i], pts[(i + 1) % 10]
        A3, B3 = np.array([a[0], a[1], 0.0]), np.array([b[0], b[1], 0.0])
        n = np.cross(A3 - C3, B3 - C3)
        n = n / np.linalg.norm(n)
        if n[2] > 0:
            n = -n
        n = np.array([n[0], n[1], -n[2]])
        v = float(np.clip(0.18 + 0.85 * max(0.0, float(n @ L)), 0, 1))
        tri = _mask((S, S), lambda d: _poly(d, [(cx, cy), a, b]))
        c = ramp(np.array([v]), stops)[0]
        col = np.where(tri[..., None] > 0.5, c, col)
        msk = np.maximum(msk, tri)
    return col, msk


def star(out, size=256, kind='gold', ss=3, rim=True):
    S = size * ss
    stops = GOLD_RAMP if kind == 'gold' else ENAMEL_RAMP
    R = S * 0.48
    col, msk = _faceted_star(S, S / 2, S / 2 + S * 0.02, R, R * 0.4, stops)
    if rim and kind != 'gold':
        outer = _mask((S, S), lambda d: _poly(d, _star_pts(S / 2, S / 2 + S * 0.02, R * 1.12, R * 1.12 * 0.4)))
        gold = bevel_shade(outer, S * 0.02, GOLD_RAMP)
        col = np.where(msk[..., None] > 0.5, col, gold)
        msk = outer
    return _save(col, msk * 255, out, ss)


def star_medal(out, size=1100, ss=2):
    """Order-style medal (sunburst + red faceted star + ring + hammer & sickle)."""
    S = size * ss
    c = S / 2
    R = S * 0.47
    # sunburst rays bounded by a star outline
    star_poly = _star_pts(c, c, R, R * 0.56)
    star_m = _mask((S, S), lambda d: _poly(d, star_poly))
    rays = Image.new('L', (S, S), 0)
    dr = ImageDraw.Draw(rays)
    n_rays = 120
    for i in range(n_rays):
        a0 = math.radians(i * 360 / n_rays)
        a1 = math.radians((i + 0.62) * 360 / n_rays)
        dr.polygon([(c, c), (c + 2 * R * math.cos(a0), c + 2 * R * math.sin(a0)),
                    (c + 2 * R * math.cos(a1), c + 2 * R * math.sin(a1))], fill=255)
    rays_m = np.asarray(rays).astype(np.float32) / 255 * star_m
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    rr = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / R
    ray_col = ramp(0.95 - rr * 0.55 + 0.1 * np.sin(np.arctan2(yy - c, xx - c) * 3), GOLD_RAMP)
    col = ray_col
    alpha = rays_m.copy()
    # gold rim star + red faceted enamel star
    R2 = R * 0.78
    rim_m = _mask((S, S), lambda d: _poly(d, _star_pts(c, c, R2, R2 * 0.42)))
    rim_col = bevel_shade(rim_m, S * 0.012, GOLD_RAMP)
    col = np.where(rim_m[..., None] > 0.5, rim_col, col)
    alpha = np.maximum(alpha, rim_m)
    R3 = R2 * 0.88
    en_col, en_m = _faceted_star(S, c, c, R3, R3 * 0.42, ENAMEL_RAMP, height=0.3)
    col = np.where(en_m[..., None] > 0.5, en_col, col)
    # centre ring + red disc + hammer & sickle
    ring_r = R * 0.3
    ring = (rr * R <= ring_r).astype(np.float32)
    ring_col = bevel_shade(ring, S * 0.015, GOLD_RAMP)
    col = np.where(ring[..., None] > 0.5, ring_col, col)
    disc = (rr * R <= ring_r * 0.82).astype(np.float32)
    disc_v = 0.75 - (yy - (c - ring_r)) / (2 * ring_r) * 0.4
    col = np.where(disc[..., None] > 0.5, ramp(disc_v, ENAMEL_RAMP), col)
    hs_size = int(ring_r * 1.25)
    sick, ham = _hs_shapes(hs_size)
    off = (c - hs_size / 2, c - hs_size / 2)
    shift = lambda polys: [[(x + off[0], y + off[1]) for x, y in p] for p in polys]  # noqa: E731
    m_hs = _mask((S, S), lambda d: [_poly(d, p) for p in shift(sick) + shift(ham)])
    hs_col = bevel_shade(m_hs, S * 0.004, GOLD_RAMP, relief=2.5)
    col = np.where(m_hs[..., None] > 0.5, hs_col, col)
    # soft drop shadow
    a = alpha * 255
    sh = cv2.GaussianBlur(alpha, (0, 0), S * 0.01)
    sh = np.roll(sh, int(S * 0.012), 0)
    col = np.where(alpha[..., None] > 0.02, col, np.array([50, 0, 6], np.float32))
    a = np.maximum(a, sh * 120)
    return _save(col, a, out, ss)


# ------------------------------------------------------------------ silk background
def silk(out, w=1920, h=1080, seed=3, folds=0.5, crowd=None, crowd_alpha=0.16, glow=(0.6, 0.38), rays=False,
         bright=0.0, hot=()):
    """Crimson silk.
    folds   base fold strength; hot = [(x, y, radius, extra)] in slide fractions adds stronger folds locally
    crowd   [(cut-out path, (x, y, height))] drawn as faint engraved red figures (propaganda-poster feel)"""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = math.radians(rng.uniform(16, 30))
    u = xx * math.cos(a) + yy * math.sin(a)
    v = -xx * math.sin(a) + yy * math.cos(a)
    warp = 90 * np.sin(u / 420 + rng.uniform(0, 6)) + 35 * np.sin(u / 170 + rng.uniform(0, 6))
    hf = np.zeros((h, w), np.float32)
    for L_, A_ in ((520, 1.0), (260, 0.45), (140, 0.18)):
        env = 0.6 + 0.4 * np.sin(u / (L_ * 2.3) + rng.uniform(0, 6))      # folds come and go along their length
        hf += A_ * env * np.sin((v + warp * (L_ / 300)) / L_ * 2 * math.pi + rng.uniform(0, 6))
    fm = np.full((h, w), folds, np.float32)
    for hx, hy, hr, extra in hot:
        rr = np.sqrt((xx / w - hx) ** 2 + ((yy / h - hy) * h / w) ** 2) / hr
        fm += extra * np.clip(1 - rr, 0, 1) ** 1.5
    hf *= fm / max(folds, 1e-3)
    gy, gx = np.gradient(hf * 14)
    n = np.dstack([-gx, -gy, np.ones_like(hf)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    Lv = np.array([-0.4, -0.7, 0.8], np.float32)
    Lv /= np.linalg.norm(Lv)
    diff = (n * Lv).sum(2) - 0.77
    # large-scale lighting: bright centre glow, darker edges
    gx0, gy0 = glow
    r = np.sqrt(((xx / w - gx0) / 0.8) ** 2 + ((yy / h - gy0) / 0.95) ** 2)
    light = np.clip(1.0 - r * 0.6, 0.2, 1.0)
    val = 0.6 + diff * 1.6 * folds + (light - 0.72) * 0.5 + bright
    col = ramp(val, RED_RAMP)
    img = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), 'RGB')
    if rays:   # faint sunburst from the top-right
        ov = Image.new('L', (w, h), 0)
        dr = ImageDraw.Draw(ov)
        ox, oy = w * 0.92, -h * 0.15
        for i in range(36):
            a0 = math.radians(90 + i * 5)
            a1 = math.radians(90 + i * 5 + 2.2)
            dr.polygon([(ox, oy), (ox + 3000 * math.cos(a0), oy + 3000 * math.sin(a0)),
                        (ox + 3000 * math.cos(a1), oy + 3000 * math.sin(a1))], fill=255)
        ov = ov.filter(ImageFilter.GaussianBlur(6))
        m = np.asarray(ov).astype(np.float32) / 255 * 0.05
        arr = np.asarray(img).astype(np.float32)
        arr = arr * (1 - m[..., None]) + np.array([255, 120, 90], np.float32) * m[..., None]
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    if crowd:
        arr = np.asarray(img).astype(np.float32)
        for path, (fx, fy, fh) in crowd:
            fig = Image.open(path).convert('RGBA')
            th = int(h * fh)
            fig = fig.resize((max(1, int(fig.width * th / fig.height)), th), Image.LANCZOS)
            lum = np.asarray(fig.convert('L')).astype(np.float32) / 255
            al = np.asarray(fig.split()[3]).astype(np.float32) / 255
            x0, y0 = int(fx * w), int(fy * h)
            sx0, sy0 = max(0, -x0), max(0, -y0)
            x0, y0 = max(0, x0), max(0, y0)
            x1, y1 = min(w, x0 + fig.width - sx0), min(h, y0 + fig.height - sy0)
            if x1 <= x0 or y1 <= y0:
                continue
            lum = lum[sy0:sy0 + y1 - y0, sx0:sx0 + x1 - x0]
            al = al[sy0:sy0 + y1 - y0, sx0:sx0 + x1 - x0]
            al = al * crowd_alpha * np.clip((np.arange(y1 - y0)[:, None] + y0) / h * 1.6 - 0.2, 0.2, 1)  # fade upward
            tone = 0.42 + lum * 0.62                                           # engraving look
            region = arr[y0:y1, x0:x1]
            arr[y0:y1, x0:x1] = region * (1 - al[..., None]) + region * tone[..., None] * al[..., None]
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    noise = rng.normal(0, 1.6, (h, w, 1)).astype(np.float32)
    arr = np.asarray(img).astype(np.float32) + noise
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    img.save(out, quality=90)
    return out


# ------------------------------------------------------------------ ribbons and drapes
def _curve(pts, n):
    """Catmull-Rom curve through all points."""
    p = np.array(pts, np.float64)
    P = np.vstack([p[0], p, p[-1]])
    seg = len(p) - 1
    out = []
    for i in range(n):
        g = i / (n - 1) * seg
        k = min(int(g), seg - 1)
        u = g - k
        p0, p1, p2, p3 = P[k], P[k + 1], P[k + 2], P[k + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u ** 2
                          + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3))
    return np.array(out)


def _band(canvas_size, path_pts, width, stripes, twist=(0.0, 3.0), n=900, light=0.3, taper=(1.0, 1.0),
          profile=None, folds=0.0):
    """Render a twisted band along a curve. stripes: [(fraction, rgb)]; profile(s in -1..1) -> brightness factor.
    Returns an RGBA PIL image."""
    W, H = canvas_size
    C = _curve(path_pts, n)
    T = np.gradient(C, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-9
    N = np.stack([-T[:, 1], T[:, 0]], 1)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    fr = np.cumsum([0] + [st[0] for st in stripes])
    fr = fr / fr[-1] * 2 - 1
    for i in range(n - 1):
        u0, u1 = i / (n - 1), (i + 1) / (n - 1)
        th0 = twist[0] + (twist[1] - twist[0]) * u0
        th1 = twist[0] + (twist[1] - twist[0]) * u1
        tp0 = taper[0] + (taper[1] - taper[0]) * u0
        tp1 = taper[0] + (taper[1] - taper[0]) * u1
        w0, w1 = width / 2 * math.cos(th0) * tp0, width / 2 * math.cos(th1) * tp1
        facing = math.cos(th0)
        shade = 0.72 + 0.38 * math.sin(th0 + light * math.pi) * (1 if facing >= 0 else -0.6)
        shade *= 1 + folds * math.sin(u0 * 40)
        shade = max(0.3, min(1.25, shade))
        for k, (_, rgb_) in enumerate(stripes):
            a0, a1 = fr[k], fr[k + 1]
            pf = profile((a0 + a1) / 2) if profile else 1.0
            q = [tuple(C[i] + N[i] * w0 * a0), tuple(C[i] + N[i] * w0 * a1),
                 tuple(C[i + 1] + N[i + 1] * w1 * a1), tuple(C[i + 1] + N[i + 1] * w1 * a0)]
            c = tuple(int(max(0, min(255, ch * shade * pf))) for ch in rgb_)
            dr.polygon(q, fill=c + (255,))
    return im


def _with_shadow(im, dx=-8, dy=14, blur=10, alpha=0.45):
    w, h = im.size
    sh = im.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda p: int(p * alpha))
    base = Image.new('RGBA', (w, h), (40, 0, 4, 0))
    base.putalpha(sh)
    base = base.transform((w, h), Image.AFFINE, (1, 0, dx, 0, 1, -dy))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.alpha_composite(base)
    out.alpha_composite(im)
    return out


def ribbon(out, w=1400, h=900, pts=None, width=110, twist=(0.3, 7.0), ss=2):
    """Twisting ceremonial ribbon curl: gold piping, red body with a thin gold centre stripe."""
    pts = pts or [(-80, 720), (300, 540), (640, 760), (920, 400), (1180, 300), (1480, -60)]
    gold, gold2, red = (234, 182, 78), (255, 230, 150), (200, 20, 32)
    stripes = [(0.06, gold2), (0.1, gold), (0.3, red), (0.08, gold2), (0.3, red), (0.1, gold), (0.06, gold2)]
    im = _band((w * ss, h * ss), [(x * ss, y * ss) for x, y in pts], width * ss, stripes, twist)
    im = im.resize((w, h), Image.LANCZOS)
    _with_shadow(im).save(out, optimize=True)
    return out


def drape(out, w=1800, h=1000, pts=None, width=380, ss=2, twist=(0.15, 1.1), flip=False):
    """Wide red silk sash with gold piping — sweeps in from a corner (bottom-left to right)."""
    pts = pts or [(-120, 1040), (420, 860), (980, 960), (1460, 700), (1960, 560)]
    gold, red = (240, 194, 96), (212, 22, 34)
    stripes = [(0.02, gold), (0.02, (110, 6, 14))] + [(0.96 / 14, red)] * 14 + [(0.02, (110, 6, 14)), (0.02, gold)]
    prof = lambda t: 0.78 + 0.34 * math.cos(t * 1.5) - 0.1 * t  # noqa: E731  (rounded silk cross-section)
    im = _band((w * ss, h * ss), [(x * ss, y * ss) for x, y in pts], width * ss, stripes, twist, light=0.15,
               profile=prof)
    im = im.resize((w, h), Image.LANCZOS)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    _with_shadow(im, dx=0, dy=-16, blur=18, alpha=0.5).save(out, optimize=True)
    return out


# ------------------------------------------------------------------ quote mark
def quote_mark(out, font_path, ch='”', size=600, ss=2):
    S = size * ss
    im = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(font_path, int(S * 1.25))
    bb = d.textbbox((0, 0), ch, font=f)
    d.text(((S - (bb[2] - bb[0])) / 2 - bb[0], (S - (bb[3] - bb[1])) / 2 - bb[1]), ch, font=f, fill=255)
    m = np.asarray(im).astype(np.float32) / 255
    col = bevel_shade(m, S * 0.02, GOLD_RAMP)
    return _save(col, m * 255, out, ss)


# ------------------------------------------------------------------ photos
def duotone(src, out, dark=(90, 4, 14), light=(255, 214, 150), contrast=1.15, max_side=1600):
    im = Image.open(src).convert('RGBA') if src.lower().endswith('.png') else Image.open(src).convert('RGB')
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    alpha = im.split()[3] if im.mode == 'RGBA' else None
    g = np.asarray(im.convert('L')).astype(np.float32) / 255
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1)
    col = np.array(dark, np.float32) * (1 - g[..., None]) + np.array(light, np.float32) * g[..., None]
    res = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), 'RGB')
    if alpha is not None:
        res.putalpha(alpha)
    res.save(out, quality=88) if out.lower().endswith('.jpg') else res.save(out, optimize=True)
    return out


def defringe(src, out, choke=1, feather=0.8):
    """Remove the light background halo of a cut-out: shrink the alpha a little and pull edge colours from inside."""
    im = Image.open(src).convert('RGBA')
    arr = np.asarray(im).astype(np.float32)
    a = arr[..., 3] / 255
    if choke:
        a = cv2.erode(a, np.ones((2 * choke + 1, 2 * choke + 1), np.uint8))
    if feather:
        a = cv2.GaussianBlur(a, (0, 0), feather)
    core = (a > 0.95).astype(np.float32)
    rgb = arr[..., :3]
    num = cv2.GaussianBlur(rgb * core[..., None], (0, 0), 3)
    den = cv2.GaussianBlur(core, (0, 0), 3)[..., None]
    bled = np.where(den > 1e-3, num / np.maximum(den, 1e-3), rgb)
    w = np.clip((0.95 - a) / 0.6, 0, 1)[..., None]           # edge pixels take the colour from inside
    rgb = rgb * (1 - w) + bled * w
    res = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(res, 'RGBA').save(out, optimize=True)
    return out
