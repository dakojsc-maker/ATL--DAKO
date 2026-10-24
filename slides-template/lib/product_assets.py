"""
Procedural product artwork for the product-showcase templates (M06 "Thiên nhiên", M07 "Nông sản").

The packaging mock-ups stand in for real product photos until the client's own cut-out photos are dropped in
(any PNG with transparency works in the same slots). Every function writes a PNG/JPG and returns its path.
    sack()          pillow-shaped fertiliser bag with crimped seals and a printed label (cylindrical shading)
    jug()           HDPE bottle with handle and cap for liquid products
    pouch()         stand-up zip pouch (kraft or coloured) with a window showing a photo of the product inside
    leaf()          single leaf (gradient, midrib, veins) for flying decorations
    pellets()       cluster of organic-fertiliser granules
    slice_piece()   dried-fruit slice (mango / jackfruit / banana colours) for flying decorations
    grain()         rice / cereal grain
    mist()          soft white cloud band (transparent) for transitions and the bottom of hero slides
    paper()         warm cream paper with fibres and faint creases
    grass_strip()   photo strip of grass with an irregular feathered top edge (transparent)
    sepia()         photo -> faded sepia print (history cards)
"""
import math
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


def _hex(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def _font(path, size):
    return ImageFont.truetype(path, int(size))


def _text_center(d, cx, y, txt, font, fill, spacing=0):
    if spacing:
        widths = [d.textlength(ch, font=font) for ch in txt]
        total = sum(widths) + spacing * (len(txt) - 1)
        x = cx - total / 2
        for ch, w in zip(txt, widths):
            d.text((x, y), ch, font=font, fill=fill)
            x += w + spacing
        return
    w = d.textlength(txt, font=font)
    d.text((cx - w / 2, y), txt, font=font, fill=fill)


def _fit(d, txt, path, size, max_w):
    while size > 8 and d.textlength(txt, font=_font(path, size)) > max_w:
        size -= 2
    return _font(path, size)


def _noise(h, w, cell, seed):
    rng = np.random.default_rng(seed)
    small = rng.random((max(2, h // cell + 2), max(2, w // cell + 2))).astype(np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)


def _cyl_shade(w, h, hi=0.36, edge=0.55, gloss=0.25, seed=1, wrinkle=0.06):
    """Cylinder lighting across x (+ soft wrinkles). Returns (shade multiplier, specular add) float maps."""
    xx = np.linspace(-1, 1, w)[None, :].repeat(h, 0)
    nz = np.sqrt(np.clip(1 - xx ** 2, 0, 1))
    light = np.array([-0.45, 0.0, 0.9])
    light = light / np.linalg.norm(light)
    diff = np.clip(xx * light[0] + nz * light[2], 0, 1)
    shade = edge + (1 - edge) * diff
    shade *= 1 + wrinkle * (_noise(h, w, 60, seed) - 0.5) * 2 + wrinkle * 0.6 * (_noise(h, w, 18, seed + 1) - 0.5)
    spec = np.exp(-((xx + 0.42) / 0.12) ** 2) * gloss
    spec *= 0.7 + 0.6 * _noise(h, w, 90, seed + 2)
    return shade.astype(np.float32), spec.astype(np.float32)


def _cyl_warp(img, strength=0.32):
    """Wrap a flat label around a cylinder (horizontal compression towards the edges)."""
    h, w = img.shape[:2]
    xs = np.linspace(-1, 1, w)
    # output x -> source x : asin mapping
    src = np.arcsin(np.clip(xs, -1, 1)) / (math.pi / 2)
    src = xs * (1 - strength) + src * strength
    mapx = np.tile(((src + 1) / 2 * (w - 1)).astype(np.float32), (h, 1))
    mapy = np.tile(np.arange(h, dtype=np.float32)[:, None], (1, w))
    return cv2.remap(img, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def _finish(rgb, alpha, out, ss, shadow=True, shadow_alpha=0.35):
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 255)]).astype(np.uint8), 'RGBA')
    if ss != 1:
        im = im.resize((im.width // ss, im.height // ss), Image.LANCZOS)
    if shadow:   # soft contact shadow under the product
        w, h = im.size
        pad = int(h * 0.06)
        canvas = Image.new('RGBA', (w, h + pad), (0, 0, 0, 0))
        sh = Image.new('L', (w, h + pad), 0)
        ImageDraw.Draw(sh).ellipse((w * 0.14, h - pad * 0.2, w * 0.86, h + pad * 0.8), fill=int(255 * shadow_alpha))
        sh = sh.filter(ImageFilter.GaussianBlur(pad * 0.45))
        canvas.paste(Image.new('RGBA', (w, h + pad), (40, 30, 20, 255)), (0, 0), sh)
        canvas.alpha_composite(im)
        im = canvas
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out, optimize=True)
    return out


def _photo_fill(path, w, h, focus=(0.5, 0.5)):
    im = Image.open(path).convert('RGB')
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
    return im.resize((w, h), Image.LANCZOS)


# ------------------------------------------------------------------ fertiliser sack
def sack(out, name, sub='', brand='', weight='25 KG', base='2F6B2E', accent='A8D26B', ink='FFFFFF', band='F2E9D8',
         title_font=None, body_font=None, photo=None, photo_focus=(0.5, 0.5), spec='', w=760, h=1100, ss=2, seed=3):
    W, H = w * ss, h * ss
    # flat label artwork --------------------------------------------------------------
    lab = Image.new('RGB', (W, H), _hex(base))
    d = ImageDraw.Draw(lab)
    top = int(H * 0.08)
    # brand band
    d.rectangle((0, top, W, top + int(H * 0.11)), fill=_hex(band))
    if brand:
        f = _fit(d, brand.upper(), title_font, H * 0.06, W * 0.7)
        _text_center(d, W / 2, top + H * 0.022, brand.upper(), f, _hex(base), spacing=int(W * 0.006))
    # picture panel (photo inside a soft arch)
    py0, py1 = int(H * 0.22), int(H * 0.56)
    if photo:
        ph = _photo_fill(photo, int(W * 0.8), py1 - py0, photo_focus)
        m = Image.new('L', ph.size, 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, ph.width - 1, ph.height - 1), radius=int(W * 0.08), fill=255)
        lab.paste(ph, (int(W * 0.1), py0), m)
        d.rounded_rectangle((int(W * 0.1), py0, int(W * 0.9), py1), radius=int(W * 0.08), outline=_hex(accent),
                            width=int(W * 0.008))
    # accent leaf ribbon
    d.polygon([(0, H * 0.585), (W, H * 0.555), (W, H * 0.6), (0, H * 0.63)], fill=_hex(accent))
    # product name (wrap to 2 lines)
    words = name.upper().split()
    lines, cur = [], ''
    fsize = H * 0.075
    tf = _font(title_font, fsize)
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=tf) <= W * 0.84 or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    lines.append(cur)
    lines = lines[:3]
    y = H * 0.645
    for ln in lines:
        f = _fit(d, ln, title_font, fsize, W * 0.84)
        _text_center(d, W / 2, y, ln, f, _hex(ink))
        y += fsize * 1.05
    if sub:
        f = _fit(d, sub, body_font, H * 0.032, W * 0.8)
        _text_center(d, W / 2, y + H * 0.01, sub, f, _hex(accent))
        y += H * 0.05
    if spec:
        f = _fit(d, spec, body_font, H * 0.026, W * 0.8)
        _text_center(d, W / 2, y + H * 0.01, spec, f, _hex(ink))
    # weight badge
    bx, by, br = W * 0.5, H * 0.875, W * 0.13
    d.ellipse((bx - br, by - br * 0.62, bx + br, by + br * 0.62), fill=_hex(band))
    f = _fit(d, weight, title_font, H * 0.05, br * 1.7)
    _text_center(d, bx, by - H * 0.032, weight, f, _hex(base))
    arr = np.asarray(lab).astype(np.float32)
    arr = _cyl_warp(arr, 0.28)
    # bag silhouette ------------------------------------------------------------------
    mask = Image.new('L', (W, H), 0)
    md = ImageDraw.Draw(mask)
    pts = []
    seal = H * 0.045
    n = 60
    bulge = W * 0.035
    for i in range(n + 1):                                   # left edge, top -> bottom
        t = i / n
        x = W * 0.02 - bulge * math.sin(math.pi * t) + W * 0.05 * (math.exp(-((t - 0.03) / 0.05) ** 2) +
                                                                   math.exp(-((t - 0.97) / 0.05) ** 2))
        pts.append((x + bulge, seal + t * (H - 2 * seal)))
    for i in range(n + 1):                                   # right edge, bottom -> top
        t = 1 - i / n
        x = W * 0.98 + bulge * math.sin(math.pi * t) - W * 0.05 * (math.exp(-((t - 0.03) / 0.05) ** 2) +
                                                                   math.exp(-((t - 0.97) / 0.05) ** 2))
        pts.append((x - bulge, seal + t * (H - 2 * seal)))
    md.polygon(pts, fill=255)
    md.rectangle((W * 0.06, 0, W * 0.94, seal + 4), fill=255)          # top seal
    md.rectangle((W * 0.06, H - seal - 4, W * 0.94, H), fill=255)      # bottom seal
    alpha = np.asarray(mask.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
    shade, spec = _cyl_shade(W, H, seed=seed, wrinkle=0.07)
    # seals: crimp stripes + darker
    yy = np.arange(H)[:, None]
    xx = np.arange(W)[None, :]
    in_seal = ((yy < seal) | (yy > H - seal)).astype(np.float32)
    crimp = 0.85 + 0.15 * np.sin(xx / (W * 0.006))
    shade = shade * (1 - in_seal * (1 - crimp * 0.88))
    # pillow edges: darker towards the outline
    dist = cv2.distanceTransform((alpha > 128).astype(np.uint8), cv2.DIST_L2, 5)
    rim = np.clip(dist / (W * 0.05), 0, 1) ** 0.5
    shade = shade * (0.72 + 0.28 * rim)
    rgb = arr * shade[..., None] + spec[..., None] * 255
    return _finish(rgb, alpha, out, ss)


# ------------------------------------------------------------------ jug / bottle
def jug(out, name, sub='', brand='', volume='1 LÍT', body='F4F6F2', label='2F6B2E', accent='A8D26B', cap='2F6B2E',
        title_font=None, body_font=None, w=620, h=1000, ss=2, seed=5):
    W, H = w * ss, h * ss
    mask = Image.new('L', (W, H), 0)
    md = ImageDraw.Draw(mask)
    neck_w, neck_h = W * 0.26, H * 0.08
    cap_h = H * 0.07
    shoulder = H * 0.22
    md.rounded_rectangle((W * 0.06, shoulder, W * 0.94, H * 0.995), radius=int(W * 0.12), fill=255)
    md.polygon([(W * 0.06, shoulder + W * 0.12), (W / 2 - neck_w / 2, cap_h + neck_h), (W / 2 + neck_w / 2, cap_h + neck_h),
                (W * 0.94, shoulder + W * 0.1)], fill=255)
    md.rectangle((W / 2 - neck_w / 2, cap_h, W / 2 + neck_w / 2, cap_h + neck_h + 4), fill=255)
    # handle loop (cut-out) on the upper right
    hole = Image.new('L', (W, H), 0)
    ImageDraw.Draw(hole).rounded_rectangle((W * 0.64, shoulder - H * 0.02, W * 0.86, shoulder + H * 0.13),
                                           radius=int(W * 0.06), fill=255)
    md.rounded_rectangle((W * 0.6, shoulder - H * 0.06, W * 0.94, shoulder + H * 0.17), radius=int(W * 0.1), fill=255)
    m = np.asarray(mask).astype(np.float32) - np.asarray(hole).astype(np.float32)
    m = np.clip(m, 0, 255)
    capm = np.zeros((H, W), np.float32)
    cv2.rectangle(capm, (int(W / 2 - neck_w * 0.62), 0), (int(W / 2 + neck_w * 0.62), int(cap_h + 2)), 255, -1)
    alpha = np.maximum(m, capm)
    base = np.zeros((H, W, 3), np.float32) + np.array(_hex(body), np.float32)
    # label
    lab = Image.new('RGB', (W, H), _hex(body))
    d = ImageDraw.Draw(lab)
    ly0, ly1 = H * 0.42, H * 0.9
    d.rectangle((0, ly0, W, ly1), fill=_hex(label))
    d.polygon([(0, ly0 + H * 0.05), (W, ly0), (W, ly0 + H * 0.025), (0, ly0 + H * 0.075)], fill=_hex(accent))
    if brand:
        f = _fit(d, brand.upper(), title_font, H * 0.04, W * 0.7)
        _text_center(d, W / 2, ly0 + H * 0.09, brand.upper(), f, _hex(accent), spacing=int(W * 0.005))
    f = _fit(d, name.upper(), title_font, H * 0.07, W * 0.78)
    _text_center(d, W / 2, ly0 + H * 0.15, name.upper(), f, (255, 255, 255))
    if sub:
        f = _fit(d, sub, body_font, H * 0.03, W * 0.76)
        _text_center(d, W / 2, ly0 + H * 0.25, sub, f, (255, 255, 255))
    f = _fit(d, volume, title_font, H * 0.045, W * 0.5)
    _text_center(d, W / 2, ly1 - H * 0.085, volume, f, _hex(accent))
    arr = _cyl_warp(np.asarray(lab).astype(np.float32), 0.35)
    arr = np.where((capm > 0)[..., None], np.array(_hex(cap), np.float32), arr)
    yy = np.arange(H)[:, None]
    capridge = ((yy < cap_h) * (0.85 + 0.15 * np.sin(np.arange(W)[None, :] / (W * 0.008)))).astype(np.float32)
    shade, spec = _cyl_shade(W, H, edge=0.62, gloss=0.45, seed=seed, wrinkle=0.0)
    shade = shade * np.where(capridge > 0, capridge, 1)
    rgb = arr * shade[..., None] + spec[..., None] * 255
    _ = base
    return _finish(rgb, alpha, out, ss)


# ------------------------------------------------------------------ stand-up pouch
def pouch(out, name, sub='', brand='', weight='200g', photo=None, photo_focus=(0.5, 0.5), color='B5172F',
          kraft=False, ink='FFFFFF', accent='F2C14E', badge='', title_font=None, body_font=None, script_font=None,
          w=760, h=1080, ss=2, seed=7):
    W, H = w * ss, h * ss
    rng = np.random.default_rng(seed)
    if kraft:
        base = np.array([196, 160, 112], np.float32)
        fib = _noise(H, W, 3, seed) * 0.5 + _noise(H, W, 9, seed + 1) * 0.5
        arr = base[None, None, :] * (0.9 + 0.2 * fib[..., None])
        lab = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        ink_c, panel = _hex('3B2416'), None
    else:
        lab = Image.new('RGB', (W, H), _hex(color))
        ink_c, panel = _hex(ink), _hex(color)
    d = ImageDraw.Draw(lab)
    # brand + name
    y = H * 0.12
    if brand:
        f = _fit(d, brand.upper(), body_font, H * 0.034, W * 0.7)
        _text_center(d, W / 2, y, brand.upper(), f, ink_c if kraft else _hex(accent), spacing=int(W * 0.006))
        y += H * 0.05
    words = name.split()
    lines, cur = [], ''
    fsize = H * 0.085
    tf = _font(title_font, fsize)
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=tf) <= W * 0.82 or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    lines.append(cur)
    for ln in lines[:2]:
        f = _fit(d, ln, title_font, fsize, W * 0.84)
        _text_center(d, W / 2, y, ln, f, ink_c if kraft else _hex(ink))
        y += fsize * 1.0
    if sub:
        f = _fit(d, sub, script_font or body_font, H * 0.05, W * 0.8)
        _text_center(d, W / 2, y + H * 0.005, sub, f, _hex(color) if kraft else _hex(accent))
        y += H * 0.06
    # window with the product photo
    wy0 = max(y + H * 0.02, H * 0.42)
    wy1 = H * 0.82
    wx0, wx1 = W * 0.18, W * 0.82
    if photo:
        ph = _photo_fill(photo, int(wx1 - wx0), int(wy1 - wy0), photo_focus)
        m = Image.new('L', ph.size, 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, ph.width - 1, ph.height - 1), radius=int(W * 0.2), fill=255)
        lab.paste(ph, (int(wx0), int(wy0)), m)
        # window gloss
        gl = Image.new('L', ph.size, 0)
        ImageDraw.Draw(gl).polygon([(ph.width * 0.1, 0), (ph.width * 0.35, 0), (ph.width * 0.05, ph.height),
                                    (-ph.width * 0.2, ph.height)], fill=70)
        gl = Image.fromarray(np.minimum(np.asarray(gl), np.asarray(m)))
        lab.paste(Image.new('RGB', ph.size, (255, 255, 255)), (int(wx0), int(wy0)), gl.filter(ImageFilter.GaussianBlur(8)))
        d.rounded_rectangle((wx0, wy0, wx1, wy1), radius=int(W * 0.2), outline=ink_c if kraft else _hex(accent),
                            width=int(W * 0.006))
    # weight + badge
    f = _fit(d, weight, title_font, H * 0.042, W * 0.4)
    _text_center(d, W / 2, H * 0.855, weight, f, ink_c if kraft else _hex(ink))
    if badge:
        bx, by, br = W * 0.8, H * 0.43, W * 0.11
        d.ellipse((bx - br, by - br, bx + br, by + br), fill=_hex(accent))
        bl = badge.split('\n')
        for k, t in enumerate(bl):
            f = _fit(d, t, body_font, H * 0.022, br * 1.6)
            _text_center(d, bx, by - br * 0.45 + k * H * 0.026, t, f, panel or _hex('3B2416'))
    arr = _cyl_warp(np.asarray(lab).astype(np.float32), 0.18)
    # silhouette: straight top with tear notches, slight taper, curved gusset bottom
    mask = Image.new('L', (W, H), 0)
    md = ImageDraw.Draw(mask)
    pts = [(W * 0.06, H * 0.0), (W * 0.94, H * 0.0)]
    n = 40
    for i in range(n + 1):
        t = i / n
        pts.append((W * (0.94 + 0.03 * t ** 2), H * (0.0 + 0.97 * t)))
    for i in range(n + 1):
        t = i / n
        pts.append((W * (0.97 - 0.94 * t), H * (0.97 + 0.03 * math.sin(math.pi * t))))
    for i in range(n + 1):
        t = 1 - i / n
        pts.append((W * (0.06 - 0.03 * t ** 2), H * (0.97 * t)))
    md.polygon(pts, fill=255)
    for sx in (W * 0.06, W * 0.94):                                  # tear notches
        md.polygon([(sx, H * 0.08), (sx + (W * 0.025 if sx < W / 2 else -W * 0.025), H * 0.09), (sx, H * 0.1)], fill=0)
    alpha = np.asarray(mask.filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32)
    shade, spec = _cyl_shade(W, H, edge=0.66, gloss=0.08 if kraft else 0.28, seed=seed, wrinkle=0.04)
    yy = np.arange(H)[:, None].astype(np.float32)
    zip_line = np.exp(-((yy - H * 0.065) / (H * 0.004)) ** 2) * 0.25
    seal = (yy < H * 0.04).astype(np.float32) * 0.1
    gusset = np.clip((yy - H * 0.9) / (H * 0.1), 0, 1) * 0.18
    shade = shade * (1 - zip_line - seal - gusset)
    rgb = arr * shade[..., None] + spec[..., None] * 255
    _ = rng
    return _finish(rgb, alpha, out, ss)


