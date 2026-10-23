"""Nhật ký gợi ý: ghi lại mọi gợi ý MUA của công cụ rồi theo dõi lời/lỗ thực tế của từng gợi ý.

Mỗi gợi ý được coi là "mua" ở giá đóng cửa của phiên mà công cụ lần đầu đưa ra gợi ý, sau đó được theo dõi theo đúng
quy tắc bán của công cụ (cắt lỗ, hoà vốn, breakout thất bại, dừng lỗ động – xem chienluoc.mo_phong_lenh). Từ đó đo:
tỷ lệ thắng/thua, tỷ lệ chính xác (chạm mục tiêu 1 trước khi phải bán), lãi/lỗ bình quân, so với VN-Index cùng kỳ.

Tệp `nhat-ky/goi-y.json` được commit vào git. Trên Claude Code (web), mỗi cuộc trò chuyện làm việc trên một nhánh git
riêng, nên khi khởi động công cụ gộp nhật ký của mọi nhánh trên GitHub (`dong_bo_git`) để không mất lịch sử.
"""
from __future__ import annotations

import json
import math
import os
import subprocess

import pandas as pd

from .cauhinh import CauHinh
from .chibao import sma
from .chienluoc import KET_QUA_MO, mo_phong_lenh
from .luotsong import mo_phong_mot_ma
from .thoigian import gio_vn

PHIEN_BAN = 1
TRANG_THAI_GHI = ("MUA", "MUA_GAN")
CAP_NHAT_TU_KQ = ("ket_qua", "ngay_dong", "gia_dong", "gia_hien_tai", "ngay_cap_nhat", "lai", "lai_max", "lo_max",
                  "so_phien", "cham_mt1", "cham_mt2", "dung_lo")


def _ok(x) -> bool:
    return isinstance(x, (int, float)) and not (isinstance(x, float) and (math.isnan(x) or math.isinf(x)))


