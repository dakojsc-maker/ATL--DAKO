#!/usr/bin/env python3
"""Tạo mẫu hợp đồng giảng viên có ô dữ liệu cho công cụ.

Đọc mẫu gốc anh Lịch gửi (templates/Hop_Dong_Nguyen_Tac_Va_Phu_Luc_Giang_Vien_ATVSLD.docx),
thay các chỗ "......" bằng ô {{tên_ô}} (mỗi ô nằm gọn trong một đoạn chữ để công cụ điền),
giữ nguyên định dạng của mẫu, rồi ghi ra src/hdgv_tpl.js (mẫu dạng base64 + chữ chấm gốc
của từng ô – dùng khi chưa có thông tin để in ra chỗ trống như mẫu).

Chạy:  python3 -I tools/hdgv_template.py
Khi anh gửi mẫu mới: thay file trong templates/, sửa bảng SPECS bên dưới nếu câu chữ đổi, chạy lại.
"""
import base64
import io
import json
import os
import re
import sys
import zipfile

from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'templates', 'Hop_Dong_Nguyen_Tac_Va_Phu_Luc_Giang_Vien_ATVSLD.docx')
OUT = os.path.join(ROOT, 'src', 'hdgv_tpl.js')

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
XML_NS = 'http://www.w3.org/XML/1998/namespace'
NS = {'w': W}


def q(tag):
    return '{%s}%s' % (W, tag)


