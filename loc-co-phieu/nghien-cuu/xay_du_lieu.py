"""Từ lịch sử dài hạn (tai_lich_su.py) → bảng nghiên cứu: mỗi dòng một (ngày, mã) trong vũ trụ thanh khoản, gồm mọi
đặc trưng của luotsong.DAC_TRUNG và kết quả mô phỏng lệnh mua cho lưới (chốt lời, cắt lỗ, số phiên nắm giữ).

    python3 loc-co-phieu/nghien-cuu/xay_du_lieu.py
"""
from __future__ import annotations

import os
import sys
import time

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu import luotsong as ls  # noqa: E402

THU_MUC = os.environ.get("LS_THU_MUC", os.path.join(GOC, ".cache", "lich-su"))
TEP_RA = os.environ.get("LS_TEP_DL", os.path.join(GOC, ".cache", "nghien-cuu.pkl"))
LUOI = [(tp, sl, h) for tp in (0.05, 0.06, 0.07) for sl in (0.03, 0.04, 0.05, 0.07) for h in (10, 20)]


def doc_lich_su():
    ds = pd.read_csv(os.path.join(THU_MUC, "_danh-sach.csv"), dtype=str)
    du = {}
    for ma in ds["ma"]:
        p = os.path.join(THU_MUC, f"{ma}.csv")
        if os.path.exists(p) and os.path.getsize(p) > 100:
            try:
                df = pd.read_csv(p, index_col=0, parse_dates=True)
            except (ValueError, pd.errors.EmptyDataError):
                continue
            if len(df) >= ls.SO_PHIEN_MIN:
                du[ma] = df[~df.index.duplicated(keep="last")]
    vni = pd.read_csv(os.path.join(THU_MUC, "VNINDEX.csv"), index_col=0, parse_dates=True)
    return du, vni, ds.set_index("ma")


def che_do_thi_truong(vni: pd.DataFrame) -> pd.Series:
    """Giống boi_canh_thi_truong của công cụ: 2 = tăng thuận lợi, 1 = tăng nhưng có áp lực, 0 = điều chỉnh/giảm."""
    c, v = vni["close"], vni["volume"]
    m20, m50 = c.rolling(20).mean(), c.rolling(50).mean()
    pp = ((c.pct_change() <= -0.002) & (v > v.shift(1))).astype(float).rolling(25).sum()
    tot = (c >= m20) & (c >= m50) & (m50 >= m50.shift(10)) & (pp <= 4)
    return pd.Series(np.where(tot, 2, np.where(c >= m50, 1, 0)), index=c.index)


def main() -> int:
    t0 = time.time()
    du, vni, ds = doc_lich_su()
    print(f"Đọc {len(du)} mã ({time.time() - t0:.0f}s)", flush=True)
    bang = ls.tao_bang(du)
    bang = {k: v.loc["2013-01-01":] for k, v in bang.items()}
    san, nganh = ds["san"], ds["nganh"]
    f = ls.dac_trung(bang, vni, nganh, san)
    X = ls.ma_tran(f)
    print(f"Đặc trưng: {X.shape} ({time.time() - t0:.0f}s)", flush=True)
    C = bang["C"]
    ii = C.index.get_indexer(X.index.get_level_values(0))
    jj = C.columns.get_indexer(X.index.get_level_values(1))

    def lay(b: pd.DataFrame) -> np.ndarray:
        return b.to_numpy(np.float64)[ii, jj].astype(np.float32)

    out = X
    vao = bang["O"].shift(-1)
    for h in (5, 10, 20):
        out[f"fwd{h}"] = lay(C.shift(-(1 + h)) / vao - 1)
    for tp, sl, h in LUOI:
        mp = ls.mo_phong(bang, san, tp, sl, h)
        ten = f"{int(tp * 100)}_{int(sl * 100)}_{h}"
        out[f"lai_{ten}"] = lay(mp["lai"])
        out[f"ld_{ten}"] = lay(mp["ly_do"])
        out[f"giu_{ten}"] = lay(mp["giu"])
        print(f"  mô phỏng {ten} ({time.time() - t0:.0f}s)", flush=True)
    cd = che_do_thi_truong(vni).reindex(C.index).ffill()
    out["che_do"] = np.nan_to_num(cd.to_numpy()[ii], nan=-1).astype(np.int8)
    out["nganh"] = nganh.reindex(X.index.get_level_values(1)).fillna("?").to_numpy()
    out["san"] = san.reindex(X.index.get_level_values(1)).fillna("?").to_numpy()
    out["gtgd20"] = lay(f["_gtgd20"])
    out.to_pickle(TEP_RA)
    print(f"Đã lưu {TEP_RA}: {out.shape} ({time.time() - t0:.0f}s)", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
