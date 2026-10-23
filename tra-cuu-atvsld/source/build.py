#!/usr/bin/env python3
"""Ghép template.html + app.css + dữ liệu + docx + exportdoc.js + app.js thành 1 file HTML.
Chạy:  python3 build.py            -> ../Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html
"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(p, encoding='utf-8').read()
t = rd(HERE + '/app/template.html')
data = rd(HERE + '/data/app_data.json').replace('</', '<\\/').replace('<!--', '<\\u0021--')
docx = rd(HERE + '/lib/docx.iife.js')
assert '</script' not in docx.lower()
parts = {'/*@CSS*/': rd(HERE + '/app/app.css'), '/*@DATA*/': data, '/*@DOCX*/': docx,
         '/*@EXPORT*/': rd(HERE + '/app/exportdoc.js'), '/*@APP*/': rd(HERE + '/app/app.js')}
for k, v in parts.items():
    assert t.count(k) == 1, k
    assert '</script' not in v.lower() or k == '/*@DATA*/', k
    a, b = t.split(k)
    t = a + v + b
out = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE) + '/Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html'
open(out, 'w', encoding='utf-8').write(t)
print(out, round(len(t.encode('utf-8')) / 1e6, 2), 'MB')
