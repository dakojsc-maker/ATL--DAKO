"""Cổ phiếu mạnh hơn thị trường trong đợt điều chỉnh có tăng trước khi thị trường hồi phục không? Kiểm định 5 năm gần
nhất (11/2021 → 10/2026) và tìm những mã đánh theo cách này thắng đều đặn.

Điểm mua – "ngày xác nhận tăng" kiểu O'Neil, phát hiện theo thời gian thực (không dùng dữ liệu tương lai):
  - VN-Index đã giảm ≥ 7% so với giá đóng cửa cao nhất 60 phiên trước đáy gần nhất;
  - hôm nay là phiên thứ 4 trở đi kể từ đáy đó (đáy chưa bị thủng), VN-Index tăng ≥ 1,2%, khối lượng lớn hơn phiên trước;
  - mỗi đáy chỉ tính một lần; nếu thị trường thủng đáy (xác nhận thất bại) thì đáy mới được tính lại.
Mã "mạnh hơn thị trường" tại ngày xác nhận (chỉ dùng dữ liệu đến hôm đó), trong vũ trụ đủ thanh khoản:
  - RƠI ÍT HƠN: từ đỉnh tới đáy của VN-Index, mã giảm ít hơn chỉ số, thuộc 20% mã tốt nhất thị trường;
  - NGỪNG GIẢM SỚM: đáy của mã trong đợt điều chỉnh đến trước đáy VN-Index ≥ 5 phiên (từ chối giảm tiếp);
  - CÂN BẰNG SÁT ĐỈNH: cách đỉnh 52 tuần ≤ 15% và giá trên MA50.
Mua giá mở cửa phiên sau ngày xác nhận; bán +7% / −7% / 20 phiên (lướt sóng) hoặc +20% / −7% / 40 phiên (O'Neil),
đã trừ phí, thuế, theo luật T+2. Cần chạy tai_lich_su.py --lam-moi trước để có giá mới nhất.

    python3 loc-co-phieu/nghien-cuu/manh_khi_dieu_chinh.py
Kết quả: loc-co-phieu/.cache/kq-nghien-cuu/manh-khi-dieu-chinh.json
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

TU = "2021-11-01"            # 5 năm gần nhất
DOC_TOI_THIEU = 0.07         # VN-Index giảm ≥ 7% mới gọi là điều chỉnh
TOP = 0.80                   # 20% mã rơi ít nhất
PHIEN_SOM = 5                # đáy của mã đến trước đáy VN-Index ≥ 5 phiên


def ngay_xac_nhan(c: np.ndarray, v: np.ndarray) -> list[dict]:
    """Các ngày xác nhận tăng (follow-through) phát hiện theo thời gian thực."""
    su_kien, day_da_dung, ftd_truoc, day_truoc = [], set(), -10 ** 9, np.inf
    for t in range(80, len(c)):
        w0 = t - 25
        j = w0 + int(np.argmin(c[w0:t + 1]))
        if t - j < 3 or j in day_da_dung:
            continue
        p = j - 60 + int(np.argmax(c[j - 60:j + 1]))
        if c[j] / c[p] - 1 > -DOC_TOI_THIEU:
            continue
        if not (c[j] < day_truoc or p > ftd_truoc):      # chưa thủng đáy cũ và chưa có đợt điều chỉnh mới
            continue
        if c[t] / c[t - 1] - 1 >= 0.012 and v[t] > v[t - 1]:
            su_kien.append({"t": t, "day": j, "dinh": p})
            day_da_dung.add(j)
            ftd_truoc, day_truoc = t, c[j]
    return su_kien


def ngay_chuyen_tang(c: np.ndarray, che_do: np.ndarray) -> list[dict]:
    """Ngày thị trường chuyển sang "TĂNG – thuận lợi" sau đợt điều chỉnh ≥ 7% (10 phiên trước đó chưa ở mức này)."""
    su_kien, day_da_dung = [], set()
    for t in range(130, len(c)):
        if che_do[t] != 2 or (che_do[t - 10:t] == 2).any():
            continue
        j = t - 60 + int(np.argmin(c[t - 60:t + 1]))
        p = j - 60 + int(np.argmax(c[j - 60:j + 1]))
        if c[j] / c[p] - 1 > -DOC_TOI_THIEU or j in day_da_dung:
            continue
        su_kien.append({"t": t, "day": j, "dinh": p})
        day_da_dung.add(j)
    return su_kien


def suc_manh(Cn: np.ndarray, c: np.ndarray, p: int, j: int) -> tuple[np.ndarray, np.ndarray]:
    """Mức rơi so với VN-Index từ đỉnh p tới đáy j, và cờ "ngừng giảm sớm" của từng mã."""
    with np.errstate(divide="ignore", invalid="ignore"):
        tuong_doi = (Cn[j] / Cn[p]) / (c[j] / c[p]) - 1
    doan = np.where(np.isfinite(Cn[p:j + 1]), Cn[p:j + 1], np.inf)
    day_ma = p + np.argmin(doan, axis=0)
    return tuong_doi, day_ma <= j - PHIEN_SOM


NHOM = ["Tất cả mã", "Rơi ít hơn (top 20%)", "Rơi ít hơn + ngừng giảm sớm", "Đủ 3 điều kiện",
        "Rơi ít hơn so với độ nhạy (beta) + ngừng giảm sớm", "RS 12 tháng top 20% + trên MA50",
        "Rơi nhiều nhất (20% yếu nhất)", "Rơi nhiều nhất + beta ≥ 1"]


def phan_tich(su_kien: list[dict], d: dict) -> tuple[list[dict], list[dict]]:
    """Kết quả từng nhóm mã ở từng sự kiện, và danh sách (sự kiện, mã) của các nhóm cần xem theo từng mã."""
    Cn, On, c, vo, lich = d["Cn"], d["On"], d["c"], d["vo"], d["lich"]
    hang, dong = [], []
    for k, e in enumerate(su_kien):
        t, j, p = e["t"], e["day"], e["dinh"]
        ok = d["vu_tru"][t] & np.isfinite(Cn[p]) & np.isfinite(Cn[j])
        td, som = suc_manh(Cn, c, p, j)
        hang_td = pd.Series(np.where(ok, td, np.nan)).rank(pct=True).to_numpy()
        with np.errstate(divide="ignore", invalid="ignore"):
            du_beta = (Cn[j] / Cn[p] - 1) - d["beta"][p] * (c[j] / c[p] - 1)     # rơi ít hơn mức "đáng lẽ"
            hoi_som = Cn[t] / Cn[j] - 1                                        # tăng từ đáy VN-Index tới ngày mua
        hang_beta = pd.Series(np.where(ok & np.isfinite(du_beta), du_beta, np.nan)).rank(pct=True).to_numpy()
        can_bang = (d["d250"][t] >= -0.15) & (d["dma50"][t] > 0)
        top = ok & (hang_td >= TOP)
        yeu = ok & (hang_td <= 1 - TOP)
        nhom = dict(zip(NHOM, [ok, top, top & som, top & som & can_bang, ok & (hang_beta >= TOP) & som,
                               ok & (d["rs"][t] >= 0.8) & (d["dma50"][t] > 0), yeu, yeu & (d["beta"][t] >= 1)]))
        r = {"ngay": f"{lich[t]:%Y-%m-%d}", "dinh": f"{lich[p]:%Y-%m-%d}", "day": f"{lich[j]:%Y-%m-%d}",
             "vni_giam": round(float(c[j] / c[p] - 1), 4), "vni_hoi_som": round(float(c[t] / c[j] - 1), 4)}
        if t + 20 < len(c):
            r["vni_20"] = round(float(c[t + 20] / vo[t + 1] - 1), 4)
        for ten_nhom, m in nhom.items():
            g = {"so_ma": int(m.sum())}
            for ten_kq, a in (("7", d["l7"][t]), ("20", d["l20"][t])):
                x = a[m]
                x = x[np.isfinite(x)]
                if len(x):
                    g[f"thang{ten_kq}"], g[f"tb{ten_kq}"] = round(float((x > 0).mean()), 3), round(float(x.mean()), 4)
                    g[f"n{ten_kq}"] = int(len(x))
            x = hoi_som[m]
            x = x[np.isfinite(x)]
            if len(x):
                g["hoi_som"] = round(float(np.median(x)), 4)
            r[ten_nhom] = g
        hang.append(r)
        for ten_nhom in ("Rơi ít hơn (top 20%)", "Đủ 3 điều kiện"):
            for i in np.flatnonzero(nhom[ten_nhom]):
                a7, a20 = d["l7"][t][i], d["l20"][t][i]
                dong.append({"nhom": ten_nhom, "su_kien": k, "ngay": r["ngay"], "ma": d["ma"][i],
                             "lai7": float(a7) if np.isfinite(a7) else None,
                             "lai20": float(a20) if np.isfinite(a20) else None})
    return hang, dong


def tong_hop(hang: list[dict]) -> dict:
    tong = {}
    for ten_nhom in NHOM:
        gs = [r[ten_nhom] for r in hang if r[ten_nhom].get("n7")]
        n7 = sum(g["n7"] for g in gs)
        g20 = [g for g in gs if g.get("n20")]
        tong[ten_nhom] = {
            "so_lenh": n7,
            "thang7": round(sum(g["thang7"] * g["n7"] for g in gs) / max(1, n7), 3),
            "tb7": round(sum(g["tb7"] * g["n7"] for g in gs) / max(1, n7), 4),
            "thang20": round(sum(g["thang20"] * g["n20"] for g in g20) / max(1, sum(g["n20"] for g in g20)), 3),
            "tb20": round(sum(g["tb20"] * g["n20"] for g in g20) / max(1, sum(g["n20"] for g in g20)), 4),
            "lan_lai7": sum(1 for g in gs if g["tb7"] > 0), "lan_hon_moi_ma": sum(
                1 for r in hang if r[ten_nhom].get("n7") and r["Tất cả mã"].get("n7")
                and r[ten_nhom]["tb7"] > r["Tất cả mã"]["tb7"]),
            "so_lan": len(gs),
            "hoi_som_tv": round(float(np.median([g["hoi_som"] for g in gs if "hoi_som" in g])), 4) if gs else None,
        }
    return tong


def theo_ma(dong: list[dict], nhom: str, ten: pd.Series) -> list[dict]:
    dm = pd.DataFrame([x for x in dong if x["nhom"] == nhom])
    kq = []
    if dm.empty:
        return kq
    for m, g in dm.groupby("ma"):
        g = g.dropna(subset=["lai7"])
        if g.empty:
            continue
        x = g["lai7"]
        kq.append({"ma": m, "ten": str(ten.get(m, "")), "so_lan": int(len(x)), "thang": int((x > 0).sum()),
                   "tb7": round(float(x.mean()), 4),
                   "tb20": round(float(g["lai20"].dropna().mean()), 4) if g["lai20"].notna().any() else None,
                   "lan": [(r.ngay, round(r.lai7, 4)) for r in g.itertuples()]})
    kq.sort(key=lambda d_: (-(d_["thang"] == d_["so_lan"]) * d_["so_lan"], -d_["thang"], -d_["tb7"]))
    return kq


def ngoai_mau(dong: list[dict], nhom: str) -> dict:
    """Chọn mã thắng mọi lần đến hết 2024, xem kết quả của chính các mã đó ở 2025–2026."""
    dm = pd.DataFrame([x for x in dong if x["nhom"] == nhom]).dropna(subset=["lai7"])
    if dm.empty:
        return {}
    truoc, sau = dm[dm["ngay"] < "2025-01-01"], dm[dm["ngay"] >= "2025-01-01"]
    tk = truoc.groupby("ma")["lai7"].agg(["size", lambda s_: bool((s_ > 0).all())])
    tk.columns = ["n", "luon_thang"]
    kq = {"moi_ma_2025_2026": {"lenh": int(len(sau)), "thang": round(float((sau["lai7"] > 0).mean()), 3),
                               "tb": round(float(sau["lai7"].mean()), 4)}}
    for nmin in (2, 3, 4):
        chon = set(tk[(tk["n"] >= nmin) & tk["luon_thang"]].index)
        s_ = sau[sau["ma"].isin(chon)]
        kq[f"luon_thang_tu_{nmin}_lan"] = {"so_ma": len(chon), "ma": sorted(chon), "lenh_2025_2026": int(len(s_)),
                                          "thang": round(float((s_["lai7"] > 0).mean()), 3) if len(s_) else None,
                                          "tb": round(float(s_["lai7"].mean()), 4) if len(s_) else None}
    return kq


def in_ket_qua(tieu_de: str, hang: list[dict], tong: dict) -> None:
    print(f"\n===== {tieu_de}: {len(hang)} lần =====")
    for r in hang:
        g3, ga, gy = r["Đủ 3 điều kiện"], r["Tất cả mã"], r["Rơi nhiều nhất (20% yếu nhất)"]
        print(f"  {r['ngay']} (đỉnh {r['dinh']} → đáy {r['day']}, VNI {r['vni_giam']:+.0%}, 20 phiên sau "
              f"{r.get('vni_20', float('nan')):+.1%}) | đủ 3 đk {g3['so_ma']} mã: thắng {g3.get('thang7', 0):.0%} TB "
              f"{g3.get('tb7', 0):+.1%} | mọi mã: {ga.get('thang7', 0):.0%} {ga.get('tb7', 0):+.1%} | yếu nhất: "
              f"{gy.get('thang7', 0):.0%} {gy.get('tb7', 0):+.1%}")
    for ten_nhom, x in tong.items():
        print(f"  {ten_nhom}: {x['so_lenh']} lệnh · +7/−7/20 thắng {x['thang7']:.0%} TB {x['tb7']:+.2%} · lần có lãi "
              f"{x['lan_lai7']}/{x['so_lan']} · hơn mọi mã {x['lan_hon_moi_ma']}/{x['so_lan']} · +20/−7/40 thắng "
              f"{x['thang20']:.0%} TB {x['tb20']:+.2%} · tăng từ đáy tới ngày mua (trung vị) {x['hoi_som_tv']:+.1%}")


def main() -> int:
    du, vni, ds = xd.doc_lich_su()
    du = {m: x.loc["2019-06-01":] for m, x in du.items() if len(x.loc["2019-06-01":])}
    san, nganh, ten = ds["san"], ds["nganh"], ds["ten"]
    bang = ls.tao_bang(du)
    f = ls.dac_trung(bang, vni, nganh, san)
    C, O = bang["C"], bang["O"]
    lich = C.index
    vn = vni.reindex(lich).ffill()
    c, v, vo = vn["close"].to_numpy(), vn["volume"].to_numpy(), vn["open"].to_numpy()
    print(f"{C.shape[1]} mã, {lich[0]:%d/%m/%Y} → {lich[-1]:%d/%m/%Y}", flush=True)
    mp7 = ls.mo_phong(bang, san, 0.07, 0.07, 20)
    mp20 = ls.mo_phong(bang, san, 0.20, 0.07, 40)
    d = {"Cn": C.to_numpy(), "On": O.to_numpy(), "c": c, "vo": vo, "lich": lich, "ma": C.columns.to_numpy(),
         "vu_tru": f["trong_vu_tru"].to_numpy(bool), "d250": f["d_dinh250"].to_numpy(),
         "dma50": f["d_ma50"].to_numpy(), "rs": f["rs_tong"].to_numpy(), "beta": f["beta60"].to_numpy(),
         "l7": mp7["lai"].to_numpy(), "l20": mp20["lai"].to_numpy()}
    che_do = xd.che_do_thi_truong(vn).to_numpy()
    tu = pd.Timestamp(TU)
    kq = {}
    for ten_sk, sk in (("xac_nhan", ngay_xac_nhan(c, v)), ("chuyen_tang", ngay_chuyen_tang(c, che_do))):
        sk = [e for e in sk if lich[e["t"]] >= tu]
        hang, dong = phan_tich(sk, d)
        tong = tong_hop(hang)
        in_ket_qua({"xac_nhan": "Mua ở ngày xác nhận tăng", "chuyen_tang": "Mua khi thị trường chuyển sang TĂNG – "
                    "thuận lợi"}[ten_sk], hang, tong)
        kq[ten_sk] = {"su_kien": hang, "tong": tong, "dong": dong}
        for nhom in ("Đủ 3 điều kiện", "Rơi ít hơn (top 20%)"):
            ds_ma = theo_ma(dong, nhom, ten)
            kq[ten_sk][f"ma_{nhom}"] = ds_ma
            print(f"\n  -- Theo mã ({nhom}); mã có ≥ 3 lần, thắng/số lần:")
            for x in [x for x in ds_ma if x["so_lan"] >= 3][:25]:
                tb20 = "—" if x["tb20"] is None else f"{x['tb20']:+.1%}"
                lan = " ".join(f"{n[2:7]}:{y:+.0%}" for n, y in x["lan"])
                print(f"    {x['ma']:4} {x['thang']}/{x['so_lan']} TB {x['tb7']:+.1%} O'Neil {tb20} | {x['ten'][:26]} | {lan}")
            dem = pd.Series([x["so_lan"] for x in ds_ma]).value_counts().sort_index().to_dict() if ds_ma else {}
            luon = [x["ma"] for x in ds_ma if x["thang"] == x["so_lan"] and x["so_lan"] >= 3]
            print(f"    số mã theo số lần đạt: {dem}; thắng mọi lần (≥ 3 lần): {luon}")
            nm = ngoai_mau(dong, nhom)
            kq[ten_sk][f"ngoai_mau_{nhom}"] = nm
            print(f"    ngoài mẫu: {nm}")

    # ---- đợt điều chỉnh hiện tại: mã đang mạnh hơn thị trường ----
    Cn, T = d["Cn"], len(c) - 1
    j = T - 25 + int(np.argmin(c[T - 25:T + 1]))
    p = j - 60 + int(np.argmax(c[j - 60:j + 1]))
    td, som = suc_manh(Cn, c, p, j)
    ok = d["vu_tru"][T] & np.isfinite(td)
    hang_td = pd.Series(np.where(ok, td, np.nan)).rank(pct=True).to_numpy()
    with np.errstate(divide="ignore", invalid="ignore"):
        td_nay = (Cn[T] / Cn[p]) / (c[T] / c[p]) - 1
    dk = ok & (hang_td >= TOP) & som & (d["d250"][T] >= -0.15) & (d["dma50"][T] > 0)
    lich_su = {x["ma"]: x for x in kq["xac_nhan"]["ma_Đủ 3 điều kiện"]}
    lich_su2 = {x["ma"]: x for x in kq["xac_nhan"]["ma_Rơi ít hơn (top 20%)"]}
    hien_tai = []
    for i in np.flatnonzero(dk):
        m = d["ma"][i]
        h, h2 = lich_su.get(m, {}), lich_su2.get(m, {})
        hien_tai.append({"ma": m, "ten": str(ten.get(m, "")), "san": str(san.get(m, "")), "gia": float(Cn[T, i]),
                         "tu_dinh": round(float(Cn[T, i] / Cn[p, i] - 1), 4), "manh_hon_vni": round(float(td_nay[i]), 4),
                         "cach_dinh52t": round(float(d["d250"][T, i]), 4), "beta": round(float(d["beta"][T, i]), 2),
                         "gtgd20": round(float(f["_gtgd20"].iat[T, i]), 1),
                         "lich_su_3dk": f"{h.get('thang', 0)}/{h.get('so_lan', 0)}",
                         "lich_su_top20": f"{h2.get('thang', 0)}/{h2.get('so_lan', 0)}", "tb7_top20": h2.get("tb7")})
    hien_tai.sort(key=lambda x: -x["manh_hon_vni"])
    print(f"\n## Đợt hiện tại: đỉnh {lich[p]:%d/%m/%Y} ({c[p]:,.1f}) → đáy {lich[j]:%d/%m/%Y} ({c[j]:,.1f}, "
          f"{c[j] / c[p] - 1:+.1%}); {lich[T]:%d/%m/%Y}: {c[T]:,.1f} ({c[T] / c[p] - 1:+.1%}). {len(hien_tai)} mã đủ 3 điều kiện:")
    for x in hien_tai:
        print(f"  {x['ma']:4} {x['san']:5} {x['gia']:8.2f} | từ đỉnh {x['tu_dinh']:+.1%} | mạnh hơn VNI {x['manh_hon_vni']:+.1%}"
              f" | cách đỉnh 52t {x['cach_dinh52t']:+.0%} | beta {x['beta']} | GTGD {x['gtgd20']:.0f} tỷ | 5 năm: 3đk "
              f"{x['lich_su_3dk']}, top20 {x['lich_su_top20']} TB {x['tb7_top20']} | {x['ten'][:26]}")
    kq["hien_tai"] = hien_tai
    kq["dot_hien_tai"] = {"dinh": f"{lich[p]:%Y-%m-%d}", "day": f"{lich[j]:%Y-%m-%d}", "ngay": f"{lich[T]:%Y-%m-%d}"}
    for k_ in ("xac_nhan", "chuyen_tang"):
        kq[k_].pop("dong", None)
    with open(os.path.join(chung.GOC, ".cache", "kq-nghien-cuu", "manh-khi-dieu-chinh.json"), "w", encoding="utf-8") as fh:
        json.dump(kq, fh, ensure_ascii=False, indent=1, default=str)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