# (số thứ tự đoạn trong mẫu, biểu thức có nhóm tên = ô dữ liệu)
# Đoạn đánh số theo thứ tự mọi <w:p> trong thân văn bản, kể cả trong bảng.
SPECS = [
    # ---------- HỢP ĐỒNG NGUYÊN TẮC ----------
    (0, r'(?P<a_ten_hoa>\[TÊN TỔ CHỨC HUẤN LUYỆN\])Số: (?P<so_hd>\.+/2026/HĐNT-ATVSLĐ)$'),
    (3, r'lao động năm (?P<hd_nam>2026)\)$'),
    (7, r'của (?P<a_ten>\[Tên Công ty\]);$'),
    (9, r'ngày (?P<hd_d>\.+) tháng (?P<hd_m>\.+) năm (?P<hd_y>2026), tại (?P<hd_noi>\.+), chúng'),
    (10, r'(?P<a_ten_hoa>\[TÊN CÔNG TY / TỔ CHỨC HUẤN LUYỆN ATVSLĐ\])$'),
    (11, r'trụ sở: (?P<a_dia_chi>\.+)$'),
    (12, r'Mã số thuế: (?P<a_mst>\.+)$'),
    (13, r'Điện thoại: (?P<a_dt>\.+) Email: (?P<a_email>\.+)$'),
    (14, r'\(Ông/Bà\): (?P<a_dai_dien>\.+) Chức vụ: (?P<a_chuc_vu>\.+)$'),
    (15, r'Tài khoản số: (?P<a_stk>\.+) Tại Ngân hàng: (?P<a_ngan_hang>\.+)$'),
    (17, r'\(Ông/Bà\): (?P<b_ten>\.+)$'),
    (18, r'Ngày sinh: (?P<b_ngay_sinh>\.+) Giới tính: (?P<b_gioi_tinh>\.+)$'),
    (19, r'Hộ chiếu: (?P<b_cccd>\.+) Ngày cấp: (?P<b_ngay_cap>\.+) Nơi cấp: (?P<b_noi_cap>\.+)$'),
    (20, r'thường trú: (?P<b_dia_chi>\.+)$'),
    (21, r'Điện thoại: (?P<b_dt>\.+) Email: (?P<b_email>\.+)$'),
    (22, r'cá nhân: (?P<b_mst>\.+)$'),
    (23, r'đào tạo: (?P<b_trinh_do>\.+)$'),
    (24, r'ATVSLĐ số: (?P<b_gcn>\.+)$'),
    (25, r'Nhóm (?P<b_nhom>\.+)$'),
    (26, r'ngân hàng: (?P<b_stk>\.+) Tại Ngân hàng: (?P<b_ngan_hang>\.+)$'),
    (29, r'Bên A trong (?P<hd_pham_vi>năm 2026)\.$'),
    (41, r'trong vòng (?P<hd_ngay_tt>\.+) ngày làm việc'),
    (54, r'kể từ ngày (?P<hd_tu>\.+/\.+/2026) đến hết ngày (?P<hd_den>31/12/2026)\.'),
    # ---------- PHỤ LỤC ----------
    (60, r'(?P<a_ten_hoa>\[TÊN TỔ CHỨC HUẤN LUYỆN\])Số: (?P<so_pl>\.+/PLHĐ-ATVSLĐ)$'),
    (62, r'SỐ: (?P<pl_stt>\.+)$'),
    (63, r'số: (?P<so_hd>\.+/2026/HĐNT-ATVSLĐ) ký ngày (?P<hd_ngay>\.+/\.+/2026)\)$'),
    (64, r'ngày (?P<pl_d>\.+) tháng (?P<pl_m>\.+) năm (?P<pl_y>2026), tại (?P<pl_noi>\.+), chúng'),
    (65, r'(?P<a_ten_hoa>\[TÊN CÔNG TY / TỔ CHỨC HUẤN LUYỆN ATVSLĐ\])$'),
    (66, r'\(Ông/Bà\): (?P<pl_dai_dien>\.+) Chức vụ: (?P<pl_chuc_vu>\.+)$'),
    (67, r'Ông/Bà (?P<b_ten>\.+)$'),
    (68, r'Số CCCD: (?P<b_cccd>\.+) Mã số thuế cá nhân: (?P<b_mst>\.+)$'),
    (69, r'số (?P<so_hd>\.+/2026/HĐNT-ATVSLĐ) và nhu cầu'),
    # dòng mẫu của bảng lớp dạy (các dòng 2, 3 của mẫu bị bỏ – công cụ nhân dòng này)
    (79, r'^(?P<r_stt>1)$'),
    (80, r'^(?P<r_kh>Công ty TNHH ABC)(?P<r_dd>\(Địa điểm: \.+\))$'),
    (81, r'^(?P<r_nd>Nhóm 3 - Vận hành thiết bị nâng)$'),
    (82, r'^(?P<r_tg>Từ \.\.\./\.\.\. đến \.\.\./\.\.\./2026)$'),
    (83, r'^(?P<r_sl>02 ngày)$'),
    (84, r'^(?P<r_dg>\.+)$'),
    (85, r'^(?P<r_tt>\.+)$'),
    (101, r'^(?P<pl_tong>\.+)$'),
    (102, r'Bằng chữ: (?P<pl_bang_chu>\.+)$'),
    (103, r'\(nếu có\): (?P<pl_di_lai>\.+)$'),
    (104, r'2\.000\.000 VNĐ\): (?P<pl_tncn>\.+) VNĐ\.$'),
    (105, r'cho Bên B: (?P<pl_thuc_nhan>\.+) VNĐ\.$'),
    (111, r'trong vòng (?P<pl_ngay_tt>\.+) ngày làm việc'),
    (113, r'thỉnh giảng số (?P<so_hd>\.+/2026/HĐNT-ATVSLĐ)\. Các'),
]
# Ô ký tên (thêm dòng họ tên dưới chỗ ký): đoạn → ô
SIGN = {57: 'a_ky', 58: 'b_ky', 116: 'pla_ky', 117: 'b_ky'}
# Các dòng ví dụ 2, 3 của bảng lớp dạy: bỏ (đoạn đầu của mỗi dòng)
DROP_ROWS_AT = [86, 93]


def para_runs(p):
    """Danh sách (w:t, text) theo thứ tự trong đoạn (chỉ run trực tiếp)."""
    out = []
    for r in p.findall('w:r', NS):
        for t in r.findall('w:t', NS):
            out.append(t)
    return out


def replace_span(p, start, end, token):
    """Thay ký tự [start, end) của chữ trong đoạn bằng token; token nằm trong w:t chứa ký tự đầu."""
    ts = para_runs(p)
    pos = 0
    placed = False
    for t in ts:
        txt = t.text or ''
        a, b = pos, pos + len(txt)
        pos = b
        if b <= start or a >= end:
            continue
        lo = max(start, a) - a
        hi = min(end, b) - a
        if not placed:
            t.text = txt[:lo] + token + txt[hi:]
            placed = True
        else:
            t.text = txt[:lo] + txt[hi:]
        t.set('{%s}space' % XML_NS, 'preserve')
    if not placed:
        raise SystemExit('Không đặt được ô ' + token)


