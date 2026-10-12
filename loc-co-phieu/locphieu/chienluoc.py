"""Chiến lược "nền chặt sát đỉnh → bùng nổ khối lượng", rút ra từ DRI và MSR (breakout tuần 21–25/9/2026).

Trình tự mẫu hình (xem PHAN-TICH-DRI-MSR.md):
 1. Xu hướng lớn đi lên: giá ≥ MA100 (≈ MA20 tuần), MA100 đi lên và ≥ MA250 (≈ MA50 tuần).
 2. Rũ bỏ rồi tăng mạnh ("cán cờ"): từ đáy trong 12 tuần trước nền tăng ≥ 15%.
 3. Nền tích lũy chặt sát đỉnh 2–6 tuần: biên độ ≤ 12% (đóng cửa ≤ 8%), không hồi quá 50% nhịp tăng,
    có giai đoạn cạn cung (KL TB 5 phiên ≤ 75% KL TB 50 phiên), đỉnh nền ≥ 75% đỉnh 1 năm.
 4. Điểm mua: phiên đóng cửa vượt đỉnh nền (pivot) với KL ≥ 1,5× TB 20 phiên, đóng cửa nửa trên nến.
 5. Quản trị: cắt lỗ ≤ 7% / thủng đáy nền; chốt một phần khi +20% hoặc tăng nóng;
    phần còn lại giữ đến khi đóng cửa dưới MA20 kèm KL lớn (dừng lỗ động).
"""
from __future__ import annotations

import math

import numpy as np
import pandas as pd

from .cauhinh import CauHinh
from .chibao import hieu_suat, nen_tuan, rs_tho, rsi, sma

COT = ["open", "high", "low", "close", "volume"]

NHOM = {
    "MUA": "MUA – breakout hôm nay",
    "MUA_GAN": "Breakout gần đây – còn trong vùng mua",
    "CHO": "Theo dõi – nền chặt sát đỉnh, chờ vượt pivot",
    "XA": "Breakout nhưng đã xa điểm mua – không mua đuổi",
    "CHAY": "Đang chạy sau breakout – nắm giữ theo dừng lỗ động",
    "BAN": "Cảnh báo bán / breakout thất bại",
    "KHONG": "Chưa có tín hiệu",
}
THU_TU = ["MUA", "MUA_GAN", "CHO", "XA", "CHAY", "BAN", "KHONG"]


def _f(x) -> float:
    try:
        x = float(x)
    except (TypeError, ValueError):
        return float("nan")
    return x


def _ok(x) -> bool:
    return x is not None and not (isinstance(x, float) and math.isnan(x))


