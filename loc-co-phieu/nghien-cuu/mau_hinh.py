"""Kiểm định các mẫu hình giao dịch định nghĩa trước bằng quy tắc đơn giản (không tối ưu tham số), theo từng năm.

Mỗi mẫu hình: điều kiện thị trường + điều kiện cổ phiếu tại phiên t → mua mở cửa t+1, bán theo cấu hình
chốt lời/cắt lỗ/số phiên. Mỗi ngày lấy tối đa K mã (ưu tiên thanh khoản cao), một mã không mở lệnh chồng.
Mẫu hình đáng dùng = lãi bình quân dương sau phí ở phần lớn các năm.

    python3 loc-co-phieu/nghien-cuu/mau_hinh.py
"""
from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from huan_luyen import chon_lenh, thong_ke  # noqa: E402

CAU_HINH = ["5_5_10", "6_4_10", "7_5_10", "5_5_20", "6_5_20", "7_5_20", "7_7_20", "5_7_20"]


def doc():
    df = pd.read_pickle(os.environ.get("LS_TEP_DL", os.path.join(GOC, ".cache", "nghien-cuu.pkl")))
    vni = pd.read_csv(os.path.join(GOC, ".cache", "lich-su", "VNINDEX.csv"), index_col=0, parse_dates=True)
    r1 = vni["close"].pct_change()
    ngay = df.index.get_level_values(0)
    df["vni_r1"] = r1.reindex(ngay).to_numpy()
    df["vni_r1_truoc"] = r1.shift(1).reindex(ngay).to_numpy()
    v = vni["volume"]
    df["vni_kl_tang"] = (v > v.shift(1)).reindex(ngay).to_numpy()
    df["vni_tu_day20"] = (vni["close"] / vni["low"].rolling(20).min() - 1).reindex(ngay).to_numpy()
    df["vni_tu_dinh60"] = (vni["close"] / vni["high"].rolling(60).max() - 1).reindex(ngay).to_numpy()
    df["ngay"], df["ma"] = ngay, df.index.get_level_values(1)
    return df.reset_index(drop=True)


def mau(df: pd.DataFrame) -> dict[str, pd.Series]:
    m = {}
    hoang_loan = (df["rong_ma20"] <= 0.15) | (df["vni_r5"] <= -0.05)
    m["A0. Mua mọi mã sau phiên thị trường hoảng loạn"] = hoang_loan
    m["A1. Hoảng loạn + hôm nay VN-Index bật tăng ≥1%"] = hoang_loan & (df["vni_r1"] >= 0.01)
    m["A2. A1 + mã beta cao (≥1) thanh khoản top 50%"] = (hoang_loan & (df["vni_r1"] >= 0.01) & (df["beta60"] >= 1)
                                                         & (df["hang_gtgd"] >= 0.5))
    m["A3. A1 + mã sát đỉnh 52 tuần (≤15%) ít biến động"] = (hoang_loan & (df["vni_r1"] >= 0.01)
                                                            & (df["d_dinh250"] >= -0.15) & (df["atr_pct"] <= 0.04))
    xac_nhan = ((df["vni_tu_dinh60"] <= -0.08) & (df["vni_tu_day20"] >= 0.03) & (df["vni_r1"] >= 0.012)
                & df["vni_kl_tang"].astype(bool))
    m["B0. Thị trường xác nhận tăng sau điều chỉnh (follow-through)"] = xac_nhan
    m["B1. B0 + mã mạnh (RS ≥ 80, trên MA50)"] = xac_nhan & (df["rs_tong"] >= 0.8) & (df["d_ma50"] > 0)
    tang = df["che_do"] == 2
    m["C0. Thị trường tăng thuận lợi – mọi mã"] = tang
    m["C1. Tăng thuận lợi + mã dẫn dắt chỉnh ngắn (RSI2 ≤ 20, sát đỉnh 52 tuần)"] = (
        tang & (df["rsi2"] <= 20) & (df["d_dinh250"] >= -0.15) & (df["d_ma50"] > 0) & (df["sl_ma50"] > 0))
    m["C2. C1 + ít biến động (ATR ≤ 3,5%)"] = m["C1. Tăng thuận lợi + mã dẫn dắt chỉnh ngắn (RSI2 ≤ 20, sát đỉnh 52 tuần)"] & (df["atr_pct"] <= 0.035)
    m["C3. Tăng thuận lợi + nền chặt sát đỉnh (biên 10 phiên ≤ 8%, cách đỉnh 52T ≤ 10%, KL cạn)"] = (
        tang & (df["do_chat10"] <= 0.08) & (df["d_dinh250"] >= -0.10) & (df["kl5_50"] <= np.log1p(0.8)))
    m["D1. Mọi thị trường: nền chặt sát đỉnh, ít biến động, RS line đỉnh mới"] = (
        (df["do_chat10"] <= 0.08) & (df["d_dinh250"] >= -0.10) & (df["atr_pct"] <= 0.035)
        & (df["d_dinh_rs60"] >= -0.02))
    m["E1. Quá bán sâu ở mã thanh khoản lớn (RSI2 ≤ 5, giảm ≥10%/5 phiên, top 30% thanh khoản)"] = (
        (df["rsi2"] <= 5) & (df["r5"] <= -0.10) & (df["hang_gtgd"] >= 0.7))
    m["E2. E1 + trên MA200 (xu hướng dài hạn còn tăng)"] = m["E1. Quá bán sâu ở mã thanh khoản lớn (RSI2 ≤ 5, giảm ≥10%/5 phiên, top 30% thanh khoản)"] & (df["d_ma200"] > 0)
    return m


def main() -> int:
    df = doc()
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))
    df["p"] = df["hang_gtgd"].fillna(0)        # ưu tiên mã thanh khoản cao khi một ngày có nhiều mã
    for ten, dk in mau(df).items():
        u = df[dk.fillna(False).to_numpy()]
        print(f"\n### {ten}: {len(u):,} (ngày, mã) thoả, {u['ngay'].nunique()} ngày")
        for ch in CAU_HINH:
            lenh = chon_lenh(u, ch, -1.0, 5, lich)
            if lenh.empty:
                continue
            tk = thong_ke(lenh[f"lai_{ch}"])
            nam = lenh.groupby(lenh["ngay"].dt.year)[f"lai_{ch}"].agg(["size", lambda s: (s > 0).mean(), "mean"])
            nam.columns = ["n", "thang", "tb"]
            nam_duong = (nam["tb"] > 0).mean()
            print(f"  {ch}: {tk['so_lenh']} lệnh, thắng {tk['thang']:.0%}, TB {tk['tb']:+.2%}, PF {tk.get('pf')}, "
                  f"năm lãi {nam_duong:.0%} ({(nam['tb'] > 0).sum()}/{len(nam)}) | "
                  + " ".join(f"{int(y) % 100:02d}:{r.n}/{r.thang:.0%}/{r.tb:+.1%}" for y, r in nam.iterrows()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
