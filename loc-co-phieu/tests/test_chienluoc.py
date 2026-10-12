"""Kiểm thử bộ máy chiến lược trên dữ liệu thật của DRI/MSR. Chạy: python -m unittest discover -s tests -t ."""
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
    """Dữ liệu thật: nền 24/8–22/9/2026, đỉnh nền 14,17; breakout 23/9 (đóng cửa 14,50, KL 2,4×)."""

    def test_tich_luy_truoc_breakout(self):
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-09-18"), CFG)
        self.assertEqual(k["trang_thai"], "CHO")
        self.assertAlmostEqual(k["pivot"], 14.17, places=2)
        self.assertIn(k["so_tuan_nen"], (2, 3, 4))
        self.assertLessEqual(k["bien_do_nen"], CFG.nen_bien_do_max)

    def test_phien_mo_cua_vot_khong_day_pivot_len(self):
        # 22/9 mở cửa 14,60 rồi bị bán về 14,00: đỉnh nền vẫn là 14,17
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-09-22"), CFG)
        self.assertEqual(k["trang_thai"], "CHO")
        self.assertAlmostEqual(k["pivot"], 14.17, places=2)

    def test_mua_dung_phien_breakout(self):
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-09-23"), CFG)
        self.assertEqual(k["trang_thai"], "MUA")
        self.assertAlmostEqual(k["gia"], 14.50, places=2)
        self.assertGreaterEqual(k["kl_ratio"], 1.5)
        self.assertAlmostEqual(k["cat_lo"], 14.50 * 0.93, places=2)      # lỗ tối đa 7% từ giá mua
        self.assertAlmostEqual(k["muc_tieu_2"], 16.87, places=1)         # đo "cán cờ"

    def test_dang_chay(self):
        k = phan_tich_ma("DRI", tai_ngay("DRI", "2026-10-09"), CFG)
        self.assertEqual(k["trang_thai"], "CHAY")
        self.assertEqual(k["ngay_breakout"], "2026-09-23")
        self.assertGreaterEqual(k["dung_lo_dong"], 14.50)                # đã dời dừng lỗ về hoà vốn

    def test_kl_thap_khong_phai_diem_mua(self):
        df = tai_ngay("DRI", "2026-09-23").copy()
        df.iloc[-1, df.columns.get_loc("volume")] *= 0.3
        k = phan_tich_ma("DRI", df, CFG)
        self.assertNotIn(k["trang_thai"], ("MUA", "MUA_GAN"))

    def test_breakout_that_bai_thanh_ban(self):
        df = tai_ngay("DRI", "2026-09-23")
        them = pd.DataFrame({"open": [14.40, 14.00], "high": [14.45, 14.05], "low": [14.00, 13.60],
                             "close": [14.05, 13.65], "volume": [1.6e6, 1.8e6]},
                            index=pd.to_datetime(["2026-09-24", "2026-09-25"]))
        k = phan_tich_ma("DRI", pd.concat([df, them]), CFG)
        self.assertEqual(k["trang_thai"], "BAN")


class TestMauMSR(unittest.TestCase):
    """Dữ liệu thật: nền 3/9–18/9/2026, đỉnh nền 49,06; breakout 21/9 (đóng cửa 51,90, +9,7%, KL 2,4×)."""

    def test_tich_luy(self):
        k = phan_tich_ma("MSR", tai_ngay("MSR", "2026-09-18"), CFG)
        self.assertEqual(k["trang_thai"], "CHO")
        self.assertAlmostEqual(k["pivot"], 49.06, places=2)
        self.assertGreaterEqual(k["tang_truoc_nen"], 0.45)               # +58% từ đáy rũ bỏ 31,14

    def test_mua_dung_phien_breakout_va_khong_lap(self):
        k21 = phan_tich_ma("MSR", tai_ngay("MSR", "2026-09-21"), CFG)
        self.assertEqual(k21["trang_thai"], "MUA")                       # +5,8% trên pivot vẫn trong vùng mua
        self.assertGreater(k21["vung_mua"], 51.90)                       # nhờ vùng mua nới theo biến động
        k22 = phan_tich_ma("MSR", tai_ngay("MSR", "2026-09-22"), CFG)
        self.assertNotEqual(k22["trang_thai"], "MUA")
        self.assertEqual(k22["ngay_breakout"], "2026-09-21")
        self.assertFalse(k22.get("chot_mot_phan"))                       # mới mua 1 phiên: chưa khuyên chốt lời

    def test_dang_chay_tang_nong(self):
        k = phan_tich_ma("MSR", tai_ngay("MSR", "2026-10-09"), CFG)
        self.assertEqual(k["trang_thai"], "CHAY")
        self.assertTrue(k["chot_mot_phan"])
        self.assertTrue(any("8 tuần" in g for g in k["ghi_chu"]))
        self.assertGreater(k["dung_lo_dong"], 55)                        # dừng lỗ động bám MA10 khi tăng nóng

    def test_du_phong_kl_trong_phien(self):
        df = tai_ngay("MSR", "2026-09-21").copy()
        df.iloc[-1, df.columns.get_loc("volume")] *= 0.5                 # 11:30 mới khớp ~50% KL cả ngày
        khong = phan_tich_ma("MSR", df, CFG)
        co = phan_tich_ma("MSR", df, CFG, nen_chua_xong=True, ty_le_kl=0.5)
        self.assertNotEqual(khong["trang_thai"], "MUA")
        self.assertEqual(co["trang_thai"], "MUA")
        self.assertTrue(co["du_phong_kl"])

    def test_lich_su_tin_hieu(self):
        ls = lich_su_tin_hieu(du_lieu("MSR"), CFG)
        h = [x for x in ls if x["ngay"] == "2026-09-21"]
        self.assertEqual(len(h), 1)
        self.assertEqual(h[0]["ket_qua"], "Đang mở")                     # chưa vi phạm quy tắc bán nào
        self.assertEqual(h[0]["cham_mt1"], "2026-10-01")                 # chạm mục tiêu 1 (58,87)
        self.assertGreater(h[0]["lai"], 0.25)


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
        giu = danh_gia_nam_giu("DRI", df, 14.50, CFG, ngay_mua="2026-09-23")
        self.assertEqual(giu["hanh_dong"], "NẮM GIỮ")
        lo = danh_gia_nam_giu("DRI", df, 18.50, CFG)
        self.assertEqual(lo["hanh_dong"], "CẮT LỖ")

    def test_boi_canh_thi_truong(self):
        ngay = pd.bdate_range("2026-01-01", periods=120)
        c = np.linspace(1500, 1850, 120)                                 # xu hướng tăng đều
        tang = pd.DataFrame({"open": c, "high": c * 1.005, "low": c * 0.995, "close": c, "volume": 7e8}, index=ngay)
        self.assertEqual(boi_canh_thi_truong(tang)["muc"], 2)
        self.assertIn(boi_canh_thi_truong(vnindex_mau())["muc"], (0, 1, 2))
        ngay = pd.bdate_range("2026-01-01", periods=120)
        c = np.linspace(1900, 1550, 120)                   # xu hướng giảm đều
        vn = pd.DataFrame({"open": c, "high": c * 1.005, "low": c * 0.995, "close": c, "volume": 7e8}, index=ngay)
        self.assertEqual(boi_canh_thi_truong(vn)["muc"], 0)


if __name__ == "__main__":
    unittest.main()
