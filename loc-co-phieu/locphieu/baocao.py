"""Trình bày kết quả lọc: màn hình, Markdown, HTML (mở bằng trình duyệt) và CSV."""
from __future__ import annotations

import csv
import html
import math
import os

from .chienluoc import NHOM, THU_TU
from .thoigian import LICH_CHAY


# ---------------------------------------------------------------------------------------------- định dạng
def _nan(x) -> bool:
    return x is None or (isinstance(x, float) and math.isnan(x))


def g(x, so_le: int = 2) -> str:
    return "–" if _nan(x) else f"{x:,.{so_le}f}"


def pt(x, dau: bool = True, so_le: int = 1) -> str:
    if _nan(x):
        return "–"
    return f"{x * 100:+.{so_le}f}%" if dau else f"{x * 100:.{so_le}f}%"


def kl(x) -> str:
    if _nan(x):
        return "–"
    if x >= 1e6:
        return f"{x / 1e6:.2f}M"
    if x >= 1e3:
        return f"{x / 1e3:.0f}K"
    return f"{x:.0f}"


def lan(x) -> str:
    return "–" if _nan(x) else f"{x:.1f}×"


def ngay_vn(s: str) -> str:
    if not s:
        return "–"
    y, m, d = s.split("-")
    return f"{d}/{m}/{y}"


# ---------------------------------------------------------------------------------------------- bảng
def _cot_bang(nhom: str, co_von: bool):
    """Danh sách (tiêu đề, hàm lấy giá trị) cho từng nhóm."""
    chung_dau = [("Mã", lambda k: k["ma"]), ("Sàn", lambda k: k.get("san") or "–"),
                 ("Giá", lambda k: g(k["gia"])), ("±%", lambda k: pt(k["thay_doi"]))]
    if nhom in ("MUA", "MUA_GAN"):
        cot = chung_dau + [
            ("KL/TB20", lambda k: lan(k["kl_ratio"]) + ("*" if k.get("du_phong_kl") else "")),
            ("Pivot", lambda k: g(k["pivot"])), ("Mua tối đa", lambda k: g(k["vung_mua"])),
            ("Cắt lỗ", lambda k: g(k["cat_lo"])), ("MT1", lambda k: g(k["muc_tieu_1"])),
            ("MT2", lambda k: g(k["muc_tieu_2"])), ("Nền", lambda k: f"{k.get('so_tuan_nen') or '–'} tuần"),
            ("RS", lambda k: g(k.get("rs_pct"), 0)), ("Điểm", lambda k: g(k["diem"], 0))]
        if co_von:
            cot.append(("KL mua gợi ý", lambda k: f"{k.get('kl_mua_goi_y') or 0:,}"))
        return cot
    if nhom == "CHO":
        cot = chung_dau + [
            ("Pivot", lambda k: g(k["pivot"])), ("Cách pivot", lambda k: pt(k["pivot"] / k["gia"] - 1)),
            ("Nền", lambda k: f"{k.get('so_tuan_nen') or '–'} tuần"), ("Biên độ", lambda k: pt(k["bien_do_nen"], False)),
            ("Cạn cung", lambda k: pt(k["can_cung"], False, 0)), ("Tăng trước nền", lambda k: pt(k["tang_truoc_nen"], True, 0)),
            ("Cắt lỗ", lambda k: g(k["cat_lo"])), ("RS", lambda k: g(k.get("rs_pct"), 0)),
            ("Điểm", lambda k: g(k["diem"], 0))]
        if co_von:
            cot.append(("KL mua gợi ý", lambda k: f"{k.get('kl_mua_goi_y') or 0:,}"))
        return cot
    if nhom == "XA":
        return chung_dau + [("Pivot", lambda k: g(k["pivot"])), ("So với pivot", lambda k: pt(k["cach_pivot"])),
                            ("Ngày breakout", lambda k: ngay_vn(k["ngay_breakout"])),
                            ("Điểm", lambda k: g(k["diem"], 0))]
    if nhom == "CHAY":
        return chung_dau + [("Breakout", lambda k: ngay_vn(k["ngay_breakout"])),
                            ("Lãi từ pivot", lambda k: pt(k["lai_tu_pivot"], True, 0)),
                            ("Dừng lỗ động", lambda k: g(k["dung_lo_dong"])),
                            ("Chốt 1 phần?", lambda k: "Cân nhắc" if k.get("chot_mot_phan") else "–"),
                            ("MT2", lambda k: g(k["muc_tieu_2"]))]
    if nhom == "BAN":
        return chung_dau + [("Pivot", lambda k: g(k["pivot"])), ("Breakout", lambda k: ngay_vn(k["ngay_breakout"])),
                            ("Lý do", lambda k: (k["canh_bao"] or ["–"])[0])]
    return chung_dau


COT_DANH_MUC = [
    ("Mã", lambda d: d["ma"]), ("Giá mua", lambda d: g(d["gia_mua"])), ("Giá", lambda d: g(d["gia"])),
    ("Lãi/lỗ", lambda d: pt(d["lai"])), ("Hành động", lambda d: d["hanh_dong"]),
    ("Dừng lỗ động", lambda d: g(d["dung_lo_dong"])), ("Lý do", lambda d: d["ly_do"]),
]


def _rong_chu(s: str) -> int:
    return len(s)


def bang_text(cot, dong) -> str:
    tieu_de = [c[0] for c in cot]
    o = [[str(f(x)) for _, f in cot] for x in dong]
    rong = [max([_rong_chu(t)] + [_rong_chu(r[i]) for r in o]) for i, t in enumerate(tieu_de)]
    rong = [min(w, 60) for w in rong]

    def fmt(r):
        return "  ".join(str(v)[:rong[i]].ljust(rong[i]) for i, v in enumerate(r))

    return "\n".join([fmt(tieu_de), "  ".join("-" * w for w in rong)] + [fmt(r) for r in o])


def bang_md(cot, dong) -> str:
    def esc(s):
        return str(s).replace("|", "\\|")
    tieu_de = "| " + " | ".join(c[0] for c in cot) + " |"
    gach = "|" + "|".join("---" for _ in cot) + "|"
    hang = ["| " + " | ".join(esc(f(x)) for _, f in cot) + " |" for x in dong]
    return "\n".join([tieu_de, gach] + hang)


# ---------------------------------------------------------------------------------------------- gom nhóm
def gom_nhom(ket_qua: list[dict], top: int = 30) -> dict[str, list[dict]]:
    nhom = {k: [] for k in THU_TU}
    for k in ket_qua:
        nhom[k["trang_thai"]].append(k)
    for k in ("MUA", "MUA_GAN", "CHO", "XA"):
        nhom[k].sort(key=lambda x: -x["diem"])
    nhom["CHAY"].sort(key=lambda x: -(x["lai_tu_pivot"] if not _nan(x["lai_tu_pivot"]) else -9))
    nhom["CHO"] = nhom["CHO"][:top]
    return nhom


