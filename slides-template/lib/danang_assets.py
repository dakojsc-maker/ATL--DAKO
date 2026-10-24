"""
Procedural artwork for the M10 "Du lịch Đà Nẵng" template.

    navy_bg()   deep navy background with paper grain, a soft moonlight glow and faint gold dust
    lantern()   glowing sky lantern (đèn trời) with transparent background — floats across the slides
    tape()      translucent washi tape strip with torn ends (sticks the polaroids on)
Every function writes a PNG/JPG and returns its path.
"""
import os

import cv2
import numpy as np
from PIL import Image


def _hex(c):
    c = c.lstrip('#')
    return np.array([int(c[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def _noise(h, w, cell, rng):
    small = rng.random((max(2, h // cell + 2), max(2, w // cell + 2))).astype(np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)


def _save(arr, out, mode='RGB'):
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode)
    if out.lower().endswith('.png'):
        im.save(out, optimize=True)
    else:
        im.convert('RGB').save(out, quality=90)
    return out


def navy_bg(out, w=1920, h=1080, top='13274A', bottom='0A1528', glow=(0.72, 0.22), gold='D9B26A', seed=3,
            dust=True):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = (yy / h)[..., None]
    img = _hex(top) * (1 - t) + _hex(bottom) * t
    g = np.exp(-(((xx / w - glow[0]) / 0.42) ** 2 + ((yy / h - glow[1]) / 0.55) ** 2))[..., None]
    img = img + (_hex('3A5A8C') - img) * g * 0.35
    fib = _noise(h, w, 3, rng) * 0.5 + _noise(h, w, 11, rng) * 0.3 + _noise(h, w, 60, rng) * 0.2
    img *= (0.93 + 0.12 * fib)[..., None]
    img += rng.normal(0, 2.2, (h, w, 1))
    if dust:
        d = np.zeros((h, w), np.float32)
        for _ in range(220):
            x, y = int(rng.uniform(0, w)), int(rng.uniform(0, h))
            r = rng.uniform(0.6, 2.0)
            cv2.circle(d, (x, y), int(np.ceil(r)), float(rng.uniform(0.15, 0.6)), -1, lineType=cv2.LINE_AA)
        d = cv2.GaussianBlur(d, (0, 0), 0.8)
        img = img + (_hex(gold) - img) * np.clip(d, 0, 1)[..., None] * 0.5
    r = np.sqrt(((xx / w - 0.5) / 0.7) ** 2 + ((yy / h - 0.5) / 0.7) ** 2)
    img *= np.clip(1.08 - r * 0.35, 0.6, 1)[..., None]
    return _save(img, out)


def lantern(out, w=360, h=520, seed=1, body='F7A23B', light='FFE7A8', edge='CF5328', ss=2):
    """Sky lantern seen slightly from below: paper body lit from the flame at the bottom opening + warm halo."""
    rng = np.random.default_rng(seed)
    W, H = w * ss, h * ss
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx = W / 2
    top, bot = H * 0.24, H * 0.72
    wt, wb = W * 0.27, W * 0.19                      # half widths (top wider than the opening); margin = halo
    v = np.clip((yy - top) / (bot - top), 0, 1)
    half = wt * (1 - v) + wb * v
    dome = top - (1 - np.clip(np.abs(xx - cx) / wt, 0, 1) ** 2) * H * 0.05
    inside = (np.abs(xx - cx) <= half) & (yy >= dome) & (yy <= bot)
    m = cv2.GaussianBlur(inside.astype(np.float32), (0, 0), ss * 1.2)
    # light: brightest near the bottom centre (flame), darker towards the top and the sides
    u = (xx - cx) / np.maximum(half, 1)
    lit = np.clip(0.12 + 0.88 * v ** 1.2, 0, 1) * np.clip(1 - u ** 2 * 0.6, 0, 1)
    rgb = _hex(edge) * (1 - lit[..., None]) + _hex(body) * lit[..., None]
    rgb = rgb + (_hex(light) - rgb) * (np.clip(lit - 0.4, 0, 1) * 1.5)[..., None]
    ribs = np.zeros((H, W), np.float32)              # paper ribs
    for k in (-0.55, 0, 0.55):
        ribs += np.exp(-((u - k) / 0.03) ** 2)
    rgb *= (1 - 0.18 * ribs * inside)[..., None]
    rgb *= (0.96 + 0.06 * _noise(H, W, 4 * ss, rng))[..., None]
    alpha = m * 255
    # flame + opening rim
    fl = np.exp(-(((xx - cx) / (W * 0.06)) ** 2 + ((yy - bot + H * 0.02) / (H * 0.035)) ** 2))
    rgb = rgb + (_hex('FFFFFF') - rgb) * fl[..., None] * 0.9
    rim = (np.abs(yy - bot) < ss * 3) & (np.abs(xx - cx) < wb)
    rgb = np.where(rim[..., None], _hex('6B2A12'), rgb)
    alpha = np.maximum(alpha, rim * 255)
    # halo
    hl = np.exp(-(((xx - cx) / (W * 0.3)) ** 2 + ((yy - H * 0.58) / (H * 0.27)) ** 2)) * 0.75
    rr = np.sqrt(((xx - cx) / (W * 0.5)) ** 2 + ((yy - H * 0.55) / (H * 0.45)) ** 2)
    hl *= np.clip((1 - rr) / 0.3, 0, 1) ** 2                                   # round fade to 0 inside the canvas
    halo_rgb = _hex('FFC870')
    a_h = hl * 255
    out_a = alpha + a_h * (1 - alpha / 255)
    rgb = (rgb * alpha[..., None] + halo_rgb * a_h[..., None] * (1 - alpha / 255)[..., None]) / \
        np.maximum(out_a, 1)[..., None]
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(out_a, 0, 255)]).astype(np.uint8), 'RGBA')
    im = im.resize((w, h), Image.LANCZOS)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out, optimize=True)
    return out


def tape(out, w=420, h=120, color='EFE3C8', alpha=0.78, seed=2):
    rng = np.random.default_rng(seed)
    a = np.ones((h, w), np.float32) * alpha
    for side in (0, 1):                               # torn zig-zag ends
        teeth = rng.uniform(0, 14, h // 6 + 2)
        prof = np.interp(np.arange(h), np.linspace(0, h, len(teeth)), teeth).astype(int)
        for y in range(h):
            if side == 0:
                a[y, :prof[y] + 4] = 0
            else:
                a[y, w - prof[y] - 4:] = 0
    a *= (0.94 + 0.06 * _noise(h, w, 30, rng))
    rgb = np.ones((h, w, 3), np.float32) * _hex(color)
    rgb *= (0.97 + 0.04 * _noise(h, w, 20, rng))[..., None]
    stripes = (np.sin(np.arange(h) / h * np.pi * 7) > 0.6)[:, None]
    rgb = np.where(stripes[..., None], rgb * 0.97, rgb)
    return _save(np.dstack([rgb, a * 255]), out, 'RGBA')
