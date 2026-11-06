#!/usr/bin/env python3
"""Dựng 2 file mẫu Word có trường điền {{...}} từ file hợp đồng nguyên tắc gốc (.doc) của DAKO.

    mau/mau-hop-dong-nguyen-tac.docx  – hợp đồng nguyên tắc (nội dung giữ nguyên bản gốc)
    mau/mau-phu-luc.docx              – phụ lục bảng phí dịch vụ cho từng khóa (cùng định dạng)

Chỉ cần chạy lại khi thay file gốc:
    python3 hop-dong-nguyen-tac/tao_mau.py [file_goc.doc]

Định dạng (font Times New Roman, cỡ chữ, giãn dòng, thụt lề, bảng tiêu đề...) lấy trực tiếp từ
file gốc. Lề trang ghi lại đúng số đo của file gốc (xem LE_GOC).
"""
import copy
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import docx
from docx.oxml.ns import qn

THU_MUC = Path(__file__).resolve().parent
GOC = THU_MUC / "mau" / "MAU-HOP-DONG-NGUYEN-TAC-DAKO-goc.doc"
MAU_HD = THU_MUC / "mau" / "mau-hop-dong-nguyen-tac.docx"
MAU_PL = THU_MUC / "mau" / "mau-phu-luc.docx"

# Lề trang của file gốc, đọc từ thuộc tính section trong file .doc (đơn vị twip, 567 twip = 1 cm):
# trên 0 cm, dưới 0,75 cm, trái 1,47 cm, phải 1,75 cm, đầu trang/chân trang cách mép 0,9 cm. Khổ A4.
LE_GOC = {"top": "0", "bottom": "426", "left": "836", "right": "990",
          "header": "510", "footer": "510", "gutter": "0"}

XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"


# ---------------------------------------------------------------- tiện ích XML
def cac_t(el):
    return el.findall(".//" + qn("w:t"))


def van_ban(el):
    return "".join(t.text or "" for t in cac_t(el))


def dat_t(t, s):
    t.text = s
    t.set(XML_SPACE, "preserve")


def cac_run(p):
    return p.findall(qn("w:r"))


def xoa(el):
    el.getparent().remove(el)


def chi_giu_run_dau(p, text):
    """Giữ định dạng run đầu tiên, đặt nội dung mới, xóa các run còn lại."""
    runs = cac_run(p)
    r0 = runs[0]
    for con in list(r0):
        if con.tag != qn("w:rPr"):
            r0.remove(con)
    t = r0.makeelement(qn("w:t"), {})
    dat_t(t, text)
    r0.append(t)
    for r in runs[1:]:
        xoa(r)
    return p


def them_kieu_chu(p, dam=False, nghieng=False):
    """Thêm đậm/nghiêng cho chữ của đoạn (run đầu tiên, không phải dấu đoạn)."""
    rpr = p.find(qn("w:r")).find(qn("w:rPr"))
    for tag, bat in (("w:i", nghieng), ("w:b", dam)):
        if bat and rpr.find(qn(tag)) is None:
            vt = 1 if rpr.find(qn("w:rStyle")) is not None else 0
            vt += 1 if rpr.find(qn("w:rFonts")) is not None else 0
            rpr.insert(vt, rpr.makeelement(qn(tag), {}))
    return p


def bo_dam_nghieng(rpr, bo_dam=False, bo_nghieng=False):
    for tag, bo in (("w:b", bo_dam), ("w:bCs", bo_dam), ("w:i", bo_nghieng), ("w:iCs", bo_nghieng)):
        if bo:
            for e in rpr.findall(qn(tag)):
                rpr.remove(e)


def giu_voi_doan_sau(p):
    """Bật 'Keep with next' – không làm đổi hình thức, chỉ tránh tiêu đề/chữ ký bị tách sang trang."""
    ppr = p.find(qn("w:pPr"))
    if ppr.find(qn("w:keepNext")) is None:
        k = ppr.makeelement(qn("w:keepNext"), {})
        ppr.insert(1 if ppr.find(qn("w:pStyle")) is not None else 0, k)
    return p


def chen_sau(moc, moi):
    moc.addnext(moi)
    return moi


def tim_p(body, text):
    for el in body.iterchildren(qn("w:p")):
        if van_ban(el).strip() == text:
            return el
    raise SystemExit(f"Không tìm thấy đoạn: {text!r}")


# ---------------------------------------------------------------- chuyển .doc -> .docx
def doi_sang_docx(goc: Path, tmp: Path) -> Path:
    subprocess.run(["soffice", f"-env:UserInstallation=file://{tmp}/lo", "--headless",
                    "--convert-to", "docx", "--outdir", str(tmp), str(goc)],
                   check=True, capture_output=True, timeout=180)
    out = tmp / (goc.stem + ".docx")
    if not out.exists():
        raise SystemExit("LibreOffice không chuyển được file gốc sang .docx")
    return out