def _y_nghia_rs() -> str:
    return "RS = xếp hạng sức mạnh giá 1–99 so với toàn thị trường (≥ 80 là nhóm dẫn dắt)."


# ---------------------------------------------------------------------------------------------- nhật ký gợi ý
def _hs(x) -> str:
    if _nan(x):
        return "–"
    return "∞" if x == float("inf") else f"{x:.2f}"


def dong_thong_ke(tk: dict, ten: str = "gợi ý") -> list[str]:
    """Các dòng tóm tắt thống kê (dùng cho nhật ký thực tế – "gợi ý" – và kiểm định quá khứ – "tín hiệu")."""
    if not tk or not tk.get("tong"):
        return ["Chưa có gợi ý nào. Nhật ký tự ghi từ lần lọc đầu tiên có tín hiệu MUA (sau giờ đóng cửa)."]
    out = [f"Tổng {tk['tong']} {ten}: {tk['da_dong']} đã bán theo quy tắc, {tk['dang_mo']} đang giữ."]
    if tk["da_dong"]:
        out.append(f"Tỷ lệ thắng {pt(tk['ty_le_thang'], False, 0)} ({tk['thang']} thắng / {tk['thua']} thua"
                   + (f" / {tk['hoa']} hoà" if tk["hoa"] else "") + f") · lãi/lỗ bình quân mỗi lệnh {pt(tk['lai_tb'])}"
                   f" · lệnh thắng TB {pt(tk['lai_tb_thang'])} · lệnh thua TB {pt(tk['lo_tb_thua'])}"
                   f" · hệ số lợi nhuận {_hs(tk['he_so_loi_nhuan'])}")
    if tk.get("da_ro"):
        out.append(f"Tỷ lệ chính xác {pt(tk['ty_le_chinh_xac'], False, 0)}: {tk['chinh_xac']}/{tk['da_ro']} {ten} chạm "
                   "mục tiêu 1 trước khi phải bán")
    if tk["dang_mo"]:
        out.append(f"Các {ten} đang giữ: lãi/lỗ tạm tính bình quân {pt(tk['lai_tb_mo'])}")
    if not _nan(tk.get("vuot_vnindex_tb")):
        out.append(f"So với VN-Index cùng thời gian nắm giữ: {pt(tk['vuot_vnindex_tb'])} mỗi lệnh; "
                   f"giữ bình quân {g(tk['so_phien_tb'], 0)} phiên")
    return out


Y_NGHIA_CHI_SO = ("Tỷ lệ thắng = % lệnh đã bán có lãi. Tỷ lệ chính xác = % gợi ý chạm mục tiêu 1 (≈ +20%) trước khi "
                  "phải bán. Hệ số lợi nhuận = tổng % lãi ÷ tổng % lỗ (> 1,5 là tốt). Mỗi gợi ý tính như mua giá đóng "
                  "cửa phiên gợi ý rồi bán đúng quy tắc của công cụ; chưa trừ phí, thuế.")

COT_NK_MO = [
    ("Mã", lambda x: x["ma"]), ("Ngày gợi ý", lambda x: ngay_vn(x["ngay_goi_y"])),
    ("Giá vào", lambda x: g(x["gia_vao"])), ("Giá hiện tại", lambda x: g(x.get("gia_hien_tai"))),
    ("Lãi/lỗ", lambda x: pt(x.get("lai"))), ("Lãi cao nhất", lambda x: pt(x.get("lai_max"), True, 0)),
    ("Dừng lỗ hiện tại", lambda x: g(x.get("dung_lo"))), ("Chạm MT1", lambda x: ngay_vn(x.get("cham_mt1") or "")),
    ("Số phiên", lambda x: x.get("so_phien") if x.get("so_phien") is not None else "–"),
]
COT_NK_DONG = [
    ("Mã", lambda x: x["ma"]), ("Ngày gợi ý", lambda x: ngay_vn(x["ngay_goi_y"])),
    ("Giá vào", lambda x: g(x["gia_vao"])), ("Ngày bán", lambda x: ngay_vn(x.get("ngay_dong") or "")),
    ("Giá bán", lambda x: g(x.get("gia_dong"))), ("Lãi/lỗ", lambda x: pt(x.get("lai"))),
    ("Lý do bán", lambda x: x.get("ket_qua") or "–"),
    ("Số phiên", lambda x: x.get("so_phien") if x.get("so_phien") is not None else "–"),
    ("Hơn VN-Index", lambda x: pt(x.get("vuot_vnindex"), True, 0)),
]
COT_KIEM_DINH = [
    ("Ngày", lambda h: ngay_vn(h["ngay"])), ("Mã", lambda h: h["ma"]), ("Giá vào", lambda h: g(h["gia_vao"])),
    ("Kết quả", lambda h: h["ket_qua"]), ("Lãi/lỗ", lambda h: pt(h["lai"])),
    ("Số phiên", lambda h: h["so_phien"]), ("Lãi cao nhất", lambda h: pt(h.get("lai_max"), True, 0)),
]


def _cl(x: dict) -> str:
    return x.get("chien_luoc") or "nen_chat"


def _nk_mo(nk: dict, cl: str = "nen_chat") -> list[dict]:
    return sorted((x for x in nk["goi_y"] if x.get("trang_thai") != "DA_DONG" and _cl(x) == cl),
                  key=lambda x: (x.get("ngay_goi_y") or "", x["ma"]), reverse=True)


def _nk_dong(nk: dict, cl: str = "nen_chat") -> list[dict]:
    return sorted((x for x in nk["goi_y"] if x.get("trang_thai") == "DA_DONG" and _cl(x) == cl
                   and x.get("lai") is not None),
                  key=lambda x: (x.get("ngay_dong") or "", x["ma"]), reverse=True)


