"""Hình minh họa bao bì ca cao cho bộ slide Heragrain (dùng chung bộ hàm vẽ của Kho Mẫu Slide DAKO, lib/product_assets.py).

    bar_h(...)     vỏ hộp thanh socola khổ ngang, cửa sổ chữ H thấy socola thật bên trong, dải màu bên phải có % ca cao
    texture(kind)  ảnh nền vẽ bằng mã cho cửa sổ H khi chưa có ảnh chụp thật: 'nibs', 'bot', 'bo', 'travo'
Gắn vào product_assets bằng install(A) để showcase_build gọi được {'type': 'bar_h', ...} trong PRODUCTS.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def install(A):
    A.bar_h = lambda out, **kw: bar_h(A, out, **kw)


def bar_h(A, out, name_en, name_vi, brand='Heragrain', brand_sub='CACAO', weight='80 g', pct='70%', pct_label='CACAO',
          origin='ĐẮK LẮK · SINGLE ORIGIN', photo=None, photo_focus=(0.5, 0.5), band='3B2416', accent='E4A92A',
          ink='1D4B3A', title_font=None, body_font=None, w=700, h=1080, depth=34, ss=2, seed=21, **_):
    """Hộp giấy đứng (thanh socola, hộp quà): logo, cửa sổ chữ H, tên, dải màu có % ca cao; vẽ thành khối hộp 3D."""
    W, H, DP = w * ss, h * ss, depth * ss
    base = np.array([247, 242, 231], np.float32)
    n = A._noise(H, W, 6, seed) * 0.5 + A._noise(H, W, 40, seed + 1) * 0.5
    lab = Image.fromarray(np.clip(base[None, None, :] * (0.965 + 0.045 * n[..., None]), 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(lab)
    INK, ACC, BAND, KEM = A._hex(ink), A._hex(accent), A._hex(band), A._hex('F7F2E7')
    # logo
    fb = A._fit(d, brand, title_font, H * 0.07, W * 0.62)
    bw = d.textlength(brand, font=fb)
    lx, ly = W / 2 - bw / 2, H * 0.05
    d.text((lx, ly), brand, font=fb, fill=INK)
    A.leaf_logo(d, lx + W * 0.03, ly - H * 0.018, W * 0.075, A._hex('5E9E68'), INK)
    fs = A._fit(d, brand_sub, body_font, H * 0.024, W * 0.3)
    A._text_center(d, lx + bw - d.textlength(brand_sub, font=fs) / 2 - W * 0.01, ly + H * 0.072, brand_sub, fs, ACC, spacing=int(W * 0.008))
    # cửa sổ chữ H
    hx, hy, hw, hh = W * 0.2, H * 0.18, W * 0.6, H * 0.33
    hm = A._h_mask(W, H, hx, hy, hw, hh)
    if photo:
        ph = A._photo_fill(photo, int(hw), int(hh), photo_focus)
        layer = Image.new('RGB', (W, H), (0, 0, 0))
        layer.paste(ph, (int(hx), int(hy)))
        lab.paste(layer, (0, 0), hm)
        edge = hm.filter(ImageFilter.MaxFilter(5))
        e = Image.fromarray(np.clip(np.asarray(edge).astype(np.int16) - np.asarray(hm).astype(np.int16), 0, 255).astype(np.uint8))
        lab.paste(Image.new('RGB', (W, H), INK), (0, 0), e)
    d = ImageDraw.Draw(lab)
    # tên
    fe = A._fit(d, name_en.upper(), title_font, H * 0.046, W * 0.86)
    A._text_center(d, W / 2, H * 0.545, name_en.upper(), fe, INK)
    fv = A._fit(d, name_vi.upper(), body_font, H * 0.026, W * 0.86)
    A._text_center(d, W / 2, H * 0.605, name_vi.upper(), fv, A._hex('5C4636'), spacing=int(W * 0.003))
    # dải màu dưới, viền vàng, hoa văn quả ca cao
    top = H * 0.68
    d.rectangle((0, top, W, H), fill=BAND)
    d.rectangle((0, top, W, top + H * 0.008), fill=ACC)
    lc = tuple(min(255, int(c + 34)) for c in BAND)
    for cx, cy, rx, ry, ang in [(0.86, 0.79, 0.12, 0.085, -28), (0.12, 0.95, 0.1, 0.07, 18)]:
        pod = Image.new('L', (W, H), 0)
        pd = ImageDraw.Draw(pod)
        pd.ellipse((W * cx - W * rx, H * cy - H * ry, W * cx + W * rx, H * cy + H * ry), outline=255, width=max(2, int(W * 0.005)))
        for j in (-0.5, 0, 0.5):
            pd.line([(W * cx - W * rx * 0.92, H * cy + H * ry * j), (W * cx + W * rx * 0.92, H * cy + H * ry * j)], fill=170, width=max(1, int(W * 0.003)))
        lab.paste(Image.new('RGB', (W, H), lc), (0, 0), pod.rotate(ang, center=(W * cx, H * cy)))
    d = ImageDraw.Draw(lab)
    fp = A._fit(d, pct, title_font, H * 0.13, W * 0.46)
    d.text((W * 0.08, top + H * 0.04), pct, font=fp, fill=KEM)
    fl = A._fit(d, pct_label, body_font, H * 0.03, W * 0.4)
    d.text((W * 0.09, top + H * 0.2), pct_label, font=fl, fill=ACC)
    fo = A._fit(d, origin, body_font, H * 0.02, W * 0.84)
    d.text((W * 0.09, top + H * 0.255), origin, font=fo, fill=KEM)
    if weight:
        fw = A._fit(d, weight, title_font, H * 0.034, W * 0.3)
        d.text((W * 0.92 - d.textlength(weight, font=fw), top + H * 0.245), weight, font=fw, fill=KEM)
    # khối hộp: mặt trước + mặt trên + cạnh phải
    front = np.asarray(lab).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    light = 1.04 - 0.08 * (xx / W) - 0.05 * (yy / H)
    gloss = np.exp(-(((xx / W) * 0.55 - (yy / H) + 0.05) / 0.07) ** 2) * 16
    front = front * light[..., None] + gloss[..., None]
    CW, CH = W + DP, H + DP
    rgb = np.zeros((CH, CW, 3), np.float32)
    alpha = np.zeros((CH, CW), np.float32)
    rgb[DP:, :W] = front
    alpha[DP:, :W] = 255
    topm = Image.new('L', (CW, CH), 0)
    ImageDraw.Draw(topm).polygon([(0, DP), (DP, 0), (CW, 0), (W, DP)], fill=255)
    side = Image.new('L', (CW, CH), 0)
    ImageDraw.Draw(side).polygon([(W, DP), (CW, 0), (CW, H), (W, CH)], fill=255)
    tm, sm = np.asarray(topm).astype(np.float32) / 255, np.asarray(side).astype(np.float32) / 255
    sidec_rgb = np.zeros((CH, CW, 3), np.float32)
    ys = np.arange(CH)[:, None]
    lower = (ys - DP * (1 - 0)) > top
    sidec_rgb[:] = base * 0.86
    sidec_rgb[lower[:, 0]] = np.array(BAND, np.float32) * 0.66
    rgb = rgb * (1 - tm[..., None]) + (base * 0.99)[None, None, :] * tm[..., None]
    rgb = rgb * (1 - sm[..., None]) + sidec_rgb * sm[..., None]
    alpha = np.maximum(alpha, np.maximum(tm, sm) * 255)
    return A._finish(rgb, alpha, out, ss, shadow_alpha=0.3)


def texture(kind, out, w=900, h=700, seed=5):
    """Ảnh nền giả lập cho cửa sổ H (nibs, bột, bơ ca cao, vỏ lụa)."""
    if os.path.exists(out):
        return out
    R = np.random.default_rng(seed)
    if kind == 'bot':
        n = R.random((h, w)).astype(np.float32)
        im = Image.fromarray((n * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
        n = np.asarray(im).astype(np.float32) / 255
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        mound = np.exp(-(((xx - w * 0.5) / (w * 0.55)) ** 2 + ((yy - h * 0.75) / (h * 0.6)) ** 2))
        base = np.array([110, 62, 36], np.float32)
        ridge = np.sin(xx / w * 9 + np.sin(yy / h * 5) * 1.6) * 0.5 + 0.5
        arr = base[None, None, :] * (0.55 + 0.5 * mound[..., None] + 0.16 * ridge[..., None] + 0.4 * (n[..., None] - 0.5))
        Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(out, quality=92)
        return out
    bg = {'nibs': (52, 30, 18), 'bo': (226, 205, 150), 'travo': (150, 96, 60)}[kind]
    im = Image.new('RGB', (w, h), bg)
    d = ImageDraw.Draw(im, 'RGBA')
    cols = {'nibs': [(92, 54, 32), (110, 66, 40), (74, 42, 26), (128, 80, 50)],
            'bo': [(240, 222, 168), (232, 212, 150), (247, 233, 190), (222, 198, 132)],
            'travo': [(160, 96, 58), (132, 74, 44), (182, 118, 72), (110, 60, 36)]}[kind]
    count = {'nibs': 900, 'bo': 26, 'travo': 420}[kind]
    for i in range(count):
        cx, cy = R.random() * w, R.random() * h
        if kind == 'bo':
            r = 70 + R.random() * 110
        elif kind == 'nibs':
            r = 10 + R.random() * 20
        else:
            r = 14 + R.random() * 26
        k = 5 + int(R.random() * 3)
        a0 = R.random() * 6.28
        sx = 1.0 if kind != 'travo' else 0.35 + R.random() * 0.3
        pts = [(cx + math.cos(a0 + j * 6.28 / k) * r * (0.7 + 0.5 * R.random()), cy + math.sin(a0 + j * 6.28 / k) * r * sx * (0.7 + 0.5 * R.random())) for j in range(k)]
        c = cols[int(R.random() * len(cols))]
        d.polygon(pts, fill=c + (255,))
        hl = tuple(min(255, v + 34) for v in c)
        d.line(pts[:2], fill=hl + (200,), width=2 if kind != 'bo' else 5)
    im = im.filter(ImageFilter.GaussianBlur(0.6 if kind != 'bo' else 1.2))
    im.save(out, quality=92)
    return out