def lam_sach_font(path: Path):
    """LibreOffice ghi tên font kiểu 'SimSun;宋体' và font mặc định của nó (Liberation Serif) –
    đưa về đúng tên font Word, mặc định Times New Roman như file gốc."""
    tmp = path.with_suffix(".tmp")
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.startswith("word/") and item.filename.endswith(".xml"):
                s = data.decode("utf-8")
                s = re.sub(r'(w:(?:ascii|hAnsi|eastAsia|cs|name)=")([^";]+);[^"]*(")', r"\1\2\3", s)
                if item.filename == "word/styles.xml":
                    s = re.sub(r"<w:rPrDefault><w:rPr><w:rFonts [^>]*/>",
                               '<w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" '
                               'w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" '
                               'w:cs="Times New Roman"/>', s, count=1)
                    s = s.replace('w:bidi="hi-IN"', 'w:bidi="ar-SA"')
                if item.filename == "word/numbering.xml":
                    # đúng thứ tự phần tử theo chuẩn OOXML (Word kén thứ tự): numFmt đứng trước pStyle
                    s = re.sub(r'(<w:pStyle w:val="[^"]*"/>)(<w:numFmt [^>]*/>)', r"\2\1", s)
                data = s.encode("utf-8")
            if item.filename == "_rels/.rels":
                # LibreOffice ghi sai URI quan hệ core-properties -> python-docx tạo trùng docProps/core.xml
                data = data.replace(
                    b"http://schemas.openxmlformats.org/officedocument/2006/relationships/metadata/core-properties",
                    b"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties")
            if item.filename.endswith("/"):
                continue
            zout.writestr(item, data)
    tmp.replace(path)


# ---------------------------------------------------------------- mẫu hợp đồng
def dung_mau_hop_dong(src: Path):
    d = docx.Document(str(src))
    body = d.element.body
    els = list(body.iterchildren())

    # Lề trang đúng như file gốc
    pg = body.find(qn("w:sectPr")).find(qn("w:pgMar"))
    for k in list(pg.attrib):
        del pg.attrib[k]
    for k, v in LE_GOC.items():
        pg.set(qn("w:" + k), v)

    # Số hợp đồng: "Số: 01/2026/HĐĐT/HKM-DAKO"
    p = tim_p(body, "Số: 01/2026/HĐĐT/HKM-DAKO")
    runs = cac_run(p)
    dat_t(cac_t(runs[1])[0], "{{SO_HD}}")
    for r in runs[2:]:
        xoa(r)

    p = tim_p(body, "Hôm nay, ngày 01 tháng 10 năm 2026, chúng tôi gồm:")
    dat_t(cac_t(p)[0], "Hôm nay, {{NGAY_KY_CHU}}, chúng tôi gồm:")

    # ---- Bên A (đối tác)
    p = tim_p(body, "BÊN A\t: CÔNG TY CỔ PHẦN GIẢI PHÁP TOÀN DIỆN HKM".replace("\t", ""))
    dat_t(cac_t(p)[1], ": {{A_TEN}}")

    p_dc = [e for e in els if van_ban(e).startswith("Địa chỉ") and "183" in van_ban(e)][0]
    dat_t(cac_t(p_dc)[3], "{{A_DIA_CHI}}")

    p_mst = [e for e in els if van_ban(e).startswith("Mã số thuế") and "0316805882" in van_ban(e)][0]
    dat_t(cac_t(p_mst)[2], " {{A_MST}}")

    p_dd = [e for e in els if van_ban(e).startswith("Do Ông (Bà)")][0]
    ts = cac_t(p_dd)
    dat_t(ts[0], "Do {{A_XUNG_HO}}")
    dat_t(ts[1], ": {{A_DAI_DIEN}}       Chức vụ: {{A_CHUC_VU}}")

    # Các dòng tùy chọn của Bên A (tự xóa khi không có thông tin): điện thoại, email, tài khoản
    def dong_tuy_chon(nhan, khoa):
        moi = copy.deepcopy(p_mst)
        ts = cac_t(moi)
        dat_t(ts[0], nhan)
        dat_t(ts[2], " {{?" + khoa + "}}")
        bo_dam_nghieng(ts[2].getparent().find(qn("w:rPr")), bo_dam=True)
        return moi

    moc = chen_sau(p_dc, dong_tuy_chon("Điện thoại", "A_DIEN_THOAI"))
    chen_sau(moc, dong_tuy_chon("Email", "A_EMAIL"))
    chen_sau(p_mst, dong_tuy_chon("Tài khoản", "A_TAI_KHOAN"))

    # ---- Bên B (DAKO)
    p = [e for e in els if van_ban(e).startswith("BÊN B")][0]
    dat_t(cac_t(p)[2], "{{B_TEN}}")
    p = [e for e in els if van_ban(e).startswith("Địa chỉ") and "D9" in van_ban(e)][0]
    dat_t(cac_t(p)[1], ": {{B_DIA_CHI}}")
    p = [e for e in els if van_ban(e).startswith("Điện thoại") and "0827" in van_ban(e)][0]
    dat_t(cac_t(p)[1], ": {{B_DIEN_THOAI}}")
    p = tim_p(body, "Mã số thuế: 0313642407")
    dat_t(cac_t(p)[0], "Mã số thuế: {{B_MST}}")
    p = tim_p(body, "Có tài khoản số: 19130009928016 Ngân hàng Techcombank")
    dat_t(cac_t(p)[0], "Có tài khoản số: {{B_TAI_KHOAN}}")
    p = [e for e in els if van_ban(e).startswith("ĐẠI DIỆN:")][0]
    dat_t(cac_t(p)[1], "  {{B_DAI_DIEN}}    Chức vụ: {{B_CHUC_VU}}")

    # ---- Điều 2: danh sách khóa huấn luyện
    p = tim_p(body, "Huấn luyện an toàn vệ sinh lao động.")
    dat_t(cac_t(p)[0], "{{DS_KHOA_HOC}}")
    for ten in ("Huấn luyện an toàn hóa chất.", "Huấn luyện an toàn điện.",
                "Huấn luyện sơ cứu, cấp cứu tại nơi làm việc."):
        xoa(tim_p(body, ten))

    # ---- Bảng chữ ký
    dung_bang_chu_ky(body.findall(qn("w:tbl"))[-1])

    # Số trang lưu sẵn trong chân trang (Word tự tính lại khi mở)
    for ft in d.sections[0].footer.part.element.iter(qn("w:t")):
        if ft.text and ft.text.strip().isdigit():
            ft.text = "1"

    cp = d.core_properties
    cp.author = "CÔNG TY CỔ PHẦN KỸ THUẬT HÀNG HẢI DAKO"
    cp.last_modified_by = cp.author
    cp.title = "Hợp đồng nguyên tắc"
    cp.comments = "Mẫu có trường {{...}} – dùng với tao_hop_dong.py"
    return d


