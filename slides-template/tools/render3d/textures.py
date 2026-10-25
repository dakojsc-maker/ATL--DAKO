"""Flat textures for the 3D scenes (screens, labels, panels). python textures.py <out_dir>"""
import os
import sys

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT = os.path.join(ROOT, 'fonts', 'keynote', 'BeVietnamPro-{}.ttf')
SRC = os.path.join(ROOT, 'assets', 'images', 'src', 'stp')


def f(w, size):
    return ImageFont.truetype(FONT.format(w), size)


def qr_matrix(data='https://vienstp.com'):
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(data)
    q.make(fit=True)
    return q.get_matrix()


def qr_image(size, data='https://vienstp.com', fg=(13, 43, 28), bg=(255, 255, 255)):
    m = qr_matrix(data)
    n = len(m)
    im = Image.new('RGB', (n, n), bg)
    px = im.load()
    for j, row in enumerate(m):
        for i, v in enumerate(row):
            if v:
                px[i, j] = fg
    return im.resize((size, size), Image.NEAREST)


def rr(d, box, r, **kw):
    d.rounded_rectangle(box, r, **kw)


def dashboard(out, w=1600, h=1000):
    """Dark operations dashboard (abstract: charts and bars, no readable figures)."""
    im = Image.new('RGB', (w, h), (9, 24, 17))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 230, h), fill=(13, 34, 24))
    d.ellipse((40, 40, 92, 92), fill=(127, 194, 17))
    for k in range(7):
        y = 150 + k * 70
        rr(d, (40, y, 190, y + 22), 8, fill=(30, 66, 46) if k else (127, 194, 17))
    d.text((280, 50), 'Tổng quan vận hành', font=f('Bold', 44), fill=(235, 245, 238))
    rr(d, (280, 112, 760, 132), 8, fill=(30, 60, 44))
    for k in range(4):                                   # KPI tiles
        x = 280 + k * 320
        rr(d, (x, 170, x + 295, 330), 20, fill=(17, 44, 31))
        rr(d, (x + 28, 200, x + 150, 222), 8, fill=(40, 80, 58))
        rr(d, (x + 28, 245, x + 120 + k * 30, 295), 10, fill=(127, 194, 17) if k == 0 else (210, 235, 214))
    rr(d, (280, 365, 1180, 950), 24, fill=(17, 44, 31))   # line chart
    import math
    pts = [(320 + i * 20, 820 - 220 * (0.5 + 0.35 * math.sin(i / 5.0) + 0.1 * math.sin(i * 1.7))) for i in range(41)]
    d.polygon(pts + [(1120, 900), (320, 900)], fill=(36, 82, 40))
    d.line(pts, fill=(127, 194, 17), width=7)
    for gy in range(450, 900, 90):
        d.line((320, gy, 1140, gy), fill=(30, 60, 44), width=2)
    rr(d, (1215, 365, 1560, 640), 24, fill=(17, 44, 31))  # donut
    d.ellipse((1290, 400, 1490, 600), outline=(127, 194, 17), width=34)
    d.arc((1290, 400, 1490, 600), 200, 320, fill=(222, 7, 9), width=34)
    rr(d, (1215, 670, 1560, 950), 24, fill=(17, 44, 31))  # bars
    for k, hh in enumerate((120, 180, 90, 210, 150)):
        x = 1250 + k * 60
        rr(d, (x, 920 - hh, x + 36, 920), 8, fill=(127, 194, 17) if k == 3 else (90, 150, 100))
    im.save(out)
    return out


