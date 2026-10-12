"""Kiểm thử bộ máy chiến lược trên dữ liệu mô phỏng DRI/MSR.  Chạy: python -m unittest discover -s tests"""
import os
import sys
import unittest

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from locphieu.cauhinh import CauHinh  # noqa: E402
from locphieu.chienluoc import (boi_canh_thi_truong, danh_gia_nam_giu, lich_su_tin_hieu,  # noqa: E402
                                phan_tich_ma)
from tests.du_lieu_mau import du_lieu, vnindex_mau  # noqa: E402

CFG = CauHinh()


def tai_ngay(ma, ngay):
    df = du_lieu(ma)
    return df[df.index <= pd.Timestamp(ngay)]


class TestMauDRI(unittest.TestCase):
    def test_tich_luy_4_tuan_truoc_breakout(self):
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-09-18"), CFG)
        self.assertEqual(k["trang_thai"], "CHO")
        self.assertAlmostEqual(k["pivot"], 14.10, places=2)
        self.assertEqual(k["so_tuan_nen"], 4)          # "4 tuần tích lũy ở đỉnh"
        self.assertLessEqual(k["bien_do_nen"], 0.10)

    def test_mua_dung_phien_breakout(self):
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-09-22"), CFG)
        self.assertEqual(k["trang_thai"], "MUA")
        self.assertGreaterEqual(k["kl_ratio"], 1.5)
        self.assertLess(k["cat_lo"], k["gia"])
        self.assertAlmostEqual(k["muc_tieu_2"], 14.10 + (14.10 - 11.45), places=2)  # đo "cán cờ"

    def test_dang_chay_sau_3_tuan(self):
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-10-09"), CFG)
        self.assertEqual(k["trang_thai"], "CHAY")
        self.assertEqual(k["ngay_breakout"], "2026-09-22")
        self.assertAlmostEqual(k["lai_tu_pivot"], 16.90 / 14.10 - 1, places=3)
        self.assertGreaterEqual(k["dung_lo_dong"], 14.10)  # đã dời dừng lỗ ít nhất về hoà vốn

    def test_kl_thap_khong_phai_diem_mua(self):
        df = tai_ngay("DRI", "2026-09-22").copy()
        df.iloc[-1, df.columns.get_loc("volume")] *= 0.4
        k = phan_tich_ma("DRI", df, CFG)
        self.assertNotIn(k["trang_thai"], ("MUA", "MUA_GAN"))

    def test_breakout_that_bai_thanh_ban(self):
        df = tai_ngay("DRI", "2026-09-22")
        them = pd.DataFrame({"open": [14.2, 13.9, 13.6], "high": [14.3, 14.0, 13.7], "low": [13.8, 13.5, 13.3],
                             "close": [13.9, 13.6, 13.4], "volume": [1.6e6, 1.8e6, 2.0e6]},
                            index=pd.to_datetime(["2026-09-23", "2026-09-24", "2026-09-25"]))
        k = phan_tich_ma("DRI", pd.concat([df, them]), CFG)
        self.assertEqual(k["trang_thai"], "BAN")


