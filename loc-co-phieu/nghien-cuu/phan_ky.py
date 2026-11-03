"""Phân kỳ dương RSI / MACD làm tín hiệu mua – kiểm định 2014–2026 trên toàn thị trường (luật T+2, biên độ, phí).

Định nghĩa (tại phiên t, chỉ dùng dữ liệu đến t):
  - đáy gần j2 = phiên có giá thấp nhất trong 5 phiên trước t; đáy trước j1 = phiên thấp nhất trong khoảng t−60 … t−12;
  - giá tạo đáy thấp hơn: Low[j2] < Low[j1]; giữa hai đáy giá đã hồi ≥ 3% so với Low[j1] (hai đáy tách biệt);
  - RSI(14) phân kỳ dương: RSI[j2] > RSI[j1] + 3 và RSI[j1] < 35 (đáy trước ở vùng quá bán);
  - MACD(12,26,9) phân kỳ dương: MACD[j2] > MACD[j1] và MACD[j1] < 0;
  - xác nhận mua: nến xác nhận (đóng cửa t > đỉnh của phiên đáy j2 và > đóng cửa t−1), hoặc MACD cắt lên đường tín hiệu
    trong 3 phiên gần nhất.
Mua giá mở cửa phiên t+1, bán theo cấu hình chốt lời/cắt lỗ/số phiên (cột lai_* của bảng nghiên cứu).

    python3 loc-co-phieu/nghien-cuu/phan_ky.py
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd
from numpy.lib.stride_tricks import sliding_window_view

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chung  # noqa: E402
from chung import chon_lenh, ls  # noqa: E402

CAU_HINH = ["7_7_20", "5_5_10", "6_4_10", "7_5_20", "5_7_20", "20_7_40"]
GAN, TRUOC_TU, TRUOC_DEN = 5, 60, 12


def chi_bao(C: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    rsi = ls._rsi(C, 14)
    macd = C.ewm(span=12, adjust=False, min_periods=26).mean() - C.ewm(span=26, adjust=False, min_periods=26).mean()
    sig = macd.ewm(span=9, adjust=False, min_periods=9).mean()
    return rsi, macd, sig


def phan_ky_mot_ma(L, H, C, rsi, macd, sig) -> dict[str, np.ndarray]:
    """Cờ tín hiệu (mảng bool theo ngày) cho một mã."""
    n = len(L)
    kq = {k: np.zeros(n, bool) for k in ("rsi", "macd", "nen", "macd_cat")}
    if n < TRUOC_TU + 5:
        return kq
    Lf = np.where(np.isfinite(L), L, np.inf)
    w1 = TRUOC_TU - TRUOC_DEN + 1                          # cửa sổ đáy trước: t−60 … t−12
    a1 = sliding_window_view(Lf, w1).argmin(axis=1)          # a1[k] ứng với L[k : k+w1]
    a2 = sliding_window_view(Lf, GAN).argmin(axis=1)         # a2[k] ứng với L[k : k+5]
    t = np.arange(TRUOC_TU, n)
    j1 = t - TRUOC_TU + a1[t - TRUOC_TU]
    j2 = t - GAN + a2[t - GAN]
    thap_hon = Lf[j2] < Lf[j1]
    ung_vien = np.flatnonzero(thap_hon & np.isfinite(L[j1]))
    cat = (macd > sig) & (np.roll(macd, 1) <= np.roll(sig, 1))
    cat[0] = False
    cat3 = cat | np.roll(cat, 1) | np.roll(cat, 2)
    for u in ung_vien:
        ti, a, b = t[u], j1[u], j2[u]
        if not np.isfinite(H[a:b + 1]).all():
            continue
        if H[a:b + 1].max() < L[a] * 1.03 or L[a + 1:b].min(initial=np.inf) < L[b]:
            continue                                         # hai đáy phải tách biệt, j2 là đáy thấp nhất từ j1
        if np.isfinite(rsi[a]) and np.isfinite(rsi[b]) and rsi[a] < 35 and rsi[b] > rsi[a] + 3:
            kq["rsi"][ti] = True
        if np.isfinite(macd[a]) and np.isfinite(macd[b]) and macd[a] < 0 and macd[b] > macd[a]:
            kq["macd"][ti] = True
        kq["nen"][ti] = C[ti] > H[b] and C[ti] > C[ti - 1]
        kq["macd_cat"][ti] = bool(cat3[ti])
    return kq


def tin_hieu(bang: dict) -> dict[str, pd.DataFrame]:
    C, H, L = bang["C"], bang["H"], bang["L"]
    rsi, macd, sig = chi_bao(C)
    co = {k: np.zeros(C.shape, bool) for k in ("rsi", "macd", "nen", "macd_cat")}
    Ca, Ha, La, Ra, Ma, Sa = (x.to_numpy(np.float64) for x in (C, H, L, rsi, macd, sig))
    for j in range(C.shape[1]):
        r = phan_ky_mot_ma(La[:, j], Ha[:, j], Ca[:, j], Ra[:, j], Ma[:, j], Sa[:, j])
        for k in co:
            co[k][:, j] = r[k]
    return {k: pd.DataFrame(v, index=C.index, columns=C.columns) for k, v in co.items()}


def main() -> int:
    df = chung.doc_dataset()
    bang, san, _, _ = chung.doc_bang()
    print("Tính chỉ báo & dò phân kỳ…", flush=True)
    co = tin_hieu(bang)
    chung.gan_cot(df, {f"pk_{k}": v.astype(float) for k, v in co.items()})
    chung.gan_cot(df, chung.ket_qua_them(bang, san, [(0.20, 0.07, 40)]))
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))
    df["p"] = df["hang_gtgd"].fillna(0)
    rsi, macd, nen, mcat = (df[f"pk_{k}"] > 0 for k in ("rsi", "macd", "nen", "macd_cat"))
    bien = {
        "A. RSI phân kỳ dương + nến xác nhận": rsi & nen,
        "B. MACD phân kỳ dương + nến xác nhận": macd & nen,
        "C. Cả RSI và MACD phân kỳ + nến xác nhận": rsi & macd & nen,
        "D. Cả RSI và MACD phân kỳ + MACD cắt lên": rsi & macd & mcat,
        "E. C + giá trên MA200 (xu hướng dài hạn còn tăng)": rsi & macd & nen & (df["d_ma200"] > 0),
        "F. C + thị trường không ở trạng thái giảm": rsi & macd & nen & (df["che_do"] >= 1),
        "G. C + thị trường tăng thuận lợi": rsi & macd & nen & (df["che_do"] == 2),
    }
    kq = {}
    print(f"\nNền (mua mọi mã thanh khoản mọi ngày): " + " | ".join(
        f"{c}: thắng {(df[f'lai_{c}'] > 0).mean():.0%} TB {df[f'lai_{c}'].mean():+.2%}" for c in CAU_HINH))
    for ten, dk in bien.items():
        u = df[dk.to_numpy()]
        print(f"\n### {ten}: {len(u):,} tín hiệu ({u['ngay'].nunique()} ngày)", flush=True)
        kq[ten] = {}
        for ch in CAU_HINH:
            lenh = chon_lenh(u, ch, -1.0, 5, lich)
            if lenh.empty:
                continue
            print(f"  {ch:7}: {chung.tom_tat(lenh, f'lai_{ch}')}")
            if ch in ("7_7_20", "5_5_10"):
                print("\n".join(chung.chi_tiet(lenh, f"lai_{ch}")))
            tk = chung.thong_ke(lenh[f"lai_{ch}"])
            nam = lenh.groupby(lenh["ngay"].dt.year)[f"lai_{ch}"].mean()
            kq[ten][ch] = {**tk, "nam_lai": int((nam > 0).sum()), "so_nam": int(len(nam))}
    os.makedirs(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu"), exist_ok=True)
    with open(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "phan_ky.json"), "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