def dung_bang_chu_ky(tbl):
    # Khối chữ ký không bị cắt ngang trang và luôn đi cùng đoạn văn ngay trước nó
    trpr = tbl.find(".//" + qn("w:trPr"))
    trpr.append(trpr.makeelement(qn("w:cantSplit"), {}))
    giu_voi_doan_sau(tbl.getprevious())
    o_a, o_b = tbl.findall(".//" + qn("w:tc"))
    pa = o_a.findall(qn("w:p"))
    pb = o_b.findall(qn("w:p"))
    # Bên B: ĐẠI DIỆN BÊN B / GIÁM ĐỐC / (trống) / (trống) / PHẠM THỊ THU THANH / (trống)
    chi_giu_run_dau(pb[1], "{{B_CHUC_VU_HOA}}")
    dat_t(cac_t(pb[4])[0], "{{B_DAI_DIEN_HOA}}")
    # Bên A: ĐẠI DIỆN BÊN A / (trống) / (trống) / (trống) / LÊ ĐỨC KHẢI
    # -> điền chức vụ vào dòng trống đầu (giống cột Bên B) để chức vụ, họ tên hai bên thẳng hàng
    chuc_vu_a = copy.deepcopy(pb[1])
    dat_t(cac_t(chuc_vu_a)[0], "{{A_CHUC_VU_HOA}}")
    pa[1].addprevious(chuc_vu_a)
    xoa(pa[1])
    ten_a = next(p for p in pa if van_ban(p).strip() == "LÊ ĐỨC KHẢI")
    dat_t(cac_t(ten_a)[0], "{{A_DAI_DIEN_HOA}}")
    ten_a.addnext(copy.deepcopy(pb[5]))


