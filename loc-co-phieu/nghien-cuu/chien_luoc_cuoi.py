"""Chiến lược lướt sóng cuối cùng (quy tắc định trước, không tối ưu tham số) – kết quả theo từng năm và trạng thái
thị trường. Xếp hạng ứng viên bằng điểm tổng hợp chỉ báo bền vững tính "đi tiếp" (tong_hop.py, trọng số chỉ học từ
các năm trước) để chọn tối đa K mã mỗi ngày.

    python3 loc-co-phieu/nghien-cuu/tong_hop.py   # tạo .cache/kq-nghien-cuu/oos_tong_hop.pkl trước
    python3 loc-co-phieu/nghien-cuu/chien_luoc_cuoi.py [--k 3]
"""
from __future__ import annotations

import argparse
import json
import os
import sys

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mau_hinh as mh  # noqa: E402
from huan_luyen import chon_lenh, thong_ke  # noqa: E402

CAU_HINH = ["7_7_20", "7_5_20", "6_5_20", "5_7_20", "5_5_20"]
TEN_TT = {0: "giảm", 1: "áp lực", 2: "tăng"}


def dieu_kien(df: pd.DataFrame) -> dict[str, pd.Series]:
    tang = df["che_do"] == 2
    dan_dat = (df["d_dinh250"] >= -0.10) & (df["d_dinh_rs60"] >= -0.02) & (df["atr_pct"] <= 0.035) & (df["d_ma50"] > 0)
    chinh = ((df["rsi2"] <= 20) & (df["d_dinh250"] >= -0.15) & (df["d_ma50"] > 0) & (df["sl_ma50"] > 0)
             & (df["atr_pct"] <= 0.035))
    xac_nhan = ((df["vni_tu_dinh60"] <= -0.08) & (df["vni_tu_day20"] >= 0.03) & (df["vni_r1"] >= 0.012)
                & df["vni_kl_tang"].astype(bool))
    return {"dan_dat": tang & dan_dat, "chinh_ngan": tang & chinh,
            "xac_nhan": xac_nhan & (df["rs_tong"] >= 0.8) & (df["d_ma50"] > 0)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--k", type=int, default=3)
    a = ap.parse_args()
    df = mh.doc()
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))
    th = pd.read_pickle(os.path.join(GOC, ".cache", "kq-nghien-cuu", "oos_tong_hop.pkl"))[["ngay", "ma", "diem"]]
    df = df.merge(th, on=["ngay", "ma"], how="inner")          # chỉ các năm có điểm đi tiếp (2017–2026)
    dk = dieu_kien(df)
    df["loai"] = np.select([dk["xac_nhan"], dk["chinh_ngan"], dk["dan_dat"]], ["xac_nhan", "chinh_ngan", "dan_dat"], "")
    u = df[df["loai"] != ""].copy()
    print(f"Ứng viên: {len(u):,} (ngày, mã), {u['ngay'].nunique()} ngày; theo loại: {u['loai'].value_counts().to_dict()}")
    kq = {}
    for xep in ("diem", "hang_gtgd"):
        u["p"] = u[xep].fillna(-1e9)
        for ch in CAU_HINH:
            lenh = chon_lenh(u, ch, -1e10, a.k, lich)
            tk = thong_ke(lenh[f"lai_{ch}"])
            nam = lenh.groupby(lenh["ngay"].dt.year)[f"lai_{ch}"].agg(["size", lambda s: (s > 0).mean(), "mean"])
            nam.columns = ["n", "thang", "tb"]
            loai = lenh.groupby("loai")[f"lai_{ch}"].agg(["size", lambda s: (s > 0).mean(), "mean"])
            loai.columns = ["n", "thang", "tb"]
            print(f"\n[xếp theo {xep}] {ch}: {tk}")
            print("   năm: " + " ".join(f"{y % 100:02d}:{r.n}/{r.thang:.0%}/{r.tb:+.1%}" for y, r in nam.iterrows()))
            print("   loại: " + " | ".join(f"{i}: {r.n} lệnh, thắng {r.thang:.0%}, TB {r.tb:+.2%}" for i, r in loai.iterrows()))
            kq[f"{xep}_{ch}"] = {"tong": tk, "nam": {int(y): [int(r.n), float(r.thang), float(r.tb)]
                                                     for y, r in nam.iterrows()},
                                 "loai": {i: [int(r.n), float(r.thang), float(r.tb)] for i, r in loai.iterrows()}}
    with open(os.path.join(GOC, ".cache", "kq-nghien-cuu", f"chien_luoc_cuoi_k{a.k}.json"), "w",
              encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