# ----------------------------------------------------------------------------------------------
# Tính toàn bộ chuỗi chỉ báo + nhận diện nền (vector hoá)
# ----------------------------------------------------------------------------------------------
def tinh_chuoi(df: pd.DataFrame, kl: pd.Series, cfg: CauHinh):
    """→ (bảng theo ngày, {độ dài nền: bảng chỉ số nền}). `kl` có thể là KL đã dự phóng cho phiên cuối."""
    H, L, C = df["high"], df["low"], df["close"]
    V = kl.astype(float)
    t = pd.DataFrame(index=df.index)
    t["ma10"] = sma(C, 10)
    t["ma20"] = sma(C, 20)
    t["ma50"] = sma(C, 50)
    t["ma100"] = sma(C, cfg.ma_trung_han)
    t["ma250"] = sma(C, cfg.ma_dai_han)
    t["vol20"] = sma(V, 20, 10)
    t["vol20_truoc"] = t["vol20"].shift(1)
    t["vol50"] = sma(V, 50, 30)
    t["gtgd20"] = (C * df["volume"]).rolling(20, min_periods=10).mean() / 1e6
    t["hi250"] = H.rolling(250, min_periods=60).max()
    t["rsi14"] = rsi(C)
    v5 = sma(V, 5, 3)

    xu_huong = (C >= t["ma100"]) & (t["ma100"] >= t["ma100"].shift(10) * 0.995)
    xu_huong &= t["ma250"].isna() | (t["ma100"] >= t["ma250"])
    t["xu_huong"] = xu_huong.fillna(False).astype(bool)
    t["thanh_khoan"] = ((t["gtgd20"] >= cfg.gtgd_min) & (C >= cfg.gia_min)).fillna(False).astype(bool)

    cot_nen = ["pivot", "day_nen", "day_can_co", "bien_do", "bien_do_dc", "tang_truoc", "hoi",
               "can_cung", "gan_dinh"]
    t["do_dai"] = np.nan
    for c in cot_nen:
        t[c] = np.nan
    theo_do_dai = {}
    for n in sorted(cfg.nen_do_dai):  # ngắn → dài: nền dài hơn mà vẫn hợp lệ sẽ ghi đè
        hh = H.rolling(n).max()
        ll = L.rolling(n).min()
        ch = C.rolling(n).max()
        cl = C.rolling(n).min()
        day_cc = L.shift(n).rolling(cfg.can_co_phien, min_periods=20).min()
        m = pd.DataFrame({
            "pivot": hh,
            "day_nen": ll,
            "day_can_co": day_cc,
            "bien_do": (hh - ll) / hh,
            "bien_do_dc": (ch - cl) / ch,
            "tang_truoc": hh / day_cc - 1,
            "hoi": (hh - ll) / (hh - day_cc),
            "can_cung": v5.rolling(max(n - 4, 1)).min() / t["vol50"],
            "gan_dinh": hh / t["hi250"],
        })
        dk = {
            "bien_do": m["bien_do"] <= cfg.nen_bien_do_max,
            "bien_do_dc": m["bien_do_dc"] <= cfg.nen_bien_do_dong_cua_max,
            "tang_truoc": m["tang_truoc"] >= cfg.can_co_tang_min,
            "hoi": (m["hoi"] <= cfg.nen_hoi_max) & (m["hoi"] >= 0),
            "can_cung": m["can_cung"] <= cfg.kl_can_max,
            "gan_dinh": m["gan_dinh"] >= cfg.gan_dinh_1nam,
        }
        hop_le = t["xu_huong"] & t["thanh_khoan"]
        for v in dk.values():
            hop_le &= v.fillna(False).astype(bool)
        m["hop_le"] = hop_le
        m["so_dk_dat"] = sum(v.fillna(False).astype(int) for v in dk.values()) \
            + t["xu_huong"].astype(int) + t["thanh_khoan"].astype(int)
        theo_do_dai[n] = m
        t.loc[hop_le, "do_dai"] = n
        for c in cot_nen:
            t.loc[hop_le, c] = m.loc[hop_le, c]
    t["hop_le"] = t["do_dai"].notna()
    t["vi_tri"] = ((C - L) / (H - L)).where(H > L, 1.0)
    t["kl_ratio"] = V / t["vol20_truoc"]
    t["pivot_truoc"] = t["pivot"].shift(1)
    hop_le_truoc = t["hop_le"].shift(1, fill_value=False).astype(bool)
    tho = (hop_le_truoc & (C > t["pivot_truoc"]) & (t["kl_ratio"] >= cfg.kl_breakout_min)
           & (t["vi_tri"] >= cfg.vi_tri_dong_cua_min)).fillna(False).to_numpy(bool)
    # Một nhịp breakout chỉ tính một lần: bỏ tín hiệu mà nền của nó còn chồng lên phiên breakout trước
    # (pivot bị đẩy lên theo chính nhịp tăng), trừ khi lần breakout trước đã thất bại.
    gia, pv, dd = C.to_numpy(float), t["pivot_truoc"].to_numpy(float), t["do_dai"].shift(1).to_numpy(float)
    giu = tho.copy()
    truoc = None
    for k in np.flatnonzero(tho):
        if truoc is not None and k - dd[k] <= truoc \
                and np.all(gia[truoc:k] >= pv[truoc] * (1 - cfg.that_bai_duoi_pivot)):
            giu[k] = False
            continue
        truoc = k
    t["breakout"] = giu
    return t, theo_do_dai


# ----------------------------------------------------------------------------------------------
# Tín hiệu bán / quản trị vị thế
# ----------------------------------------------------------------------------------------------
def tin_hieu_ban(df: pd.DataFrame, t: pd.DataFrame, kl: pd.Series, i: int, cfg: CauHinh,
                 gia_von: float | None = None) -> list[tuple[str, str]]:
    """Danh sách (mức, nội dung) tại phiên i. Mức: BAN (bán), CHOT (chốt lời một phần), CHU_Y (lưu ý).
    `gia_von`: pivot (với tín hiệu breakout) hoặc giá mua (với danh mục)."""
    C, H, O = df["close"].to_numpy(), df["high"].to_numpy(), df["open"].to_numpy()
    V = kl.to_numpy(float)
    gia = C[i]
    ma10, ma20, ma50 = _f(t["ma10"].iat[i]), _f(t["ma20"].iat[i]), _f(t["ma50"].iat[i])
    vol20 = _f(t["vol20_truoc"].iat[i])
    kq: list[tuple[str, str]] = []
    lai = gia / gia_von - 1 if gia_von else float("nan")

    if _ok(ma20) and gia < ma20:
        if _ok(vol20) and V[i] >= vol20:
            kq.append(("BAN", f"Đóng cửa dưới MA20 ({ma20:.2f}) kèm KL lớn ({V[i] / vol20:.1f}× TB20)"))
        else:
            kq.append(("CHU_Y", f"Đóng cửa dưới MA20 ({ma20:.2f}) nhưng KL thấp – xem phiên sau"))
    if _ok(ma50) and gia < ma50:
        kq.append(("BAN", f"Thủng MA50 ({ma50:.2f}) – xu hướng trung hạn suy yếu"))
    if _ok(lai) and lai >= 0.15 and i >= 1 and gia < ma10 and C[i - 1] < _f(t["ma10"].iat[i - 1]):
        kq.append(("CHOT", "2 phiên đóng cửa dưới MA10 sau khi đã tăng mạnh"))
    if _ok(ma20) and gia / ma20 - 1 >= cfg.nong_ma20:
        kq.append(("CHOT", f"Tăng nóng: giá cách MA20 {gia / ma20 - 1:+.0%}"))
    elif _ok(ma50) and gia / ma50 - 1 >= cfg.nong_ma50:
        kq.append(("CHOT", f"Tăng nóng: giá cách MA50 {gia / ma50 - 1:+.0%}"))
    if i >= 20 and H[i] >= np.nanmax(H[i - 19:i + 1]) and _f(t["vi_tri"].iat[i]) <= 0.3 \
            and _ok(vol20) and V[i] >= 1.5 * vol20:
        kq.append(("CHOT", "Nến đảo chiều râu trên dài tại đỉnh, KL lớn – dấu hiệu phân phối"))
    if _ok(lai) and lai >= 0.25 and i >= 1 and O[i] >= H[i - 1] * 1.03:
        kq.append(("CHOT", "Gap tăng >3% sau khi đã tăng ≥25% – có thể là gap kiệt sức"))
    if i >= 10:
        giam = (np.diff(C[i - 10:i + 1]) < 0) & (V[i - 9:i + 1] > _f(t["vol20_truoc"].iat[i]))
        if giam.sum() >= 3:
            kq.append(("CHU_Y", f"{int(giam.sum())} phiên giảm kèm KL lớn trong 10 phiên – áp lực bán tăng"))
    r = _f(t["rsi14"].iat[i])
    if _ok(r) and r >= 80:
        kq.append(("CHU_Y", f"RSI(14) = {r:.0f} – vùng quá mua"))
    return kq


