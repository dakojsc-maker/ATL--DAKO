#!/usr/bin/env python3
"""Mẫu Hợp đồng huấn luyện ATVSLĐ (DAKO – khách hàng).

Soạn từ các hợp đồng DAKO đã ký (số 13–22/2026), chuẩn hóa câu chữ. Tạo ra:
  1. templates/Mau_Hop_dong_huan_luyen_ATVSLD_DAKO.docx – bản để điền tay (dòng chấm + gợi ý).
  2. src/hdkh_tpl.js – cùng mẫu nhưng có ô {{...}} để công cụ tự điền từ báo giá/hợp đồng.

Chạy:  python3 -I tools/hdkh_template.py
"""
import base64
import io
import json
import os

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_DOCX = os.path.join(ROOT, 'templates', 'Mau_Hop_dong_huan_luyen_ATVSLD_DAKO.docx')
OUT_JS = os.path.join(ROOT, 'src', 'hdkh_tpl.js')

D = '…………………………'
BLANKS = {
    'tieu_de': 'HỢP ĐỒNG', 'so_hd': '……/20…/ATLĐ/……-DAKO', 'd': '……', 'm': '……', 'y': '20……',
    'a_ten_hoa': '[TÊN CÔNG TY KHÁCH HÀNG – VIẾT HOA]', 'a_dia_chi': D * 3, 'a_dt': D, 'a_mst': D, 'a_email': D,
    'a_dai_dien': 'Ông/Bà ' + D, 'a_chuc_vu': D, 'a_ky': '',
    'b_ten_hoa': 'CÔNG TY CỔ PHẦN KỸ THUẬT HÀNG HẢI DAKO', 'b_dia_chi': 'Số 28, đường D9, Khu phố 8, Phường An Khánh, TP. Hồ Chí Minh',
    'b_dt': '0827.695.368 – 0968.702.701', 'b_mst': '0313642407', 'b_stk': '19130009928016', 'b_ngan_hang': 'Techcombank – Chi nhánh Trần Não',
    'b_dai_dien': 'Bà PHẠM THỊ THU THANH', 'b_chuc_vu': 'Giám đốc', 'b_ky': 'Phạm Thị Thu Thanh',
    'nhom': 'Nhóm …… (ghi rõ các nhóm theo Nghị định 44/2016/NĐ-CP)', 'so_hv': '……',
    'thoi_gian': 'Từ ngày ……/……/20…… đến ngày ……/……/20……', 'dia_diem': D * 3, 'hinh_thuc': 'Trực tiếp',
    'gia_tri_cau': 'Giá trị hợp đồng như sau:',
    'r_stt': '', 'r_nd': '', 'r_tinh': '', 'r_sl': '', 'r_dg': '', 'r_tt': '',
    'tong_nhan': 'TỔNG GIÁ TRỊ HỢP ĐỒNG', 'tong': '……………', 'bang_chu': D * 3,
    'thoi_han_tt': 'Bên A thanh toán 100% giá trị hợp đồng cho Bên B trong vòng …… ngày làm việc kể từ ngày Bên B bàn giao đầy đủ hồ sơ nghiệm thu khóa học.',
    'phat': 'Nếu Bên A chậm thanh toán quá thời hạn trên, Bên A chịu phạt ……% trên số tiền chậm trả cho mỗi ngày chậm, tổng mức phạt không vượt quá ……% giá trị hợp đồng.',
    'ngay_ban_giao': '05 (năm)', 'noi_ngay_pl': '……, ngày …… tháng …… năm 20……',
}


def set_font(run, size=13, bold=False, italic=False):
    run.font.name = 'Times New Roman'; run.font.size = Pt(size); run.bold = bold; run.italic = italic
    rpr = run._element.get_or_add_rPr(); rf = rpr.find(qn('w:rFonts'))
    if rf is None:
        rf = OxmlElement('w:rFonts'); rpr.append(rf)
    for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
        rf.set(qn(a), 'Times New Roman')