def _sach(x):
    """Chuẩn hoá để ghi JSON: NaN/vô cực → null, số thực làm tròn 4 chữ số."""
    if isinstance(x, dict):
        return {k: _sach(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_sach(v) for v in x]
    if hasattr(x, "item") and not isinstance(x, (str, bytes)):  # số numpy
        x = x.item()
    if isinstance(x, float):
        return round(x, 4) if _ok(x) else None
    return x


def rong() -> dict:
    return {"phien_ban": PHIEN_BAN, "cap_nhat": "", "goi_y": [], "kiem_dinh": None, "theo_doi": None}


def tai(duong_dan: str) -> dict:
    try:
        with open(duong_dan, encoding="utf-8") as f:
            nk = json.load(f)
    except (OSError, ValueError):
        return rong()
    if not isinstance(nk, dict) or not isinstance(nk.get("goi_y"), list):
        return rong()
    nk.setdefault("kiem_dinh", None)
    nk.setdefault("theo_doi", None)
    return nk


def luu(duong_dan: str, nk: dict):
    os.makedirs(os.path.dirname(os.path.abspath(duong_dan)), exist_ok=True)
    nk["cap_nhat"] = gio_vn().strftime("%Y-%m-%d %H:%M")
    tmp = duong_dan + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(_sach(nk), f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, duong_dan)


def _noi_dung(nk: dict) -> str:
    return json.dumps(_sach({k: v for k, v in nk.items() if k != "cap_nhat"}), sort_keys=True, ensure_ascii=False)


def luu_neu_doi(duong_dan: str, nk: dict) -> bool:
    """Chỉ ghi khi nội dung thật sự thay đổi (để không tạo commit git vô ích). Trả về True nếu đã ghi."""
    if os.path.exists(duong_dan) and _noi_dung(tai(duong_dan)) == _noi_dung(nk):
        return False
    luu(duong_dan, nk)
    return True


def gop(*cac_ban: dict) -> dict:
    """Gộp nhiều bản nhật ký (ví dụ từ nhiều nhánh git): hợp theo id, trùng id thì giữ bản được đánh giá mới nhất."""
    tong = rong()
    theo_id: dict[str, dict] = {}
    for nk in cac_ban:
        if not nk:
            continue
        for g in nk.get("goi_y") or []:
            gid = g.get("id")
            if not gid:
                continue
            cu = theo_id.get(gid)
            if cu is None or (g.get("ngay_cap_nhat") or "") > (cu.get("ngay_cap_nhat") or ""):
                theo_id[gid] = g
        for khoa, moc in (("kiem_dinh", "ngay"), ("theo_doi", "ngay_du_lieu")):  # giữ bản mới nhất
            ban = nk.get(khoa)
            if ban and (not tong.get(khoa) or (ban.get(moc) or "") > (tong[khoa].get(moc) or "")):
                tong[khoa] = ban
    tong["goi_y"] = sorted(theo_id.values(), key=lambda g: (g.get("ngay_goi_y") or "", g.get("ma") or ""))
    return tong


# ----------------------------------------------------------------------------------------------
# Đồng bộ qua git (mỗi cuộc trò chuyện trên Claude Code web là một nhánh riêng)
# ----------------------------------------------------------------------------------------------
def _git(tham_so: list[str], cwd: str, timeout: float = 60) -> str | None:
    try:
        r = subprocess.run(["git", *tham_so], cwd=cwd, capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=timeout)
    except (OSError, subprocess.SubprocessError):
        return None
    return r.stdout if r.returncode == 0 else None


def dong_bo_git(duong_dan: str, log=print) -> int:
    """Gộp nhật ký từ mọi nhánh trên remote `origin` vào tệp trên máy.
    Trả về số gợi ý nhận thêm; -1 nếu thư mục không nằm trong kho git."""
    thu_muc = os.path.dirname(os.path.abspath(duong_dan))
    os.makedirs(thu_muc, exist_ok=True)
    goc = _git(["rev-parse", "--show-toplevel"], thu_muc)
    if not goc:
        return -1
    goc = goc.strip()
    tuong_doi = os.path.relpath(os.path.abspath(duong_dan), goc).replace(os.sep, "/")
    if _git(["fetch", "--quiet", "origin"], goc, timeout=180) is None:
        log("  ! Không lấy được nhật ký mới nhất từ GitHub (git fetch lỗi) – dùng nhật ký có sẵn trên máy")
    cac_ban = []
    for ref in (_git(["for-each-ref", "--format=%(refname)", "refs/remotes/origin"], goc) or "").split():
        if ref.endswith("/HEAD"):
            continue
        noi_dung = _git(["show", f"{ref}:{tuong_doi}"], goc)
        if noi_dung:
            try:
                cac_ban.append(json.loads(noi_dung))
            except ValueError:
                pass
    cu = tai(duong_dan)
    tong = gop(cu, *cac_ban)
    them = len(tong["goi_y"]) - len(cu["goi_y"])
    if _noi_dung(tong) != _noi_dung(cu):
        luu(duong_dan, tong)
    return max(them, 0)


# ----------------------------------------------------------------------------------------------
# Ghi gợi ý mới và đánh giá lại
# ----------------------------------------------------------------------------------------------
def _gia_ngay(df: pd.DataFrame | None, ngay: str):
    """Giá đóng cửa của `df` tại ngày `ngay` (hoặc phiên gần nhất trước đó)."""
    if df is None or df.empty or not ngay:
        return None
    s = df["close"][df.index <= pd.Timestamp(ngay)]
    return float(s.iat[-1]) if len(s) else None


def ghi_goi_y_moi(nk: dict, ket_qua: list[dict], thi_truong: dict, vnindex: pd.DataFrame | None,
                  cfg: CauHinh | None = None) -> list[dict]:
    """Thêm vào nhật ký các gợi ý MUA chưa có (mỗi nhịp breakout của một mã chỉ ghi một lần).
    Chỉ gọi với kết quả phân tích trên nến đã hoàn chỉnh – tín hiệu tạm thời trong phiên không được ghi."""
    cfg = cfg or CauHinh()
    da_co = {g.get("id") for g in nk["goi_y"]}
    moi = []
    for k in ket_qua:
        if k.get("trang_thai") not in TRANG_THAI_GHI or k.get("du_phong_kl") or not k.get("ngay_breakout"):
            continue
        gid = f"{k['ma']}-{k['ngay_breakout']}"
        if gid in da_co:
            continue
        gia = float(k["gia"])
        cat_lo = max(float(k["cat_lo"]), gia * (1 - cfg.cat_lo_max))  # không để lỗ quá 7% từ giá vào
        g = {
            "id": gid, "ma": k["ma"], "san": k.get("san") or "", "loai": k["trang_thai"],
            "ngay_goi_y": k["ngay"], "ngay_breakout": k["ngay_breakout"], "ghi_luc": gio_vn().strftime("%Y-%m-%d %H:%M"),
            "gia_vao": gia, "pivot": k["pivot"], "cat_lo": cat_lo,
            "muc_tieu_1": k.get("muc_tieu_1"), "muc_tieu_2": k.get("muc_tieu_2"),
            "kl_ratio": k.get("kl_ratio_breakout"), "diem": k.get("diem"), "rs_pct": k.get("rs_pct"),
            "so_tuan_nen": k.get("so_tuan_nen"), "thi_truong": thi_truong.get("trang_thai", ""),
            "muc_thi_truong": thi_truong.get("muc"), "vnindex_vao": _gia_ngay(vnindex, k["ngay"]),
            "trang_thai": "DANG_MO", "ket_qua": KET_QUA_MO, "ngay_dong": "", "gia_dong": None,
            "gia_hien_tai": gia, "ngay_cap_nhat": k["ngay"], "lai": 0.0, "lai_max": 0.0, "lo_max": 0.0,
            "so_phien": 0, "cham_mt1": "", "cham_mt2": "", "dung_lo": cat_lo,
        }
        nk["goi_y"].append(g)
        da_co.add(gid)
        moi.append(g)
    return moi


LUOT_SONG = "luot_song"


def chien_luoc(g: dict) -> str:
    return g.get("chien_luoc") or "nen_chat"


def ghi_goi_y_luot_song(nk: dict, goi_y: list[dict], thi_truong: dict, vnindex: pd.DataFrame | None) -> list[dict]:
    """Ghi các gợi ý lướt sóng (tín hiệu cuối phiên, mua mở cửa phiên sau). Một mã đang có lệnh lướt sóng chưa đóng
    thì không ghi thêm. Chỉ gọi với dữ liệu đã chốt phiên (không ghi tín hiệu tạm thời trong phiên)."""
    da_co = {g.get("id") for g in nk["goi_y"]}
    dang_mo = {g["ma"] for g in nk["goi_y"] if chien_luoc(g) == LUOT_SONG and g.get("trang_thai") != "DA_DONG"}
    moi = []
    for k in goi_y:
        if k.get("du_phong_kl"):
            continue
        gid = f"{k['ma']}-LS-{k['ngay']}"
        if gid in da_co or k["ma"] in dang_mo:
            continue
        g = {
            "id": gid, "chien_luoc": LUOT_SONG, "ma": k["ma"], "san": k.get("san") or "", "loai": "LUOT_SONG",
            "ngay_goi_y": k["ngay"], "ghi_luc": gio_vn().strftime("%Y-%m-%d %H:%M"),
            "gia_tham_chieu": k["gia"], "xac_suat": k.get("p"), "chot_loi_pct": k["chot_loi_pct"],
            "cat_lo_pct": k["cat_lo_pct"], "han_phien": k["so_phien"], "ly_do": k.get("ly_do", []),
            "thi_truong": thi_truong.get("trang_thai", ""), "muc_thi_truong": thi_truong.get("muc"),
            "vnindex_vao": _gia_ngay(vnindex, k["ngay"]),
            "trang_thai": "CHO_MUA", "ket_qua": "Chờ mua", "gia_vao": None, "ngay_mua": "",
            "ngay_dong": "", "gia_dong": None, "gia_hien_tai": k["gia"], "ngay_cap_nhat": k["ngay"],
            "lai": None, "lai_max": None, "lo_max": None, "so_phien": 0, "cham_mt1": "", "cham_mt2": "",
            "cat_lo": k["cat_lo"], "muc_tieu_1": k["chot_loi"], "dung_lo": k["cat_lo"],
        }
        nk["goi_y"].append(g)
        da_co.add(gid)
        dang_mo.add(k["ma"])
        moi.append(g)
    return moi


def _cap_nhat_luot_song(g: dict, df: pd.DataFrame, vnindex: pd.DataFrame | None) -> bool:
    ngay = pd.Timestamp(g["ngay_goi_y"])
    if ngay not in df.index:
        return False
    # giá lịch sử có thể đã được điều chỉnh (cổ tức, tách cổ phiếu) → quy về giá lúc gợi ý
    he_so = float(df["close"].at[ngay]) / float(g["gia_tham_chieu"])
    if abs(he_so - 1) < 0.005:
        he_so = 1.0
    r = mo_phong_mot_ma(df, g.get("san") or "HOSE", ngay, g["chot_loi_pct"], g["cat_lo_pct"], int(g["han_phien"]))
    kq = r["ket_qua"]
    if kq == "Chờ mua":
        return False
    g["ngay_mua"] = r.get("ngay_mua", "")
    if _ok(r.get("gia_vao")):
        gv = r["gia_vao"] / he_so
        g.update({"gia_vao": gv, "cat_lo": gv * (1 - g["cat_lo_pct"]), "dung_lo": gv * (1 - g["cat_lo_pct"]),
                  "muc_tieu_1": gv * (1 + g["chot_loi_pct"])})
    if kq == "Không mua được":
        g.update({"trang_thai": "DA_DONG", "ket_qua": kq, "lai": None, "ngay_dong": g["ngay_mua"]})
        return True
    g.update({"lai": r.get("lai"), "lai_max": r.get("lai_max"), "lo_max": r.get("lo_max"),
              "so_phien": r.get("so_phien", 0), "he_so_dieu_chinh": he_so if he_so != 1.0 else None})
    if kq == "Đang giữ":
        g.update({"trang_thai": "DANG_MO", "ket_qua": KET_QUA_MO, "gia_hien_tai": r["gia_hien_tai"] / he_so,
                  "ngay_cap_nhat": r["ngay_cap_nhat"]})
        ngay_cuoi = r["ngay_cap_nhat"]
    else:
        g.update({"trang_thai": "DA_DONG", "ket_qua": kq, "ngay_dong": r["ngay_dong"],
                  "gia_dong": r["gia_dong"] / he_so, "gia_hien_tai": r["gia_dong"] / he_so,
                  "ngay_cap_nhat": r["ngay_dong"], "cham_mt1": r["ngay_dong"] if kq == "Chốt lời" else ""})
        ngay_cuoi = r["ngay_dong"]
    vn_vao, vn_cuoi = _gia_ngay(vnindex, g["ngay_goi_y"]), _gia_ngay(vnindex, ngay_cuoi)
    if vn_vao and vn_cuoi and _ok(g.get("lai")):
        g["vnindex_lai"] = vn_cuoi / vn_vao - 1
        g["vuot_vnindex"] = g["lai"] - g["vnindex_lai"]
    return True


def cap_nhat(nk: dict, du_lieu: dict[str, pd.DataFrame], vnindex: pd.DataFrame | None,
             cfg: CauHinh | None = None) -> int:
    """Đánh giá lại mọi gợi ý chưa đóng bằng dữ liệu mới nhất (chỉ truyền vào nến đã hoàn chỉnh).
    Trả về số gợi ý đã cập nhật. Gợi ý đã đóng được giữ nguyên."""
    cfg = cfg or CauHinh()
    dem = 0
    for g in nk["goi_y"]:
        if g.get("trang_thai") == "DA_DONG":
            continue
        df = du_lieu.get(g["ma"])
        ngay = pd.Timestamp(g["ngay_goi_y"])
        if df is None or df.empty or ngay not in df.index:
            continue
        if chien_luoc(g) == LUOT_SONG:
            dem += _cap_nhat_luot_song(g, df, vnindex)
            continue
        i_vao = int(df.index.get_loc(ngay))
        # giá lịch sử có thể đã được điều chỉnh (cổ tức, tách cổ phiếu) → quy đổi các mức giá theo cùng tỷ lệ
        he_so = float(df["close"].iat[i_vao]) / float(g["gia_vao"])
        if abs(he_so - 1) < 0.005:
            he_so = 1.0

        def quy_doi(x):
            return x * he_so if _ok(x) else float("nan")

        c, v = df["close"], df["volume"]
        r = mo_phong_lenh(df, sma(c, 10), sma(c, 20), i_vao, g["gia_vao"] * he_so, quy_doi(g["pivot"]),
                          quy_doi(g["cat_lo"]), quy_doi(g.get("muc_tieu_1")), quy_doi(g.get("muc_tieu_2")), cfg,
                          ma50=sma(c, 50), vol20_truoc=sma(v, 20, 10).shift(1))
        for k in ("gia_dong", "gia_hien_tai", "dung_lo"):
            if _ok(r[k]):
                r[k] = r[k] / he_so
        g.update({k: r[k] for k in CAP_NHAT_TU_KQ})
        g["trang_thai"] = "DANG_MO" if r["ket_qua"] == KET_QUA_MO else "DA_DONG"
        g["he_so_dieu_chinh"] = he_so if he_so != 1.0 else None
        vn_vao, vn_cuoi = _gia_ngay(vnindex, g["ngay_goi_y"]), _gia_ngay(vnindex, r["ngay_dong"] or r["ngay_cap_nhat"])
        if vn_vao and vn_cuoi:
            g["vnindex_lai"] = vn_cuoi / vn_vao - 1
            g["vuot_vnindex"] = g["lai"] - g["vnindex_lai"]
        dem += 1
    return dem


# ----------------------------------------------------------------------------------------------
# Thống kê độ tin cậy
# ----------------------------------------------------------------------------------------------
def thong_ke(lenh: list[dict]) -> dict:
    """Thống kê trên danh sách lệnh (gợi ý thực tế hoặc tín hiệu kiểm định quá khứ)."""
    dong = [x for x in lenh if x.get("ket_qua") and x["ket_qua"] != KET_QUA_MO and _ok(x.get("lai"))]
    mo = [x for x in lenh if x.get("ket_qua") == KET_QUA_MO]
    thang = [x for x in dong if x["lai"] > 0.0005]
    thua = [x for x in dong if x["lai"] < -0.0005]
    # đã rõ kết quả: đã đóng, hoặc dù chưa đóng nhưng đã chạm mục tiêu 1
    id_dong = {id(x) for x in dong}
    da_ro = [x for x in lenh if id(x) in id_dong or x.get("cham_mt1")]
    chinh_xac = [x for x in da_ro if x.get("cham_mt1")]

    def tb(ds, k="lai"):
        v = [x[k] for x in ds if _ok(x.get(k))]
        return sum(v) / len(v) if v else float("nan")

    tong_lai = sum(x["lai"] for x in thang)
    tong_lo = -sum(x["lai"] for x in thua)
    return {
        "tong": len(lenh), "da_dong": len(dong), "dang_mo": len(mo),
        "thang": len(thang), "thua": len(thua), "hoa": len(dong) - len(thang) - len(thua),
        "ty_le_thang": len(thang) / len(dong) if dong else float("nan"),
        "da_ro": len(da_ro), "chinh_xac": len(chinh_xac),
        "ty_le_chinh_xac": len(chinh_xac) / len(da_ro) if da_ro else float("nan"),
        "lai_tb": tb(dong), "lai_tb_thang": tb(thang), "lo_tb_thua": tb(thua),
        "he_so_loi_nhuan": tong_lai / tong_lo if tong_lo > 0 else (float("inf") if tong_lai > 0 else float("nan")),
        "lai_tb_mo": tb(mo), "vuot_vnindex_tb": tb(dong, "vuot_vnindex"), "so_phien_tb": tb(dong, "so_phien"),
        "lai_lon_nhat": max((x["lai"] for x in dong), default=float("nan")),
        "lo_lon_nhat": min((x["lai"] for x in dong), default=float("nan")),
    }


def danh_gia_tin_cay(tk: dict, kiem_dinh: bool = False) -> tuple[str, str]:
    """Kết luận bằng lời: (mức, giải thích). `kiem_dinh`: thống kê lấy từ kiểm định quá khứ."""
    n = tk["da_dong"]
    if n < 10:
        if kiem_dinh:
            return ("CHƯA ĐỦ DỮ LIỆU", f"Dữ liệu quá khứ chỉ có {n} tín hiệu đã kết thúc – quá ít để kết luận.")
        return ("CHƯA ĐỦ DỮ LIỆU",
                f"Mới có {n} lệnh đã đóng. Cần ít nhất 20–30 lệnh đã đóng mới kết luận được; "
                "trong lúc chờ, tham khảo phần kiểm định quá khứ.")
    tam = " (tạm thời)" if n < 30 else ""
    ky_vong, pf = tk["lai_tb"], tk["he_so_loi_nhuan"]
    mo_ta = (f"Trung bình mỗi lệnh {ky_vong * 100:+.1f}%, tổng lãi gấp {pf:.1f} lần tổng lỗ"
             if _ok(pf) else f"Trung bình mỗi lệnh {ky_vong * 100:+.1f}%")
    if ky_vong > 0 and (pf >= 1.5 or pf == float("inf")):
        return ("TIN CẬY" + tam, mo_ta + " – công cụ đang có lợi thế rõ, tiếp tục áp dụng và giữ kỷ luật cắt lỗ.")
    if ky_vong > 0:
        return ("CÓ LỢI THẾ NHẸ" + tam, mo_ta + " – có lãi nhưng mỏng; ưu tiên mã điểm cao và lúc thị trường thuận lợi.")
    return ("CHƯA HIỆU QUẢ" + tam, mo_ta + " – kỳ vọng âm: giảm tỷ trọng, chỉ mua khi thị trường thuận lợi, "
            "xem lại ngưỡng lọc.")


def tom_tat_kiem_dinh(lich_su_theo_ma: dict[str, list[dict]], ngay: str, so_ma: int) -> dict:
    """Gói kết quả kiểm định quá khứ (mọi tín hiệu breakout trong dữ liệu đã tải) để lưu kèm nhật ký."""
    lenh = [dict(h, ma=ma) for ma, ds in lich_su_theo_ma.items() for h in ds]
    lenh.sort(key=lambda h: h["ngay"])
    gon = ["ma", "ngay", "gia_vao", "ket_qua", "lai", "so_phien", "lai_max", "cham_mt1"]
    return {
        "ngay": ngay, "so_ma": so_ma, "tu_ngay": lenh[0]["ngay"] if lenh else "",
        "thong_ke": thong_ke(lenh),
        "gan_nhat": [{k: h.get(k) for k in gon} for h in lenh[-15:]],
    }