def dung_lo_dong(gia: float, goc: float, cat_lo: float, ma10: float, ma20: float, cfg: CauHinh,
                 dinh: float | None = None):
    """Mức dừng lỗ/chốt lời động → (giá, quy tắc). Bậc nâng theo mức lãi CAO NHẤT đã đạt (giá đóng cửa
    cao nhất `dinh` kể từ khi vào lệnh) so với `goc` (pivot hoặc giá mua), nên chỉ nâng lên, không hạ xuống."""
    lai_dinh = max(gia, dinh if _ok(dinh) else gia) / goc - 1
    if lai_dinh < 0.10:
        return cat_lo, "dừng lỗ ban đầu"
    if lai_dinh < 0.20:
        return max(cat_lo, goc), "dời dừng lỗ về hoà vốn"
    ung_vien = [(goc * 1.05, "giữ tối thiểu +5% lãi")]
    if _ok(ma20):
        ung_vien.append((ma20, "đóng cửa dưới MA20"))
    nong = _ok(ma20) and gia / ma20 - 1 >= cfg.nong_ma20
    if (lai_dinh >= 0.35 or nong) and _ok(ma10):
        ung_vien.append((ma10, "đóng cửa dưới MA10 (đã tăng nóng)"))
    return max(ung_vien, key=lambda x: x[0])


