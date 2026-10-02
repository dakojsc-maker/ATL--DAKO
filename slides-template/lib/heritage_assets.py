"""
Procedural artwork for the "Heritage" (Hội An style) template.

Every function writes a PNG/JPG and returns its path. Nothing here needs the network.
    parchment()      old-paper background with grain, stains, vignette and faint map graticule
    brush_banner()   gold brush-stroke ribbon (text is added on top in PowerPoint, so it stays editable)
    emblem()         round badge with a stylised covered-bridge pagoda
    polaroid()       photo print with deckled / torn white edges, optional sepia, rotated, soft shadow baked in
    blurred()        blurred + tinted copy of a photo for backgrounds and frosted-glass cards
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


def _smooth_noise(h, w, cell, rng):
    small = rng.random((max(2, h // cell + 2), max(2, w // cell + 2))).astype(np.float32)
    im = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(im).astype(np.float32) / 255.0


def _fbm(h, w, rng, cells=(4, 12, 40, 140), weights=(0.15, 0.25, 0.3, 0.3)):
    n = np.zeros((h, w), np.float32)
    for c, wt in zip(cells, weights):
        n += wt * _smooth_noise(h, w, c, rng)
    return n / sum(weights)


# ------------------------------------------------------------------ parchment
def parchment(out, w=1920, h=1080, base=(243, 234, 212), edge=(196, 160, 104), seed=7, graticule=True,
              stains=6):
    rng = np.random.default_rng(seed)
    n = _fbm(h, w, rng)
    grain = rng.normal(0, 1, (h, w)).astype(np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    vig = np.clip((r - 0.45) / 0.95, 0, 1) ** 1.7
    base_a = np.array(base, np.float32)
    edge_a = np.array(edge, np.float32)
    img = base_a[None, None, :] * (1 - vig[..., None] * 0.55) + edge_a[None, None, :] * (vig[..., None] * 0.55)
    img *= (1 + (n[..., None] - 0.5) * 0.10)
    img += grain[..., None] * 2.2
    # soft coffee stains
    for _ in range(stains):
        cx, cy = rng.uniform(0, w), rng.uniform(0, h)
        rad = rng.uniform(80, 260)
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / rad
        ring = np.exp(-((d - 1) ** 2) / 0.02) * 0.05 + np.exp(-(d ** 2) / 0.6) * 0.03
        img *= (1 - ring[..., None] * np.array([0.6, 0.9, 1.4]))
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB')
    if graticule:
        ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        dr = ImageDraw.Draw(ov)
        col = (150, 112, 60, 34)
        # curved meridians/parallels of an old map projection
        for k in range(-6, 7):
            pts = []
            for t in np.linspace(-1.2, 1.2, 80):
                x = w / 2 + k * w / 11 + math.sin(t) * k * 14
                y = h / 2 + t * h / 2
                pts.append((x, y))
            dr.line(pts, fill=col, width=2)
        for k in range(-4, 5):
            pts = []
            for t in np.linspace(-1.2, 1.2, 80):
                x = w / 2 + t * w / 2
                y = h / 2 + k * h / 8 - (1 - math.cos(t)) * k * 16
                pts.append((x, y))
            dr.line(pts, fill=col, width=2)
        # compass rose, bottom right
        cx, cy, R = w * 0.86, h * 0.76, h * 0.17
        for rr in (R, R * 0.93, R * 0.35):
            dr.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(150, 112, 60, 40), width=2)
        for i in range(16):
            a = i * math.pi / 8
            L = R * (1.18 if i % 4 == 0 else 0.8 if i % 2 == 0 else 0.55)
            wdt = R * (0.09 if i % 4 == 0 else 0.06)
            tip = (cx + L * math.cos(a), cy + L * math.sin(a))
            l = (cx + wdt * math.cos(a + math.pi / 2), cy + wdt * math.sin(a + math.pi / 2))
            rgt = (cx + wdt * math.cos(a - math.pi / 2), cy + wdt * math.sin(a - math.pi / 2))
            dr.polygon([l, tip, rgt], outline=(150, 112, 60, 48))
        ov = ov.filter(ImageFilter.GaussianBlur(0.8))
        im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
    im.save(out, quality=90)
    return out


# ------------------------------------------------------------------ brush banner
def brush_banner(out, w=2000, h=190, c1=(196, 146, 58), c2=(236, 200, 118), seed=11, alpha=235):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # ragged top/bottom edge
    top = h * 0.16 + (_smooth_noise(1, w, 9, rng)[0] - 0.5) * h * 0.16 + (rng.random(w) - 0.5) * h * 0.03
    bot = h * 0.84 + (_smooth_noise(1, w, 9, rng)[0] - 0.5) * h * 0.16 + (rng.random(w) - 0.5) * h * 0.03
    inside = (yy >= top[None, :]) & (yy <= bot[None, :])
    # dry-brush tails at both ends
    tail = np.clip(np.minimum(xx, w - xx) / (w * 0.06), 0, 1)
    streak = _smooth_noise(h, max(8, w // 40), 2, rng)
    streak = np.asarray(Image.fromarray((streak * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0
    keep = inside & (streak > (1 - tail) * 0.9 + 0.08)
    a = keep.astype(np.float32) * (0.78 + 0.22 * streak)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))) / 255.0
    t = xx / w
    g = 0.5 + 0.5 * np.sin(t * math.pi * 1.2 + 0.4)
    col = np.array(c1, np.float32)[None, None, :] * (1 - g[..., None]) + np.array(c2, np.float32)[None, None, :] * g[..., None]
    col *= (0.9 + 0.2 * streak[..., None])
    rgba = np.dstack([np.clip(col, 0, 255), a * alpha]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(out)
    return out


# ------------------------------------------------------------------ emblem
def emblem(out, font_path, size=900, bg=(12, 30, 54), fg=(214, 176, 104), label='HỘI AN'):
    S = size
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((6, 6, S - 6, S - 6), fill=bg + (255,), outline=fg + (255,), width=int(S * 0.018))
    m = S * 0.07
    d.ellipse((m, m, S - m, S - m), outline=fg + (255,), width=int(S * 0.006))

    def P(x, y):
        return (x * S, y * S)

    # roof with up-turned eaves
    roof = [P(0.20, 0.44), P(0.26, 0.42), P(0.33, 0.33), P(0.67, 0.33), P(0.74, 0.42), P(0.80, 0.44),
            P(0.70, 0.445), P(0.30, 0.445)]
    d.polygon(roof, fill=fg + (255,))
    d.rectangle((*P(0.36, 0.30), *P(0.64, 0.325)), fill=fg + (255,))
    d.polygon([P(0.47, 0.30), P(0.50, 0.26), P(0.53, 0.30)], fill=fg + (255,))
    # hall body with columns
    d.rectangle((*P(0.30, 0.455), *P(0.70, 0.47)), fill=fg + (255,))
    for x in np.linspace(0.32, 0.68, 6):
        d.rectangle((*P(x - 0.008, 0.47), *P(x + 0.008, 0.575)), fill=fg + (255,))
    # railing
    d.rectangle((*P(0.30, 0.525), *P(0.70, 0.535)), fill=fg + (255,))
    # arched bridge deck
    pts_top, pts_bot = [], []
    for t in np.linspace(0, 1, 60):
        x = 0.16 + 0.68 * t
        y = 0.60 - 0.035 * math.sin(math.pi * t)
        pts_top.append(P(x, y))
        pts_bot.append(P(x, y + 0.035))
    d.polygon(pts_top + pts_bot[::-1], fill=fg + (255,))
    # arch under the bridge
    d.arc((*P(0.40, 0.61), *P(0.60, 0.73)), 180, 360, fill=fg + (255,), width=int(S * 0.012))
    # water ripples
    for k, y in enumerate((0.70, 0.735)):
        pts = [P(0.24 + 0.52 * t, y + 0.008 * math.sin(t * math.pi * 6 + k)) for t in np.linspace(0, 1, 40)]
        d.line(pts, fill=fg + (200,), width=int(S * 0.007))
    f = ImageFont.truetype(font_path, int(S * 0.075))
    tw = d.textlength(label, font=f)
    d.text(((S - tw) / 2, S * 0.765), label, font=f, fill=fg + (255,))
    im = im.resize((S // 2, S // 2), Image.LANCZOS)
    im.save(out)
    return out


# ------------------------------------------------------------------ polaroid with torn edges
def polaroid(src, out, aspect=4 / 3, width=640, border=0.055, bottom=0.055, rot=-5.0, tone=None, seed=1,
             focus=(0.5, 0.5), shadow_alpha=110):
    rng = np.random.default_rng(seed)
    ph = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    W, H = ph.size
    if W / H > aspect:
        cw, ch = H * aspect, H
    else:
        cw, ch = W, W / aspect
    cx = min(max(focus[0] * W, cw / 2), W - cw / 2)
    cy = min(max(focus[1] * H, ch / 2), H - ch / 2)
    ph = ph.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2)))
    pw = width
    phh = int(pw / aspect)
    ph = ph.resize((pw, phh), Image.LANCZOS)
    if tone == 'bw':
        ph = ImageOps.grayscale(ph).convert('RGB')
        ph = ImageEnhance.Contrast(ph).enhance(1.15)
    elif tone == 'sepia':
        g = np.asarray(ImageOps.grayscale(ph)).astype(np.float32) / 255
        sep = np.dstack([g * 240 + 12, g * 205 + 14, g * 160 + 12])
        ph = Image.fromarray(np.clip(sep, 0, 255).astype(np.uint8))
    elif tone == 'aged':
        ph = ImageEnhance.Color(ph).enhance(0.8)
        ov = Image.new('RGB', ph.size, (236, 214, 170))
        ph = Image.blend(ph, ov, 0.12)
    b = int(pw * border)
    bb = int(pw * bottom)
    fw, fh = pw + 2 * b, phh + b + bb
    paper = np.ones((fh, fw, 3), np.float32) * np.array([248, 244, 234], np.float32)
    paper *= (0.97 + 0.03 * _fbm(fh, fw, rng)[..., None])
    frame = Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8))
    frame.paste(ph, (b, b))
    # inner shadow at the photo edge
    sh = Image.new('L', (fw, fh), 0)
    ImageDraw.Draw(sh).rectangle((b, b, b + pw, b + phh), outline=70, width=3)
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    frame = Image.composite(Image.new('RGB', (fw, fh), (120, 110, 95)), frame, sh.point(lambda v: v // 3))
    # deckled / torn outline
    yy, xx = np.mgrid[0:fh, 0:fw].astype(np.float32)
    dist = np.minimum.reduce([xx, yy, fw - 1 - xx, fh - 1 - yy])
    jag = 3 + 7 * _smooth_noise(fh, fw, 5, rng) + 5 * _smooth_noise(fh, fw, 23, rng)
    alpha = (dist > jag).astype(np.uint8) * 255
    frame = frame.convert('RGBA')
    frame.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))
    # rotate + soft shadow
    pad = int(pw * 0.08)
    canvas = Image.new('RGBA', (fw + 2 * pad, fh + 2 * pad), (0, 0, 0, 0))
    canvas.paste(frame, (pad, pad), frame)
    rotated = canvas.rotate(rot, resample=Image.BICUBIC, expand=True)
    shadow = Image.new('RGBA', rotated.size, (0, 0, 0, 0))
    a = rotated.split()[3].point(lambda v: v * shadow_alpha // 255)
    shadow.putalpha(a)
    shadow = shadow.filter(ImageFilter.GaussianBlur(pw * 0.018))
    final = Image.new('RGBA', rotated.size, (0, 0, 0, 0))
    final.alpha_composite(shadow, (int(pw * 0.012), int(pw * 0.02)))
    final.alpha_composite(rotated)
    bbox = final.getbbox()
    final = final.crop(bbox)
    final.save(out, optimize=True)
    return out


# ------------------------------------------------------------------ backgrounds
def cover_crop(im, ratio, focus=(0.5, 0.5)):
    W, H = im.size
    if W / H > ratio:
        cw, ch = H * ratio, H
    else:
        cw, ch = W, W / ratio
    cx = min(max(focus[0] * W, cw / 2), W - cw / 2)
    cy = min(max(focus[1] * H, ch / 2), H - ch / 2)
    return im.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2)))


def full_bleed(src, out, focus=(0.5, 0.5), width=1920, ratio=16 / 9, warm=0.0, sat=1.0, bright=1.0):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im = cover_crop(im, ratio, focus)
    if im.width > width:
        im = im.resize((width, int(width / ratio)), Image.LANCZOS)
    if sat != 1.0:
        im = ImageEnhance.Color(im).enhance(sat)
    if bright != 1.0:
        im = ImageEnhance.Brightness(im).enhance(bright)
    if warm:
        im = Image.blend(im, Image.new('RGB', im.size, (214, 160, 80)), warm)
    im.save(out, quality=90)
    return out


def blurred(src, out, radius=22, focus=(0.5, 0.5), ratio=16 / 9, width=1600, bright=1.0, sat=1.0):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im = cover_crop(im, ratio, focus)
    im = im.resize((width, int(width / ratio)), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(radius))
    if bright != 1.0:
        im = ImageEnhance.Brightness(im).enhance(bright)
    if sat != 1.0:
        im = ImageEnhance.Color(im).enhance(sat)
    im.save(out, quality=88)
    return out
