"""Lướt T+ (giữ vài phiên) khi thị trường đang điều chỉnh: kiểu điểm mua nào từng có lãi? Rà soát một danh mục.

1. Kiểm định 2014–10/2026, mọi mã đủ thanh khoản, các ngày thị trường "ĐIỀU CHỈNH / GIẢM" và sau các "ngày xác nhận
   tăng": mua giá mở cửa phiên sau,
   bán theo luật T+2 với các cấu hình ngắn (chốt +5% / cắt −3% / tối đa 10 phiên; +5 / −5 / 10; +6 / −4 / 10) và lợi nhuận
   giữ 5 phiên. So sánh các kiểu điểm mua: khỏe ngắn hạn, quá mua, chỉnh ngắn trong xu hướng tăng, bật đáy quá bán,
   tăng mạnh kèm khối lượng, và điều kiện VN-Index tăng trong phiên.
2. Từng mã trong danh mục (giá mới nhất): kiểu điểm mua hiện tại, thanh khoản, biến động, và thành tích lướt T+ của chính
   mã đó khi thị trường điều chỉnh từ 2021.

    python3 loc-co-phieu/nghien-cuu/tai_lich_su.py --lam-moi   # giá mới nhất
    python3 loc-co-phieu/nghien-cuu/luot_t.py MÃ1 MÃ2 …
"""
from __future__ import annotations

import os
import sys
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mau_hinh as mh  # noqa: E402
import xay_du_lieu as xd  # noqa: E402
from chung import ls  # noqa: E402

CAU_HINH = ["5_3_10", "5_5_10", "6_4_10"]


def kieu(df: pd.DataFrame) -> dict[str, pd.Series]:
    """Các kiểu điểm mua (tính ở phiên t, mua mở cửa t+1)."""
    khoe = ((df["d_ma20"] > 0) & (df["d_ma50"] > 0) & (df["sl_ma20"] > 0) & (df["d_dinh20"] >= -0.03)
            & df["rsi14"].between(50, 70))
    return {
        "Mọi mã (nền)": pd.Series(True, index=df.index),
        "Khỏe ngắn hạn (trên MA20, MA50; sát đỉnh 20 phiên; RSI 50–70)": khoe,
        "Quá mua (RSI ≥ 70 hoặc tăng ≥ 10% trong 5 phiên)": (df["rsi14"] >= 70) | (df["r5"] >= 0.10),
        "Chỉnh ngắn trong xu hướng tăng (trên MA50 đi lên, RSI2 ≤ 20)": ((df["d_ma50"] > 0) & (df["sl_ma50"] > 0)
                                                                       & (df["rsi2"] <= 20)),
        "Bật đáy quá bán (RSI2 ≤ 10, dưới MA20)": (df["rsi2"] <= 10) & (df["d_ma20"] < 0),
        "Tăng ≥ 3% kèm khối lượng ≥ 1,5× TB20": (df["r1"] >= 0.03) & (df["kl_tb20"] >= np.log1p(1.5)),
        "Khỏe ngắn hạn + VN-Index tăng trong phiên": khoe & (df["vni_r1"] > 0),
    }


def kiem_dinh(df: pd.DataFrame) -> None:
    dc = df[df["che_do"] == 0]
    print(f"Thị trường điều chỉnh: {len(dc):,} (ngày, mã) 2014–2026. Mua mở cửa phiên sau, đã trừ phí, luật T+2.")
    for ten, dk in kieu(dc).items():
        g = dc[dk.fillna(False)]
        if len(g) < 200:
            continue
        dong = []
        for ch in CAU_HINH:
            x = g[f"lai_{ch}"].dropna()
            nam = x.groupby(g.loc[x.index, "ngay"].dt.year).mean()
            x5 = x[g.loc[x.index, "ngay"] >= "2021-01-01"]
            dong.append(f"{ch}: thắng {(x > 0).mean():.0%} TB {x.mean():+.2%} (năm dương {(nam > 0).sum()}/{len(nam)}; "
                        f"từ 2021 thắng {(x5 > 0).mean():.0%} TB {x5.mean():+.2%})")
        f5 = g["fwd5"].dropna() - 0.004
        print(f"\n## {ten}: {len(g):,} lần · giữ 5 phiên TB {f5.mean():+.2%}, có lời {(f5 > 0).mean():.0%}")
        for s in dong:
            print("   " + s)


