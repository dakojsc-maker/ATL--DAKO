"""Kiểm thử đọc dữ liệu các nguồn (JSON giả lập theo định dạng đã xác minh), bộ nhớ đệm, giờ phiên."""
import datetime as dt
import os
import sys
import tempfile
import unittest

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from locphieu.dulieu import KhoDuLieu, Nguon, chuan_hoa, danh_sach_du_phong, doc_json_ohlc  # noqa: E402
from locphieu.thoigian import VN_TZ, trang_thai_phien, ty_le_kl_da_khop  # noqa: E402
from tests.du_lieu_mau import du_lieu  # noqa: E402

import loc_co_phieu  # noqa: E402


def epoch_vn(y, m, d, gio=0):
    return int(dt.datetime(y, m, d, gio, tzinfo=VN_TZ).timestamp())


class TestDocJson(unittest.TestCase):
    def test_vci(self):
        # VCI: danh sách theo mã, mảng song song, t = epoch giây (chuỗi), giá theo đồng
        raw = [{"symbol": "DRI", "t": [str(epoch_vn(2026, 9, 21)), str(epoch_vn(2026, 9, 22))],
                "o": [13800, 14060], "h": [14100, 14360], "l": [13750, 14020], "c": [14060, 14320],
                "v": [1540000, 1540000]}]
        df = chuan_hoa(doc_json_ohlc(raw, "DRI"), "vnd")
        self.assertEqual(list(df.index.strftime("%Y-%m-%d")), ["2026-09-21", "2026-09-22"])
        self.assertAlmostEqual(df["close"].iat[-1], 14.32)
        self.assertEqual(df["volume"].iat[-1], 1540000)

    def test_epoch_0h_utc_van_dung_ngay(self):
        t = int(dt.datetime(2026, 9, 22, tzinfo=dt.timezone.utc).timestamp())
        df = chuan_hoa(doc_json_ohlc({"t": [t], "o": [14.0], "h": [14.4], "l": [13.9], "c": [14.3], "v": [1]}))
        self.assertEqual(df.index[0], pd.Timestamp("2026-09-22"))

    def test_kbs(self):
        raw = {"data_day": [{"t": "2026-09-22 00:00", "o": 47500, "h": 50050, "l": 47300, "c": 49900,
                             "v": 3100000}]}
        df = chuan_hoa(doc_json_ohlc(raw, "MSR"), "vnd")
        self.assertAlmostEqual(df["close"].iat[0], 49.9)
        self.assertEqual(df.index[0], pd.Timestamp("2026-09-22"))

    def test_udf_va_tu_nhan_don_vi(self):
        t = [epoch_vn(2026, 10, 9)]
        nghin = chuan_hoa(doc_json_ohlc({"s": "ok", "t": t, "o": [16.2], "h": [17.2], "l": [15.8], "c": [16.9],
                                         "v": [2340000]}), "auto")
        dong = chuan_hoa(doc_json_ohlc({"t": t, "o": [16200], "h": [17200], "l": [15800], "c": [16900],
                                        "v": [2340000]}), "auto")
        self.assertAlmostEqual(nghin["close"].iat[0], 16.9)
        self.assertAlmostEqual(dong["close"].iat[0], 16.9)

    def test_chi_so_khong_chia(self):
        df = chuan_hoa(doc_json_ohlc({"t": [epoch_vn(2026, 10, 9)], "o": [1810.0], "h": [1825.0], "l": [1805.0],
                                      "c": [1822.18], "v": [7e8]}), "vnd", la_chi_so=True)
        self.assertAlmostEqual(df["close"].iat[0], 1822.18)

    def test_khong_co_du_lieu(self):
        self.assertTrue(chuan_hoa(doc_json_ohlc({"s": "no_data"})).empty)


class NguonGia(Nguon):
    """Nguồn giả: trả `so_phien` phiên cuối của dữ liệu mô phỏng, đếm số lần gọi."""
    ten = "GIA"

    def __init__(self, df):
        self.df, self.goi = df, []

    def lay(self, ma, so_phien, la_chi_so=False):
        self.goi.append(so_phien)
        return self.df.tail(so_phien)


class TestKhoDuLieu(unittest.TestCase):
    def test_cache_cap_nhat_va_dieu_chinh_gia(self):
        df = du_lieu("DRI")
        with tempfile.TemporaryDirectory() as tmp:
            nguon = NguonGia(df.iloc[:-5])
            kho = KhoDuLieu([nguon], tmp, log=lambda s: None)
            a = kho.tai("DRI")
            self.assertEqual(nguon.goi, [KhoDuLieu.SO_PHIEN_DAY_DU])
            nguon.df = df                                    # có thêm 5 phiên mới
            b = kho.tai("DRI", bat_buoc_moi=True)
            self.assertEqual(nguon.goi[-1], KhoDuLieu.SO_PHIEN_CAP_NHAT)
            self.assertEqual(len(b), len(a) + 5)
            nguon.df = df.assign(close=df["close"] * 0.9)    # giá lịch sử bị điều chỉnh (chia cổ tức)
            kho.tai("DRI", bat_buoc_moi=True)
            self.assertEqual(nguon.goi[-1], KhoDuLieu.SO_PHIEN_DAY_DU)

    def test_danh_sach_du_phong(self):
        ds = danh_sach_du_phong()
        self.assertEqual(ds.set_index("ma").loc["MSR", "san"], "UPCOM")
        self.assertIn("DRI", set(ds["ma"]))


class TestThoiGian(unittest.TestCase):
    def test_ty_le_kl(self):
        self.assertAlmostEqual(ty_le_kl_da_khop(dt.datetime(2026, 10, 12, 14, 0), "HOSE"), 0.72)
        self.assertEqual(ty_le_kl_da_khop(dt.datetime(2026, 10, 12, 15, 10), "UPCOM"), 1.0)
        self.assertEqual(ty_le_kl_da_khop(dt.datetime(2026, 10, 10, 10, 0)), 1.0)  # thứ Bảy

    def test_trang_thai_phien(self):
        self.assertEqual(trang_thai_phien(dt.datetime(2026, 10, 12, 20, 0)).sao, 3)
        self.assertEqual(trang_thai_phien(dt.datetime(2026, 10, 12, 9, 20)).sao, 0)
        self.assertEqual(trang_thai_phien(dt.datetime(2026, 10, 12, 14, 10)).ma, "khung_vang")
        self.assertEqual(trang_thai_phien(dt.datetime(2026, 10, 11, 10, 0)).ma, "cuoi_tuan")


class TestDanhMuc(unittest.TestCase):
    def test_doc_danh_muc(self):
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write("# ghi chú\nDRI 14.3 2000 2026-09-22\nmsr,49900,500\n\nVCB 61.5 # mua thăm dò\n")
        try:
            ds = loc_co_phieu.doc_danh_muc(f.name)
        finally:
            os.unlink(f.name)
        self.assertEqual([d["ma"] for d in ds], ["DRI", "MSR", "VCB"])
        self.assertAlmostEqual(ds[1]["gia_mua"], 49.9)
        self.assertEqual(ds[0]["ngay_mua"], "2026-09-22")
        self.assertEqual(ds[0]["so_luong"], 2000)


if __name__ == "__main__":
    unittest.main()
