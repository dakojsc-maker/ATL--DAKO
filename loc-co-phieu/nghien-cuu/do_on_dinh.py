"""Chỉ báo nào ĐÁNG TIN qua nhiều năm? Đo hệ số thông tin (IC) theo từng năm.

IC chéo (cross-sectional): mỗi ngày, tương quan thứ hạng giữa chỉ báo và lợi nhuận 10/20 phiên sau đó của các mã trong
ngày đó (loại bỏ ảnh hưởng thị trường chung lên/xuống), rồi lấy trung bình theo năm. Chỉ báo đáng tin = IC cùng dấu
ở hầu hết các năm.

IC thời gian (thị trường): với các chỉ báo thị trường chung, tương quan giữa chỉ báo và lợi nhuận bình quân 10/20 phiên
sau đó của toàn bộ cổ phiếu (ngày nào thị trường thuận lợi để mua).

    python3 loc-co-phieu/nghien-cuu/do_on_dinh.py
"""
from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu import luotsong as ls  # noqa: E402

THI_TRUONG = [k for k in ls.DAC_TRUNG if k.startswith(("vni_", "rong_")) or k in ("dinh_tru_day20", "ad10")]


def ic_cheo(df: pd.DataFrame, muc_tieu: str, dac_trung: list[str]) -> pd.DataFrame:
    ngay = df.index.get_level_values(0)
    hang = df[dac_trung + [muc_tieu]].groupby(ngay).rank(pct=True)
    y = hang[muc_tieu]
    kq = {}
    for k in dac_trung:
        x = hang[k]
        ok = (x.notna() & y.notna()).to_numpy()
        xv, yv = x.to_numpy()[ok], y.to_numpy()[ok]
        d = pd.DataFrame({"x": xv, "y": yv, "xy": xv * yv, "xx": xv * xv, "yy": yv * yv})
        g = d.groupby(ngay[ok])
        m, n = g.mean(), g.size()
        cov = m["xy"] - m["x"] * m["y"]
        sd = np.sqrt((m["xx"] - m["x"] ** 2) * (m["yy"] - m["y"] ** 2))
        kq[k] = (cov / sd).where(n >= 30)
    return pd.DataFrame(kq)


def main() -> int:
    df = pd.read_pickle(os.environ.get("LS_TEP_DL", os.path.join(GOC, ".cache", "nghien-cuu.pkl")))
    df = df[df["fwd20"].notna()]
    rieng = [k for k in ls.DAC_TRUNG if k not in THI_TRUONG and k != "ma_san"]
    for muc_tieu in ("fwd10", "fwd20"):
        ic = ic_cheo(df, muc_tieu, rieng)
        nam = ic.groupby(ic.index.year).mean()
        tong = pd.DataFrame({"ic_tb": ic.mean(), "t": ic.mean() / ic.std() * np.sqrt(len(ic) / 20),
                             "nam_duong": (nam > 0).mean(), "nam_am": (nam < 0).mean()})
        tong["on_dinh"] = np.maximum(tong["nam_duong"], tong["nam_am"])
        tong = tong.sort_values("ic_tb", key=np.abs, ascending=False)
        print(f"\n=== IC CHÉO với {muc_tieu} (trung bình ngày; t ≈ hiệu chỉnh chồng lấn; tỷ lệ năm cùng dấu) ===")
        print(tong.round(3).head(35).to_string())
        print("\nIC theo năm (top 15):")
        print(nam[tong.index[:15]].round(3).T.to_string())

    # thị trường chung: lợi nhuận bình quân mọi mã theo ngày
    ngay = df.index.get_level_values(0)
    tb = df.groupby(ngay)[["fwd10", "fwd20", "lai_6_4_20"]].mean()
    tt = df.groupby(ngay)[THI_TRUONG].first()
    print("\n=== THỊ TRƯỜNG CHUNG: tương quan thứ hạng giữa chỉ báo thị trường và lợi nhuận TB 10/20 phiên sau ===")
    kq = {}
    for k in THI_TRUONG:
        r = {m: tt[k].corr(tb[m], method="spearman") for m in ("fwd10", "fwd20", "lai_6_4_20")}
        theo_nam = pd.DataFrame({"x": tt[k], "y": tb["fwd20"]}).groupby(tt.index.year).apply(
            lambda d: d["x"].corr(d["y"], method="spearman"))
        r["nam_cung_dau"] = max((theo_nam > 0).mean(), (theo_nam < 0).mean())
        kq[k] = r
    print(pd.DataFrame(kq).T.sort_values("fwd20", key=np.abs, ascending=False).round(3).to_string())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
