"""So sánh hiệu quả ĐẦU TƯ của các phương pháp trên một tài khoản mô phỏng (luật T+2, biên độ, phí & thuế):
  - tối đa 5 mã cùng lúc, mỗi mã 20% tài sản (tính lại lúc mở lệnh), một mã chỉ giữ một lệnh;
  - mỗi ngày nhận tín hiệu theo thứ tự ưu tiên của phương pháp, mua giá mở cửa phiên sau, chỉ mua khi còn chỗ trống;
  - bán theo cấu hình chốt lời / cắt lỗ / số phiên; tiền chưa dùng không tính lãi;
  - tài sản tính theo giá vốn của lệnh đang giữ (lỗ/lãi chỉ ghi nhận khi bán) → mức sụt giảm có thể lớn hơn đôi chút.
Giai đoạn chung 2017 → 10/2026 (điểm "đi tiếp" của chiến lược lướt sóng chỉ có từ 2017). So với VN-Index (chỉ số giá).

    python3 loc-co-phieu/nghien-cuu/so_sanh.py
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chung  # noqa: E402
import mau_hinh as mh  # noqa: E402
import phan_ky as pk  # noqa: E402
from chien_luoc_cuoi import dieu_kien  # noqa: E402

TU = "2017-01-01"
SO_VI_THE = 5


def tai_khoan(u: pd.DataFrame, ch: str, lich: pd.DatetimeIndex, so_vi_the: int = SO_VI_THE) -> dict:
    """Mô phỏng tài khoản theo danh sách tín hiệu u (cột ngay, ma, p, lai_ch, giu_ch)."""
    lai_c, giu_c = f"lai_{ch}", f"giu_{ch}"
    u = u[(u["ngay"] >= TU) & u[lai_c].notna() & u[giu_c].notna()]
    vi_tri = pd.Series(np.arange(len(lich)), index=lich)
    u = u.assign(i=vi_tri.reindex(u["ngay"]).to_numpy()).sort_values(["i", "p"], ascending=[True, False])
    tien, mo, dang_giu = 1.0, [], set()
    diem_von, lenh, phien_giu = [], [], 0
    for i, nhom in u.groupby("i", sort=True):
        dong = sorted((t for t in mo if t["ra"] <= i), key=lambda x: x["ra"])   # đã bán trước phiên mua mới
        mo = [t for t in mo if t["ra"] > i]
        for k, t in enumerate(dong):
            tien += t["von"] * (1 + t["lai"])
            dang_giu.discard(t["ma"])
            diem_von.append((t["ra"], tien + sum(x["von"] for x in mo) + sum(x["von"] for x in dong[k + 1:])))
        for r in nhom.itertuples(index=False):
            if len(mo) >= so_vi_the:
                break
            if r.ma in dang_giu:
                continue
            tong = tien + sum(t["von"] for t in mo)
            von = min(tien, tong / so_vi_the)
            if von <= 0:
                break
            giu = int(getattr(r, giu_c))
            lai = float(getattr(r, lai_c))
            tien -= von
            mo.append({"ma": r.ma, "von": von, "lai": lai, "ra": int(i) + 1 + giu})
            dang_giu.add(r.ma)
            lenh.append((int(lich[int(i)].year), lai))
            phien_giu += giu + 1
    con = sorted(mo, key=lambda x: x["ra"])
    for k, t in enumerate(con):
        tien += t["von"] * (1 + t["lai"])
        diem_von.append((t["ra"], tien + sum(x["von"] for x in con[k + 1:])))
    if not diem_von:
        return {"so_lenh": 0}
    dv = pd.Series([v for _, v in diem_von], index=[lich[min(k, len(lich) - 1)] for k, _ in diem_von])
    dv = dv.groupby(level=0).last()
    return _chi_so(dv, lenh, phien_giu, so_vi_the, lich)


def _chi_so(dv: pd.Series, lenh: list[tuple[int, float]], phien_giu: int, so_vi_the: int, lich: pd.DatetimeIndex) -> dict:
    bat_dau = lich[lich >= TU][0]
    so_nam = (lich[-1] - bat_dau).days / 365.25
    cuoi = float(dv.iloc[-1])
    duong = pd.concat([pd.Series([1.0], index=[bat_dau]), dv])
    sut = float((duong / duong.cummax() - 1).min())
    cuoi_nam = duong.groupby(duong.index.year).last()
    dau_nam = cuoi_nam.shift(1).fillna(1.0)
    nam = (cuoi_nam / dau_nam - 1).round(4)
    l = np.array([x for _, x in lenh])
    theo_nam = pd.Series(l).groupby([y for y, _ in lenh])
    so_phien = int((lich >= bat_dau).sum())
    return {"so_lenh": int(len(l)), "thang": round(float((l > 0).mean()), 3), "tb_lenh": round(float(l.mean()), 4),
            "tai_san_cuoi": round(cuoi, 3), "lai_nam_kep": round(cuoi ** (1 / so_nam) - 1, 4),
            "sut_giam_max": round(sut, 4), "ty_le_giu_von": round(phien_giu / (so_phien * so_vi_the), 3),
            "phien_giu_tb": round(phien_giu / max(1, len(l)), 1),
            "nam": {int(k): float(v) for k, v in nam.items()},
            "lenh_nam": {int(k): [int(len(g)), round(float((g > 0).mean()), 2), round(float(g.mean()), 4)]
                         for k, g in theo_nam}}


def vn_index(lich: pd.DatetimeIndex) -> dict:
    vni = pd.read_csv(os.path.join(chung.GOC, ".cache", "lich-su", "VNINDEX.csv"), index_col=0, parse_dates=True)
    c = vni["close"].loc[TU:lich[-1]]
    so_nam = (c.index[-1] - c.index[0]).days / 365.25
    cuoi = float(c.iloc[-1] / c.iloc[0])
    cuoi_nam = c.groupby(c.index.year).last()
    dau_nam = cuoi_nam.shift(1).fillna(float(c.iloc[0]))
    return {"tai_san_cuoi": round(cuoi, 3), "lai_nam_kep": round(cuoi ** (1 / so_nam) - 1, 4),
            "sut_giam_max": round(float((c / c.cummax() - 1).min()), 4),
            "nam": {int(k): round(float(v), 4) for k, v in (cuoi_nam / dau_nam - 1).items()}}


def main() -> int:
    df = mh.doc()
    bang, san, _, _ = chung.doc_bang()
    print("Mô phỏng thêm 20/7/40, dò phân kỳ…", flush=True)
    chung.gan_cot(df, chung.ket_qua_them(bang, san, [(0.20, 0.07, 40)]))
    co = pk.tin_hieu(bang)
    chung.gan_cot(df, {f"pk_{k}": v.astype(float) for k, v in co.items()})
    th = pd.read_pickle(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "oos_tong_hop.pkl"))[["ngay", "ma", "diem"]]
    df = df.merge(th, on=["ngay", "ma"], how="left")
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))

    rsi, macd, nen, mcat = (df[f"pk_{k}"] > 0 for k in ("rsi", "macd", "nen", "macd_cat"))
    N = (df["d_dinh250"] >= -0.05) & (df["d_dinh20"] >= -0.005) & (df["r1"] > 0)
    S = df["kl_tb50"] >= np.log1p(1.5)
    L = df["rs_tong"] >= 0.80
    M = df["che_do"] == 2
    xu_huong = (df["d_ma50"] > 0) & (df["sl_ma50"] > 0) & (df["d_ma200"] > 0) & (df["sl_ma200"] > 0)
    dk = dieu_kien(df)
    luot = (dk["xac_nhan"] | dk["dan_dat"]) & df["diem"].notna()

    pp = {   # tên: (điều kiện, cột ưu tiên, cấu hình bán)
        "Phân kỳ dương RSI + nến xác nhận": (rsi & nen, "hang_gtgd", "7_7_20"),
        "Phân kỳ dương RSI + MACD, MACD cắt lên": (rsi & macd & mcat, "hang_gtgd", "7_7_20"),
        "Phân kỳ dương RSI + MACD, MACD cắt lên (bán kiểu O'Neil)": (rsi & macd & mcat, "hang_gtgd", "20_7_40"),
        "CANSLIM kỹ thuật N+S+L+M (bán kiểu O'Neil)": (N & S & L & M, "rs_tong", "20_7_40"),
        "CANSLIM kỹ thuật N+S+L+M + xu hướng (bán kiểu O'Neil)": (N & S & L & M & xu_huong, "rs_tong", "20_7_40"),
        "CANSLIM kỹ thuật N+S+L+M (bán sớm +7%/−7%)": (N & S & L & M, "rs_tong", "7_7_20"),
        "Lướt sóng 5–7% của công cụ": (luot, "diem", "7_7_20"),
    }
    kq = {"VN-Index (mua và giữ)": vn_index(lich)}
    for ten, (dk_, cot, ch) in pp.items():
        u = df[dk_.to_numpy()].copy()
        u["p"] = u[cot].fillna(-1e9)
        kq[ten] = tai_khoan(u, ch, lich)
        kq[ten]["ban"] = ch
    print(f"\nTài khoản 5 mã × 20%, {TU[:4]} → {lich[-1]:%m/%Y}:")
    for ten, k in kq.items():
        print(f"\n{ten}: tài sản ×{k['tai_san_cuoi']} · lãi kép {k['lai_nam_kep']:+.1%}/năm · "
              f"sụt giảm lớn nhất {k['sut_giam_max']:.0%}"
              + (f" · {k['so_lenh']} lệnh, thắng {k['thang']:.0%}, TB {k['tb_lenh']:+.2%}/lệnh, "
                 f"giữ TB {k['phien_giu_tb']} phiên, dùng {k['ty_le_giu_von']:.0%} vốn" if "so_lenh" in k else ""))
        print("   tài khoản theo năm: " + " ".join(f"{y % 100:02d}:{v:+.0%}" for y, v in k["nam"].items()))
        if "lenh_nam" in k:
            print("   lệnh theo năm (số/thắng/TB): " + " ".join(f"{y % 100:02d}:{n}/{t:.0%}/{m:+.1%}"
                                                         for y, (n, t, m) in k["lenh_nam"].items()))
    with open(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "so_sanh.json"), "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