def set_widths(table, widths):
    table.autofit = False
    for row in table.rows:
        tcs = row._tr.findall(qn('w:tc'))
        if len(tcs) != len(widths):
            continue
        for tc, w in zip(tcs, widths):
            tcpr = tc.get_or_add_tcPr(); tw = tcpr.find(qn('w:tcW'))
            if tw is None:
                tw = OxmlElement('w:tcW'); tcpr.insert(0, tw)
            tw.set(qn('w:w'), str(int(w.twips if hasattr(w, 'twips') else w / 635))); tw.set(qn('w:type'), 'dxa')
    grid = table._tbl.tblGrid
    for gc, w in zip(grid.findall(qn('w:gridCol')), widths):
        gc.set(qn('w:w'), str(int(w.twips if hasattr(w, 'twips') else w / 635)))


def para(doc_or_cell, parts, align=None, before=0, after=4, line=1.15, indent=None, keep=False):
    p = doc_or_cell.add_paragraph()
    pf = p.paragraph_format; pf.space_before = Pt(before); pf.space_after = Pt(after); pf.line_spacing = line
    if indent is not None: pf.first_line_indent = Cm(indent)
    if keep: pf.keep_with_next = True
    if align: p.alignment = align
    if isinstance(parts, str): parts = [(parts, {})]
    for text, st in parts:
        r = p.add_run(text); set_font(r, st.get('size', 13), st.get('b', False), st.get('i', False))
    return p


