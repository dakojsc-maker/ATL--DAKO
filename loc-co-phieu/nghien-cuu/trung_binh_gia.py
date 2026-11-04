"""Có nên "trung bình giá" (mua thêm cổ phiếu đang giữ) khi thị trường điều chỉnh? Rà soát một danh mục.

1. Kiểm định 2014–10/2026, mọi mã đủ thanh khoản vào các ngày thị trường "ĐIỀU CHỈNH / GIẢM": mua thêm ở trạng thái
   nào thì 1 tháng / 3 tháng sau có lời, và rủi ro giảm thêm ≥ 10% (xét theo xu hướng MA200 và mức cách đỉnh 52 tuần).
2. Từng mã trong danh mục: xu hướng, sức mạnh giá, diễn biến từ đỉnh VN-Index 04/09, lợi nhuận quý (KBS), và thành
   tích của chính mã đó khi mua trong các đợt điều chỉnh từ 2021.

    python3 loc-co-phieu/nghien-cuu/trung_binh_gia.py TCH CII CEO ...
"""
from __future__ import annotations

import json
import os
import sys
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chung  # noqa: E402
import xay_du_lieu as xd  # noqa: E402
from chung import ls  # noqa: E402

DINH_VNI = "2026-09-04"


def trang_thai(df: pd.DataFrame) -> pd.Series:
    up = (df["d_ma200"] > 0) & (df["sl_ma200"] > 0)
    down = (df["d_ma200"] < 0) & (df["sl_ma200"] < 0)
    return pd.Series(np.select([up, down], ["tăng (trên MA200 đi lên)", "giảm (dưới MA200 đi xuống)"],
                               "lưng chừng"), index=df.index)


def kiem_dinh(df: pd.DataFrame, bang: dict) -> pd.DataFrame:
    """Kết quả mua thêm khi thị trường điều chỉnh, theo trạng thái của mã."""
    C, L = bang["C"], bang["L"]
    vao = bang["O"].shift(-1)
    f60 = C.shift(-61) / vao - 1                                  # mua mở cửa phiên sau, giữ ~3 tháng
    thap60 = L[::-1].rolling(60, min_periods=40).min()[::-1].shift(-1) / C - 1   # mức giảm sâu nhất 60 phiên tới
    ii = C.index.get_indexer(df["ngay"])
    jj = C.columns.get_indexer(df["ma"])
    ok = (ii >= 0) & (jj >= 0)
    for ten, b in (("fwd60", f60), ("thap60", thap60)):
        a = np.full(len(df), np.nan)
        a[ok] = b.to_numpy()[ii[ok], jj[ok]]
        df[ten] = a
    dc = df[df["che_do"] == 0].copy()
    dc["xu_huong"] = trang_thai(dc)
    dc["cach_dinh"] = pd.cut(dc["d_dinh250"], [-1, -0.5, -0.3, -0.15, 0.01],
                             labels=["giảm > 50%", "30–50%", "15–30%", "< 15%"])
    kq = []
    for nhom, g in list(dc.groupby("xu_huong")) + list(dc.groupby("cach_dinh")):
        g = g.dropna(subset=["fwd20", "fwd60", "thap60"])
        nam = g.groupby(g["ngay"].dt.year)["fwd60"].mean()
        kq.append({"nhom": nhom, "so_dong": len(g), "lai_1_thang": g["fwd20"].mean() - 0.004,
                   "co_lai_1_thang": (g["fwd20"] > 0.004).mean(), "lai_3_thang": g["fwd60"].mean() - 0.004,
                   "co_lai_3_thang": (g["fwd60"] > 0.004).mean(), "giam_them_10": (g["thap60"] <= -0.10).mean(),
                   "nam_lai_3_thang": f"{int((nam > 0).sum())}/{len(nam)}"})
    k = pd.DataFrame(kq)
    print("Mua thêm khi thị trường điều chỉnh (2014–2026, mọi mã đủ thanh khoản), đã trừ phí:")
    for r in k.itertuples():
        print(f"  {r.nhom:28} {r.so_dong:7,} lần | 1 tháng: TB {r.lai_1_thang:+.1%}, có lãi {r.co_lai_1_thang:.0%} | "
              f"3 tháng: TB {r.lai_3_thang:+.1%}, có lãi {r.co_lai_3_thang:.0%} (năm dương {r.nam_lai_3_thang}) | "
              f"giảm thêm ≥ 10% trong 3 tháng: {r.giam_them_10:.0%}")
    return dc


