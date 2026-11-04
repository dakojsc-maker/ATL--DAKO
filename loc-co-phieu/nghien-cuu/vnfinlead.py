"""Chọn mã tài chính trong rổ VNFINLEAD để đầu tư 1 tháng khi thị trường đang điều chỉnh.

1. Kiểm định (2014–10/2026): mã ngân hàng, chứng khoán trên HOSE (GTGD ≥ 10 tỷ) vào các ngày thị trường "ĐIỀU CHỈNH /
   GIẢM" – chỉ báo nào dự báo kết quả lệnh +7% / −7% / 20 phiên (hệ số thông tin theo năm, chọn 1 mã cao nhất mỗi ngày).
2. Thành tích của từng mã trong rổ qua từng đợt điều chỉnh từ 2021 (mua một ngày bất kỳ trong đợt, bán +7/−7/20).
3. Bảng điểm hiện tại của 24 mã: sức mạnh giá, biến động, beta, khối lượng, điểm lướt sóng, lợi nhuận quý, ROE, P/E.

    python3 loc-co-phieu/nghien-cuu/tai_lich_su.py --lam-moi   # giá mới nhất
    python3 loc-co-phieu/nghien-cuu/vnfinlead.py
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
from locphieu.dulieu import NguonVCI, _goi  # noqa: E402

URL_RO = "https://trading.vietcap.com.vn/api/price/symbols/getByGroup?group=VNFinLead"
DAC = ["diem", "rs_tong", "rs20", "d_dinh_rs60", "d_dinh250", "d_dinh20", "atr_pct", "bien_dong20", "beta60", "rsi2",
       "rsi14", "r20", "d_ma50", "d_ma200", "kl5_50", "kl20_100", "do_chat10"]


def ro_vnfinlead() -> list[str]:
    d = _goi("GET", URL_RO, headers=NguonVCI.HEADERS)
    ds = d if isinstance(d, list) else d.get("data", [])
    return sorted({x["symbol"] for x in ds if isinstance(x, dict) and x.get("symbol")})


def kiem_dinh(df: pd.DataFrame, ro: list[str]) -> dict:
    R = df.groupby("ngay")[list(ls.TRONG_SO)].rank(pct=True) - 0.5
    df["diem"] = (R.fillna(0) * pd.Series(ls.TRONG_SO)).sum(axis=1)
    tc = df[df["nganh"].astype(str).isin(["8300", "8700"]) & (df["san"] == "HOSE") & (df["gtgd20"] >= 10)]
    dc = tc[tc["che_do"] == 0]
    dc = dc[dc.groupby("ngay")["ma"].transform("size") >= 8].copy()
    kq = {"nen": {"dong": int(len(dc)), "thang": round(float((dc["lai_7_7_20"] > 0).mean()), 3),
                  "tb": round(float(dc["lai_7_7_20"].mean()), 4)}, "chi_bao": {}}
    print(f"Mã tài chính HOSE khi thị trường điều chỉnh: {len(dc):,} (ngày, mã); nền 7/7/20 thắng {kq['nen']['thang']:.0%}, "
          f"TB {kq['nen']['tb']:+.2%}")
    for f in DAC:
        ic = dc.groupby("ngay").apply(lambda g: g[f].corr(g["lai_7_7_20"], method="spearman"))
        icn = ic.groupby(ic.index.year).mean()
        cao = dc.loc[dc.groupby("ngay")[f].idxmax().dropna()]
        kq["chi_bao"][f] = {"ic": round(float(ic.mean()), 3), "nam_duong": f"{int((icn > 0).sum())}/{len(icn)}",
                            "top1_thang": round(float((cao["lai_7_7_20"] > 0).mean()), 3),
                            "top1_tb": round(float(cao["lai_7_7_20"].mean()), 4)}
        print(f"  {f:12} IC {ic.mean():+.3f} (năm dương {kq['chi_bao'][f]['nam_duong']}) | mã cao nhất mỗi ngày: "
              f"thắng {kq['chi_bao'][f]['top1_thang']:.0%}, TB {kq['chi_bao'][f]['top1_tb']:+.2%}")
    # từng đợt điều chỉnh (chuỗi phiên ở trạng thái điều chỉnh, gộp khoảng nghỉ < 5 phiên) từ 2021
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))
    cd = df.groupby("ngay")["che_do"].first().reindex(lich).to_numpy()
    dot, a, nghi, b = [], None, 0, None
    for i, x in enumerate(cd):
        if x == 0:
            a, nghi, b = (i if a is None else a), 0, i
        elif a is not None:
            nghi += 1
            if nghi >= 5:
                dot.append((a, b))
                a = None
    if a is not None:
        dot.append((a, b))
    dot = [(x, y) for x, y in dot if lich[x] >= pd.Timestamp("2021-01-01")]
    kq["theo_dot"] = {}
    for ma in ro:
        g = tc[(tc["ma"] == ma) & (tc["che_do"] == 0)].set_index("ngay")["lai_7_7_20"].dropna()
        if g.empty:
            continue
        tung = [float(g.loc[lich[x]:lich[y]].mean()) for x, y in dot if len(g.loc[lich[x]:lich[y]]) >= 3]
        s = g[g.index >= "2021-01-01"]
        kq["theo_dot"][ma] = {"so_dot": len(tung), "dot_lai": int(sum(1 for v in tung if v > 0)),
                              "thang": round(float((s > 0).mean()), 3), "tb": round(float(s.mean()), 4)}
    print("\nTừng mã trong rổ – mua một ngày bất kỳ khi thị trường điều chỉnh (từ 2021), bán +7/−7/20:")
    for ma, x in sorted(kq["theo_dot"].items(), key=lambda kv: -kv[1]["dot_lai"] / max(1, kv[1]["so_dot"])):
        print(f"  {ma:4} đợt có lãi {x['dot_lai']}/{x['so_dot']} · thắng {x['thang']:.0%} · TB {x['tb']:+.2%}")
    return kq


def bang_diem(ro: list[str]) -> pd.DataFrame:
    du, vni, ds = xd.doc_lich_su()
    du = {m: d.iloc[-700:] for m, d in du.items()}
    for m in ro:                                           # mã mới niêm yết (< 260 phiên) – nạp riêng
        p = os.path.join(xd.THU_MUC, f"{m}.csv")
        if m not in du and os.path.exists(p):
            du[m] = pd.read_csv(p, index_col=0, parse_dates=True)
    san, nganh = ds["san"], ds["nganh"]
    bang = ls.tao_bang(du)
    f = ls.dac_trung(bang, vni, nganh, san)
    C = bang["C"]
    T = C.index[-1]
    vt = [m for m in C.columns if f["trong_vu_tru"].at[T, m]]
    R = pd.DataFrame({k: f[k].loc[T] for k in ls.TRONG_SO}).loc[vt].rank(pct=True) - 0.5
    diem = (R.fillna(0) * pd.Series(ls.TRONG_SO)).sum(axis=1)
    with open(os.path.join(chung.GOC, ".cache", "tai-chinh.json"), encoding="utf-8") as fh:
        tc = json.load(fh)
    hang = []
    for m in ro:
        if m not in C.columns:
            continue
        q = (tc.get(m, {}).get("quy") or [{}])[0]
        x = {k: (float(f[k].at[T, m]) if np.isfinite(f[k].at[T, m]) else None)
             for k in ("rs_tong", "d_dinh250", "d_ma50", "bien_dong20", "beta60", "rsi14")}
        eps = q.get("eps4q")
        gia = float(C.at[T, m])
        hang.append({"ma": m, "gia": gia, **x, "kl20_100": float(np.expm1(f["kl20_100"].at[T, m])),
                     "diem_luot_song": float(diem.get(m, np.nan)), "gtgd20": float(f["_gtgd20"].at[T, m]),
                     "quy": f"Q{q.get('quy')}/{q.get('nam')}", "tt_lnst": q.get("tt_lnst"), "roe4q": q.get("roe4q"),
                     "pe": gia * 1000 / eps if eps and eps > 0 else None})
    k = pd.DataFrame(hang).set_index("ma")
    print(f"\nBảng điểm phiên {T:%d/%m/%Y}:")
    print(k.round(3).sort_values("rs_tong", ascending=False).to_string())
    return k


def main() -> int:
    ro = ro_vnfinlead()
    print(f"VNFINLEAD: {len(ro)} mã – {', '.join(ro)}\n")
    kq = kiem_dinh(chung.doc_dataset(), ro)
    k = bang_diem(ro)
    kq["bang_diem"] = json.loads(k.to_json(force_ascii=False))
    with open(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "vnfinlead.json"), "w", encoding="utf-8") as fh:
        json.dump({"ro": ro, **kq}, fh, ensure_ascii=False, indent=1, default=str)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
