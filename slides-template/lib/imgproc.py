"""Image processing helpers: background removal (ISNet), blur, smart crop."""
import os, numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.environ.get('ISNET_MODEL', os.path.join(ROOT, 'models', 'isnet_medium.onnx'))
_sess = None


def fetch_model():
    """Assemble the ISNet ONNX model shipped inside the @imgly/background-removal-node npm package."""
    import json, subprocess, tarfile, tempfile
    os.makedirs(os.path.dirname(MODEL), exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(['npm', 'pack', '@imgly/background-removal-node@1.4.5'], cwd=d, check=True, capture_output=True)
        tgz = [f for f in os.listdir(d) if f.endswith('.tgz')][0]
        tarfile.open(os.path.join(d, tgz)).extractall(d)
        dist = os.path.join(d, 'package', 'dist')
        res = json.load(open(os.path.join(dist, 'resources.json')))['/models/medium']
        with open(MODEL, 'wb') as out:
            for ch in res['chunks']:
                out.write(open(os.path.join(dist, ch['hash']), 'rb').read())
    return MODEL

def _session():
    global _sess
    if _sess is None:
        import onnxruntime as ort
        if not os.path.exists(MODEL):
            fetch_model()
        _sess = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider'])
    return _sess

def load(src):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    return im.convert('RGB')

def isnet_mask(im):
    x = np.asarray(im.resize((1024, 1024), Image.BILINEAR)).astype(np.float32)
    x = (x - 128.0) / 256.0
    x = x.transpose(2, 0, 1)[None]
    out = _session().run(['output'], {'input': x})[0][0, 0]
    m = np.clip(out, 0, 1)
    return Image.fromarray((m * 255).astype(np.uint8)).resize(im.size, Image.BILINEAR)

def refine(im, mask, radius=8, eps=1e-4):
    """Edge-aware refinement with a guided filter (cv2.ximgproc if available, else numpy)."""
    import cv2
    I = np.asarray(im).astype(np.float32) / 255.0
    p = np.asarray(mask).astype(np.float32) / 255.0
    g = cv2.cvtColor(I, cv2.COLOR_RGB2GRAY)
    def box(a): return cv2.boxFilter(a, -1, (2 * radius + 1, 2 * radius + 1))
    mI, mp = box(g), box(p)
    cov = box(g * p) - mI * mp
    var = box(g * g) - mI * mI
    a = cov / (var + eps); b = mp - a * mI
    q = box(a) * g + box(b)
    q = np.clip(q, 0, 1)
    # keep solid interior from original mask, use refined values on the edge band only
    edge = (p > 0.02) & (p < 0.98)
    edge = cv2.dilate(edge.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    r = np.where(edge, q, p)
    return Image.fromarray((r * 255).astype(np.uint8))

def decontaminate(im, alpha):
    """Reduce background colour fringe: pull edge pixels toward nearby foreground colour."""
    import cv2
    a = np.asarray(alpha).astype(np.float32) / 255.0
    rgb = np.asarray(im).astype(np.float32)
    solid = (a > 0.9).astype(np.float32)
    k = 15
    num = cv2.blur(rgb * solid[..., None], (k, k)); den = cv2.blur(solid, (k, k))[..., None]
    fg = np.where(den > 1e-3, num / np.maximum(den, 1e-3), rgb)
    w = np.clip((0.9 - a) / 0.9, 0, 1)[..., None] * (a[..., None] > 0.01)
    out = rgb * (1 - w) + fg * w
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def cutout(src, dst, max_side=1600, do_refine=True, trim=True, pad=4, keep_largest=True):
    im = load(src)
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    m = isnet_mask(im)
    if do_refine:
        m = refine(im, m)
    if keep_largest:
        import cv2
        arr = np.asarray(m)
        n, lab, stats, _ = cv2.connectedComponentsWithStats((arr > 64).astype(np.uint8))
        if n > 2:
            keep = np.zeros_like(arr, dtype=bool)
            big = stats[1:, cv2.CC_STAT_AREA].max()
            for i in range(1, n):
                if stats[i, cv2.CC_STAT_AREA] >= 0.08 * big:
                    keep |= lab == i
            keep = cv2.dilate(keep.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
            m = Image.fromarray(np.where(keep, arr, 0).astype(np.uint8))
    rgb = decontaminate(im, m)
    out = rgb.convert('RGBA'); out.putalpha(m)
    if trim:
        bb = m.point(lambda v: 255 if v > 12 else 0).getbbox()
        if bb:
            bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad))
            out = out.crop(bb)
    out.save(dst)
    return out

def smart_crop(src, dst, ratio, focus=(0.5, 0.5), max_w=1600, zoom=1.0):
    """Crop to aspect ratio (w/h) around focus point (fractions), optional zoom (>1 crops tighter)."""
    im = load(src)
    W, H = im.size
    if W / H > ratio: ch = H; cw = H * ratio
    else: cw = W; ch = W / ratio
    cw /= zoom; ch /= zoom
    cx = min(max(focus[0] * W, cw / 2), W - cw / 2); cy = min(max(focus[1] * H, ch / 2), H - ch / 2)
    im = im.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2)))
    if im.width > max_w:
        im = im.resize((max_w, int(max_w / ratio)), Image.LANCZOS)
    im.save(dst, quality=90)
    return im

def blurred(src, dst, ratio=16/9, radius=18, darken=0.0, tint=None, tint_amt=0.0, sat=1.0, focus=(0.5, 0.5), w=1600):
    im = smart_crop(src, dst, ratio, focus, max_w=w)
    im = im.filter(ImageFilter.GaussianBlur(radius))
    if sat != 1.0: im = ImageEnhance.Color(im).enhance(sat)
    if tint:
        t = Image.new('RGB', im.size, tint); im = Image.blend(im, t, tint_amt)
    if darken: im = ImageEnhance.Brightness(im).enhance(1 - darken)
    im.save(dst, quality=88)
    return im