def theo_ma(dc: pd.DataFrame, ma: list[str], lich: pd.DatetimeIndex) -> dict:
    """Thành tích của từng mã khi mua trong các đợt điều chỉnh từ 2021 (mỗi đợt tính một lần, lấy bình quân).
    `lich` là lịch giao dịch đầy đủ để tách các đợt điều chỉnh."""
    d = dc[(dc["ngay"] >= "2021-01-01") & dc["ma"].isin(ma)].copy()
    # đợt điều chỉnh: các ngày điều chỉnh liền nhau (cách nhau ≤ 7 phiên)
    ngay = pd.DatetimeIndex(sorted(d["ngay"].unique()))
    vt = lich.get_indexer(ngay)
    dot_id = np.concatenate([[0], np.cumsum(np.diff(vt) > 7)])
    d["dot"] = d["ngay"].map(dict(zip(ngay, dot_id)))
    kq = {}
    for m, g in d.groupby("ma"):
        dot = g.groupby("dot").agg(f20=("fwd20", "mean"), f60=("fwd60", "mean"), sau=("thap60", "mean"),
                                   bat_dau=("ngay", "min"))
        dot = dot.dropna(subset=["f60"])
        if dot.empty:
            continue
        kq[m] = {"so_dot": int(len(dot)), "dot_lai_3_thang": int((dot["f60"] > 0.004).sum()),
                 "tb_3_thang": round(float(dot["f60"].mean() - 0.004), 4),
                 "dot_lai_1_thang": int((dot["f20"] > 0.004).sum()), "tb_1_thang": round(float(dot["f20"].mean() - 0.004), 4),
                 "giam_them_tb": round(float(dot["sau"].mean()), 4),
                 "dot": " ".join(f"{r.bat_dau:%m/%y}:{r.f60 - 0.004:+.0%}" for r in dot.itertuples())}
    return kq


def hien_tai(ma: list[str]) -> pd.DataFrame:
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
    p = C.index.get_loc(pd.Timestamp(DINH_VNI))
    vc = vni["close"].reindex(C.index).ffill()
    with open(os.path.join(chung.GOC, ".cache", "tai-chinh.json"), encoding="utf-8") as fh:
        tc = json.load(fh)
    hang = []
    for m in ma:
        if m not in C.columns:
            hang.append({"ma": m, "loi": "không có dữ liệu giá"})
            continue
        x = {k: (round(float(f[k].at[T, m]), 4) if np.isfinite(f[k].at[T, m]) else None)
             for k in ("d_ma50", "d_ma200", "sl_ma200", "d_dinh250", "rs_tong", "beta60", "bien_dong20")}
        q = (tc.get(m, {}).get("quy") or [{}])[0]
        g = q.get("tt_lnst")
        gia = float(C.at[T, m])
        eps = q.get("eps4q")
        hang.append({"ma": m, "san": str(ds["san"].get(m, "")), "nganh": str(ds["nganh"].get(m, "")),
                     "ten": str(ds["ten"].get(m, "")), "gia": gia, **x,
                     "tu_0409": round(gia / float(C.iat[p, C.columns.get_loc(m)]) - 1, 4),
                     "gtgd20": round(float(f["_gtgd20"].at[T, m]), 1),
                     "kl_5_50": round(float(V[m].tail(5).mean() / max(1.0, V[m].iloc[-55:-5].mean())), 2),
                     "quy": f"Q{q.get('quy')}/{q.get('nam')}" if q else None,
                     "tt_lnst": None if g is None or abs(g) < 0.005 else g, "roe4q": q.get("roe4q"),
                     "pe": round(gia * 1000 / eps, 1) if eps and eps > 0 else None})
    k = pd.DataFrame(hang).set_index("ma")
    k.attrs["ngay"] = f"{T:%d/%m/%Y}"
    k.attrs["vni_tu_0409"] = round(float(vc.iat[-1] / vc.iat[p] - 1), 4)
    return k


def main() -> int:
    ma = [m.upper() for m in sys.argv[1:]]
    if not ma:
        print(__doc__)
        return 1
    df = chung.doc_dataset()
    bang, _, _, _ = chung.doc_bang()
    dc = kiem_dinh(df, bang)
    td = theo_ma(dc, ma, pd.DatetimeIndex(sorted(df["ngay"].unique())))
    k = hien_tai(ma)
    for m, x in td.items():
        for kk, vv in x.items():
            k.loc[m, kk] = vv
    k["xu_huong"] = trang_thai(k[["d_ma200", "sl_ma200"]].astype(float))
    pd.set_option("display.width", 260)
    print(f"\nDanh mục – phiên {k.attrs['ngay']} (VN-Index từ 04/09: {k.attrs['vni_tu_0409']:+.1%}):")
    print(k.drop(columns=["ten"]).to_string())
    with open(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "trung-binh-gia.json"), "w", encoding="utf-8") as fh:
        json.dump(json.loads(k.to_json(force_ascii=False)), fh, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