def khoi_luong_mua(von_trieu: float | None, gia: float, cat_lo: float, cfg: CauHinh) -> int | None:
    """Số cổ phiếu nên mua để nếu chạm cắt lỗ chỉ mất `rui_ro_moi_lenh` vốn; làm tròn lô 100."""
    if not von_trieu or not _ok(cat_lo) or gia <= cat_lo:
        return None
    von = von_trieu * 1e6
    theo_rui_ro = von * cfg.rui_ro_moi_lenh / ((gia - cat_lo) * 1000)
    theo_ty_trong = von * cfg.ty_trong_toi_da / (gia * 1000)
    return int(min(theo_rui_ro, theo_ty_trong) // 100 * 100)


# ----------------------------------------------------------------------------------------------
# Phân tích một mã
# ----------------------------------------------------------------------------------------------
def _dieu_kien(t: pd.DataFrame, m: pd.DataFrame | None, df: pd.DataFrame, i: int, j: int,
               n: int | None, cfg: CauHinh) -> list[dict]:
    """Bảng kiểm từng điều kiện của mẫu hình. j = phiên cuối của nền; i = phiên đang xét."""
    def d(ten, dat, gia_tri):
        return {"ten": ten, "dat": bool(dat), "gia_tri": gia_tri}

    C = df["close"]
    ma100, ma100_10, ma250 = _f(t["ma100"].iat[j]), _f(t["ma100"].shift(10).iat[j]), _f(t["ma250"].iat[j])
    ma100_len = _ok(ma100) and _ok(ma100_10) and ma100 >= ma100_10 * 0.995 and (not _ok(ma250) or ma100 >= ma250)
    out = [
        d("Giá ≥ MA100 (≈ MA20 tuần)", C.iat[j] >= ma100, f"{C.iat[j]:.2f} / {ma100:.2f}"),
        d("MA100 đi lên & ≥ MA250 (≈ MA50 tuần)", ma100_len, f"MA100 {ma100:.2f}, MA250 {ma250:.2f}"),
        d(f"Thanh khoản ≥ {cfg.gtgd_min:g} tỷ/phiên", bool(t["thanh_khoan"].iat[j]),
          f"{_f(t['gtgd20'].iat[j]):.1f} tỷ"),
    ]
    if m is not None and n:
        r = m.iloc[j]
        out += [
            d(f"Tăng trước nền ≥ {cfg.can_co_tang_min:.0%} (cán cờ)", _f(r["tang_truoc"]) >= cfg.can_co_tang_min,
              f"{_f(r['tang_truoc']):+.0%} từ đáy {_f(r['day_can_co']):.2f}"),
            d(f"Nền chặt {n // 5} tuần: biên độ ≤ {cfg.nen_bien_do_max:.0%}", _f(r["bien_do"]) <= cfg.nen_bien_do_max,
              f"{_f(r['bien_do']):.1%} ({_f(r['day_nen']):.2f}–{_f(r['pivot']):.2f})"),
            d(f"Đóng cửa trong nền dao động ≤ {cfg.nen_bien_do_dong_cua_max:.0%}",
              _f(r["bien_do_dc"]) <= cfg.nen_bien_do_dong_cua_max, f"{_f(r['bien_do_dc']):.1%}"),
            d(f"Nền không hồi quá {cfg.nen_hoi_max:.0%} nhịp tăng", 0 <= _f(r["hoi"]) <= cfg.nen_hoi_max,
              f"hồi {_f(r['hoi']):.0%}"),
            d(f"Cạn cung: KL TB5 thấp nhất ≤ {cfg.kl_can_max:.0%} TB50", _f(r["can_cung"]) <= cfg.kl_can_max,
              f"{_f(r['can_cung']):.0%}"),
            d(f"Sát đỉnh 1 năm (≥ {cfg.gan_dinh_1nam:.0%})", _f(r["gan_dinh"]) >= cfg.gan_dinh_1nam,
              f"{_f(r['gan_dinh']):.0%} đỉnh 1 năm {_f(t['hi250'].iat[j]):.2f}"),
        ]
    if i > j:  # đánh giá phiên vượt nền
        pv = _f(m["pivot"].iat[j]) if m is not None else float("nan")
        out += [
            d("Đóng cửa vượt pivot", C.iat[i] > pv, f"{C.iat[i]:.2f} / pivot {pv:.2f}"),
            d(f"KL ≥ {cfg.kl_breakout_min:g}× TB20", _f(t["kl_ratio"].iat[i]) >= cfg.kl_breakout_min,
              f"{_f(t['kl_ratio'].iat[i]):.1f}×"),
            d("Đóng cửa nửa trên biên độ phiên", _f(t["vi_tri"].iat[i]) >= cfg.vi_tri_dong_cua_min,
              f"{_f(t['vi_tri'].iat[i]):.0%}"),
        ]
    return out


def phan_tich_ma(ma: str, df: pd.DataFrame, cfg: CauHinh | None = None, *, san: str = "",
                 nen_chua_xong: bool = False, ty_le_kl: float = 1.0, vnindex: pd.DataFrame | None = None,
                 von_trieu: float | None = None, chi_tiet: bool = False) -> dict | None:
    """Phân tích mã tại phiên cuối của `df`. Trả None nếu thiếu dữ liệu.

    nen_chua_xong + ty_le_kl: phiên cuối đang giao dịch dở; KL được dự phóng = KL hiện tại / ty_le_kl.
    """
    cfg = cfg or CauHinh()
    if df is None or len(df) < cfg.so_phien_min:
        return None
    df = df[COT].astype(float)
    kl = df["volume"].copy()
    du_phong = nen_chua_xong and 0 < ty_le_kl < 1
    if du_phong:
        kl.iloc[-1] = kl.iloc[-1] / max(ty_le_kl, 0.15)
    t, theo_n = tinh_chuoi(df, kl, cfg)
    i = len(df) - 1
    C, H, L = df["close"], df["high"], df["low"]
    gia = float(C.iat[i])

    # --- breakout gần nhất trong cửa sổ theo dõi ---
    bo = np.flatnonzero(t["breakout"].to_numpy())
    bo = bo[bo >= i - cfg.theo_doi_sau_breakout]
    b = int(bo[-1]) if len(bo) else None
    hop_le_nay = bool(t["hop_le"].iat[i])
    n_nay = int(t["do_dai"].iat[i]) if hop_le_nay else None
    if b is not None and hop_le_nay and i - n_nay + 1 > b:
        b = None  # đã hình thành nền mới sau lần breakout trước → coi như thiết lập mới

    kq: dict = {
        "ma": ma, "san": san, "ngay": df.index[i].strftime("%Y-%m-%d"), "gia": gia,
        "thay_doi": gia / float(C.iat[i - 1]) - 1 if i >= 1 else float("nan"),
        "kl": float(df["volume"].iat[i]), "kl_ratio": _f(t["kl_ratio"].iat[i]), "du_phong_kl": du_phong,
        "gtgd20": _f(t["gtgd20"].iat[i]),
        "ma10": _f(t["ma10"].iat[i]), "ma20": _f(t["ma20"].iat[i]), "ma50": _f(t["ma50"].iat[i]),
        "ma100": _f(t["ma100"].iat[i]), "ma250": _f(t["ma250"].iat[i]), "rsi": _f(t["rsi14"].iat[i]),
        "rs_tho": rs_tho(C), "hieu_suat_3t": hieu_suat(C, 63),
        "canh_bao": [], "ghi_chu": [], "pivot": float("nan"), "cat_lo": float("nan"),
        "vung_mua": float("nan"), "muc_tieu_1": float("nan"), "muc_tieu_2": float("nan"),
        "dung_lo_dong": float("nan"), "quy_tac_dung_lo": "", "ngay_breakout": "", "so_phien_sau_bo": None,
        "lai_tu_pivot": float("nan"), "do_dai_nen": None, "bien_do_nen": float("nan"),
        "can_cung": float("nan"), "tang_truoc_nen": float("nan"), "gan_dinh": float("nan"),
        "day_nen": float("nan"), "cach_pivot": float("nan"),
    }
    kq["cach_ma20"] = gia / kq["ma20"] - 1 if _ok(kq["ma20"]) else float("nan")
    kq["cach_ma50"] = gia / kq["ma50"] - 1 if _ok(kq["ma50"]) else float("nan")
    if vnindex is not None and len(vnindex) > 64:
        vn = vnindex["close"][vnindex.index <= df.index[i]]
        kq["rs_vs_vnindex"] = kq["hieu_suat_3t"] - hieu_suat(vn, 63)
    else:
        kq["rs_vs_vnindex"] = float("nan")

    def gan_nen(j: int, n: int):
        m = theo_n[n]
        kq.update({
            "pivot": _f(m["pivot"].iat[j]), "day_nen": _f(m["day_nen"].iat[j]), "do_dai_nen": n,
            "bien_do_nen": _f(m["bien_do"].iat[j]), "can_cung": _f(m["can_cung"].iat[j]),
            "tang_truoc_nen": _f(m["tang_truoc"].iat[j]), "gan_dinh": _f(m["gan_dinh"].iat[j]),
            "hoi_nen": _f(m["hoi"].iat[j]), "day_can_co": _f(m["day_can_co"].iat[j]),
        })
        pv, dn, dcc = kq["pivot"], kq["day_nen"], kq["day_can_co"]
        kq["cat_lo"] = max(dn * 0.99, pv * (1 - cfg.cat_lo_max))
        kq["vung_mua"] = pv * (1 + cfg.mua_toi_da_tren_pivot)
        kq["muc_tieu_1"] = pv * (1 + cfg.chot_loi_1)
        kq["muc_tieu_2"] = pv + (pv - dcc) if _ok(dcc) and dcc < pv else float("nan")
        kq["cach_pivot"] = gia / pv - 1

    # --- xác định trạng thái ---
    if b is not None:
        j = b - 1
        n_b = int(t["do_dai"].iat[j])
        gan_nen(j, n_b)
        pv = kq["pivot"]
        kq["ngay_breakout"] = df.index[b].strftime("%Y-%m-%d")
        kq["so_phien_sau_bo"] = i - b
        kq["lai_tu_pivot"] = gia / pv - 1
        kq["kl_ratio_breakout"] = _f(t["kl_ratio"].iat[b])
        if b == i:
            ma_tt = "MUA" if gia <= kq["vung_mua"] else "XA"
            kq["cat_lo"] = max(kq["day_nen"] * 0.99, gia * (1 - cfg.cat_lo_max))
        elif gia < pv * (1 - cfg.that_bai_duoi_pivot) or gia < kq["day_nen"]:
            ma_tt = "BAN"
            kq["canh_bao"].append(f"Breakout {kq['ngay_breakout']} thất bại: giá quay lại dưới pivot "
                                  f"{pv:.2f} hơn {cfg.that_bai_duoi_pivot:.0%}")
        elif i - b <= cfg.so_phien_breakout_gan and gia <= kq["vung_mua"]:
            ma_tt = "MUA_GAN"
        else:
            ma_tt = "CHAY"
        if ma_tt in ("CHAY", "MUA_GAN", "XA"):
            th = tin_hieu_ban(df, t, kl, i, cfg, gia_von=pv)
            kq["canh_bao"] += [s for _, s in th]
            if any(m == "BAN" for m, _ in th) and ma_tt == "CHAY":
                ma_tt = "BAN"
            kq["chot_mot_phan"] = any(m == "CHOT" for m, _ in th)
            dinh = float(C.iloc[b:i + 1].max())
            muc, quy_tac = dung_lo_dong(gia, pv, kq["cat_lo"], kq["ma10"], kq["ma20"], cfg, dinh=dinh)
            kq["dung_lo_dong"], kq["quy_tac_dung_lo"] = muc, quy_tac
            kq["lai_cao_nhat"] = dinh / pv - 1
            if gia < muc and ma_tt == "CHAY":
                ma_tt = "BAN"
                kq["canh_bao"].insert(0, f"Thủng dừng lỗ động {muc:.2f} ({quy_tac})")
            # quy tắc 8 tuần: tăng ≥20% trong ≤ 15 phiên sau breakout → giữ tối thiểu 8 tuần
            cua_so = C.iloc[b:min(i, b + 15) + 1]
            if len(cua_so) and cua_so.max() >= pv * 1.20:
                het_8_tuan = df.index[b] + pd.Timedelta(weeks=8)
                kq["ghi_chu"].append(
                    f"Tăng ≥20% trong ≤3 tuần sau breakout → quy tắc giữ tối thiểu 8 tuần (đến ~{het_8_tuan:%d/%m}), "
                    "chỉ bán sớm khi vi phạm dừng lỗ động")
        dk_j, dk_i, dk_n = j, b, n_b
    elif hop_le_nay:
        ma_tt = "CHO"
        gan_nen(i, n_nay)
        pv = kq["pivot"]
        if i >= 1 and _ok(t["pivot_truoc"].iat[i]) and gia > _f(t["pivot_truoc"].iat[i]):
            kq["ghi_chu"].append(f"Đã vượt đỉnh nền cũ nhưng chưa đủ điều kiện (KL {kq['kl_ratio']:.1f}× TB20, "
                                 f"vị trí đóng cửa {_f(t['vi_tri'].iat[i]):.0%}) – chưa xác nhận")
        if gia <= kq["day_nen"] + 0.4 * (pv - kq["day_nen"]):
            kq["ghi_chu"].append(f"Giá đang ở nửa dưới nền: có thể mua thăm dò ≤30% quanh "
                                 f"{kq['day_nen']:.2f}–{kq['day_nen'] * 1.03:.2f}, cắt lỗ dưới "
                                 f"{kq['day_nen'] * 0.98:.2f}")
        dk_j, dk_i, dk_n = i, i, n_nay
    else:
        ma_tt = "KHONG"
        # nền ứng viên gần nhất để giải thích còn thiếu điều kiện nào
        dk_n = max(theo_n, key=lambda n: (_f(theo_n[n]["so_dk_dat"].iat[i]), n))
        dk_j, dk_i = i, i
        if chi_tiet:
            gan_nen(i, dk_n)
            kq["pivot_ung_vien"] = kq["pivot"]
            for k in ("pivot", "cat_lo", "vung_mua", "muc_tieu_1", "muc_tieu_2", "cach_pivot"):
                kq[k] = float("nan")

    kq["trang_thai"] = ma_tt
    kq["nhom"] = NHOM[ma_tt]
    kq["so_tuan_nen"] = round(kq["do_dai_nen"] / 5) if kq["do_dai_nen"] else None
    kq["hanh_dong"] = _hanh_dong(kq, cfg)
    if ma_tt in ("MUA", "MUA_GAN", "CHO"):
        vao = gia if ma_tt != "CHO" else kq["pivot"]
        kq["kl_mua_goi_y"] = khoi_luong_mua(von_trieu, vao, kq["cat_lo"], cfg)
    kq["thanh_phan_diem"] = _thanh_phan_diem(kq, cfg)
    kq["diem"] = tinh_diem(kq)
    if chi_tiet:
        kq["ngay_ket_thuc_nen"] = df.index[dk_j].strftime("%Y-%m-%d")
        kq["dieu_kien"] = _dieu_kien(t, theo_n.get(dk_n), df, dk_i, dk_j, dk_n, cfg)
        kq["tuan"] = _boi_canh_tuan(df)
        kq["lich_su"] = lich_su_tin_hieu(df, cfg, t=t)
    return kq


def _hanh_dong(kq: dict, cfg: CauHinh) -> str:
    tt = kq["trang_thai"]
    if tt == "MUA":
        return (f"Mua trong vùng {kq['pivot']:.2f}–{kq['vung_mua']:.2f}; cắt lỗ {kq['cat_lo']:.2f}; "
                f"mục tiêu {kq['muc_tieu_1']:.2f}" + (f" / {kq['muc_tieu_2']:.2f}" if _ok(kq["muc_tieu_2"]) else ""))
    if tt == "MUA_GAN":
        return (f"Còn mua được ≤ {kq['vung_mua']:.2f} (breakout {kq['so_phien_sau_bo']} phiên trước); "
                f"cắt lỗ {kq['cat_lo']:.2f}")
    if tt == "CHO":
        return (f"Đặt cảnh báo giá {kq['pivot']:.2f}: mua khi đóng cửa vượt pivot kèm KL ≥ "
                f"{cfg.kl_breakout_min:g}× TB20; không mua quá {kq['vung_mua']:.2f}")
    if tt == "XA":
        return (f"Không mua đuổi (đã {kq['cach_pivot']:+.0%} so với pivot {kq['pivot']:.2f}); chờ kéo ngược về "
                f"≤ {kq['vung_mua']:.2f} hoặc nền mới")
    if tt == "CHAY":
        s = f"Nắm giữ; dừng lỗ động {kq['dung_lo_dong']:.2f} ({kq['quy_tac_dung_lo']})"
        if kq.get("chot_mot_phan"):
            s += "; cân nhắc chốt lời 1/3–1/2"
        return s + "; không mua mới khi chưa có nền mới"
    if tt == "BAN":
        return "Bán / tránh mua: " + (kq["canh_bao"][0] if kq["canh_bao"] else "vi phạm điều kiện nắm giữ")
    return ""


def _kep(x: float, a: float = 0.0, b: float = 1.0) -> float:
    if not _ok(x):
        return 0.0
    return max(a, min(b, x))


def _thanh_phan_diem(kq: dict, cfg: CauHinh) -> dict:
    """Mỗi thành phần: đạt ngưỡng lọc được 40% số điểm, đạt mức lý tưởng được 100%."""
    if not kq.get("do_dai_nen") or kq["trang_thai"] == "KHONG":
        return {}

    def tp(trong_so, chat_luong):
        return trong_so * (0.4 + 0.6 * _kep(chat_luong))

    p = {
        "nen_chat": tp(20, (cfg.nen_bien_do_max - kq["bien_do_nen"]) / (cfg.nen_bien_do_max - 0.04)),
        "can_cung": tp(15, (cfg.kl_can_max - kq["can_cung"]) / (cfg.kl_can_max - 0.30)),
        "can_co": tp(15, (kq["tang_truoc_nen"] - cfg.can_co_tang_min) / (0.60 - cfg.can_co_tang_min)),
        "sat_dinh": tp(15, (kq["gan_dinh"] - cfg.gan_dinh_1nam) / (1 - cfg.gan_dinh_1nam)),
    }
    if kq["trang_thai"] in ("MUA", "MUA_GAN", "XA", "CHAY"):
        p["kl_breakout"] = tp(15, (_f(kq.get("kl_ratio_breakout")) - cfg.kl_breakout_min) / 1.5)
    else:
        p["gan_pivot"] = tp(15, 1 - (kq["pivot"] / kq["gia"] - 1) / 0.08)
    return p


def tinh_diem(kq: dict) -> float:
    """Điểm 0–100 để xếp hạng. Sức mạnh giá (RS) chiếm 20 điểm: dùng xếp hạng toàn thị trường nếu có."""
    p = kq.get("thanh_phan_diem") or {}
    if not p:
        return 0.0
    if _ok(kq.get("rs_pct")):
        rs = 20 * kq["rs_pct"] / 100
    else:
        rs = 20 * _kep(0.5 + _f(kq.get("rs_vs_vnindex")) / 0.3)
    return round(sum(p.values()) + rs, 1)


def _boi_canh_tuan(df: pd.DataFrame) -> dict:
    """Các số đo tương ứng biểu đồ tuần của người dùng (MA20 tuần xanh, MA50 tuần đen, KL tuần)."""
    w = nen_tuan(df)
    if len(w) < 5:
        return {}
    ma20w, ma50w, kl20w = sma(w["close"], 20), sma(w["close"], 50), sma(w["volume"], 20)
    return {
        "ma20_tuan": _f(ma20w.iat[-1]), "ma50_tuan": _f(ma50w.iat[-1]),
        "kl_tuan": float(w["volume"].iat[-1]),
        "kl_tuan_ratio": float(w["volume"].iat[-1] / kl20w.iat[-2]) if len(w) > 21 and kl20w.iat[-2] > 0
        else float("nan"),
        "tuan_tang_lien_tiep": int(_dem_lien_tiep(w["close"].diff() > 0)),
        "nen_tuan_gan": [
            {"tuan": f"{d:%d/%m}", "mo": r.open, "cao": r.high, "thap": r.low, "dong": r.close, "kl": r.volume}
            for d, r in w.tail(8).iterrows()
        ],
    }


def _dem_lien_tiep(s: pd.Series) -> int:
    n = 0
    for v in reversed(s.to_list()):
        if not v:
            break
        n += 1
    return n


# ----------------------------------------------------------------------------------------------
# Lịch sử tín hiệu (kiểm định nhanh trên dữ liệu quá khứ)
# ----------------------------------------------------------------------------------------------
def lich_su_tin_hieu(df: pd.DataFrame, cfg: CauHinh | None = None, so_phien: int = 40,
                     t: pd.DataFrame | None = None) -> list[dict]:
    """Mỗi lần breakout trong quá khứ: mua giá đóng cửa phiên breakout, cắt lỗ như quy tắc,
    chốt khi chạm +20%; nếu sau `so_phien` phiên chưa chạm thì đóng vị thế ở giá đóng cửa."""
    cfg = cfg or CauHinh()
    df = df[COT].astype(float)
    if t is None:
        t, _ = tinh_chuoi(df, df["volume"], cfg)
    C, H, L = df["close"].to_numpy(), df["high"].to_numpy(), df["low"].to_numpy()
    n = len(df)
    kq = []
    for b in np.flatnonzero(t["breakout"].to_numpy()):
        vao = C[b]
        cat_lo = max(_f(t["day_nen"].iat[b - 1]) * 0.99, vao * (1 - cfg.cat_lo_max))
        muc_tieu = vao * (1 + cfg.chot_loi_1)
        ket_qua, lai, so = "Đang mở", C[-1] / vao - 1, n - 1 - b
        for j in range(b + 1, min(n, b + 1 + so_phien)):
            if L[j] <= cat_lo:
                ket_qua, lai, so = "Cắt lỗ", cat_lo / vao - 1, j - b
                break
            if H[j] >= muc_tieu:
                ket_qua, lai, so = f"Đạt +{cfg.chot_loi_1:.0%}", cfg.chot_loi_1, j - b
                break
        else:
            if b + so_phien < n:
                ket_qua, lai, so = f"Hết {so_phien} phiên", C[b + so_phien] / vao - 1, so_phien
        lai_max = H[b + 1:min(n, b + 1 + so_phien)].max() / vao - 1 if b + 1 < n else float("nan")
        kq.append({"ngay": df.index[b].strftime("%Y-%m-%d"), "gia_vao": float(vao),
                   "pivot": _f(t["pivot_truoc"].iat[b]), "kl_ratio": _f(t["kl_ratio"].iat[b]),
                   "ket_qua": ket_qua, "lai": float(lai), "so_phien": int(so), "lai_max": float(lai_max)})
    return kq


# ----------------------------------------------------------------------------------------------
# Danh mục đang nắm giữ
# ----------------------------------------------------------------------------------------------
def danh_gia_nam_giu(ma: str, df: pd.DataFrame, gia_mua: float, cfg: CauHinh | None = None, *,
                     so_luong: float | None = None, ngay_mua: str | None = None, nen_chua_xong: bool = False,
                     ty_le_kl: float = 1.0) -> dict | None:
    cfg = cfg or CauHinh()
    if df is None or len(df) < 60:
        return None
    df = df[COT].astype(float)
    kl = df["volume"].copy()
    if nen_chua_xong and 0 < ty_le_kl < 1:
        kl.iloc[-1] = kl.iloc[-1] / max(ty_le_kl, 0.15)
    t, _ = tinh_chuoi(df, kl, cfg)
    i = len(df) - 1
    gia = float(df["close"].iat[i])
    lai = gia / gia_mua - 1
    th = tin_hieu_ban(df, t, kl, i, cfg, gia_von=gia_mua)
    cat_lo = gia_mua * (1 - cfg.cat_lo_max)
    dinh = None
    if ngay_mua:
        sau_mua = df["close"][df.index >= pd.Timestamp(ngay_mua)]
        dinh = float(sau_mua.max()) if len(sau_mua) else None
    muc, quy_tac = dung_lo_dong(gia, gia_mua, cat_lo, _f(t["ma10"].iat[i]), _f(t["ma20"].iat[i]), cfg, dinh=dinh)
    if lai <= -cfg.cat_lo_max:
        hd, ly_do = "CẮT LỖ", f"Lỗ {lai:.1%} – vượt ngưỡng {cfg.cat_lo_max:.0%}, bán theo kỷ luật"
    elif gia < muc and lai > -cfg.cat_lo_max and quy_tac != "dừng lỗ ban đầu":
        hd, ly_do = "BÁN", f"Thủng dừng lỗ động {muc:.2f} ({quy_tac})"
    elif any(m == "BAN" for m, _ in th):
        hd = "BÁN" if lai > 0 else "CẮT LỖ"
        ly_do = next(s for m, s in th if m == "BAN")
    elif any(m == "CHOT" for m, _ in th) and lai >= 0.15:
        hd, ly_do = "CHỐT LỜI MỘT PHẦN", next(s for m, s in th if m == "CHOT")
    else:
        hd, ly_do = "NẮM GIỮ", "Chưa vi phạm quy tắc bán"
    return {"ma": ma, "gia_mua": gia_mua, "so_luong": so_luong, "ngay_mua": ngay_mua or "", "gia": gia, "lai": lai,
            "lai_cao_nhat": (dinh / gia_mua - 1) if dinh else float("nan"),
            "ngay": df.index[i].strftime("%Y-%m-%d"), "hanh_dong": hd, "ly_do": ly_do,
            "dung_lo_dong": muc, "quy_tac_dung_lo": quy_tac, "tin_hieu": [s for _, s in th],
            "ma20": _f(t["ma20"].iat[i]), "ma10": _f(t["ma10"].iat[i])}


# ----------------------------------------------------------------------------------------------
# Bối cảnh thị trường chung (VN-Index)
# ----------------------------------------------------------------------------------------------
def boi_canh_thi_truong(df: pd.DataFrame | None) -> dict:
    if df is None or len(df) < 60:
        return {"trang_thai": "KHÔNG RÕ", "muc": 1, "loi_khuyen": "Không tải được VN-Index – tự đánh giá thị trường",
                "ngay": "", "gia": float("nan"), "thay_doi": float("nan"), "ma20": float("nan"),
                "ma50": float("nan"), "ngay_phan_phoi": None}
    C, V = df["close"], df["volume"]
    ma20, ma50 = sma(C, 20), sma(C, 50)
    c = float(C.iat[-1])
    ma50_len = ma50.iat[-1] >= ma50.iat[-11]
    pct = C.pct_change()
    ngay_pp = int(((pct <= -0.002) & (V > V.shift(1))).tail(25).sum()) if V.tail(25).sum() > 0 else None
    if c >= ma20.iat[-1] and c >= ma50.iat[-1] and ma50_len and (ngay_pp is None or ngay_pp <= 4):
        tt, muc, lk = "TĂNG – thuận lợi", 2, "Có thể giải ngân 80–100% theo tín hiệu mua"
    elif c >= ma50.iat[-1]:
        tt, muc, lk = "TĂNG NHƯNG CÓ ÁP LỰC", 1, "Giải ngân 40–60%, chỉ mua tín hiệu điểm cao, cắt lỗ chặt"
    else:
        tt, muc, lk = "ĐIỀU CHỈNH / GIẢM", 0, "Hạn chế mua mới (≤20–30% vốn), ưu tiên quản trị rủi ro"
    return {"ngay": df.index[-1].strftime("%Y-%m-%d"), "gia": c, "thay_doi": float(pct.iat[-1]),
            "ma20": float(ma20.iat[-1]), "ma50": float(ma50.iat[-1]), "ngay_phan_phoi": ngay_pp,
            "trang_thai": tt, "muc": muc, "loi_khuyen": lk}


def gan_xep_hang_rs(ket_qua: list[dict]):
    """Xếp hạng sức mạnh giá 1–99 trên toàn bộ mã đã phân tích rồi tính lại điểm."""
    ds = [k for k in ket_qua if _ok(k.get("rs_tho"))]
    if len(ds) < 20:
        return
    gia_tri = pd.Series([k["rs_tho"] for k in ds])
    hang = gia_tri.rank(pct=True)
    for k, h in zip(ds, hang):
        k["rs_pct"] = float(max(1, min(99, round(h * 99))))
        k["diem"] = tinh_diem(k)
