"""Huấn luyện & kiểm định "đi tiếp" (walk-forward) mô hình học máy (cây tăng cường) dự báo xác suất thắng.
Cần scikit-learn (`pip install scikit-learn`) – chỉ dùng cho nghiên cứu, công cụ hằng ngày không cần.

KẾT QUẢ (10/2026): KHÔNG ĐẠT – AUC theo năm 0,44–0,54, lệnh chọn ra thắng ~46% (nền 44%), TB −0,4%/lệnh sau phí;
mô hình "học vẹt" theo giai đoạn thị trường. Vì vậy công cụ KHÔNG dùng mô hình này mà dùng quy tắc ở
chien_luoc_cuoi.py. Giữ lại tệp để có thể kiểm tra lại khi có thêm dữ liệu.

Với mỗi năm kiểm định Y: mô hình chỉ học từ dữ liệu TRƯỚC năm Y (cách 30 ngày để không lẫn kết quả), rồi chấm điểm mọi
(ngày, mã) của năm Y. Như vậy mọi con số in ra là kết quả "chưa từng thấy" – giống như dùng công cụ thật từ năm đó.

    python3 loc-co-phieu/nghien-cuu/huan_luyen.py --nhan 6_4_20 [--nam 2018 2019 ...]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu import luotsong as ls  # noqa: E402

TEP_DL = os.environ.get("LS_TEP_DL", os.path.join(GOC, ".cache", "nghien-cuu.pkl"))
THU_MUC_KQ = os.environ.get("LS_KQ", os.path.join(GOC, ".cache", "kq-nghien-cuu"))
THAM_SO = dict(learning_rate=0.05, max_iter=300, max_leaf_nodes=15, min_samples_leaf=1000,
               l2_regularization=1.0, max_bins=255, early_stopping=False, random_state=0)


def doc(nhan: str) -> pd.DataFrame:
    df = pd.read_pickle(TEP_DL)
    df = df[df[f"lai_{nhan}"].notna()].copy()
    df["ngay"] = df.index.get_level_values(0)
    df["ma"] = df.index.get_level_values(1)
    return df.reset_index(drop=True)


def mo_hinh():
    from sklearn.ensemble import HistGradientBoostingClassifier
    return HistGradientBoostingClassifier(**THAM_SO)


def di_tiep(df: pd.DataFrame, nhan: str, cac_nam: list[int], hoc_toi_thieu: int = 50_000) -> pd.DataFrame:
    y = (df[f"lai_{nhan}"] > 0).to_numpy()
    X = df[ls.DAC_TRUNG].to_numpy(np.float32)
    ngay = df["ngay"].to_numpy()
    kq = []
    for nam in cac_nam:
        bat_dau = np.datetime64(f"{nam}-01-01")
        hoc = ngay < bat_dau - np.timedelta64(30, "D")
        thu = (ngay >= bat_dau) & (ngay < np.datetime64(f"{nam + 1}-01-01"))
        if hoc.sum() < hoc_toi_thieu or thu.sum() == 0:
            continue
        t0 = time.time()
        m = mo_hinh().fit(X[hoc], y[hoc])
        p = m.predict_proba(X[thu])[:, 1]
        d = df.loc[thu, ["ngay", "ma", f"lai_{nhan}", f"giu_{nhan}", f"ld_{nhan}", "che_do", "nganh", "san"]].copy()
        d["p"] = p
        kq.append(d)
        from sklearn.metrics import roc_auc_score
        print(f"  {nam}: học {hoc.sum():,} dòng, thử {thu.sum():,} dòng, AUC {roc_auc_score(y[thu], p):.3f}, "
              f"tỷ lệ thắng nền {y[thu].mean():.1%} ({time.time() - t0:.0f}s)", flush=True)
    return pd.concat(kq)


def chon_lenh(d: pd.DataFrame, nhan: str, nguong: float, toi_da_ngay: int, lich: pd.DatetimeIndex) -> pd.DataFrame:
    """Mỗi ngày lấy tối đa `toi_da_ngay` mã có p ≥ ngưỡng (p cao trước); một mã chỉ mở lệnh mới khi lệnh trước đã bán."""
    d = d[d["p"] >= nguong].sort_values(["ngay", "p"], ascending=[True, False])
    vi_tri = pd.Series(np.arange(len(lich)), index=lich)
    d = d.assign(i=vi_tri.reindex(d["ngay"]).to_numpy())
    ban_xong = {}
    chon = []
    for ngay, nhom in d.groupby("ngay", sort=True):
        dem = 0
        for r in nhom.itertuples(index=False):
            if dem >= toi_da_ngay:
                break
            if ban_xong.get(r.ma, -1) >= r.i:
                continue
            giu = getattr(r, f"giu_{nhan}")
            ban_xong[r.ma] = r.i + 1 + (int(giu) if np.isfinite(giu) else 30)
            chon.append(r)
            dem += 1
    return pd.DataFrame(chon)


def thong_ke(lai: pd.Series) -> dict:
    lai = lai.dropna()
    if lai.empty:
        return {"so_lenh": 0}
    thang, thua = lai[lai > 0], lai[lai <= 0]
    return {"so_lenh": int(len(lai)), "thang": round(float((lai > 0).mean()), 3),
            "tb": round(float(lai.mean()), 4), "trung_vi": round(float(lai.median()), 4),
            "tb_thang": round(float(thang.mean()), 4) if len(thang) else None,
            "tb_thua": round(float(thua.mean()), 4) if len(thua) else None,
            "pf": round(float(thang.sum() / -thua.sum()), 2) if len(thua) and thua.sum() < 0 else None}


def bao_cao(oos: pd.DataFrame, nhan: str, lich: pd.DatetimeIndex) -> dict:
    cot = f"lai_{nhan}"
    kq = {"nen": thong_ke(oos[cot]), "nguong": {}}
    print(f"\nNền (mua mọi mã thanh khoản mọi ngày): {kq['nen']}")
    for nguong in (0.45, 0.5, 0.55, 0.6, 0.65, 0.7):
        for k in (3, 5):
            lenh = chon_lenh(oos, nhan, nguong, k, lich)
            if lenh.empty:
                continue
            tk = thong_ke(lenh[cot])
            tk["lenh_thang"] = round(tk["so_lenh"] / max(1, oos["ngay"].dt.to_period("M").nunique()), 1)
            theo_nam = {int(n): thong_ke(g[cot]) for n, g in lenh.groupby(lenh["ngay"].dt.year)}
            theo_tt = {int(c): thong_ke(g[cot]) for c, g in lenh.groupby("che_do")}
            kq["nguong"][f"{nguong}_{k}"] = {"tong": tk, "nam": theo_nam, "thi_truong": theo_tt}
            print(f"p≥{nguong:.2f}, tối đa {k}/ngày: {tk}")
            print("   theo thị trường (0 giảm/1 áp lực/2 tăng):",
                  {c: (v['so_lenh'], v.get('thang'), v.get('tb')) for c, v in theo_tt.items()})
            print("   theo năm:", {n: (v['so_lenh'], v.get('thang'), v.get('tb')) for n, v in theo_nam.items()})
    return kq


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--nhan", default="6_4_20", help="cấu hình lệnh: chốtlời_cắtlỗ_sốphiên (theo %)")
    ap.add_argument("--nam", type=int, nargs="+", default=list(range(2018, 2027)))
    ap.add_argument("--hoc-toi-thieu", type=int, default=50_000)
    a = ap.parse_args()
    os.makedirs(THU_MUC_KQ, exist_ok=True)
    t0 = time.time()
    df = doc(a.nhan)
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))
    print(f"Dữ liệu: {len(df):,} dòng, {df['ma'].nunique()} mã, {lich[0].date()} → {lich[-1].date()} "
          f"({time.time() - t0:.0f}s)", flush=True)
    oos = di_tiep(df, a.nhan, a.nam, a.hoc_toi_thieu)
    oos.to_pickle(os.path.join(THU_MUC_KQ, f"oos_{a.nhan}.pkl"))
    kq = bao_cao(oos, a.nhan, lich)
    with open(os.path.join(THU_MUC_KQ, f"bao-cao_{a.nhan}.json"), "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1)
    print(f"Xong ({time.time() - t0:.0f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