class TestMauMSR(unittest.TestCase):
    def test_tich_luy_3_tuan(self):
        k = phan_tich_ma("MSR", tai_ngay("MSR", "2026-09-18"), CFG)
        self.assertEqual(k["trang_thai"], "CHO")
        self.assertAlmostEqual(k["pivot"], 49.20, places=2)
        self.assertEqual(k["so_tuan_nen"], 3)          # "3 tuần tích lũy vùng đỉnh"
        self.assertGreaterEqual(k["tang_truoc_nen"], 0.45)  # nhịp hồi ~+58% từ đáy rũ bỏ

    def test_mua_mot_lan_khong_lap(self):
        k22 = phan_tich_ma("MSR", tai_ngay("MSR", "2026-09-22"), CFG)
        k23 = phan_tich_ma("MSR", tai_ngay("MSR", "2026-09-23"), CFG)
        self.assertEqual(k22["trang_thai"], "MUA")
        self.assertEqual(k23["trang_thai"], "MUA_GAN")
        self.assertAlmostEqual(k23["pivot"], 49.20, places=2)

    def test_dang_chay_tang_nong(self):
        k = phan_tich_ma("MSR", tai_ngay("MSR", "2026-10-09"), CFG)
        self.assertEqual(k["trang_thai"], "CHAY")
        self.assertTrue(k["chot_mot_phan"])
        self.assertTrue(any("8 tuần" in g for g in k["ghi_chu"]))
        self.assertGreater(k["dung_lo_dong"], 55)  # dừng lỗ động bám MA10 khi tăng nóng

    def test_du_phong_kl_trong_phien(self):
        df = tai_ngay("MSR", "2026-09-22").copy()
        df.iloc[-1, df.columns.get_loc("volume")] *= 0.5     # 11:30 mới khớp ~50% KL cả ngày
        khong = phan_tich_ma("MSR", df, CFG)
        co = phan_tich_ma("MSR", df, CFG, nen_chua_xong=True, ty_le_kl=0.5)
        self.assertNotEqual(khong["trang_thai"], "MUA")
        self.assertEqual(co["trang_thai"], "MUA")
        self.assertTrue(co["du_phong_kl"])

    def test_lich_su_tin_hieu(self):
        ls = lich_su_tin_hieu(du_lieu("MSR"), CFG)
        h = [x for x in ls if x["ngay"] == "2026-09-22"]
        self.assertEqual(len(h), 1)
        self.assertEqual(h[0]["ket_qua"], "Đang mở")          # chưa vi phạm quy tắc bán nào
        self.assertEqual(h[0]["cham_mt1"], "2026-10-01")       # đã chạm mục tiêu 1 (59,04)
        self.assertGreater(h[0]["lai"], 0.3)
        dau_nam = [x for x in ls if x["ngay"] == "2026-01-20"][0]
        self.assertEqual(dau_nam["ket_qua"], "Dừng lỗ động")  # sóng tháng 1–2: chốt theo dừng lỗ động
        self.assertGreater(dau_nam["lai"], 0.2)


class TestKhac(unittest.TestCase):
    def test_xu_huong_giam_khong_bao_mua(self):
        ngay = pd.bdate_range("2025-01-01", periods=300)
        c = np.r_[np.linspace(30, 15, 280), np.full(20, 15.0)]
        df = pd.DataFrame({"open": c, "high": c * 1.01, "low": c * 0.99, "close": c, "volume": 1e6}, index=ngay)
        k = phan_tich_ma("XYZ", df, CFG)
        self.assertEqual(k["trang_thai"], "KHONG")

    def test_thieu_du_lieu(self):
        self.assertIsNone(phan_tich_ma("DRI", du_lieu("DRI").tail(50), CFG))

    def test_danh_muc(self):
        df = tai_ngay("DRI", "2026-10-09")
        giu = danh_gia_nam_giu("DRI", df, 14.30, CFG, ngay_mua="2026-09-22")
        self.assertEqual(giu["hanh_dong"], "NẮM GIỮ")
        lo = danh_gia_nam_giu("DRI", df, 18.50, CFG)
        self.assertEqual(lo["hanh_dong"], "CẮT LỖ")

    def test_boi_canh_thi_truong(self):
        tang = boi_canh_thi_truong(vnindex_mau())
        self.assertIn(tang["muc"], (1, 2))
        ngay = pd.bdate_range("2026-01-01", periods=120)
        c = np.linspace(1900, 1550, 120)                   # xu hướng giảm đều
        vn = pd.DataFrame({"open": c, "high": c * 1.005, "low": c * 0.995, "close": c, "volume": 7e8}, index=ngay)
        self.assertEqual(boi_canh_thi_truong(vn)["muc"], 0)


if __name__ == "__main__":
    unittest.main()