# ---------------------------------------------------------------------------------------------- lướt sóng
COT_LS = [
    ("Mã", lambda k: k["ma"]), ("Sàn", lambda k: k.get("san") or ""), ("Giá hôm nay", lambda k: g(k["gia"])),
    ("Mua tối đa", lambda k: g(k["mua_toi_da"])), ("Chốt lời", lambda k: g(k["chot_loi"])),
    ("Cắt lỗ", lambda k: g(k["cat_lo"])), ("Giữ tối đa", lambda k: f"{k['so_phien']} phiên"),
]
COT_LS_MO = [
    ("Mã", lambda x: x["ma"]), ("Ngày gợi ý", lambda x: ngay_vn(x["ngay_goi_y"])),
    ("Ngày mua", lambda x: ngay_vn(x.get("ngay_mua") or "") or "chờ mua"), ("Giá mua", lambda x: g(x.get("gia_vao"))),
    ("Giá hiện tại", lambda x: g(x.get("gia_hien_tai"))), ("Lãi/lỗ", lambda x: pt(x.get("lai"))),
    ("Chốt lời", lambda x: g(x.get("muc_tieu_1"))), ("Cắt lỗ", lambda x: g(x.get("cat_lo"))),
    ("Đã giữ", lambda x: f"{x.get('so_phien') or 0}/{x.get('han_phien', 20)} phiên"),
]
COT_LS_DONG = [
    ("Mã", lambda x: x["ma"]), ("Ngày mua", lambda x: ngay_vn(x.get("ngay_mua") or "")),
    ("Giá mua", lambda x: g(x.get("gia_vao"))), ("Ngày bán", lambda x: ngay_vn(x.get("ngay_dong") or "")),
    ("Giá bán", lambda x: g(x.get("gia_dong"))), ("Lãi/lỗ", lambda x: pt(x.get("lai"))),
    ("Kết quả", lambda x: x.get("ket_qua") or "–"), ("Số phiên", lambda x: x.get("so_phien", "–")),
]
CACH_LS = ("Cách làm: mua đầu phiên sau (lệnh ATO hoặc đầu phiên sáng), chỉ mua nếu giá ≤ \"mua tối đa\". Ngay khi có "
           "cổ phiếu, đặt chốt lời +7% và cắt lỗ −7% tính từ giá mua; nếu sau 20 phiên chưa chạm mức nào thì bán hết. "
           "Lưu ý T+2: cổ phiếu mua hôm nay về tài khoản trưa ngày làm việc thứ 3.")


def _ls_lich_su(ls: dict) -> str:
    t, x = ls["lich_su"]["tong"], ls["lich_su"]["xac_nhan"]
    so_lenh = f"{t['so_lenh']:,}".replace(",", ".")
    return (f"Kiểm định 2017–2026 (mua mở cửa phiên sau, chốt lời +7% / cắt lỗ −7% / tối đa 20 phiên, đã trừ phí & "
            f"thuế, theo luật T+2 và biên độ giá): {so_lenh} lệnh, thắng {t['thang']:.0%}, lãi bình quân "
            f"{t['tb'] * 100:+.2f}%/lệnh; riêng loại \"thị trường xác nhận tăng\" thắng {x['thang']:.0%}, "
            f"{x['tb'] * 100:+.2f}%/lệnh.")


def _ls_dong_tinh_trang(ls: dict) -> str:
    tt = ls.get("thi_truong") or {}
    if ls.get("loi"):
        return f"Không tính được tín hiệu lướt sóng: {ls['loi']}"
    if ls.get("goi_y"):
        loai = "Hôm nay là PHIÊN XÁC NHẬN TĂNG của thị trường. " if tt.get("xac_nhan") else ""
        return loai + f"{len(ls['goi_y'])} mã đạt chuẩn (xếp theo điểm chỉ báo bền vững, cao trước)."
    if tt.get("che_do") == 2:
        return "Thị trường đang tăng thuận lợi nhưng hôm nay chưa có mã nào đạt đủ tiêu chí."
    return (f"Hôm nay KHÔNG có tín hiệu lướt sóng: thị trường đang {tt.get('trang_thai', '?')}. Kiểm định 2014–2026 "
            "cho thấy mua lướt sóng khi thị trường chưa thuận lợi lỗ bình quân – đứng ngoài, chờ thị trường TĂNG – "
            "thuận lợi hoặc phiên xác nhận tăng.")


def _ls_nhat_ky_dong(nk: dict) -> tuple[str, str] | None:
    tk = nk.get("thong_ke_ls")
    if not tk or not tk.get("tong"):
        return None
    return nk.get("tin_cay_ls") or ("", "")


def _phan_luot_song_text(bc: dict) -> list[str]:
    ls = bc.get("luot_song")
    if not ls:
        return []
    out = ["", "■ LƯỚT SÓNG 5–7% – XÁC SUẤT THẮNG CAO NHẤT THEO KIỂM ĐỊNH 13 NĂM", _ls_dong_tinh_trang(ls)]
    if ls.get("goi_y"):
        out.append(bang_text(COT_LS, ls["goi_y"]))
        for k in ls["goi_y"]:
            out.append(f"  {k['ma']}: {k['ten_loai']}" + (f" – {'; '.join(k['ly_do'])}" if k.get("ly_do") else ""))
        out.append("  " + CACH_LS)
        if any(k.get("du_phong_kl") for k in ls["goi_y"]):
            out.append("  ! Tín hiệu trong phiên là tạm thời – xác nhận lại sau 15:30.")
    out.append("  " + _ls_lich_su(ls))
    nk = bc.get("nhat_ky") or {}
    if _ls_nhat_ky_dong(nk):
        muc, giai_thich = nk["tin_cay_ls"]
        out += ["", f"  Nhật ký lướt sóng – thực tế: Độ tin cậy {muc}. {giai_thich}"]
        out += ["  " + d for d in dong_thong_ke(nk["thong_ke_ls"])]
        mo, dong = _nk_mo(nk, "luot_song"), _nk_dong(nk, "luot_song")
        if mo:
            out += ["  Đang giữ / chờ mua:", bang_text(COT_LS_MO, mo)]
        if dong:
            out += [f"  Đã bán ({len(dong)}):", bang_text(COT_LS_DONG, dong[:15])]
    return out


def _phan_luot_song_md(bc: dict) -> list[str]:
    ls = bc.get("luot_song")
    if not ls:
        return []
    out = ["## 🎯 Lướt sóng 5–7% – xác suất thắng cao nhất theo kiểm định 13 năm", "", _ls_dong_tinh_trang(ls), ""]
    if ls.get("goi_y"):
        out += [bang_md(COT_LS, ls["goi_y"]), ""]
        out += [f"- **{k['ma']}**: {k['ten_loai']}" + (f" – {'; '.join(k['ly_do'])}" if k.get("ly_do") else "")
                for k in ls["goi_y"]]
        out += ["", f"> {CACH_LS}", ""]
    out += [f"*{_ls_lich_su(ls)}*", ""]
    nk = bc.get("nhat_ky") or {}
    if _ls_nhat_ky_dong(nk):
        muc, giai_thich = nk["tin_cay_ls"]
        out += ["### Nhật ký lướt sóng – thực tế", "", f"**Độ tin cậy: {muc}.** {giai_thich}", ""]
        out += [f"- {d}" for d in dong_thong_ke(nk["thong_ke_ls"])] + [""]
        mo, dong = _nk_mo(nk, "luot_song"), _nk_dong(nk, "luot_song")
        if mo:
            out += ["Đang giữ / chờ mua:", "", bang_md(COT_LS_MO, mo), ""]
        if dong:
            out += [f"Đã bán ({len(dong)}):", "", bang_md(COT_LS_DONG, dong), ""]
    return out