# ---------------------------------------------------------------- mẫu phụ lục
def dung_mau_phu_luc(mau_hd: Path):
    """Phụ lục dựng hoàn toàn từ các đoạn của hợp đồng (sao chép định dạng), chỉ thay chữ."""
    d = docx.Document(str(mau_hd))
    body = d.element.body
    els = [e for e in body.iterchildren() if e.tag != qn("w:sectPr")]

    def lay(text=None, bat_dau=None):
        for e in els:
            v = van_ban(e)
            if (text is not None and v.strip() == text) or (bat_dau and v.startswith(bat_dau)):
                return copy.deepcopy(e)
        raise SystemExit(f"Không tìm thấy: {text or bat_dau}")

    bang_tieu_de = copy.deepcopy(els[0])
    dong_trong = copy.deepcopy(els[1])
    tieu_de = chi_giu_run_dau(lay("HỢP ĐỒNG NGUYÊN TẮC"), "PHỤ LỤC HỢP ĐỒNG SỐ {{SO_PL}}")

    kem_theo = chi_giu_run_dau(lay("Số: {{SO_HD}}"),
                               "(Kèm theo Hợp đồng nguyên tắc số {{SO_HD}} ký ngày {{NGAY_HD}})")
    them_kieu_chu(kem_theo, nghieng=True)

    vv = chi_giu_run_dau(lay("Số: {{SO_HD}}"), "V/v: Bảng phí dịch vụ {{TEN_KHOA_THUONG}}")
    them_kieu_chu(vv, dam=True)

    can_cu = lay("Căn cứ:")
    can_cu_ds = chi_giu_run_dau(lay(bat_dau="Căn cứ Luật Thương mại"), "{{DS_CAN_CU}}")
    hom_nay = lay("Hôm nay, {{NGAY_KY_CHU}}, chúng tôi gồm:")
    dat_t(cac_t(hom_nay)[0], "Hôm nay, {{NGAY_PL_CHU}}, chúng tôi gồm:")

    # Thông tin hai bên: từ dòng "BÊN A" tới dòng "ĐẠI DIỆN:" của Bên B
    i0 = next(i for i, e in enumerate(els) if van_ban(e).startswith("BÊN A"))
    i1 = next(i for i, e in enumerate(els) if van_ban(e).startswith("ĐẠI DIỆN:"))
    hai_ben = [copy.deepcopy(e) for e in els[i0:i1 + 1]]

    mo_dau = chi_giu_run_dau(lay(bat_dau="Hai bên nhất trí ký hợp đồng"),
                             "Hai bên thống nhất ký kết Phụ lục hợp đồng số {{SO_PL}} với các nội dung sau:")

    tieu_de_dieu = lay("ĐIỀU 2. ĐỐI TƯỢNG HỢP ĐỒNG")
    doan_thuong = lay("Phối hợp triển khai dịch vụ huấn luyện:")
    gach_dau = lay("{{DS_KHOA_HOC}}")

    def dieu(text):
        return giu_voi_doan_sau(chi_giu_run_dau(copy.deepcopy(tieu_de_dieu), text))

    def doan(text):
        return chi_giu_run_dau(copy.deepcopy(doan_thuong), text)

    def gach(text):
        return chi_giu_run_dau(copy.deepcopy(gach_dau), text)

    nhan_ghi_chu = doan("{{?NHAN_GHI_CHU}}")
    them_kieu_chu(nhan_ghi_chu, dam=True, nghieng=True)
    giu_voi_doan_sau(nhan_ghi_chu)

    noi_dung = [
        bang_tieu_de, dong_trong, tieu_de, kem_theo, vv,
        can_cu, can_cu_ds, hom_nay, *hai_ben, mo_dau,
        dieu("ĐIỀU 1. NỘI DUNG VÀ CHI PHÍ TỪNG LỚP HUẤN LUYỆN"),
        giu_voi_doan_sau(doan("{{MO_TA_DIEU_1}}")),
        doan("{{BANG_CHI_PHI}}"),
        nhan_ghi_chu,
        gach("{{DS_GHI_CHU}}"),
        dieu("ĐIỀU {{D_SO}}. {{D_TIEU_DE}}"),
        gach("{{D_NOI_DUNG}}"),
        copy.deepcopy(body.findall(qn("w:tbl"))[-1]),   # bảng chữ ký
        copy.deepcopy(els[-1]),                          # đoạn trống cuối
    ]
    for e in els:
        xoa(e)
    sect = body.find(qn("w:sectPr"))
    for e in noi_dung:
        sect.addprevious(e)
    d.core_properties.title = "Phụ lục hợp đồng nguyên tắc – Bảng phí dịch vụ"
    return d


def main():
    goc = Path(sys.argv[1]) if len(sys.argv) > 1 else GOC
    with tempfile.TemporaryDirectory() as tmp:
        src = doi_sang_docx(goc, Path(tmp))
        lam_sach_font(src)
        dung_mau_hop_dong(src).save(str(MAU_HD))
    dung_mau_phu_luc(MAU_HD).save(str(MAU_PL))
    print("Đã tạo:", MAU_HD.relative_to(THU_MUC.parent))
    print("Đã tạo:", MAU_PL.relative_to(THU_MUC.parent))


if __name__ == "__main__":
    main()
