#!/usr/bin/env python3
"""Tạo HỢP ĐỒNG NGUYÊN TẮC + PHỤ LỤC (bảng phí từng lớp cho mỗi khóa) giữa DAKO và một đối tác.

Đầu vào : file thông tin đối tác, ví dụ hop-dong-nguyen-tac/doi-tac/hkm.json (xem README.md)
Đầu ra  : file Word .docx giữ nguyên định dạng mẫu gốc, lưu ở hop-dong-nguyen-tac/ket-qua/<VIET_TAT>/

    python3 hop-dong-nguyen-tac/tao_hop_dong.py hop-dong-nguyen-tac/doi-tac/hkm.json
    ... --tach              mỗi văn bản (hợp đồng, từng phụ lục) một file riêng
    ... --chi-phu-luc       chỉ xuất phụ lục (khi bổ sung khóa mới cho đối tác đã ký)
    ... --phu-luc 2,3       chỉ xuất các phụ lục số 2 và 3
    ... --khong-phu-luc     chỉ xuất hợp đồng
    ... --pdf               xuất thêm bản PDF để xem nhanh
"""
import argparse
import copy
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from datetime import date, datetime
from pathlib import Path

import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from tao_mau import (MAU_HD, MAU_PL, THU_MUC, cac_t, chi_giu_run_dau, giu_voi_doan_sau, them_kieu_chu,
                     van_ban, xoa)

CAU_HINH = THU_MUC / "cau-hinh-mac-dinh.json"
TRUONG = re.compile(r"\{\{(\??)([A-Z0-9_]+)\}\}")
CHAM = "................"          # ô để trống cho điền tay
RONG_BANG = 9950                   # bằng chiều rộng bảng chữ ký của mẫu gốc (twip)


class Loi(Exception):
    pass


# ================================================================ dữ liệu
def doc_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise Loi(f"File {path} sai cú pháp JSON: {e}")


def chuan_ngay(s):
    s = str(s).strip()
    for f in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(s, f).date()
        except ValueError:
            pass
    raise Loi(f"Ngày '{s}' không đúng dạng ngày/tháng/năm (ví dụ 01/10/2026)")


def ngay_so(d: date):
    return f"{d.day:02d}/{d.month:02d}/{d.year}"


def ngay_chu(d: date):
    return f"ngày {d.day:02d} tháng {d.month:02d} năm {d.year}"


def hoa(s):
    return (s or "").upper()


def thuong_chu_dau(s):
    """'Huấn luyện an toàn điện' -> 'huấn luyện an toàn điện' (giữ nguyên nếu mở đầu bằng chữ viết tắt)."""
    if len(s) > 1 and s[0].isupper() and s[1].islower():
        return s[0].lower() + s[1:]
    return s


def khong_dau(s):
    s = s.replace("Đ", "D").replace("đ", "d")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-")


def dien_chuoi(s, v):
    """Thay {KHOA} trong câu chữ cấu hình bằng giá trị (khóa lạ giữ nguyên)."""
    return re.sub(r"\{([A-Z0-9_]+)\}", lambda m: str(v.get(m.group(1), m.group(0))), s)


def so_nguyen(x):
    if x is None or x == "":
        return None
    if isinstance(x, bool):
        return None
    if isinstance(x, (int, float)):
        return int(round(x))
    s = re.sub(r"(?i)(vnđ|vnd|đồng|đ|\s)", "", str(x)).replace(".", "").replace(",", "")
    return int(s) if s.isdigit() else None


def tien(n):
    return f"{n:,}".replace(",", ".")


# ---------------------------------------------------------------- số thành chữ
_SO = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
_DV = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]


def _ba_so(n, day_du):
    tram, chuc, dv = n // 100, n // 10 % 10, n % 10
    w = []
    if day_du or tram:
        w += [_SO[tram], "trăm"]
    if chuc == 0:
        if dv and (day_du or tram):
            w.append("linh")
    elif chuc == 1:
        w.append("mười")
    else:
        w += [_SO[chuc], "mươi"]
    if dv:
        if dv == 1 and chuc > 1:
            w.append("mốt")
        elif dv == 5 and chuc > 0:
            w.append("lăm")
        else:
            w.append(_SO[dv])
    return w


