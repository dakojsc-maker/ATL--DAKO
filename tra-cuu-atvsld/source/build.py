#!/usr/bin/env python3
"""Ghép template.html + app.css + dữ liệu + docx + exportdoc.js + app.js thành 1 file HTML.
Chạy:  python3 build.py            -> ../Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html (bản ngoại tuyến)
       python3 build.py --artifact -> ../artifact/tra-cuu-atvsld.html (bản đăng artifact trên claude.ai)
Bản artifact: không có doctype/html/head/body (claude.ai tự bọc khung trang), <title> và <style> đứng đầu file.
"""
import sys, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if a != '--artifact']
ART = '--artifact' in sys.argv[1:]
def rd(p): return open(p, encoding='utf-8').read()
t = rd(HERE + '/app/template.html')
if ART:
    head = re.search(r'<head>(.*?)</head>', t, re.S).group(1)
    body = re.search(r'<body[^>]*>(.*)</body>', t, re.S).group(1)
    head = re.sub(r'<meta [^>]*>\n?', '', head)
    head = re.sub(r'<title>.*?</title>', '<title>Tra cứu nhóm huấn luyện ATVSLĐ</title>', head)
    t = head.strip() + '\n' + body.strip() + '\n'
data = rd(HERE + '/data/app_data.json').replace('</', '<\\/').replace('<!--', '<\\u0021--')
docx = rd(HERE + '/lib/docx.iife.js')
assert '</script' not in docx.lower()
# thư viện có 4 chuỗi "�" viết thẳng ký tự (bộ giải mã UTF-8); ghi dạng thoát để file không chứa U+FFFD
assert all(docx[i - 1] == '"' for i in range(len(docx)) if docx[i] == '�')
docx = docx.replace('�', '\\uFFFD')
parts = {'/*@CSS*/': rd(HERE + '/app/app.css'), '/*@DATA*/': data, '/*@DOCX*/': docx,
         '/*@EXPORT*/': rd(HERE + '/app/exportdoc.js'), '/*@APP*/': rd(HERE + '/app/app.js')}
for k, v in parts.items():
    assert t.count(k) == 1, k
    assert '</script' not in v.lower() or k == '/*@DATA*/', k
    a, b = t.split(k)
    t = a + v + b
if args:
    out = args[0]
elif ART:
    out = os.path.dirname(HERE) + '/artifact/tra-cuu-atvsld.html'
else:
    out = os.path.dirname(HERE) + '/Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(t)
print(out, round(len(t.encode('utf-8')) / 1e6, 2), 'MB')
