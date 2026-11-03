"""Phần dùng chung cho các nghiên cứu so sánh phương pháp (phân kỳ RSI/MACD, CANSLIM…)."""
from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from locphieu import luotsong as ls  # noqa: E402
from huan_luyen import chon_lenh, thong_ke  # noqa: E402,F401

TEP_DL = os.path.join(GOC, ".cache", "nghien-cuu.pkl")
TEP_BANG = os.path.join(GOC, ".cache", "bang-gia.pkl")
TEN_TT = {0: "giảm", 1: "áp lực", 2: "tăng", -1: "?"}


def doc_dataset() -> pd.DataFrame:
    """Bảng nghiên cứu (mỗi dòng một (ngày, mã) trong vũ trụ thanh khoản) kèm cột ngay/ma."""
    df = pd.read_pickle(TEP_DL)
    df["ngay"] = df.index.get_level_values(0)
    df["ma"] = df.index.get_level_values(1)
    return df.reset_index(drop=True)


def doc_bang() -> tuple[dict, pd.Series, pd.Series, pd.DataFrame]:
    """Bảng giá ngày × mã (O,H,L,C,V) từ .cache/lich-su, lưu tạm để các lần sau đọc nhanh."""
    if os.path.exists(TEP_BANG):
        return pd.read_pickle(TEP_BANG)
    import xay_du_lieu as xd
    du, vni, ds = xd.doc_lich_su()
    bang = ls.tao_bang(du)
    bang = {k: v.loc["2013-01-01":] for k, v in bang.items()}
    kq = (bang, ds["san"], ds["nganh"], vni)
    pd.to_pickle(kq, TEP_BANG)
    return kq


def ket_qua_them(bang: dict, san: pd.Series, cau_hinh: list[tuple[float, float, int]]) -> dict[str, pd.DataFrame]:
    """Mô phỏng thêm các cấu hình chốt lời/cắt lỗ/số phiên không có sẵn trong bảng nghiên cứu."""
    kq = {}
    for tp, sl, h in cau_hinh:
        mp = ls.mo_phong(bang, san, tp, sl, h)
        ten = f"{int(round(tp * 100))}_{int(round(sl * 100))}_{h}"
        kq[f"lai_{ten}"], kq[f"giu_{ten}"] = mp["lai"], mp["giu"]
    return kq


def gan_cot(df: pd.DataFrame, bang_cot: dict[str, pd.DataFrame]) -> None:
    """Gắn các bảng ngày × mã vào bảng dài df (theo cột ngay, ma)."""
    if not bang_cot:
        return
    mau = next(iter(bang_cot.values()))
    ii = mau.index.get_indexer(df["ngay"])
    jj = mau.columns.get_indexer(df["ma"])
    ok = (ii >= 0) & (jj >= 0)
    for ten, b in bang_cot.items():
        a = np.full(len(df), np.nan, dtype=np.float32)
        a[ok] = b.to_numpy(np.float64)[ii[ok], jj[ok]]
        df[ten] = a


def tom_tat(lenh: pd.DataFrame, cot: str) -> str:
    tk = thong_ke(lenh[cot])
    if not tk.get("so_lenh"):
        return "0 lệnh"
    nam = lenh.groupby(lenh["ngay"].dt.year)[cot].mean()
    return (f"{tk['so_lenh']:5d} lệnh · thắng {tk['thang']:.0%} · TB {tk['tb']:+.2%} · PF {tk.get('pf')} · "
            f"lệnh thắng {tk['tb_thang']:+.1%} / thua {tk['tb_thua']:+.1%} · năm có lãi {(nam > 0).sum()}/{len(nam)}")


def chi_tiet(lenh: pd.DataFrame, cot: str) -> list[str]:
    out = []
    nam = lenh.groupby(lenh["ngay"].dt.year)[cot].agg(["size", lambda s: (s > 0).mean(), "mean"])
    nam.columns = ["n", "thang", "tb"]
    out.append("      năm: " + " ".join(f"{y % 100:02d}:{int(r.n)}/{r.thang:.0%}/{r.tb:+.1%}" for y, r in nam.iterrows()))
    tt = lenh.groupby("che_do")[cot].agg(["size", lambda s: (s > 0).mean(), "mean"])
    tt.columns = ["n", "thang", "tb"]
    out.append("      thị trường: " + " | ".join(f"{TEN_TT.get(int(c), c)}: {int(r.n)} lệnh, thắng {r.thang:.0%}, "
                                                f"TB {r.tb:+.2%}" for c, r in tt.iterrows()))
    return out