def _phan_luot_song_html(bc: dict) -> list[str]:
    ls = bc.get("luot_song")
    if not ls:
        return []
    e = html.escape
    lop = "MUA" if ls.get("goi_y") else ""
    out = [f"<h2 class='{lop}'>🎯 Lướt sóng 5–7%</h2>", f"<p class='card'>{e(_ls_dong_tinh_trang(ls))}</p>"]
    if ls.get("goi_y"):
        out.append(_bang_html(COT_LS, ls["goi_y"]))
        out.append("<ul>" + "".join(f"<li><b>{e(k['ma'])}</b>: {e(k['ten_loai'])}"
                                    + (f" – {e('; '.join(k['ly_do']))}" if k.get("ly_do") else "") + "</li>"
                                    for k in ls["goi_y"]) + "</ul>")
        out.append(f"<p class='card'>{e(CACH_LS)}</p>")
    out.append(f"<p class='mut'>{e(_ls_lich_su(ls))}</p>")
    nk = bc.get("nhat_ky") or {}
    if _ls_nhat_ky_dong(nk):
        muc, giai_thich = nk["tin_cay_ls"]
        out.append(f"<h3>Nhật ký lướt sóng – thực tế</h3><p class='card'><b>Độ tin cậy: {e(muc)}.</b> "
                   f"{e(giai_thich)}</p>")
        out.append(_bang_chi_so_html(nk["thong_ke_ls"]))
        mo, dong = _nk_mo(nk, "luot_song"), _nk_dong(nk, "luot_song")
        if mo:
            out.append("<h3>Đang giữ / chờ mua</h3>" + _bang_html(COT_LS_MO, mo))
        if dong:
            out.append(f"<h3>Đã bán ({len(dong)})</h3>" + _bang_html(COT_LS_DONG, dong))
    return out


CANH_BAO_BREAKOUT = ("⚠️ Thị trường chưa \"TĂNG – thuận lợi\": kiểm định cho thấy tín hiệu breakout lúc này lỗ bình quân "
                     "(−2,2%/lệnh khi tăng có áp lực, −3,2%/lệnh khi điều chỉnh). Chỉ mua thăm dò rất nhỏ hoặc đứng ngoài.")


def tom_tat_tin_cay(bc: dict) -> str:
    """Một dòng độ tin cậy ở đầu báo cáo."""
    nk = bc.get("nhat_ky") or {}
    phan = []
    if nk.get("bat"):
        tk = nk["thong_ke"]
        if tk["da_dong"]:
            phan.append(f"DRI/MSR thực tế {pt(tk['ty_le_thang'], False, 0)} thắng / {tk['da_dong']} lệnh đã bán "
                        f"({nk['tin_cay'][0]})")
        else:
            phan.append(f"DRI/MSR thực tế: {tk['tong']} gợi ý, chưa lệnh nào bán xong")
    tls = nk.get("thong_ke_ls")
    if nk.get("bat") and tls and tls.get("da_dong"):
        phan.append(f"lướt sóng thực tế {pt(tls['ty_le_thang'], False, 0)} thắng / {tls['da_dong']} lệnh, "
                    f"TB {pt(tls['lai_tb'])} ({nk['tin_cay_ls'][0]})")
    kd = (nk.get("kiem_dinh") or {}).get("thong_ke")
    if kd and kd.get("da_dong"):
        phan.append(f"kiểm định quá khứ {pt(kd['ty_le_thang'], False, 0)} thắng / {kd['da_dong']} lệnh, "
                    f"TB {pt(kd['lai_tb'])} mỗi lệnh ({nk['tin_cay_kiem_dinh'][0]})")
    return ("ĐỘ TIN CẬY CÔNG CỤ: " + " | ".join(phan)) if phan else ""


def _phan_nhat_ky_text(bc: dict, tat_ca: bool = False) -> list[str]:
    nk = bc.get("nhat_ky") or {}
    out = []
    if nk.get("bat"):
        tk, (muc, giai_thich) = nk["thong_ke"], nk["tin_cay"]
        out += ["", f"■ NHẬT KÝ GỢI Ý – HIỆU QUẢ THỰC TẾ ({tk['tong']} gợi ý)", f"Độ tin cậy: {muc}. {giai_thich}"]
        out += ["  " + d for d in dong_thong_ke(tk)]
        if nk.get("moi"):
            out.append("  Gợi ý mới ghi vào nhật ký lần này: " + ", ".join(nk["moi"]))
        mo, dong = _nk_mo(nk), _nk_dong(nk)
        if mo:
            out += ["", "  Đang giữ:", bang_text(COT_NK_MO, mo)]
        if dong:
            hien = dong if tat_ca else dong[:15]
            out += ["", f"  Đã bán ({len(dong)}{', 15 lệnh gần nhất' if len(hien) < len(dong) else ''}):",
                    bang_text(COT_NK_DONG, hien)]
    kd = nk.get("kiem_dinh")
    if kd and kd.get("thong_ke", {}).get("tong"):
        muc, giai_thich = nk["tin_cay_kiem_dinh"]
        out += ["", f"■ KIỂM ĐỊNH QUÁ KHỨ (ước tính): mọi tín hiệu breakout của {kd['so_ma']} mã, từ "
                    f"{ngay_vn(kd['tu_ngay'])} đến {ngay_vn(kd['ngay'])}",
                f"Độ tin cậy: {muc}. {giai_thich}"]
        out += ["  " + d for d in dong_thong_ke(kd["thong_ke"], "tín hiệu")]
        if bc.get("kiem_dinh_chi_tiet") and kd.get("gan_nhat"):
            out += ["  Tín hiệu gần nhất:", bang_text(COT_KIEM_DINH, list(reversed(kd["gan_nhat"])))]
    if out:
        out += ["  " + Y_NGHIA_CHI_SO]
    return out


