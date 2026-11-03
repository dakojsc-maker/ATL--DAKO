"""CANSLIM (William O'Neil) – kiểm định trên thị trường Việt Nam (luật T+2, biên độ, phí).

Phần kỹ thuật (kiểm định 2014–2026):
  N – mã sát đỉnh 52 tuần (≤ 5%) và vừa đóng cửa ở đỉnh 20 phiên (vượt nền), phiên tăng;
  S – khối lượng phiên vượt đỉnh ≥ 1,5× bình quân 50 phiên (cầu mạnh);
  L – sức mạnh giá (RS) thuộc top 20% thị trường (RS ≥ 80);
  M – thị trường "TĂNG – thuận lợi" (cùng định nghĩa với công cụ);
  xu hướng – giá trên MA50 và MA200, hai đường đều đi lên.
Phần cơ bản (chỉ kiểm định được 2/2026–10/2026 do nguồn KBS chỉ có 4 quý đáng tin, có ngày công bố thật):
  C – LNST của cổ đông công ty mẹ quý gần nhất đã công bố tăng ≥ 25% so với cùng kỳ;
  A – ROE 4 quý ≥ 15% và EPS 4 quý > 0 (KBS không có số liệu năm đáng tin để đo tăng trưởng 3 năm);
  I – không có dữ liệu sở hữu tổ chức → bỏ qua.

    python3 loc-co-phieu/nghien-cuu/canslim.py
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chung  # noqa: E402
from chung import chon_lenh  # noqa: E402

CAU_HINH = ["20_7_40", "7_7_20", "7_5_20", "5_7_20"]
TEP_TC = os.path.join(chung.GOC, ".cache", "tai-chinh.json")


def tai_chinh_theo_ngay(df: pd.DataFrame) -> pd.DataFrame:
    """Gắn C (tăng trưởng LNST quý gần nhất đã công bố), ROE 4 quý, EPS 4 quý cho từng (ngày, mã) – chỉ dùng 4 quý
    gần nhất của KBS (trang 1–4) vì các trang cũ hơn có lỗi trùng số liệu."""
    with open(TEP_TC, encoding="utf-8") as fh:
        tc = json.load(fh)
    hang = []
    for ma, v in tc.items():
        for q in (v.get("quy") or [])[:4]:
            if not q.get("ngay_cb"):
                continue
            g = q.get("tt_lnst")
            hang.append({"ma": ma, "ngay_cb": pd.Timestamp(q["ngay_cb"]) + pd.Timedelta(days=1),
                         "tt_lnst": np.nan if g is None or abs(g) < 0.005 else float(g),
                         "roe4q": q.get("roe4q"), "eps4q": q.get("eps4q")})
    bang = pd.DataFrame(hang).sort_values("ngay_cb")
    trai = df[["ngay", "ma"]].sort_values("ngay")
    gop = pd.merge_asof(trai, bang, left_on="ngay", right_on="ngay_cb", by="ma", direction="backward")
    return gop.set_index(trai.index).reindex(df.index)


def main() -> int:
    df = chung.doc_dataset()
    bang, san, _, _ = chung.doc_bang()
    chung.gan_cot(df, chung.ket_qua_them(bang, san, [(0.20, 0.07, 40)]))
    lich = pd.DatetimeIndex(sorted(df["ngay"].unique()))
    df["p"] = df["rs_tong"].fillna(0)                       # nhiều mã cùng ngày → ưu tiên RS cao (đúng tinh thần L)
    N = (df["d_dinh250"] >= -0.05) & (df["d_dinh20"] >= -0.005) & (df["r1"] > 0)
    S = df["kl_tb50"] >= np.log1p(1.5)
    L = df["rs_tong"] >= 0.80
    M = df["che_do"] == 2
    xu_huong = (df["d_ma50"] > 0) & (df["sl_ma50"] > 0) & (df["d_ma200"] > 0) & (df["sl_ma200"] > 0)
    bien = {
        "T1. N + S + L (chưa xét thị trường)": N & S & L,
        "T2. N + S + L + M (thị trường tăng thuận lợi)": N & S & L & M,
        "T3. T2 + xu hướng (trên MA50, MA200 đi lên)": N & S & L & M & xu_huong,
        "T4. N + S + L + xu hướng, thị trường không giảm": N & S & L & xu_huong & (df["che_do"] >= 1),
    }
    kq = {"ky_thuat": {}, "co_ban": {}}
    print("Nền (mua mọi mã): " + " | ".join(
        f"{c}: thắng {(df[f'lai_{c}'] > 0).mean():.0%} TB {df[f'lai_{c}'].mean():+.2%}" for c in CAU_HINH))
    for ten, dk in bien.items():
        u = df[dk.to_numpy()]
        print(f"\n### {ten}: {len(u):,} tín hiệu ({u['ngay'].nunique()} ngày)", flush=True)
        kq["ky_thuat"][ten] = {}
        for ch in CAU_HINH:
            lenh = chon_lenh(u, ch, -1.0, 5, lich)
            if lenh.empty:
                continue
            print(f"  {ch:7}: {chung.tom_tat(lenh, f'lai_{ch}')}")
            if ch in ("20_7_40", "7_7_20"):
                print("\n".join(chung.chi_tiet(lenh, f"lai_{ch}")))
            tk = chung.thong_ke(lenh[f"lai_{ch}"])
            nam = lenh.groupby(lenh["ngay"].dt.year)[f"lai_{ch}"].mean()
            kq["ky_thuat"][ten][ch] = {**tk, "nam_lai": int((nam > 0).sum()), "so_nam": int(len(nam))}

    # ---- có thêm C và A: chỉ giai đoạn có số liệu quý đáng tin (sau khi công bố quý 4/2025) ----
    cua_so = (df["ngay"] >= "2026-01-27").to_numpy()
    d = df[cua_so].copy()
    tc = tai_chinh_theo_ngay(d)
    d["tt_lnst"], d["roe4q"], d["eps4q"] = tc["tt_lnst"], tc["roe4q"], tc["eps4q"]
    C = d["tt_lnst"] >= 25
    A = (d["roe4q"] >= 15) & (d["eps4q"] > 0)
    Nd, Sd, Ld = N[cua_so], S[cua_so], L[cua_so]
    xh = xu_huong[cua_so]
    print(f"\n=== GIAI ĐOẠN 27/01/2026 → {d['ngay'].max():%d/%m/%Y}: có thêm C, A ({d['tt_lnst'].notna().mean():.0%} "
          "dòng có số liệu C) ===")
    nen = {c: (d[f"lai_{c}"] > 0).mean() for c in CAU_HINH}
    print("Nền cùng kỳ: " + " | ".join(f"{c}: thắng {nen[c]:.0%} TB {d[f'lai_{c}'].mean():+.2%}" for c in CAU_HINH))
    bien2 = {
        "K1. N + S + L (kỹ thuật, cùng kỳ)": Nd & Sd & Ld,
        "K2. K1 + C + A (CANSLIM đủ, trừ I và M)": Nd & Sd & Ld & C & A,
        "K3. K1 + xu hướng": Nd & Sd & Ld & xh,
        "K4. K3 + C + A": Nd & Sd & Ld & xh & C & A,
        "K5. Chỉ C + A + L (mã lợi nhuận tăng mạnh, giá khỏe)": C & A & Ld,
        "K6. Chỉ C + A (lọc cơ bản thuần)": C & A,
    }
    for ten, dk in bien2.items():
        u = d[dk.fillna(False).to_numpy()]
        print(f"\n### {ten}: {len(u):,} tín hiệu ({u['ngay'].nunique()} ngày)")
        kq["co_ban"][ten] = {}
        for ch in CAU_HINH:
            lenh = chon_lenh(u, ch, -1.0, 5, lich)
            if lenh.empty:
                continue
            tk = chung.thong_ke(lenh[f"lai_{ch}"])
            mo = lenh[f"lai_{ch}"].isna().sum()
            print(f"  {ch:7}: {tk['so_lenh']} lệnh đã đóng (+{mo} chưa đủ thời gian) · thắng {tk.get('thang', 0):.0%} · "
                  f"TB {tk.get('tb', 0):+.2%} · PF {tk.get('pf')}")
            kq["co_ban"][ten][ch] = tk
    with open(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "canslim.json"), "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1, default=str)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
