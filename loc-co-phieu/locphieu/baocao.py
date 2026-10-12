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


# ---------------------------------------------------------------------------------------------- màn hình
def in_man_hinh(bc: dict) -> str:
    out = []
    p = bc["phien"]
    out.append("=" * 100)
    out.append(f"LỌC CỔ PHIẾU MẪU DRI/MSR – {bc['thoi_diem']}  |  {p.ten}  [{p.sao_txt}]")
    out.append(f"Dữ liệu đến phiên {ngay_vn(bc['ngay_du_lieu'])}  ·  {bc['so_ma']} mã đã phân tích  ·  nguồn: "
               f"{bc['nguon']}")
    if bc.get("canh_bao_phien"):
        out.append("! " + bc["canh_bao_phien"])
    out.append("=" * 100)
    tt = bc["thi_truong"]
    out.append(f"THỊ TRƯỜNG (VN-Index {g(tt['gia'])} {pt(tt['thay_doi'])}): {tt['trang_thai']}. {tt['loi_khuyen']}."
               + (f" Ngày phân phối 25 phiên: {tt['ngay_phan_phoi']}." if tt.get("ngay_phan_phoi") is not None else ""))
    nhom = bc["nhom"]
    for ma_nhom in ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN"):
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
    if not any(nhom.get(k) for k in ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN")):
        out.append("")
        out.append("Không có mã nào khớp mẫu hình hôm nay – đứng ngoài cũng là một vị thế.")
    if bc.get("danh_muc"):
        out.append("")
        out.append("■ DANH MỤC CỦA BẠN")
        out.append(bang_text(COT_DANH_MUC, bc["danh_muc"]))
    if bc.get("chi_tiet"):
        for k in bc["chi_tiet"]:
            out.append("")
            out.append(chi_tiet_text(k))
    if bc.get("kiem_dinh"):
        out.append("")
        out.append(bc["kiem_dinh"])
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
            out.append(f"  {'✓' if d['dat'] else '✗'} {d['ten']}: {d['gia_tri']}")
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
def markdown(bc: dict) -> str:
    p, tt = bc["phien"], bc["thi_truong"]
    out = [f"# Lọc cổ phiếu mẫu DRI/MSR – {bc['thoi_diem']}", "",
           f"**Phiên:** {p.ten} ({p.sao_txt}) · **Dữ liệu đến:** {ngay_vn(bc['ngay_du_lieu'])} · "
           f"**Số mã phân tích:** {bc['so_ma']} · **Nguồn:** {bc['nguon']}", ""]
    if bc.get("canh_bao_phien"):
        out += [f"> ⚠️ {bc['canh_bao_phien']}", ""]
    out += ["## Bối cảnh thị trường", "",
            f"VN-Index **{g(tt['gia'])}** ({pt(tt['thay_doi'])}) – **{tt['trang_thai']}**. {tt['loi_khuyen']}."
            + (f" Số ngày phân phối trong 25 phiên: {tt['ngay_phan_phoi']}." if tt.get("ngay_phan_phoi") is not None else ""),
            ""]
    nhom = bc["nhom"]
    bieu_tuong = {"MUA": "🟢", "MUA_GAN": "🟢", "CHO": "👀", "XA": "🟠", "CHAY": "🔵", "BAN": "🔴"}
    co = False
    for ma_nhom in ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN"):
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
    if bc.get("danh_muc"):
        out += ["## 💼 Danh mục của bạn", "", bang_md(COT_DANH_MUC, bc["danh_muc"]), ""]
    if bc.get("chi_tiet"):
        out += ["## Phân tích chi tiết", ""]
        for k in bc["chi_tiet"]:
            out += ["```", chi_tiet_text(k), "```", ""]
    if bc.get("kiem_dinh"):
        out += ["## Kiểm định tín hiệu trong quá khứ", "", "```", bc["kiem_dinh"], "```", ""]
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
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:28px 0 8px}
.mut{color:var(--mut)}.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child,td.l,th.l{text-align:left}th{color:var(--mut);font-weight:600}
td.ma{font-weight:700}td.dai{white-space:normal;min-width:240px;text-align:left}.badge{display:inline-block;padding:1px 8px;border-radius:99px;font-size:12px;font-weight:600}
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
            lop = "ma" if i == 0 else ("dai" if ten in ("Lý do", "Hành động") else ("l" if ten == "Sàn" else ""))
            tds.append(f"<td class='{lop}'>{html.escape(str(f(x)))}</td>")
        rows.append("<tr>" + "".join(tds) + "</tr>")
    return f"<div class='wrap'><table><thead><tr>{th}</tr></thead><tbody>{''.join(rows)}</tbody></table></div>"


def html_bao_cao(bc: dict) -> str:
    p, tt = bc["phien"], bc["thi_truong"]
    e = html.escape
    out = [f"<!doctype html><html lang='vi'><head><meta charset='utf-8'><meta name='viewport' "
           f"content='width=device-width,initial-scale=1'><title>Lọc cổ phiếu {e(bc['thoi_diem'])}</title>"
           f"<style>{_CSS}</style></head><body><main>",
           f"<h1>Lọc cổ phiếu mẫu DRI/MSR</h1><div class='mut'>{e(bc['thoi_diem'])} · {e(p.ten)} ({p.sao_txt}) · "
           f"dữ liệu đến {e(ngay_vn(bc['ngay_du_lieu']))} · {bc['so_ma']} mã · nguồn {e(bc['nguon'])}</div>"]
    if bc.get("canh_bao_phien"):
        out.append(f"<p class='card BAN'>⚠️ {e(bc['canh_bao_phien'])}</p>")
    out.append(f"<h2>Bối cảnh thị trường</h2><div class='card'>VN-Index <b>{g(tt['gia'])}</b> ({pt(tt['thay_doi'])}) – "
               f"<b>{e(tt['trang_thai'])}</b>. {e(tt['loi_khuyen'])}.</div>")
    nhom = bc["nhom"]
    co = False
    for ma_nhom in ("MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN"):
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
    if bc.get("danh_muc"):
        out.append("<h2>Danh mục của bạn</h2>" + _bang_html(COT_DANH_MUC, bc["danh_muc"]))
    for k in bc.get("chi_tiet") or []:
        out.append(f"<h2>{e(k['ma'])}</h2><pre class='card'>{e(chi_tiet_text(k))}</pre>")
    if bc.get("kiem_dinh"):
        out.append(f"<h2>Kiểm định tín hiệu</h2><pre class='card'>{e(bc['kiem_dinh'])}</pre>")
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
    p = os.path.join(thu_muc, f"{ten}.csv")
    ghi_csv(bc["tat_ca"], p)
    tep.append(p)
    return tep