# ---------------------------------------------------------------------------------------------- màn hình
def in_man_hinh(bc: dict) -> str:
    out = []
    p = bc["phien"]
    out.append("=" * 100)
    out.append(f"LỌC CỔ PHIẾU (LƯỚT SÓNG + MẪU DRI/MSR) – {bc['thoi_diem']}  |  {p.ten}  [{p.sao_txt}]")
    out.append(f"Dữ liệu đến phiên {ngay_vn(bc['ngay_du_lieu'])}  ·  {bc['so_ma']} mã đã phân tích  ·  nguồn: "
               f"{bc['nguon']}")
    if bc.get("canh_bao_phien"):
        out.append("! " + bc["canh_bao_phien"])
    out.append("=" * 100)
    tt = bc["thi_truong"]
    out.append(f"THỊ TRƯỜNG (VN-Index {g(tt['gia'])} {pt(tt['thay_doi'])}): {tt['trang_thai']}. {tt['loi_khuyen']}."
               + (f" Ngày phân phối 25 phiên: {tt['ngay_phan_phoi']}." if tt.get("ngay_phan_phoi") is not None else ""))
    if tom_tat_tin_cay(bc):
        out.append(tom_tat_tin_cay(bc))
    out += _phan_luot_song_text(bc)
    nhom = bc["nhom"]
    if tt.get("muc", 2) < 2 and (nhom.get("MUA") or nhom.get("MUA_GAN")) and not bc.get("chi_nhat_ky"):
        out += ["", CANH_BAO_BREAKOUT]
    for ma_nhom in (() if bc.get("chi_nhat_ky") else ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN")):
        ds = nhom.get(ma_nhom) or []
        if not ds:
            continue
        out.append("")
        out.append(f"■ {NHOM[ma_nhom].upper()} ({len(ds)})")
        out.append(bang_text(_cot_bang(ma_nhom, bc["co_von"]), ds))
        if ma_nhom in ("MUA", "MUA_GAN", "CHO"):
            for k in ds[:15]:
                ghi = "; ".join(k.get("ghi_chu") or [])
                out.append(f"  {k['ma']}: {k['hanh_dong']}" + (f" | {ghi}" if ghi else ""))
        if ma_nhom == "CHAY":
            for k in ds:
                cb = "; ".join(k["canh_bao"][:2]) if k["canh_bao"] else ""
                ghi = "; ".join(k.get("ghi_chu") or [])
                if cb or ghi:
                    out.append(f"  {k['ma']}: " + " | ".join(x for x in (cb, ghi) if x))
    if not bc.get("chi_nhat_ky") and not any(nhom.get(k) for k in ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN")):
        out.append("")
        out.append("Không có mã nào khớp mẫu hình hôm nay – đứng ngoài cũng là một vị thế.")
    out += _phan_nhat_ky_text(bc, tat_ca=bool(bc.get("chi_nhat_ky")))
    if bc.get("danh_muc"):
        out.append("")
        out.append("■ DANH MỤC CỦA BẠN")
        out.append(bang_text(COT_DANH_MUC, bc["danh_muc"]))
    if bc.get("chi_tiet"):
        for k in bc["chi_tiet"]:
            out.append("")
            out.append(chi_tiet_text(k))
    out.append("")
    out.append(("* KL dự phóng cả ngày (chạy trong phiên). " if bc.get("du_phong") else "") + _y_nghia_rs())
    if bc.get("tep"):
        out.append("Báo cáo đã lưu: " + " · ".join(bc["tep"]))
    out.append("Lưu ý: công cụ hỗ trợ ra quyết định, không phải lời khuyên đầu tư; luôn tuân thủ cắt lỗ.")
    return "\n".join(out)


def chi_tiet_text(k: dict) -> str:
    out = [f"━━ {k['ma']} ({k.get('san') or '?'}) · phiên {ngay_vn(k['ngay'])} · {g(k['gia'])} ({pt(k['thay_doi'])}) "
           f"· KL {kl(k['kl'])} = {lan(k['kl_ratio'])} TB20" + (" (dự phóng)" if k.get("du_phong_kl") else "") + " ━━",
           f"Trạng thái: {k['nhom']}"]
    if k.get("hanh_dong"):
        out.append(f"Hành động: {k['hanh_dong']}")
    if k.get("dieu_kien"):
        moc = f"nền tính đến phiên {ngay_vn(k.get('ngay_ket_thuc_nen', ''))}"
        if k.get("ngay_breakout"):
            moc += f", breakout phiên {ngay_vn(k['ngay_breakout'])}"
        out.append(f"Bảng kiểm mẫu hình ({moc}):")
        for d in k["dieu_kien"]:
            dau = "✓" if d["dat"] else ("–" if d.get("tuy_chon") else "✗")
            out.append(f"  {dau} {d['ten']}: {d['gia_tri']}")
    muc = []
    for ten, khoa in (("Pivot", "pivot"), ("Mua tối đa", "vung_mua"), ("Cắt lỗ", "cat_lo"),
                      ("MT1 (+20%)", "muc_tieu_1"), ("MT2 (đo cán cờ)", "muc_tieu_2"), ("Dừng lỗ động", "dung_lo_dong")):
        if not _nan(k.get(khoa)):
            muc.append(f"{ten} {g(k[khoa])}")
    if not _nan(k.get("pivot_ung_vien")):
        muc.append(f"Đỉnh nền ứng viên {g(k['pivot_ung_vien'])} (chưa đủ điều kiện)")
    if muc:
        out.append("Mức giá: " + " · ".join(muc))
    out.append(f"Đường MA ngày: MA10 {g(k['ma10'])} · MA20 {g(k['ma20'])} ({pt(k['cach_ma20'], True, 0)}) · "
               f"MA50 {g(k['ma50'])} ({pt(k['cach_ma50'], True, 0)}) · MA100 {g(k['ma100'])} · MA250 {g(k['ma250'])} · "
               f"RSI {g(k['rsi'], 0)}")
    t = k.get("tuan") or {}
    if t:
        out.append(f"Khung tuần: MA20 tuần {g(t['ma20_tuan'])} · MA50 tuần {g(t['ma50_tuan'])} · KL tuần này "
                   f"{kl(t['kl_tuan'])} ({lan(t['kl_tuan_ratio'])} TB20 tuần) · {t['tuan_tang_lien_tiep']} tuần tăng liên tiếp")
    if not _nan(k.get("rs_vs_vnindex")):
        out.append(f"Sức mạnh giá: 3 tháng {pt(k['hieu_suat_3t'], True, 0)}, hơn VN-Index {pt(k['rs_vs_vnindex'], True, 0)}"
                   + (f", RS {g(k.get('rs_pct'), 0)}" if not _nan(k.get("rs_pct")) else ""))
    for cb in k.get("canh_bao") or []:
        out.append(f"  ! {cb}")
    for gc in k.get("ghi_chu") or []:
        out.append(f"  • {gc}")
    ls = k.get("lich_su") or []
    if ls:
        out.append("Lịch sử tín hiệu breakout của mã (mua giá đóng cửa, cắt lỗ theo quy tắc, chốt +20%):")
        for h in ls[-6:]:
            out.append(f"  {ngay_vn(h['ngay'])}: vào {g(h['gia_vao'])} (KL {lan(h['kl_ratio'])}) → {h['ket_qua']} "
                       f"{pt(h['lai'], True, 1)} sau {h['so_phien']} phiên; lãi tối đa {pt(h['lai_max'], True, 0)}")
    return "\n".join(out)


# ---------------------------------------------------------------------------------------------- Markdown
def _phan_nhat_ky_md(bc: dict) -> list[str]:
    nk = bc.get("nhat_ky") or {}
    out = []
    if nk.get("bat"):
        tk, (muc, giai_thich) = nk["thong_ke"], nk["tin_cay"]
        out += [f"## 📒 Nhật ký gợi ý – hiệu quả thực tế ({tk['tong']} gợi ý)", "",
                f"**Độ tin cậy: {muc}.** {giai_thich}", ""]
        out += [f"- {d}" for d in dong_thong_ke(tk)]
        if nk.get("moi"):
            out.append("- Gợi ý mới ghi vào nhật ký lần này: **" + ", ".join(nk["moi"]) + "**")
        out.append("")
        mo, dong = _nk_mo(nk), _nk_dong(nk)
        if mo:
            out += ["### Đang giữ", "", bang_md(COT_NK_MO, mo), ""]
        if dong:
            out += [f"### Đã bán ({len(dong)})", "", bang_md(COT_NK_DONG, dong), ""]
    kd = nk.get("kiem_dinh")
    if kd and kd.get("thong_ke", {}).get("tong"):
        muc, giai_thich = nk["tin_cay_kiem_dinh"]
        out += [f"## 🧪 Kiểm định quá khứ (ước tính): {kd['so_ma']} mã, {ngay_vn(kd['tu_ngay'])} → {ngay_vn(kd['ngay'])}",
                "", f"**Độ tin cậy: {muc}.** {giai_thich}", ""]
        out += [f"- {d}" for d in dong_thong_ke(kd["thong_ke"], "tín hiệu")]
        out.append("")
        if kd.get("gan_nhat"):
            out += ["Tín hiệu gần nhất:", "", bang_md(COT_KIEM_DINH, list(reversed(kd["gan_nhat"]))), ""]
    if out:
        out += [f"*{Y_NGHIA_CHI_SO}*", ""]
    return out


def markdown(bc: dict) -> str:
    p, tt = bc["phien"], bc["thi_truong"]
    out = [f"# Lọc cổ phiếu (lướt sóng + mẫu DRI/MSR) – {bc['thoi_diem']}", "",
           f"**Phiên:** {p.ten} ({p.sao_txt}) · **Dữ liệu đến:** {ngay_vn(bc['ngay_du_lieu'])} · "
           f"**Số mã phân tích:** {bc['so_ma']} · **Nguồn:** {bc['nguon']}", ""]
    if bc.get("canh_bao_phien"):
        out += [f"> ⚠️ {bc['canh_bao_phien']}", ""]
    out += ["## Bối cảnh thị trường", "",
            f"VN-Index **{g(tt['gia'])}** ({pt(tt['thay_doi'])}) – **{tt['trang_thai']}**. {tt['loi_khuyen']}."
            + (f" Số ngày phân phối trong 25 phiên: {tt['ngay_phan_phoi']}." if tt.get("ngay_phan_phoi") is not None else ""),
            ""]
    if tom_tat_tin_cay(bc):
        out += [f"**{tom_tat_tin_cay(bc)}**", ""]
    out += _phan_luot_song_md(bc)
    nhom = bc["nhom"]
    if tt.get("muc", 2) < 2 and (nhom.get("MUA") or nhom.get("MUA_GAN")) and not bc.get("chi_nhat_ky"):
        out += [f"> {CANH_BAO_BREAKOUT}", ""]
    bieu_tuong = {"MUA": "🟢", "MUA_GAN": "🟢", "CHO": "👀", "XA": "🟠", "CHAY": "🔵", "BAN": "🔴"}
    co = bool(bc.get("chi_nhat_ky"))
    for ma_nhom in (() if bc.get("chi_nhat_ky") else ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN")):
        ds = nhom.get(ma_nhom) or []
        if not ds:
            continue
        co = True
        out += [f"## {bieu_tuong[ma_nhom]} {NHOM[ma_nhom]} ({len(ds)})", "",
                bang_md(_cot_bang(ma_nhom, bc["co_von"]), ds), ""]
        for k in ds[:20]:
            dong = [k["hanh_dong"]] + (k.get("ghi_chu") or []) + (k["canh_bao"][:2] if ma_nhom != "BAN" else [])
            dong = [x for x in dong if x]
            if dong:
                out.append(f"- **{k['ma']}**: " + " · ".join(dong))
        out.append("")
    if not co:
        out += ["Không có mã nào khớp mẫu hình – đứng ngoài cũng là một vị thế.", ""]
    out += _phan_nhat_ky_md(bc)
    if bc.get("danh_muc"):
        out += ["## 💼 Danh mục của bạn", "", bang_md(COT_DANH_MUC, bc["danh_muc"]), ""]
    if bc.get("chi_tiet"):
        out += ["## Phân tích chi tiết", ""]
        for k in bc["chi_tiet"]:
            out += ["```", chi_tiet_text(k), "```", ""]
    out += ["---", "",
            "*" + ("KL/TB20 có dấu \\* là khối lượng dự phóng cả ngày khi chạy trong phiên. " if bc.get("du_phong") else "")
            + _y_nghia_rs() + "*", "",
            "**Giờ chạy khuyến nghị:**", "",
            "| Thời điểm | Mức | Lệnh | Vì sao |", "|---|---|---|---|"]
    out += [f"| {a} | {b} | `{c}` | {d} |" for a, b, c, d in LICH_CHAY]
    out += ["", "*Công cụ hỗ trợ ra quyết định, không phải lời khuyên đầu tư. Luôn tuân thủ cắt lỗ.*"]
    return "\n".join(out)


# ---------------------------------------------------------------------------------------------- HTML
_CSS = """
:root{--bg:#f7f7f5;--card:#fff;--fg:#1d1d1f;--mut:#6b6b70;--line:#e3e3e0;--g:#11865a;--r:#c4322b;--o:#c26b00;
--b:#2f62c9;--y:#8a6d00}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--card:#1d1d20;--fg:#ececef;--mut:#9c9ca3;--line:#2e2e33;
--g:#3fbf87;--r:#f06b63;--o:#f0a040;--b:#7aa5ff;--y:#e0c050}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif}
main{max-width:1180px;margin:0 auto;padding:20px 16px 60px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:28px 0 8px}h3{font-size:15px;margin:18px 0 6px}
.mut{color:var(--mut)}.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child,td.l,th.l{text-align:left}th{color:var(--mut);font-weight:600}
td.ma{font-weight:700}td.dai{white-space:normal;min-width:240px;text-align:left}.chi-so td.dai{min-width:0}.chi-so td{vertical-align:top}.nho{font-size:12.5px;margin-top:2px}.badge{display:inline-block;padding:1px 8px;border-radius:99px;font-size:12px;font-weight:600}
.MUA,.MUA_GAN{color:var(--g)}.CHO{color:var(--b)}.XA{color:var(--o)}.CHAY{color:var(--b)}.BAN{color:var(--r)}
ul{margin:6px 0 0 18px;padding:0}li{margin:2px 0}pre{white-space:pre-wrap;font-size:13px}
"""


def _bang_html(cot, dong) -> str:
    th = "".join(f"<th class='{'l' if c[0] in ('Lý do', 'Hành động', 'Sàn') else ''}'>{html.escape(c[0])}</th>"
                 for c in cot)
    rows = []
    for x in dong:
        tds = []
        for i, (ten, f) in enumerate(cot):
            lop = "ma" if i == 0 else ("dai" if ten in ("Lý do", "Hành động") else
                                       ("l" if ten in ("Sàn", "Lý do bán", "Kết quả") else ""))
            tds.append(f"<td class='{lop}'>{html.escape(str(f(x)))}</td>")
        rows.append("<tr>" + "".join(tds) + "</tr>")
    return f"<div class='wrap'><table><thead><tr>{th}</tr></thead><tbody>{''.join(rows)}</tbody></table></div>"


def _bang_chi_so_html(tk: dict, ten: str = "gợi ý") -> str:
    """Bảng chỉ số kèm ý nghĩa bằng lời, dễ đọc trên điện thoại."""
    e = html.escape
    hang = [(f"Số {ten}", f"{tk['tong']} ({tk['da_dong']} đã bán, {tk['dang_mo']} đang giữ)", "")]
    if tk["da_dong"]:
        hang += [
            ("Tỷ lệ thắng", f"{pt(tk['ty_le_thang'], False, 0)} ({tk['thang']} thắng / {tk['thua']} thua)",
             "% lệnh đã bán có lãi"),
            ("Lãi/lỗ bình quân mỗi lệnh", pt(tk["lai_tb"]), "dương là công cụ đang kiếm được tiền"),
            ("Lệnh thắng / thua trung bình", f"{pt(tk['lai_tb_thang'])} / {pt(tk['lo_tb_thua'])}",
             "lãi khi đúng phải lớn hơn lỗ khi sai"),
            ("Hệ số lợi nhuận", _hs(tk["he_so_loi_nhuan"]), "tổng % lãi ÷ tổng % lỗ; > 1,5 là tốt"),
        ]
    if tk.get("da_ro"):
        hang.append(("Tỷ lệ chính xác", f"{pt(tk['ty_le_chinh_xac'], False, 0)} ({tk['chinh_xac']}/{tk['da_ro']})",
                     f"% {ten} chạm mục tiêu 1 (≈ +20%) trước khi phải bán"))
    if tk["dang_mo"]:
        hang.append(("Đang giữ – lãi/lỗ tạm tính", pt(tk["lai_tb_mo"]), f"bình quân các {ten} chưa bán"))
    if not _nan(tk.get("vuot_vnindex_tb")):
        hang.append(("Hơn VN-Index mỗi lệnh", pt(tk["vuot_vnindex_tb"]), "so với VN-Index cùng thời gian nắm giữ"))
    tr = "".join(f"<tr><td class='dai'>{e(a)}" + (f"<div class='nho mut'>{e(c)}</div>" if c else "") +
                 f"</td><td><b>{e(b)}</b></td></tr>" for a, b, c in hang)
    return f"<table class='chi-so'><tbody>{tr}</tbody></table>"


def _phan_nhat_ky_html(bc: dict) -> list[str]:
    e = html.escape
    nk = bc.get("nhat_ky") or {}
    out = []
    if nk.get("bat"):
        tk, (muc, giai_thich) = nk["thong_ke"], nk["tin_cay"]
        out.append(f"<h2>📒 Nhật ký gợi ý – hiệu quả thực tế ({tk['tong']} gợi ý)</h2>")
        out.append(f"<p class='card'><b>Độ tin cậy: {e(muc)}.</b> {e(giai_thich)}</p>")
        if tk["tong"]:
            out.append(_bang_chi_so_html(tk))
        else:
            out.append(f"<p class='mut'>{e(dong_thong_ke(tk)[0])}</p>")
        if nk.get("moi"):
            out.append(f"<p>Gợi ý mới ghi vào nhật ký lần này: <b>{e(', '.join(nk['moi']))}</b></p>")
        mo, dong = _nk_mo(nk), _nk_dong(nk)
        if mo:
            out.append("<h3>Đang giữ</h3>" + _bang_html(COT_NK_MO, mo))
        if dong:
            out.append(f"<h3>Đã bán ({len(dong)})</h3>" + _bang_html(COT_NK_DONG, dong))
    kd = nk.get("kiem_dinh")
    if kd and kd.get("thong_ke", {}).get("tong"):
        muc, giai_thich = nk["tin_cay_kiem_dinh"]
        out.append(f"<h2>🧪 Kiểm định quá khứ (ước tính)</h2><p class='mut'>Mọi tín hiệu breakout của {kd['so_ma']} mã từ "
                   f"{e(ngay_vn(kd['tu_ngay']))} đến {e(ngay_vn(kd['ngay']))}, bán theo đúng quy tắc của công cụ.</p>")
        out.append(f"<p class='card'><b>Độ tin cậy: {e(muc)}.</b> {e(giai_thich)}</p>")
        out.append(_bang_chi_so_html(kd["thong_ke"], "tín hiệu"))
        if kd.get("gan_nhat"):
            out.append("<h3>Tín hiệu gần nhất</h3>" + _bang_html(COT_KIEM_DINH, list(reversed(kd["gan_nhat"]))))
    if out:
        out.append(f"<p class='mut'>{e(Y_NGHIA_CHI_SO)}</p>")
    return out


def html_bao_cao(bc: dict) -> str:
    p, tt = bc["phien"], bc["thi_truong"]
    e = html.escape
    out = [f"<!doctype html><html lang='vi'><head><meta charset='utf-8'><meta name='viewport' "
           f"content='width=device-width,initial-scale=1'><title>Lọc cổ phiếu {e(bc['thoi_diem'])}</title>"
           f"<style>{_CSS}</style></head><body><main>",
           f"<h1>Lọc cổ phiếu</h1><div class='mut'>{e(bc['thoi_diem'])} · {e(p.ten)} ({p.sao_txt}) · "
           f"dữ liệu đến {e(ngay_vn(bc['ngay_du_lieu']))} · {bc['so_ma']} mã · nguồn {e(bc['nguon'])}</div>"]
    if bc.get("canh_bao_phien"):
        out.append(f"<p class='card BAN'>⚠️ {e(bc['canh_bao_phien'])}</p>")
    out.append(f"<h2>Bối cảnh thị trường</h2><div class='card'>VN-Index <b>{g(tt['gia'])}</b> ({pt(tt['thay_doi'])}) – "
               f"<b>{e(tt['trang_thai'])}</b>. {e(tt['loi_khuyen'])}."
               + (f"<br><b>{e(tom_tat_tin_cay(bc))}</b>" if tom_tat_tin_cay(bc) else "") + "</div>")
    out += _phan_luot_song_html(bc)
    nhom = bc["nhom"]
    if tt.get("muc", 2) < 2 and (nhom.get("MUA") or nhom.get("MUA_GAN")) and not bc.get("chi_nhat_ky"):
        out.append(f"<p class='card BAN'>{e(CANH_BAO_BREAKOUT)}</p>")
    co = bool(bc.get("chi_nhat_ky"))
    for ma_nhom in (() if bc.get("chi_nhat_ky") else ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN")):
        ds = nhom.get(ma_nhom) or []
        if not ds:
            continue
        co = True
        out.append(f"<h2 class='{ma_nhom}'>{e(NHOM[ma_nhom])} ({len(ds)})</h2>")
        out.append(_bang_html(_cot_bang(ma_nhom, bc["co_von"]), ds))
        li = []
        for k in ds[:20]:
            dong = [k["hanh_dong"]] + (k.get("ghi_chu") or []) + (k["canh_bao"][:2] if ma_nhom != "BAN" else [])
            dong = [x for x in dong if x]
            if dong:
                li.append(f"<li><b>{e(k['ma'])}</b>: {e(' · '.join(dong))}</li>")
        if li:
            out.append("<ul>" + "".join(li) + "</ul>")
    if not co:
        out.append("<p class='card'>Không có mã nào khớp mẫu hình – đứng ngoài cũng là một vị thế.</p>")
    out += _phan_nhat_ky_html(bc)
    if bc.get("danh_muc"):
        out.append("<h2>Danh mục của bạn</h2>" + _bang_html(COT_DANH_MUC, bc["danh_muc"]))
    for k in bc.get("chi_tiet") or []:
        out.append(f"<h2>{e(k['ma'])}</h2><pre class='card'>{e(chi_tiet_text(k))}</pre>")
    lich = "".join(f"<tr><td class='l'>{e(a)}</td><td>{b}</td><td class='l'><code>{e(c)}</code></td>"
                   f"<td class='dai'>{e(d)}</td></tr>" for a, b, c, d in LICH_CHAY)
    out.append("<h2>Giờ chạy khuyến nghị</h2><div class='wrap'><table><thead><tr><th class='l'>Thời điểm</th><th>Mức</th>"
               f"<th class='l'>Lệnh</th><th class='l'>Vì sao</th></tr></thead><tbody>{lich}</tbody></table></div>")
    out.append(f"<p class='mut'>{'KL có dấu * là khối lượng dự phóng cả ngày. ' if bc.get('du_phong') else ''}"
               f"{e(_y_nghia_rs())} Công cụ hỗ trợ ra quyết "
               "định, không phải lời khuyên đầu tư; luôn tuân thủ cắt lỗ.</p></main></body></html>")
    return "\n".join(out)


# ---------------------------------------------------------------------------------------------- CSV
COT_CSV = ["ma", "san", "ngay", "trang_thai", "nhom", "diem", "gia", "thay_doi", "kl", "kl_ratio", "gtgd20",
           "pivot", "vung_mua", "cat_lo", "muc_tieu_1", "muc_tieu_2", "dung_lo_dong", "cach_pivot",
           "so_tuan_nen", "bien_do_nen", "can_cung", "tang_truoc_nen", "gan_dinh", "ngay_breakout",
           "lai_tu_pivot", "rs_pct", "rs_vs_vnindex", "ma20", "ma50", "cach_ma20", "hanh_dong", "canh_bao", "ghi_chu"]


def ghi_csv(ket_qua: list[dict], duong_dan: str):
    with open(duong_dan, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COT_CSV)
        for k in sorted(ket_qua, key=lambda x: (THU_TU.index(x["trang_thai"]), -x["diem"])):
            hang = []
            for c in COT_CSV:
                v = k.get(c)
                if isinstance(v, list):
                    v = " | ".join(v)
                elif isinstance(v, float):
                    v = "" if math.isnan(v) else round(v, 4)
                hang.append(v)
            w.writerow(hang)


COT_CSV_NHAT_KY = ["id", "chien_luoc", "ma", "san", "loai", "ngay_goi_y", "ngay_mua", "ngay_breakout", "gia_vao", "pivot", "cat_lo",
                   "muc_tieu_1", "muc_tieu_2", "trang_thai", "ket_qua", "ngay_dong", "gia_dong", "gia_hien_tai",
                   "ngay_cap_nhat", "lai", "lai_max", "lo_max", "so_phien", "cham_mt1", "cham_mt2", "dung_lo",
                   "vnindex_lai", "vuot_vnindex", "diem", "rs_pct", "kl_ratio", "thi_truong"]


def ghi_csv_nhat_ky(goi_y: list[dict], duong_dan: str):
    """Nhật ký gợi ý dạng bảng tính (mở được bằng Excel)."""
    with open(duong_dan, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COT_CSV_NHAT_KY)
        for x in sorted(goi_y, key=lambda x: (x.get("ngay_goi_y") or "", x.get("ma") or "")):
            w.writerow(["" if x.get(c) is None or (isinstance(x.get(c), float) and math.isnan(x[c]))
                        else (round(x[c], 4) if isinstance(x.get(c), float) else x[c]) for c in COT_CSV_NHAT_KY])


def ghi_tat_ca(bc: dict, thu_muc: str, ten: str) -> list[str]:
    os.makedirs(thu_muc, exist_ok=True)
    tep = []
    md = markdown(bc)
    for duoi, noi_dung in (("md", md), ("html", html_bao_cao(bc))):
        p = os.path.join(thu_muc, f"{ten}.{duoi}")
        with open(p, "w", encoding="utf-8") as f:
            f.write(noi_dung)
        with open(os.path.join(thu_muc, f"moi-nhat.{duoi}"), "w", encoding="utf-8") as f:
            f.write(noi_dung)
        tep.append(p)
    if bc["tat_ca"]:
        p = os.path.join(thu_muc, f"{ten}.csv")
        ghi_csv(bc["tat_ca"], p)
        tep.append(p)
    nk = bc.get("nhat_ky") or {}
    if nk.get("bat") and nk.get("goi_y"):
        p = os.path.join(thu_muc, "nhat-ky-goi-y.csv")
        ghi_csv_nhat_ky(nk["goi_y"], p)
        tep.append(p)
    return tep
