"""
Procedural artwork for the keynote decks (dark stage + 3D platform renders).

    stage_bg()   deep green-black stage: radial glow, faint circuit traces, vignette, film grain
    dark_map()   Vietnam (with Hoàng Sa, Trường Sa) as a glowing dark-green map with a lime rim
"""
import os

import cv2
import numpy as np
from PIL import Image, ImageFilter

import corporate_assets as CA


def _hex(c):
    c = c.lstrip('#')
    return np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def stage_bg(out, w=1920, h=1080, base='04120C', mid='0B2C1C', glow='7FC211', at=(0.72, 0.52), glow_r=0.55,
             glow_a=0.16, traces=True, seed=3):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w - at[0]) / glow_r) ** 2 + ((yy / h - at[1]) / (glow_r * 1.25)) ** 2)
    t = np.clip(1 - r, 0, 1)[..., None] ** 1.6
    img = _hex(base) * (1 - t) + _hex(mid) * t
    core = np.exp(-(r / 0.42) ** 2)[..., None] * glow_a
    img = img + (_hex(glow) - img) * core
    if traces:
        tr = CA.circuit(h, w, seed + 40, n=46, width=2, avoid=(0.0, 0.0, 0.55, 0.45))
        img = img + (_hex(glow) - img) * (tr * 0.055)[..., None]
    vg = np.sqrt(((xx / w - 0.5) / 0.75) ** 2 + ((yy / h - 0.5) / 0.75) ** 2)
    img *= np.clip(1.12 - vg * 0.45, 0.55, 1)[..., None]
    img += np.random.default_rng(seed).normal(0, 1.6, (h, w, 1))
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(out, quality=92)
    return out


def dark_map(out, font_path, w=1100):
    """Dark green Vietnam with a lime glow rim; returns dict(path, frac=f(lon, lat) -> (fx, fy))."""
    import laodong_assets as LA
    tmp = out + '.base.png'
    LA.vn_regions(tmp, {k: 1 for k in LA.REGIONS}, highlight=[], w=w, base='1C5A35', low='9BE33A',
                  font_path=None, shadow=(0, 0, 0))             # island names are set as slide text (crisp)
    im = Image.open(tmp).convert('RGBA')
    a = im.split()[3]
    rim = a.filter(ImageFilter.MaxFilter(5))
    rim = Image.fromarray(np.clip(np.asarray(rim, np.int16) - np.asarray(a, np.int16), 0, 255).astype(np.uint8))
    glow = a.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55))
    canvas = Image.new('RGBA', im.size, (0, 0, 0, 0))
    g = Image.new('RGBA', im.size, (127, 194, 17, 0))
    g.putalpha(glow)
    canvas.alpha_composite(g)
    canvas.alpha_composite(im)
    edge = Image.new('RGBA', im.size, (170, 235, 90, 0))
    edge.putalpha(rim.filter(ImageFilter.GaussianBlur(0.7)))
    canvas.alpha_composite(edge)
    canvas.save(out, optimize=True)
    os.remove(tmp)
    lon0, lon1, lat0, lat1 = 101.9, 117.6, 7.6, 23.6
    return dict(path=out, frac=lambda lon, lat: ((lon - lon0) / (lon1 - lon0), (lat1 - lat) / (lat1 - lat0)))


def soft_photo(src, out, w=1400, fade='left', strength=0.55, darken=0.0, aspect=6.6 / 7.5):
    """Photo cropped to aspect (w/h) with one edge fading to transparent (bleeds into the dark stage)."""
    im = Image.open(src).convert('RGB')
    iw, ih = im.size
    if iw / ih > aspect:
        nw = int(ih * aspect)
        im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
    else:
        nh = int(iw / aspect)
        im = im.crop((0, (ih - nh) // 2, iw, (ih - nh) // 2 + nh))
    im.thumbnail((w, w))
    if darken:
        arr = np.asarray(im).astype(np.float32)
        yy = np.linspace(1, 0, im.height)[:, None, None] ** 3        # extra shade at the top (logo area)
        k = darken + 0.45 * yy * (1 - darken)
        arr = arr * (1 - k) + _hex('04120C') * k
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    a = np.ones((im.height, im.width), np.float32)
    if fade == 'left':
        ramp = np.clip(np.linspace(0, 1, im.width) / strength, 0, 1)[None, :]
    elif fade == 'right':
        ramp = np.clip(np.linspace(1, 0, im.width) / strength, 0, 1)[None, :]
    else:
        ramp = np.clip(np.linspace(1, 0, im.height) / strength, 0, 1)[:, None]
    a = a * ramp ** 1.4
    rgba = np.dstack([np.asarray(im), (a * 255).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(out, optimize=True)
    return out


def blur_bg(src, out, w=1920, h=1080, tint='04120C', amount=0.72, radius=18):
    """Full-bleed photo, blurred and darkened toward the stage colour (section backdrops)."""
    im = Image.open(src).convert('RGB')
    r = w / h
    iw, ih = im.size
    if iw / ih > r:
        nw = int(ih * r)
        im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
    else:
        nh = int(iw / r)
        im = im.crop((0, (ih - nh) // 2, iw, (ih - nh) // 2 + nh))
    im = im.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius))
    arr = np.asarray(im).astype(np.float32)
    arr = arr * (1 - amount) + _hex(tint) * amount
    cv2.imwrite(out, cv2.cvtColor(np.clip(arr, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR))
    return out