def so_thanh_chu(n: int) -> str:
    if n == 0:
        return "Không đồng"
    nhom = []
    while n:
        nhom.append(n % 1000)
        n //= 1000
    if len(nhom) > len(_DV):
        raise Loi("Số tiền quá lớn")
    w = []
    for i in range(len(nhom) - 1, -1, -1):
        if nhom[i] == 0:
            continue
        w += _ba_so(nhom[i], day_du=i < len(nhom) - 1)
        if _DV[i]:
            w.append(_DV[i])
    s = " ".join(w) + " đồng"
    return s[0].upper() + s[1:]


# ================================================================ giá trị điền vào mẫu
def gia_tri_hop_dong(dl, ch):
    a = dl.get("ben_a") or {}
    b = {**ch["ben_b"], **(dl.get("ben_b") or {})}
    thieu = [k for k in ("ten", "dia_chi", "ma_so_thue", "dai_dien", "chuc_vu") if not a.get(k)]
    if not dl.get("ngay_ky"):
        thieu.append("ngay_ky (ngày ký)")
    if not dl.get("so_hop_dong") and not a.get("viet_tat"):
        thieu.append("viet_tat (tên viết tắt để đặt số hợp đồng) hoặc so_hop_dong")
    if thieu:
        raise Loi("Thiếu thông tin Bên A: " + ", ".join(thieu))
    ngay = chuan_ngay(dl["ngay_ky"])
    so_hd = dl.get("so_hop_dong") or (
        f"{int(dl.get('so_thu_tu', 1)):02d}/{ngay.year}/{ch['ky_hieu_hop_dong']}/"
        f"{a['viet_tat']}-{b['viet_tat']}")
    b_dai_dien = f"{b.get('xung_ho', '')} {b['dai_dien']}".strip()
    return {
        "SO_HD": so_hd,
        "NGAY_HD": ngay_so(ngay),
        "NGAY_KY_CHU": ngay_chu(ngay),
        "A_TEN": a["ten"],
        "A_VIET_TAT": a.get("viet_tat", ""),
        "A_DIA_CHI": a["dia_chi"],
        "A_DIEN_THOAI": a.get("dien_thoai", ""),
        "A_EMAIL": a.get("email", ""),
        "A_MST": a["ma_so_thue"],
        "A_TAI_KHOAN": a.get("tai_khoan", ""),
        "A_XUNG_HO": a.get("xung_ho") or "Ông (Bà)",
        "A_DAI_DIEN": a["dai_dien"],
        "A_CHUC_VU": a["chuc_vu"],
        "A_DAI_DIEN_HOA": hoa(a["dai_dien"]),
        "A_CHUC_VU_HOA": hoa(a["chuc_vu"]),
        "B_TEN": b["ten"],
        "B_DIA_CHI": b["dia_chi"],
        "B_DIEN_THOAI": b["dien_thoai"],
        "B_MST": b["ma_so_thue"],
        "B_TAI_KHOAN": b["tai_khoan"],
        "B_DAI_DIEN": b_dai_dien,
        "B_CHUC_VU": b["chuc_vu"],
        "B_DAI_DIEN_HOA": hoa(b["dai_dien"]),
        "B_CHUC_VU_HOA": hoa(b["chuc_vu"]),
    }


def danh_sach_khoa(dl, ch):
    ds = dl.get("khoa_hoc") or [{"ten": t} for t in ch["khoa_hoc_mac_dinh"]]
    ds = [{"ten": k} if isinstance(k, str) else k for k in ds]
    for i, k in enumerate(ds, 1):
        if not k.get("ten"):
            raise Loi(f"Khóa học thứ {i} chưa có tên (ten)")
    return ds


# ================================================================ điền mẫu
def dien(root, v, ds):
    """{{DS_X}}: nhân đoạn theo danh sách; {{?X}}: xóa cả đoạn nếu X trống; {{X}}: thay giá trị."""
    for p in list(root.iter(qn("w:p"))):
        m = re.fullmatch(r"\{\{(DS_[A-Z0-9_]+)\}\}", van_ban(p).strip())
        if m:
            for muc in ds.get(m.group(1), []):
                p.addprevious(chi_giu_run_dau(copy.deepcopy(p), muc))
            xoa(p)
    for p in list(root.iter(qn("w:p"))):
        if any(m.group(1) == "?" and not str(v.get(m.group(2), "")).strip()
               for m in TRUONG.finditer(van_ban(p))):
            xoa(p)
    for t in root.iter(qn("w:t")):
        if t.text and "{{" in t.text:
            t.text = TRUONG.sub(lambda m: str(v[m.group(2)]) if m.group(2) in v else m.group(0), t.text)
    con = sorted({m.group(0) for t in cac_t(root) for m in TRUONG.finditer(t.text or "")})
    if con:
        raise Loi("Mẫu còn trường chưa điền: " + ", ".join(con))


