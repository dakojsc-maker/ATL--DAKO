"""Tải lịch sử giá ngày dài hạn (mặc định 3600 phiên ≈ 2012–nay) của mọi cổ phiếu HOSE/HNX/UPCOM và VN-Index từ VCI,
kèm mã ngành ICB cấp 2, để nghiên cứu chiến lược. Dữ liệu lưu ở loc-co-phieu/.cache/lich-su/ (không đưa lên git).

    python3 loc-co-phieu/nghien-cuu/tai_lich_su.py [--so-phien 3600] [--luong 4]
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import os
import sys
import time

import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu.dulieu import NguonVCI, _goi  # noqa: E402

THU_MUC = os.path.join(GOC, ".cache", "lich-su")
SAN = {"HSX": "HOSE", "HOSE": "HOSE", "HNX": "HNX", "UPCOM": "UPCOM"}


def danh_sach(v: NguonVCI) -> pd.DataFrame:
    data = _goi("GET", v.URL_DS, headers=v.HEADERS)
    df = pd.DataFrame(data if isinstance(data, list) else data.get("data", []))
    df = df[df["type"].astype(str).str.upper() == "STOCK"].copy()
    df["san"] = df["board"].astype(str).str.upper().map(SAN)
    df = df[df["san"].notna() & df["symbol"].astype(str).str.fullmatch(r"[A-Z0-9]{3}")]
    return pd.DataFrame({"ma": df["symbol"], "san": df["san"], "nganh": df.get("icbCode2", ""),
                         "ten": df.get("organShortName", "")}).sort_values("ma").reset_index(drop=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--so-phien", type=int, default=3600)
    ap.add_argument("--luong", type=int, default=4)
    ap.add_argument("--lam-moi", action="store_true", help="tải lại cả mã đã có")
    a = ap.parse_args()
    os.makedirs(THU_MUC, exist_ok=True)
    v = NguonVCI()
    ds = danh_sach(v)
    ds.to_csv(os.path.join(THU_MUC, "_danh-sach.csv"), index=False)
    print(f"{len(ds)} mã cổ phiếu ({ds['san'].value_counts().to_dict()})", flush=True)

    def tai(ma: str, chi_so: bool = False):
        p = os.path.join(THU_MUC, f"{ma}.csv")
        if os.path.exists(p) and not a.lam_moi:
            return ma, "có sẵn"
        for lan in range(3):
            try:
                df = v.lay(ma, a.so_phien, la_chi_so=chi_so)
                df.to_csv(p, date_format="%Y-%m-%d", float_format="%.5f")
                return ma, len(df)
            except Exception as e:  # noqa: BLE001 – ghi lại lỗi, thử lại
                loi = e
                time.sleep(2 * (lan + 1))
        return ma, f"lỗi: {loi}"

    print(tai("VNINDEX", True), flush=True)
    t0, xong, loi = time.time(), 0, []
    with cf.ThreadPoolExecutor(a.luong) as ex:
        for ma, kq in ex.map(tai, ds["ma"]):
            xong += 1
            if isinstance(kq, str) and kq.startswith("lỗi"):
                loi.append((ma, kq))
            if xong % 200 == 0:
                print(f"  {xong}/{len(ds)} ({time.time() - t0:.0f}s)", flush=True)
    print(f"Xong {xong} mã trong {time.time() - t0:.0f}s; lỗi {len(loi)}: {loi[:5]}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