# ------------------------------------------------------------------ decorations
def leaf(out, w=420, h=240, color='4C9A2A', light='A8D26B', seed=1, curl=0.15, ss=2):
    W, H = w * ss, h * ss
    rng = np.random.default_rng(seed)
    pts_top, pts_bot = [], []
    for i in range(61):
        t = i / 60
        x = W * (0.03 + 0.94 * t)
        wdt = H * 0.46 * (math.sin(math.pi * t ** 0.85)) * (1 - 0.15 * t)
        mid = H / 2 + curl * H * math.sin(math.pi * t) * 0.6
        pts_top.append((x, mid - wdt))
        pts_bot.append((x, mid + wdt * 0.92))
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(pts_top + pts_bot[::-1], fill=255)
    a = np.asarray(m).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    mid = H / 2 + curl * H * np.sin(np.pi * xx / W) * 0.6
    side = np.clip((yy - mid) / (H * 0.45), -1, 1)
    c1, c2 = np.array(_hex(color), np.float32), np.array(_hex(light), np.float32)
    t = np.clip(0.55 - side * 0.45 + (xx / W - 0.5) * 0.3, 0, 1)[..., None]
    rgb = c1 * (1 - t) + c2 * t
    vein = np.exp(-((yy - mid) / (H * 0.012)) ** 2) * 0.35
    for k in range(7):
        x0 = W * (0.12 + k * 0.12)
        for sgn in (-1, 1):
            vy = mid + sgn * (xx - x0) * 0.55
            vmask = (xx > x0) & (xx < x0 + W * 0.2)
            vein = vein + np.where(vmask, np.exp(-((yy - vy) / (H * 0.007)) ** 2) * 0.22, 0)
    rgb = rgb * (1 - vein[..., None]) + np.array([235, 245, 210], np.float32) * vein[..., None] * 0.5
    rgb *= (0.92 + 0.12 * _noise(H, W, 20, seed))[..., None]
    _ = rng
    return _finish(rgb, a, out, ss, shadow=False)