def phan_than(d):
    body = d.element.body
    return [e for e in body.iterchildren() if e.tag != qn("w:sectPr")]


def tao_phan_hop_dong(v, khoa):
    d = docx.Document(str(MAU_HD))
    ten_khoa = [k["ten"].rstrip(".") + "." for k in khoa]
    dien(d.element.body, v, {"DS_KHOA_HOC": ten_khoa})
    return d


# ---------------------------------------------------------------- bảng chi phí từng lớp
def _el(tag, parent=None, **attrs):
    e = OxmlElement(tag)
    for k, val in attrs.items():
        e.set(qn("w:" + k), str(val))
    if parent is not None:
        parent.append(e)
    return e


def _o(tr, dong, rong, jc="center", dam=False, span=1):
    """Một ô bảng; dòng thứ 2 trở đi (mô tả) in nghiêng."""
    tc = _el("w:tc", tr)
    pr = _el("w:tcPr", tc)
    _el("w:tcW", pr, w=rong, type="dxa")
    if span > 1:
        _el("w:gridSpan", pr, val=span)
    _el("w:vAlign", pr, val="center")
    for i, chu in enumerate(dong if isinstance(dong, list) else [dong]):
        p = _el("w:p", tc)
        ppr = _el("w:pPr", p)
        _el("w:pStyle", ppr, val="Normal")
        _el("w:spacing", ppr, before=60, after=60, line=264, lineRule="auto")
        _el("w:jc", ppr, val=jc)
        r = _el("w:r", p)
        rpr = _el("w:rPr", r)
        if dam:
            _el("w:b", rpr)
            _el("w:bCs", rpr)
        if i > 0:
            _el("w:i", rpr)
            _el("w:iCs", rpr)
        _el("w:sz", rpr, val=26)
        _el("w:szCs", rpr, val=26)
        t = _el("w:t", r)
        t.text = str(chu)
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    return tc


