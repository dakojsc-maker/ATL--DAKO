# -*- coding: utf-8 -*-
"""Đóng gói workflow tuyển dụng Mậu Dịch 197X thành file HTML độc lập.

Chạy:  python3 build.py
Kết quả:
  Workflow_TuyenDung_MauDich197X.html  – file hoàn chỉnh, mở bằng trình duyệt trên máy bất kỳ
  ban-artifact.html                    – cùng nội dung, dạng trang để đăng lên claude.ai (Artifact)
"""
import base64
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import du_lieu as d  # noqa: E402

with open(os.path.join(HERE, 'assets', 'logo-maudich-197x.png'), 'rb') as f:
    logo = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()

data = {
    'lienhe': d.LIEN_HE,
    'vitri': d.VI_TRI,
    'kenh': d.KENH,
    'tuan': d.TUAN,
    'bai': d.BAI,
    'chuan': d.CHUAN,
    'chung': d.CHUNG,
    'nhom': d.NHOM_VI_TRI,
}
# kiểm tra nhanh trước khi đóng gói
assert len(d.BAI) == 28 and [b['d'] for b in d.BAI] == list(range(1, 29))
ids = {v['id'] for v in d.VI_TRI}
assert all(b['vt'] in ids for b in d.BAI)
assert all(k in d.KENH for v in d.VI_TRI for k in v['kenh'])
assert sorted(d.CHUAN) == sorted(ids) and len(d.CHUNG) == 3
assert sorted(i for g in d.NHOM_VI_TRI for i in g['ds']) == sorted(ids)

js = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

with open(os.path.join(HERE, 'khung.html'), encoding='utf-8') as f:
    page = f.read()
page = page.replace('__LOGO__', logo).replace('__DATA__', js)

with open(os.path.join(HERE, 'ban-artifact.html'), 'w', encoding='utf-8') as f:
    f.write(page)

cut = page.index('<header class="masthead">')
head, body = page[:cut], page[cut:]
full = (
    '<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
    'body{margin:0}img{max-width:100%}</style>\n'
    + head + '</head>\n<body>\n' + body + '\n</body>\n</html>\n'
)
out = os.path.join(HERE, 'Workflow_TuyenDung_MauDich197X.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(full)
print('Đã tạo', out, round(len(full.encode()) / 1024), 'KB')