def pellets(out, w=600, h=420, n=46, base='5A3A22', seed=2, ss=2):
    W, H = w * ss, h * ss
    rng = np.random.default_rng(seed)
    rgb = np.zeros((H, W, 3), np.float32)
    a = np.zeros((H, W), np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    b = np.array(_hex(base), np.float32)
    for _ in range(n):
        cx, cy = rng.normal(W / 2, W * 0.2), rng.normal(H / 2, H * 0.2)
        r = rng.uniform(0.035, 0.07) * W
        ang = rng.uniform(0, math.pi)
        ex, ey = r * rng.uniform(0.85, 1.25), r * rng.uniform(0.7, 1.0)
        dx, dy = xx - cx, yy - cy
        u = (dx * math.cos(ang) + dy * math.sin(ang)) / ex
        v = (-dx * math.sin(ang) + dy * math.cos(ang)) / ey
        d = u ** 2 + v ** 2
        inside = d < 1
        nz = np.sqrt(np.clip(1 - d, 0, 1))
        lit = np.clip(0.35 + 0.65 * (nz * 0.8 - u * 0.25 - v * 0.35), 0.2, 1.2)
        tone = b * rng.uniform(0.75, 1.2) * lit[..., None]
        grit = 0.9 + 0.2 * _noise(H, W, 4, int(rng.integers(1e6)))
        tone = tone * grit[..., None]
        rgb = np.where(inside[..., None], tone, rgb)
        a = np.where(inside, 255, a)
    return _finish(rgb, a, out, ss, shadow=False)


def slice_piece(out, w=420, h=300, color='F2A33A', edge='C8641E', seed=3, ss=2):
    W, H = w * ss, h * ss
    rng = np.random.default_rng(seed)
    pts = []
    ph1, ph2 = rng.uniform(0, 6), rng.uniform(0, 6)
    for i in range(120):
        t = i / 120 * 2 * math.pi
        r = 1 + 0.07 * math.sin(3 * t + ph1) + 0.035 * math.sin(5 * t + ph2)
        pts.append((W / 2 + W * 0.45 * r * math.cos(t), H / 2 + H * 0.4 * r * math.sin(t) * (1 - 0.25 * math.cos(t))))
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    a = np.asarray(m.filter(ImageFilter.GaussianBlur(2))).astype(np.float32)
    dist = cv2.distanceTransform((a > 128).astype(np.uint8), cv2.DIST_L2, 5)
    e = np.clip(dist / (min(W, H) * 0.12), 0, 1)
    c, ce = np.array(_hex(color), np.float32), np.array(_hex(edge), np.float32)
    rgb = ce * (1 - e[..., None]) + c * e[..., None]
    fib = _noise(H, W, 6, seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    streak = 0.92 + 0.12 * np.sin(xx / (W * 0.02) + fib * 6)
    rgb = rgb * streak[..., None] * (0.95 + 0.1 * _noise(H, W, 30, seed + 1))[..., None]
    spark = (rng.random((H, W)) > 0.9985).astype(np.float32)
    spark = cv2.GaussianBlur(spark, (0, 0), 1.2) * 4
    rgb = rgb + spark[..., None] * 120
    return _finish(rgb, a, out, ss, shadow=False)


def grain(out, w=160, h=70, color='E8D4A2', seed=4, ss=3):
    W, H = w * ss, h * ss
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = (xx - W / 2) / (W * 0.47), (yy - H / 2) / (H * 0.42)
    d = u ** 2 + v ** 2
    a = (d < 1).astype(np.float32) * 255
    nz = np.sqrt(np.clip(1 - d, 0, 1))
    lit = 0.55 + 0.5 * (nz - v * 0.3)
    rgb = np.array(_hex(color), np.float32) * lit[..., None]
    rgb += np.exp(-((v + 0.35) / 0.15) ** 2 - (u / 0.6) ** 2)[..., None] * 60
    return _finish(rgb, cv2.GaussianBlur(a, (0, 0), 1.0), out, ss, shadow=False)


def mist(out, w=1920, h=520, seed=4, density=1.0):
    rng = np.random.default_rng(seed)
    a = np.zeros((h, w), np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    for _ in range(int(70 * density)):
        cx, cy = rng.uniform(-100, w + 100), rng.uniform(h * 0.35, h * 1.05)
        rx, ry = rng.uniform(90, 260), rng.uniform(50, 140)
        a += np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)) * rng.uniform(0.25, 0.6)
    a = np.clip(a, 0, 1) * np.clip((yy / h - 0.08) / 0.5, 0, 1)
    a *= 0.85 + 0.3 * _noise(h, w, 40, seed)
    rgb = np.full((h, w, 3), 255, np.float32)
    im = Image.fromarray(np.dstack([rgb, np.clip(a, 0, 1) * 255]).astype(np.uint8), 'RGBA')
    im.save(out, optimize=True)
    return out


def paper(out, w=1920, h=1080, base='F6EFE3', seed=6):
    rng = np.random.default_rng(seed)
    b = np.array(_hex(base), np.float32)
    n = _noise(h, w, 140, seed) * 0.6 + _noise(h, w, 30, seed + 1) * 0.4
    img = b[None, None, :] * (0.97 + 0.05 * n[..., None])
    fib = rng.normal(0, 1, (h, w)).astype(np.float32)
    fib = cv2.GaussianBlur(fib, (0, 0), 0.8) * 2.2
    img += fib[..., None]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    for _ in range(3):   # faint creases
        x0, y0 = rng.uniform(0, w), rng.uniform(0, h)
        ang = rng.uniform(-0.6, 0.6)
        dd = ((xx - x0) * math.sin(ang) - (yy - y0) * math.cos(ang))
        img -= (np.exp(-(dd / 1.6) ** 2) * 6 - np.exp(-((dd - 3) / 2.5) ** 2) * 3)[..., None]
    r = np.sqrt(((xx - w / 2) / (w * 0.7)) ** 2 + ((yy - h / 2) / (h * 0.75)) ** 2)
    img *= (1 - np.clip(r - 0.6, 0, 1) * 0.12)[..., None]
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(out, quality=92)
    return out


def grass_strip(src, out, w=1920, h=420, focus=(0.5, 0.75), seed=8, sat=1.15):
    ph = _photo_fill(src, w, h, focus)
    arr = np.asarray(ph).astype(np.float32)
    g = arr.mean(2, keepdims=True)
    arr = np.clip(g + (arr - g) * sat, 0, 255)
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    edge = h * 0.42 + h * 0.08 * np.sin(xx / w * 9 + 1) + h * 0.05 * (_noise(1, w, 25, seed)[0] - 0.5) * 4
    a = np.clip((yy - edge) / (h * 0.12), 0, 1)
    blades = Image.new('L', (w, h), 0)
    bd = ImageDraw.Draw(blades)
    for _ in range(900):
        x = rng.uniform(0, w)
        base_y = edge[0, min(w - 1, int(x))] + h * 0.1
        L = rng.uniform(h * 0.08, h * 0.32)
        lean = rng.uniform(-0.35, 0.35) * L
        bd.polygon([(x - 3, base_y), (x + 3, base_y), (x + lean, base_y - L)], fill=255)
    a = np.maximum(a, np.asarray(blades.filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255)
    im = Image.fromarray(np.dstack([arr, a * 255]).astype(np.uint8), 'RGBA')
    im.save(out, optimize=True)
    return out


def sepia(src, out, w=1200, h=800, focus=(0.5, 0.5), fade=0.25):
    ph = _photo_fill(src, w, h, focus)
    g = np.asarray(ph.convert('L')).astype(np.float32) / 255
    g = np.clip((g - 0.5) * 1.1 + 0.5, 0, 1)
    dark, light = np.array([70, 52, 38], np.float32), np.array([246, 236, 220], np.float32)
    rgb = dark * (1 - g[..., None]) + light * g[..., None]
    rgb = rgb * (1 - fade) + light * fade
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(out, quality=88)
    return out