def tao_bang_chi_phi(lop, nhan):
    """Trả về (bảng, tổng tiền hoặc None, có cột thành tiền)."""
    trong = not lop
    if trong:   # chưa có số liệu -> bảng trống để điền tay
        lop = [{"ten": "", "thoi_luong": " ", "don_vi_tinh": " ", "ghi_chu": " "} for _ in range(4)]

    cot = ["stt", "ten"]
    cot += [k for k in ("thoi_luong", "don_vi_tinh", "so_luong") if any(k in r and r[k] != "" for r in lop)]
    cot += ["don_gia"]
    co_tt = "so_luong" in cot or any(r.get("thanh_tien") not in (None, "") for r in lop)
    if co_tt:
        cot.append("thanh_tien")
    if any(r.get("ghi_chu") not in (None, "") for r in lop):
        cot.append("ghi_chu")

    rong = {"stt": 760, "thoi_luong": 1250, "don_vi_tinh": 1250, "so_luong": 1050,
            "don_gia": 1600, "thanh_tien": 1750, "ghi_chu": 1500}
    khac = sum(rong[c] for c in cot if c != "ten")
    if RONG_BANG - khac < 2600:   # cột tên lớp tối thiểu ~4,6 cm; cột STT giữ nguyên
        co_gian = khac - rong["stt"]
        he_so = (RONG_BANG - 2600 - rong["stt"]) / co_gian
        rong = {k: (w if k == "stt" else int(w * he_so)) for k, w in rong.items()}
        khac = sum(rong[c] for c in cot if c != "ten")
    rong["ten"] = RONG_BANG - khac

    tbl = OxmlElement("w:tbl")
    tpr = _el("w:tblPr", tbl)
    _el("w:tblW", tpr, w=RONG_BANG, type="dxa")
    _el("w:jc", tpr, val="center")
    vien = _el("w:tblBorders", tpr)
    for canh in ("top", "left", "bottom", "right", "insideH", "insideV"):
        _el("w:" + canh, vien, val="single", sz=4, space=0, color="000000")
    _el("w:tblLayout", tpr, type="fixed")
    le = _el("w:tblCellMar", tpr)
    _el("w:left", le, w=85, type="dxa")
    _el("w:right", le, w=85, type="dxa")
    _el("w:tblLook", tpr, val="04A0", firstRow=1, lastRow=0, firstColumn=1, lastColumn=0,
        noHBand=0, noVBand=1)
    luoi = _el("w:tblGrid", tbl)
    for c in cot:
        _el("w:gridCol", luoi, w=rong[c])

    tr = _el("w:tr", tbl)
    trpr = _el("w:trPr", tr)
    _el("w:cantSplit", trpr)
    _el("w:tblHeader", trpr)
    for c in cot:
        _o(tr, nhan[c], rong[c], dam=True)

    tong, du_so = 0, True
    for i, r in enumerate(lop, 1):
        tr = _el("w:tr", tbl)
        trpr = _el("w:trPr", tr)
        _el("w:cantSplit", trpr)
        if trong:
            _el("w:trHeight", trpr, val=560, hRule="atLeast")
        don_gia = so_nguyen(r.get("don_gia"))
        sl = so_nguyen(r.get("so_luong"))
        tt = so_nguyen(r.get("thanh_tien"))
        if tt is None and don_gia is not None and sl is not None:
            tt = don_gia * sl
        if co_tt:
            if tt is None:
                du_so = False
            else:
                tong += tt
        for c in cot:
            if c == "stt":
                _o(tr, str(i), rong[c])
            elif c == "ten":
                ten = [x for x in (r.get("ten", ""), r.get("mo_ta", "")) if str(x).strip()] or [""]
                _o(tr, ten, rong[c], jc="left")
            elif c == "don_gia":
                gt = tien(don_gia) if don_gia is not None else (str(r.get("don_gia") or "").strip() or CHAM)
                _o(tr, gt, rong[c], jc="right" if don_gia is not None else "center")
            elif c == "thanh_tien":
                _o(tr, tien(tt) if tt is not None else CHAM, rong[c], jc="right" if tt is not None else "center")
            elif c == "so_luong":
                _o(tr, tien(sl) if sl is not None else str(r.get("so_luong", "")).strip(), rong[c])
            elif c == "ghi_chu":
                _o(tr, str(r.get("ghi_chu", "")).strip(), rong[c], jc="left")
            else:
                _o(tr, str(r.get(c, "")).strip(), rong[c])

    if co_tt:
        tr = _el("w:tr", tbl)
        _el("w:cantSplit", _el("w:trPr", tr))
        i_tt = cot.index("thanh_tien")
        _o(tr, "Tổng cộng", sum(rong[c] for c in cot[:i_tt]), dam=True, span=i_tt)
        _o(tr, tien(tong) if du_so else CHAM, rong["thanh_tien"], jc="right" if du_so else "center", dam=True)
        for c in cot[i_tt + 1:]:
            _o(tr, "", rong[c])
    return tbl, (tong if co_tt and du_so else None), co_tt


