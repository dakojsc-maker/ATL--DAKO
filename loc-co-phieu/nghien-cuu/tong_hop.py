"""Điểm tổng hợp từ các chỉ báo BỀN VỮNG – kiểm định đi tiếp theo năm (không nhìn trước).

Với mỗi năm kiểm định Y:
  1. Chỉ dùng các năm trước Y: tính IC chéo hằng ngày của từng chỉ báo với lợi nhuận 20 phiên sau; giữ chỉ báo có
     IC trung bình |IC| ≥ 0,015 và cùng dấu ở ≥ 70% số năm. Trọng số = IC trung bình.
  2. Điểm mỗi (ngày, mã) của năm Y = Σ trọng số × (thứ hạng phần trăm trong ngày − 0,5).
  3. Mỗi ngày mua tối đa K mã điểm cao nhất (trong top `phan_tram` của vũ trụ), một mã không mở lệnh chồng.

    python3 loc-co-phieu/nghien-cuu/tong_hop.py [--k 3] [--phan-tram 0.05]
"""
from __future__ import annotations

import argparse
import json
import os
import sys

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu import luotsong as ls  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from do_on_dinh import THI_TRUONG, ic_cheo  # noqa: E402
from huan_luyen import chon_lenh, thong_ke  # noqa: E402

CAU_HINH = ["6_4_20", "5_5_20", "5_4_10", "6_5_20", "7_5_20", "5_7_20", "7_7_20", "6_7_20", "5_3_10"]
TEN_TT = {0: "giảm", 1: "áp lực", 2: "tăng"}


def chuan_bi():
    df = pd.read_pickle(os.environ.get("LS_TEP_DL", os.path.join(GOC, ".cache", "nghien-cuu.pkl")))
    df = df[df["fwd20"].notna()]
    feats = [k for k in ls.DAC_TRUNG if k not in THI_TRUONG and k not in ("ma_san", "chuoi_tang", "chuoi_giam")]
    ngay = df.index.get_level_values(0)
    R = df[feats].groupby(ngay).rank(pct=True) - 0.5
    ic = ic_cheo(df, "fwd20", feats).replace([np.inf, -np.inf], np.nan)
    return df, feats, R, ic


def trong_so(ic: pd.DataFrame, den: pd.Timestamp, on_dinh: float = 0.7, ic_min: float = 0.015) -> pd.Series:
    hoc = ic[ic.index < den]
    nam = hoc.groupby(hoc.index.year).mean()
    tb = hoc.mean()
    cung_dau = np.where(tb > 0, (nam > 0).mean(), (nam < 0).mean())
    chon = (tb.abs() >= ic_min) & (cung_dau >= on_dinh)
    return tb[chon]


def chay(df, R, ic, k: int, phan_tram: float, nam_thu: list[int]) -> pd.DataFrame:
    ngay = df.index.get_level_values(0)
    kq = []
    for nam in nam_thu:
        bd = pd.Timestamp(f"{nam}-01-01")
        w = trong_so(ic, bd - pd.Timedelta(days=30))
        thu = (ngay >= bd) & (ngay < pd.Timestamp(f"{nam + 1}-01-01"))
        diem = (R.loc[thu, w.index].fillna(0) * w).sum(axis=1)
        d = df.loc[thu, ["che_do"] + [c for c in df.columns if c.startswith(("lai_", "giu_"))]].copy()
        d["diem"] = diem
        d["hang_ngay"] = d.groupby(level=0)["diem"].rank(pct=True, ascending=False)
        d["ngay"], d["ma"] = d.index.get_level_values(0), d.index.get_level_values(1)
        d["so_dac_trung"] = len(w)
        kq.append(d.reset_index(drop=True))
    return pd.concat(kq, ignore_index=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--k", type=int, default=3)
    ap.add_argument("--phan-tram", type=float, default=0.05)
    ap.add_argument("--nam", type=int, nargs="+", default=list(range(2017, 2027)))
    a = ap.parse_args()
    df, feats, R, ic = chuan_bi()
    lich = pd.DatetimeIndex(sorted(df.index.get_level_values(0).unique()))
    w_cuoi = trong_so(ic, pd.Timestamp("2026-12-31"))
    print("Chỉ báo bền vững (toàn bộ dữ liệu – chỉ để tham khảo, kiểm định dùng dữ liệu trước từng năm):")
    print(w_cuoi.sort_values().round(4).to_string())
    oos = chay(df, R, ic, a.k, a.phan_tram, a.nam)
    oos.to_pickle(os.path.join(GOC, ".cache", "kq-nghien-cuu", "oos_tong_hop.pkl"))
    ung_vien = oos[oos["hang_ngay"] <= a.phan_tram].copy()
    tong = {}
    for ch in CAU_HINH:
        u = ung_vien.rename(columns={"diem": "p"})
        lenh = chon_lenh(u, ch, -1e9, a.k, lich)
        tk = thong_ke(lenh[f"lai_{ch}"])
        nam = {int(n): (len(g), round((g[f"lai_{ch}"] > 0).mean(), 3), round(g[f"lai_{ch}"].mean(), 4))
               for n, g in lenh.groupby(lenh["ngay"].dt.year)}
        tt = {TEN_TT.get(int(c), c): (len(g), round((g[f"lai_{ch}"] > 0).mean(), 3), round(g[f"lai_{ch}"].mean(), 4))
              for c, g in lenh.groupby("che_do")}
        nen = thong_ke(oos[f"lai_{ch}"])
        print(f"\n[{ch}] chọn: {tk}\n   nền cùng kỳ: thắng {nen['thang']}, TB {nen['tb']}\n   theo năm: {nam}\n   theo thị trường: {tt}")
        tong[ch] = {"chon": tk, "nen": nen, "nam": nam, "thi_truong": tt}
    with open(os.path.join(GOC, ".cache", "kq-nghien-cuu", f"tong_hop_k{a.k}.json"), "w", encoding="utf-8") as fh:
        json.dump(tong, fh, ensure_ascii=False, indent=1, default=str)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