def sau_ngay_xac_nhan(df: pd.DataFrame) -> None:
    """Mua mở cửa phiên sau một "ngày xác nhận tăng" (định nghĩa O'Neil trong manh_khi_dieu_chinh.py)."""
    import manh_khi_dieu_chinh as mk
    v = pd.read_csv(os.path.join(xd.THU_MUC, "VNINDEX.csv"), index_col=0, parse_dates=True)
    ftd = [v.index[e["t"]] for e in mk.ngay_xac_nhan(v["close"].to_numpy(), v["volume"].to_numpy())]
    d = df[df["ngay"].isin(ftd)]
    tran = d["r1"] >= d["san"].map(ls.BIEN_DO).fillna(0.07) * 0.93
    nhom = {"Mọi mã": pd.Series(True, index=d.index), "Tăng < 1% trong ngày xác nhận": d["r1"] < 0.01,
            "Tăng ≥ 3% kèm KL ≥ 1,5×": (d["r1"] >= 0.03) & (d["kl_tb20"] >= np.log1p(1.5)),
            "Tăng trần / sát trần": tran, "Trần, dưới MA50": tran & (d["d_ma50"] < 0),
            "Trần, trên MA50": tran & (d["d_ma50"] >= 0), "Trần, GTGD ≥ 50 tỷ": tran & (d["gtgd20"] >= 50)}
    print(f"\nSau {d['ngay'].nunique()} ngày xác nhận tăng (2014–2026), mua mở cửa phiên sau:")
    for ten, m in nhom.items():
        g = d[m.fillna(False)]
        print(f"  {ten:28} {len(g):5} lệnh · " + " · ".join(
            f"{ch} thắng {(g[f'lai_{ch}'] > 0).mean():.0%} TB {g[f'lai_{ch}'].mean():+.2%}" for ch in ("5_5_10", "6_4_10", "7_7_20"))
            + f" · giữ 5 phiên {g['fwd5'].mean() - 0.004:+.2%}")


def theo_ma(df: pd.DataFrame, ma: list[str]) -> None:
    d = df[(df["che_do"] == 0) & (df["ngay"] >= "2021-01-01") & df["ma"].isin(ma)]
    print("\nThành tích lướt T+ từng mã khi thị trường điều chỉnh từ 2021 (mua bất kỳ ngày nào, cấu hình +5/−3/10 và "
          "+5/−5/10):")
    for m, g in d.groupby("ma"):
        a, b = g["lai_5_3_10"].dropna(), g["lai_5_5_10"].dropna()
        k = g[kieu(g)["Khỏe ngắn hạn (trên MA20, MA50; sát đỉnh 20 phiên; RSI 50–70)"].fillna(False)]["lai_5_3_10"].dropna()
        print(f"  {m:4} {len(a):4} ngày · +5/−3: thắng {(a > 0).mean():.0%} TB {a.mean():+.2%} · +5/−5: thắng "
              f"{(b > 0).mean():.0%} TB {b.mean():+.2%} · lúc khỏe ngắn hạn: {len(k)} ngày, thắng "
              f"{(k > 0).mean() if len(k) else float('nan'):.0%} TB {k.mean() if len(k) else float('nan'):+.2%}")


def hien_tai(ma: list[str]) -> None:
    du, vni, ds = xd.doc_lich_su()
    du = {m: x.iloc[-700:] for m, x in du.items()}
    for m in ma:
        p = os.path.join(xd.THU_MUC, f"{m}.csv")
        if m not in du and os.path.exists(p):
            du[m] = pd.read_csv(p, index_col=0, parse_dates=True)
    bang = ls.tao_bang(du)
    f = ls.dac_trung(bang, vni, ds["nganh"], ds["san"])
    C, V = bang["C"], bang["V"]
    T = C.index[-1]
    vc = vni["close"]
    x = pd.DataFrame({k: f[k].loc[T] for k in ("d_ma20", "d_ma50", "sl_ma20", "sl_ma50", "d_dinh20", "rsi14", "rsi2",
                                               "r1", "r5", "kl_tb20", "atr_pct", "_gtgd20")}).loc[[m for m in ma
                                                                                                if m in C.columns]]
    x["vni_r1"] = float(vc.iat[-1] / vc.iat[-2] - 1)
    x["gia"] = C.loc[T, x.index]
    x["kl_x"] = np.expm1(x["kl_tb20"])
    k = kieu(x)
    x["kieu"] = [", ".join(t.split(" (")[0] for t, s in k.items() if t != "Mọi mã (nền)" and bool(s.get(m, False)))
                 or "—" for m in x.index]
    print(f"\nPhiên {T:%d/%m/%Y}: VN-Index {vc.iat[-1]:,.2f} ({x['vni_r1'].iat[0]:+.2%})")
    cot = ["gia", "r1", "r5", "d_ma20", "d_ma50", "sl_ma20", "d_dinh20", "rsi14", "rsi2", "kl_x", "atr_pct", "_gtgd20", "kieu"]
    pd.set_option("display.width", 250)
    print(x[cot].round(3).sort_values("_gtgd20", ascending=False).to_string())


def main() -> int:
    ma = [m.upper() for m in sys.argv[1:]]
    df = mh.doc()
    kiem_dinh(df)
    sau_ngay_xac_nhan(df)
    if ma:
        theo_ma(df, ma)
        hien_tai(ma)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