def main():
    parser = etree.XMLParser(resolve_entities=False, no_network=True, remove_blank_text=False)
    zin = zipfile.ZipFile(SRC)
    doc = etree.fromstring(zin.read('word/document.xml'), parser)
    body = doc.find('w:body', NS)
    paras = list(body.iter(q('p')))
    blanks = {}
    for idx, pattern in SPECS:
        p = paras[idx]
        text = ''.join(t.text or '' for t in para_runs(p))
        m = re.search(pattern, text)
        if not m:
            raise SystemExit(f'Đoạn #{idx} không khớp mẫu: {pattern}\n  chữ: {text!r}')
        # thay từ phải sang trái để vị trí không lệch
        spans = sorted(((m.start(k), m.end(k), k) for k in m.groupdict()), reverse=True)
        for s, e, k in spans:
            blank = text[s:e]
            tok = k
            if k in blanks and blanks[k] != blank:
                # cùng ô nhưng dòng chấm khác độ dài → tên riêng cho vị trí này (ô@2, ô@3…), giá trị vẫn lấy theo ô gốc
                n = 2
                while f'{k}@{n}' in blanks and blanks[f'{k}@{n}'] != blank:
                    n += 1
                tok = f'{k}@{n}'
            blanks.setdefault(tok, blank)
            replace_span(p, s, e, '{{%s}}' % tok)
    # dòng họ tên dưới chỗ ký
    for idx, key in SIGN.items():
        p = paras[idx]
        tc = p.getparent()
        np_ = etree.SubElement(tc, q('p'))
        ppr = etree.SubElement(np_, q('pPr'))
        sp = etree.SubElement(ppr, q('spacing'))
        sp.set(q('before'), '1300')
        sp.set(q('after'), '0')
        jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'center')
        r = etree.SubElement(np_, q('r'))
        rpr = etree.SubElement(r, q('rPr'))
        etree.SubElement(rpr, q('b'))
        t = etree.SubElement(r, q('t'))
        t.text = '{{%s}}' % key
        t.set('{%s}space' % XML_NS, 'preserve')
        blanks.setdefault(key, '')
    # bỏ dòng ví dụ 2, 3
    for idx in DROP_ROWS_AT:
        tr = paras[idx]
        while tr is not None and tr.tag != q('tr'):
            tr = tr.getparent()
        tr.getparent().remove(tr)
    # kiểm tra: mỗi ô nằm gọn trong một w:t, không còn ngoặc lẻ
    tokens = []
    for t in body.iter(q('t')):
        s = t.text or ''
        tokens += re.findall(r'\{\{([a-z0-9_]+(?:@\d+)?)\}\}', s)
        rest = re.sub(r'\{\{[a-z0-9_]+(?:@\d+)?\}\}', '', s)
        if '{{' in rest or '}}' in rest:
            raise SystemExit('Ô bị tách: ' + s)
    xml = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    core = zin.read('docProps/core.xml').decode('utf8')
    core = re.sub(r'<dc:creator>.*?</dc:creator>', '<dc:creator>DAKO</dc:creator>', core)
    core = re.sub(r'<cp:lastModifiedBy>.*?</cp:lastModifiedBy>', '<cp:lastModifiedBy>DAKO</cp:lastModifiedBy>', core)
    core = re.sub(r'<dc:description>.*?</dc:description>', '<dc:description></dc:description>', core)
    core = re.sub(r'<dc:title>.*?</dc:title>', '<dc:title>Hợp đồng thỉnh giảng ATVSLĐ</dc:title>', core)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == 'word/document.xml':
                data = xml
            elif item.filename == 'docProps/core.xml':
                data = core.encode('utf8')
            zout.writestr(item, data)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    with open(OUT, 'w', encoding='utf8') as fh:
        fh.write('/* Mẫu Hợp đồng nguyên tắc thỉnh giảng + Phụ lục (mẫu của DAKO) – tạo tự động bởi tools/hdgv_template.py, không sửa tay.\n')
        fh.write('   blanks: chữ chấm gốc của từng ô – in ra khi chưa có thông tin để điền tay. */\n')
        fh.write('const HDGV_TPL = {\n  blanks: ' + json.dumps(blanks, ensure_ascii=False) + ',\n')
        fh.write("  b64: '" + b64 + "',\n};\n")
    print(f'OK: {len(set(tokens))} ô, {len(tokens)} vị trí; mẫu {len(buf.getvalue())} byte → {OUT}')
    print(sorted(set(tokens)))


if __name__ == '__main__':
    sys.exit(main())
