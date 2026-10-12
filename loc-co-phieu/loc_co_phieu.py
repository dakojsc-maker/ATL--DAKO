#!/usr/bin/env python3
"""Lọc cổ phiếu Việt Nam theo mẫu DRI/MSR: nền chặt sát đỉnh → bùng nổ khối lượng. Xem README.md.

  python loc_co_phieu.py                                   quét toàn thị trường (tự nhận biết trong phiên/cuối ngày)
  python loc_co_phieu.py --theo-doi                        14:00–14:25: chỉ quét lại danh sách theo dõi
  python loc_co_phieu.py --ma DRI MSR                      phân tích chi tiết từng mã
  python loc_co_phieu.py --ma DRI MSR --ngay 2026-09-22    công cụ sẽ báo gì vào một ngày trong quá khứ
  python loc_co_phieu.py --danh-muc danh-muc.txt           kiểm tra tín hiệu bán cho cổ phiếu đang giữ
  python loc_co_phieu.py --hieu-qua                        chỉ cập nhật & xem nhật ký gợi ý (lời/lỗ, tỷ lệ thắng)
  python loc_co_phieu.py --gio                             đang ở phiên nào, nên chạy gì
  python loc_co_phieu.py --kiem-tra                        kiểm tra kết nối các nguồn dữ liệu
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def _dam_bao_thu_vien():
    """Máy có nhiều bản Python và bản đang chạy thiếu thư viện (gặp ở máy chủ chạy theo lịch) → tự chạy lại
    bằng bản Python có đủ numpy, pandas, requests; không có bản nào thì báo cách cài."""
    import importlib.util
    thieu = [m for m in ("numpy", "pandas", "requests") if importlib.util.find_spec(m) is None]
    if not thieu:
        return
    import shutil
    import subprocess
    if not os.environ.get("LOC_CO_PHIEU_DOI_PYTHON"):
        da_thu = {os.path.abspath(sys.executable)}
        for p in ("/usr/bin/python3", "/bin/python3", "/usr/local/bin/python3", shutil.which("python3"),
                  shutil.which("python")):
            if not p or not os.path.exists(p) or os.path.abspath(p) in da_thu:
                continue
            da_thu.add(os.path.abspath(p))
            try:
                du = subprocess.run([p, "-c", "import numpy, pandas, requests"], capture_output=True,
                                    timeout=120).returncode == 0
            except (OSError, subprocess.SubprocessError):
                du = False
            if du:
                os.environ["LOC_CO_PHIEU_DOI_PYTHON"] = "1"
                os.execv(p, [p, os.path.abspath(__file__), *sys.argv[1:]])
    sys.exit(f"Thiếu thư viện: {', '.join(thieu)}. Cài bằng lệnh: "
             f"{sys.executable} -m pip install -r {os.path.join(HERE, 'requirements.txt')}")


if __name__ == "__main__":
    _dam_bao_thu_vien()

from locphieu import baocao, nhatky  # noqa: E402
from locphieu.cauhinh import CauHinh  # noqa: E402
from locphieu.chienluoc import (boi_canh_thi_truong, danh_gia_nam_giu, gan_xep_hang_rs,  # noqa: E402
                                phan_tich_ma)
from locphieu.dulieu import (NGUON, TEN_MIEN, KhoDuLieu, NguonCSV, cat_den_ngay, doc_thanh_khoan,  # noqa: E402
                             ghi_thanh_khoan, la_ngay_hom_nay)
from locphieu.thoigian import (LICH_CHAY, TrangThaiPhien, gio_vn, trang_thai_phien,  # noqa: E402
                               ty_le_kl_da_khop)

THU_MUC_CACHE = os.path.join(HERE, ".cache")
TEP_THEO_DOI = os.path.join(THU_MUC_CACHE, "theo-doi.json")
TEP_NHAT_KY = os.path.join(HERE, "nhat-ky", "goi-y.json")


def _utf8():
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


def doc_danh_muc(duong_dan: str) -> list[dict]:
    """Mỗi dòng: MÃ GIÁ_MUA [SỐ_LƯỢNG] [NGÀY_MUA yyyy-mm-dd]; phân cách bằng dấu cách, phẩy, chấm phẩy hoặc tab."""
    ds = []
    with open(duong_dan, encoding="utf-8-sig") as f:
        for dong in f:
            dong = dong.split("#", 1)[0].strip()
            if not dong:
                continue
            phan = [p for p in re.split(r"[\s,;]+", dong) if p]
            if len(phan) < 2:
                continue
            ma = phan[0].upper()
            gia = float(phan[1].replace("_", ""))
            if gia > 1000:  # nhập theo đồng → đổi sang nghìn đồng
                gia /= 1000
            so_luong, ngay = None, None
            for p in phan[2:]:
                if re.fullmatch(r"\d{4}-\d{2}-\d{2}", p):
                    ngay = p
                elif re.fullmatch(r"[\d.]+", p):
                    so_luong = float(p)
            ds.append({"ma": ma, "gia_mua": gia, "so_luong": so_luong, "ngay_mua": ngay})
    return ds


def doc_san_da_biet() -> dict:
    p = os.path.join(THU_MUC_CACHE, "danh-sach-ma.csv")
    if not os.path.exists(p):
        return {}
    try:
        import pandas as pd
        df = pd.read_csv(p, dtype=str, keep_default_na=False)
        return dict(zip(df["ma"], df["san"]))
    except Exception:
        return {}


def kiem_dinh_tong_hop(ket_qua: list[dict]) -> dict:
    """Mọi tín hiệu breakout trong dữ liệu đã tải (~1,5 năm) của các mã đã phân tích, bán theo quy tắc công cụ."""
    lich_su = {k["ma"]: k.get("lich_su") or [] for k in ket_qua}
    ngay = max((k["ngay"] for k in ket_qua), default="")
    return nhatky.tom_tat_kiem_dinh(lich_su, ngay, len(ket_qua))


def main(argv=None) -> int:
    _utf8()
    ap = argparse.ArgumentParser(
        prog="loc_co_phieu.py", formatter_class=argparse.RawDescriptionHelpFormatter,
        description="Lọc cổ phiếu theo mẫu DRI/MSR (nền chặt sát đỉnh → bùng nổ khối lượng).",
        epilog="Giờ chạy tốt nhất: sau 15:30 (quét đầy đủ) và 14:00–14:25 (--theo-doi). Xem --gio.")
    ap.add_argument("--ma", nargs="+", metavar="MÃ", help="phân tích chi tiết các mã chỉ định")
    ap.add_argument("--theo-doi", action="store_true", help="chỉ quét danh sách theo dõi của lần quét đầy đủ gần nhất")
    ap.add_argument("--danh-muc", metavar="TỆP", help="tệp danh mục đang nắm giữ (xem danh-muc.mau.txt)")
    ap.add_argument("--ngay", metavar="YYYY-MM-DD", help="phân tích như thể đang ở cuối phiên ngày này")
    ap.add_argument("--san", default="HOSE,HNX,UPCOM", help="sàn cần quét (mặc định cả 3)")
    ap.add_argument("--gtgd", type=float, help="GTGD bình quân 20 phiên tối thiểu, tỷ đồng (mặc định 3)")
    ap.add_argument("--gia", type=float, help="giá tối thiểu, nghìn đồng (mặc định 5)")
    ap.add_argument("--von", type=float, metavar="TRIỆU", help="tổng vốn (triệu đồng) để gợi ý khối lượng mua")
    ap.add_argument("--top", type=int, default=30, help="số mã tối đa trong danh sách theo dõi (mặc định 30)")
    ap.add_argument("--nguon", default="VCI,KBS,DNSE,VND", help="thứ tự nguồn dữ liệu")
    ap.add_argument("--csv-dir", metavar="THƯ_MỤC", help="chạy offline từ thư mục <MÃ>.csv")
    ap.add_argument("--luong", type=int, default=4, help="số luồng tải song song (mặc định 4)")
    ap.add_argument("--khong-cache", action="store_true", help="bỏ qua bộ nhớ đệm, tải lại toàn bộ")
    ap.add_argument("--kiem-dinh", action="store_true", help="in chi tiết kiểm định các tín hiệu trong quá khứ")
    ap.add_argument("--hieu-qua", action="store_true",
                    help="chỉ cập nhật & xem nhật ký gợi ý (lời/lỗ từng gợi ý, tỷ lệ thắng, độ tin cậy)")
    ap.add_argument("--nhat-ky", metavar="TỆP", help="tệp nhật ký gợi ý (mặc định nhat-ky/goi-y.json)")
    ap.add_argument("--khong-nhat-ky", action="store_true", help="không ghi/không cập nhật nhật ký gợi ý")
    ap.add_argument("--khong-dong-bo", action="store_true", help="không gộp nhật ký từ các nhánh git khác")
    ap.add_argument("--gio", action="store_true", help="xem trạng thái phiên và lịch chạy khuyến nghị")
    ap.add_argument("--kiem-tra", action="store_true", help="kiểm tra kết nối nguồn dữ liệu")
    ap.add_argument("--ket-qua", default=os.path.join(HERE, "ket-qua"), metavar="THƯ_MỤC",
                    help="thư mục lưu báo cáo (mặc định ./ket-qua)")
    ap.add_argument("--khong-ghi", action="store_true", help="không ghi tệp báo cáo")
    args = ap.parse_args(argv)

    now = gio_vn()
    phien = trang_thai_phien(now)
    if args.gio:
        print(f"Bây giờ: {now:%H:%M %d/%m/%Y} (giờ Việt Nam) – {phien.ten} [{phien.sao_txt}]")
        print(f"→ {phien.loi_khuyen}\n")
        print("Lịch chạy khuyến nghị:")
        for thoi_diem, muc, lenh, vi_sao in LICH_CHAY:
            print(f"  {muc} {thoi_diem}: {lenh}\n        {vi_sao}")
        return 0

    cfg = CauHinh()
    if args.gtgd is not None:
        cfg.gtgd_min = args.gtgd
    if args.gia is not None:
        cfg.gia_min = args.gia

    if args.csv_dir:
        nguon = [NguonCSV(args.csv_dir)]
    else:
        ten = [x.strip().upper() for x in args.nguon.split(",") if x.strip()]
        sai = [x for x in ten if x not in NGUON]
        if sai:
            ap.error(f"nguồn không hợp lệ: {', '.join(sai)} (chọn trong {', '.join(NGUON)})")
        nguon = [NGUON[x]() for x in ten]
    kho = KhoDuLieu(nguon, THU_MUC_CACHE, dung_cache=not args.khong_cache and not args.csv_dir,
                    so_luong=args.luong, log=lambda s: print(s, flush=True))

    if args.kiem_tra:
        print("Kiểm tra nguồn dữ liệu…")
        kq = kho.kiem_tra()
        print(baocao.bang_text([("Nguồn", lambda r: r[0]), ("Mã", lambda r: r[1]),
                                ("Kết quả", lambda r: "OK" if r[2] else "LỖI"), ("Chi tiết", lambda r: r[3])], kq))
        if not any(r[2] for r in kq):
            print("\nKhông nguồn nào hoạt động. Nếu chạy trong môi trường có tường lửa (ví dụ Claude Code trên web), "
                  "hãy cho phép các tên miền:\n  " + "\n  ".join(TEN_MIEN))
            return 2
        return 0

    den_ngay = args.ngay
    trong_phien = phien.trong_phien and not den_ngay
    danh_muc = doc_danh_muc(args.danh_muc) if args.danh_muc else []
    san_da_biet = doc_san_da_biet()

    # ---- nhật ký gợi ý (chạy lại quá khứ thì không đụng tới nhật ký thật) ----
    tep_nk = args.nhat_ky or TEP_NHAT_KY
    dung_nk = not args.khong_nhat_ky and not den_ngay and (not args.csv_dir or bool(args.nhat_ky))
    if args.hieu_qua and not dung_nk:
        ap.error("--hieu-qua cần nhật ký gợi ý (bỏ --khong-nhat-ky / --ngay; chạy CSV thì thêm --nhat-ky TỆP)")
    nk = nhatky.rong()
    if dung_nk:
        if not args.khong_dong_bo and not args.csv_dir:
            them = nhatky.dong_bo_git(tep_nk, log=lambda s: print(s, flush=True))
            if them > 0:
                print(f"  Đã gộp {them} gợi ý từ các lần lọc trước (nhánh git khác)", flush=True)
        nk = nhatky.tai(tep_nk)
    ma_nk_mo = [g["ma"] for g in nk["goi_y"] if g.get("trang_thai") != "DA_DONG"]

    # ---- vũ trụ cổ phiếu ----
    ma_chi_tiet = [m.upper() for m in args.ma] if args.ma else []
    if args.hieu_qua:
        ds = sorted(set(ma_nk_mo))
        che_do = f"nhật ký gợi ý ({len(nk['goi_y'])} gợi ý, {len(ds)} mã đang theo dõi lời/lỗ)"
    elif args.ma:
        ds = list(ma_chi_tiet)
        che_do = "chi tiết"
    elif args.theo_doi:
        td = None
        if os.path.exists(TEP_THEO_DOI):
            with open(TEP_THEO_DOI, encoding="utf-8") as f:
                td = json.load(f)
        if not td or (nk.get("theo_doi") and nk["theo_doi"].get("ngay_du_lieu", "") > td.get("ngay_du_lieu", "")):
            td = nk.get("theo_doi") or td   # danh sách lưu trong nhật ký (có cả khi mở cuộc trò chuyện mới)
        if not td:
            print("Chưa có danh sách theo dõi. Hãy chạy quét đầy đủ trước (tốt nhất sau 15:30 hoặc buổi tối).")
            return 1
        ds = [x["ma"] for x in td["ma"]]
        san_da_biet.update({x["ma"]: x.get("san", "") for x in td["ma"]})
        che_do = f"theo dõi ({len(ds)} mã từ lần quét {td.get('thoi_diem', '?')})"
    elif args.csv_dir:
        ds = sorted(os.path.splitext(os.path.basename(p))[0].upper() for p in glob.glob(os.path.join(args.csv_dir, "*.csv")))
        ds = [m for m in ds if m != "VNINDEX"]
        che_do = "toàn bộ thư mục CSV"
    else:
        print("Lấy danh sách cổ phiếu…", flush=True)
        dsm = kho.danh_sach_ma([s.strip() for s in args.san.split(",")])
        ds = list(dsm["ma"])
        san_da_biet.update(dict(zip(dsm["ma"], dsm["san"])))
        che_do = "toàn thị trường"
    for ma in [d["ma"] for d in danh_muc] + ma_nk_mo:
        if ma not in ds:
            ds.append(ma)

    if den_ngay:
        phien = TrangThaiPhien("lich_su", f"Chạy lại quá khứ – cuối phiên {den_ngay}", False, 3, "")
    print(f"Chế độ: {che_do} · {len(ds)} mã · {phien.ten}", flush=True)
    bat_dau = time.time()

    # ---- tải dữ liệu ----
    tk = doc_thanh_khoan(THU_MUC_CACHE) if not args.csv_dir else {}
    giu_nguyen = set(ds) if args.ma or args.theo_doi or args.hieu_qua else {d["ma"] for d in danh_muc} | set(ma_nk_mo)

    def bo_qua(ma):
        thong_tin = tk.get(ma)
        if not thong_tin or ma in giu_nguyen or den_ngay:
            return False
        p = kho._tep(ma)
        moi = os.path.exists(p) and time.time() - os.path.getmtime(p) < 7 * 86400
        return moi and thong_tin.get("gtgd20", 99) < 0.3 * cfg.gtgd_min

    vnindex = kho.tai("VNINDEX", la_chi_so=True, bat_buoc_moi=trong_phien, den_ngay=den_ngay)
    vnindex = cat_den_ngay(vnindex, den_ngay) if vnindex is not None and not vnindex.empty else None
    du_lieu = kho.tai_nhieu(ds, bat_buoc_moi=trong_phien, den_ngay=den_ngay, bo_qua=bo_qua)
    if not du_lieu and not (args.hieu_qua and not ds):
        print("\nKhông tải được dữ liệu nào.")
        for ma in ds[:3]:
            if ma in kho.loi_gan_nhat:
                print(f"  {ma}: {kho.loi_gan_nhat[ma]}")
        print("Chạy `python loc_co_phieu.py --kiem-tra` để xem nguồn nào lỗi. Nếu đang dùng Claude Code trên web, "
              "hãy cho phép các tên miền: " + ", ".join(TEN_MIEN))
        return 2
    che_do_day_du = not args.ma and not args.theo_doi and not args.hieu_qua
    if not args.csv_dir and che_do_day_du and not den_ngay:
        ghi_thanh_khoan(THU_MUC_CACHE, du_lieu)

    # ---- phân tích ----
    ket_qua = []
    ngay_du_lieu = ""
    for ma, df in du_lieu.items():
        df = cat_den_ngay(df, den_ngay)
        if df is None or df.empty or (args.hieu_qua and ma not in ma_nk_mo):
            continue
        san = san_da_biet.get(ma, "")
        dang_do = trong_phien and la_ngay_hom_nay(df, now)
        k = phan_tich_ma(ma, df, cfg, san=san, nen_chua_xong=dang_do,
                         ty_le_kl=ty_le_kl_da_khop(now, san or "HOSE"), vnindex=vnindex, von_trieu=args.von,
                         chi_tiet=ma in ma_chi_tiet, kem_lich_su=che_do_day_du)
        if k is None:
            if args.ma:
                print(f"  {ma}: chưa đủ {cfg.so_phien_min} phiên dữ liệu để phân tích")
            continue
        ngay_du_lieu = max(ngay_du_lieu, k["ngay"])
        ket_qua.append(k)
    gan_xep_hang_rs(ket_qua)
    so_du_phong = sum(1 for k in ket_qua if k["du_phong_kl"])

    canh_bao_phien = ""
    if den_ngay:
        canh_bao_phien = f"Chạy lại quá khứ: phân tích như thể đang ở cuối phiên {den_ngay}."
    elif trong_phien and so_du_phong:
        canh_bao_phien = (f"Đang trong phiên ({phien.ten}): nến hôm nay chưa hoàn chỉnh, khối lượng được dự phóng cả "
                          "ngày theo giờ. Tín hiệu chỉ là tạm thời – xác nhận lại sau 15:30.")
        if phien.sao == 0:
            canh_bao_phien += " Đầu phiên dự phóng rất sai lệch – không nên ra quyết định lúc này."
    elif trong_phien:
        canh_bao_phien = (f"Đang trong phiên nhưng nguồn dữ liệu chưa có nến hôm nay – kết quả là của phiên "
                          f"{baocao.ngay_vn(ngay_du_lieu)}.")
    elif phien.ma == "cho_chot":
        canh_bao_phien = "Vừa đóng cửa: một số nguồn có thể chưa chốt dữ liệu cuối ngày – nên chạy lại sau 15:30."

    dm = []
    for d in danh_muc:
        df = cat_den_ngay(du_lieu.get(d["ma"]), den_ngay)
        if df is None or df.empty:
            print(f"  ! Không có dữ liệu cho {d['ma']} trong danh mục")
            continue
        dang_do = trong_phien and la_ngay_hom_nay(df, now)
        r = danh_gia_nam_giu(d["ma"], df, d["gia_mua"], cfg, so_luong=d["so_luong"], ngay_mua=d["ngay_mua"],
                             nen_chua_xong=dang_do,
                             ty_le_kl=ty_le_kl_da_khop(now, san_da_biet.get(d["ma"], "HOSE") or "HOSE"))
        if r:
            dm.append(r)

    tt = boi_canh_thi_truong(vnindex)

    # ---- nhật ký gợi ý: ghi gợi ý MUA mới (chỉ từ nến đã hoàn chỉnh) rồi đánh giá lại các gợi ý chưa đóng ----
    goi_y_moi, kiem_dinh = [], None
    if che_do_day_du and ket_qua:
        kiem_dinh = kiem_dinh_tong_hop(ket_qua)
    if dung_nk:
        if not args.hieu_qua:
            goi_y_moi = nhatky.ghi_goi_y_moi(nk, ket_qua, tt, vnindex, cfg)
        def bo_nen_do(df):  # bỏ nến hôm nay nếu đang giao dịch dở
            return df.iloc[:-1] if df is not None and trong_phien and la_ngay_hom_nay(df, now) else df
        nhatky.cap_nhat(nk, {m: bo_nen_do(d) for m, d in du_lieu.items()}, bo_nen_do(vnindex), cfg)
        if kiem_dinh and kiem_dinh["thong_ke"]["tong"]:
            nk["kiem_dinh"] = kiem_dinh
        if che_do_day_du and not trong_phien:
            nk["theo_doi"] = {"thoi_diem": now.strftime("%H:%M %d/%m/%Y"), "ngay_du_lieu": ngay_du_lieu,
                              "ma": [{"ma": k["ma"], "san": k["san"], "pivot": round(k["pivot"], 3)}
                                     for k in sorted((k for k in ket_qua if k["trang_thai"] in
                                                      ("MUA", "MUA_GAN", "CHO", "XA")), key=lambda k: -k["diem"])
                                     [:max(args.top, 40)]]}
        nhatky.luu_neu_doi(tep_nk, nk)
        if goi_y_moi:
            print(f"  Nhật ký: ghi thêm {len(goi_y_moi)} gợi ý mua mới – {', '.join(g['ma'] for g in goi_y_moi)}")
    tk_nk = nhatky.thong_ke(nk["goi_y"])
    tk_kd = (kiem_dinh or nk.get("kiem_dinh") or {}).get("thong_ke")

    hien_thi = [] if args.hieu_qua else (ket_qua if not args.ma else [k for k in ket_qua if k["ma"] in ma_chi_tiet])
    nhom = baocao.gom_nhom(hien_thi, top=args.top)
    bc = {
        "thoi_diem": now.strftime("%H:%M %d/%m/%Y"), "phien": phien, "ngay_du_lieu": ngay_du_lieu,
        "so_ma": len(ket_qua), "nguon": ", ".join(f"{k}:{v}" for k, v in kho.dem_nguon.items()) or "cache",
        "canh_bao_phien": canh_bao_phien, "thi_truong": tt, "nhom": nhom, "co_von": bool(args.von),
        "du_phong": so_du_phong > 0,
        "danh_muc": dm, "tat_ca": ket_qua,
        "chi_tiet": sorted([k for k in ket_qua if k["ma"] in ma_chi_tiet], key=lambda k: ma_chi_tiet.index(k["ma"]))
        if args.ma else [],
        "kiem_dinh_chi_tiet": bool(args.kiem_dinh),
        "nhat_ky": {
            "bat": dung_nk, "goi_y": nk["goi_y"], "thong_ke": tk_nk, "tin_cay": nhatky.danh_gia_tin_cay(tk_nk),
            "moi": [g["id"] for g in goi_y_moi], "tep": tep_nk,
            "kiem_dinh": kiem_dinh or nk.get("kiem_dinh"),
            "tin_cay_kiem_dinh": nhatky.danh_gia_tin_cay(tk_kd, kiem_dinh=True) if tk_kd else None,
        },
        "chi_nhat_ky": bool(args.hieu_qua),
    }
    if not args.khong_ghi:
        ten = "loc-" + (den_ngay.replace("-", "") + "-lich-su" if den_ngay else now.strftime("%Y%m%d-%H%M"))
        if args.ma:
            ten += "-" + "-".join(ds[:5])
        elif args.hieu_qua:
            ten += "-hieu-qua"
        bc["tep"] = baocao.ghi_tat_ca(bc, args.ket_qua, ten)
    print()
    print(baocao.in_man_hinh(bc))
    print(f"\n(Hoàn tất trong {time.time() - bat_dau:.0f} giây)")

    # ---- lưu danh sách theo dõi cho lần chạy --theo-doi ----
    if che_do_day_du and not den_ngay and not trong_phien:
        theo_doi = [k for k in ket_qua if k["trang_thai"] in ("MUA", "MUA_GAN", "CHO", "XA")]
        theo_doi.sort(key=lambda k: -k["diem"])
        os.makedirs(THU_MUC_CACHE, exist_ok=True)
        with open(TEP_THEO_DOI, "w", encoding="utf-8") as f:
            json.dump({"thoi_diem": bc["thoi_diem"], "ngay_du_lieu": ngay_du_lieu,
                       "ma": [{"ma": k["ma"], "san": k["san"], "pivot": round(k["pivot"], 3),
                               "trang_thai": k["trang_thai"]} for k in theo_doi[:max(args.top, 40)]]},
                      f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