class Builder:
    def __init__(self, token_mode):
        self.tok = token_mode

    def T(self, key):
        return '{{%s}}' % key if self.tok else BLANKS[key]

    def build(self):
        T = self.T
        doc = Document()
        sec = doc.sections[0]
        sec.page_width, sec.page_height = Cm(21), Cm(29.7)
        sec.left_margin, sec.right_margin, sec.top_margin, sec.bottom_margin = Cm(2.5), Cm(1.8), Cm(1.8), Cm(1.8)
        st = doc.styles['Normal']; st.font.name = 'Times New Roman'; st.font.size = Pt(13)
        C, J, R = WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.JUSTIFY, WD_ALIGN_PARAGRAPH.RIGHT
        para(doc, [('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', {'b': True})], C, after=0)
        para(doc, [('Độc lập – Tự do – Hạnh phúc', {'b': True})], C, after=0)
        para(doc, '———————————', C, after=10)
        para(doc, [(T('tieu_de'), {'b': True, 'size': 16})], C, after=0)
        para(doc, [('HUẤN LUYỆN AN TOÀN, VỆ SINH LAO ĐỘNG', {'b': True, 'size': 14})], C, after=2)
        para(doc, [('Số: ', {}), (T('so_hd'), {'b': True})], C, after=10)
        for t in ['Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;', 'Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/6/2005;',
                  'Căn cứ Luật An toàn, vệ sinh lao động số 84/2015/QH13 ngày 25/6/2015;',
                  'Căn cứ Nghị định số 44/2016/NĐ-CP ngày 15/5/2016 của Chính phủ quy định chi tiết một số điều của Luật An toàn, vệ sinh lao động về hoạt động kiểm định kỹ thuật an toàn lao động, huấn luyện an toàn, vệ sinh lao động và quan trắc môi trường lao động; Nghị định số 140/2018/NĐ-CP ngày 08/10/2018 sửa đổi, bổ sung các Nghị định liên quan;',
                  'Căn cứ nhu cầu và năng lực thực tế của hai bên.']:
            para(doc, [('- ' + t, {'i': True})], J, after=1)
        para(doc, [('Hôm nay, ngày ', {}), (T('d'), {}), (' tháng ', {}), (T('m'), {}), (' năm ', {}), (T('y'), {}), (', chúng tôi gồm:', {})], J, before=6, after=4)
        # Bên A
        para(doc, [('BÊN THUÊ DỊCH VỤ (gọi tắt là Bên A): ', {'b': True}), (T('a_ten_hoa'), {'b': True})], J, after=1)
        for lab, k in [('Địa chỉ', 'a_dia_chi'), ('Điện thoại', 'a_dt'), ('Mã số thuế', 'a_mst'), ('Email', 'a_email')]:
            para(doc, [(f'- {lab}: ', {}), (T(k), {})], after=1)
        para(doc, [('- Đại diện: ', {}), (T('a_dai_dien'), {}), ('    Chức vụ: ', {}), (T('a_chuc_vu'), {})], after=4)
        # Bên B
        para(doc, [('BÊN CUNG CẤP DỊCH VỤ (gọi tắt là Bên B): ', {'b': True}), (T('b_ten_hoa'), {'b': True})], J, after=1)
        for lab, k in [('Địa chỉ', 'b_dia_chi'), ('Điện thoại', 'b_dt'), ('Mã số thuế', 'b_mst')]:
            para(doc, [(f'- {lab}: ', {}), (T(k), {})], after=1)
        para(doc, [('- Tài khoản số: ', {}), (T('b_stk'), {}), (' tại Ngân hàng ', {}), (T('b_ngan_hang'), {})], after=1)
        para(doc, [('- Đại diện: ', {}), (T('b_dai_dien'), {}), ('    Chức vụ: ', {}), (T('b_chuc_vu'), {})], after=6)
        para(doc, 'Sau khi bàn bạc, hai bên thống nhất ký kết Hợp đồng dịch vụ huấn luyện an toàn, vệ sinh lao động với các điều khoản sau:', J, after=6)
        H = lambda t: para(doc, [(t, {'b': True})], J, before=6, after=3, keep=True)
        # Điều 1
        H('ĐIỀU 1. NỘI DUNG, THỜI GIAN VÀ ĐỊA ĐIỂM HUẤN LUYỆN')
        para(doc, 'Bên A đồng ý thuê và Bên B đồng ý nhận huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) cho người lao động của Bên A theo danh sách tại Phụ lục 01 của Hợp đồng này:', J, after=2)
        para(doc, [('- Đối tượng huấn luyện: ', {}), (T('nhom'), {})], J, after=1)
        para(doc, [('- Số học viên: ', {}), (T('so_hv'), {})], J, after=1)
        para(doc, '- Chương trình huấn luyện: đầy đủ nội dung, thời lượng theo chương trình khung của từng nhóm quy định tại Nghị định số 44/2016/NĐ-CP (huấn luyện định kỳ tối thiểu bằng 50% thời gian huấn luyện lần đầu).', J, after=1)
        para(doc, [('- Thời gian: ', {}), (T('thoi_gian'), {})], J, after=1)
        para(doc, [('- Địa điểm: ', {}), (T('dia_diem'), {})], J, after=1)
        para(doc, [('- Hình thức: ', {}), (T('hinh_thuc'), {})], J, after=2)
        # Điều 2
        H('ĐIỀU 2. TRÁCH NHIỆM CỦA BÊN A')
        for t in ['Cung cấp danh sách học viên (họ tên, ngày sinh, số CCCD, chức vụ/công việc, nhóm huấn luyện), 02 ảnh 3x4 và bản sao CCCD của học viên được cấp Giấy chứng nhận/Thẻ an toàn cho Bên B trước ngày khai giảng ít nhất 03 ngày làm việc.',
                  'Bố trí thời gian, thông báo cho học viên tham dự đầy đủ, đúng giờ; phối hợp quản lý lớp học.',
                  'Thanh toán đầy đủ, đúng hạn giá trị hợp đồng theo Điều 4.']:
            para(doc, '- ' + t, J, after=1)
        # Điều 3
        H('ĐIỀU 3. TRÁCH NHIỆM CỦA BÊN B')
        for t in ['Bảo đảm đủ điều kiện hoạt động huấn luyện ATVSLĐ theo quy định; bố trí giảng viên đủ tiêu chuẩn theo Nghị định số 44/2016/NĐ-CP.',
                  'Biên soạn tài liệu, tổ chức giảng dạy đúng nội dung, đủ thời lượng; điểm danh, kiểm tra sát hạch cuối khóa.',
                  'Ban hành Quyết định công nhận kết quả huấn luyện; cấp Giấy chứng nhận (Nhóm 1, 2, 5, 6), phôi Thẻ an toàn (Nhóm 3) và lập Sổ theo dõi (Nhóm 4) cho học viên đạt yêu cầu.',
                  'Bàn giao đầy đủ hồ sơ khóa học cho Bên A theo Điều 5.']:
            para(doc, '- ' + t, J, after=1)
        # Điều 4
        H('ĐIỀU 4. GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN')
        para(doc, [('4.1. ', {'b': True}), (T('gia_tri_cau'), {})], J, after=3)
        tb = doc.add_table(rows=3, cols=6); tb.style = 'Table Grid'; tb.alignment = WD_TABLE_ALIGNMENT.CENTER
        widths = [Cm(1.3), Cm(5.8), Cm(2.2), Cm(1.8), Cm(2.6), Cm(2.9)]
        hdr = ['STT', 'Nội dung huấn luyện', 'Tính theo', 'Số lượng', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)']
        for i, h in enumerate(hdr):
            c = tb.rows[0].cells[i]; c.width = widths[i]; c.paragraphs[0].text = ''
            r = c.paragraphs[0].add_run(h); set_font(r, 12, True); c.paragraphs[0].alignment = C
        row = tb.rows[1]
        keys = ['r_stt', 'r_nd', 'r_tinh', 'r_sl', 'r_dg', 'r_tt']
        aligns = [C, None, C, C, R, R]
        for i, k in enumerate(keys):
            c = row.cells[i]; c.width = widths[i]; p = c.paragraphs[0]
            r = p.add_run(T(k) if self.tok else ''); set_font(r, 12)
            if aligns[i]: p.alignment = aligns[i]
        tot = tb.rows[2]
        merged = tot.cells[0].merge(tot.cells[4])
        merged.paragraphs[0].text = ''; r = merged.paragraphs[0].add_run(T('tong_nhan')); set_font(r, 12, True); merged.paragraphs[0].alignment = R
        p = tot.cells[5].paragraphs[0]; r = p.add_run(T('tong')); set_font(r, 12, True); p.alignment = R
        if not self.tok:  # bản điền tay: thêm 3 dòng trống
            for n in range(2):
                newr = tb.add_row()
                tb._tbl.remove(newr._tr); tb.rows[1]._tr.addnext(newr._tr)
            for i in range(1, 4):
                tb.rows[i].cells[0].paragraphs[0].text = ''
                r = tb.rows[i].cells[0].paragraphs[0].add_run(str(i)); set_font(r, 12); tb.rows[i].cells[0].paragraphs[0].alignment = C
        set_widths(tb, widths)
        para(doc, [('Bằng chữ: ', {'i': True}), (T('bang_chu'), {'i': True})], J, before=4, after=2)
        para(doc, 'Giá trên đã bao gồm chi phí giảng viên, tài liệu học tập, kiểm tra sát hạch, cấp Giấy chứng nhận/phôi Thẻ an toàn/Sổ theo dõi và quyết định công nhận kết quả huấn luyện. Dịch vụ huấn luyện ATVSLĐ thuộc đối tượng không chịu thuế GTGT.', J, after=3)
        para(doc, [('4.2. Phương thức thanh toán: ', {'b': True}), ('chuyển khoản vào tài khoản của Bên B nêu tại phần đầu Hợp đồng.', {})], J, after=1)
        para(doc, [('4.3. Thời hạn thanh toán: ', {'b': True}), (T('thoi_han_tt'), {})], J, after=1)
        para(doc, [('4.4. Phạt chậm thanh toán: ', {'b': True}), (T('phat'), {})], J, after=2)
        # Điều 5
        H('ĐIỀU 5. HỒ SƠ NGHIỆM THU VÀ BÀN GIAO')
        para(doc, [('Trong vòng ', {}), (T('ngay_ban_giao'), {}), (' ngày làm việc kể từ ngày kết thúc khóa huấn luyện, Bên B bàn giao cho Bên A 01 bộ hồ sơ gồm:', {})], J, after=1)
        for t in ['Danh sách điểm danh học viên có chữ ký; hình ảnh tổ chức lớp học;', 'Biên bản tổng hợp kết quả kiểm tra sát hạch;',
                  'Quyết định công nhận kết quả huấn luyện kèm danh sách học viên đạt yêu cầu;',
                  'Giấy chứng nhận huấn luyện / phôi Thẻ an toàn / Sổ theo dõi huấn luyện của học viên đạt yêu cầu;',
                  'Biên bản nghiệm thu, bàn giao hồ sơ khóa học có xác nhận của hai bên.']:
            para(doc, '- ' + t, J, after=1)
        # Điều 6
        H('ĐIỀU 6. ĐIỀU KHOẢN CHUNG')
        for t in ['Hai bên cam kết thực hiện đúng các điều khoản của Hợp đồng. Mọi sửa đổi, bổ sung phải lập thành phụ lục bằng văn bản có chữ ký, đóng dấu của đại diện hai bên.',
                  'Tranh chấp phát sinh được ưu tiên giải quyết bằng thương lượng; không thỏa thuận được thì đưa ra Tòa án nhân dân có thẩm quyền giải quyết.',
                  'Hợp đồng có hiệu lực kể từ ngày ký và tự động thanh lý khi hai bên hoàn thành nghĩa vụ bàn giao hồ sơ và thanh toán.',
                  'Hợp đồng lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.']:
            para(doc, '- ' + t, J, after=1)
        sig = doc.add_table(rows=1, cols=2); sig.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, (h, n) in enumerate([('ĐẠI DIỆN BÊN A', 'a_ky'), ('ĐẠI DIỆN BÊN B', 'b_ky')]):
            c = sig.rows[0].cells[i]; p = c.paragraphs[0]; p.alignment = C
            p.paragraph_format.space_before = Pt(12)
            r = p.add_run(h); set_font(r, 13, True)
            p2 = c.add_paragraph(); p2.alignment = C; r = p2.add_run('(Ký, ghi rõ họ tên và đóng dấu)'); set_font(r, 12, italic=True)
            p3 = c.add_paragraph(); p3.alignment = C; p3.paragraph_format.space_before = Pt(64); r = p3.add_run(T(n)); set_font(r, 13, True)
        # Phụ lục 01
        pb = doc.add_paragraph(); pb.add_run().add_break(WD_BREAK.PAGE)
        para(doc, [('PHỤ LỤC 01 – DANH SÁCH HỌC VIÊN', {'b': True, 'size': 14})], C, after=0)
        para(doc, [('(Kèm theo Hợp đồng số ', {'i': True}), (T('so_hd'), {'i': True}), (')', {'i': True})], C, after=8)
        cols = ['STT', 'Họ và tên', 'Ngày sinh', 'Số CCCD', 'Chức vụ / công việc', 'Nhóm', 'Ghi chú']
        wl = [Cm(1.3), Cm(4.4), Cm(2.4), Cm(3.0), Cm(3.2), Cm(1.4), Cm(1.6)]
        st2 = doc.add_table(rows=16, cols=7); st2.style = 'Table Grid'; st2.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, h in enumerate(cols):
            c = st2.rows[0].cells[i]; c.width = wl[i]; r = c.paragraphs[0].add_run(h); set_font(r, 12, True); c.paragraphs[0].alignment = C
        for n in range(1, 16):
            c = st2.rows[n].cells[0]; r = c.paragraphs[0].add_run(str(n)); set_font(r, 12); c.paragraphs[0].alignment = C
        set_widths(st2, wl)
        para(doc, [(T('noi_ngay_pl'), {'i': True})], R, before=10, after=0)
        para(doc, [('ĐẠI DIỆN BÊN A', {'b': True})], R, after=0)
        para(doc, [('(Ký, ghi rõ họ tên và đóng dấu)', {'i': True, 'size': 12})], R, after=0)
        buf = io.BytesIO(); doc.save(buf)
        return buf.getvalue()


def main():
    blank = Builder(False).build()
    with open(OUT_DOCX, 'wb') as fh:
        fh.write(blank)
    tok = Builder(True).build()
    with open(OUT_JS, 'w', encoding='utf8') as fh:
        fh.write('/* Mẫu Hợp đồng huấn luyện ATVSLĐ (DAKO – khách hàng) có ô dữ liệu – tạo tự động bởi tools/hdkh_template.py, không sửa tay. */\n')
        fh.write('const HDKH_TPL = {\n  blanks: ' + json.dumps(BLANKS, ensure_ascii=False) + ',\n')
        fh.write("  b64: '" + base64.b64encode(tok).decode('ascii') + "',\n};\n")
    print('OK', OUT_DOCX, len(blank), 'byte;', OUT_JS)


if __name__ == '__main__':
    main()
