"""Tách ảnh 6 sản phẩm đã tách nền (HTX cung cấp: anh/concept/6-san-pham-tach-nen-goc.png) thành 6 PNG riêng cho bộ slide concept.

    python tach_6_san_pham.py anh/concept/6-san-pham-tach-nen-goc.png anh/concept/tach-nen <ảnh-xem-thử.jpg>

Cần numpy, scipy, Pillow. Các cặp dính nhau: 2 bao đay (đường cắt ít điểm ảnh nhất); nibs với socola, bột với bơ (bát ở phía
trước thuộc sản phẩm trái; mép bát đọc từ bảng phân loại màu từng điểm ảnh; phần hộp, hũ bị bát che được nối bằng màu của
chính hộp, hũ). Phóng to 2,5 lần (LANCZOS trên ảnh nhân sẵn alpha), thêm bóng đổ mềm.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

src, out_dir, sheet = sys.argv[1:4]
im = Image.open(src).convert('RGBA')
A = np.asarray(im).astype(np.float32)
al = np.clip(A[..., 3] / 254.0, 0, 1)
rgb = A[..., :3]
H, W = al.shape
yy, xx = np.mgrid[0:H, 0:W]


def dp_seam(x0, x1):
    band = al[:, x0:x1 + 1] + 0.002
    n = band.shape[1]
    cost = np.full((H, n), np.inf); back = np.zeros((H, n), int); cost[0] = band[0]
    for y in range(1, H):
        prev = cost[y - 1]; best = np.full(n, np.inf); arg = np.zeros(n, int)
        for d in (-2, -1, 0, 1, 2):
            sh = np.full(n, np.inf)
            if d < 0: sh[:d] = prev[-d:]
            elif d > 0: sh[d:] = prev[:-d]
            else: sh = prev.copy()
            sh = sh + 0.003 * abs(d); m = sh < best; best[m] = sh[m]; arg[m] = (np.arange(n) - d)[m]
        cost[y] = best + band[y]; back[y] = arg
    xs = np.zeros(H, int); xs[-1] = int(np.argmin(cost[-1]))
    for y in range(H - 1, 0, -1): xs[y - 1] = back[y, xs[y]]
    return xs + x0


def interp(pts):
    return np.interp(np.arange(H), [p[1] for p in pts], [p[0] for p in pts])


A0 = A.copy()
s1 = dp_seam(265, 345)
left1 = xx <= s1[:, None]

# mép phải của bát (đọc từ bảng phân loại màu từng điểm ảnh); trên/dưới bát là đường thẳng giữa bát và hộp/hũ
B2 = [(804, 0), (804, 585), (805, 586), (806, 588), (806, 590), (808, 592), (812, 594), (815, 596), (819, 598), (820, 600),
      (821, 602), (821, 614), (820, 616), (820, 624), (818, 626), (817, 628), (816, 630), (815, 632), (814, 634), (813, 636),
      (812, 638), (811, 640), (809, 642), (807, 644), (805, 646), (803, 648), (801, 650), (799, 652), (800, 654), (802, 656), (802, H - 1)]
B3 = [(1291, 0), (1291, 585), (1284, 586), (1286, 588), (1288, 590), (1290, 592), (1292, 594), (1294, 596), (1296, 598),
      (1298, 600), (1301, 602), (1304, 604), (1307, 606), (1310, 608), (1311, 610), (1311, 624), (1310, 626), (1309, 628),
      (1309, 630), (1308, 632), (1308, 634), (1307, 636), (1306, 638), (1305, 640), (1304, 642), (1304, 644), (1301, 646),
      (1299, 648), (1299, H - 1)]
b2, b3 = interp(B2).round(), interp(B3).round()
# phần hộp (mặt hông xanh) và hũ bị bát che: (hàng đầu, hàng cuối, mép trái của hộp/hũ, cách tô: v = kéo dọc từ trên, h = kéo ngang từ phải)
FILL = {2: [(588, 624, lambda y: 806, 'v', 587)],
        3: [(598, 633, lambda y: 1297 + (y - 586) * 3 / 60, 'v', 596), (634, 645, lambda y: 1297 + (y - 586) * 3 / 60, 'h', 0)]}
left, right, holes = {}, {}, {}
for k, b in ((2, b2), (3, b3)):
    L = xx <= b[:, None]
    Rm = xx > b[:, None]
    hole = np.zeros((H, W), bool)
    for (ya, yb, edge, how, src_row) in FILL[k]:
        for y in range(ya, yb + 1):
            e = int(round(edge(y)))
            for x in range(e, int(b[y]) + 1):
                hole[y, x] = True
                A[y, x, :3] = rgb[src_row, x] if how == 'v' else rgb[y, int(b[y]) + 2]
    left[k], right[k], holes[k] = L, Rm | hole, hole
    print('pair', k, 'hole px', int(hole.sum()))
# làm mềm vùng tô
for k in holes:
    for c in range(3):
        ch = ndi.gaussian_filter(A[..., c], 0.8)
        A[..., c][holes[k]] = ch[holes[k]]

fgm = al > 0.05
lab, ncomp = ndi.label(fgm)
pairm = [np.zeros((H, W), bool) for _ in range(3)]
for i in range(1, ncomp + 1):
    comp = lab == i
    cx = xx[comp].mean()
    k = 0 if cx < 545 else (1 if cx < 1064 else 2)
    pairm[k] |= comp
pairm = [ndi.binary_dilation(m, iterations=3) for m in pairm]
masks = {
    'sp1_hat_len_men': pairm[0] & left1,
    'sp2_hat_rang': pairm[0] & ~left1,
    'sp3_nibs': pairm[1] & left[2],
    'sp4_socola': (pairm[1] & right[2]) | holes[2],
    'sp5_bot': pairm[2] & left[3],
    'sp6_bo': (pairm[2] & right[3]) | holes[3],
}
fills = {'sp4_socola': holes[2], 'sp6_bo': holes[3]}
sheet_imgs = []
for nm, m in masks.items():
    a = al * m
    if nm in fills:
        a = np.maximum(a, fills[nm].astype(np.float32))
    hard = a > 0.5
    lb, nn = ndi.label(hard)
    if nn > 1:
        sz = ndi.sum(hard, lb, range(1, nn + 1))
        keep = np.isin(lb, [i + 1 for i, v in enumerate(sz) if v >= 0.015 * sz.max()])
        a = a * ndi.binary_dilation(keep, iterations=2)
    ys, xs = np.where(a > 0.03)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = (A if nm in fills else A0).copy(); rgba[..., 3] = a * 255
    crop = Image.fromarray(rgba[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
    pm = crop.convert('RGBa').resize((crop.width * 5 // 2, crop.height * 5 // 2), Image.LANCZOS).convert('RGBA')
    rgbu = pm.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    up = rgbu.copy(); up.putalpha(pm.getchannel('A'))
    pad = 44
    can = Image.new('RGBA', (up.width + 2 * pad, up.height + 2 * pad + 16), (0, 0, 0, 0))
    sh = Image.new('L', can.size, 0); sh.paste(up.getchannel('A'), (pad, pad + 12))
    sh = sh.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * 0.26))
    can.paste(Image.new('RGBA', can.size, (40, 26, 16, 255)), (0, 0), sh)
    can.alpha_composite(up, (pad, pad))
    can.save(f'{out_dir}/{nm}.png')
    print(nm, (int(x0), int(x1), int(y0), int(y1)), can.size, 'filled px', int(fills[nm].sum()) if nm in fills else 0)
    pv = Image.new('RGB', can.size, (246, 240, 230)); pv.paste(can, (0, 0), can)
    sheet_imgs.append(pv.resize((int(pv.width * 420 / pv.height), 420)))
Wd = sum(s.width + 10 for s in sheet_imgs) + 10
shh = Image.new('RGB', (Wd, 440), (190, 190, 190)); x = 10
for s in sheet_imgs:
    shh.paste(s, (x, 10)); x += s.width + 10
shh.save(sheet, quality=90)