def phone_trace(out, w=900, h=1950):
    """Consumer view after scanning a traceability code (demo data)."""
    im = Image.new('RGB', (w, h), (244, 247, 245))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, w, 300), fill=(24, 96, 40))
    d.text((60, 120), 'HLHT TRACE', font=f('ExtraBold', 58), fill='white')
    d.text((60, 200), 'Truy xuất nguồn gốc chuẩn GS1', font=f('Medium', 34), fill=(205, 235, 190))
    ph = Image.open(os.path.join(SRC, 'coffee_harvest.jpg')).convert('RGB')
    ph = ph.crop((200, 0, 200 + 1100, 1100 * 640 // 820)).resize((820, 640))
    mask = Image.new('L', ph.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, ph.width, ph.height), 36, fill=255)
    im.paste(ph, (40, 340), mask)
    rr(d, (40, 1010, w - 40, 1150), 30, fill=(127, 194, 17))
    d.ellipse((75, 1043, 147, 1115), fill='white')
    d.line((92, 1080, 107, 1095, 132, 1062), fill=(32, 125, 8), width=9)
    d.text((175, 1035), 'Đã xác thực', font=f('ExtraBold', 46), fill=(10, 40, 20))
    d.text((175, 1093), 'Thông tin được kiểm chứng trên chuỗi', font=f('Medium', 28), fill=(20, 60, 30))
    rows = (('Sản phẩm', 'Cà phê nhân Robusta'), ('Vùng trồng', 'Đắk Lắk, Việt Nam'),
            ('Tiêu chuẩn', 'GS1 · TCVN'), ('Mã lô', '2026 – 0157'))
    for k, (a, b) in enumerate(rows):
        y = 1200 + k * 120
        d.text((60, y), a, font=f('Regular', 32), fill=(120, 135, 125))
        d.text((60, y + 42), b, font=f('SemiBold', 40), fill=(15, 40, 25))
        d.line((60, y + 105, w - 60, y + 105), fill=(222, 230, 224), width=2)
    for k in range(4):                                    # journey dots
        x = 110 + k * 230
        d.ellipse((x - 26, 1715 - 26, x + 26, 1715 + 26), fill=(32, 125, 8) if k < 3 else (190, 205, 195))
        if k < 3:
            d.line((x + 30, 1715, x + 200, 1715), fill=(127, 194, 17), width=8)
    for k, t in enumerate(('Thu hoạch', 'Chế biến', 'Đóng gói', 'Phân phối')):
        tw = d.textlength(t, font=f('Medium', 26))
        d.text((110 + k * 230 - tw / 2, 1760), t, font=f('Medium', 26), fill=(70, 90, 78))
    im.save(out)
    return out


def box_label(out, w=900, h=640):
    im = Image.new('RGB', (w, h), (250, 250, 247))
    d = ImageDraw.Draw(im)
    im.paste(qr_image(420), (40, 110))
    d.text((500, 120), 'GS1', font=f('Black', 120), fill=(15, 50, 30))
    d.text((505, 270), 'TRUY XUẤT', font=f('Bold', 44), fill=(32, 125, 8))
    d.text((505, 325), 'NGUỒN GỐC', font=f('Bold', 44), fill=(32, 125, 8))
    for k in range(10):                                  # barcode
        x = 505 + k * 34
        d.rectangle((x, 420, x + (10 if k % 3 else 20), 560), fill=(20, 30, 25))
    d.rectangle((0, 0, w, 60), fill=(32, 125, 8))
    im.save(out)
    return out


def solar(out, w=700, h=500):
    im = Image.new('RGB', (w, h), (18, 34, 70))
    d = ImageDraw.Draw(im)
    for i in range(1, 7):
        d.line((i * w / 7, 0, i * w / 7, h), fill=(150, 170, 200), width=4)
    for j in range(1, 5):
        d.line((0, j * h / 5, w, j * h / 5), fill=(150, 170, 200), width=4)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    im.save(out)
    return out


def screen_crop(src, out, aspect, x0=0.0):
    im = Image.open(src).convert('RGB')
    iw, ih = im.size
    if iw / ih > aspect:
        nw = int(ih * aspect)
        x = int(min(max(0, x0 * iw), iw - nw))
        im = im.crop((x, 0, x + nw, ih))
    else:
        nh = int(iw / aspect)
        im = im.crop((0, 0, iw, nh))
    im.save(out)
    return out


if __name__ == '__main__':
    o = sys.argv[1]
    os.makedirs(o, exist_ok=True)
    dashboard(os.path.join(o, 'dashboard.png'))
    phone_trace(os.path.join(o, 'phone_trace.png'))
    box_label(os.path.join(o, 'box_label.png'))
    solar(os.path.join(o, 'solar.png'))
    screen_crop(os.path.join(SRC, 'screen_dashboard.jpg'), os.path.join(o, 'laptop_screen.png'), 1.6)
    screen_crop(os.path.join(SRC, 'screen_lookup.jpg'), os.path.join(o, 'tablet_screen.png'), 1.42, x0=0.25)
    print('textures ->', o)
