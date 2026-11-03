"""Lọc danh mục ngắn hạn cho phiên mới nhất theo phương pháp có kết quả kiểm định tốt nhất (CANSLIM kỹ thuật), kèm
tiêu chí cơ bản C, A và các mã lướt sóng của công cụ. Chạy sau 15:00 khi đã tải giá mới (tai_lich_su.py --lam-moi).

  1. M – trạng thái thị trường theo cùng định nghĩa với công cụ (2 tăng thuận lợi / 1 có áp lực / 0 điều chỉnh).
  2. Tín hiệu mua CANSLIM hôm nay: N + S + L + xu hướng (mua mở cửa phiên sau – đúng như đã kiểm định).
  3. Tín hiệu 4 phiên trước mà giá còn ≤ 5% trên điểm vượt nền (quy tắc O'Neil – không mua đuổi quá 5%).
  4. Danh sách chờ: L + xu hướng, cách đỉnh 52 tuần ≤ 8%, chưa vượt nền – chờ phiên vượt đỉnh với khối lượng ≥ 1,5×.
  5. C (LNST quý gần nhất ≥ +25% so với cùng kỳ), A (ROE 4 quý ≥ 15%, EPS 4 quý > 0) – dữ liệu KBS.

    python3 loc-co-phieu/nghien-cuu/danh_muc_ngan_han.py
Kết quả: loc-co-phieu/.cache/kq-nghien-cuu/danh-muc-<ngày>.json
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chung  # noqa: E402
import xay_du_lieu as xd  # noqa: E402
from chung import ls  # noqa: E402

SO_PHIEN_DUNG = 700        # đủ cho MA200 có độ dốc, đỉnh 52 tuần, RS 12 tháng
TEP_TC = os.path.join(chung.GOC, ".cache", "tai-chinh.json")


def co_ban(ngay: pd.Timestamp) -> pd.DataFrame:
    """Quý gần nhất đã công bố đến `ngay` của từng mã: tăng trưởng LNST, doanh thu, ROE, EPS 4 quý."""
    with open(TEP_TC, encoding="utf-8") as fh:
        tc = json.load(fh)
    hang = []
    for ma, v in tc.items():
        for q in (v.get("quy") or [])[:4]:
            if q.get("ngay_cb") and pd.Timestamp(q["ngay_cb"]) <= ngay:
                g = q.get("tt_lnst")                       # 0 tròn = nguồn không có số liệu (giống canslim.py)
                hang.append({"ma": ma, "quy": f"Q{q.get('quy')}/{q.get('nam')}", "ngay_cb": q["ngay_cb"],
                             "tt_lnst": None if g is None or abs(g) < 0.005 else g, "tt_dt": q.get("tt_dt"),
                             "roe4q": q.get("roe4q"), "eps4q": q.get("eps4q")})
                break
    return pd.DataFrame(hang).set_index("ma") if hang else pd.DataFrame()


def main() -> int:
    du, vni, ds = xd.doc_lich_su()
    du = {m: d.iloc[-SO_PHIEN_DUNG:] for m, d in du.items()}
    vni = vni.iloc[-SO_PHIEN_DUNG:]
    san, nganh, ten = ds["san"], ds["nganh"], ds["ten"]
    bang = ls.tao_bang(du)
    f = ls.dac_trung(bang, vni, nganh, san)
    C, H, V = bang["C"], bang["H"], bang["V"]
    T = C.index[-1]
    tt = ls.trang_thai_vni(vni.loc[:T])
    che_do = int(xd.che_do_thi_truong(vni).reindex(C.index).ffill().iat[-1])
    vc = vni["close"].reindex(C.index).ffill()
    print(f"Phiên {T:%d/%m/%Y}: VN-Index {vc.iat[-1]:,.2f} ({tt['r1']:+.2%}) · {tt['trang_thai']} (mức {che_do}) · "
          f"cách đỉnh 60 phiên {tt['tu_dinh60']:+.1%} · hồi từ đáy 20 phiên {tt['tu_day20']:+.1%} · "
          f"ngày xác nhận tăng: {'CÓ' if tt['xac_nhan'] else 'không'}", flush=True)

    vu_tru = f["trong_vu_tru"]
    N = (f["d_dinh250"] >= -0.05) & (f["d_dinh20"] >= -0.005) & (f["r1"] > 0)
    S = f["kl_tb50"] >= np.log1p(1.5)
    L = f["rs_tong"] >= 0.80
    xh = (f["d_ma50"] > 0) & (f["sl_ma50"] > 0) & (f["d_ma200"] > 0) & (f["sl_ma200"] > 0)
    tin_hieu = (N & S & L & xh & vu_tru).fillna(False)
    diem_mua = H.shift(1).rolling(20).max()               # điểm vượt nền = đỉnh 20 phiên trước phiên tín hiệu
    dinh_nen = H.rolling(20).max()                         # mã đang chờ: phải vượt đỉnh 20 phiên tính cả hôm nay
    kl_can = 1.5 * V.iloc[-50:].mean()                     # khối lượng cần có ở phiên vượt nền (≥ 1,5× TB 50 phiên)
    cb = co_ban(T)

    def dong(ma: str, b: pd.Timestamp, loai: str) -> dict:
        gia = float(C.at[T, ma])
        x = {k: (float(f[k].at[T, ma]) if np.isfinite(f[k].at[T, ma]) else None)
             for k in ("rs_tong", "d_dinh250", "d_ma50", "atr_pct", "nganh_rs60", "beta60")}
        nguon = dinh_nen.at[T, ma] if loai == "cho" else diem_mua.at[b, ma]
        piv = float(nguon) if np.isfinite(nguon) else gia
        vao = piv if loai == "cho" else gia                # giá vào dự kiến để tính cắt lỗ / mục tiêu
        kl = float(np.expm1(f["kl_tb50"].at[b, ma]))
        c = cb.loc[ma].to_dict() if ma in cb.index else {}
        C_ok = (c.get("tt_lnst") or -1e9) >= 25
        A_ok = (c.get("roe4q") or -1e9) >= 15 and (c.get("eps4q") or -1e9) > 0
        return {"ma": ma, "ten": str(ten.get(ma, "")), "san": str(san.get(ma, "")), "nganh": str(nganh.get(ma, "")),
                "loai": loai, "ngay_tin_hieu": f"{b:%Y-%m-%d}", "gia": gia, "diem_mua": round(piv, 2),
                "cach_diem_mua": round(gia / piv - 1, 4), "mua_toi_da": round(min(piv * 1.05, vao * 1.02), 2),
                "cat_lo": round(vao * 0.93, 2), "muc_tieu": round(vao * 1.20, 2), "kl_gap": round(kl, 2),
                "kl_can": int(np.nan_to_num(kl_can.get(ma, 0))), "gtgd20": round(float(f["_gtgd20"].at[T, ma]), 1), **x,
                "quy": c.get("quy"), "tt_lnst": c.get("tt_lnst"), "tt_dt": c.get("tt_dt"),
                "roe4q": c.get("roe4q"), "eps4q": c.get("eps4q"), "C": C_ok, "A": A_ok}

    hom_nay = [dong(m, T, "hom_nay") for m in C.columns[tin_hieu.loc[T].to_numpy()]]
    gan_day = []
    da_co = {d["ma"] for d in hom_nay}
    for b in C.index[-5:-1][::-1]:
        for m in C.columns[tin_hieu.loc[b].to_numpy()]:
            if m in da_co or not bool(vu_tru.at[T, m]):
                continue
            d = dong(m, b, "gan_day")
            if -0.03 <= d["cach_diem_mua"] <= 0.05:          # còn trong vùng mua, chưa gãy nền
                gan_day.append(d)
            da_co.add(m)
    cho = (vu_tru & L & xh & (f["d_dinh250"] >= -0.08) & (f["d_dinh20"] < -0.005)).loc[T]
    cho_ds = [dong(m, T, "cho") for m in C.columns[cho.fillna(False).to_numpy()] if m not in da_co]

    def xep(ds_: list[dict]) -> list[dict]:   # ưu tiên mã đạt cả C và A, rồi RS cao
        return sorted(ds_, key=lambda d: (-(d["C"] + d["A"]), -(d["rs_tong"] or 0)))

    hom_nay, gan_day, cho_ds = xep(hom_nay), xep(gan_day), xep(cho_ds)
    luot, tt2 = ls.goi_y(du, vni, san, nganh, toi_da=5)

    def in_bang(tieu_de: str, ds_: list[dict], toi_da: int = 25) -> None:
        print(f"\n## {tieu_de}: {len(ds_)} mã")
        for d in ds_[:toi_da]:
            lnst = "—" if d["tt_lnst"] is None else f"{d['tt_lnst']:+.0f}%"
            roe = "—" if d["roe4q"] is None else f"{d['roe4q']:.0f}%"
            print(f"  {d['ma']:4} {d['san']:5} {d['gia']:8.2f} | điểm mua {d['diem_mua']:.2f} ({d['cach_diem_mua']:+.1%})"
                  f" | RS {100 * (d['rs_tong'] or 0):3.0f} | KL {d['kl_gap']:.1f}× | đỉnh52t {100 * (d['d_dinh250'] or 0):+.0f}%"
                  f" | ATR {100 * (d['atr_pct'] or 0):.1f}% | GTGD {d['gtgd20']:.0f} tỷ | {d['quy']} LNST {lnst} ROE {roe}"
                  f" | {'C' if d['C'] else '-'}{'A' if d['A'] else '-'} | {d['ten'][:28]}")

    in_bang("Tín hiệu CANSLIM hôm nay (mua mở cửa phiên sau)", hom_nay)
    in_bang("Tín hiệu 4 phiên trước, giá còn trong vùng mua", gan_day)
    in_bang("Danh sách chờ vượt nền (RS ≥ 80, xu hướng tăng, cách đỉnh 52 tuần ≤ 8%)", cho_ds, 40)
    print(f"\n## Lướt sóng của công cụ ({tt2.get('so_ung_vien')} ứng viên):")
    for g in luot:
        print(f"  {g['ma']:4} {g['gia']:8.2f} | {g['loai']} | điểm {g['diem']:+.3f} | {'; '.join(g['ly_do'])}")
    kq = {"ngay": f"{T:%Y-%m-%d}", "vni": float(vc.iat[-1]), "thi_truong": {**tt, "che_do_xd": che_do},
          "hom_nay": hom_nay, "gan_day": gan_day, "cho": cho_ds, "luot_song": luot}
    p = os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", f"danh-muc-{T:%Y-%m-%d}.json")
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1, default=str)
    print(f"\nĐã lưu {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
