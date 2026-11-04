"""Phản ứng của cổ phiếu sau các lần Ngân hàng Nhà nước giảm lãi suất điều hành (2013–2023).

Ngày giảm lãi suất (ngày có hiệu lực hoặc ngày công bố) lấy theo các quyết định đã biết; mốc tính là giá đóng cửa phiên
liền trước, nên phản ứng của phiên đầu tiên sau tin luôn được tính. Đo lợi nhuận 5 / 20 / 60 phiên sau đó của VN-Index,
của từng nhóm ngành (trung vị các mã đủ thanh khoản) và của các mã được chỉ định; trạng thái thị trường lúc có tin theo
định nghĩa của công cụ.

    python3 loc-co-phieu/nghien-cuu/su_kien_lai_suat.py [MÃ …]
"""
from __future__ import annotations

import os
import sys
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chung  # noqa: E402
import xay_du_lieu as xd  # noqa: E402

GIAM_LAI_SUAT = ["2013-03-26", "2013-05-13", "2014-03-18", "2017-07-10", "2019-09-16", "2020-03-17", "2020-05-13",
                 "2020-09-30", "2023-03-14", "2023-04-03", "2023-05-24", "2023-06-16"]
NGANH = {"8600": "Bất động sản", "8700": "Chứng khoán", "8300": "Ngân hàng", "2300": "Xây dựng, vật liệu",
         "1700": "Thép, tài nguyên", "7500": "Điện, nước, khí", "2700": "Công nghiệp", "3500": "Thực phẩm",
         "1300": "Hoá chất"}
KY = (5, 20, 60)


def main() -> int:
    ma = [m.upper() for m in sys.argv[1:]]
    bang, san, nganh, vni = chung.doc_bang()
    C, V = bang["C"], bang["V"]
    lich = C.index
    vc = vni["close"].reindex(lich).ffill()
    che_do = xd.che_do_thi_truong(vni).reindex(lich).ffill()
    gtgd = (C * V).rolling(20).mean() / 1e6
    hang = []
    for d in GIAM_LAI_SUAT:
        t = lich.searchsorted(pd.Timestamp(d)) - 1           # đóng cửa phiên liền trước
        r = {"ngay": d, "thi_truong": {0: "điều chỉnh", 1: "áp lực", 2: "tăng"}.get(int(che_do.iat[t]), "?")}
        for k in KY:
            if t + k >= len(lich):
                continue
            r[f"vni_{k}"] = vc.iat[t + k] / vc.iat[t] - 1
            lai = C.iloc[t + k] / C.iloc[t] - 1
            du = gtgd.iloc[t] >= 3
            for ng, ten in NGANH.items():
                m = du & (nganh.reindex(C.columns).astype(str) == ng).to_numpy()
                x = lai[m].dropna()
                if len(x) >= 3:
                    r[f"{ten}_{k}"] = float(x.median())
            for mm in ma:
                if mm in C.columns and np.isfinite(lai.get(mm, np.nan)):
                    r[f"{mm}_{k}"] = float(lai[mm])
        hang.append(r)
    k = pd.DataFrame(hang).set_index("ngay")
    print("VN-Index sau các lần giảm lãi suất:")
    print(k[["thi_truong"] + [f"vni_{x}" for x in KY]].to_string(float_format=lambda x: f"{x:+.1%}"))
    print("\nTrung vị theo nhóm ngành (so với VN-Index cùng kỳ), 12 lần:")
    for ten in list(NGANH.values()) + ma:
        dong = []
        for x in KY:
            col = f"{ten}_{x}"
            if col not in k:
                continue
            hieu = (k[col] - k[f"vni_{x}"]).dropna()
            dong.append(f"{x} phiên: TB {k[col].mean():+.1%} (hơn VNI {hieu.mean():+.1%}, {int((hieu > 0).sum())}/{len(hieu)} lần)")
        if dong:
            print(f"  {ten:18} " + " | ".join(dong))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
