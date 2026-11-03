"""Tải chỉ số tài chính theo quý từ KBS (kbbuddywts.kbsec.com.vn) cho tiêu chí C, A của CANSLIM.

KBS chỉ có khoảng 7 quý gần nhất. Mỗi trang (pageSize=1) là một quý, trang 1 là quý mới nhất. Nhãn quý của các trang cũ
đôi khi sai, nên quý được suy ra từ số trang, tính lùi từ quý mới nhất. Lấy các chỉ số:
  33  tăng trưởng LNST của cổ đông công ty mẹ so với cùng kỳ (%)
  30  tăng trưởng doanh thu thuần (%)
  53  EPS 4 quý gần nhất
  122 ROE bình quân 4 quý gần nhất (%)

    python3 loc-co-phieu/nghien-cuu/tai_tai_chinh.py [--trang 7] [--luong 6]
Kết quả: loc-co-phieu/.cache/tai-chinh.json
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import os
import sys
import time

import pandas as pd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, GOC)
from locphieu.dulieu import _goi  # noqa: E402

URL = "https://kbbuddywts.kbsec.com.vn/iis-server/investment/stock/finance-info/{ma}"
CHI_SO = {33: "tt_lnst", 30: "tt_dt", 53: "eps4q", 122: "roe4q"}
TEP_RA = os.path.join(GOC, ".cache", "tai-chinh.json")


def _quy_lui(nam: int, quy: int, n: int) -> tuple[int, int]:
    k = nam * 4 + (quy - 1) - n
    return k // 4, k % 4 + 1


def mot_trang(ma: str, trang: int, ky: int) -> dict | None:
    d = _goi("GET", URL.format(ma=ma), params={"page": trang, "pageSize": 1, "type": "CSTC", "unit": 1000,
                                               "termtype": ky, "languageid": 1})
    head = (d or {}).get("Head") or []
    if not head:
        return None
    h = head[0]
    kq = {"nam_nhan": h.get("YearPeriod"), "ky_nhan": h.get("TermCode"), "ngay_cb": str(h.get("ReportDate") or "")[:10]}
    for rows in ((d.get("Content") or {}).values()):
        for r in rows:
            k = CHI_SO.get(r.get("ReportNormID"))
            if k:
                kq[k] = r.get("Value1")
    return kq


def mot_ma(ma: str, so_trang: int) -> dict:
    quy = []
    for p in range(1, so_trang + 1):
        for lan in range(3):
            try:
                r = mot_trang(ma, p, 2)
                break
            except Exception:  # noqa: BLE001 – thử lại khi mạng chập chờn
                r = "loi"
                time.sleep(1.5 * (lan + 1))
        if r is None or r == "loi":
            break
        quy.append({"trang": p, **r})
    if quy and quy[0].get("ky_nhan", "").startswith("Q"):
        nam0, q0 = int(quy[0]["nam_nhan"]), int(quy[0]["ky_nhan"][1])
        for x in quy:
            x["nam"], x["quy"] = _quy_lui(nam0, q0, x["trang"] - 1)
    nam = []
    for p in (1, 2):
        try:
            r = mot_trang(ma, p, 1)
        except Exception:  # noqa: BLE001
            r = None
        if r:
            nam.append({"trang": p, **r})
    return {"quy": quy, "nam": nam}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--trang", type=int, default=7)
    ap.add_argument("--luong", type=int, default=6)
    a = ap.parse_args()
    df = pd.read_pickle(os.path.join(GOC, ".cache", "nghien-cuu.pkl"), )
    ngay = df.index.get_level_values(0)
    ds = sorted(set(df.index.get_level_values(1)[ngay >= "2024-06-01"]))
    p_tk = os.path.join(GOC, ".cache", "thanh-khoan.json")
    if os.path.exists(p_tk):
        with open(p_tk, encoding="utf-8") as fh:
            tk = json.load(fh)
        ds = sorted(set(ds) | {m for m, v in (tk.get("ma", tk) if isinstance(tk, dict) else {}).items()
                               if isinstance(v, dict) and (v.get("gtgd20") or 0) >= 3})
    print(f"{len(ds)} mã", flush=True)
    kq, t0 = {}, time.time()
    with cf.ThreadPoolExecutor(a.luong) as ex:
        tuong_lai = {ex.submit(mot_ma, m, a.trang): m for m in ds}
        for i, f in enumerate(cf.as_completed(tuong_lai), 1):
            m = tuong_lai[f]
            try:
                kq[m] = f.result()
            except Exception as e:  # noqa: BLE001
                kq[m] = {"loi": str(e)}
            if i % 50 == 0:
                print(f"  {i}/{len(ds)} ({time.time() - t0:.0f}s)", flush=True)
    with open(TEP_RA, "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False)
    co = sum(1 for v in kq.values() if v.get("quy"))
    print(f"Xong: {co}/{len(ds)} mã có dữ liệu quý ({time.time() - t0:.0f}s) → {TEP_RA}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
