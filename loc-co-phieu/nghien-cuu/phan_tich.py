"""Vì sao có cổ phiếu tăng khi thị trường giảm, và giảm khi thị trường tăng? Thống kê mô tả trên toàn bộ lịch sử.

    python3 loc-co-phieu/nghien-cuu/phan_tich.py [--nhan 6_4_20]

In ra:
  A. Theo từng trạng thái thị trường: đặc trưng nào khác biệt nhiều nhất giữa mã TĂNG MẠNH (+7% trở lên sau 20 phiên)
     và mã GIẢM MẠNH (−7% trở xuống), đo bằng độ lệch chuẩn hoá (Cohen's d).
  B. Tỷ lệ thắng của lệnh (chốt lời/cắt lỗ/số phiên theo --nhan) theo từng nhóm 10% của các đặc trưng quan trọng.
"""
from __future__ import annotations

import argparse
import os
import sys

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu import luotsong as ls  # noqa: E402

TEN_TT = {0: "ĐIỀU CHỈNH/GIẢM", 1: "TĂNG CÓ ÁP LỰC", 2: "TĂNG THUẬN LỢI"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--nhan", default="6_4_20")
    a = ap.parse_args()
    df = pd.read_pickle(os.environ.get("LS_TEP_DL", os.path.join(GOC, ".cache", "nghien-cuu.pkl")))
    df = df[df[f"lai_{a.nhan}"].notna() & df["fwd20"].notna()]
    lai = df[f"lai_{a.nhan}"]
    print(f"{len(df):,} dòng. Tỷ lệ thắng nền {(lai > 0).mean():.1%}, TB {lai.mean():+.2%}")
    for c, g in df.groupby("che_do"):
        lg = g[f"lai_{a.nhan}"]
        print(f"  {TEN_TT[c]}: {len(g):,} dòng ({len(g) / len(df):.0%} số ngày-mã), thắng {(lg > 0).mean():.1%}, "
              f"TB {lg.mean():+.2%}, tỷ lệ mã tăng ≥7%/20 phiên {(g['fwd20'] >= 0.07).mean():.1%}, "
              f"giảm ≤−7% {(g['fwd20'] <= -0.07).mean():.1%}")

    print("\nA. KHÁC BIỆT GIỮA MÃ TĂNG MẠNH (≥+7%/20 phiên) VÀ GIẢM MẠNH (≤−7%) – Cohen's d, |d| lớn = khác nhiều")
    bang_d = {}
    for c, g in df.groupby("che_do"):
        tang, giam = g[g["fwd20"] >= 0.07], g[g["fwd20"] <= -0.07]
        d = {}
        for k in ls.DAC_TRUNG:
            x1, x2 = tang[k].astype(float), giam[k].astype(float)
            sd = np.sqrt((x1.var() + x2.var()) / 2)
            d[k] = (x1.median() - x2.median()) / sd if sd > 0 else np.nan
        bang_d[TEN_TT[c]] = pd.Series(d)
    bd = pd.DataFrame(bang_d)
    bd["tb_abs"] = bd.abs().mean(axis=1)
    print(bd.sort_values("tb_abs", ascending=False).head(30).round(3).to_string())

    print(f"\nB. TỶ LỆ THẮNG LỆNH {a.nhan} THEO NHÓM 10% (thấp → cao) CỦA TỪNG ĐẶC TRƯNG, TÁCH THEO THỊ TRƯỜNG")
    for k in ["rs_tong", "rs60", "d_dinh250", "d_ma50", "sl_ma50", "d_ma20", "ud_kl50", "nganh_rs60",
              "d_dinh_rs60", "rsi14", "beta60", "atr_pct", "kl_tb20", "log_gtgd20", "r5", "vt_250"]:
        dong = {}
        for c, g in df.groupby("che_do"):
            q = pd.qcut(g[k].astype(float).rank(method="first"), 10, labels=False)
            dong[TEN_TT[c]] = (g[f"lai_{a.nhan}"] > 0).groupby(q).mean().round(3).tolist()
        bien = df[k].astype(float).quantile([0.1, 0.5, 0.9]).round(3).tolist()
        print(f"\n{k} (phân vị 10/50/90 toàn bộ: {bien})")
        for ten, v in dong.items():
            print(f"  {ten:<17}" + " ".join(f"{x:5.0%}" for x in v))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