# ---------------------------------------------------------------- phụ lục
def tao_phan_phu_luc(khoa, stt, v_hd, ch, dl):
    cfg = copy.deepcopy(ch["phu_luc"])
    rieng = dl.get("phu_luc") or {}
    for k, val in rieng.items():
        cfg[k] = {**cfg[k], **val} if isinstance(cfg.get(k), dict) else val
    ghi_chu = list(cfg.get("ghi_chu", [])) + list(khoa.get("ghi_chu", []))
    cac_dieu = khoa.get("cac_dieu") or cfg["cac_dieu"]
    cac_dieu = list(cac_dieu) + list(cfg.get("them_dieu", [])) + list(khoa.get("them_dieu", []))
    nhan = {**cfg["cot_bang"], **(khoa.get("cot_bang") or {})}

    ngay_pl = chuan_ngay(khoa.get("ngay_ky") or dl["ngay_ky"])
    v = {**v_hd,
         "SO_PL": str(khoa.get("so_phu_luc") or f"{stt:02d}"),
         "TEN_KHOA": khoa["ten"].rstrip("."),
         "TEN_KHOA_THUONG": thuong_chu_dau(khoa["ten"].rstrip(".")),
         "NGAY_PL_CHU": ngay_chu(ngay_pl),
         "NHAN_GHI_CHU": "Ghi chú:" if ghi_chu else ""}
    v["MO_TA_DIEU_1"] = dien_chuoi(khoa.get("mo_ta") or cfg["mo_ta_dieu_1"], v)
    ds = {
        "DS_CAN_CU": [dien_chuoi(cfg["can_cu_dau"], v)] + [dien_chuoi(x, v) for x in khoa.get("can_cu", [])]
                     + [dien_chuoi(cfg["can_cu_cuoi"], v)],
        "DS_GHI_CHU": [dien_chuoi(x, v) for x in ghi_chu],
    }

    d = docx.Document(str(MAU_PL))
    body = d.element.body

    # Các điều 2, 3, 4... theo cấu hình
    p_dieu = next(p for p in body.iter(qn("w:p")) if "{{D_SO}}" in van_ban(p))
    p_muc = next(p for p in body.iter(qn("w:p")) if "{{D_NOI_DUNG}}" in van_ban(p))
    for so_dieu, dieu in enumerate(cac_dieu, 2):
        p_dieu.addprevious(chi_giu_run_dau(copy.deepcopy(p_dieu),
                                           f"ĐIỀU {so_dieu}. {dien_chuoi(dieu['tieu_de'], v).upper()}"))
        for muc in dieu.get("noi_dung", []):
            p_dieu.addprevious(chi_giu_run_dau(copy.deepcopy(p_muc), dien_chuoi(muc, v)))
    xoa(p_dieu)
    xoa(p_muc)
    giu_voi_doan_sau(body.findall(qn("w:tbl"))[-1].getprevious())   # đoạn cuối đi cùng khối chữ ký

    # Bảng chi phí từng lớp (+ dòng tổng bằng chữ nếu có số lượng)
    p_bang = next(p for p in body.iter(qn("w:p")) if van_ban(p).strip() == "{{BANG_CHI_PHI}}")
    bang, tong, co_tt = tao_bang_chi_phi(khoa.get("lop") or [], nhan)
    p_bang.addprevious(bang)
    if co_tt:
        chu = (so_thanh_chu(tong) + "./.") if tong is not None else CHAM * 3
        p_chu = chi_giu_run_dau(copy.deepcopy(p_bang), f"Tổng cộng (bằng chữ): {chu}")
        them_kieu_chu(p_chu, nghieng=True)
        p_bang.addprevious(p_chu)
    xoa(p_bang)

    dien(body, v, ds)
    return d


# ================================================================ ghép & lưu
def ghep(cac_phan):
    """cac_phan: [(loai 'hd'|'pl', Document)]. Mỗi văn bản là một section riêng (sang trang mới);
    phụ lục đánh số trang lại từ 1."""
    goc = docx.Document(str(MAU_HD))
    body = goc.element.body
    sect = body.find(qn("w:sectPr"))
    for e in list(body.iterchildren()):
        if e is not sect:
            body.remove(e)

    def danh_so_lai(s, loai):
        pg = s.find(qn("w:pgNumType"))
        if pg is None:
            pg = s.makeelement(qn("w:pgNumType"), {})
            s.append(pg)
        if loai == "pl":
            pg.set(qn("w:start"), "1")
        elif qn("w:start") in pg.attrib:
            del pg.attrib[qn("w:start")]

    for i, (loai, d) in enumerate(cac_phan):
        els = phan_than(d)
        for e in els:
            sect.addprevious(e)
        if i < len(cac_phan) - 1:
            cuoi = els[-1]
            if cuoi.tag != qn("w:p"):
                cuoi = OxmlElement("w:p")
                sect.addprevious(cuoi)
            ppr = cuoi.find(qn("w:pPr"))
            if ppr is None:
                ppr = cuoi.makeelement(qn("w:pPr"), {})
                cuoi.insert(0, ppr)
            s = copy.deepcopy(sect)
            danh_so_lai(s, loai)
            ppr.append(s)
        else:
            danh_so_lai(sect, loai)

    cp = goc.core_properties
    cp.title = "Hợp đồng nguyên tắc" if cac_phan[0][0] == "hd" else "Phụ lục hợp đồng nguyên tắc"
    cp.comments = ""
    cp.last_modified_by = "CÔNG TY CỔ PHẦN KỸ THUẬT HÀNG HẢI DAKO"
    cp.created = cp.modified = datetime.now()
    cp.revision = 1
    return goc


def luu(d, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    d.save(str(path))
    return path


def xuat_pdf(paths):
    with tempfile.TemporaryDirectory() as tmp:
        for p in paths:
            subprocess.run(["soffice", f"-env:UserInstallation=file://{tmp}/lo", "--headless",
                            "--convert-to", "pdf", "--outdir", str(p.parent), str(p)],
                           check=True, capture_output=True, timeout=300)
    return [p.with_suffix(".pdf") for p in paths]


def chon_phu_luc(chuoi, n):
    if not chuoi:
        return list(range(1, n + 1))
    so = []
    for x in re.split(r"[,\s]+", chuoi.strip()):
        if "-" in x:
            a, b = x.split("-")
            so += list(range(int(a), int(b) + 1))
        elif x:
            so.append(int(x))
    sai = [s for s in so if not 1 <= s <= n]
    if sai:
        raise Loi(f"Không có phụ lục số {sai} (đối tác này có {n} khóa)")
    return so


def main(argv=None):
    ap = argparse.ArgumentParser(description="Tạo hợp đồng nguyên tắc + phụ lục DAKO (.docx)")
    ap.add_argument("doi_tac", help="file thông tin đối tác (.json)")
    ap.add_argument("--tach", action="store_true", help="mỗi văn bản một file riêng")
    ap.add_argument("--chi-phu-luc", action="store_true", help="không kèm hợp đồng")
    ap.add_argument("--khong-phu-luc", action="store_true", help="chỉ hợp đồng")
    ap.add_argument("--phu-luc", help="chọn phụ lục, ví dụ 2 hoặc 1,3 hoặc 2-4")
    ap.add_argument("--pdf", action="store_true", help="xuất thêm PDF")
    ap.add_argument("--ra", help="thư mục lưu kết quả")
    a = ap.parse_args(argv)

    try:
        ch = doc_json(CAU_HINH)
        dl = doc_json(a.doi_tac)
        v = gia_tri_hop_dong(dl, ch)
        khoa = danh_sach_khoa(dl, ch)
        chon = [] if a.khong_phu_luc else chon_phu_luc(a.phu_luc, len(khoa))
        co_hd = not a.chi_phu_luc

        ten_goc = "HDNT_" + khong_dau(v["SO_HD"])
        ra = Path(a.ra) if a.ra else THU_MUC / "ket-qua" / khong_dau(v["A_VIET_TAT"] or v["A_TEN"])

        def phan_hd():
            return ("hd", tao_phan_hop_dong(v, khoa))

        def phan_pl(i):
            return ("pl", tao_phan_phu_luc(khoa[i - 1], i, v, ch, dl))

        files = []
        if a.tach:
            if co_hd:
                files.append(luu(ghep([phan_hd()]), ra / f"{ten_goc}_hop-dong.docx"))
            for i in chon:
                so_pl = str(khoa[i - 1].get("so_phu_luc") or f"{i:02d}")
                files.append(luu(ghep([phan_pl(i)]), ra / f"{ten_goc}_phu-luc-{khong_dau(so_pl)}.docx"))
        else:
            phan = ([phan_hd()] if co_hd else []) + [phan_pl(i) for i in chon]
            if not phan:
                raise Loi("Không có văn bản nào để xuất")
            if co_hd:
                duoi = "" if chon else "_hop-dong"
            else:
                duoi = "_phu-luc-" + "-".join(f"{i:02d}" for i in chon)
            files.append(luu(ghep(phan), ra / f"{ten_goc}{duoi}.docx"))
        if a.pdf:
            files += xuat_pdf([f for f in files if f.suffix == ".docx"])
    except Loi as e:
        print("LỖI:", e, file=sys.stderr)
        return 1

    print("Số hợp đồng:", v["SO_HD"])
    for i in chon:
        k = khoa[i - 1]
        print(f"Phụ lục {k.get('so_phu_luc') or f'{i:02d}'}: {k['ten']} – {len(k.get('lop') or [])} lớp")
    for f in files:
        print("Đã lưu:", f)
    return 0


if __name__ == "__main__":
    sys.exit(main())
